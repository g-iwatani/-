import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MyDogRestoreRedirect } from "@/components/MyDogProfileSync";
import { SearchFlow } from "@/components/SearchFlow";
import { breeds } from "@/lib/breeds";
import { concerns } from "@/lib/concerns";
import { localizedAlternates } from "@/lib/site";
import { getDictionary, hasLocale } from "../dictionaries";

/**
 * 「うちの子から探す」 ページ。実体は SearchFlow ウィザードのホスト + 復元動線。
 *
 * 動作:
 *  - localStorage に既存プロフィール有 + URL に param 無し + ?edit=1 なし
 *    → `/results?...` に自動リダイレクト (MyDogRestoreRedirect)
 *  - URL に param あり (旧 /search 互換、BreedChip 等) → 受け取って SearchFlow
 *    の initial に流す。復元リダイレクトは抑制。
 *  - ?edit=1 → 復元抑制 (リセット用)、ウィザード表示
 *
 * 旧 /search との重複機能を解消するため、/search は next.config.redirects で
 * /my-dog に 308 集約している。
 */

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/my-dog">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const titleJa = "うちの子から探す — わんプロブレム";
  const titleEn = "Find products for my dog — WanProblem";
  const desc =
    locale === "ja"
      ? "犬種・採寸・悩みからうちの子だけの推薦を作ります。次回も自動で表示。"
      : "Pick breed, measurements, and concerns — we remember it next time.";
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: desc,
    alternates: {
      canonical: `/${locale}/my-dog`,
      languages: localizedAlternates("/my-dog"),
    },
    robots: { index: false, follow: true },
  };
}

export default async function MyDogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/my-dog">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const sp = await searchParams;

  const root = `/${locale}`;
  const editMode = pickString(sp.edit) === "1";

  // URL から初期値を受け取る (旧 /search?breed= 互換 / BreedChip 動線 / 復元 URL)。
  // - breeds (plural CSV) + 旧 breed (singular) どちらも受ける
  // - concerns CSV, chest/back/neck 数値文字列
  const breedIds = mergeBreedParams(
    pickString(sp.breeds),
    pickString(sp.breed),
  );
  const concernIds = parseCsv(pickString(sp.concerns));
  const chest = pickString(sp.chest);
  const back = pickString(sp.back);
  const neck = pickString(sp.neck);

  const hasUrlInitial =
    breedIds.length > 0 ||
    concernIds.length > 0 ||
    Boolean(chest || back || neck);

  return (
    <div className="pb-12">
      {/* edit=1 / URL に値あり のときは localStorage 復元しない (ウィザード優先) */}
      <MyDogRestoreRedirect
        locale={locale}
        disabled={editMode || hasUrlInitial}
      />

      <header className="mx-auto max-w-3xl px-5 pt-10 pb-2">
        <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary md:text-xs">
          {locale === "ja" ? "うちの子から探す" : "Find products for my dog"}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {locale === "ja"
            ? "うちの子だけの、お買いものリスト"
            : "Personalized picks for your dog"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
          {locale === "ja"
            ? "犬種・採寸・気になる悩みを入力すると、次回も自動で表示されます。"
            : "Pick your breed, sizing, and concerns. We remember it next time."}
        </p>
        {editMode && (
          <p className="mt-3 text-xs text-muted-fg">
            <Link href={`${root}/my-dog`} className="underline">
              {locale === "ja"
                ? "← 前回の条件で結果を見る"
                : "← View previous picks"}
            </Link>
          </p>
        )}
      </header>

      <SearchFlow
        locale={locale}
        dict={dict}
        breeds={breeds.filter((b) => b.id !== "mix")}
        concerns={concerns}
        initial={
          hasUrlInitial
            ? { breedIds, chest, back, neck, concernIds }
            : undefined
        }
      />
    </div>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseCsv(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeBreedParams(
  plural: string | undefined,
  legacySingular: string | undefined,
): string[] {
  const out = parseCsv(plural);
  if (legacySingular && !out.includes(legacySingular)) {
    out.push(legacySingular);
  }
  return out;
}
