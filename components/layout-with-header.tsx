import { HeaderWithSearch } from "@/components/header-with-search";

export function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithSearch />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
