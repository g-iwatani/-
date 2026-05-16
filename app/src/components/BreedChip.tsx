import Link from "next/link";
import type { Breed } from "@/lib/breeds";
import type { Locale } from "@/app/[locale]/dictionaries";
import { BreedSilhouette } from "./BrandIcon";

type Props = {
  breed: Breed;
  locale: Locale;
};

export function BreedChip({ breed, locale }: Props) {
  const name = locale === "ja" ? breed.nameJa : breed.nameEn;

  return (
    <Link
      href={`/${locale}/breeds/${breed.id}`}
      className="group block w-[164px] flex-shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md md:w-[196px]"
    >
      <div className="relative flex h-28 items-center justify-center border-b border-card-border bg-muted md:h-36">
        {/* デザイナー納品のサイズ別シルエット。viewBox 200x200 をコンテナに収める。
            text-primary を継承して currentColor 単色で描画。 */}
        <BreedSilhouette
          size={breed.size}
          className="h-24 w-24 text-primary transition-transform group-hover:scale-105 md:h-32 md:w-32"
        />
        <span className="absolute right-3 top-3 rounded bg-card px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-fg">
          {breed.size}
        </span>
      </div>
      <div className="px-3 py-3 md:px-4">
        <p className="line-clamp-1 text-sm font-extrabold tracking-[-0.01em] text-foreground group-hover:text-primary md:text-base">
          {name}
        </p>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-fg">
          {breed.nameEn}
        </p>
      </div>
    </Link>
  );
}
