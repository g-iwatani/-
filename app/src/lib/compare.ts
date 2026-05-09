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

/**
 * useSyncExternalStore 用の subscribe / getSnapshot ヘルパ。
 * 以前は useEffect + useState で localStorage を読んでいたが、
 * react-hooks/set-state-in-effect lint と「cascading renders」 警告に該当する
 * ため、外部ストア統合の標準 API に切替えた。
 *
 * snapshot は配列の参照同一性 (referential equality) を維持するためキャッシュ
 * する: localStorage の生文字列が変わらない限り、同じ配列を返す。
 */
let cachedRaw: string | null = null;
let cachedIds: readonly string[] = Object.freeze<string[]>([]);

export function subscribeCompare(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(COMPARE_EVENT, callback);
  return () => window.removeEventListener(COMPARE_EVENT, callback);
}

export function getCompareSnapshot(): readonly string[] {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  cachedIds = Object.freeze(readCompareIds());
  return cachedIds;
}

const EMPTY_SNAPSHOT: readonly string[] = Object.freeze<string[]>([]);

export function getServerCompareSnapshot(): readonly string[] {
  return EMPTY_SNAPSHOT;
}
