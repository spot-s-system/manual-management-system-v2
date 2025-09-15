import { CATEGORIES } from "@/app/constants/categories";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "freee人事労務の操作ガイドをカテゴリ別に表示します。",
};

export default function AllCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">カテゴリ一覧</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CATEGORIES).map(([categorySlug, category]) => (
          <Link
            key={categorySlug}
            href={`/category/${categorySlug}`}
            className="block transition-transform hover:scale-105"
          >
            <Card className="h-full hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{category.label}</CardTitle>
                {category.subcategories && category.subcategories.length > 0 && (
                  <CardDescription className="mt-2">
                    <ul className="text-sm space-y-1">
                      {category.subcategories.slice(0, 3).map((sub: string) => (
                        <li key={sub} className="text-muted-foreground">
                          • {sub}
                        </li>
                      ))}
                      {category.subcategories.length > 3 && (
                        <li className="text-muted-foreground italic">
                          他 {category.subcategories.length - 3} 件
                        </li>
                      )}
                    </ul>
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
