import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 操作ガイド数を取得
  const { count: manualCount } = await supabase
    .from("manuals")
    .select("*", { count: "exact", head: true });

  // カテゴリ数を取得
  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>操作ガイド</CardTitle>
            <CardDescription>登録されている操作ガイド数</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{manualCount || 0}</p>
            <Link href="/admin/manuals">
              <Button variant="link" className="mt-2 p-0">
                操作ガイド管理へ →
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使う操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/manuals/new" className="block">
              <Button className="w-full" variant="outline">
                操作ガイド作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
