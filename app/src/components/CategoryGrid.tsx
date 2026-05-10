import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";

type Item = {
  href: string;
  emoji: string;
  labelJa: string;
  labelEn: string;
  /** ボタン背景色 (Tailwind classes 直書き — preset 8 色を category ごとに割当) */
  tone: string;
};

const ITEMS: Item[] = [
  {
    href: "?concerns=pulls-leash",
    emoji: "🦮",
    labelJa: "ハーネス",
    labelEn: "Harness",
    tone: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    href: "?concerns=cold-winter",
    emoji: "🧥",
    labelJa: "冬服・防寒",
    labelEn: "Winter coats",
    tone: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
  {
    href: "?concerns=hot-summer",
    emoji: "☀️",
    labelJa: "夏の暑さ対策",
    labelEn: "Summer cooling",
    tone: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    href: "?concerns=rainy-walk",
    emoji: "☔",
    labelJa: "雨の日散歩",
    labelEn: "Rainy walks",
    tone: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  },
  {
    href: "?concerns=destroys-toys",
    emoji: "🎾",
    labelJa: "おもちゃ",
    labelEn: "Toys",
    tone: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
  {
    href: "?concerns=dental-care",
    emoji: "🦷",
    labelJa: "歯みがき",
    labelEn: "Dental",
    tone: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  },
  {
    href: "?concerns=heavy-shedding",
    emoji: "🪮",
    labelJa: "抜け毛ケア",
    labelEn: "Shedding",
    tone: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  {
    href: "?concerns=senior-dog",
    emoji: "🧓",
    labelJa: "シニア犬",
    labelEn: "Senior care",
    tone: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
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
        <h2 className="mb-4 text-base font-extrabold tracking-tight text-foreground md:text-xl">
          {title}
        </h2>
        <ul className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-3">
          {ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={`${root}/results${item.href}`}
                className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-all md:gap-2 md:py-4 ${item.tone}`}
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
