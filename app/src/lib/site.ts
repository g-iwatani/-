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
