"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/app/[locale]/dictionaries";
import {
  type PopularFilters,
  type PopularProduct,
  type PopularProductCategory,
  type PopularSortKey,
  filterPopular,
  sortPopular,
} from "@/lib/popular-products";
import { PopularProductCard } from "./PopularProductCard";

type Props = {
  products: PopularProduct[];
  locale: Locale;
};

const PAGE_SIZE = 60;

const CATEGORY_LABELS: Record<PopularProductCategory, { ja: string; en: string }> = {
  apparel: { ja: "服", en: "Apparel" },
  leash: { ja: "リード・ハーネス", en: "Leash & harness" },
  bowl: { ja: "食器・給餌", en: "Feeding" },
  house: { ja: "ハウス・ベッド", en: "House & bed" },
  toy: { ja: "おもちゃ", en: "Toys" },
  care: { ja: "ケア・お手入れ", en: "Care" },
  toilet: { ja: "トイレ用品", en: "Toilet" },
  training: { ja: "しつけ", en: "Training" },
  food: { ja: "フード・おやつ", en: "Food & treats" },
  other: { ja: "その他", en: "Other" },
};

const SORT_LABELS: Record<PopularSortKey, { ja: string; en: string }> = {
  rank: { ja: "人気順 (ランキング)", en: "Popular (ranking)" },
  rating: { ja: "評価が高い順", en: "Highest rated" },
  review_count: { ja: "レビューが多い順", en: "Most reviewed" },
  price_asc: { ja: "価格が安い順", en: "Lowest price" },
  price_desc: { ja: "価格が高い順", en: "Highest price" },
  discount: { ja: "セール率が高い順", en: "Biggest discount" },
};

