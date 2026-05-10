import type { Locale } from "@/app/[locale]/dictionaries";
import { AFFILIATE_REL } from "@/lib/affiliate";
import { formatPrice } from "@/lib/format";
import { type BuyOption, resolveBuyUrl } from "@/lib/products";

type Props = {
  options: BuyOption[];
  locale: Locale;
  /** 「Amazon で買う」 の文字列テンプレート (i18n)。"{shop}" を含む。 */
  buyAtTemplate: string;
};

/**
 * 商品詳細ページの多店舗比較テーブル。Trivago / 価格.com 流のレイアウト。
 *
 * - 価格降順ソート → 最安値の行に「最安値」バッジ
 * - shop 名 (Amazon / 楽天 / 公式) を強調表示
 * - 配送地域・PR 表示・外部遷移を 1 行内で完結
 * - 1 件しか buyOption が無い商品でも問題なく成立 (バッジは出さない)
 *
 * 元実装は縦リストで「価格が大きく出るだけ」 だったので、複数ソース横断で
 * 比較できる差別化要素 (= サイトのコア moat) が機能していなかった。
 */
export function BuyOptionsCompare({ options, locale, buyAtTemplate }: Props) {
  if (options.length === 0) return null;

  // 安い順に並べる。同価格は元の順序を維持 (stable sort)。
  const sorted = [...options].sort((a, b) => a.priceJpy - b.priceJpy);
  const lowest = sorted[0]?.priceJpy;
  const hasMultiple = options.length > 1;
  const hasPriceSpread = sorted.some((o) => o.priceJpy !== lowest);

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
      {/* テーブルヘッダ。複数 shop 比較時のみ表示。 */}
      {hasMultiple && (
        <div className="flex items-baseline justify-between border-b border-card-border px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-fg">
            {locale === "ja" ? "販売店比較" : "Compare merchants"}
            <span className="ml-1.5 font-normal normal-case tracking-normal text-muted-fg/80">
              {locale === "ja"
                ? `${options.length}件`
                : `${options.length} stores`}
            </span>
          </p>
          {hasPriceSpread && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              {locale === "ja" ? "最安値ハイライト" : "Cheapest highlighted"}
            </p>
          )}
        </div>
      )}

      <ul>
        {sorted.map((opt, i) => {
          const isLowest = hasMultiple && hasPriceSpread && opt.priceJpy === lowest;
          return (
            <li
              key={`${opt.shop}-${i}`}
              className={`relative ${
                i === sorted.length - 1 ? "" : "border-b border-card-border"
              } ${isLowest ? "bg-primary-soft/40" : ""}`}
            >
              {isLowest && (
                <span className="absolute left-0 top-3 -translate-x-1/3 rounded-r bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-fg shadow-sm md:left-auto md:right-3 md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
                  {locale === "ja" ? "最安値" : "Lowest"}
                </span>
              )}
              <a
                href={resolveBuyUrl(opt)}
                target="_blank"
                rel={AFFILIATE_REL}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {/* 景表法ステマ規制 (内閣府告示第19号、2023/10) 対応。
                        各販売店 row のリンク隣に PR を必ず表示する。 */}
                    <span
                      aria-label="ad"
                      className="rounded bg-foreground/85 px-1.5 py-0.5 text-[10px] font-bold text-background"
                    >
                      PR
                    </span>
                    <span className="truncate">
                      {buyAtTemplate.replace("{shop}", opt.shop)}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-fg md:text-xs">
                    {opt.region === "jp"
                      ? locale === "ja"
                        ? "日本国内発送"
                        : "Ships in Japan"
                      : locale === "ja"
                        ? "国際配送あり"
                        : "Ships internationally"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-xl font-extrabold md:text-2xl ${
                      isLowest ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {formatPrice(opt.priceJpy, locale)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-fg">
                    {locale === "ja" ? "ショップへ" : "Open shop"} ↗
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {/* 単一 shop の時の補足: 「他のサイトでも探す」 を促す */}
      {!hasMultiple && (
        <p className="border-t border-card-border bg-muted/30 px-5 py-2.5 text-[11px] text-muted-fg">
          {locale === "ja"
            ? "現在この商品の取扱いは 1 店舗のみ表示しています。他サイトの取扱状況は順次拡充予定です。"
            : "Only one merchant carries this item right now. We're expanding coverage continuously."}
        </p>
      )}
    </div>
  );
}
