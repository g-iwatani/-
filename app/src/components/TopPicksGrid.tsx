import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import type { PopularProduct } from "@/lib/popular-products";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";

type Props = {
  amazon: Product[];
  rakuten: PopularProduct[];
  locale: Locale;
  /** 左上の見出し */
  titleJa?: string;
  titleEn?: string;
};

/**
 * TOP ファーストビュー直下の「今売れてる」商品 grid。
 * Amazon TOP3 + 楽天 TOP3 = 6 カード。横スクロール rail ではなく grid。
 *
 * - PC: 6 列 (1 行ですべて見える)
 * - mobile: 2 列 × 3 行 (上 2 行 = ファーストビュー、3 行目以降スクロール)
 * - 各カードに source badge (Amazon / 楽天) を表示
 * - 商品画像が主役、価格・名前は最小限
 */
export function TopPicksGrid({
  amazon,
  rakuten,
  locale,
  titleJa,
  titleEn,
}: Props) {
  if (amazon.length === 0 && rakuten.length === 0) return null;
  const title =
    locale === "ja"
      ? (titleJa ?? "今みんなが買ってる")
      : (titleEn ?? "Trending now");

  return (
    <section className="mt-6 md:mt-8">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-3 flex items-baseline justify-between">
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {amazon.slice(0, 3).map((p, i) => (
            <li key={`amz-${p.id}`}>
              <AmazonTile
                product={p}
                rank={i + 1}
                locale={locale}
                href={`/${locale}/products/${p.id}`}
              />
            </li>
          ))}
          {rakuten.slice(0, 3).map((p, i) => (
            <li key={`rkt-${p.id}`}>
              <RakutenTile
                product={p}
                rank={i + 1}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AmazonTile({
  product,
  rank,
  locale,
  href,
}: {
  product: Product;
  rank: number;
  locale: Locale;
  href: string;
}) {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <RankBadge rank={rank} />
        <SourceBadge label="Amazon" tone="amber" />
        <ProductImage
          palette={product.imagePalette}
          emoji={product.imageEmoji}
          imageUrl={product.imageUrl}
          alt={name}
          size="sm"
        />
      </div>
      <div className="space-y-0.5 px-2 py-2">
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-foreground group-hover:text-primary md:text-xs">
          {name}
        </p>
        <p className="text-sm font-extrabold text-primary md:text-base">
          {formatPrice(lowest, locale)}
        </p>
      </div>
    </Link>
  );
}

function RakutenTile({
  product,
  rank,
  locale,
}: {
  product: PopularProduct;
  rank: number;
  locale: Locale;
}) {
  const lowest = product.priceJpy;
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel={AFFILIATE_REL}
      className="group block overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <RankBadge rank={rank} />
        <SourceBadge label="楽天" tone="rose" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.nameJa}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        />
      </div>
      <div className="space-y-0.5 px-2 py-2">
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-foreground group-hover:text-primary md:text-xs">
          {product.nameJa}
        </p>
        <p className="text-sm font-extrabold text-primary md:text-base">
          {formatPrice(lowest, locale)}
        </p>
      </div>
    </a>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const cls =
    rank === 1
      ? "bg-amber-400 text-amber-950"
      : rank === 2
        ? "bg-zinc-300 text-zinc-900"
        : "bg-orange-400 text-orange-950";
  return (
    <span
      className={`absolute left-1.5 top-1.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-black shadow-md md:h-8 md:w-8 ${cls}`}
      aria-label={`${rank}位`}
    >
      {rank}
    </span>
  );
}

function SourceBadge({
  label,
  tone,
}: {
  label: string;
  tone: "amber" | "rose";
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-500 text-white"
      : "bg-rose-500 text-white";
  return (
    <span
      className={`absolute right-1.5 top-1.5 z-10 inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ${cls}`}
    >
      {label}
    </span>
  );
}
