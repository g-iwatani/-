"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const MY_DOG_STORAGE_KEY = "wp:my-dog-profile";

export type StoredProfile = {
  breedIds: string[];
  chest?: string;
  back?: string;
  neck?: string;
  concernIds: string[];
};

function isEmpty(p: StoredProfile | null): boolean {
  if (!p) return true;
  return (
    (!p.breedIds || p.breedIds.length === 0) &&
    !p.chest &&
    !p.back &&
    !p.neck &&
    (!p.concernIds || p.concernIds.length === 0)
  );
}

export function readProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MY_DOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    return {
      breedIds: parsed.breedIds ?? [],
      chest: parsed.chest,
      back: parsed.back,
      neck: parsed.neck,
      concernIds: parsed.concernIds ?? [],
    };
  } catch {
    return null;
  }
}

export function writeProfile(p: StoredProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MY_DOG_STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Safari Private mode 等で setItem が throw する。無視。
  }
}

function buildResultsUrl(locale: "ja" | "en", p: StoredProfile): string {
  const params = new URLSearchParams();
  if (p.breedIds.length > 0) params.set("breeds", p.breedIds.join(","));
  if (p.chest) params.set("chest", p.chest);
  if (p.back) params.set("back", p.back);
  if (p.neck) params.set("neck", p.neck);
  if (p.concernIds.length > 0) params.set("concerns", p.concernIds.join(","));
  return `/${locale}/results?${params.toString()}`;
}

/**
 * `/my-dog` に直接来たときに localStorage を読んで `/results?...` に
 * 自動リダイレクトする (= 「うちの子」プロフィールの復元)。
 *
 * - 復元値が無い、または `disabled=true` の場合は何もしない (ウィザード表示)
 * - URL を書き換えるだけなので history stack を汚さない (router.replace)
 */
export function MyDogRestoreRedirect({
  locale,
  disabled,
}: {
  locale: "ja" | "en";
  disabled: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (disabled) return;
    const stored = readProfile();
    if (isEmpty(stored)) return;
    router.replace(buildResultsUrl(locale, stored!));
  }, [locale, disabled, router]);
  return null;
}

/**
 * `/results` 上で URL params を読み取り、localStorage に「うちの子」 として
 * 保存する。これが書かれた直後に /my-dog にアクセスすれば自動復元される。
 *
 * 空 (検索条件無し) の場合は保存しない (= 既存プロファイルを温存)。
 */
export function MyDogProfileSaver({
  breedIds,
  chest,
  back,
  neck,
  concernIds,
}: {
  breedIds: string[];
  chest?: string;
  back?: string;
  neck?: string;
  concernIds: string[];
}) {
  useEffect(() => {
    const next: StoredProfile = { breedIds, chest, back, neck, concernIds };
    if (isEmpty(next)) return;
    writeProfile(next);
  }, [breedIds, chest, back, neck, concernIds]);
  return null;
}
