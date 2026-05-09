/**
 * サイト全体で使うメタ情報。
 * 本番URLは Netlify の環境変数 NEXT_PUBLIC_SITE_URL で上書きする想定。
 * 例: NEXT_PUBLIC_SITE_URL=https://wanproblem.com
 */

const FALLBACK_URL = "https://wanproblem.com";

function rawUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && /^https?:\/\//.test(env)) return env;
  if (process.env.URL) return process.env.URL; // Netlify 提供
  if (process.env.DEPLOY_PRIME_URL) return process.env.DEPLOY_PRIME_URL;
  return FALLBACK_URL;
}

export const siteUrl = rawUrl().replace(/\/$/, "");

export const site = {
  url: siteUrl,
  nameJa: "わんプロブレム",
  nameEn: "WanProblem",
  taglineJa: "ワンちゃんの困りごとに、世界中のブランドから答えを。",
  taglineEn: "Match your dog's troubles to the right gear from anywhere.",
  twitter: "@wanproblem",
  defaultLocale: "ja" as const,
  locales: ["ja", "en"] as const,
  /**
   * 商品データ最終更新月。一覧/詳細ページに「YYYY年M月最新版」として
   * 表示し SEO + 信頼シグナルを稼ぐ (mybest 方式)。
   * 商品 CSV 取込やキュレーション差し込みのたびに手動でバンプ。
   */
  lastUpdated: { year: 2026, month: 5 },
  /**
   * トップページ Hero 直下に表示する「今月の編集部 1 押し」 商品。
   * 月次で編集部が手動で入れ替える想定。reason* は商品ページの descJa
   * とは別に「なぜ選んだか」 を 1〜2 文で書く。
   */
  featured: {
    productId: "ruffwear-front-range",
    reasonJa:
      "前胸 D 環で引っ張りグセを矯正でき、サイズ展開・色展開ともに豊富。日本でも夜散歩に効く反射材付き。迷ったらこれ。",
    reasonEn:
      "A front-clip D-ring stops pulling, sizing and colorways are deep, and reflective trim covers night walks. Default-pick harness for most setups.",
  },
};

export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${siteUrl}${path}`;
}

export function localizedAlternates(path: string) {
  // path には "/" や "/results" 等の locale を含まないパスを渡す
  return Object.fromEntries(
    site.locales.map((l) => [l, absoluteUrl(`/${l}${path === "/" ? "" : path}`)]),
  );
}
