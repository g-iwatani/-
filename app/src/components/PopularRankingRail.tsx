import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { formatPrice } from "@/lib/format";
import { displayShopName, topPopular } from "@/lib/popular-products";
import { Rail, RailItem } from "./Rail";

type Props = {
  locale: Locale;
  /** 取得する件数。デフォルト 10。 */
  limit?: number;
};

/**
 * 売れ筋ランキング rail。楽天ランキングから集計済みの topPopular() を
 * そのまま並べる。TOP の「うちの子から探す」より上で「今みんなが買って
 * いるもの」を最初に提示する Mybest / mercari 流。
 */
export async function PopularRankingRail({ locale, limit = 10 }: Props) {
  const items = topPopular(limit);
  if (items.length === 0) return null;
  const root = `/${locale}`;

  return (
    <Rail
      title={locale === "ja" ? "今週よく売れている" : "Best-sellers · this week"}
      subtitle={
        locale === "ja"
          ? "楽天市場 犬用品ランキングから集計 · 毎日更新"
          : "Aggregated from Rakuten daily ranking"
      }
      viewAllHref={`${root}/popular`}
      viewAllLabel={locale === "ja" ? "ランキング一覧へ" : "All rankings"}
    >
      {items.map((p, i) => (
        <RailItem key={p.id}>
          <RankRailCard
            product={p}
            rank={i + 1}
            locale={locale}
            href={`${root}/popular#${p.id}`}
          />
        </RailItem>
      ))}
    </Rail>
  );
}

function RankRailCard({
  product,
  rank,
  locale,
  href,
}: {
  product: ReturnType<typeof topPopular>[number];
  rank: number;
  locale: Locale;
  href: string;
}) {
  const isPodium = rank <= 3;
  const price = formatPrice(product.priceJpy, locale);
  const shop = displayShopName(product.shopName);

  return (
    <Link
      href={href}
      className="group relative block w-[200px] flex-shrink-0 md:w-[228px]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* 商品画像 */}
        <div className="relative aspect-square bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.nameJa}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* メタ */}
        <div className="space-y-1 px-3 py-3 md:px-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-fg">
            {shop}
          </p>
          <p className="line-clamp-2 min-h-[2.6em] text-sm font-extrabold leading-snug tracking-[-0.01em] text-foreground group-hover:text-primary">
            {product.nameJa}
          </p>
          <p className="pt-1 text-base font-extrabold tracking-[-0.015em] text-primary">
            {price}〜
          </p>
        </div>
      </div>
      {/* 大型ランク番号 — カードの左上にオーバーラップ */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -left-2 -top-3 select-none font-extrabold leading-[0.8] tracking-[-0.06em] ${
          isPodium
            ? "text-[120px] text-primary md:text-[140px]"
            : "text-[88px] text-transparent [-webkit-text-stroke:1.5px_#d97a4e] md:text-[104px]"
        }`}
        style={{
          textShadow: isPodium
            ? "0 2px 0 #fff9f2, 0 -2px 0 #fff9f2, 2px 0 0 #fff9f2, -2px 0 0 #fff9f2"
            : undefined,
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span className="sr-only">{rank}位</span>
    </Link>
  );
}
