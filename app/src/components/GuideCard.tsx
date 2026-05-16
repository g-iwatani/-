import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Guide } from "@/lib/guides";

type Props = {
  guide: Guide;
  locale: Locale;
};

export function GuideCard({ guide, locale }: Props) {
  const title = locale === "ja" ? guide.titleJa : guide.titleEn;
  const lead = locale === "ja" ? guide.leadJa : guide.leadEn;
  const author = locale === "ja" ? guide.authorJa : guide.authorEn;

  // 表紙 1 文字。slug から頭文字を取って暫定使用。
  // 撮影画像が入ったら、この div ごと <Image> に差し替え。
  const cover = title.charAt(0);

  return (
    <Link
      href={`/${locale}/guides/${guide.slug}`}
      className="block w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="flex h-32 items-center justify-center bg-muted">
        <span
          aria-hidden="true"
          className="text-[88px] font-extrabold leading-none tracking-[-0.05em] text-primary"
        >
          {cover}
        </span>
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
