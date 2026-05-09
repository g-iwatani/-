"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import type { Concern } from "@/lib/concerns";
import { format, formatLastUpdated } from "@/lib/format";
import { site } from "@/lib/site";
import {
  type ProductMatch,
  type SortKey,
  sortMatches,
} from "@/lib/matching";
import type { ProductCategory } from "@/lib/products";
import { ComparisonTable } from "./ComparisonTable";
import { ProductCard } from "./ProductCard";

type Props = {
  locale: Locale;
  dict: Dictionary;
  initialMatches: ProductMatch[];
  selectedConcerns: Concern[];
  brands: string[];
  measurementsSummary?: {
    chest?: number;
    back?: number;
    neck?: number;
    breedNames: string[];
  };
};

const sortOptions: {
  key: SortKey;
  labelKey: keyof Dictionary["results"]["sort"];
}[] = [
  { key: "match", labelKey: "match" },
  { key: "fit", labelKey: "fit" },
  { key: "popular", labelKey: "popular" },
  { key: "price_asc", labelKey: "price_asc" },
  { key: "price_desc", labelKey: "price_desc" },
];

const categoryOrder: ProductCategory[] = ["apparel", "toy", "env"];

/** 価格チップのプリセット。最安値 buyOption が値以下のものをこのバケットに分類。 */
const PRICE_BUCKETS = [
  { id: 3000, labelJa: "〜¥3,000", labelEn: "<¥3K" },
  { id: 5000, labelJa: "〜¥5,000", labelEn: "<¥5K" },
  { id: 10000, labelJa: "〜¥10,000", labelEn: "<¥10K" },
  { id: 20000, labelJa: "〜¥20,000", labelEn: "<¥20K" },
] as const;

