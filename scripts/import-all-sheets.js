const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Google Sheets設定
const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID || "12C5dZ4lsbw1gjKZocYjii2QhECrYZSny2Wts2kp_ONc";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google Sheets認証の設定
async function getGoogleSheetsClient() {
  // APIキーを使用（公開されているシートのみ）
  if (process.env.GOOGLE_API_KEY) {
    return google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_API_KEY,
    });
  }

  // サービスアカウントを使用
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return google.sheets({ version: "v4", auth });
  }

  throw new Error(
    "No Google authentication method configured. Please set GOOGLE_API_KEY or GOOGLE_SERVICE_ACCOUNT_KEY"
  );
}

// 全体シートのデータ処理
function processMainSheetRow(row) {
  const [
    targetAudience, // 誰向けか
    contractPlans, // 契約プランによる閲覧制限
    mainCategory, // 大カテゴリ
    subCategory, // 中カテゴリ
    title, // タイトル
    url, // リンク
  ] = row;

  if (!url || !mainCategory) return null;

  // 契約プランの処理
  const planArray = contractPlans ? contractPlans.split(/[,、]/).map((plan) => plan.trim()) : [];

  // タグの作成（対象者 + 契約プラン）
  const tags = [];
  if (targetAudience) {
    tags.push(targetAudience.trim());
  }
  tags.push(...planArray);

  return {
    title: title || subCategory || "",
    url: url.trim(),
    main_category: mainCategory.trim(),
    sub_category: subCategory ? subCategory.trim() : null,
    tags: tags,
    is_published: true,
    order_index: 0, // 後で更新
  };
}

// カテゴリシートのデータ処理（ステップ形式）
function processCategorySheetRow(row, mainCategory) {
  const [
    targetAudience, // 誰向けか
    contractPlans, // 契約プランによる閲覧制限
    subCategory, // 中カテゴリ
    stepName, // ステップ名
    title, // タイトル
    url, // リンク
    stepNumber, // ステップ番号
  ] = row;

  if (!url) return null;

  // 契約プランの処理
  const planArray = contractPlans ? contractPlans.split(/[,、]/).map((plan) => plan.trim()) : [];

  // タグの作成（対象者 + 契約プラン）
  const tags = [];
  if (targetAudience) {
    tags.push(targetAudience.trim());
  }
  tags.push(...planArray);

  return {
    title: title || stepName || "",
    step_name: stepName ? stepName.trim() : null,
    url: url.trim(),
    main_category: mainCategory,
    sub_category: subCategory ? subCategory.trim() : null,
    tags: tags,
    step_number: stepNumber ? Number.parseInt(stepNumber) : null,
    is_published: true,
    order_index: 0, // 後で更新
  };
}

// シート一覧を取得
async function getSheetsList(sheets) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    return response.data.sheets.map((sheet) => ({
      name: sheet.properties.title,
      id: sheet.properties.sheetId,
    }));
  } catch (error) {
    console.error("シート一覧の取得に失敗:", error);
    throw error;
  }
}

// シートのデータを取得
async function getSheetData(sheets, sheetName, range = "A:Z") {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!${range}`,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`シート "${sheetName}" のデータ取得に失敗:`, error);
    return [];
  }
}

// マニュアルの登録または更新
async function upsertManual(manual) {
  try {
    // URLで既存のマニュアルをチェック
    const { data: existing, error: checkError } = await supabase
      .from("manuals")
      .select("id")
      .eq("url", manual.url)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error(`エラー (チェック): ${manual.title}`, checkError);
      return { status: "error", error: checkError };
    }

    if (existing) {
      // 更新
      const { error: updateError } = await supabase
        .from("manuals")
        .update(manual)
        .eq("id", existing.id);

      if (updateError) {
        console.error(`エラー (更新): ${manual.title}`, updateError);
        return { status: "error", error: updateError };
      }
      return { status: "updated" };
    }
    // 新規登録
    const { error: insertError } = await supabase.from("manuals").insert(manual);

    if (insertError) {
      console.error(`エラー (登録): ${manual.title}`, insertError);
      return { status: "error", error: insertError };
    }
    return { status: "created" };
  } catch (error) {
    console.error(`予期しないエラー: ${manual.title}`, error);
    return { status: "error", error };
  }
}

async function importAllSheets() {
  try {
    console.log("Google Sheetsクライアントを初期化中...");
    const sheets = await getGoogleSheetsClient();

    console.log("シート一覧を取得中...");
    const sheetsList = await getSheetsList(sheets);
    console.log(
      `${sheetsList.length}個のシートが見つかりました:`,
      sheetsList.map((s) => s.name)
    );

    const stats = {
      created: 0,
      updated: 0,
      errors: 0,
      total: 0,
    };

    // 全体シートを処理
    const mainSheet = sheetsList.find((s) => s.name === "全体");
    if (mainSheet) {
      console.log("\n=== 全体シートを処理中 ===");
      const rows = await getSheetData(sheets, mainSheet.name);

      if (rows.length > 1) {
        const dataRows = rows.slice(1); // ヘッダー行をスキップ
        let orderIndex = 1;

        for (const row of dataRows) {
          const manual = processMainSheetRow(row);
          if (manual) {
            manual.order_index = orderIndex++;
            stats.total++;

            const result = await upsertManual(manual);
            if (result.status === "created") {
              console.log(`✅ 新規作成: ${manual.title}`);
              stats.created++;
            } else if (result.status === "updated") {
              console.log(`🔄 更新: ${manual.title}`);
              stats.updated++;
            } else {
              stats.errors++;
            }
          }
        }
      }
    }

    // カテゴリごとのシートを処理（「完了」タグがついているもの）
    const categorySheets = sheetsList.filter(
      (s) => s.name.startsWith("「完了」") && !s.name.includes("全体")
    );

    for (const sheet of categorySheets) {
      // シート名からカテゴリ名を抽出
      const categoryMatch = sheet.name.match(/「完了」(.+)/);
      if (!categoryMatch) continue;

      const mainCategory = categoryMatch[1].trim();
      console.log(`\n=== カテゴリシート "${mainCategory}" を処理中 ===`);

      const rows = await getSheetData(sheets, sheet.name);

      if (rows.length > 1) {
        const dataRows = rows.slice(1); // ヘッダー行をスキップ
        let orderIndex = 1;

        for (const row of dataRows) {
          const manual = processCategorySheetRow(row, mainCategory);
          if (manual) {
            manual.order_index = orderIndex++;
            stats.total++;

            const result = await upsertManual(manual);
            if (result.status === "created") {
              console.log(`✅ 新規作成: ${manual.title}`);
              stats.created++;
            } else if (result.status === "updated") {
              console.log(`🔄 更新: ${manual.title}`);
              stats.updated++;
            } else {
              stats.errors++;
            }
          }
        }
      }
    }

    console.log("\n=== インポート完了 ===");
    console.log(`処理総数: ${stats.total}件`);
    console.log(`新規作成: ${stats.created}件`);
    console.log(`更新: ${stats.updated}件`);
    console.log(`エラー: ${stats.errors}件`);
  } catch (error) {
    console.error("インポート中にエラーが発生しました:", error);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

// 使用方法の表示
console.log(`
=== Google Sheets 全シートインポートツール ===

スプレッドシートID: ${SPREADSHEET_ID}

処理対象:
1. 全体シート - 基本的なマニュアル情報
2. 「完了」タグ付きカテゴリシート - ステップ分けされた詳細情報

注意: Google Sheetsが公開されているか、適切な認証情報が設定されている必要があります。
`);

importAllSheets().catch(console.error);
