import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  locales,
} from "./dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  const dict = await getDictionary(safe);
  return {
    title: {
      default: dict.brand.name,
      template: `%s | ${dict.brand.name}`,
    },
    description: dict.brand.tagline,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-grain bg-background flex flex-col">
        <Header locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
