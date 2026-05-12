import Link from "next/link";
import type { Breed } from "@/lib/breeds";
import type { Locale } from "@/app/[locale]/dictionaries";

type Props = {
  breed: Breed;
  locale: Locale;
};

const breedColorBySize: Record<
  Breed["size"],
  { from: string; to: string; emoji: string }
> = {
  tiny: { from: "#FCE6D8", to: "#D97A4E", emoji: "🐕" },
  small: { from: "#FFE5C7", to: "#C9844C", emoji: "🐶" },
  medium: { from: "#E8DFCE", to: "#8B7355", emoji: "🦮" },
  large: { from: "#C9B89E", to: "#5C4A36", emoji: "🐕‍🦺" },
  giant: { from: "#A89376", to: "#3F3120", emoji: "🐺" },
};

export function BreedChip({ breed, locale }: Props) {
  const name = locale === "ja" ? breed.nameJa : breed.nameEn;
  const palette = breedColorBySize[breed.size];

  return (
    <Link
      href={`/${locale}/breeds/${breed.id}`}
      className="group block w-[152px] overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md md:w-[180px]"
    >
      <div
        className="flex h-24 items-center justify-center text-4xl md:h-28 md:text-5xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        <span aria-hidden="true">{palette.emoji}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
          {name}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-fg">
          {breed.size}
        </p>
      </div>
    </Link>
  );
}
