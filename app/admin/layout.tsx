import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await isAdmin();

  // ログインページは除外
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-semibold">
              管理画面
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin/requests" className="text-sm hover:underline">
                リクエスト管理
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                サイトを表示
              </Button>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container px-4 py-8">{children}</main>
    </div>
  );
}
