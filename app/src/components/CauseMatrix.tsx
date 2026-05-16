import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import type { Cause } from "@/lib/concern-causes";

type Props = {
  causes: Cause[];
  locale: Locale;
  /** 表示される悩み名。「○○、4 つの原因に切り分ける」の見出しで使う。 */
  concernLabel: string;
};

/**
 * 悩み = 1 症状で、原因は通常 2-4 種。各カードに 状況チップ + 診断質問 +
 * 推奨アクション 3 ステップを並べる。「自分のケースに当てはまるか → どう
 * 動くか」 を 1 セクションで完結。
 */
export function CauseMatrix({ causes, locale, concernLabel }: Props) {
  if (causes.length === 0) return null;
  return (
    <section className="mx-auto mt-12 max-w-7xl px-5 md:mt-16">
      <div className="space-y-2">
        <span className="t-eyebrow-line">
          {locale === "ja" ? "原因マトリクス" : "Cause matrix"}
        </span>
        <h2 className="t-section">
          {locale === "ja"
            ? `${concernLabel}、${causes.length} つの原因に切り分ける`
            : `${concernLabel} — break it into ${causes.length} causes`}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-fg md:text-[15px]">
          {locale === "ja"
            ? "悩み = 1 症状で、原因は通常 2-4 種。あなたの子が当てはまる原因を 1 つ特定すれば、アクションが決まる。"
            : "One symptom usually has 2-4 distinct causes. Identify which one fits your dog and the right action falls out."}
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
        {causes.map((c) => (
          <CauseCard key={c.num} cause={c} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function CauseCard({ cause, locale }: { cause: Cause; locale: Locale }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 md:p-8">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-1 w-full"
        style={{ background: cause.color }}
      />
      <header className="mt-2 flex items-start justify-between gap-5">
        <div>
          <span
            className="font-mono text-xs font-extrabold tracking-wider"
            style={{ color: cause.color }}
          >
            {cause.num}
          </span>
          <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-foreground md:text-2xl">
            {cause.name}
          </h3>
        </div>
        <div className="flex flex-col items-end leading-none">
          <span
            className="font-extrabold tracking-[-0.03em]"
            style={{ color: cause.color, fontSize: "2.25rem" }}
          >
            {cause.pct}%
          </span>
          <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-fg">
            {locale === "ja" ? "の症例" : "of cases"}
          </span>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {cause.situations.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-bold text-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <p
          className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: cause.color }}
        >
          {locale === "ja"
            ? "✓ あなたの子に当てはまる?"
            : "✓ Does this fit your dog?"}
        </p>
        <ul className="mt-2 space-y-2">
          {cause.diagnosis.map((d) => (
            <li
              key={d}
              className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-1 h-[18px] w-[18px] flex-shrink-0 rounded border-2"
                style={{ borderColor: cause.color }}
              />
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground">
          {locale === "ja" ? "推奨アクション" : "Recommended actions"}
        </p>
        <ol className="mt-2 space-y-3">
          {cause.actions.map((a, i) => (
            <li key={a.title} className="flex gap-3">
              <span
                className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-extrabold text-primary-fg"
                style={{ background: cause.color }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-[-0.01em] text-foreground">
                  {a.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-fg">
                  {a.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {cause.guideSlug && (
        <Link
          href={`/${locale}/guides/${cause.guideSlug}`}
          className="mt-5 inline-flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3 text-xs font-bold text-foreground transition-colors hover:bg-primary-soft"
        >
          {locale === "ja"
            ? "この原因に対するガイドを読む"
            : "Read the guide for this cause"}
          <span style={{ color: cause.color }}>→</span>
        </Link>
      )}
    </article>
  );
}
