import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Guide } from "@/lib/guides";
import { GuideIcon } from "./BrandIcon";

type Props = {
  guide: Guide;
  locale: Locale;
};

/** slug の charcode 合計 % 4 で 4 カテゴリにマップ。GuideOg と同期。 */
const guideIconNames = [
  "harness",
  "bath",
  "senior",
  "season",
] as const;

export function GuideCard({ guide, locale }: Props) {
  const title = locale === "ja" ? guide.titleJa : guide.titleEn;
  const lead = locale === "ja" ? guide.leadJa : guide.leadEn;
  const author = locale === "ja" ? guide.authorJa : guide.authorEn;

  const paletteIdx =
    guide.slug.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
  const iconName = guideIconNames[paletteIdx];

  return (
    <Link
      href={`/${locale}/guides/${guide.slug}`}
      className="block w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="flex h-32 items-center justify-center bg-muted text-primary">
        <GuideIcon name={iconName} size={64} />
      </div>
      <div className="space-y-2 p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          {locale === "ja" ? "選び方ガイド" : "Buying guide"}
        </p>
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug tracking-[-0.01em] text-foreground">
          {title}
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-fg">
          {lead}
        </p>
        <p className="pt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-fg">
          {author}
        </p>
      </div>
    </Link>
  );
}
