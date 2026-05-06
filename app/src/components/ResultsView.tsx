"use client";

import { useMemo, useState } from "react";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import type { Concern } from "@/lib/concerns";
import { format } from "@/lib/format";
import {
  type ProductMatch,
  type SortKey,
  sortMatches,
} from "@/lib/matching";
import type { ProductCategory } from "@/lib/products";
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

const sortOptions: { key: SortKey; labelKey: keyof Dictionary["results"]["sort"] }[] =
  [
    { key: "match", labelKey: "match" },
    { key: "fit", labelKey: "fit" },
    { key: "popular", labelKey: "popular" },
    { key: "price_asc", labelKey: "price_asc" },
    { key: "price_desc", labelKey: "price_desc" },
  ];

const categoryOrder: ProductCategory[] = ["apparel", "toy", "env"];

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
      return true;
    });
  }, [sorted, activeCategory, activeBrand]);

  const countByCategory: Record<ProductCategory, number> = {
    apparel: sorted.filter((m) => m.product.category === "apparel").length,
    toy: sorted.filter((m) => m.product.category === "toy").length,
    env: sorted.filter((m) => m.product.category === "env").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {dict.results.title}
        </h1>
        {measurementsSummary && (
          <DogProfileChip
            locale={locale}
            summary={measurementsSummary}
            selectedConcerns={selectedConcerns}
          />
        )}
      </header>

      {/* Category tabs (Trivago-style top-level switching) */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
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

      <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
        {/* Sidebar (filters) */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-card-border bg-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
              {dict.results.sort.label}
            </h2>
            <div className="mt-3 space-y-1.5">
              {sortOptions.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
                    sort === opt.key
                      ? "bg-primary-soft text-primary"
                      : "text-muted-fg hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="sort"
                    value={opt.key}
                    checked={sort === opt.key}
                    onChange={() => setSort(opt.key)}
                    className="accent-primary"
                  />
                  {dict.results.sort[opt.labelKey]}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
              {dict.results.filter.brand}
            </h2>
            <div className="mt-3 space-y-1">
              <BrandRow
                label={locale === "ja" ? "すべて" : "All"}
                active={activeBrand === "all"}
                onClick={() => setActiveBrand("all")}
              />
              {brands.map((b) => (
                <BrandRow
                  key={b}
                  label={b}
                  active={activeBrand === b}
                  onClick={() => setActiveBrand(b)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-muted-fg">
            {format(dict.results.count, { count: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-fg">
              {dict.results.empty}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((match) => (
                <ProductCard
                  key={match.product.id}
                  match={match}
                  locale={locale}
                  dict={dict}
                  href={`/${locale}/products/${match.product.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
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
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-card text-muted-fg hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active ? "bg-background/20" : "bg-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function BrandRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-xl px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-primary-soft text-primary"
          : "text-muted-fg hover:text-foreground"
      }`}
    >
      {label}
    </button>
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
            summary.chest != null && `${locale === "ja" ? "胸囲" : "chest"} ${summary.chest}cm`,
            summary.back != null && `${locale === "ja" ? "背丈" : "back"} ${summary.back}cm`,
            summary.neck != null && `${locale === "ja" ? "首回り" : "neck"} ${summary.neck}cm`,
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
