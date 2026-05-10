/**
 * 最近見た商品 (localStorage) の状態管理ユーティリティ。
 * lib/compare.ts と同じパターン: useSyncExternalStore + window CustomEvent で
 * 同一画面内の他コンポーネント (rail / 詳細ページの tracker) が同期する。
 *
 * 履歴は ID 配列の先頭に最新を unshift、上限 MAX で切り捨て。
 */

const STORAGE_KEY = "wanproblem_recent_ids";
const EVENT = "wanproblem:recent-changed";
const MAX = 12;

const EMPTY: readonly string[] = Object.freeze<string[]>([]);

let cachedRaw: string | null = null;
let cachedIds: readonly string[] = EMPTY;

function read(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    if (!raw) {
      cachedIds = EMPTY;
      return EMPTY;
    }
    const parsed = JSON.parse(raw);
    cachedIds = Array.isArray(parsed)
      ? Object.freeze(
          parsed.filter((x): x is string => typeof x === "string").slice(0, MAX),
        )
      : EMPTY;
    return cachedIds;
  } catch {
    return EMPTY;
  }
}

function write(ids: readonly string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota / private mode は無視。履歴は補助機能。
  }
}

/** 詳細ページ訪問時に呼ぶ。最新が先頭に来る。重複は除去。 */
export function pushRecent(productId: string): void {
  if (!productId) return;
  const current = read();
  const next: readonly string[] = Object.freeze(
    [productId, ...current.filter((id) => id !== productId)].slice(0, MAX),
  );
  write(next);
  cachedIds = next;
  cachedRaw = JSON.stringify(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeRecent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function getRecentSnapshot(): readonly string[] {
  return read();
}

export function getServerRecentSnapshot(): readonly string[] {
  return EMPTY;
}
