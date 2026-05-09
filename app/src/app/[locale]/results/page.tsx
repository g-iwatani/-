import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import { SideConcernsNav } from "@/components/SideConcernsNav";
import { breeds, getBreed } from "@/lib/breeds";
import { concerns, getConcern } from "@/lib/concerns";
import { matchProducts } from "@/lib/matching";
import { listBrands, visibleProducts } from "@/lib/products";
import { absoluteUrl, localizedAlternates } from "@/lib/site";
import { defaultLocale, getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(locale) ? locale : defaultLocale;
  const sp = (await searchParams) ?? {};
  const dict = await getDictionary(safeLocale);

  // 選択された concerns / breeds をタイトルに織り込んで動的最適化。
  // SEO 上、悩みキーワードを含む各 URL がそれぞれ別ページとしてインデックスされる。
  const concernIds = parseIds(sp.concerns);
  const breedIds = parseIds(sp.breeds);
  const concernLabels = concernIds
    .map((id) => getConcern(id))
    .filter((c) => Boolean(c))
    .map((c) => (safeLocale === "ja" ? c!.labelJa : c!.labelEn))
    .slice(0, 3);
  const breedLabels = breedIds
    .map((id) => getBreed(id))
    .filter((b) => Boolean(b))
    .map((b) => (safeLocale === "ja" ? b!.nameJa : b!.nameEn))
    .slice(0, 2);
  const titleParts: string[] = [];
  if (concernLabels.length > 0) titleParts.push(concernLabels.join("・"));
  if (breedLabels.length > 0) titleParts.push(breedLabels.join("・"));
  const dynamicTitle =
    titleParts.length > 0
      ? `${titleParts.join(" / ")} ${safeLocale === "ja" ? "に合う商品検索結果" : "matching products"}`
      : dict.results.title;

  const queryString = new URLSearchParams();
  if (concernIds.length > 0) queryString.set("concerns", concernIds.join(","));
  if (breedIds.length > 0) queryString.set("breeds", breedIds.join(","));
  const path = `/${safeLocale}/results${queryString.toString() ? `?${queryString.toString()}` : ""}`;

  return {
    title: dynamicTitle,
    description:
      safeLocale === "ja"
        ? `${concernLabels.join("・") || "犬の悩み"}に合う犬用品を、Amazon・楽天・公式ブランドから比較してご紹介。`
        : `Dog products matched to ${concernLabels.join(", ") || "your dog's needs"}, compared across Amazon and Rakuten.`,
    alternates: {
      canonical: path,
      languages: localizedAlternates("/results"),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: dynamicTitle,
    },
    // 検索結果ページは多数の URL バリエーションを生む。代表 URL のみ index、それ以外
    // (連結ソート・絞り込み等) は検索エンジンが自動的に去ってくれるよう robots は緩く。
    robots:
      concernIds.length === 0 && breedIds.length === 0
        ? { index: true, follow: true }
        : { index: true, follow: true },
  };
}

function parseIds(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ResultsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const sp = (await searchParams) ?? {};

  const breedIds = parseIds(sp.breeds);
  const concernIds = parseIds(sp.concerns);
  const chest = parseNumber(sp.chest);
  const back = parseNumber(sp.back);
  const neck = parseNumber(sp.neck);

  const resolvedBreeds = breedIds
    .map((id) => getBreed(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const profile = {
    breedIds,
    chest,
    back,
    neck,
    concerns: concernIds,
  };

  const matches = matchProducts(visibleProducts, profile, resolvedBreeds);

  const selectedConcerns = concernIds
    .map((id) => getConcern(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const breedNames = resolvedBreeds.map((b) =>
    locale === "ja" ? b.nameJa : b.nameEn,
  );

  // 採寸が指定されてないが犬種から推定できる場合、サマリで表示
  const summary = {
    chest:
      chest ??
      (resolvedBreeds.length > 0
        ? Math.round(
            resolvedBreeds.reduce((s, b) => s + b.chestAvg, 0) /
              resolvedBreeds.length,
          )
        : undefined),
    back:
      back ??
      (resolvedBreeds.length > 0
        ? Math.round(
            resolvedBreeds.reduce((s, b) => s + b.backAvg, 0) /
              resolvedBreeds.length,
          )
        : undefined),
    neck:
      neck ??
      (resolvedBreeds.length > 0
        ? Math.round(
            resolvedBreeds.reduce((s, b) => s + b.neckAvg, 0) /
              resolvedBreeds.length,
          )
        : undefined),
    breedNames,
  };

  // サイドナビにクリック先 URL の base params として渡す。
  // breeds / chest / back / neck はそのまま引き継ぎ、concerns だけ書き換える。
  const inheritParams = new URLSearchParams();
  if (breedIds.length > 0) inheritParams.set("breeds", breedIds.join(","));
  if (chest != null) inheritParams.set("chest", String(chest));
  if (back != null) inheritParams.set("back", String(back));
  if (neck != null) inheritParams.set("neck", String(neck));

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-[260px_1fr]">
      <aside className="hidden pt-5 lg:block">
        <div className="sticky top-20">
          <SideConcernsNav
            locale={locale}
            dict={dict}
            activeConcernIds={concernIds}
            inheritParams={inheritParams}
          />
        </div>
      </aside>
      <main className="min-w-0">
        <ResultsView
          locale={locale}
          dict={dict}
          initialMatches={matches}
          selectedConcerns={selectedConcerns}
          brands={listBrands()}
          measurementsSummary={summary}
        />
      </main>
    </div>
  );
}

// breeds and concerns referenced for typing only
void breeds;
void concerns;