export function ResultsView({
  locale,
  dict,
  initialMatches,
  selectedConcerns,
  brands,
  measurementsSummary,
}: Props) {
  const [sort, setSort] = useState<SortKey>("match");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(
    "all",
  );
  const [activeBrand, setActiveBrand] = useState<string | "all">("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (showFilterSheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilterSheet]);

  const sorted = useMemo(
    () => sortMatches(initialMatches, sort),
    [initialMatches, sort],
  );

  const filtered = useMemo(() => {
    return sorted.filter((m) => {
      if (activeCategory !== "all" && m.product.category !== activeCategory)
        return false;
      if (activeBrand !== "all" && m.product.brand !== activeBrand)
        return false;
      if (priceMax != null) {
        const lowestPrice = Math.min(
          ...m.product.buyOptions.map((b) => b.priceJpy),
        );
        if (lowestPrice > priceMax) return false;
      }
      return true;
    });
  }, [sorted, activeCategory, activeBrand, priceMax]);

  const countByCategory: Record<ProductCategory, number> = useMemo(
    () => ({
      apparel: sorted.filter((m) => m.product.category === "apparel").length,
      toy: sorted.filter((m) => m.product.category === "toy").length,
      env: sorted.filter((m) => m.product.category === "env").length,
    }),
    [sorted],
  );

  // 価格帯チップ用の件数。一覧の最終フィルタ前 (= category/brand を尊重した状態)
  // で計算するので、ユーザがカテゴリ絞り込んだ時に「ハーネス内の〜3000円」が出る。
  const countByPriceBucket = useMemo(() => {
    const base = sorted.filter((m) => {
      if (activeCategory !== "all" && m.product.category !== activeCategory)
        return false;
      if (activeBrand !== "all" && m.product.brand !== activeBrand)
        return false;
      return true;
    });
    const out: Record<number, number> = {};
    for (const b of PRICE_BUCKETS) {
      out[b.id] = base.filter((m) => {
        const lowest = Math.min(...m.product.buyOptions.map((o) => o.priceJpy));
        return lowest <= b.id;
      }).length;
    }
    return out;
  }, [sorted, activeCategory, activeBrand]);

  const activeFiltersCount =
    (activeCategory !== "all" ? 1 : 0) +
    (activeBrand !== "all" ? 1 : 0) +
    (priceMax != null ? 1 : 0);

  function resetFilters() {
    setActiveCategory("all");
    setActiveBrand("all");
    setPriceMax(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-5 pb-16">
      <header className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {dict.results.title}
          </h1>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-fg">
            {formatLastUpdated(
              site.lastUpdated.year,
              site.lastUpdated.month,
              locale,
            )}
          </span>
        </div>
        {measurementsSummary && (
          <DogProfileChip
            locale={locale}
            summary={measurementsSummary}
            selectedConcerns={selectedConcerns}
          />
        )}
      </header>

      {/* Sticky filter / sort bar */}
      <div className="sticky top-14 z-20 -mx-5 mt-4 border-b border-border bg-background/90 px-5 py-3 backdrop-blur-md">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <CategoryTab
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            label={locale === "ja" ? "すべて" : "All"}
            count={sorted.length}
          />
          {categoryOrder.map((cat) => (
            <CategoryTab
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={
                cat === "apparel"
                  ? dict.results.filter.category_apparel
                  : cat === "toy"
                    ? dict.results.filter.category_toy
                    : dict.results.filter.category_env
              }
              count={countByCategory[cat]}
            />
          ))}
        </div>

        {/* Price bucket chips (one-tap filtering, mobile-friendly) */}
        <div
          className="flex gap-2 overflow-x-auto pb-1.5"
          style={{ scrollbarWidth: "none" }}
        >
          {PRICE_BUCKETS.map((b) => {
            const active = priceMax === b.id;
            const count = countByPriceBucket[b.id] ?? 0;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setPriceMax(active ? null : b.id)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-card text-muted-fg hover:border-primary hover:text-primary"
                }`}
              >
                <span>{locale === "ja" ? b.labelJa : b.labelEn}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active ? "bg-white/20" : "bg-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort + Filter button row */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-fg">
            {format(dict.results.count, { count: filtered.length })}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {dict.results.sort.label}: {dict.results.sort[opt.labelKey]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFilterSheet(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary"
            >
              ⚙ {dict.results.filter.title}
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-fg">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeBrand !== "all" && (
              <ActiveChip
                label={activeBrand}
                onRemove={() => setActiveBrand("all")}
              />
            )}
            {priceMax != null && (
              <ActiveChip
                label={
                  locale === "ja"
                    ? `〜¥${priceMax.toLocaleString()}`
                    : `Under ¥${priceMax.toLocaleString()}`
                }
                onRemove={() => setPriceMax(null)}
              />
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-fg hover:text-foreground"
            >
              {dict.results.filter.reset}
            </button>
          </div>
        )}
      </div>

      {/* Top comparison (mybest-style spec face-off, only when 3+ matches) */}
      {filtered.length >= 3 && (
        <ComparisonTable matches={filtered} locale={locale} dict={dict} />
      )}

      {/* Results */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-fg">
            {dict.results.empty}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((match, i) => (
              <ProductCard
                key={match.product.id}
                match={match}
                locale={locale}
                dict={dict}
                href={`/${locale}/products/${match.product.id}`}
                isTopPick={i === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter bottom sheet (mobile) / modal (desktop) */}
      {showFilterSheet && (
        <FilterSheet
          locale={locale}
          dict={dict}
          brands={brands}
          activeBrand={activeBrand}
          onBrandChange={setActiveBrand}
          priceMax={priceMax}
          onPriceMaxChange={setPriceMax}
          onClose={() => setShowFilterSheet(false)}
          onReset={resetFilters}
          resultCount={filtered.length}
        />
      )}
    </div>
  );
}

function CategoryTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-card text-muted-fg hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`ml-1.5 rounded-full px-1.5 text-xs ${
          active ? "bg-background/20" : "bg-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-fg"
    >
      {label}
      <span aria-hidden="true">×</span>
    </button>
  );
}

function FilterSheet({
  locale,
  dict,
  brands,
  activeBrand,
  onBrandChange,
  priceMax,
  onPriceMaxChange,
  onClose,
  onReset,
  resultCount,
}: {
  locale: Locale;
  dict: Dictionary;
  brands: string[];
  activeBrand: string | "all";
  onBrandChange: (b: string | "all") => void;
  priceMax: number | null;
  onPriceMaxChange: (p: number | null) => void;
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
}) {
  const priceBuckets: Array<{ value: number | null; labelJa: string; labelEn: string }> = [
    { value: null, labelJa: "すべて", labelEn: "Any" },
    { value: 3000, labelJa: "〜¥3,000", labelEn: "Under ¥3,000" },
    { value: 5000, labelJa: "〜¥5,000", labelEn: "Under ¥5,000" },
    { value: 10000, labelJa: "〜¥10,000", labelEn: "Under ¥10,000" },
    { value: 20000, labelJa: "〜¥20,000", labelEn: "Under ¥20,000" },
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-background md:max-h-[85vh] md:rounded-3xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 md:hidden">
          <span
            aria-hidden="true"
            className="h-1 w-10 rounded-full bg-border"
          />
        </div>

        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-extrabold text-foreground">
            {dict.results.filter.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-fg hover:bg-muted hover:text-foreground"
            aria-label="close"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {/* Price */}
          <section className="mb-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-fg">
              {dict.results.filter.price}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {priceBuckets.map((b) => {
                const active = priceMax === b.value;
                return (
                  <button
                    key={b.labelJa}
                    type="button"
                    onClick={() => onPriceMaxChange(b.value)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-muted-fg hover:border-primary"
                    }`}
                  >
                    {locale === "ja" ? b.labelJa : b.labelEn}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Brand */}
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-fg">
              {dict.results.filter.brand}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onBrandChange("all")}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                  activeBrand === "all"
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card text-muted-fg hover:border-primary"
                }`}
              >
                {locale === "ja" ? "すべて" : "All"}
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => onBrandChange(b)}
                  className={`truncate rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                    activeBrand === b
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-fg hover:border-primary"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-background px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-muted-fg hover:text-foreground"
          >
            {dict.results.filter.reset}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-fg shadow-md shadow-primary/20"
          >
            {format(dict.results.count, { count: resultCount })}{" "}
            {locale === "ja" ? "を見る" : "results"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function DogProfileChip({
  locale,
  summary,
  selectedConcerns,
}: {
  locale: Locale;
  summary: NonNullable<Props["measurementsSummary"]>;
  selectedConcerns: Concern[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-card-border bg-card p-3 text-xs">
      {summary.breedNames.length > 0 && (
        <span className="rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">
          🐶 {summary.breedNames.join(" × ")}
        </span>
      )}
      {(summary.chest != null || summary.back != null) && (
        <span className="rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">
          📏{" "}
          {[
            summary.chest != null &&
              `${locale === "ja" ? "胸囲" : "chest"} ${summary.chest}cm`,
            summary.back != null &&
              `${locale === "ja" ? "背丈" : "back"} ${summary.back}cm`,
            summary.neck != null &&
              `${locale === "ja" ? "首回り" : "neck"} ${summary.neck}cm`,
          ]
            .filter(Boolean)
            .join(" / ")}
        </span>
      )}
      {selectedConcerns.map((c) => (
        <span
          key={c.id}
          className="rounded-full bg-muted px-3 py-1 font-semibold text-muted-fg"
        >
          {locale === "ja" ? c.labelJa : c.labelEn}
        </span>
      ))}
    </div>
  );
}
