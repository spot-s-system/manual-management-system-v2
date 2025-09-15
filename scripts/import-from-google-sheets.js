const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Google Sheets設定
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = "A:I"; // A列からI列まで（必要に応じて調整）

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

if (!SPREADSHEET_ID) {
  throw new Error("Missing GOOGLE_SPREADSHEET_ID environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google Sheets認証の設定
async function getGoogleSheetsClient() {
  // 方法1: サービスアカウントを使用（推奨）
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return google.sheets({ version: "v4", auth });
  }

  // 方法2: APIキーを使用（公開されているシートのみ）
  if (process.env.GOOGLE_API_KEY) {
    return google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_API_KEY,
    });
  }

  throw new Error("No Google authentication method configured");
}

// データの正規化
function normalizeData(row) {
  const [
    targetAudience,
    contractPlans,
    mainCategory,
    subCategory,
    stepName,
    title,
    url,
    orderIndex,
    stepNumber,
  ] = row;

  // 契約プランの処理
  const planArray = contractPlans ? contractPlans.split(",").map((plan) => plan.trim()) : [];

  // タグの作成（対象者 + 契約プラン）
  const tags = [];
  if (targetAudience) {
    tags.push(targetAudience.trim());
  }
  tags.push(...planArray);

  return {
    title: title || stepName || "",
    step_name: stepName || null,
    url: url || "",
    main_category: mainCategory || "",
    sub_category: subCategory || null,
    tags: tags,
    order_index: Number.parseInt(orderIndex) || 0,
    step_number: stepNumber ? Number.parseInt(stepNumber) : null,
    is_published: true,
  };
}

async function importFromGoogleSheets() {
  try {
    console.log("Google Sheetsからデータを取得中...");

    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log("データが見つかりませんでした。");
      return;
    }

    // ヘッダー行をスキップ
    const dataRows = rows.slice(1);
    console.log(`${dataRows.length}件のデータを処理します。`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const row of dataRows) {
      // 空行をスキップ
      if (!row || row.length === 0 || !row[6]) {
        // URLがない行はスキップ
        continue;
      }

      const manual = normalizeData(row);

      try {
        // 既存のマニュアルをチェック
        const { data: existing, error: checkError } = await supabase
          .from("manuals")
          .select("id")
          .eq("url", manual.url)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error(`エラー (チェック): ${manual.title}`, checkError);
          errorCount++;
          continue;
        }

        if (existing) {
          console.log(`既存: ${manual.title}`);
          skipCount++;
          continue;
        }

        // 新規登録
        const { error } = await supabase.from("manuals").insert(manual).select().single();

        if (error) {
          console.error(`エラー (登録): ${manual.title}`, error);
          errorCount++;
        } else {
          console.log(`成功: ${manual.title}`);
          successCount++;
        }
      } catch (error) {
        console.error(`予期しないエラー: ${manual.title}`, error);
        errorCount++;
      }
    }

    console.log("\n=== インポート完了 ===");
    console.log(`成功: ${successCount}件`);
    console.log(`スキップ: ${skipCount}件`);
    console.log(`エラー: ${errorCount}件`);
  } catch (error) {
    console.error("インポート中にエラーが発生しました:", error);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

// 使用方法の表示
if (!SPREADSHEET_ID) {
  console.log(`
=== Google Sheetsインポートツール ===

使用方法:
1. .env.localファイルに以下を追加してください:
   GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
   
   以下のいずれか:
   - GOOGLE_API_KEY=your-api-key (公開シートの場合)
   - GOOGLE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...} (非公開シートの場合)

2. スプレッドシートの形式:
   A列: 対象者（例: 管理者向け）
   B列: 契約プラン（カンマ区切り。例: スタンダード, アドバンス）
   C列: メインカテゴリ
   D列: サブカテゴリ
   E列: ステップ名
   F列: タイトル
   G列: URL
   H列: 表示順
   I列: ステップ番号

3. 実行:
   node scripts/import-from-google-sheets.js
`);
  process.exit(1);
}

importFromGoogleSheets().catch(console.error);
