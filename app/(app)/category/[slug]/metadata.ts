import { getCategoryBySlug } from "@/app/constants/categories";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const category = getCategoryBySlug(decodedSlug);

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";
  const categoryUrl = `${siteUrl}/category/${slug}`;

  const categoryDescriptions: Record<string, string> = {
    "入社（入社手続き）": "入社日以降の手続き、雇用保険、社会保険の資格取得など",
    賞与: "賞与の計算、支給、明細書の作成など",
    有休: "有給休暇の付与、管理、取得申請など",
    退職: "退職手続き、離職票、源泉徴収票の発行など",
    勤怠: "勤怠打刻、勤怠データの管理、集計など",
    その他: "その他の労務管理に関する操作",
  };

  const description = categoryDescriptions[category.name] || `${category.name}に関する操作`;

  return {
    title: `${category.name} マニュアル一覧`,
    description: `freee人事労務の${category.name}に関するマニュアル一覧。${description}`,
    openGraph: {
      title: `${category.name} マニュアル一覧 | freeeクリア`,
      description: `freee人事労務の${category.name}に関するマニュアル一覧。${description}`,
      url: categoryUrl,
      type: "website",
      images: [
        {
          url: "/preview.png",
          width: 1200,
          height: 630,
          alt: `${category.name} マニュアル一覧 | freeeクリア`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} マニュアル一覧`,
      description: `freee人事労務の${category.name}に関するマニュアル一覧`,
      images: ["/preview.png"],
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}
