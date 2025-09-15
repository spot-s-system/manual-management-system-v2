"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HelpCircle, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeaderWithSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* デスクトップヘッダー */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center justify-between w-full gap-8">
            {/* ロゴ部分 */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/spot-logo.png"
                alt="freeeクリア"
                width={45}
                height={45}
                className="mr-3"
                priority
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900">freeeクリア</h1>
                <p className="text-xs text-slate-600">freee人事労務 操作体験ポータル</p>
              </div>
            </Link>

            {/* 検索フォーム */}
            <div className="flex-1 max-w-md flex gap-2">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="操作ガイドを検索..."
                    className={cn(
                      "w-full pl-10 pr-4",
                      "h-10",
                      "bg-slate-50 border-slate-200",
                      "placeholder:text-slate-500",
                      "focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-200",
                      "transition-all duration-200"
                    )}
                  />
                </div>
              </form>
              <Button
                type="submit"
                onClick={() => {
                  if (searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                  }
                }}
                disabled={!searchQuery.trim()}
                className="h-10"
              >
                検索
              </Button>
            </div>

            {/* Aboutリンク */}
            <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
              <Link href="/about" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>このポータルとは</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* モバイルヘッダー */}
      <div className="lg:hidden">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <Image
              src="/spot-logo.png"
              alt="freeeクリア"
              width={36}
              height={36}
              className="mr-2"
              priority
            />
            <div>
              <h1 className="text-base font-bold text-slate-900">freeeクリア</h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                freee人事労務 操作体験ポータル
              </p>
            </div>
          </Link>

          {/* 右側のアクション */}
          <div className="flex items-center gap-1">
            {/* 検索ボタン */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsMobileMenuOpen(false);
              }}
              aria-label="検索"
              className="h-9 w-9"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* メニューボタン */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchOpen(false);
              }}
              aria-label="メニュー"
              className="h-9 w-9"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* モバイル検索フォーム */}
        {isMobileSearchOpen && (
          <div className="px-4 pb-3 border-t border-slate-200 bg-slate-50">
            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索（例：入社、有休）"
                  className="w-full pl-10 pr-4 h-10 text-sm bg-white"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="px-4 pb-3 border-t border-slate-200 bg-slate-50">
            <Button variant="ghost" size="sm" asChild className="w-full justify-start mt-2">
              <Link
                href="/about"
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                <span>このポータルとは</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
