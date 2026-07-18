import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天皇皇位継承図｜歴代126代と旧11宮家の系譜",
  description: "神武天皇から今上天皇までの歴代天皇と、1947年に皇籍離脱した旧11宮家の分岐をたどるインタラクティブ系譜図。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
