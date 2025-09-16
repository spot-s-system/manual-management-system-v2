"use client";

import Image from "next/image";
import Link from "next/link";

export function HeaderWithSearch() {
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
        </div>
      </div>
    </header>
  );
}
