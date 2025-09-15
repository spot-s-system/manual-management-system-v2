"use client";

import { CATEGORIES, getSubCategories } from "@/app/constants/categories";
import { SUGGESTED_TAGS } from "@/app/constants/tags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewManualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    main_category: "",
    sub_category: "",
    url: "",
    tags: "",
    is_published: true,
    order_index: 0,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<{ title: string; url: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // freeeのURLからタイトルを抽出
  const extractTitleFromFreeeUrl = (url: string): string | null => {
    const match = url.match(/articles\/\d+-(.+?)(?:\?|#|$)/);
    if (match?.[1]) {
      // URLエンコードされたタイトルをデコード
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
    return null;
  };

  // 参考リンクを追加
  const addReferenceLink = () => {
    const url = newLinkUrl.trim();
    if (!url) return;

    // 既に同じURLが追加されていないかチェック
    if (referenceLinks.some((link) => link.url === url)) {
      setNewLinkUrl("");
      return;
    }

    // freeeのURLかチェック
    if (url.includes("support.freee.co.jp")) {
      const extractedTitle = extractTitleFromFreeeUrl(url);
      const title = extractedTitle || "freee人事労務マニュアル";

      setReferenceLinks([...referenceLinks, { title, url }]);
      setNewLinkUrl("");
    } else {
      // freee以外のURLの場合はそのまま追加
      setReferenceLinks([...referenceLinks, { title: "参考リンク", url }]);
      setNewLinkUrl("");
    }
  };

  // 参考リンクを削除
  const removeReferenceLink = (index: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const insertData = {
        title: formData.title,
        main_category: formData.main_category,
        sub_category: formData.sub_category || null,
        url: formData.url,
        tags: selectedTags.length > 0 ? selectedTags : null,
        reference_links: referenceLinks.length > 0 ? referenceLinks : null,
        is_published: formData.is_published,
        order_index: formData.order_index,
      };

      console.log("Inserting manual with data:", insertData);
      console.log("Reference links:", referenceLinks);

      const { error } = await supabase.from("manuals").insert(insertData);

      if (error) {
        console.error("Failed to create manual:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/admin/manuals");
      router.refresh();
    } catch (err) {
      console.error("Unexpected error creating manual:", err);
      setError("予期しないエラーが発生しました。");
      setLoading(false);
    }
  };

  // メインカテゴリが変更されたときにサブカテゴリをリセット
  const handleMainCategoryChange = (value: string) => {
    setFormData({ ...formData, main_category: value, sub_category: "" });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>新規操作ガイド作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="main_category">メインカテゴリ</Label>
                <select
                  id="main_category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.main_category}
                  onChange={(e) => handleMainCategoryChange(e.target.value)}
                  required
                >
                  <option value="">選択してください</option>
                  {Object.values(CATEGORIES).map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_category">サブカテゴリ（任意）</Label>
                <select
                  id="sub_category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  disabled={!formData.main_category}
                >
                  <option value="">選択してください</option>
                  {formData.main_category &&
                    (() => {
                      const categoryKey = Object.keys(CATEGORIES).find(
                        (key) =>
                          CATEGORIES[key as keyof typeof CATEGORIES].name === formData.main_category
                      ) as keyof typeof CATEGORIES | undefined;
                      return categoryKey
                        ? getSubCategories(categoryKey).map((subCategory) => (
                            <option key={subCategory} value={subCategory}>
                              {subCategory}
                            </option>
                          ))
                        : [];
                    })()}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">マニュアルURL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/manual.pdf"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>タグ</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    選択中: {selectedTags.join(", ")}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">タグをクリックして選択・解除できます</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_published">公開する</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">表示順序</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">小さい数字ほど上に表示されます</p>
            </div>

            <div className="space-y-2">
              <Label>参考リンク（freee人事労務マニュアル）</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://support.freee.co.jp/hc/ja/articles/..."
                  value={newLinkUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setNewLinkUrl(url);

                    // freeeのURLが貼り付けられたら自動的に追加
                    if (url.includes("support.freee.co.jp/hc/ja/articles/") && url.length > 50) {
                      // URLが完全に貼り付けられたと判断
                      setTimeout(() => {
                        addReferenceLink();
                      }, 100);
                    }
                  }}
                  onPaste={(e) => {
                    // ペーストイベントでも処理
                    const pastedText = e.clipboardData.getData("text");
                    if (pastedText.includes("support.freee.co.jp/hc/ja/articles/")) {
                      e.preventDefault();
                      setNewLinkUrl(pastedText);
                      setTimeout(() => {
                        addReferenceLink();
                      }, 100);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addReferenceLink();
                    }
                  }}
                />
                <Button type="button" onClick={addReferenceLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                freeeのURLを貼り付けると自動的にタイトルを抽出して追加します
              </p>

              {referenceLinks.length > 0 && (
                <div className="space-y-2 mt-3">
                  {referenceLinks.map((link, index) => (
                    <div
                      key={`${link.url}-${index}`}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.title}</p>
                        <p className="text-xs text-slate-600 truncate">{link.url}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReferenceLink(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
