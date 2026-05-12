import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MyDogForm } from "@/components/MyDogForm";
import { MyDogProfileSync } from "@/components/MyDogProfileSync";
import { ProductFeed } from "@/components/ProductFeed";
import { getBreedConcerns } from "@/lib/breed-concerns";
import { breedSizeLabel } from "@/lib/breed-display";
import { breeds, getBreed } from "@/lib/breeds";
import { chipLabel, getConcern, concerns as allConcerns } from "@/lib/concerns";
import { buildFeedItems } from "@/lib/feed";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import {
  StructuredData,
  breadcrumbSchema,
} from "@/lib/structured-data";
import { getDictionary, hasLocale } from "../dictionaries";

/**
 * 「うちの子から探す」 LP。/my-dog?breed=...&concerns=a,b の query 経由で
 * パーソナライズした商品 reel を表示する。
 *
 * URL ベースなので:
 *  - 結果ページが SEO 非対象でも、ブックマーク・SNS シェア URL に堪える
 *  - サーバ側で feed を構築できる (Edge SSR)
 *  - 戻る/進む で履歴ナビが効く
 *
 * localStorage は MyDogProfileSync (client) が片付ける:
 *  - URL に param 有 → localStorage に保存 (次回訪問でも復元)
 *  - URL に param 無 + localStorage に値あり → /my-dog?... へリダイレクト
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
      ? "犬種・体重・悩みからうちの子だけの推薦を作ります。次回も自動で表示。"
      : "Tell us your dog's breed, weight, and concerns — get personalized picks every visit.";
  return {
    title: locale === "ja" ? titleJa : titleEn,
    description: desc,
    alternates: {
      canonical: `/${locale}/my-dog`,
      languages: localizedAlternates("/my-dog"),
    },
    // params 依存で内容が変わるので SEO 非対象
    robots: { index: false, follow: true },
  };
}

export default async function MyDogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/my-dog">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);
  const sp = await searchParams;

  const root = `/${locale}`;

  // クエリパース。配列が来た時は先頭のみ採用。
  const breedId = pickString(sp.breed);
  const concernsParam = pickString(sp.concerns);
  const selectedConcernIds = concernsParam
    ? concernsParam.split(",").filter(Boolean)
    : [];
  const breed = breedId ? getBreed(breedId) : undefined;

  // 推薦 concerns = ユーザー選択 ∪ 犬種関連 (ユーザーが何も選ばなければ犬種任せ)
  const recommendConcernIds = breed
    ? Array.from(new Set([...selectedConcernIds, ...getBreedConcerns(breed)]))
    : selectedConcernIds;

  const hasProfile = Boolean(breed) || selectedConcernIds.length > 0;
  const feedItems = hasProfile
    ? buildFeedItems(locale, recommendConcernIds).slice(0, 120)
    : [];

  // 表示用 concern objects
  const matchedConcernObjs = recommendConcernIds
    .map((cid) => getConcern(cid))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="pb-12">
      <StructuredData
        items={[
          breadcrumbSchema([
            {
              name: locale === "ja" ? "ホーム" : "Home",
              url: absoluteUrl(root),
            },
            {
              name: locale === "ja" ? "うちの子から探す" : "Find products for my dog",
              url: absoluteUrl(`${root}/my-dog`),
            },
          ]),
        ]}
      />

      {/* localStorage <-> URL の双方向同期 (client component) */}
      <MyDogProfileSync
        locale={locale}
        urlBreed={breedId ?? null}
        urlConcerns={selectedConcernIds}
      />

      <section className="border-b border-border bg-gradient-to-b from-primary-soft/30 to-background">
        <div className="mx-auto max-w-3xl px-5 py-7 md:py-10">
          <nav
            aria-label="breadcrumb"
            className="text-[11px] text-muted-fg md:text-xs"
          >
            <Link href={root} className="hover:text-primary">
              {locale === "ja" ? "ホーム" : "Home"}
            </Link>
          </nav>
          <p className="mt-3 inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary md:text-xs">
            {locale === "ja" ? "うちの子から探す" : "Find products for my dog"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
            {locale === "ja"
              ? "うちの子だけの、お買いものリスト"
              : "Personalized picks for your dog"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-fg md:text-base">
            {locale === "ja"
              ? "犬種・体重・気になる悩みを教えてください。次回も自動で表示されます。"
              : "Pick your breed, weight, and concerns. We remember it next time."}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-3xl px-5">
        <MyDogForm
          locale={locale}
          action={`${root}/my-dog`}
          breeds={breeds
            .filter((b) => !b.id.startsWith("unknown-") && b.id !== "mix")
            .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"))}
          concerns={allConcerns}
          initialBreedId={breedId ?? ""}
          initialConcernIds={selectedConcernIds}
        />
      </section>

      {hasProfile && breed && (
        <section className="mx-auto mt-6 max-w-3xl px-5">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-fg">
              {locale === "ja" ? "うちの子プロフィール" : "My dog profile"}
            </p>
            <p className="mt-1 text-lg font-extrabold text-foreground">
              {locale === "ja" ? breed.nameJa : breed.nameEn}
              <span className="ml-2 text-sm font-normal text-muted-fg">
                {breedSizeLabel(breed.size, locale)} · {breed.weightMin}-
                {breed.weightMax}kg
              </span>
            </p>
            {matchedConcernObjs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {matchedConcernObjs.map((c) => (
                  <Link
                    key={c.id}
                    href={`${root}/concerns/${c.id}`}
                    className="inline-flex rounded-full border border-primary/30 bg-primary-soft/30 px-2.5 py-0.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary-soft/60"
                  >
                    {chipLabel(c, locale)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {hasProfile && feedItems.length > 0 ? (
        <ProductFeed
          items={feedItems}
          locale={locale}
          showHeader
          titleJa={
            breed
              ? `${breed.nameJa}に合うアイテム`
              : "選んだ悩みに合うアイテム"
          }
          titleEn={
            breed ? `Picks for ${breed.nameEn}` : "Picks for selected concerns"
          }
        />
      ) : hasProfile ? (
        <section className="mx-auto mt-8 max-w-3xl px-5 text-center">
          <p className="text-sm text-muted-fg md:text-base">
            {locale === "ja"
              ? "条件に合う商品が見つかりませんでした。悩みを増やしてみてください。"
              : "No products matched. Try selecting more concerns."}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
