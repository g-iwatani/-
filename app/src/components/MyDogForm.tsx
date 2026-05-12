"use client";

import { useMemo, useState } from "react";
import { type Concern, chipLabel } from "@/lib/concerns";
import { type Breed } from "@/lib/breeds";

type Props = {
  locale: "ja" | "en";
  action: string;
  breeds: Breed[];
  concerns: Concern[];
  initialBreedId: string;
  initialConcernIds: string[];
};

/**
 * 「うちの子」 プロフィール入力フォーム。
 *
 * - 通常の <form method="get"> で `${action}?breed=...&concerns=a,b` に飛ばす
 *   → JS 無効でも動く / 戻る/進む も自然
 * - concerns は checkbox を name=concerns で重ねず、hidden field に CSV で
 *   詰める (Next.js searchParams が配列を文字列でしか扱わない局面が多いため)
 * - 犬種は datalist で typeahead を効かせる (200+ 件あるので必須)
 */
export function MyDogForm({
  locale,
  action,
  breeds,
  concerns,
  initialBreedId,
  initialConcernIds,
}: Props) {
  const [breedId, setBreedId] = useState(initialBreedId);
  const [selectedConcerns, setSelectedConcerns] = useState<Set<string>>(
    new Set(initialConcernIds),
  );

  const breedLookup = useMemo(() => {
    const m = new Map<string, Breed>();
    for (const b of breeds) m.set(locale === "ja" ? b.nameJa : b.nameEn, b);
    return m;
  }, [breeds, locale]);

  const toggleConcern = (id: string) => {
    setSelectedConcerns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 入力されたテキストから breed.id を逆引き
  const handleBreedInput = (value: string) => {
    const matched = breedLookup.get(value);
    setBreedId(matched ? matched.id : "");
  };

  return (
    <form
      method="get"
      action={action}
      className="rounded-2xl border border-border bg-card p-4 md:p-5"
    >
      <div>
        <label
          htmlFor="my-dog-breed"
          className="text-xs font-bold uppercase tracking-wide text-muted-fg"
        >
          {locale === "ja" ? "犬種" : "Breed"}
        </label>
        <input
          id="my-dog-breed"
          list="my-dog-breed-list"
          defaultValue={
            initialBreedId
              ? (breeds.find((b) => b.id === initialBreedId)?.[
                  locale === "ja" ? "nameJa" : "nameEn"
                ] ?? "")
              : ""
          }
          placeholder={
            locale === "ja" ? "例: 柴犬、トイプードル" : "e.g. Shiba Inu"
          }
          onChange={(e) => handleBreedInput(e.target.value)}
          className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-fg focus:border-primary focus:outline-none"
          autoComplete="off"
        />
        <datalist id="my-dog-breed-list">
          {breeds.map((b) => (
            <option
              key={b.id}
              value={locale === "ja" ? b.nameJa : b.nameEn}
            />
          ))}
        </datalist>
        {/* 実体: breed.id を URL に乗せる */}
        <input type="hidden" name="breed" value={breedId} />
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-bold uppercase tracking-wide text-muted-fg">
          {locale === "ja" ? "気になる悩み (複数選択可)" : "Concerns (multi-select)"}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {concerns.map((c) => {
            const active = selectedConcerns.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleConcern(c.id)}
                aria-pressed={active}
                className={`inline-flex rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {chipLabel(c, locale)}
              </button>
            );
          })}
        </div>
        <input
          type="hidden"
          name="concerns"
          value={[...selectedConcerns].join(",")}
        />
      </fieldset>

      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg transition-opacity hover:opacity-90"
      >
        {locale === "ja" ? "うちの子に合う商品を見る" : "Show picks for my dog"}
      </button>
    </form>
  );
}
