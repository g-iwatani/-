import { AFFILIATE_REL } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import { type PopularProduct, discountRate } from "@/lib/popular-products";
import type { Locale } from "@/app/[locale]/dictionaries";
import { StarRating } from "./StarRating";

type Props = {
  product: PopularProduct;
  locale: Locale;
  variant?: "rail" | "grid";
};

export function PopularProductCard({ product, locale, variant = "grid" }: Props) {
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
          alt={product.nameJa}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-bold text-background">
          PR
        </span>
        {off > 0 && (
          <span className="absolute right-2 top-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{off}%
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-fg line-clamp-1">
          {product.shopName}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {product.nameJa}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <StarRating value={product.ratingAvg} />
          {product.ratingCount > 0 && (
            <span className="text-[11px] text-muted-fg">
              {product.ratingCount.toLocaleString()}件
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-primary">{price}</span>
          {original && (
            <span className="text-xs text-muted-fg line-through">{original}</span>
          )}
        </div>
      </div>
    </a>
  );
}
