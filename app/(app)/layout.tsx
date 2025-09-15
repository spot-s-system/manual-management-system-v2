import { LayoutWithHeader } from "@/components/layout-with-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-slate-800 text-white px-4 py-2 rounded-md z-50"
      >
        メインコンテンツへスキップ
      </a>
      <LayoutWithHeader>{children}</LayoutWithHeader>
    </>
  );
}
