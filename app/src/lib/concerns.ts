export type ConcernCategory = "size" | "season" | "behavior" | "purpose" | "care";

export type Concern = {
  id: string;
  category: ConcernCategory;
  /** 編集側で振る通し番号 "01" - "15" 等。 */
  number?: string;
  labelJa: string;
  labelEn: string;
  /**
   * 短縮表記。TOP の chip 列など狭い surface で使用。未定義時は labelJa を使う。
   * 5-8 文字程度で「タップしたくなる粒度」に揃える ("抜け毛対策" "夏の暑さ" 等)。
   */
  chipLabelJa?: string;
  chipLabelEn?: string;
  descJa: string;
  descEn: string;
  /**
   * 0-100 の人気度。MVPは静的だが、リリース後は分析データで上書きする想定。
   * 出典:
   * - 「ペットの悩みアンケート2025」ユニ・チャーム/petopro
   * - 「いぬのきもち 愛犬の悩みランキング」
   * - Texas A&M「99% of dogs have behavior issues」(2025)
   */
  popularity: number;
  iconKey: string;
};

/** chip 表示用ラベルを取得。chipLabelJa/En が未定義なら label にフォールバック。 */
export function chipLabel(c: Concern, locale: "ja" | "en"): string {
  if (locale === "ja") return c.chipLabelJa ?? c.labelJa;
  return c.chipLabelEn ?? c.labelEn;
}

/**
 * 悩みマスタ。最終的にはアクセスログの検索クエリ集計で順位を動的に
 * 入れ替える計画。MVPでは2025年の各種飼い主アンケート/論文から得た
 * 出現率を popularity 値に反映している。
 */
