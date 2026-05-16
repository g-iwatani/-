import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { guides, type Guide } from "@/lib/guides";
import type { Locale } from "@/app/[locale]/dictionaries";

/**
 * TOP 専用「選び方ガイド」 編集メディア風 3 カード。
 *
 * 先頭はリード (大型・縦長カバー)、残り 2 件は中型カード。GuideCard は
 * rail 用に作られているため、TOP の grid surface 用にここで inline 構築。
 */
export function HomeGuideFeature({ locale }: { locale: Locale }) {
  const items = guides.slice(0, 3);
  if (items.length === 0) return null;
  const root = `/${locale}`;
  return (
    <section className="mt-12 md:mt-16">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead
          kicker="03 · GUIDES"
          title={locale === "ja" ? "選び方ガイド" : "Editor's buying guides"}
          titleEn={locale === "ja" ? "Editor's buying guides" : undefined}
          lead={
            locale === "ja"
              ? "ブランド横断で「何を / なぜ / どう選ぶか」 を編集部が言語化。"
              : "Cross-brand, concern-first editorial."
          }
          viewAllHref={`${root}/guides/${items[0].slug}`}
          viewAllLabel={locale === "ja" ? "全ガイドを見る" : "All guides"}
        />
        <div className="mt-7 grid gap-4 md:mt-8 md:grid-cols-3">
          <FeatureCard guide={items[0]} locale={locale} lead />
          {items[1] && <FeatureCard guide={items[1]} locale={locale} />}
          {items[2] && <FeatureCard guide={items[2]} locale={locale} />}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  guide,
  locale,
  lead,
}: {
  guide: Guide;
  locale: Locale;
  lead?: boolean;
}) {
  const title = locale === "ja" ? guide.titleJa : guide.titleEn;
  const summary = locale === "ja" ? guide.leadJa : guide.leadEn;
  const author = locale === "ja" ? guide.authorJa : guide.authorEn;
  const cover = title.charAt(0);
  return (
    <Link
      href={`/${locale}/guides/${guide.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${
        lead ? "md:row-span-2" : ""
      }`}
    >
      <div
        className={`flex items-center justify-center bg-muted ${
          lead ? "h-72 md:h-80" : "h-44"
        }`}
      >
        <span
          aria-hidden
          className={`font-extrabold leading-none tracking-[-0.05em] text-primary ${
            lead ? "text-[160px] md:text-[200px]" : "text-[100px]"
          }`}
        >
          {cover}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          BUYING GUIDE
        </span>
        <h3
          className={`line-clamp-2 text-balance font-extrabold leading-snug tracking-[-0.015em] text-foreground group-hover:text-primary ${
            lead ? "text-xl md:text-2xl" : "text-base"
          }`}
        >
          {title}
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-fg md:text-[13px]">
          {summary}
        </p>
        <p className="mt-auto pt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-fg">
          {author}
        </p>
      </div>
    </Link>
  );
}
