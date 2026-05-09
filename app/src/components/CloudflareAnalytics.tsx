/**
 * Cloudflare Web Analytics の beacon を全ページに注入する。
 *
 * - cookie 不要・GDPR/個情法対応・無料・cookie 同意バナー不要
 * - クライアント側 IP ベース集計のみで個人特定情報は送らない
 * - token が未設定の環境 (ローカル開発、preview ブランチ) では何もレンダーしない
 *
 * 使い方: ユーザーが Cloudflare ダッシュボードで「Web Analytics → サイト追加」
 * → token をコピー → wrangler.jsonc の vars に
 *   CLOUDFLARE_ANALYTICS_TOKEN: "xxxxxxxxxxxxxxxxxxxx"
 * を追記して deploy。token は公開可 (HTML に埋め込まれる前提のシークレットでない値)。
 */
export function CloudflareAnalytics() {
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
