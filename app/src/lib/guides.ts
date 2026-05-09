import type { ProductMatch } from "./matching";
import {
  type Product,
  type ProductCategory,
  resolveBuyUrl,
  visibleProducts,
} from "./products";

/**
 * 「○○の選び方」記事 (mybest 流のロングフォーム購入ガイド)。
 *
 * 記事は SEO 主導の入口で、検索流入 → 該当ページの「ベストピック」 →
 * Amazon タグ付きアフィリリンク、というコンバージョン経路の起点。
 *
 * データはコード上で定義する (DB ではない)。理由:
 * - 記事は数十本オーダーで増える想定で、Cloudflare Workers の cold-start
 *   コストを上げない静的データのほうが SSG/ISR と相性がいい
 * - レビュアの差し戻しは PR ベースで合意取れる
 * - 国際化の差分管理が JSON の type 推論に乗る
 */

export type GuideSection =
  | { kind: "lead"; bodyJa: string; bodyEn: string }
  | {
      kind: "points";
      titleJa: string;
      titleEn: string;
      itemsJa: { headline: string; body: string }[];
      itemsEn: { headline: string; body: string }[];
    }
  | {
      kind: "top_picks";
      titleJa: string;
      titleEn: string;
      productIds: string[]; // explicit pin、空なら productQuery に基づき自動選定
    }
  | {
      kind: "faq";
      titleJa: string;
      titleEn: string;
      itemsJa: { q: string; a: string }[];
      itemsEn: { q: string; a: string }[];
    };

