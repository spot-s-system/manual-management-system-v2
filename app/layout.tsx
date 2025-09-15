import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manual-management-system.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "freeeクリア - freee人事労務 操作体験ポータル",
    template: "%s | freeeクリア",
  },
  description:
    "わからないが、できるに変わる。freee人事労務の実際の画面で、操作ステップをそのまま体験。導入後によくある「つまずきポイント」を、即座にクリア！",
  keywords: [
    "freee人事労務",
    "操作ガイド",
    "ヘルプ",
    "給与計算",
    "勤怠管理",
    "年末調整",
    "社会保険",
    "労務管理",
  ],
  authors: [{ name: "スポット社労士くん" }],
  creator: "スポット社労士くん",
  publisher: "スポット社労士くん",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "freeeクリア - freee人事労務 操作体験ポータル",
    description:
      "わからないが、できるに変わる。freee人事労務の実際の画面で、操作ステップをそのまま体験。導入後によくある「つまずきポイント」を、即座にクリア！",
    url: siteUrl,
    siteName: "freeeクリア",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/spot-logo.png",
        width: 1200,
        height: 630,
        alt: "freeeクリア - freee人事労務 操作体験ポータル",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "freeeクリア - freee人事労務 操作体験ポータル",
    description: "わからないが、できるに変わる。実際の画面で操作体験",
    images: ["/spot-logo.png"],
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/icon.png?v=2",
    apple: "/apple-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "freeeクリア - freee人事労務 操作体験ポータル powered by スポット社労士くん",
    description:
      "わからないが、できるに変わる。freee人事労務の実際の画面で、操作ステップをそのまま体験。",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ja">
      <head>
        {/* フォントの最適化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script id="website-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
