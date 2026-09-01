/**
 * サイト全体で使うメタ情報。
 * 本番URLは wrangler.jsonc の vars.NEXT_PUBLIC_SITE_URL で上書きする。
 *
 * FALLBACK は wrangler.jsonc / .env 等の env が見えない環境 (一部のローカル
 * テスト) で使われる安全網。本番デプロイ後はカスタムドメインを向ける。
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
  lastUpdated: { year: 2026, month: 9 },
  /**
   * 季節キャンペーンバナー。現在月 (1-12) に該当するエントリを SeasonalBanner が
   * ピックして表示する。複数エントリが該当する場合は配列の先頭優先。空配列で
   * バナー機能をオフにできる。
   */
  seasonalCampaigns: [
    {
      months: [4, 5, 6, 7, 8],
      icon: "☀️",
      titleJa: "夏の暑さ対策、もう始める時期",
      titleEn: "Summer cooling — start prepping now",
      leadJa:
        "アスファルト 60℃ の前に。クールベスト・冷却マット・水飲みを揃えて、真夏でも 20-30 分の散歩を継続できる装備に。",
      leadEn:
        "Before the asphalt hits 60°C. Cooling vests, mats, and water bottles for safe summer walks.",
      href: "/guides/summer-cooling-guide",
      ctaJa: "夏グッズ選び方ガイドへ",
      ctaEn: "Read summer guide",
      tone: "warm" as const,
    },
    {
      months: [10, 11, 12, 1, 2],
      icon: "❄️",
      titleJa: "冬の散歩、寒さ対策できてますか?",
      titleEn: "Winter walks — is your dog dressed for it?",
      leadJa:
        "寒さで散歩拒否が増える前に。シニア犬・短毛犬・小型犬は保温ジャケット + 肉球ワックスが鉄板。",
      leadEn:
        "Before the cold sidelines your walks. Insulated jackets and paw balm are essentials for seniors, short-coated and small breeds.",
      href: "/guides/senior-dog-care-guide",
      ctaJa: "冬の散歩ガイド",
      ctaEn: "Winter walk guide",
      tone: "cool" as const,
    },
    {
      months: [3, 9],
      icon: "🐶",
      titleJa: "新入りの子犬を迎える季節",
      titleEn: "New puppy season",
      leadJa:
        "ペットショップ・ブリーダーから迎える前に揃える必需品リスト。ケージ・トイレ・ハーネスから初週の安心グッズまで。",
      leadEn:
        "The essentials checklist for the first week with a new puppy.",
      href: "/guides/puppy-essentials-guide",
      ctaJa: "子犬期の必需品ガイド",
      ctaEn: "Puppy essentials guide",
      tone: "fresh" as const,
    },
  ],
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
