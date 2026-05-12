import type { BreedSize } from "./breeds";

const sizeLabels: Record<BreedSize, { ja: string; en: string }> = {
  tiny: { ja: "超小型犬", en: "Toy" },
  small: { ja: "小型犬", en: "Small" },
  medium: { ja: "中型犬", en: "Medium" },
  large: { ja: "大型犬", en: "Large" },
  giant: { ja: "超大型犬", en: "Giant" },
};

export function breedSizeLabel(size: BreedSize, locale: "ja" | "en"): string {
  return sizeLabels[size][locale];
}
