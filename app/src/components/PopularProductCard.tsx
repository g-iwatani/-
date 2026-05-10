import { AFFILIATE_REL } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import {
  type PopularProduct,
  discountRate,
  displayShopName,
} from "@/lib/popular-products";
import type { Locale } from "@/app/[locale]/dictionaries";
import { StarRating } from "./StarRating";

type Props = {
  product: PopularProduct;
  locale: Locale;
  variant?: "rail" | "grid";
  /** ランキング rail で使用時の順位 (1-N)。指定時は左上に順位バッジを描画。 */
  rank?: number;
};

export function PopularProductCard({
  product,
  locale,
  variant = "grid",
  rank,
}: Props) {
  // affiliateUrl は popular-products.ts でサーバ側生成済み。クライアントから
  // buildAffiliateUrl を呼ぶと NEXT_PUBLIC_ 無しの env が空で素URLになる罠を回避。
  const href = product.affiliateUrl;
  const price = formatPrice(product.priceJpy, locale);
  const original =
    product.originalPriceJpy && product.originalPriceJpy > product.priceJpy
      ? formatPrice(product.originalPriceJpy, locale)
      : null;
  const off = Math.round(discountRate(product) * 100);

  const widthClass =
    variant === "rail"
      ? "w-[180px] md:w-[220px] flex-none snap-start"
      : "w-full";

  return (
    <a
      href={href}
      rel={AFFILIATE_REL}
      target="_blank"
      className={`group block overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md ${widthClass}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        />
        {rank !== undefined && (
          <span
            className={`absolute left-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-black shadow-md ${
              rank === 1
                ? "bg-amber-400 text-amber-950"
                : rank === 2
                  ? "bg-zinc-300 text-zinc-900"
                  : rank === 3
                    ? "bg-orange-400 text-orange-950"
                    : "bg-foreground text-background"
            }`}
            aria-label={locale === "ja" ? `${rank}位` : `Rank ${rank}`}
          >
            {rank}
          </span>
        )}
        {off > 0 && (
          <span
            className="absolute right-2 top-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
          >
            -{off}%
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="t-card-meta line-clamp-1">
          {/* 景表法ステマ規制対応。商品画像を隠さないようカード内 shop 行頭に
              インライン配置。 */}
          <span
            aria-label="ad"
            className="mr-1 inline-flex translate-y-[-0.5px] items-center rounded bg-foreground/85 px-1 py-px text-[8px] font-bold text-background align-middle"
          >
            PR
          </span>
          {displayShopName(product.shopName)}
        </p>
        <p className="mt-0.5 t-card-title line-clamp-2 group-hover:text-primary">
          {product.nameJa}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <StarRating value={product.ratingAvg} />
          {product.ratingCount > 0 && (
            <span className="text-[11px] text-muted-fg">
              {locale === "ja"
                ? `${product.ratingCount.toLocaleString()}件`
                : product.ratingCount.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="t-price">{price}</span>
          {original && (
            <span className="text-xs text-muted-fg line-through">{original}</span>
          )}
        </div>
      </div>
    </a>
  );
}
