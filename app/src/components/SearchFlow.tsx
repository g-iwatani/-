"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import type { Breed, BreedSize } from "@/lib/breeds";
import type { Concern, ConcernCategory } from "@/lib/concerns";
import { format } from "@/lib/format";

type Props = {
  locale: Locale;
  dict: Dictionary;
  breeds: Breed[];
  concerns: Concern[];
  /**
   * submit 後の遷移先 URL prefix。デフォルトは `/[locale]/results` だが、
   * 「うちの子から探す」 (/my-dog) では同 URL に query を載せ替えて inline
   * 表示するため、`/[locale]/my-dog` を渡す。
   */
  submitPath?: string;
  /**
   * 初期値。`/my-dog` で localStorage / URL から復元するときに使う。
   * 通常の `/search` では undefined (空のウィザード)。
   */
  initial?: {
    breedIds?: string[];
    chest?: string;
    back?: string;
    neck?: string;
    concernIds?: string[];
  };
};

type Step = 0 | 1 | 2;

const breedSizeLabel: Record<
  BreedSize | "all",
  { ja: string; en: string; weight: string }
> = {
  all: { ja: "すべて", en: "All", weight: "" },
  tiny: { ja: "超小型", en: "Tiny", weight: "〜4kg" },
  small: { ja: "小型", en: "Small", weight: "4-10kg" },
  medium: { ja: "中型", en: "Medium", weight: "10-25kg" },
  large: { ja: "大型", en: "Large", weight: "25-45kg" },
  giant: { ja: "超大型", en: "Giant", weight: "45kg+" },
};

const breedColorBySize: Record<BreedSize, { from: string; to: string; emoji: string }> = {
  tiny: { from: "#FCE6D8", to: "#D97A4E", emoji: "🐕" },
  small: { from: "#FFE5C7", to: "#C9844C", emoji: "🐶" },
  medium: { from: "#E8DFCE", to: "#8B7355", emoji: "🦮" },
  large: { from: "#C9B89E", to: "#5C4A36", emoji: "🐕‍🦺" },
  giant: { from: "#A89376", to: "#3F3120", emoji: "🐺" },
};

const concernCategoryOrder: ConcernCategory[] = [
  "behavior",
  "care",
  "season",
  "size",
  "purpose",
];

const concernCategoryLabel: Record<
  ConcernCategory,
  { ja: string; en: string }
> = {
  behavior: { ja: "行動・しつけ", en: "Behavior & training" },
  care: { ja: "ケア・手入れ", en: "Care & grooming" },
  season: { ja: "環境・季節", en: "Season & weather" },
  size: { ja: "サイズ・体型", en: "Size & fit" },
  purpose: { ja: "用途・場面", en: "Purpose & occasion" },
};

const sizeQuickPresets: Array<{
  size: BreedSize;
  weight: number;
  chest: number;
  back: number;
  neck: number;
  ja: string;
  en: string;
  range: string;
}> = [
  { size: "tiny", weight: 2.5, chest: 32, back: 24, neck: 22, ja: "超小型", en: "XS", range: "〜4kg" },
  { size: "small", weight: 6, chest: 44, back: 32, neck: 30, ja: "小型", en: "S", range: "4-10kg" },
  { size: "medium", weight: 15, chest: 60, back: 44, neck: 38, ja: "中型", en: "M", range: "10-25kg" },
  { size: "large", weight: 30, chest: 80, back: 60, neck: 48, ja: "大型", en: "L", range: "25-45kg" },
  { size: "giant", weight: 55, chest: 96, back: 70, neck: 58, ja: "超大型", en: "XL", range: "45kg+" },
];

const concernIcon: Record<string, string> = {
  ruler: "📏",
  alert: "⚠️",
  compass: "🧭",
  sun: "☀️",
  snowflake: "❄️",
  "cloud-rain": "🌧️",
  footprints: "🐾",
  anchor: "⚓",
  shield: "🛡️",
  heart: "💛",
  moon: "🌙",
  sparkles: "✨",
  mountain: "⛰️",
  wind: "🌬️",
  leaf: "🍃",
};

