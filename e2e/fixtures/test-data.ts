export const testData = {
  categories: [
    {
      name: "基本操作",
      slug: "basic-operations",
      description: "システムの基本的な操作方法",
    },
    {
      name: "高度な機能",
      slug: "advanced-features",
      description: "高度な機能の使い方",
    },
  ],
  manuals: [
    {
      title: "初めてのユーザーガイド",
      url: "https://example.com/beginner-guide.pdf",
      category: "basic-operations",
      tags: ["初心者向け", "ガイド"],
    },
    {
      title: "管理者マニュアル",
      url: "https://example.com/admin-manual.pdf",
      category: "advanced-features",
      tags: ["管理者", "設定"],
    },
  ],
  adminCredentials: {
    password: process.env.ADMIN_PASSWORD || "test-admin-password",
  },
  searchQueries: {
    valid: "ガイド",
    noResults: "存在しないマニュアル",
  },
};
