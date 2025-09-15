import { setUserAuthenticated, verifyUserPassword } from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "パスワードが入力されていません" }, { status: 400 });
    }

    const isValid = await verifyUserPassword(password);

    if (!isValid) {
      return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 });
    }

    await setUserAuthenticated();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "ログイン処理中にエラーが発生しました" }, { status: 500 });
  }
}
