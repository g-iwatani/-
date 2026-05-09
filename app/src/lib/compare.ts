/**
 * 「比較リスト」 状態管理ユーティリティ。
 * CompareToggle と CompareStickyBar / /compare ページが共通利用する。
 *
 * 状態は localStorage に永続化。インスタンス間の同期は window イベント
 * (COMPARE_EVENT) で行う — 比較リストの状態だけのために Redux/Zustand 等の
 * 状態ライブラリを引っ張ってくるのはオーバーキル。
 */

export const STORAGE_KEY = "wanproblem_compare_ids";
export const COMPARE_EVENT = "wanproblem:compare-changed";
/** mybest 流: 同時 4 商品まで。それ以上はスペック行の幅が苦しい。 */
export const COMPARE_MAX = 4;

export function readCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((x): x is string => typeof x === "string")
          .slice(0, COMPARE_MAX)
      : [];
  } catch {
    return [];
  }
}

export function writeCompareIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota / private mode は黙って無視。比較は補助機能。
  }
}

export function clearCompareIds(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

export function dispatchCompareChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMPARE_EVENT));
}
