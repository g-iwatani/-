import Link from "next/link";

type Props = {
  /** "01 · BREEDS" のような mono kicker。leading line 付きで描画される。 */
  kicker?: string;
  /** メインタイトル (JA)。 */
  title: string;
  /** タイトル右に並べる小さい英語ラベル。任意。 */
  titleEn?: string;
  /** タイトル下の説明。任意。 */
  lead?: string;
  /** 右側「もっと見る →」のリンク先。 */
  viewAllHref?: string;
  viewAllLabel?: string;
};

/**
 * エディトリアル風セクション見出し。
 *   kicker line  ━━━ 01 · BREEDS
 *   うちの子から探す  Browse by breed
 *   犬種ごとの体格・運動量・被毛タイプに合わせて、適合する商品だけが並びます。
 *
 * 既存 .t-section / .t-section-sub と整合。Rail 内では Rail から渡すので、
 * 直接 import するのは新規セクションでのみ。
 */
export function SectionHead({
  kicker,
  title,
  titleEn,
  lead,
  viewAllHref,
  viewAllLabel,
}: Props) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {kicker && <span className="t-eyebrow-line">{kicker}</span>}
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="t-section">{title}</h2>
          {titleEn && <span className="t-section-en">{titleEn}</span>}
        </div>
        {lead && (
          <p className="max-w-xl text-sm leading-relaxed text-muted-fg md:text-[15px]">
            {lead}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="whitespace-nowrap text-xs font-semibold text-primary hover:underline md:text-sm"
        >
          {viewAllLabel ?? "もっと見る"} →
        </Link>
      )}
    </div>
  );
}
