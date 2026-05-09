import Link from "next/link";
import type { Locale } from "@/app/[locale]/dictionaries";
import { type Concern, getPopularConcerns } from "@/lib/concerns";

type Props = {
  locale: Locale;
  activeConcernIds: string[];
  inheritParams: URLSearchParams;
  /** 表示する concern 数。デフォルト 8。 */
  limit?: number;
};

/**
 * モバイル/タブレット (lg 未満) の results ページ上部に出す、横スクロール
 * 可能な concern chip 一覧。SideConcernsNav の縦リストはデスクトップ専用なので、
 * モバイルでも 1 タップで悩みベース絞り込みできるようにする補助コンポーネント。
 *
 * 現状の concerns 選択を 1 つだけリンクに乗せ替える単純置換セマンティクス
 * (SideConcernsNav と同じ)。breeds/chest/back/neck は inheritParams で温存。
 */
export function MobileConcernChips({
  locale,
  activeConcernIds,
  inheritParams,
  limit = 8,
}: Props) {
  const top: Concern[] = getPopularConcerns(limit);
  return (
    <nav
      aria-label="concern shortcut"
      className="-mx-5 mt-2 mb-3 lg:hidden"
    >
      <div
        className="flex gap-2 overflow-x-auto px-5 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {top.map((c) => {
          const params = new URLSearchParams(inheritParams);
          params.set("concerns", c.id);
          const href = `/${locale}/results?${params.toString()}`;
          const active = activeConcernIds.includes(c.id);
          const label = locale === "ja" ? c.labelJa : c.labelEn;
          return (
            <Link
              key={c.id}
              href={href}
              className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-border bg-card text-muted-fg hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
