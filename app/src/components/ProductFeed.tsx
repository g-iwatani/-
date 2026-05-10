import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { type FeedItem } from "@/lib/feed";
import { formatPrice } from "@/lib/format";

export type { FeedItem };

type Props = {
  items: FeedItem[];
  locale: Locale;
  /** ヘッダ + 「もっと見る」 を出すか。中段に挟み込む chunk では false。 */
  showHeader?: boolean;
  titleJa?: string;
  titleEn?: string;
};

/**
 * メルカリ TOP の「おすすめ商品」リール。1 つの縦スクロール grid に
 * Amazon / 楽天 / 編集部 の商品を ミックスして並べる。
 *
 * - 2 col (mobile) / 3 (sm) / 4 (md) / 5 (lg) / 6 (xl)
 * - 各カード正方形画像 + ソースバッジ + 価格 + 名前
 * - showHeader=true でヘッダ + 「もっと見る」 link 付き、false で grid のみ
 *   → 同一 reel を chunk 化して間にカテゴリ/履歴を挿入する用途で使う
 */
export function ProductFeed({
  items,
  locale,
  showHeader = true,
  titleJa,
  titleEn,
}: Props) {
  if (items.length === 0) return null;
  const title =
    locale === "ja"
      ? (titleJa ?? "今みんなが買ってる")
      : (titleEn ?? "Trending now");

  return (
    <section className={showHeader ? "mt-6 md:mt-8" : "mt-3 md:mt-4"}>
      <div className="mx-auto max-w-7xl px-5">
        {showHeader && (
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
        )}
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
        {/* 景表法ステマ規制 (内閣府告示第19号, 2023年10月施行) は「広告で
            あることを一般消費者が容易に判別できる表示を、目立つ場所に行う」
            ことを要求。直 external の楽天/Amazon はもちろん、内部 /products/[id]
            経由の Amazon・編集 カードも最終的にアフィリ送客するため、すべての
            カードに PR バッジを出す。フッタの AffiliateDisclosure だけだと
            個別広告表示要件を満たさないと解釈されるリスクがあるため。 */}
        <span
          aria-label="ad"
          className="absolute left-1.5 top-1.5 rounded bg-foreground/85 px-1 py-0.5 text-[9px] font-bold text-background"
        >
          PR
        </span>
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
