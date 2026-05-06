export type BreedSize = "tiny" | "small" | "medium" | "large" | "giant";

export type Breed = {
  id: string;
  nameJa: string;
  nameEn: string;
  size: BreedSize;
  weightMin: number;
  weightMax: number;
  chestAvg: number;
  backAvg: number;
  neckAvg: number;
  popular?: boolean;
};

export const breeds: Breed[] = [
  // 小型 (tiny / small)
  {
    id: "chihuahua",
    nameJa: "チワワ",
    nameEn: "Chihuahua",
    size: "tiny",
    weightMin: 1.5,
    weightMax: 3,
    chestAvg: 30,
    backAvg: 22,
    neckAvg: 19,
    popular: true,
  },
  {
    id: "toy-poodle",
    nameJa: "トイプードル",
    nameEn: "Toy Poodle",
    size: "small",
    weightMin: 3,
    weightMax: 5,
    chestAvg: 38,
    backAvg: 28,
    neckAvg: 24,
    popular: true,
  },
  {
    id: "pomeranian",
    nameJa: "ポメラニアン",
    nameEn: "Pomeranian",
    size: "tiny",
    weightMin: 1.5,
    weightMax: 3.5,
    chestAvg: 33,
    backAvg: 24,
    neckAvg: 21,
    popular: true,
  },
  {
    id: "shih-tzu",
    nameJa: "シーズー",
    nameEn: "Shih Tzu",
    size: "small",
    weightMin: 4,
    weightMax: 7,
    chestAvg: 42,
    backAvg: 30,
    neckAvg: 27,
  },
  {
    id: "maltese",
    nameJa: "マルチーズ",
    nameEn: "Maltese",
    size: "tiny",
    weightMin: 2,
    weightMax: 3.5,
    chestAvg: 32,
    backAvg: 23,
    neckAvg: 20,
  },
  {
    id: "yorkie",
    nameJa: "ヨークシャテリア",
    nameEn: "Yorkshire Terrier",
    size: "tiny",
    weightMin: 2,
    weightMax: 3.5,
    chestAvg: 31,
    backAvg: 22,
    neckAvg: 20,
  },
  {
    id: "dachshund",
    nameJa: "ダックスフンド",
    nameEn: "Dachshund",
    size: "small",
    weightMin: 4,
    weightMax: 9,
    chestAvg: 45,
    backAvg: 36,
    neckAvg: 28,
    popular: true,
  },
  {
    id: "french-bulldog",
    nameJa: "フレンチブルドッグ",
    nameEn: "French Bulldog",
    size: "small",
    weightMin: 8,
    weightMax: 14,
    chestAvg: 52,
    backAvg: 32,
    neckAvg: 36,
    popular: true,
  },
  {
    id: "papillon",
    nameJa: "パピヨン",
    nameEn: "Papillon",
    size: "small",
    weightMin: 3,
    weightMax: 5,
    chestAvg: 36,
    backAvg: 26,
    neckAvg: 22,
  },
  {
    id: "jack-russell",
    nameJa: "ジャックラッセル",
    nameEn: "Jack Russell Terrier",
    size: "small",
    weightMin: 5,
    weightMax: 8,
    chestAvg: 42,
    backAvg: 30,
    neckAvg: 28,
  },
  // 中型 (medium)
  {
    id: "shiba",
    nameJa: "柴犬",
    nameEn: "Shiba Inu",
    size: "medium",
    weightMin: 8,
    weightMax: 12,
    chestAvg: 55,
    backAvg: 42,
    neckAvg: 34,
    popular: true,
  },
  {
    id: "corgi",
    nameJa: "コーギー",
    nameEn: "Welsh Corgi",
    size: "medium",
    weightMin: 10,
    weightMax: 14,
    chestAvg: 58,
    backAvg: 38,
    neckAvg: 36,
    popular: true,
  },
  {
    id: "beagle",
    nameJa: "ビーグル",
    nameEn: "Beagle",
    size: "medium",
    weightMin: 9,
    weightMax: 13,
    chestAvg: 56,
    backAvg: 40,
    neckAvg: 35,
  },
  {
    id: "border-collie",
    nameJa: "ボーダーコリー",
    nameEn: "Border Collie",
    size: "medium",
    weightMin: 14,
    weightMax: 20,
    chestAvg: 64,
    backAvg: 48,
    neckAvg: 38,
  },
  {
    id: "sheltie",
    nameJa: "シェルティ",
    nameEn: "Shetland Sheepdog",
    size: "medium",
    weightMin: 7,
    weightMax: 10,
    chestAvg: 52,
    backAvg: 38,
    neckAvg: 34,
  },
  // 大型 (large / giant)
  {
    id: "golden-retriever",
    nameJa: "ゴールデンレトリバー",
    nameEn: "Golden Retriever",
    size: "large",
    weightMin: 25,
    weightMax: 34,
    chestAvg: 78,
    backAvg: 60,
    neckAvg: 48,
    popular: true,
  },
  {
    id: "labrador",
    nameJa: "ラブラドールレトリバー",
    nameEn: "Labrador Retriever",
    size: "large",
    weightMin: 25,
    weightMax: 36,
    chestAvg: 80,
    backAvg: 60,
    neckAvg: 50,
    popular: true,
  },
  {
    id: "husky",
    nameJa: "シベリアンハスキー",
    nameEn: "Siberian Husky",
    size: "large",
    weightMin: 20,
    weightMax: 28,
    chestAvg: 76,
    backAvg: 60,
    neckAvg: 46,
  },
  {
    id: "german-shepherd",
    nameJa: "ジャーマンシェパード",
    nameEn: "German Shepherd",
    size: "large",
    weightMin: 28,
    weightMax: 40,
    chestAvg: 84,
    backAvg: 65,
    neckAvg: 52,
  },
  // mix扱い
  {
    id: "mix",
    nameJa: "ミックス犬(親犬種を選択)",
    nameEn: "Mixed breed (pick parents)",
    size: "small",
    weightMin: 0,
    weightMax: 0,
    chestAvg: 0,
    backAvg: 0,
    neckAvg: 0,
  },
];

export function getBreed(id: string): Breed | undefined {
  return breeds.find((b) => b.id === id);
}

export function getPopularBreeds(): Breed[] {
  return breeds.filter((b) => b.popular);
}

/**
 * 親犬種を2つ受け取って、平均的な採寸値を推定する。
 * MIX犬の場合に使う。
 */
export function estimateMixMeasurements(
  parentA: Breed,
  parentB: Breed,
): { chest: number; back: number; neck: number; weight: number } {
  return {
    chest: Math.round((parentA.chestAvg + parentB.chestAvg) / 2),
    back: Math.round((parentA.backAvg + parentB.backAvg) / 2),
    neck: Math.round((parentA.neckAvg + parentB.neckAvg) / 2),
    weight:
      Math.round(
        ((parentA.weightMin + parentA.weightMax) / 2 +
          (parentB.weightMin + parentB.weightMax) / 2) /
          2 *
          10,
      ) / 10,
  };
}
