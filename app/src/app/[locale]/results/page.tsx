import { notFound } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import { SideConcernsNav } from "@/components/SideConcernsNav";
import { breeds, getBreed } from "@/lib/breeds";
import { concerns, getConcern } from "@/lib/concerns";
import { matchProducts } from "@/lib/matching";
import { listBrands, visibleProducts } from "@/lib/products";
import { getDictionary, hasLocale } from "../dictionaries";

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