export function PopularProductsView({ products, locale }: Props) {
  const [sort, setSort] = useState<PopularSortKey>("rank");
  const [categories, setCategories] = useState<PopularProductCategory[]>([]);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [reviewCountMin, setReviewCountMin] = useState<number>(0);
  const [excludeFood, setExcludeFood] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    document.body.style.overflow = showFilterSheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilterSheet]);

  const filters: PopularFilters = useMemo(
    () => ({
      categories: categories.length > 0 ? categories : undefined,
      priceMax: priceMax ?? undefined,
      ratingMin: ratingMin > 0 ? ratingMin : undefined,
      reviewCountMin: reviewCountMin > 0 ? reviewCountMin : undefined,
      excludeFood,
      onSaleOnly,
    }),
    [categories, priceMax, ratingMin, reviewCountMin, excludeFood, onSaleOnly],
  );

  const filtered = useMemo(
    () => sortPopular(filterPopular(products, filters), sort),
    [products, filters, sort],
  );

  // フィルタ/ソート変更時にページネーションをリセット (React 公式の compare-on-render パターン)
  const [lastResetKey, setLastResetKey] = useState<unknown>(filters);
  const [lastSortKey, setLastSortKey] = useState<PopularSortKey>(sort);
  if (lastResetKey !== filters || lastSortKey !== sort) {
    setLastResetKey(filters);
    setLastSortKey(sort);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const presentCategories = useMemo(() => {
    const set = new Set<PopularProductCategory>();
    products.forEach((p) => set.add(p.internalCategory));
    return Array.from(set);
  }, [products]);

  const toggleCategory = (cat: PopularProductCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const reset = () => {
    setCategories([]);
    setPriceMax(null);
    setRatingMin(0);
    setReviewCountMin(0);
    setExcludeFood(false);
    setOnSaleOnly(false);
  };

  const t = (key: "filters" | "sort" | "results" | "no_results" | "reset" | "apply") => {
    const dict = {
      filters: { ja: "絞り込み", en: "Filters" },
      sort: { ja: "並び替え", en: "Sort" },
      results: { ja: "{n} 件", en: "{n} items" },
      no_results: {
        ja: "条件に合う商品が見つかりませんでした。フィルタを緩めてください。",
        en: "No products match. Loosen the filters.",
      },
      reset: { ja: "リセット", en: "Reset" },
      apply: { ja: "結果を見る", en: "Apply" },
    } as const;
    return dict[key][locale];
  };

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center">
        <p className="text-base text-muted-fg">
          {locale === "ja"
            ? "まだ商品データがありません。"
            : "No products yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:py-10">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowFilterSheet(true)}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground"
        >
          {t("filters")}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as PopularSortKey)}
          className="rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
        >
          {(Object.keys(SORT_LABELS) as PopularSortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key][locale]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <FilterPanel
            locale={locale}
            categories={categories}
            presentCategories={presentCategories}
            priceMax={priceMax}
            ratingMin={ratingMin}
            reviewCountMin={reviewCountMin}
            excludeFood={excludeFood}
            onSaleOnly={onSaleOnly}
            toggleCategory={toggleCategory}
            setPriceMax={setPriceMax}
            setRatingMin={setRatingMin}
            setReviewCountMin={setReviewCountMin}
            setExcludeFood={setExcludeFood}
            setOnSaleOnly={setOnSaleOnly}
            onReset={reset}
          />
        </aside>

        <div>
          <div className="hidden items-center justify-between md:flex">
            <p className="text-sm font-semibold text-muted-fg">
              {t("results").replace("{n}", filtered.length.toString())}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as PopularSortKey)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              {(Object.keys(SORT_LABELS) as PopularSortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key][locale]}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-fg">
              {t("no_results")}
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {visible.map((p) => (
                  <PopularProductCard key={p.id} product={p} locale={locale} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {locale === "ja"
                      ? `さらに表示 (残り ${filtered.length - visibleCount} 件)`
                      : `Show more (${filtered.length - visibleCount} left)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom sheet (mobile) */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="close"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setShowFilterSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-5 shadow-xl">
            <FilterPanel
              locale={locale}
              categories={categories}
              presentCategories={presentCategories}
              priceMax={priceMax}
              ratingMin={ratingMin}
              reviewCountMin={reviewCountMin}
              excludeFood={excludeFood}
              onSaleOnly={onSaleOnly}
              toggleCategory={toggleCategory}
              setPriceMax={setPriceMax}
              setRatingMin={setRatingMin}
              setReviewCountMin={setReviewCountMin}
              setExcludeFood={setExcludeFood}
              setOnSaleOnly={setOnSaleOnly}
              onReset={reset}
            />
            <div className="sticky bottom-0 mt-4 flex gap-3 border-t border-border bg-background pt-4">
              <button
                type="button"
                onClick={reset}
                className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-bold text-foreground"
              >
                {t("reset")}
              </button>
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="flex-[2] rounded-full bg-primary py-3 text-sm font-bold text-primary-fg"
              >
                {t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type PanelProps = {
  locale: Locale;
  categories: PopularProductCategory[];
  presentCategories: PopularProductCategory[];
  priceMax: number | null;
  ratingMin: number;
  reviewCountMin: number;
  excludeFood: boolean;
  onSaleOnly: boolean;
  toggleCategory: (c: PopularProductCategory) => void;
  setPriceMax: (n: number | null) => void;
  setRatingMin: (n: number) => void;
  setReviewCountMin: (n: number) => void;
  setExcludeFood: (b: boolean) => void;
  setOnSaleOnly: (b: boolean) => void;
  onReset: () => void;
};

function FilterPanel(props: PanelProps) {
  const { locale } = props;
  const lbl = (ja: string, en: string) => (locale === "ja" ? ja : en);

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-foreground">
          {lbl("絞り込み", "Filters")}
        </h3>
        <button
          type="button"
          onClick={props.onReset}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {lbl("リセット", "Reset")}
        </button>
      </div>

      <Section title={lbl("カテゴリ", "Category")}>
        <div className="flex flex-wrap gap-2">
          {props.presentCategories.map((cat) => {
            const active = props.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => props.toggleCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {CATEGORY_LABELS[cat][locale]}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={lbl("価格上限", "Max price")}>
        <select
          value={props.priceMax ?? ""}
          onChange={(e) =>
            props.setPriceMax(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-semibold"
        >
          <option value="">{lbl("指定なし", "Any")}</option>
          <option value="2000">¥2,000</option>
          <option value="5000">¥5,000</option>
          <option value="10000">¥10,000</option>
          <option value="20000">¥20,000</option>
          <option value="50000">¥50,000</option>
        </select>
      </Section>

      <Section title={lbl("最低評価", "Min rating")}>
        <select
          value={props.ratingMin}
          onChange={(e) => props.setRatingMin(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-semibold"
        >
          <option value={0}>{lbl("指定なし", "Any")}</option>
          <option value={3}>★ 3.0+</option>
          <option value={3.5}>★ 3.5+</option>
          <option value={4}>★ 4.0+</option>
          <option value={4.5}>★ 4.5+</option>
        </select>
      </Section>

      <Section title={lbl("最低レビュー数", "Min reviews")}>
        <select
          value={props.reviewCountMin}
          onChange={(e) => props.setReviewCountMin(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-semibold"
        >
          <option value={0}>{lbl("指定なし", "Any")}</option>
          <option value={10}>{lbl("10件以上", "10+")}</option>
          <option value={50}>{lbl("50件以上", "50+")}</option>
          <option value={100}>{lbl("100件以上", "100+")}</option>
          <option value={500}>{lbl("500件以上", "500+")}</option>
        </select>
      </Section>

      <div className="space-y-2 border-t border-border pt-4">
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={props.onSaleOnly}
            onChange={(e) => props.setOnSaleOnly(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {lbl("セール中のみ", "On sale only")}
        </label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={props.excludeFood}
            onChange={(e) => props.setExcludeFood(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {lbl("フード・おやつを除外", "Exclude food & treats")}
        </label>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-fg">
        {title}
      </p>
      {children}
    </div>
  );
}
