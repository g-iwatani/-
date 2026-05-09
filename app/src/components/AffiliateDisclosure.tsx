import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

/**
 * 全ページ上部に出すアフィリエイト関係性の冒頭明示。
 *
 * 2023 年 10 月施行の景表法ステマ規制 (内閣府告示第 19 号) は
 * 「広告であることを一般消費者が容易に判別できる表示を、目立つ場所に
 * 行うこと」を要求。違反時は措置命令 + 事業者名公表まで進む。
 *
 * 「目立つ場所」の解釈は記事冒頭/ヘッダー固定が安全側。フッターだけだと
 * 「容易に判別できる」要件を満たさないと判断されたガイドライン解釈例あり。
 *
 * 既存の per-button "PR" 表記はステマ規制と独立した表示で、両方必要。
 */
export function AffiliateDisclosure({ locale, dict }: Props) {
  return (
    <div
      role="note"
      aria-label={dict.affiliate_disclosure.aria_label}
      className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-[11px] leading-relaxed text-amber-900 sm:text-xs"
    >
      <span className="mr-1.5 inline-flex items-center justify-center rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
        PR
      </span>
      {dict.affiliate_disclosure.text}{" "}
      <Link
        href={`/${locale}/legal/affiliate`}
        className="underline hover:text-amber-700"
      >
        {dict.affiliate_disclosure.detail_link}
      </Link>
    </div>
  );
}
