export type ConcernCategory = "size" | "season" | "behavior" | "purpose";

export type Concern = {
  id: string;
  category: ConcernCategory;
  labelJa: string;
  labelEn: string;
  descJa: string;
  descEn: string;
  popularity: number; // 0-100, MVPでは固定値
  iconKey: string;
};

export const concerns: Concern[] = [
  // ─ サイズ ─────────────
  {
    id: "mix-fit",
    category: "size",
    labelJa: "MIX犬で服のサイズが合わない",
    labelEn: "Mix breed sizing is hard",
    descJa: "親犬種が違うと体型もまちまち。各ブランドのサイズ表をどう読むか難しい。",
    descEn:
      "Mixed breed bodies don't match any single size chart. We help you decode them.",
    popularity: 92,
    iconKey: "ruler",
  },
  {
    id: "slips-off",
    category: "size",
    labelJa: "服がすぐ脱げてしまう",
    labelEn: "Clothes slip off easily",
    descJa: "首回りや胸囲が緩くて、散歩中にずれる・脱げる悩み。",
    descEn:
      "The neck or chest is too loose and the garment shifts on walks.",
    popularity: 78,
    iconKey: "alert",
  },
  {
    id: "small-breed",
    category: "size",
    labelJa: "小型犬・MIX犬向けの選び方が分からない",
    labelEn: "Don't know how to pick for small / mixed breeds",
    descJa: "情報が大型犬・有名犬種に偏りがち。うちの子に合うものをどう選ぶ?",
    descEn:
      "Most guides target larger or pure breeds. How do I pick for mine?",
    popularity: 84,
    iconKey: "compass",
  },
  // ─ 環境・季節 ──────────────
  {
    id: "hot-summer",
    category: "season",
    labelJa: "暑がりで夏が心配",
    labelEn: "Overheats easily in summer",
    descJa: "アスファルトの熱、湿気、エアコンとの温度差。夏場の外出・室内対策。",
    descEn: "Hot asphalt, humidity, indoor AC swings — summer needs help.",
    popularity: 88,
    iconKey: "sun",
  },
  {
    id: "cold-winter",
    category: "season",
    labelJa: "寒がりで冬の散歩が辛そう",
    labelEn: "Struggles with cold winter walks",
    descJa: "短毛・小型犬は特に冷えやすい。防寒着で快適に。",
    descEn: "Short-haired or small breeds get cold fast. Outerwear matters.",
    popularity: 82,
    iconKey: "snowflake",
  },
  {
    id: "rainy-walk",
    category: "season",
    labelJa: "雨の日の散歩対策",
    labelEn: "Need rainy-day walk gear",
    descJa: "濡れた身体を拭く労力、皮膚トラブル予防。雨でも快適に散歩。",
    descEn:
      "Less drying after, fewer skin issues. Make rainy walks workable.",
    popularity: 76,
    iconKey: "cloud-rain",
  },
  {
    id: "cold-paws",
    category: "season",
    labelJa: "冬の散歩で足が冷える",
    labelEn: "Cold paws in winter",
    descJa: "凍結した路面、融雪剤対策。靴 / ブーティで肉球を守る。",
    descEn:
      "Frozen pavement and de-icing salt. Boots protect those paw pads.",
    popularity: 58,
    iconKey: "footprints",
  },
  // ─ 行動・性格 ─────────────────
  {
    id: "pulls-leash",
    category: "behavior",
    labelJa: "散歩で引っ張る",
    labelEn: "Pulls on the leash",
    descJa: "引っ張り防止ハーネスやノーパルハーネス系で散歩を楽に。",
    descEn:
      "No-pull harnesses redirect pressure and make walks easier on you both.",
    popularity: 86,
    iconKey: "anchor",
  },
  {
    id: "destroys-toys",
    category: "behavior",
    labelJa: "噛み癖が強くおもちゃをすぐ壊す",
    labelEn: "Destroys toys instantly",
    descJa: "デンタル系・ヘビーチュワー対応の頑丈なおもちゃ。",
    descEn:
      "Heavy-chewer rated and dental-friendly toys that actually last.",
    popularity: 74,
    iconKey: "shield",
  },
  {
    id: "lonely-when-alone",
    category: "behavior",
    labelJa: "留守番が苦手で寂しがる",
    labelEn: "Hates being home alone",
    descJa: "知育トイ、ノーズワークマット、コング系で頭と時間を満たす。",
    descEn:
      "Puzzle toys, snuffle mats, frozen Kongs to fill the time productively.",
    popularity: 72,
    iconKey: "heart",
  },
  {
    id: "noise-scared",
    category: "behavior",
    labelJa: "怖がりで音に敏感",
    labelEn: "Anxious around loud noises",
    descJa: "サンダーシャツ、安心ベッド、アンチアンザイエティ系のグッズ。",
    descEn:
      "Calming shirts, safe-feel beds, anti-anxiety wraps and pheromone gear.",
    popularity: 60,
    iconKey: "moon",
  },
  // ─ 機能・用途 ──────────────────
  {
    id: "cute-outing",
    category: "purpose",
    labelJa: "お出かけ時にかわいく見せたい",
    labelEn: "Cute outfits for outings",
    descJa: "カフェ・撮影・お出かけ用。シーズン感のある服やドレス。",
    descEn:
      "Café trips, photos, day-outs. Seasonal looks and photogenic outfits.",
    popularity: 70,
    iconKey: "sparkles",
  },
  {
    id: "active-sports",
    category: "purpose",
    labelJa: "アクティブな運動向けの装備",
    labelEn: "Gear for active sports",
    descJa: "山・トレッキング・水辺。耐久性のあるハーネス、機能性アウター。",
    descEn:
      "Hiking, water, trails — durable harnesses and outdoor performance gear.",
    popularity: 54,
    iconKey: "mountain",
  },
  {
    id: "dog-run",
    category: "purpose",
    labelJa: "ドッグラン用の装備",
    labelEn: "Dog-run essentials",
    descJa: "走り回っても外れないハーネス、コミュニケーション用おもちゃ。",
    descEn:
      "Run-proof harnesses and play-friendly toys for the dog park.",
    popularity: 48,
    iconKey: "wind",
  },
  {
    id: "senior-dog",
    category: "purpose",
    labelJa: "シニア犬で動きが鈍くなってきた",
    labelEn: "Senior dog needs gentle gear",
    descJa: "着脱しやすい服、滑り止め、関節を守るベッドや段差対策。",
    descEn:
      "Easy-on outfits, no-slip surfaces, gentle on joints, step support.",
    popularity: 56,
    iconKey: "leaf",
  },
];

export function getConcern(id: string): Concern | undefined {
  return concerns.find((c) => c.id === id);
}

export function getPopularConcerns(limit = 6): Concern[] {
  return [...concerns]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getConcernsByCategory(category: ConcernCategory): Concern[] {
  return concerns.filter((c) => c.category === category);
}
