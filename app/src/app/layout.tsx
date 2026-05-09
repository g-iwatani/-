import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nameJa} / ${site.nameEn}`,
    template: `%s | ${site.nameJa}`,
  },
  description: site.taglineJa,
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
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
