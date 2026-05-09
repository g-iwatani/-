import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { site } from "@/lib/site";

type Props = {
  locale: Locale;
  /** 期間チェックを上書きしたい時に渡す (テスト用)。指定なければ実時間。 */
  now?: Date;
};

const TONE_CLASS: Record<string, string> = {
  warm: "from-amber-500 to-rose-500 text-white",
  cool: "from-sky-500 to-indigo-600 text-white",
  fresh: "from-emerald-500 to-teal-600 text-white",
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
  const toneClass = TONE_CLASS[campaign.tone] ?? TONE_CLASS.warm;
  const href = `/${locale}${campaign.href}`;

  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto max-w-7xl px-5">
        <Link
          href={href}
          className={`block overflow-hidden rounded-3xl bg-gradient-to-br ${toneClass} p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-8`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 md:items-center">
              <span aria-hidden className="text-4xl md:text-5xl">
                {campaign.icon}
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-white/90 md:text-base">
                  {lead}
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-white">
              {cta} →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
