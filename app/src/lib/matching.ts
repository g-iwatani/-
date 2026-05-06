import type { Breed } from "./breeds";
import type { Product, ProductSize } from "./products";

export type DogProfile = {
  breedIds: string[]; // 0-2 IDs (mix=2)
  weight?: number;
  chest?: number;
  back?: number;
  neck?: number;
  concerns: string[];
};

export type SizeMatch = {
  size: ProductSize;
  fitScore: number; // 0-100
  reason: string;
};

export type ProductMatch = {
  product: Product;
  bestSize?: SizeMatch;
  concernHits: string[];
  concernMatchRatio: number; // 0-1
  popularityScore: number; // product.popularity normalized to 0-100
  totalScore: number; // 0-100, used for default sort
};

const ANY_RANGE = 200;

function midpoint(min: number, max: number): number {
  return (min + max) / 2;
}

function fitInRange(value: number, min: number, max: number): number {
  if (max <= min) return 100;
  if (value < min) {
    const gap = min - value;
    const span = max - min;
    return Math.max(0, 100 - (gap / Math.max(span, 1)) * 100);
  }
  if (value > max) {
    const gap = value - max;
    const span = max - min;
    return Math.max(0, 100 - (gap / Math.max(span, 1)) * 100);
  }
  // 中央付近で 100、端で 70 程度になるカーブ
  const center = midpoint(min, max);
  const distance = Math.abs(value - center);
  const halfSpan = (max - min) / 2 || 1;
  const ratio = distance / halfSpan;
  return Math.round(100 - ratio * 30);
}

export function evaluateSizeMatch(
  size: ProductSize,
  measurements: Pick<DogProfile, "chest" | "back" | "neck">,
): { score: number; reason: string } {
  const scores: number[] = [];
  const reasons: string[] = [];

  if (measurements.chest != null && size.chestMax < ANY_RANGE) {
    const score = fitInRange(measurements.chest, size.chestMin, size.chestMax);
    scores.push(score);
    if (score < 60)
      reasons.push(
        `胸囲が${measurements.chest}cm(範囲 ${size.chestMin}-${size.chestMax}cm)`,
      );
  }
  if (measurements.back != null && size.backMax < ANY_RANGE) {
    const score = fitInRange(measurements.back, size.backMin, size.backMax);
    scores.push(score);
  }
  if (measurements.neck != null && size.neckMax < ANY_RANGE) {
    const score = fitInRange(measurements.neck, size.neckMin, size.neckMax);
    scores.push(score);
  }

  if (scores.length === 0) {
    return { score: 100, reason: "サイズ無関係" };
  }

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return {
    score: avg,
    reason: reasons.join(" / ") || "採寸が範囲内",
  };
}

export function pickBestSize(
  product: Product,
  measurements: Pick<DogProfile, "chest" | "back" | "neck">,
): SizeMatch | undefined {
  if (product.sizes.length === 0) return undefined;
  let best: SizeMatch | undefined;
  for (const size of product.sizes) {
    const { score, reason } = evaluateSizeMatch(size, measurements);
    if (!best || score > best.fitScore) {
      best = { size, fitScore: score, reason };
    }
  }
  return best;
}

/**
 * 犬種から平均的な採寸値を取得(MIX犬の場合は2犬種の平均)
 */
export function measurementsFromBreeds(breeds: Breed[]): {
  chest: number;
  back: number;
  neck: number;
  weight: number;
} | null {
  const valid = breeds.filter((b) => b.id !== "mix" && b.chestAvg > 0);
  if (valid.length === 0) return null;
  const chest = valid.reduce((s, b) => s + b.chestAvg, 0) / valid.length;
  const back = valid.reduce((s, b) => s + b.backAvg, 0) / valid.length;
  const neck = valid.reduce((s, b) => s + b.neckAvg, 0) / valid.length;
  const weight =
    valid.reduce((s, b) => s + (b.weightMin + b.weightMax) / 2, 0) /
    valid.length;
  return {
    chest: Math.round(chest),
    back: Math.round(back),
    neck: Math.round(neck),
    weight: Math.round(weight * 10) / 10,
  };
}

export function matchProducts(
  products: Product[],
  profile: DogProfile,
  resolvedBreeds: Breed[],
): ProductMatch[] {
  // 計測値を確定(profileに直接入っていれば優先、なければ犬種から)
  const inferred = measurementsFromBreeds(resolvedBreeds);
  const measurements = {
    chest: profile.chest ?? inferred?.chest,
    back: profile.back ?? inferred?.back,
    neck: profile.neck ?? inferred?.neck,
  };

  const concernSet = new Set(profile.concerns);

  const matches: ProductMatch[] = products.map((product) => {
    const bestSize =
      measurements.chest != null
        ? pickBestSize(product, measurements)
        : undefined;

    const concernHits = product.concerns.filter((c) => concernSet.has(c));
    const concernMatchRatio =
      concernSet.size > 0 ? concernHits.length / concernSet.size : 0;

    const popularityScore = product.popularity;

    const sizeScore = bestSize?.fitScore ?? 50;
    const concernScore = concernSet.size > 0 ? concernMatchRatio * 100 : 50;

    const totalScore = Math.round(
      sizeScore * 0.35 + concernScore * 0.45 + popularityScore * 0.2,
    );

    return {
      product,
      bestSize,
      concernHits,
      concernMatchRatio,
      popularityScore,
      totalScore,
    };
  });

  return matches.sort((a, b) => b.totalScore - a.totalScore);
}

export type SortKey = "popular" | "match" | "fit" | "price_asc" | "price_desc";

function lowestPrice(p: Product): number {
  return Math.min(...p.buyOptions.map((b) => b.priceJpy));
}

export function sortMatches(
  matches: ProductMatch[],
  sortKey: SortKey,
): ProductMatch[] {
  const sorted = [...matches];
  switch (sortKey) {
    case "popular":
      return sorted.sort((a, b) => b.popularityScore - a.popularityScore);
    case "match":
      return sorted.sort(
        (a, b) =>
          b.concernMatchRatio - a.concernMatchRatio ||
          b.totalScore - a.totalScore,
      );
    case "fit":
      return sorted.sort(
        (a, b) =>
          (b.bestSize?.fitScore ?? 0) - (a.bestSize?.fitScore ?? 0) ||
          b.totalScore - a.totalScore,
      );
    case "price_asc":
      return sorted.sort(
        (a, b) => lowestPrice(a.product) - lowestPrice(b.product),
      );
    case "price_desc":
      return sorted.sort(
        (a, b) => lowestPrice(b.product) - lowestPrice(a.product),
      );
    default:
      return sorted;
  }
}
