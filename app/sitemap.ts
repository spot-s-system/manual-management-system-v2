import { CATEGORIES } from "@/app/constants/categories";
import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // 1時間キャッシュ

function getStaticPages(baseUrl: string): MetadataRoute.Sitemap {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/request`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = Object.values(CATEGORIES).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";

  try {
    const supabase = await createClient();

    // マニュアル一覧を取得
    const { data: manuals, error } = await supabase
      .from("manuals")
      .select("id, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching manuals for sitemap:", error);
      // エラー時は静的ページのみ返す
      return getStaticPages(baseUrl);
    }

    // 静的ページとカテゴリページを取得
    const staticAndCategoryPages = getStaticPages(baseUrl);

    // マニュアル詳細ページ
    const manualPages: MetadataRoute.Sitemap = (manuals || []).map((manual) => ({
      url: `${baseUrl}/manual/${manual.id}`,
      lastModified: new Date(manual.updated_at),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticAndCategoryPages, ...manualPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // エラー時は静的ページのみ返す
    return getStaticPages(baseUrl);
  }
}
