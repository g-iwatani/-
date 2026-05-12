"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "wp:my-dog-profile";

type StoredProfile = {
  breed: string | null;
  concerns: string[];
};

type Props = {
  locale: "ja" | "en";
  urlBreed: string | null;
  urlConcerns: string[];
};

/**
 * URL ↔ localStorage の双方向同期。
 *
 * パターン:
 *  - URL に param あり → localStorage 上書き保存 (次回訪問でも復元)
 *  - URL に param 無し + localStorage に値あり → URL を書き換えて自動表示
 *  - 両方無し → 何もしない (フォーム入力待ち)
 *
 * router.replace を使うので history stack を汚さない。
 */
export function MyDogProfileSync({ locale, urlBreed, urlConcerns }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasUrlData = Boolean(urlBreed) || urlConcerns.length > 0;

    if (hasUrlData) {
      const profile: StoredProfile = {
        breed: urlBreed,
        concerns: urlConcerns,
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch {
        // Safari Private mode 等で setItem が throw する。無視。
      }
      return;
    }

    // URL に何も無い → localStorage から復元してリダイレクト
    let stored: StoredProfile | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as StoredProfile;
    } catch {
      return;
    }
    if (!stored) return;
    if (!stored.breed && (!stored.concerns || stored.concerns.length === 0)) {
      return;
    }
    const params = new URLSearchParams();
    if (stored.breed) params.set("breed", stored.breed);
    if (stored.concerns && stored.concerns.length > 0) {
      params.set("concerns", stored.concerns.join(","));
    }
    router.replace(`/${locale}/my-dog?${params.toString()}`);
  }, [locale, urlBreed, urlConcerns, router]);

  return null;
}
