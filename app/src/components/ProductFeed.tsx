import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";

export type FeedItem = {
  key: string;
  /** "amazon" / "楽天" / "編集" 表示の元データ。badge 色分けに使用。 */
  source: "amazon" | "rakuten" | "curated";
  /** クリック先 URL。external (楽天直リンク) は target=_blank + アフィリ rel */
  href: string;
  isExternal: boolean;
  imageUrl: string;
  brand: string;
  name: string;
  priceJpy: number;
};

type Props = {
  items: FeedItem[];
  locale: Locale;
  titleJa?: string;
  titleEn?: string;
};

/**
 * メルカリ TOP の「おすすめ商品」リール。1 つの縦スクロール grid に
 * Amazon / 楽天 / 編集部 の商品を ミックスして並べる。
 *
 * - 2 col (mobile) / 3 (sm) / 4 (md) / 5 (lg) / 6 (xl)
 * - 各カード正方形画像 + ソースバッジ + 価格 + 名前
 * - 横スクロール rail を捨ててコマース感を最大化
 *
 * 「もっと見る」 で /popular へジャンプ (深掘り surface)。
 */
export function ProductFeed({ items, locale, titleJa, titleEn }: Props) {
  if (items.length === 0) return null;
  const title =
    locale === "ja"
      ? (titleJa ?? "今みんなが買ってる")
      : (titleEn ?? "Trending now");

  return (
    <section className="mt-6 md:mt-8">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold tracking-tight text-foreground md:text-xl">
            {title}
          </h2>
          <Link
            href={`/${locale}/popular`}
            className="text-xs font-semibold text-primary hover:underline md:text-sm"
          >
            {locale === "ja" ? "もっと見る →" : "See more →"}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <li key={item.key}>
              <FeedCard item={item} locale={locale} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeedCard({ item, locale }: { item: FeedItem; locale: Locale }) {
  const sourceClass =
    item.source === "amazon"
      ? "bg-amber-500 text-white"
      : item.source === "rakuten"
        ? "bg-rose-500 text-white"
        : "bg-emerald-600 text-white";
  const sourceLabel =
    item.source === "amazon" ? "Amazon" : item.source === "rakuten" ? "楽天" : "編集";

  const inner = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        />
        <span
          className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold ${sourceClass}`}
        >
          {sourceLabel}
        </span>
        {item.isExternal && (
          <span className="absolute left-1.5 top-1.5 rounded bg-foreground/80 px-1 py-0.5 text-[9px] font-bold text-background">
            PR
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-fg line-clamp-1">
          {item.brand}
        </p>
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-foreground group-hover:text-primary md:text-xs">
          {item.name}
        </p>
        <p className="mt-auto pt-1 text-sm font-extrabold text-primary md:text-base">
          {formatPrice(item.priceJpy, locale)}
        </p>
      </div>
    </article>
  );

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel={AFFILIATE_REL}
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className="block h-full">
      {inner}
    </Link>
  );
}
