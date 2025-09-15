import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const USER_AUTH_COOKIE_NAME = "user_authenticated";
const USER_AUTH_PASSWORD = process.env.USER_AUTH_PASSWORD || "";

export async function verifyUserPassword(password: string): Promise<boolean> {
  if (!USER_AUTH_PASSWORD) {
    console.error("USER_AUTH_PASSWORD not set in environment variables");
    return false;
  }
  return password === USER_AUTH_PASSWORD;
}

export async function setUserAuthenticated() {
  const cookieStore = await cookies();
  cookieStore.set(USER_AUTH_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30日間
    path: "/",
  });
}

export async function isUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(USER_AUTH_COOKIE_NAME);
  return authCookie?.value === "true";
}

export async function clearUserAuthentication() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_AUTH_COOKIE_NAME);
}

export async function requireUserAuth() {
  const authenticated = await isUserAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }
}
