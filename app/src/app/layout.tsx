import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = h.get("x-locale") === "en" ? "en" : "ja";
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-grain bg-background flex flex-col">
        {children}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
