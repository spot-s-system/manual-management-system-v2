"use client";

import { CATEGORIES } from "@/app/constants/categories";
import { SUGGESTED_TAGS } from "@/app/constants/tags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Manual = Database["public"]["Tables"]["manuals"]["Row"];

export default function AdminManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [filteredManuals, setFilteredManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("order_index");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  const fetchManuals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("manuals")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setManuals(data || []);
    } catch (err) {
      console.error("Failed to fetch manuals:", err);
      setError(err instanceof Error ? err.message : "マニュアルの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...manuals];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (manual) =>
          manual.title.toLowerCase().includes(query) ||
          manual.main_category?.toLowerCase().includes(query) ||
          manual.sub_category?.toLowerCase().includes(query) ||
          manual.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // カテゴリフィルター
    if (selectedCategory) {
      filtered = filtered.filter((manual) => manual.main_category === selectedCategory);
    }

    // サブカテゴリフィルター
    if (selectedSubCategory) {
      filtered = filtered.filter((manual) => manual.sub_category === selectedSubCategory);
    }

    // タグフィルター
    if (selectedTag) {
      filtered = filtered.filter((manual) => manual.tags?.includes(selectedTag));
    }

    // 公開状態フィルター
    if (selectedStatus) {
      const isPublished = selectedStatus === "published";
      filtered = filtered.filter((manual) => manual.is_published === isPublished);
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "order_index":
          return (a.order_index || 0) - (b.order_index || 0);
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "updated_at":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "title":
          return a.title.localeCompare(b.title, "ja");
        default:
          return 0;
      }
    });

    setFilteredManuals(filtered);
  }, [
    manuals,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    selectedTag,
    selectedStatus,
    sortBy,
  ]);

  useEffect(() => {
    fetchManuals();
  }, [fetchManuals]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedTag("");
    setSelectedStatus("");
    setSortBy("order_index");
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("manuals").delete().eq("id", id);
      if (error) throw error;

      // 削除成功後、リストを更新
      setManuals(manuals.filter((m) => m.id !== id));
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Failed to delete manual:", err);
      alert("マニュアルの削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // サブカテゴリの選択肢を取得
  const getSubCategoryOptions = () => {
    if (!selectedCategory) return [];
    const category = Object.values(CATEGORIES).find((cat) => cat.name === selectedCategory);
    return category ? category.subcategories : [];
  };

  // カテゴリ変更時にサブカテゴリをリセット
  useEffect(() => {
    if (selectedCategory !== "") {
      setSelectedSubCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">操作ガイド管理</h1>
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">操作ガイド管理</h1>
          <Link href="/admin/manuals/new">
            <Button>新規作成</Button>
          </Link>
        </div>
        <ErrorMessage title="操作ガイドの取得に失敗しました" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">操作ガイド管理</h1>
        <Link href="/admin/manuals/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {/* フィルター・検索セクション */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター・検索</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="タイトル、カテゴリ、タグで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">すべて</option>
                {Object.values(CATEGORIES).map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">サブカテゴリ</Label>
              <select
                id="subcategory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">すべて</option>
                {getSubCategoryOptions().map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">タグ</Label>
              <select
                id="tag"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">すべて</option>
                {SUGGESTED_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">公開状態</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">すべて</option>
                <option value="published">公開中</option>
                <option value="unpublished">非公開</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label htmlFor="sort">並び順:</Label>
              <select
                id="sort"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="order_index">表示順</option>
                <option value="created_at">作成日（新しい順）</option>
                <option value="updated_at">更新日（新しい順）</option>
                <option value="title">タイトル（五十音順）</option>
              </select>
            </div>

            <Button variant="ghost" onClick={clearFilters}>
              フィルターをクリア
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredManuals.length} 件のマニュアルが見つかりました
          </p>
        </CardContent>
      </Card>

      {/* 削除確認ダイアログ */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>削除の確認</CardTitle>
              <CardDescription>
                このマニュアルを削除してもよろしいですか？この操作は取り消せません。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTargetId(null)} disabled={isDeleting}>
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isDeleting}
              >
                {isDeleting ? "削除中..." : "削除"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* マニュアル一覧 */}
      <div className="grid gap-4">
        {filteredManuals.map((manual) => (
          <Card key={manual.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">#{manual.order_index}</span>
                    {manual.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    カテゴリ:{" "}
                    {manual.sub_category ? (
                      <>
                        {manual.main_category} &gt; {manual.sub_category}
                      </>
                    ) : (
                      manual.main_category
                    )}{" "}
                    | 更新日: {new Date(manual.updated_at).toLocaleDateString("ja-JP")} |
                    ステータス: {manual.is_published ? "公開中" : "非公開"}
                  </CardDescription>
                  {manual.url && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      URL:{" "}
                      <a
                        href={manual.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {manual.url}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/admin/manuals/${manual.id}/edit`}>
                    <Button variant="outline" size="sm">
                      編集
                    </Button>
                  </Link>
                  <Link href={`/manual/${manual.id}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      プレビュー
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTargetId(manual.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            </CardHeader>
            {manual.tags && manual.tags.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {manual.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {filteredManuals.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {manuals.length === 0
                  ? "操作ガイドがまだ登録されていません"
                  : "条件に一致する操作ガイドが見つかりませんでした"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
