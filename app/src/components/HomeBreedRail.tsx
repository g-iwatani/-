import { BreedChip } from "@/components/BreedChip";
import { Rail, RailItem } from "@/components/Rail";
import { getPopularBreeds } from "@/lib/breeds";
import type { Locale } from "@/app/[locale]/dictionaries";

/**
 * TOP 専用「うちの子から探す」 rail。
 *
 * `popular: true` フラグ付き犬種を `getPopularBreeds()` で全件取得し、
 * 横スクロール rail として並べる (BreedChip は Phase 7C で犬種シルエット化済み)。
 */
export function HomeBreedRail({ locale }: { locale: Locale }) {
  const items = getPopularBreeds();
  if (items.length === 0) return null;
  const root = `/${locale}`;
  return (
    <Rail
      kicker="01 · BREEDS"
      title={locale === "ja" ? "うちの子から探す" : "Browse by breed"}
      titleEn={locale === "ja" ? "Browse by breed" : undefined}
      subtitle={
        locale === "ja"
          ? "犬種ごとの体格・運動量・被毛タイプに合わせて、適合する商品だけが並びます。"
          : "Products filtered by size, activity, and coat for your breed."
      }
      viewAllHref={`${root}/breeds`}
      viewAllLabel={locale === "ja" ? "全 260 犬種を見る" : "All 260 breeds"}
    >
      {items.map((b) => (
        <RailItem key={b.id}>
          <BreedChip breed={b} locale={locale} />
        </RailItem>
      ))}
    </Rail>
  );
}