export type Guide = {
  slug: string;
  titleJa: string;
  titleEn: string;
  leadJa: string;
  leadEn: string;
  /**
   * 関連商品の自動選定クエリ。top_picks セクションで productIds が空の時に使う。
   * categories の OR ∩ concerns の OR でフィルタし popularity 順に切り出す。
   */
  productQuery: {
    categories: ProductCategory[];
    concerns: string[];
    limit: number;
  };
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "harness-buying-guide",
    titleJa: "犬用ハーネスの選び方ガイド",
    titleEn: "How to choose a dog harness",
    leadJa:
      "首輪より体への負担が少なく、引っ張りグセのある子や気管が弱い犬種に向くハーネス。胸囲・首回りの実寸、装着しやすさ、引っ張り防止構造の有無で大きく満足度が変わります。本ガイドでは犬種・体型・お悩み別に、わんプロブレムが扱う約 200 商品から厳選してご紹介します。",
    leadEn:
      "A harness spreads the leash load across the chest instead of the neck — gentler on tracheas, safer for pullers. The right pick comes down to chest/neck circumference, ease of fitting, and whether you need a front-clip anti-pull design. We narrow our 200+ catalog down to a clean shortlist by breed, build, and concern.",
    productQuery: {
      categories: ["apparel"],
      concerns: ["pulls-leash", "small-breed", "wide-chest", "long-back"],
      limit: 5,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" }, // hero lead は別途レンダー
      {
        kind: "points",
        titleJa: "選ぶ前に押さえる 5 つのポイント",
        titleEn: "Five things to check before you buy",
        itemsJa: [
          {
            headline: "胸囲を 1cm 単位で実測する",
            body:
              "ハーネスはサイズ表記が S/M/L だけでなくブランドごとに胸囲の数値が異なります。柔らかいメジャーで前足の付け根の少し後ろを一周。指 2 本入る余裕を見込み、表のレンジに胸囲が入るサイズを選んでください。",
          },
          {
            headline: "引っ張りグセがあるなら前胸 D 環タイプ",
            body:
              "前胸にリード接続点があるハーネス (PetSafe Easy Walk / Ruffwear Front Range など) は犬が前に出ると体の向きが横へ流れる構造で、引っ張り癖の矯正に有効です。普通の背中接続のみのモデルだと真逆の結果になります。",
          },
          {
            headline: "短頭種 (フレブル / パグ) は胸幅広めの専用設計を",
            body:
              "胸が広い犬種は通常モデルだと前足の付け根に食い込み歩き方が崩れます。Frenchic ワイドチェスト ベスト など短頭種向けと明記された製品を選ぶと長時間散歩でも擦れにくいです。",
          },
          {
            headline: "ダックス・コーギー系は背中ストラップ短め",
            body:
              "胴長犬種は背面ストラップが長いと前後にズレやすく、肩の動きを阻害します。サイズ表で背丈 (back) のレンジが胴長 SKU として分かれているブランドを優先してください。",
          },
          {
            headline: "夜散歩派なら反射材 + ライトループ",
            body:
              "夜間散歩はドライバーから 30 メートル以上手前で発見されないと事故率が跳ね上がります。Ruffwear Front Range や Mighty Paw 系は反射材 + LED ライトループ付き。普段使いと両立できます。",
          },
        ],
        itemsEn: [
          {
            headline: "Measure chest girth to the centimeter",
            body:
              "S/M/L sizing varies between brands. Wrap a soft tape just behind the front legs, leave 2-finger slack, and pick the size whose stated chest range covers your number.",
          },
          {
            headline: "Front-clip if your dog pulls",
            body:
              "Models with a chest-front leash ring (PetSafe Easy Walk, Ruffwear Front Range) redirect a pulling dog sideways. Back-only clips encourage pulling.",
          },
          {
            headline: "Brachy breeds need wide-chest cuts",
            body:
              "Standard harnesses dig into the armpits of broad-chested dogs (Frenchies, pugs). Look for explicitly labeled wide-chest builds.",
          },
          {
            headline: "Short-back straps for long-bodied breeds",
            body:
              "Dachshunds and corgis slide around in standard back-strap lengths. Brands that publish back-length ranges as a separate spec are worth paying extra for.",
          },
          {
            headline: "Reflective trim + light loop for night walks",
            body:
              "Drivers need 30+ meters of warning at night. Ruffwear Front Range and Mighty Paw lines combine reflective panels with an attachment loop for a clip-on LED.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "わんプロブレム編集部のおすすめ 5 選",
        titleEn: "Editor's top 5 picks",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "首輪とハーネス、どちらが良いですか?",
            a: "気管虚脱や引っ張り癖のある犬は首輪を避けるべきです。健康な成犬で散歩時間が短く引っ張りも少ないなら首輪でも可。子犬・短頭種・小型犬・シニアはハーネスが第一選択です。",
          },
          {
            q: "サイズが境界線上の場合、大きい方と小さい方どちらを選びますか?",
            a: "原則として 「上のサイズ + 調整ストラップで詰める」 が安全です。小さい側を選ぶと胸を圧迫しがちで、特に夏場の通気が悪化します。",
          },
          {
            q: "ハーネスはどれくらいで買い替えるべき?",
            a: "金具の錆び・縫製のほつれ・反射材の剥離が出たら交換時期です。屋外メインの使用で 1-2 年が目安。子犬の成長期は 3 ヶ月ごとにフィット確認を。",
          },
          {
            q: "MIX 犬で胸囲がブランドの S/M の中間です",
            a: "胸囲の数値で選び、サイズ表記には固執しないでください。複数ブランドのサイズ表を見比べると、同じ S 表記でも実寸が 5cm ほど違う場合が珍しくありません。",
          },
        ],
        itemsEn: [
          {
            q: "Collar or harness?",
            a: "Avoid collars for dogs with tracheal issues or pulling habits. For healthy adult dogs with short, calm walks, collars are fine. Puppies, brachycephalics, small breeds, and seniors should default to harnesses.",
          },
          {
            q: "Borderline size — go up or down?",
            a: "Go up and tighten with the adjustment straps. Sizing down compresses the chest and traps heat in summer.",
          },
          {
            q: "When should I replace a harness?",
            a: "Watch for hardware corrosion, frayed stitching, or peeling reflective trim. With outdoor use, 1–2 years is typical. For growing puppies, refit every 3 months.",
          },
          {
            q: "My mixed-breed dog falls between two sizes",
            a: "Trust the chest-girth number, not the S/M/L label. The same letter across brands can differ by 5 cm in actual range.",
          },
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

/**
 * top_picks 用の商品選定。explicit な productIds が空なら productQuery で自動選定。
 * 戻り値は ProductCard が要求する ProductMatch 形に薄く整える。
 */
export function pickProductsForGuide(guide: Guide): ProductMatch[] {
  const explicit = guide.sections
    .filter((s): s is Extract<GuideSection, { kind: "top_picks" }> => s.kind === "top_picks")
    .flatMap((s) => s.productIds);
  let chosen: Product[];
  if (explicit.length > 0) {
    const byId = new Map(visibleProducts.map((p) => [p.id, p]));
    chosen = explicit.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  } else {
    const { categories, concerns, limit } = guide.productQuery;
    chosen = visibleProducts
      .filter((p) => categories.includes(p.category))
      .filter((p) => p.concerns.some((c) => concerns.includes(c)))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
  return chosen.map(productToMatch.bind(null, guide.productQuery.concerns));
}

function productToMatch(
  queryConcerns: string[],
  product: Product,
): ProductMatch {
  const concernHits = product.concerns.filter((c) =>
    queryConcerns.includes(c),
  );
  const concernMatchRatio =
    queryConcerns.length === 0
      ? 0
      : concernHits.length / queryConcerns.length;
  return {
    product,
    bestSize: undefined,
    concernHits,
    concernMatchRatio,
    popularityScore: product.popularity,
    totalScore: product.popularity,
    resolvedBuyUrls: product.buyOptions.map((opt) => resolveBuyUrl(opt)),
  };
}
