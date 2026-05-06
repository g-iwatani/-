"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import type { Breed } from "@/lib/breeds";
import type { Concern, ConcernCategory } from "@/lib/concerns";
import { format } from "@/lib/format";

type Props = {
  locale: Locale;
  dict: Dictionary;
  breeds: Breed[];
  concerns: Concern[];
};

type Step = 0 | 1 | 2;

const concernCategoryOrder: ConcernCategory[] = [
  "size",
  "season",
  "behavior",
  "purpose",
];

const concernCategoryLabel: Record<
  ConcernCategory,
  { ja: string; en: string }
> = {
  size: { ja: "サイズ・体型", en: "Size & fit" },
  season: { ja: "環境・季節", en: "Season & weather" },
  behavior: { ja: "行動・性格", en: "Behavior" },
  purpose: { ja: "用途・場面", en: "Purpose & occasion" },
};

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

export function SearchFlow({ locale, dict, breeds, concerns }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [breedQuery, setBreedQuery] = useState("");
  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>([]);
  const [chest, setChest] = useState<string>("");
  const [back, setBack] = useState<string>("");
  const [neck, setNeck] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const filteredBreeds = useMemo(() => {
    const q = breedQuery.trim().toLowerCase();
    if (!q) return breeds;
    return breeds.filter((b) => {
      return (
        b.nameJa.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [breeds, breedQuery]);

  function toggleBreed(id: string) {
    setSelectedBreedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return [prev[1]!, id]; // 最大2つ、古いほうを捨てる
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
    startTransition(() =>
      router.push(`/${locale}/results?${params.toString()}`),
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
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-16">
      <div className="rounded-3xl border border-card-border bg-card p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between gap-4">
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

        {step === 0 && (
          <section className="space-y-6">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_breed.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_breed.subtitle}
              </p>
            </header>

            <input
              type="search"
              value={breedQuery}
              onChange={(e) => setBreedQuery(e.target.value)}
              placeholder={dict.search.step_breed.search_placeholder}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            <p className="text-xs text-muted-fg">
              {dict.search.step_breed.mix_hint}
              {selectedBreedIds.length > 0 && (
                <span className="ml-2 font-semibold text-primary">
                  ({selectedBreedIds.length}/2)
                </span>
              )}
            </p>

            <div className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredBreeds.map((breed) => {
                const selected = selectedBreedIds.includes(breed.id);
                const name = locale === "ja" ? breed.nameJa : breed.nameEn;
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
                    <span className="font-semibold">{name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-fg">
                      {breed.size}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-6">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_size.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_size.subtitle}
              </p>
            </header>

            {selectedBreedIds.length > 0 && (
              <button
                type="button"
                onClick={applyBreedAverage}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-fg transition-colors hover:border-primary hover:text-primary"
              >
                ⤴ {dict.search.step_size.use_average}
              </button>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label={dict.search.step_size.weight_label}
                unit={dict.search.step_size.weight_unit}
                value={weight}
                onChange={setWeight}
              />
              <NumberField
                label={dict.search.step_size.chest_label}
                unit={dict.search.step_size.size_unit}
                value={chest}
                onChange={setChest}
              />
              <NumberField
                label={dict.search.step_size.back_label}
                unit={dict.search.step_size.size_unit}
                value={back}
                onChange={setBack}
              />
              <NumberField
                label={dict.search.step_size.neck_label}
                unit={dict.search.step_size.size_unit}
                value={neck}
                onChange={setNeck}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <header>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {dict.search.step_concerns.title}
              </h2>
              <p className="mt-1 text-sm text-muted-fg">
                {dict.search.step_concerns.subtitle}
              </p>
            </header>

            {concernCategoryOrder.map((cat) => {
              const items = concerns.filter((c) => c.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-fg">
                    {locale === "ja"
                      ? concernCategoryLabel[cat].ja
                      : concernCategoryLabel[cat].en}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((concern) => {
                      const selected = selectedConcerns.includes(concern.id);
                      const label =
                        locale === "ja" ? concern.labelJa : concern.labelEn;
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
                          <span className="text-xl">{icon}</span>
                          <span
                            className={`text-sm font-semibold leading-snug ${
                              selected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={back_}
            disabled={step === 0}
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-fg transition-colors hover:text-foreground disabled:opacity-30"
          >
            ← {dict.search.back}
          </button>

          <div className="flex items-center gap-2">
            {step < 2 && (
              <button
                type="button"
                onClick={() => {
                  setStep((step + 1) as Step);
                }}
                className="rounded-full px-4 py-2 text-xs font-semibold text-muted-fg transition-colors hover:text-foreground"
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

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
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
    </label>
  );
}
