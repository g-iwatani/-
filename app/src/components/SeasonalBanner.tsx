import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { site } from "@/lib/site";

type Props = {
  locale: Locale;
  /** 期間チェックを上書きしたい時に渡す (テスト用)。指定なければ実時間。 */
  now?: Date;
};

const toneAccentText: Record<string, string> = {
  warm: "text-[#fbd9b9]",
  cool: "text-[#d3e0ff]",
  fresh: "text-[#dfe9cb]",
};

/**
 * 現在月に該当する季節キャンペーンを 1 つだけ表示する。
 * site.seasonalCampaigns に該当無しなら何もレンダーしない (silent no-op)。
 *
 * Cloudflare Workers の SSR は実行リージョンの UTC 時刻になりがちだが、
 * JP 時刻と数時間ズレるだけなので月跨ぎ前後 6 時間は許容誤差として運用。
 */
export function SeasonalBanner({ locale, now }: Props) {
  const month = (now ?? new Date()).getUTCMonth() + 1;
  const campaign = site.seasonalCampaigns.find((c) =>
    c.months.includes(month),
  );
  if (!campaign) return null;

  const title = locale === "ja" ? campaign.titleJa : campaign.titleEn;
  const lead = locale === "ja" ? campaign.leadJa : campaign.leadEn;
  const cta = locale === "ja" ? campaign.ctaJa : campaign.ctaEn;
  const accent = toneAccentText[campaign.tone] ?? toneAccentText.warm;
  const href = `/${locale}${campaign.href}`;

  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto max-w-7xl px-5">
        <Link
          href={href}
          className="group block overflow-hidden rounded-3xl bg-foreground p-8 text-background transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-12"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-primary" aria-hidden />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {locale === "ja" ? "この季節の特集" : "Seasonal feature"}
                </span>
              </div>
              <h2 className="text-balance text-2xl font-extrabold leading-tight tracking-[-0.025em] text-background md:text-4xl">
                {title.split(/、|, /).map((line, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? accent : ""}>
                    {line}
                    {i < arr.length - 1 ? "、" : ""}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-sm leading-relaxed text-background/70 md:text-base">
                {lead}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-fg md:self-auto">
              {cta} →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
