import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { PcRecommendationNotice } from "@/components/ui/pc-recommendation-notice";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: manual } = await supabase
      .from("manuals")
      .select("title, description, main_category, sub_category")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (!manual) {
      return {
        title: "マニュアルが見つかりません",
      };
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";
    const manualUrl = `${siteUrl}/manual/${id}`;

    return {
      title: manual.title,
      description:
        manual.description ||
        `${manual.main_category} - ${manual.sub_category || "その他"}のマニュアル`,
      openGraph: {
        title: `${manual.title} | freeeクリア`,
        description:
          manual.description || `freee人事労務の${manual.main_category}に関するマニュアル`,
        url: manualUrl,
        type: "article",
      },
      twitter: {
        card: "summary",
        title: manual.title,
        description: manual.description || "freee人事労務のマニュアル",
      },
      alternates: {
        canonical: manualUrl,
      },
    };
  } catch (error) {
    return {
      title: "マニュアル",
    };
  }
}

export default async function ManualDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: manual, error } = await supabase
      .from("manuals")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error("Failed to fetch manual:", error);
      if (error.code === "PGRST116") {
        notFound();
      }
      return (
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← ホームに戻る
                </Button>
              </Link>
            </div>
          </header>
          <main className="container mx-auto max-w-4xl px-4 py-8">
            <ErrorMessage title="マニュアルの取得に失敗しました" message={error.message} />
          </main>
        </div>
      );
    }

    if (!manual) {
      notFound();
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: manual.main_category,
          item: `${siteUrl}/category/${encodeURIComponent(manual.main_category)}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: manual.title,
          item: `${siteUrl}/manual/${id}`,
        },
      ],
    };

    const howToJsonLd = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: manual.title,
      description: manual.description || `${manual.main_category} - ${manual.sub_category || ""}`,
      step: [
        {
          "@type": "HowToStep",
          name: "マニュアルを開く",
          text: "下記のボタンをクリックしてマニュアルを表示します",
          url: manual.url,
        },
      ],
      tool: {
        "@type": "HowToTool",
        name: "freee人事労務",
      },
      dateModified: manual.updated_at,
      datePublished: manual.created_at,
    };

    return (
      <>
        <Script id="breadcrumb-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(breadcrumbJsonLd)}
        </Script>
        <Script id="howto-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(howToJsonLd)}
        </Script>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← ホームに戻る
                </Button>
              </Link>
            </div>
          </header>

          <main className="container mx-auto max-w-4xl px-4 py-8">
            <article>
              <header className="mb-8">
                <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold">{manual.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span>カテゴリ: {manual.category}</span>
                  <span>最終更新: {new Date(manual.updated_at).toLocaleDateString("ja-JP")}</span>
                </div>
                {manual.tags && manual.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {manual.tags.map((tag: string) => (
                      <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="mt-8 space-y-4">
                <PcRecommendationNotice />

                <Link href={manual.url} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    マニュアルを開く →
                  </Button>
                </Link>
              </div>
            </article>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error("Unexpected error in ManualDetailPage:", error);
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← ホームに戻る
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto max-w-4xl px-4 py-8">
          <ErrorMessage
            title="予期しないエラーが発生しました"
            message="ページの読み込み中にエラーが発生しました。"
          />
        </main>
      </div>
    );
  }
}
