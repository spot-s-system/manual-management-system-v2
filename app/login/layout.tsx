import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | freeeクリア",
  description: "freeeクリア 操作体験ポータルへのログイン",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
