import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天皇皇位継承図｜歴代126代の系譜",
  description: "神武天皇から今上天皇まで、歴代天皇の系譜を立体空間でたどるインタラクティブ皇位継承図。",
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
