import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";

type Props = {
  product: Product;
  locale: Locale;
  href: string;
};

export function MiniProductCard({ product, locale, href }: Props) {
  const name = locale === "ja" ? product.nameJa : product.nameEn;
  const lowest = Math.min(...product.buyOptions.map((b) => b.priceJpy));
  const priceLabel = formatPrice(lowest, locale);

  return (
    <Link
      href={href}
      className="group block w-[180px] overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md md:w-[220px]"
    >
      <ProductImage
        palette={product.imagePalette}
        emoji={product.imageEmoji}
        size="sm"
      />
      <div className="px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-fg">
          {product.brand}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {name}
        </p>
        <p className="mt-2 text-base font-extrabold text-primary">
          {priceLabel}〜
        </p>
      </div>
    </Link>
  );
}
