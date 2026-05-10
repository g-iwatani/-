import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";

type Item = {
  /** /[locale]/concerns/[id] へジャンプする concern id */
  concernId: string;
  emoji: string;
  labelJa: string;
  labelEn: string;
};

// UI レビュー指摘「pastel 8 色 (sky/indigo/cyan/violet を含む) がブランドの
// warm cream 背景と衝突して dirty に見える」 への対応で、背景色を統一
// (bg-card 白 + 共通 border) に変更。色味は emoji の絵柄が担うので、
// タイル側はモノトーンで cohesion を確保する。
const ITEMS: Item[] = [
  { concernId: "pulls-leash",     emoji: "🦮", labelJa: "ハーネス",      labelEn: "Harness" },
  { concernId: "cold-winter",     emoji: "🧥", labelJa: "冬服・防寒",    labelEn: "Winter coats" },
  { concernId: "hot-summer",      emoji: "☀️", labelJa: "夏の暑さ",      labelEn: "Summer cooling" },
  { concernId: "rainy-walk",      emoji: "☔", labelJa: "雨の日散歩",    labelEn: "Rainy walks" },
  { concernId: "destroys-toys",   emoji: "🎾", labelJa: "おもちゃ",      labelEn: "Toys" },
  { concernId: "dental-care",     emoji: "🦷", labelJa: "歯みがき",      labelEn: "Dental" },
  { concernId: "heavy-shedding",  emoji: "🪮", labelJa: "抜け毛ケア",    labelEn: "Shedding" },
  { concernId: "senior-dog",      emoji: "🧓", labelJa: "シニア犬",      labelEn: "Senior care" },
];

type Props = {
  locale: Locale;
  titleJa?: string;
  titleEn?: string;
};

/**
 * Hero 直下のカテゴリアイコングリッド (Mercari/ZOZO 風)。
 * 細い rail よりタップ面積大きく、視線で「ある」 ことが分かる。
 *
 * 各アイコンは concerns ベースの /results にジャンプ。サブカテゴリ実装が
 * 進んだ将来は ?category=... に切り替え可。8 個固定 (4 列 × 2 行)。
 */
export function CategoryGrid({ locale, titleJa, titleEn }: Props) {
  const root = `/${locale}`;
  const title = locale === "ja" ? (titleJa ?? "カテゴリから探す") : (titleEn ?? "Browse by category");

  return (
    <section className="mt-10 md:mt-12">
      <div className="mx-auto max-w-7xl px-5">
        <h2 className="t-section mb-4">{title}</h2>
        <ul className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-3">
          {ITEMS.map((item) => (
            <li key={item.concernId}>
              <Link
                href={`${root}/concerns/${item.concernId}`}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-card-border bg-card px-2 py-3 text-center text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary md:gap-2 md:py-4"
              >
                <span aria-hidden className="text-2xl md:text-3xl">
                  {item.emoji}
                </span>
                <span className="text-[11px] font-bold leading-tight md:text-xs">
                  {locale === "ja" ? item.labelJa : item.labelEn}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
