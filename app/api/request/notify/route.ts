import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 緊急度の日本語変換
    const urgencyMap = {
      low: "低",
      medium: "中",
      high: "高",
    };

    // メール本文の作成
    const emailBody = `
新しいマニュアルリクエストが届きました。

【リクエスト情報】
リクエスト者: ${data.requester_name}
メールアドレス: ${data.requester_email}
部署: ${data.department || "未記入"}
緊急度: ${urgencyMap[data.urgency as keyof typeof urgencyMap]}

【リクエスト内容】
タイトル: ${data.manual_title}
説明: ${data.manual_description}

【詳細情報】
使用目的: ${data.use_case || "未記入"}
想定利用者: ${data.expected_users || "未記入"}
備考: ${data.additional_notes || "未記入"}

管理画面でリクエストの詳細を確認し、対応を行ってください。
    `.trim();

    // 実際のメール送信実装
    // ここでは環境変数から管理者メールアドレスを取得することを想定
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    // 本番環境では実際のメール送信サービス（SendGrid、AWS SES等）を使用
    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === "production") {
    } else {
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