export const concerns: Concern[] = [
  // ─────────────────────────────────────────
  // ケア / 手入れ(リサーチで最多のクレーム = 抜け毛掃除など)
  // ─────────────────────────────────────────
  {
    id: "heavy-shedding",
    category: "care",
    labelJa: "抜け毛が多くて掃除が大変",
    labelEn: "Heavy shedding — cleaning is exhausting",
    chipLabelJa: "抜け毛対策",
    chipLabelEn: "Shedding",
    descJa:
      "抜け毛キャッチのウェアやデイリーブラシ、コロコロ・ブラシ系。掃除負担を物理で減らす。",
    descEn:
      "Daily brushes, fur-catching wear, lint rollers — physically cut the cleaning load.",
    popularity: 92,
    iconKey: "wind",
  },
  {
    id: "long-coat-grooming",
    category: "care",
    labelJa: "毛が長くて手入れが大変",
    labelEn: "Long coat is hard to maintain",
    descJa:
      "もつれ防止のスリッカー、コーム、お手入れ用スプレーやハーフパンツ風カバー。",
    descEn:
      "Slicker brushes, combs, detangle sprays, and protective wear.",
    popularity: 70,
    iconKey: "leaf",
  },
  {
    id: "tear-stains-care",
    category: "care",
    labelJa: "涙やけが気になる(ケア用品)",
    labelEn: "Tear stains worry me (daily care)",
    descJa:
      "毎日のケアシート、専用ローション、目元を覆うバンダナ。あくまで日常ケア用品。",
    descEn:
      "Daily care wipes, eye-area lotions, bandanas. Care, not treatment.",
    popularity: 76,
    iconKey: "sparkles",
  },
  {
    id: "dirty-ears",
    category: "care",
    labelJa: "耳がよく汚れる",
    labelEn: "Ears get dirty often",
    descJa:
      "耳掃除シート、専用クリーナー、耳をカバーするバンダナ系。",
    descEn:
      "Ear wipes, cleaners, and ear-covering wraps for windy walks.",
    popularity: 60,
    iconKey: "moon",
  },
  {
    id: "nail-care-hates",
    category: "care",
    labelJa: "爪切りが苦手・嫌がる",
    labelEn: "Hates nail trimming",
    descJa:
      "音が静かな電動グラインダーや、フィットしやすいネイルマット。",
    descEn:
      "Quiet electric grinders and grippy mats that hold paws still.",
    popularity: 66,
    iconKey: "shield",
  },
  {
    id: "bath-hates",
    category: "care",
    labelJa: "お風呂が苦手",
    labelEn: "Hates bath time",
    descJa:
      "ぬるま湯対応のシャワーカップ、滑り止めマット、ドライヤーカバー。",
    descEn:
      "Gentle shower cups, anti-slip mats, calmer drying covers.",
    popularity: 64,
    iconKey: "cloud-rain",
  },
  {
    id: "brushing-hates",
    category: "care",
    labelJa: "ブラッシングを嫌がる",
    labelEn: "Hates being brushed",
    descJa:
      "肌当たりの優しいブラシ、グルーミンググローブで「触る」延長として馴らす。",
    descEn:
      "Gentle bristles and grooming gloves to soften the experience.",
    popularity: 60,
    iconKey: "heart",
  },
  {
    id: "dental-care",
    category: "care",
    labelJa: "歯磨きを嫌がる / 口臭が気になる",
    labelEn: "Dental care is a struggle",
    descJa:
      "デンタルガム、ロープ系おもちゃ、フィンガー歯ブラシ。少しずつ慣らす。",
    descEn:
      "Dental chews, rope toys, finger-brushes. Build the habit slowly.",
    popularity: 70,
    iconKey: "shield",
  },

  // ─────────────────────────────────────────
  // 行動 / しつけ系(2025年の各種アンケートで上位独占)
  // ─────────────────────────────────────────
  {
    id: "barking",
    category: "behavior",
    labelJa: "吠え声が大きい / よく吠える",
    labelEn: "Barks too much / too loud",
    chipLabelJa: "無駄吠え",
    chipLabelEn: "Barking",
    descJa:
      "クレートトレーニング、知育トイ、ベスト型の落ち着きグッズ。",
    descEn:
      "Crate training, enrichment toys, calming vests.",
    popularity: 90,
    iconKey: "alert",
  },
  {
    id: "barking-guests",
    category: "behavior",
    labelJa: "来客やインターホンに吠える",
    labelEn: "Barks at the doorbell / guests",
    descJa:
      "ハウスやベッドで「待つ」場所を作る、見えない目隠しを設置。",
    descEn:
      "Designated calm-spot bed, visual blockers, treat puzzles for distraction.",
    popularity: 78,
    iconKey: "alert",
  },
  {
    id: "barking-other-dogs",
    category: "behavior",
    labelJa: "他の犬に反応して吠える",
    labelEn: "Reactive to other dogs",
    descJa:
      "イージーウォーク系ハーネス、視界を絞るバンダナ、ご褒美ポーチで気を逸らす。",
    descEn:
      "No-pull harnesses, calming wraps, reward pouches to redirect.",
    popularity: 80,
    iconKey: "anchor",
  },
  {
    id: "pulls-leash",
    category: "behavior",
    labelJa: "散歩で引っ張る",
    labelEn: "Pulls on the leash",
    chipLabelJa: "引っ張り癖",
    chipLabelEn: "Pulling",
    descJa:
      "引っ張り防止ハーネスやノーパルハーネス系で散歩を楽に。",
    descEn:
      "No-pull harnesses redirect pressure and make walks easier on you both.",
    popularity: 86,
    iconKey: "anchor",
  },
  {
    id: "scavenging",
    category: "behavior",
    labelJa: "散歩中に拾い食いをする",
    labelEn: "Picks up things on walks",
    descJa:
      "口輪(マズル)、視界を制限するバンダナ、ご褒美ポーチで誘導。",
    descEn:
      "Soft muzzles, focus aids, treat pouches to redirect attention.",
    popularity: 74,
    iconKey: "shield",
  },
  {
    id: "wont-walk",
    category: "behavior",
    labelJa: "散歩を嫌がる / 立ち止まる",
    labelEn: "Refuses to walk / stops mid-walk",
    descJa:
      "歩きやすい軽量ハーネス、足保護のブーツ、散歩中の知育/ご褒美。",
    descEn:
      "Lightweight harness, paw boots, motivational treats and toys.",
    popularity: 64,
    iconKey: "footprints",
  },
  {
    id: "jumps-on-people",
    category: "behavior",
    labelJa: "人に飛びつく",
    labelEn: "Jumps on people",
    descJa:
      "首輪+リードのコントロール強化、フロアマット導線、トレーニングおやつ。",
    descEn:
      "Better leash control, mat training, food rewards.",
    popularity: 70,
    iconKey: "alert",
  },
  {
    id: "biting-habit",
    category: "behavior",
    labelJa: "甘噛み・噛み癖がやめられない",
    labelEn: "Persistent nipping / mouthing",
    descJa:
      "ヘビーチュワー対応のおもちゃ、デンタルロープ、おやつタイミング。",
    descEn:
      "Heavy-chewer toys, rope dental chews, well-timed treats.",
    popularity: 76,
    iconKey: "shield",
  },
  {
    id: "destroys-toys",
    category: "behavior",
    labelJa: "おもちゃをすぐ壊す",
    labelEn: "Destroys toys instantly",
    descJa:
      "ヘビーチュワー対応、天然鹿角・牛皮・ロープ系の頑丈なもの。",
    descEn:
      "Heavy-chewer rated. Antlers, rope, super-tough rubber.",
    popularity: 78,
    iconKey: "shield",
  },
  {
    id: "destructive-when-alone",
    category: "behavior",
    labelJa: "留守中に家具や壁を齧る",
    labelEn: "Destructive when home alone",
    descJa:
      "知育トイ、コング、ノーズワークマットで時間を潰す。サークル併用も。",
    descEn:
      "Puzzle toys, frozen Kongs, snuffle mats — fill the time productively.",
    popularity: 72,
    iconKey: "heart",
  },
  {
    id: "lonely-when-alone",
    category: "behavior",
    labelJa: "留守番が苦手で寂しがる",
    labelEn: "Hates being home alone",
    chipLabelJa: "留守番グッズ",
    chipLabelEn: "Home alone",
    descJa:
      "知育トイ、ノーズワークマット、コング系で頭と時間を満たす。",
    descEn:
      "Puzzle toys, snuffle mats, frozen Kongs to fill the time productively.",
    popularity: 86,
    iconKey: "heart",
  },
  {
    id: "noise-scared",
    category: "behavior",
    labelJa: "雷・花火・大きな音が怖い",
    labelEn: "Anxious around loud noises",
    descJa:
      "サンダーシャツ、安心ベッド、アンチアンザイエティ系のグッズ。",
    descEn:
      "Calming shirts, safe-feel beds, anti-anxiety wraps and pheromone gear.",
    popularity: 72,
    iconKey: "moon",
  },
  {
    id: "potty-training",
    category: "behavior",
    labelJa: "トイレのしつけが進まない",
    labelEn: "Potty training isn't sticking",
    descJa:
      "段階を分けたしつけ用トイレ、サークル、定位置を作る環境グッズ。",
    descEn:
      "Step-trainer pads, pens, structured environment.",
    popularity: 80,
    iconKey: "compass",
  },
  {
    id: "begging-for-food",
    category: "behavior",
    labelJa: "食卓で人の食べ物を欲しがる",
    labelEn: "Begs at the dinner table",
    descJa:
      "知育トイにごはん、定位置のフードマット、しつけ用ガード。",
    descEn:
      "Move feeding to puzzle toys; install dining gates and mats.",
    popularity: 68,
    iconKey: "shield",
  },
  {
    id: "wont-come",
    category: "behavior",
    labelJa: "呼んでも来ない / 呼び戻しが効かない",
    labelEn: "Recall doesn't work",
    descJa:
      "ロングリード、トレーニングディスク、おやつポーチで呼び戻しを練習。",
    descEn:
      "Long-line training, recall whistles, high-value treats.",
    popularity: 60,
    iconKey: "compass",
  },
  {
    id: "reactive-bicycle",
    category: "behavior",
    labelJa: "自転車・車に過剰反応する",
    labelEn: "Reacts to bikes / cars",
    descJa:
      "視界を絞るバンダナ、確実な引っ張り防止ハーネス、トレーニング。",
    descEn:
      "Focus aids, no-pull harness, structured training plan.",
    popularity: 56,
    iconKey: "anchor",
  },
  {
    id: "anxiety-general",
    category: "behavior",
    labelJa: "怖がり・神経質で何でも怖がる",
    labelEn: "Generally anxious / easily startled",
    descJa:
      "圧迫ベスト、ニオイ系の落ち着きグッズ、安心できる隠れ家ベッド。",
    descEn:
      "Calming vests, pheromone aids, hideaway-style beds.",
    popularity: 64,
    iconKey: "moon",
  },

  // ─────────────────────────────────────────
  // サイズ / フィット系
  // ─────────────────────────────────────────
  {
    id: "mix-fit",
    category: "size",
    labelJa: "MIX犬で服のサイズが合わない",
    labelEn: "Mix breed sizing is hard",
    chipLabelJa: "MIX犬の服",
    chipLabelEn: "Mix sizing",
    descJa:
      "親犬種が違うと体型もまちまち。各ブランドのサイズ表をどう読むか難しい。",
    descEn:
      "Mixed breed bodies don't match any single size chart. We help you decode them.",
    popularity: 88,
    iconKey: "ruler",
  },
  {
    id: "slips-off",
    category: "size",
    labelJa: "服がすぐ脱げてしまう",
    labelEn: "Clothes slip off easily",
    descJa: "首回りや胸囲が緩くて、散歩中にずれる・脱げる悩み。",
    descEn: "The neck or chest is too loose and the garment shifts on walks.",
    popularity: 78,
    iconKey: "alert",
  },
  {
    id: "small-breed",
    category: "size",
    labelJa: "小型犬・MIX犬向けの選び方が分からない",
    labelEn: "Don't know how to pick for small / mixed breeds",
    chipLabelJa: "小型犬向け",
    chipLabelEn: "Small breed",
    descJa: "情報が大型犬・有名犬種に偏りがち。うちの子に合うものをどう選ぶ?",
    descEn:
      "Most guides target larger or pure breeds. How do I pick for mine?",
    popularity: 82,
    iconKey: "compass",
  },
  {
    id: "wide-chest",
    category: "size",
    labelJa: "胸囲が太くて服が合わない(フレブル/パグ系)",
    labelEn: "Wide chest — apparel doesn't fit (Frenchie/Pug body)",
    descJa:
      "ブラキケファリック種に多い悩み。胸が太いブランドや調整可能アジャスター付きを。",
    descEn:
      "Common with brachycephalic breeds. Pick wide-chest patterns or adjustable straps.",
    popularity: 70,
    iconKey: "ruler",
  },
  {
    id: "long-back",
    category: "size",
    labelJa: "胴が長い(ダックス/コーギー系)",
    labelEn: "Long back (Dachshund/Corgi body)",
    descJa:
      "胴長犬は腰の保護も視野に。脚短ボディに合わせたパターンの服を。",
    descEn:
      "Long-back breeds need back-support and length-cut patterns.",
    popularity: 64,
    iconKey: "ruler",
  },

  // ─────────────────────────────────────────
  // 環境 / 季節
  // ─────────────────────────────────────────
  {
    id: "hot-summer",
    category: "season",
    labelJa: "暑がりで夏が心配",
    labelEn: "Overheats easily in summer",
    chipLabelJa: "夏の暑さ",
    chipLabelEn: "Summer heat",
    descJa: "アスファルトの熱、湿気、エアコンとの温度差。夏場の外出・室内対策。",
    descEn: "Hot asphalt, humidity, indoor AC swings — summer needs help.",
    popularity: 88,
    iconKey: "sun",
  },
  {
    id: "asphalt-hot",
    category: "season",
    labelJa: "夏のアスファルトが熱くて散歩が辛い",
    labelEn: "Hot pavement burns paws",
    descJa: "肉球を守るブーツやワックス、早朝・夜散歩対策の反射ベスト。",
    descEn: "Paw boots, wax balm, reflective vests for early/late walks.",
    popularity: 76,
    iconKey: "footprints",
  },
  {
    id: "cold-winter",
    category: "season",
    labelJa: "寒がりで冬の散歩が辛そう",
    labelEn: "Struggles with cold winter walks",
    chipLabelJa: "冬の寒さ",
    chipLabelEn: "Winter cold",
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
    descEn: "Less drying after, fewer skin issues. Make rainy walks workable.",
    popularity: 76,
    iconKey: "cloud-rain",
  },
  {
    id: "cold-paws",
    category: "season",
    labelJa: "冬の散歩で足が冷える",
    labelEn: "Cold paws in winter",
    descJa: "凍結した路面、融雪剤対策。靴 / ブーティで肉球を守る。",
    descEn: "Frozen pavement and de-icing salt. Boots protect those paw pads.",
    popularity: 58,
    iconKey: "footprints",
  },
  {
    id: "static-electricity",
    category: "season",
    labelJa: "冬の静電気で被毛がバチバチする",
    labelEn: "Winter static — coat keeps zapping",
    descJa: "保湿ミスト、天然素材ウェア、加湿器併用。",
    descEn: "Coat-conditioning mists, natural-fiber clothes, humidifiers.",
    popularity: 50,
    iconKey: "wind",
  },

  // ─────────────────────────────────────────
  // 用途 / 場面
  // ─────────────────────────────────────────
  {
    id: "puppy",
    category: "purpose",
    labelJa: "子犬を迎えたばかり",
    labelEn: "Just got a puppy",
    descJa:
      "サイズが日々変わる時期。フィット調整しやすい服、噛んでもよいおもちゃ、お留守番グッズ。",
    descEn:
      "Sizes change weekly. Adjustable clothes, chew-friendly toys, and home-alone gear.",
    popularity: 80,
    iconKey: "sparkles",
  },
  {
    id: "senior-dog",
    category: "purpose",
    labelJa: "シニア犬で動きが鈍くなってきた",
    labelEn: "Senior dog needs gentle gear",
    descJa: "着脱しやすい服、滑り止め、関節を守るベッドや段差対策。",
    descEn:
      "Easy-on outfits, no-slip surfaces, gentle on joints, step support.",
    popularity: 74,
    iconKey: "leaf",
  },
  {
    id: "weight-management",
    category: "purpose",
    labelJa: "体型管理(運動・食事の工夫)",
    labelEn: "Weight management (food & exercise)",
    descJa:
      "知育系のスローフィーダー、給仕量の管理、運動量を増やすためのおもちゃ。",
    descEn:
      "Slow feeders, portion control bowls, activity-driving toys.",
    popularity: 80,
    iconKey: "shield",
  },
  {
    id: "picky-eater",
    category: "behavior",
    labelJa: "ご飯をなかなか食べない / 好き嫌いが激しい",
    labelEn: "Picky eater / refuses meals",
    descJa:
      "食器の高さ・形・素材を見直す、知育系のスローフィーダーで興味を引くなど、給仕の工夫で改善することがあります。",
    descEn:
      "Try a different bowl height, shape, or material — and slow / puzzle feeders to make eating engaging.",
    popularity: 70,
    iconKey: "compass",
  },
  {
    id: "fast-eater",
    category: "behavior",
    labelJa: "早食いが心配",
    labelEn: "Eats too fast",
    descJa:
      "スローフィーダー型のボウルやノーズワークマットでペースを落とす。",
    descEn:
      "Slow-feeder bowls and snuffle mats slow the pace.",
    popularity: 56,
    iconKey: "shield",
  },
  {
    id: "long-walker",
    category: "purpose",
    labelJa: "長時間散歩する",
    labelEn: "Long-walk lifestyle",
    descJa:
      "通気性とフィットの良い装備、給水ボウル、肉球ケア。",
    descEn:
      "Breathable, well-fitted gear plus collapsible bowls and paw care.",
    popularity: 64,
    iconKey: "footprints",
  },
  {
    id: "active-sports",
    category: "purpose",
    labelJa: "アクティブな運動・アウトドアに連れて行く",
    labelEn: "Active sports & outdoor lifestyle",
    descJa:
      "山・トレッキング・水辺。耐久性のあるハーネス、機能性アウター。",
    descEn:
      "Hiking, water, trails — durable harnesses and outdoor performance gear.",
    popularity: 60,
    iconKey: "mountain",
  },
  {
    id: "dog-run",
    category: "purpose",
    labelJa: "ドッグラン用の装備",
    labelEn: "Dog-run essentials",
    descJa:
      "走り回っても外れないハーネス、コミュニケーション用おもちゃ。",
    descEn:
      "Run-proof harnesses and play-friendly toys for the dog park.",
    popularity: 58,
    iconKey: "wind",
  },
  {
    id: "cute-outing",
    category: "purpose",
    labelJa: "お出かけ時にかわいく見せたい",
    labelEn: "Cute outfits for outings",
    descJa: "カフェ・撮影・お出かけ用。シーズン感のある服やドレス。",
    descEn:
      "Café trips, photos, day-outs. Seasonal looks and photogenic outfits.",
    popularity: 76,
    iconKey: "sparkles",
  },
  {
    id: "cafe-friendly",
    category: "purpose",
    labelJa: "カフェやお店に連れて行きたい",
    labelEn: "Want to bring to cafés / shops",
    descJa:
      "公共マナーのためのベスト、コンパクトキャリー、ノーバーキング用おやつ。",
    descEn:
      "Café-ready vests, compact carriers, distraction treats.",
    popularity: 70,
    iconKey: "sparkles",
  },
  {
    id: "travel-car",
    category: "purpose",
    labelJa: "車での移動・お出かけ",
    labelEn: "Car travel & day trips",
    descJa:
      "シートベルト対応ハーネス、シート保護カバー、酔いを軽減するクレート配置。",
    descEn:
      "Seatbelt harnesses, seat covers, sturdy travel crates.",
    popularity: 76,
    iconKey: "compass",
  },
  {
    id: "carsick",
    category: "purpose",
    labelJa: "車酔いしやすい",
    labelEn: "Gets car-sick",
    descJa:
      "視界の安定するクレート、滑り止めマット、通気性の良いウェア。",
    descEn:
      "Stable crates, anti-slip mats, breathable wear.",
    popularity: 50,
    iconKey: "compass",
  },
  {
    id: "public-transport",
    category: "purpose",
    labelJa: "電車・バスで移動する",
    labelEn: "Public transit travel",
    descJa:
      "規定サイズのキャリーバッグ、慣らし用クレート、安心ベッド。",
    descEn:
      "Transit-compliant carriers, comfort crates, calming beds.",
    popularity: 60,
    iconKey: "compass",
  },
  {
    id: "outdoor-camping",
    category: "purpose",
    labelJa: "キャンプ・アウトドアに連れて行く",
    labelEn: "Camping & outdoor trips",
    descJa:
      "防水ハーネス、ライト付きカラー、寝床、長いリード。",
    descEn:
      "Waterproof harness, lighted collar, sleep mat, long line.",
    popularity: 56,
    iconKey: "mountain",
  },
  {
    id: "boarding",
    category: "purpose",
    labelJa: "ペットホテル・お預けに慣れていない",
    labelEn: "Not used to boarding / pet hotel",
    descJa:
      "匂いに慣れるブランケット、いつものおもちゃ、ベッド一式の持参。",
    descEn:
      "Bring familiar blankets, toys, bedding to ease the transition.",
    popularity: 50,
    iconKey: "heart",
  },
  {
    id: "disaster-prep",
    category: "purpose",
    labelJa: "災害時の備え",
    labelEn: "Disaster preparedness",
    descJa:
      "ペット用避難リュック、迷子札、首輪型LEDライト、フードストック。",
    descEn:
      "Go-bag, ID tag, LED collar, emergency food stock.",
    popularity: 54,
    iconKey: "shield",
  },
  {
    id: "moving-home",
    category: "purpose",
    labelJa: "引っ越し・新環境への適応",
    labelEn: "Moving / adjusting to new environment",
    descJa:
      "馴染みのあるベッド、フェロモン系の落ち着きグッズ、隠れ家ハウス。",
    descEn:
      "Familiar beds, calming pheromones, hideaway crates.",
    popularity: 48,
    iconKey: "moon",
  },
  {
    id: "multi-dog",
    category: "purpose",
    labelJa: "多頭飼育の悩み",
    labelEn: "Multi-dog household",
    descJa:
      "個別の食器・ベッド、ケンカ防止の動線設計、それぞれに合うフィット。",
    descEn:
      "Separate bowls/beds, traffic-flow planning, individualized fit.",
    popularity: 50,
    iconKey: "heart",
  },
  {
    id: "with-kids",
    category: "purpose",
    labelJa: "子どもと安全に暮らす",
    labelEn: "Living with kids",
    descJa:
      "丈夫な噛みおもちゃ、犬の安心スペースとなるサークル、行動の境界線づくり。",
    descEn:
      "Tough chew toys, calm-zone pens, clear boundaries.",
    popularity: 56,
    iconKey: "heart",
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
