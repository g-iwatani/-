/**
 * 軽量 toast 通知。CompareToggle, お気に入り, 設定保存 等の「小さなアクション
 * のフィードバック」を提供する。
 *
 * 実装: window CustomEvent で疎結合。dispatch 側はライブラリ依存ゼロ、
 * 表示は ToastContainer (client component) が listen して描画する。
 *
 * メッセージは text のみ (HTML 不可)。type は色で UI 上区別:
 *   - "info"    : 中立 (例: 比較に追加)
 *   - "success" : ポジティブ (例: 設定を保存)
 *   - "warning" : 注意 (例: 上限到達)
 */

export type ToastType = "info" | "success" | "warning";

export type ToastDetail = {
  message: string;
  type: ToastType;
  /** ms。0 で永続 (要手動クローズ)。デフォルト 2200 ms。 */
  duration?: number;
};

export const TOAST_EVENT = "wanproblem:toast";

export function showToast(detail: ToastDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }),
  );
}
