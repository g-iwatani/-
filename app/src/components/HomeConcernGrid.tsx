import { ConcernChip } from "@/components/ConcernChip";
import { SectionHead } from "@/components/SectionHead";
import { getPopularConcerns } from "@/lib/concerns";
import type { Locale } from "@/app/[locale]/dictionaries";

/**
 * TOP 専用「悩みから探す」グリッド。
 *
 * 既存 ConcernChip (番号 + 左バー + 悩みアイコン) を grid に並べる。
 * パーチメント地 (bg-muted) で TOP の他セクションと視覚的に切り分ける。
 *
 * `CategoryGrid` (= カテゴリ別 = ハーネス / フード / 玩具…) とは別物。
 * こちらは「悩み別」 (= 散歩拒否 / 抜け毛 / 暑さ…) で 15 件抜粋。
 */
export function HomeConcernGrid({ locale }: { locale: Locale }) {
  const items = getPopularConcerns(15);
  const root = `/${locale}`;
  return (
    <section className="mt-12 bg-muted py-14 md:mt-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHead
          kicker="02 · CONCERNS"
          title={locale === "ja" ? "悩みから探す" : "Browse by concern"}
          titleEn={locale === "ja" ? "Browse by concern" : undefined}
          lead={
            locale === "ja"
              ? "50 種類の「困りごと」 を 5 カテゴリに整理。トリアージ感覚で正しい売場へ。"
              : "50 concerns sorted into 5 categories. Triage to the right shelf."
          }
          viewAllHref={`${root}/concerns/${items[0]?.id ?? ""}`}
          viewAllLabel={
            locale === "ja" ? "50 悩みすべて見る" : "All 50 concerns"
          }
        />
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {items.map((c) => (
            <ConcernChip
              key={c.id}
              concern={c}
              locale={locale}
              href={`${root}/concerns/${c.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
