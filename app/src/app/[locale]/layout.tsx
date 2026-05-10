import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { CompareStickyBar } from "@/components/CompareStickyBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ToastContainer } from "@/components/ToastContainer";
import { absoluteUrl, localizedAlternates, site } from "@/lib/site";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  locales,
} from "./dictionaries";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(locale) ? locale : defaultLocale;
  const dict = await getDictionary(safe);
  const path = `/${safe}`;
  return {
    metadataBase: new URL(site.url),
    title: {
      default: dict.brand.name,
      template: `%s | ${dict.brand.name}`,
    },
    description: dict.brand.tagline,
    alternates: {
      canonical: path,
      languages: localizedAlternates("/"),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      siteName: dict.brand.name,
      title: dict.brand.name,
      description: dict.brand.tagline,
      locale: safe === "ja" ? "ja_JP" : "en_US",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      title: dict.brand.name,
      description: dict.brand.tagline,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
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
    <>
      <AffiliateDisclosure locale={locale} dict={dict} />
      <Header locale={locale} dict={dict} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer locale={locale} dict={dict} />
      <CompareStickyBar locale={locale} dict={dict} />
      <MobileBottomNav locale={locale} dict={dict} />
      <ToastContainer />
    </>
  );
}
