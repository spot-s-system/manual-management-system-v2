import { clearUserAuthentication } from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await clearUserAuthentication();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "ログアウト処理中にエラーが発生しました" }, { status: 500 });
  }
}
