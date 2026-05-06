import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "わんプロブレム / WanProblem",
    template: "%s | わんプロブレム",
  },
  description: "ワンちゃんの困りごとに、世界中のブランドから答えを。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-grain bg-background flex flex-col">
        {children}
      </body>
    </html>
  );
}
