import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PopularProductsView } from "@/components/PopularProductsView";
import { getPopularProducts } from "@/lib/popular-products";
import { localizedAlternates } from "@/lib/site";
import { getDictionary, hasLocale, locales } from "../dictionaries";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 1368 商品の SSG HTML が大きすぎて Workers にバンドルされない問題への一時対応。
// 動的レンダーにすることで cache file を介さず handler.mjs から直接配信する。
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/popular">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const titleJa = "楽天で今人気の犬用品 — わんプロブレム";
  const titleEn = "Trending dog products on Rakuten — WanProblem";
  const descJa =
    "楽天市場の犬用品ランキング上位を、価格・評価・レビュー数で絞り込み・並び替えできる一覧。";
  const descEn =
    "Filter and sort the top-ranking dog products from Rakuten by price, rating, and reviews.";
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: locale === "ja" ? descJa : descEn,
    alternates: {
      canonical: `/${locale}/popular`,
      languages: localizedAlternates("/popular"),
    },
  };
}

export default async function PopularPage({
  params,
}: PageProps<"/[locale]/popular">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);

  return (
    <div className="pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            {locale === "ja" ? "楽天で人気" : "Trending on Rakuten"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {locale === "ja"
              ? "楽天で今売れている犬用品"
              : "Top-selling dog products on Rakuten"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-fg md:text-base">
            {locale === "ja"
              ? "楽天市場の犬用品カテゴリのランキング上位を集めました。価格・評価・レビュー数で絞り込み、お気に入りを見つけてください。リンク先は楽天の公式商品ページです。"
              : "The top-ranking dog products on Rakuten Ichiba. Filter by price, rating, and reviews. Links go to the official Rakuten product page."}
          </p>
        </div>
      </header>

      <PopularProductsView products={getPopularProducts()} locale={locale} />
    </div>
  );
}
