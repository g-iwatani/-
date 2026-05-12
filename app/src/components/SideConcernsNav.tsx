import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { type Concern, concerns } from "@/lib/concerns";

type Props = {
  locale: Locale;
  dict: Dictionary;
  /** 現在選択中の concern ID。アクティブハイライトに使う。 */
  activeConcernIds: string[];
  /**
   * 検索パラメータ。クリック時のリンクで breeds / chest / back / neck などを
   * 引き継ぐために渡す。concerns だけ差し替えて新リンクを生成する。
   */
  inheritParams: URLSearchParams;
};

/**
 * mybest 風の左サイドナビ。「悩みカテゴリ」を見出し付きで縦に並べる。
 * デスクトップ専用 (lg+)、モバイルでは現状の sticky フィルタバーが代替。
 *
 * 各 concern はクリックで `/<locale>/results?concerns=<id>&<inherited>` へ。
 * 現状の concerns は単一置換セマンティクス (mybest 流のシンプル UX)。
 */
export function SideConcernsNav({
  locale,
  dict,
  activeConcernIds,
  inheritParams,
}: Props) {
  const grouped = groupByCategory(concerns);
  const categoryLabels = dict.side_nav.categories;

  return (
    <nav
      aria-label={dict.side_nav.aria_label}
      className="space-y-5 rounded-3xl border border-card-border bg-card p-5"
    >
      <div>
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">
          {dict.side_nav.title}
        </h2>
        <p className="mt-1 text-[11px] text-muted-fg">
          {dict.side_nav.subtitle}
        </p>
      </div>

      {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => (
        <section key={cat} className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">
            {categoryLabels[cat]}
          </h3>
          <ul className="space-y-1">
            {grouped[cat]
              .slice(0, 8)
              .map((c) => (
                <SideNavItem
                  key={c.id}
                  concern={c}
                  locale={locale}
                  active={activeConcernIds.includes(c.id)}
                  inheritParams={inheritParams}
                />
              ))}
          </ul>
        </section>
      ))}

      <Link
        href={`/${locale}/my-dog`}
        className="mt-2 block rounded-full border border-border bg-background px-3 py-2 text-center text-xs font-bold text-muted-fg hover:border-primary hover:text-primary"
      >
        {dict.side_nav.see_all}
      </Link>
    </nav>
  );
}

function SideNavItem({
  concern,
  locale,
  active,
  inheritParams,
}: {
  concern: Concern;
  locale: Locale;
  active: boolean;
  inheritParams: URLSearchParams;
}) {
  const params = new URLSearchParams(inheritParams);
  params.set("concerns", concern.id);
  const href = `/${locale}/results?${params.toString()}`;
  const label = locale === "ja" ? concern.labelJa : concern.labelEn;

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs leading-tight transition-colors ${
          active
            ? "bg-primary/10 font-bold text-primary"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <span className="line-clamp-2">{label}</span>
      </Link>
    </li>
  );
}

function groupByCategory(list: Concern[]) {
  const out: Record<Concern["category"], Concern[]> = {
    season: [],
    behavior: [],
    care: [],
    purpose: [],
    size: [],
  };
  // popularity 降順で各カテゴリ内をソート
  const sorted = [...list].sort((a, b) => b.popularity - a.popularity);
  for (const c of sorted) out[c.category].push(c);
  return out;
}