export function SearchFlow({
  locale,
  dict,
  breeds,
  concerns,
  submitPath,
  initial,
}: Props) {
  const router = useRouter();
  // initial 指定時 (= 戻り訪問) は最後のステップ (悩み選択) から始める。
  // ユーザーは前回の選択を見て微調整したいケースが多いため。
  const hasInitial = Boolean(
    (initial?.breedIds && initial.breedIds.length > 0) ||
      initial?.chest ||
      (initial?.concernIds && initial.concernIds.length > 0),
  );
  const [step, setStep] = useState<Step>(hasInitial ? 2 : 0);
  const [breedQuery, setBreedQuery] = useState("");
  const [activeBreedSize, setActiveBreedSize] = useState<BreedSize | "all">(
    "all",
  );
  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>(
    initial?.breedIds ?? [],
  );
  const [chest, setChest] = useState<string>(initial?.chest ?? "");
  const [back, setBack] = useState<string>(initial?.back ?? "");
  const [neck, setNeck] = useState<string>(initial?.neck ?? "");
  const [weight, setWeight] = useState<string>("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    initial?.concernIds ?? [],
  );
  const [concernQuery, setConcernQuery] = useState("");
  const [activeConcernCategory, setActiveConcernCategory] =
    useState<ConcernCategory | "all">("all");
  const [activeSizePreset, setActiveSizePreset] = useState<BreedSize | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const popularBreedIds = useMemo(
    () => breeds.filter((b) => b.popular).map((b) => b.id),
    [breeds],
  );

  const filteredBreeds = useMemo(() => {
    const q = breedQuery.trim().toLowerCase();
    return breeds.filter((b) => {
      if (b.id === "mix") return false;
      if (activeBreedSize !== "all" && b.size !== activeBreedSize) return false;
      if (!q) return true;
      return (
        b.nameJa.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [breeds, breedQuery, activeBreedSize]);

  const popularBreedsToShow = useMemo(
    () =>
      breeds.filter(
        (b) =>
          popularBreedIds.includes(b.id) &&
          (activeBreedSize === "all" || b.size === activeBreedSize) &&
          (!breedQuery.trim() ||
            b.nameJa.toLowerCase().includes(breedQuery.toLowerCase()) ||
            b.nameEn.toLowerCase().includes(breedQuery.toLowerCase())),
      ),
    [breeds, popularBreedIds, activeBreedSize, breedQuery],
  );

  const filteredConcerns = useMemo(() => {
    const q = concernQuery.trim().toLowerCase();
    return concerns.filter((c) => {
      if (activeConcernCategory !== "all" && c.category !== activeConcernCategory)
        return false;
      if (!q) return true;
      return (
        c.labelJa.toLowerCase().includes(q) ||
        c.labelEn.toLowerCase().includes(q) ||
        c.descJa.toLowerCase().includes(q) ||
        c.descEn.toLowerCase().includes(q)
      );
    });
  }, [concerns, concernQuery, activeConcernCategory]);

  const concernCountByCategory: Record<ConcernCategory, number> = useMemo(() => {
    const counts: Record<ConcernCategory, number> = {
      size: 0,
      season: 0,
      behavior: 0,
      purpose: 0,
      care: 0,
    };
    for (const c of concerns) counts[c.category]++;
    return counts;
  }, [concerns]);

  const selectedBreedDetails = breeds.filter((b) =>
    selectedBreedIds.includes(b.id),
  );

  function toggleBreed(id: string) {
    setSelectedBreedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return [prev[1]!, id];
      return [...prev, id];
    });
  }

  function applyBreedAverage() {
    if (selectedBreedIds.length === 0) return;
    const selected = breeds.filter((b) => selectedBreedIds.includes(b.id));
    if (selected.length === 0) return;
    const avgChest =
      selected.reduce((s, b) => s + b.chestAvg, 0) / selected.length;
    const avgBack =
      selected.reduce((s, b) => s + b.backAvg, 0) / selected.length;
    const avgNeck =
      selected.reduce((s, b) => s + b.neckAvg, 0) / selected.length;
    const avgWeight =
      selected.reduce((s, b) => s + (b.weightMin + b.weightMax) / 2, 0) /
      selected.length;
    setChest(String(Math.round(avgChest)));
    setBack(String(Math.round(avgBack)));
    setNeck(String(Math.round(avgNeck)));
    setWeight(String(Math.round(avgWeight * 10) / 10));
    setActiveSizePreset(null);
  }

  function applySizePreset(preset: (typeof sizeQuickPresets)[number]) {
    setChest(String(preset.chest));
    setBack(String(preset.back));
    setNeck(String(preset.neck));
    setWeight(String(preset.weight));
    setActiveSizePreset(preset.size);
  }

  function toggleConcern(id: string) {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function submit() {
    const params = new URLSearchParams();
    if (selectedBreedIds.length > 0)
      params.set("breeds", selectedBreedIds.join(","));
    if (chest) params.set("chest", chest);
    if (back) params.set("back", back);
    if (neck) params.set("neck", neck);
    if (selectedConcerns.length > 0)
      params.set("concerns", selectedConcerns.join(","));
    const target = submitPath ?? `/${locale}/results`;
    startTransition(() =>
      router.push(`${target}?${params.toString()}`),
    );
  }

  function next() {
    if (step < 2) setStep((step + 1) as Step);
    else submit();
  }

  function back_() {
    if (step > 0) setStep((step - 1) as Step);
  }

  const totalSteps = 3;
  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-6 pb-32">
      <div className="rounded-3xl border border-card-border bg-card p-5 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
            {format(dict.search.step, {
              current: step + 1,
              total: totalSteps,
            })}
          </p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* Step 0: Breed selection */}
        {/* ============================================ */}
        {step === 0 && (
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_breed.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_breed.subtitle}
              </p>
            </header>

            {/* Sticky search */}
            <div className="sticky top-16 z-10 -mx-5 bg-card px-5 pt-2 pb-3 md:-mx-8 md:px-8">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg"
                >
                  🔍
                </span>
                <input
                  type="search"
                  value={breedQuery}
                  onChange={(e) => setBreedQuery(e.target.value)}
                  placeholder={dict.search.step_breed.search_placeholder}
                  className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Size category chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {(["all", "tiny", "small", "medium", "large", "giant"] as const).map(
                  (size) => {
                    const active = activeBreedSize === size;
                    const lbl = breedSizeLabel[size];
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setActiveBreedSize(size)}
                        className={`flex-none rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-fg hover:border-primary"
                        }`}
                      >
                        {locale === "ja" ? lbl.ja : lbl.en}
                        {lbl.weight && (
                          <span className="ml-1 opacity-70">{lbl.weight}</span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              {/* MIX hint */}
              <p className="mt-2 text-[11px] text-muted-fg">
                {dict.search.step_breed.mix_hint}{" "}
                <span className="font-bold text-primary">
                  ({selectedBreedIds.length}/2)
                </span>
              </p>
            </div>

            {/* Selected chips */}
            {selectedBreedDetails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedBreedDetails.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBreed(b.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-fg"
                  >
                    {locale === "ja" ? b.nameJa : b.nameEn}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Default state (no query): show big popular section */}
            {!breedQuery.trim() && (
              <>
                {popularBreedsToShow.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-extrabold text-foreground">
                        🔥 {locale === "ja" ? "人気の犬種" : "Popular breeds"}
                      </h3>
                      <p className="text-[11px] text-muted-fg">
                        {locale === "ja"
                          ? "よく飼われている犬種から"
                          : "Top breeds owners pick"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {popularBreedsToShow.map((breed) => (
                        <BreedTile
                          key={`pop-${breed.id}`}
                          breed={breed}
                          locale={locale}
                          selected={selectedBreedIds.includes(breed.id)}
                          onClick={() => toggleBreed(breed.id)}
                          large
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible "all breeds" — visible on demand */}
                <details className="group rounded-2xl border border-border bg-background">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-foreground">
                    <span>
                      {locale === "ja"
                        ? `すべての犬種から探す (${filteredBreeds.length})`
                        : `Browse all breeds (${filteredBreeds.length})`}
                    </span>
                    <span
                      aria-hidden="true"
                      className="transition-transform group-open:rotate-90"
                    >
                      ›
                    </span>
                  </summary>
                  <div className="border-t border-border px-3 py-3">
                    <div className="grid max-h-[400px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                      {filteredBreeds.map((breed) => {
                        const selected = selectedBreedIds.includes(breed.id);
                        const name =
                          locale === "ja" ? breed.nameJa : breed.nameEn;
                        const sizeLabel = breedSizeLabel[breed.size];
                        return (
                          <button
                            key={breed.id}
                            type="button"
                            onClick={() => toggleBreed(breed.id)}
                            aria-pressed={selected}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                              selected
                                ? "border-primary bg-primary-soft text-primary"
                                : "border-border bg-card text-foreground hover:border-primary"
                            }`}
                          >
                            <span className="truncate font-semibold">
                              {name}
                            </span>
                            <span className="ml-2 flex-none text-[10px] uppercase tracking-wide text-muted-fg">
                              {locale === "ja" ? sizeLabel.ja : sizeLabel.en}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </>
            )}

            {/* Search results state (query active) */}
            {breedQuery.trim() && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-extrabold text-foreground">
                    {locale === "ja"
                      ? `検索結果 (${filteredBreeds.length})`
                      : `Search results (${filteredBreeds.length})`}
                  </h3>
                </div>

                {filteredBreeds.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-fg">
                    {locale === "ja"
                      ? "該当する犬種がありません。「リストにない犬種」から進めます。"
                      : "No matches. You can also continue without selecting a breed."}
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filteredBreeds.map((breed) => {
                      const selected = selectedBreedIds.includes(breed.id);
                      const name =
                        locale === "ja" ? breed.nameJa : breed.nameEn;
                      const sizeLabel = breedSizeLabel[breed.size];
                      return (
                        <button
                          key={breed.id}
                          type="button"
                          onClick={() => toggleBreed(breed.id)}
                          aria-pressed={selected}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                            selected
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-border bg-background text-foreground hover:border-primary"
                          }`}
                        >
                          <span className="truncate font-semibold">{name}</span>
                          <span className="ml-2 flex-none text-[10px] uppercase tracking-wide text-muted-fg">
                            {locale === "ja" ? sizeLabel.ja : sizeLabel.en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={next}
              className="block w-full rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-center text-sm font-semibold text-muted-fg transition-colors hover:border-primary hover:text-primary"
            >
              {dict.search.step_breed.no_breed} →
            </button>
          </section>
        )}

        {/* ============================================ */}
        {/* Step 1: Measurements */}
        {/* ============================================ */}
        {step === 1 && (
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_size.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_size.subtitle}
              </p>
            </header>

            <MeasurementGuide locale={locale} />

            {/* Quick size preset chips */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-fg">
                {locale === "ja"
                  ? "ざっくりサイズで埋める(目安)"
                  : "Quick fill by rough size"}
              </h3>
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {sizeQuickPresets.map((preset) => {
                  const active = activeSizePreset === preset.size;
                  return (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => applySizePreset(preset)}
                      className={`flex-none rounded-2xl border px-3.5 py-2 text-left transition-all ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-background hover:border-primary"
                      }`}
                    >
                      <p
                        className={`text-sm font-extrabold ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {locale === "ja" ? preset.ja : preset.en}
                        <span className="ml-1 text-[10px] font-normal opacity-70">
                          {locale === "ja" ? `(${preset.range})` : preset.range}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-fg">
                        {locale === "ja"
                          ? `胸 ${preset.chest} / 背 ${preset.back} / 首 ${preset.neck} cm`
                          : `chest ${preset.chest} / back ${preset.back} / neck ${preset.neck} cm`}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-fg">
                {locale === "ja"
                  ? "※ 平均値が入ります。後から個別に調整できます。"
                  : "※ Fills in average values. You can fine-tune below."}
              </p>
            </div>

            {selectedBreedIds.length > 0 && (
              <button
                type="button"
                onClick={applyBreedAverage}
                className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-primary bg-primary-soft px-4 py-3 text-left text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-fg"
              >
                <span>
                  ⤴ {dict.search.step_size.use_average}
                  <span className="ml-2 text-xs font-normal opacity-70">
                    {selectedBreedDetails
                      .map((b) => (locale === "ja" ? b.nameJa : b.nameEn))
                      .join(" × ")}
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label={dict.search.step_size.weight_label}
                unit={dict.search.step_size.weight_unit}
                value={weight}
                onChange={setWeight}
                hint={locale === "ja" ? "おおよそでOK" : "Approximate is fine"}
              />
              <NumberField
                label={dict.search.step_size.chest_label}
                unit={dict.search.step_size.size_unit}
                value={chest}
                onChange={setChest}
                hint={
                  locale === "ja"
                    ? "前足の付け根まわりが基本"
                    : "Around the body, behind the front legs"
                }
              />
              <NumberField
                label={dict.search.step_size.back_label}
                unit={dict.search.step_size.size_unit}
                value={back}
                onChange={setBack}
                hint={
                  locale === "ja" ? "首の根本〜尻尾まで" : "Base of neck to tail"
                }
              />
              <NumberField
                label={dict.search.step_size.neck_label}
                unit={dict.search.step_size.size_unit}
                value={neck}
                onChange={setNeck}
                hint={
                  locale === "ja"
                    ? "首輪のサイズ目安"
                    : "Where the collar sits"
                }
              />
            </div>

            <p className="text-[11px] text-muted-fg">
              {locale === "ja"
                ? "※ どの値も省略OK。あとでも変更できます。"
                : "※ Any field is optional. You can change later."}
            </p>
          </section>
        )}

        {/* ============================================ */}
        {/* Step 2: Concerns */}
        {/* ============================================ */}
        {step === 2 && (
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_concerns.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_concerns.subtitle}
              </p>
            </header>

            {/* Sticky search + tabs */}
            <div className="sticky top-16 z-10 -mx-5 bg-card px-5 pt-2 pb-3 md:-mx-8 md:px-8">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg"
                >
                  🔍
                </span>
                <input
                  type="search"
                  value={concernQuery}
                  onChange={(e) => setConcernQuery(e.target.value)}
                  placeholder={
                    locale === "ja" ? "悩みを検索" : "Search concerns"
                  }
                  className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <CatChip
                  active={activeConcernCategory === "all"}
                  onClick={() => setActiveConcernCategory("all")}
                  label={locale === "ja" ? "すべて" : "All"}
                  count={concerns.length}
                />
                {concernCategoryOrder.map((cat) => (
                  <CatChip
                    key={cat}
                    active={activeConcernCategory === cat}
                    onClick={() => setActiveConcernCategory(cat)}
                    label={
                      locale === "ja"
                        ? concernCategoryLabel[cat].ja
                        : concernCategoryLabel[cat].en
                    }
                    count={concernCountByCategory[cat]}
                  />
                ))}
              </div>
            </div>

            {/* Selected chips */}
            {selectedConcerns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedConcerns.map((cid) => {
                  const c = concerns.find((x) => x.id === cid);
                  if (!c) return null;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => toggleConcern(cid)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-fg"
                    >
                      {locale === "ja" ? c.labelJa : c.labelEn}
                      <span aria-hidden="true">×</span>
                    </button>
                  );
                })}
              </div>
            )}

            {filteredConcerns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-fg">
                {locale === "ja" ? "該当する悩みがありません" : "No matches"}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredConcerns.map((concern) => {
                  const selected = selectedConcerns.includes(concern.id);
                  const label =
                    locale === "ja" ? concern.labelJa : concern.labelEn;
                  const desc =
                    locale === "ja" ? concern.descJa : concern.descEn;
                  const icon = concernIcon[concern.iconKey] ?? "•";
                  return (
                    <button
                      key={concern.id}
                      type="button"
                      onClick={() => toggleConcern(concern.id)}
                      aria-pressed={selected}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-background hover:border-primary"
                      }`}
                    >
                      <span className="mt-0.5 text-xl">{icon}</span>
                      <span className="flex-1">
                        <span
                          className={`block text-sm font-bold leading-snug ${
                            selected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-fg">
                          {desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={back_}
            disabled={step === 0}
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-fg transition-colors hover:text-foreground disabled:opacity-30"
          >
            ← {dict.search.back}
          </button>

          <div className="flex items-center gap-2">
            {/* どのステップからでも「今すぐ結果を見る」 でショートカット submit。
                強制的に最後まで答えさせるより、途中で気になった商品を見せる方が CVR 高い。 */}
            {step < 2 && (
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="hidden rounded-full px-3 py-2 text-xs font-semibold text-muted-fg transition-colors hover:text-foreground sm:inline-flex"
              >
                {dict.search.show_results_now}
              </button>
            )}
            {step < 2 && (
              <button
                type="button"
                onClick={() => setStep((step + 1) as Step)}
                className="rounded-full px-3 py-2 text-xs font-semibold text-muted-fg transition-colors hover:text-foreground"
              >
                {dict.search.skip}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={isPending}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-fg shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {step === 2 ? dict.search.complete : dict.search.next}
              {step !== 2 && " →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreedTile({
  breed,
  locale,
  selected,
  onClick,
  large,
}: {
  breed: Breed;
  locale: Locale;
  selected: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  const name = locale === "ja" ? breed.nameJa : breed.nameEn;
  const palette = breedColorBySize[breed.size];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group overflow-hidden rounded-2xl border transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/40"
          : "border-card-border hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          large ? "h-24 text-4xl" : "h-16 text-2xl"
        }`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        <span aria-hidden="true">{palette.emoji}</span>
      </div>
      <div className={`bg-card ${large ? "px-3 py-2.5" : "px-2 py-2"}`}>
        <p
          className={`line-clamp-1 font-bold ${
            large ? "text-sm" : "text-[11px]"
          } ${selected ? "text-primary" : "text-foreground"}`}
        >
          {name}
        </p>
        {large && (
          <p className="text-[10px] uppercase tracking-wide text-muted-fg">
            {breedSizeLabel[breed.size]?.[locale === "ja" ? "ja" : "en"]}
          </p>
        )}
      </div>
    </button>
  );
}

function CatChip({
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
      className={`flex-none rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-fg hover:border-primary"
      }`}
    >
      {label}
      <span className={`ml-1.5 ${active ? "opacity-70" : "opacity-50"}`}>
        {count}
      </span>
    </button>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  hint,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-fg">
        {label}
      </span>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-2xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-full bg-transparent px-4 py-3 text-base font-semibold text-foreground outline-none placeholder:text-muted-fg"
        />
        <span className="grid place-items-center bg-muted px-3 text-xs font-bold uppercase tracking-wide text-muted-fg">
          {unit}
        </span>
      </div>
      {hint && (
        <p className="mt-1 text-[10px] text-muted-fg">{hint}</p>
      )}
    </label>
  );
}

function MeasurementGuide({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
        {locale === "ja" ? "採寸ガイド" : "How to measure"}
      </h3>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 120 80" className="h-20 w-32 flex-none" aria-hidden="true">
          <ellipse cx="60" cy="50" rx="45" ry="22" fill="#FCE6D8" />
          <ellipse cx="22" cy="40" rx="14" ry="16" fill="#D97A4E" />
          <circle cx="16" cy="36" r="2" fill="#2d1f1a" />
          <ellipse cx="14" cy="42" rx="3" ry="2" fill="#2d1f1a" />
          <line x1="32" y1="62" x2="32" y2="74" stroke="#6B8E4E" strokeWidth="2" />
          <line x1="32" y1="74" x2="38" y2="74" stroke="#6B8E4E" strokeWidth="2" />
          <text x="42" y="78" fontSize="6" fill="#6B8E4E" fontWeight="bold">CHEST 胸囲</text>
          <line x1="35" y1="32" x2="100" y2="32" stroke="#D97A4E" strokeWidth="2" strokeDasharray="2,2" />
          <text x="55" y="28" fontSize="6" fill="#D97A4E" fontWeight="bold">BACK 背丈</text>
          <line x1="22" y1="22" x2="22" y2="14" stroke="#3F4A4A" strokeWidth="2" />
          <text x="26" y="18" fontSize="6" fill="#3F4A4A" fontWeight="bold">NECK 首回り</text>
        </svg>
        <ul className="space-y-1 text-[11px] leading-relaxed text-muted-fg">
          <li>
            <strong className="text-foreground">
              {locale === "ja" ? "胸囲" : "Chest"}:
            </strong>{" "}
            {locale === "ja"
              ? "前足の付け根の少し後ろ、一番太いところ"
              : "Widest part of body, behind front legs"}
          </li>
          <li>
            <strong className="text-foreground">
              {locale === "ja" ? "背丈" : "Back"}:
            </strong>{" "}
            {locale === "ja" ? "首の根本〜尻尾の付け根" : "Base of neck to tail"}
          </li>
          <li>
            <strong className="text-foreground">
              {locale === "ja" ? "首回り" : "Neck"}:
            </strong>{" "}
            {locale === "ja" ? "首輪を着ける位置" : "Where the collar sits"}
          </li>
        </ul>
      </div>
    </div>
  );
}
