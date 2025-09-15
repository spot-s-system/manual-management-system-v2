import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modern JavaScript配信の最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 実験的機能の有効化
  experimental: {
    // optimizeCss: true, // ビルドエラーを回避するため無効化
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },

  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Turbopackの設定（開発時のパフォーマンス向上）
  turbopack: {},

  // TypeScriptの型チェック設定
  typescript: {
    // ビルド時の型エラーを無視しない
    ignoreBuildErrors: false,
  },

  // 本番環境でのソースマップ生成を無効化（セキュリティ向上）
  productionBrowserSourceMaps: false,

  // React Strict Modeを有効化
  reactStrictMode: true,

  // ページ拡張子の設定
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // パフォーマンス最適化
  poweredByHeader: false,
  compress: true,

  // Bundle分析
  webpack: (config, { isServer }) => {
    // クライアントサイドのバンドル最適化
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module: { size: () => number; identifier: () => string }) {
              return module.size() > 160000 && /node_modules[\\/]/.test(module.identifier());
            },
            name(module: { identifier: () => string }) {
              const hash = require("node:crypto").createHash("sha1");
              hash.update(module.identifier());
              return hash.digest("hex").substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(_module: { identifier: () => string }, _chunks: unknown) {
              return "shared";
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
