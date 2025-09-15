"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, router]);

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="キーワードで探す..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-10 h-9 text-sm"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
    </form>
  );
}
