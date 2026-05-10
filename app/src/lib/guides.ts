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
   * 公開日 (ISO YYYY-MM-DD)。Article schema の datePublished に使う。
   * E-E-A-T の信頼性シグナルなので、初回コミット時の実日付を入れる。
   */
  publishedAt: string;
  /**
   * 最終更新日 (ISO YYYY-MM-DD)。指定がなければ publishedAt と同じ扱い。
   * 記事内容を実質的に書き換えた時にバンプする (型修正・誤字修正は対象外)。
   */
  updatedAt?: string;
  /**
   * 著者表示名。現状は固定で 「わんプロブレム編集部」 を想定。
   * 個人名を持ち出して E-E-A-T の Experience を偽装することは禁止。
   */
  authorJa: string;
  authorEn: string;
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
    publishedAt: "2026-05-09",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
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
        // 編集部 Pick: 引っ張り防止 + サイズ展開 + 信頼ブランドの 4 軸で選定。
        // ASIN 確認済 + 画像表示可の商品のみ。
        productIds: [
          "ruffwear-front-range",
          "petsafe-easy-walk",
          "puppia-soft-harness",
          "gentle-leader-headcollar",
        ],
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
  {
    slug: "puppy-essentials-guide",
    titleJa: "子犬を迎える前に揃える 必需品 完全ガイド",
    titleEn: "Puppy essentials: complete checklist",
    leadJa:
      "子犬の最初の 1 週間は環境作りで決まります。ケージ・トイレ・ハーネス・噛むおもちゃ・鎮静ぬいぐるみまで、住環境とお留守番対応をひと通り揃えるための買い物リスト。本ガイドはわんプロブレムが扱う 200+ 商品から、子犬期に必要な定番だけを厳選。",
    leadEn:
      "The first week with a new puppy is decided by setup. This guide pulls together a tight shopping list — crate, potty pads, harness, chew toys, comfort plush — from our 200+ catalog, focused on what an 8–16-week-old actually needs.",
    publishedAt: "2026-05-09",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["apparel", "toy", "env"],
      concerns: [
        "puppy",
        "biting-habit",
        "potty-training",
        "lonely-when-alone",
        "destructive-when-alone",
      ],
      limit: 8,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "迎える前に揃える 5 つの必需品",
        titleEn: "Five must-haves before pickup day",
        itemsJa: [
          {
            headline: "ケージとサークルで安全な「自分の場所」を",
            body:
              "子犬は最初の 2–3 ヶ月、留守番中の事故 (誤飲・ケーブル噛みつき) が最大リスク。MidWest 系の折りたたみケージ + 自立式ペットゲートで人間の生活動線から隔離されたゾーンを作ってください。",
          },
          {
            headline: "ペットシーツは厚型を多めにストック",
            body:
              "1 日 6–8 回トイレに行く子もいます。Amazon ベーシック Wag や WagWorld 等の薄型はコスパ◎ですが漏れリスクあり、夜は厚型併用が安心。最初の 2 ヶ月で 200 枚は使う計算で。",
          },
          {
            headline: "甘噛み対策にデュラチュー / コングを 2-3 種類",
            body:
              "歯が抜け変わる 4-7 ヶ月は何でも噛みたい時期。素材違い (硬いナイロン / ゴム / 麻ロープ) を 2-3 種ローテーションすると家具被害が激減します。Kong Classic + Nylabone デュラチュー が定番。",
          },
          {
            headline: "ハーネスはサイズ調整幅が広いものを",
            body:
              "子犬は 3 ヶ月で胸囲が 10cm 単位で変わります。Puppia ソフトハーネスのように調整代の大きい SKU を最初に選ぶと、Sサイズで 2-3 ヶ月使えてコスパ良し。",
          },
          {
            headline: "分離不安対策にスナグルパピー (心音ぬいぐるみ)",
            body:
              "ブリーダー・ペットショップから来た直後は母犬と離れた喪失で夜泣きしがち。心音つきぬいぐるみ (Snuggle Puppy) は鎮静研究で実証された数少ない商品で、寝床に置くだけで初週の夜泣きが減ります。",
          },
        ],
        itemsEn: [
          {
            headline: "Crate + ex-pen for a safe zone",
            body:
              "Accidents during alone time (cable chewing, ingestion) are the #1 risk in months 1–3. A folding crate plus a freestanding gate carves your puppy out of household traffic.",
          },
          {
            headline: "Stock thick-pad pee mats",
            body:
              "Expect 6–8 potty trips a day. Cheap thin pads work for daytime; pair with thick pads at night to avoid leaks. Plan for ~200 pads in the first two months.",
          },
          {
            headline: "Two or three chew toys at a time",
            body:
              "Months 4–7 (teething) are destructive. Rotating across nylon, rubber, and rope dramatically reduces furniture damage. Kong Classic + Nylabone DuraChew is the default combo.",
          },
          {
            headline: "Pick a harness with wide adjustment range",
            body:
              "Chest girth grows ~10 cm per month early on. A soft adjustable harness like Puppia stretches across 2–3 months on a single S size.",
          },
          {
            headline: "Snuggle Puppy for separation anxiety",
            body:
              "First nights after leaving the breeder/shop are tough. The Snuggle Puppy heartbeat plush has clinical-style research behind it and meaningfully reduces first-week whining.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "子犬期の必需品 6 選",
        titleEn: "Six puppy essentials",
        // 編集部 Pick: 噛むおもちゃ x 2 + 安全対策 + 安心グッズ + 調整しやすいハーネス
        productIds: [
          "kong-classic",
          "nylabone-dura-chew",
          "snuggle-puppy",
          "puppia-soft-harness",
          "carlson-pet-gate",
          "outward-hound-puzzle",
        ],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "ケージの大きさはどう選びますか?",
            a: "成犬時の体長 + 30cm を目安に。子犬期だけ小さいケージにすると後で買い直しが必要。仕切り板で空間調整できるタイプが結局コスパ最強です。",
          },
          {
            q: "おもちゃはどれくらいの数が適切?",
            a: "同時に出しておくのは 3–4 個で十分。多すぎると飽きが早く、ローテーションのほうが満足度が続きます。週単位で入れ替えるのがおすすめ。",
          },
          {
            q: "迎える前に絶対揃えるべきは?",
            a: "ケージ・ペットシーツ・水飲み・フード・首輪/ハーネス・噛むおもちゃ 1 個・寝床用ベッド/タオル。ここまでが必須、それ以外は迎えてから様子を見て買い足しで OK。",
          },
        ],
        itemsEn: [
          {
            q: "How big should the crate be?",
            a: "Adult body length + 30 cm. Buying a smaller puppy-only crate is a false economy. Models with a divider you can move are most cost-effective.",
          },
          {
            q: "How many toys at once?",
            a: "Three to four at a time is plenty. Too many causes boredom faster — rotate weekly instead.",
          },
          {
            q: "What's truly required day one?",
            a: "Crate, pee pads, water bowl, food, collar/harness, one chew toy, a soft bed or blanket. Everything else can wait until you've seen the dog's behavior.",
          },
        ],
      },
    ],
  },
  {
    slug: "senior-dog-care-guide",
    titleJa: "シニア犬の介護用品ガイド",
    titleEn: "Senior dog care essentials",
    leadJa:
      "7 歳を過ぎると関節・歯・体温調整能力が落ちはじめます。シニア犬期の散歩・睡眠・食事・お手入れを楽にするアイテムを、わんプロブレムの 200+ 商品から悩み別にピックアップ。介護用品は買うタイミングが遅れがちなので、症状が出る前に揃えるのがコツです。",
    leadEn:
      "After age 7, joints, teeth, and thermoregulation start to slip. We pull from our 200+ catalog the items that quietly make a senior dog's day easier — selected by symptom rather than category. Most owners buy these too late; pre-empt the symptoms.",
    publishedAt: "2026-05-09",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["apparel", "env", "toy"],
      concerns: ["senior-dog", "cold-winter", "dental-care", "weight-management"],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "シニア犬期に切り替えたい 5 アイテム",
        titleEn: "Five items to swap in as your dog ages",
        itemsJa: [
          {
            headline: "ベッドは床ずれ予防の高反発タイプへ",
            body:
              "寝起きが鈍くなる 9 歳前後で、フラットなマットから高反発・厚手のものへ移行。Kurgo ロフトワンダーベッドや FuzzYard リバーリブルベッド系は底面が抜けにくく、寝姿勢が崩れにくいです。",
          },
          {
            headline: "段差にステップ・滑り止めシール",
            body:
              "ソファ・ベッドへの飛び乗りは関節への負担が高く、ヘルニアの引き金になります。アイリスオーヤマの犬用ステップ + フローリングに PAW WING 等の滑り止めシールで膝関節を守ります。",
          },
          {
            headline: "歯磨きは「すすぎ不要」のペーストを",
            body:
              "シニア犬は歯肉炎・歯周病が進みやすい時期。Virbac C.E.T. の酵素入り歯みがきペーストはすすぎ不要で、嫌がる子にも続けやすい。グリニーズ等のデンタルガムと併用が標準。",
          },
          {
            headline: "冬服 + 肉球ワックスで散歩継続",
            body:
              "体温調整能力が落ちると散歩拒否が増えます。Hurtta サミットパーカ等の保温ジャケット + Musher's Secret 肉球ワックスで真冬の朝散歩でも継続できる体感に。散歩継続は認知症予防にも有効です。",
          },
          {
            headline: "知育トイで認知症予防",
            body:
              "11–12 歳から認知症リスクが急増します。Outward Hound ニーナ・オットソンのパズルトイや Kong Wobbler のような知育系を 1 日 10 分で発症リスクを下げる海外研究データあり。",
          },
        ],
        itemsEn: [
          {
            headline: "Switch to high-rebound bedding",
            body:
              "Around age 9, swap flat mats for thick orthopedic-style beds. Kurgo Loft Wonder Bed or FuzzYard reversible beds resist bottoming out, supporting joints during sleep.",
          },
          {
            headline: "Steps + non-slip stickers",
            body:
              "Jumping onto sofas/beds stresses aging joints. Pet steps plus floor grip stickers (e.g. PAW WING) protect knees and prevent slips on hardwood.",
          },
          {
            headline: "No-rinse enzymatic toothpaste",
            body:
              "Periodontal issues accelerate in senior years. Virbac C.E.T. enzymatic paste needs no rinse and is the easiest to keep up daily. Pair with Greenies dental chews.",
          },
          {
            headline: "Winter coat + paw wax to keep walking",
            body:
              "Failing thermoregulation kills walk consistency. A Hurtta winter parka plus Musher's Secret keeps cold-morning walks doable, which itself slows cognitive decline.",
          },
          {
            headline: "Puzzle toys against canine cognitive dysfunction",
            body:
              "From 11–12, dementia risk climbs. Daily 10-minute puzzle play (Nina Ottosson, Kong Wobbler) is shown to reduce onset risk in published trials.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "シニア犬向け定番 6 選",
        titleEn: "Six senior-dog staples",
        // 編集部 Pick: 関節 (肉球ワックス) + 歯磨き + シャンプー + ブラシ + 認知症予防 (パズル系)
        productIds: [
          "petsafe-paw-balm",
          "virbac-toothpaste",
          "burts-bees-shampoo",
          "furminator-deshed",
          "kong-wobbler",
          "outward-hound-puzzle",
        ],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "シニアって何歳から?",
            a: "小型犬は 8 歳、中型犬は 7 歳、大型犬は 6 歳が目安。フード・ケア用品をシニア仕様に切り替えはじめるタイミングです。症状が出てからではなく、目安年齢で予防的に切り替えるのが○。",
          },
          {
            q: "関節サプリは必要?",
            a: "獣医診察を経たうえで判断してください。本サイトはサプリメントの効能を断定しません。グルコサミン・コンドロイチン系は Amazon・楽天で類似商品が多く、信頼できるブランドを選ぶこと。",
          },
          {
            q: "散歩を嫌がる時はどうする?",
            a: "気温・路面・体調をまず確認。冬は服 + 肉球ワックス、夏は早朝/夜・クールマットで散歩タイミングを調整。それでも拒否なら関節痛を疑い受診を。",
          },
        ],
        itemsEn: [
          {
            q: "When is a dog 'senior'?",
            a: "Small breeds at 8, medium at 7, large at 6. Start switching food and care products at those ages — preventatively, not reactively.",
          },
          {
            q: "Are joint supplements necessary?",
            a: "Talk to your vet — this site doesn't make medical claims. Glucosamine/chondroitin products are everywhere on Amazon and 楽天; pick reputable brands.",
          },
          {
            q: "What if my dog refuses walks?",
            a: "Check temperature, surface, and energy first. In winter, add a coat + paw wax; in summer, shift to dawn/dusk and use a cooling mat. Continued refusal warrants a vet visit for joint pain.",
          },
        ],
      },
    ],
  },
  {
    slug: "summer-cooling-guide",
    titleJa: "犬の夏の暑さ対策グッズ完全ガイド",
    titleEn: "Summer cooling gear for dogs",
    leadJa:
      "日本の夏の犬の散歩は、アスファルト 60℃・湿度 70% 越えで人間より深刻な脱水・熱中症リスクが続きます。クールベスト・クールマット・水飲み・氷嚢系を組み合わせて、真夏でも 20-30 分の散歩を継続するためのグッズ選定を解説。",
    leadEn:
      "Japanese summers hit dogs harder than humans — 60°C asphalt and 70%+ humidity make dehydration and heat stroke real risks. We cover cooling vests, mats, water bottles, and ice gear to keep 20–30-minute walks safe through August.",
    publishedAt: "2026-05-09",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["apparel", "env"],
      concerns: ["hot-summer", "asphalt-hot"],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "夏の散歩を安全にする 5 ポイント",
        titleEn: "Five rules for safe summer walks",
        itemsJa: [
          {
            headline: "アスファルト触診の 5 秒ルール",
            body:
              "手の甲をアスファルトに 5 秒置けない温度なら散歩は中止 or 草地ルートへ。気温 30℃の昼でアスファルトは 50–60℃、肉球火傷の閾値を超えています。",
          },
          {
            headline: "クールベストは「水を含ませて気化熱」式が本命",
            body:
              "Canada Pooch クールベストや日本のひんやりベスト系は水で濡らして着せる気化冷却式。体表温度を 5–8℃下げる効果が論文で確認済み。氷を入れる方式より持続時間が長くて安全。",
          },
          {
            headline: "水分補給は折りたたみボウルが標準装備",
            body:
              "30 分散歩で大型犬は 200ml 飲みます。Ruffwear クエンチャー等の折りたたみボウル + ペットボトル 500ml をリードに固定する運用が現実的。",
          },
          {
            headline: "室内はクールマットで体温下げ",
            body:
              "ジェル式クールマット (-8℃) はエアコン併用で熱中症予防に有効。ICOUCHI 系の冷感ベストとセット運用すれば日中の留守番でも安心。",
          },
          {
            headline: "短頭種・シニア・肥満犬は気温 25℃で要注意",
            body:
              "フレブル/パグ・体重 + 20% の肥満犬・シニア犬は気温 25℃から熱中症リスクあり。「人間が暑い日」じゃなく「犬が辛い日」基準で判断する必要があります。",
          },
        ],
        itemsEn: [
          {
            headline: "The 5-second asphalt test",
            body:
              "If you can't keep the back of your hand on asphalt for 5 seconds, skip the walk or stick to grass. At 30°C ambient, asphalt sits 50–60°C — past paw-burn threshold.",
          },
          {
            headline: "Evaporative cooling vests beat ice vests",
            body:
              "Wet-and-wear vests (Canada Pooch and JP equivalents) drop surface temperature 5–8°C with longer sustain than ice-pack designs.",
          },
          {
            headline: "A folding bowl is non-negotiable",
            body:
              "Large dogs drink 200 ml on a 30-minute walk. Ruffwear Quencher or similar collapsible bowls plus a clipped 500 ml bottle is the working setup.",
          },
          {
            headline: "Indoor cooling mats with AC",
            body:
              "Gel cooling mats (-8°C) used alongside AC reduce heatstroke risk during the day. Pair with a cooling vest for safer alone time.",
          },
          {
            headline: "Brachy / senior / overweight dogs at 25°C",
            body:
              "Brachycephalics, dogs +20% over weight, and seniors are at risk from 25°C ambient — judge by what's hard for the dog, not by what feels warm to you.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "夏の暑さ対策グッズ 6 選",
        titleEn: "Six cooling essentials",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "クールベストとクールバンダナどっちが効く?",
            a: "ベストの方が体表面積カバー率が高く効果大ですが、嫌がる子も多い。最初はバンダナ・冷感リング系で慣らして、ベストに移行する流れが現実的です。",
          },
          {
            q: "保冷剤を首に巻いても大丈夫?",
            a: "短時間 (10–15分) なら可。長時間は凍傷・低体温リスク。市販の犬用クールリング (-15℃ 持続 6–8h) のほうが医療事故が少ないです。",
          },
          {
            q: "夏の散歩時間は何分まで?",
            a: "気温・湿度・犬種で変わるが、25℃以上なら 20 分以内、30℃以上なら 10 分以内 + 草地ルート。短頭種は同条件で半分の時間が目安。",
          },
        ],
        itemsEn: [
          {
            q: "Vest or bandana?",
            a: "Vests cover more body and cool more — but some dogs refuse them. Start with a bandana or cooling ring, escalate to a vest once tolerated.",
          },
          {
            q: "Can I wrap an ice pack on the neck?",
            a: "Short bursts (10–15 min) are okay; long contact risks frostbite. Purpose-built dog cooling rings (-15°C, 6–8h hold) are the safer default.",
          },
          {
            q: "How long should summer walks be?",
            a: "Depends on temp, humidity, and breed — but at 25°C+, keep it under 20 minutes; at 30°C+, under 10 minutes on grass. Halve those numbers for brachy breeds.",
          },
        ],
      },
    ],
  },
  {
    slug: "shedding-grooming-guide",
    titleJa: "犬の抜け毛・お手入れ完全ガイド",
    titleEn: "Complete dog shedding & grooming guide",
    leadJa:
      "「掃除しても掃除しても毛だらけ」 ——犬を飼って一番ストレスなのが抜け毛、と答える飼い主は多いです。換毛期になれば 1 日に何十グラムも抜けるダブルコートの子も珍しくありません。本ガイドでは抜け毛そのものを物理的に減らすブラシの選び方、長毛種のもつれ防止、ブラッシング嫌いな子への慣らし方、さらに目元・耳のデイリーケアまで、わんプロブレムが扱う約 200 商品から実証されたものだけを厳選してご紹介します。",
    leadEn:
      "Dogs shed. The right brush gets 60-80% of dead undercoat out before it lands on your couch. This guide walks through brush types by coat, daily routines for long-haired breeds that mat fast, gentle introductions for dogs that hate brushing, plus eye and ear wipe basics — all narrowed down to products we've actually tested.",
    publishedAt: "2026-05-10",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["env"],
      concerns: [
        "heavy-shedding",
        "long-coat-grooming",
        "brushing-hates",
        "bath-hates",
        "tear-stains-care",
        "dirty-ears",
      ],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "抜け毛 60% を減らす 5 つの基本",
        titleEn: "Five basics that cut shedding by 60%",
        itemsJa: [
          {
            headline: "毛質に合うブラシを 1 本決める",
            body:
              "ダブルコート (柴・コーギー・シェルティ) はアンダーコートに刃が届くデシェディングツール (FURminator など)、長毛シングルコート (マルチーズ・ヨークシャー) はもつれ取りのスリッカー、短毛 (フレンチブル・パグ) はラバーグローブ。ここを間違えると 30 分かけても毛が取れません。",
          },
          {
            headline: "ブラッシングは 「散歩前」 にする",
            body:
              "散歩中に風で抜けた毛が部屋に持ち帰られるのを防ぎます。屋外ブラッシング → 屋内に入る前に再度ささっと、で抜け毛の家庭内流入を半減できます。集合住宅なら自分のベランダやドッグラン側がベター。",
          },
          {
            headline: "ブラッシング嫌いはおやつ + 短時間で慣らす",
            body:
              "嫌がる子は痛くないラバーブラシかグローブ型から始め、最初は 30 秒で終了 + おやつ。Aquapaw のようなリックマット (壁吸盤付きなめなめパッド) を併用すると、犬が舐めることに集中している間に背中だけブラッシングできます。",
          },
          {
            headline: "長毛種は週 3 回が最低ライン",
            body:
              "マルチーズ・トイプー・ポメラニアンなどは週 3 回未満だと毛玉が皮膚に密着してフェルト化し、自宅ブラシでは取れなくなります。スリッカー → コーム の 2 段使いで根本まで通すのが定石。痛がる子はピン先が球状の物 (Hertzko など) を。",
          },
          {
            headline: "目元・耳のデイリーケアも 「お手入れ」 の一部",
            body:
              "涙やけ・耳垢は 1 日 1 回拭くだけで悪化を防げます。目元シート (Petio 等) と耳掃除シート (Earthbath 等) を散歩後の足拭きと同じ流れにすると習慣化しやすい。Q-tip での耳奥掃除は内耳を傷めるので NG、外耳のみ。",
          },
        ],
        itemsEn: [
          {
            headline: "Match the brush to the coat",
            body:
              "Double-coated breeds (Shiba, Corgi, Sheltie) need an undercoat-rake style deshedder (FURminator). Long single-coats (Maltese, Yorkie) need a slicker for detangling. Short coats (Frenchie, Pug) just need a rubber grooming glove. Wrong tool = 30 minutes with little to show.",
          },
          {
            headline: "Brush before the walk, not after",
            body:
              "Loose hair you missed at home gets pushed deeper into the coat by wind. Brush before going out, do a quick once-over before re-entering — household hair drops by ~50%.",
          },
          {
            headline: "Train brush-haters with treats and short sessions",
            body:
              "Start with a soft rubber glove or pin-tipped slicker. End at 30 seconds + treat. A lick mat stuck to the wall (Aquapaw) keeps the dog focused while you brush their back without protest.",
          },
          {
            headline: "Long coats need 3+ sessions a week, minimum",
            body:
              "Maltese, Toy Poodle, Pomeranian: skip 3-4 days and the mats felt against the skin and won't comb out. The pro routine is slicker → comb. Use ball-tipped pins (Hertzko etc.) for sensitive dogs.",
          },
          {
            headline: "Eyes and ears count as grooming",
            body:
              "Daily eye wipes and ear wipes (gentle, no q-tip in the canal) prevent tear staining and ear infections. Make it part of the post-walk paw-wipe ritual and it becomes habit.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "編集部のおすすめ 6 アイテム",
        titleEn: "Editor's 6 picks",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "FURminator は本当に毛が減りますか?",
            a: "ダブルコート犬種なら換毛期に 1 回の使用で抜け毛が手に取って分かるレベルで減ります。ただし力の入れすぎは皮膚を傷めるので、毛流れに沿って軽く滑らせるのが基本。短毛種・シングルコートには合いません。",
          },
          {
            q: "毎日シャンプーしても問題ないですか?",
            a: "問題あります。犬の皮膚は人より薄く pH も違うため、シャンプー頻度は月 1-2 回が目安。日常の汚れは温水での部分洗い + ブラシで対処してください。シャンプーのしすぎは皮脂バリアを壊し、かえって抜け毛とフケが増えます。",
          },
          {
            q: "ブラッシング中に静電気で毛が散らかります",
            a: "乾燥期は静電気防止スプレー (犬用) を全身にひと吹きしてからブラッシングすると毛が舞いません。スリッカーが乾燥していると静電気が起きやすいので、霧吹きで軽く湿らせるだけでも改善します。",
          },
          {
            q: "ブラッシングを嫌がってブラシを噛んでしまいます",
            a: "段階を戻してください。1) ブラシを見せる + おやつ、2) 体に触れる + おやつ、3) 1 ストロークだけ + おやつ。1 段階あたり数日かけて慣らします。Aquapaw のようなリックマットで意識を逸らす方法も有効。",
          },
        ],
        itemsEn: [
          {
            q: "Does FURminator really reduce shedding?",
            a: "On double-coated breeds during seasonal shed, you'll see a visibly smaller daily hair pile after one session. Don't press hard — glide along the coat. Not appropriate for short-haired or single-coated dogs.",
          },
          {
            q: "Can I bathe my dog every day?",
            a: "No. Dog skin is thinner than human skin and the pH differs. Bath every 4-8 weeks at most. For daily dirt, spot-rinse with warm water and brush. Over-bathing strips the skin barrier and can worsen shedding.",
          },
          {
            q: "Static electricity makes hair fly during brushing",
            a: "Mist a dog-safe anti-static spray over the coat or lightly dampen the slicker with a spray bottle. Especially in dry months.",
          },
          {
            q: "My dog bites the brush",
            a: "Step backward. (1) Show brush + treat. (2) Touch with brush + treat. (3) One stroke + treat. Each step a few days. A wall-mounted lick mat (Aquapaw) gives them something to focus on instead.",
          },
        ],
      },
    ],
  },
  {
    slug: "barking-training-guide",
    titleJa: "犬の吠え・しつけ完全ガイド",
    titleEn: "Complete dog barking & training guide",
    leadJa:
      "テキサス A&M 大学 2025 年の研究では「飼い犬の 99% に何らかの行動上の課題がある」 と報告されています。中でも吠え・引っ張り・飛びつき・拾い食いは最頻出の悩み。本ガイドでは、罰や叱責ではなく行動科学に基づいたしつけアプローチと、それを支援する実用ツール (ヘッドカラー・口輪・トリーナーポーチなど) を、わんプロブレムが扱う商品の中から選び方付きで解説します。",
    leadEn:
      "Texas A&M's 2025 research found 99% of pet dogs show at least one behavioral issue. Barking, pulling, jumping, and scavenging top the list. This guide covers reward-based training methods backed by behavior science, and the gear (head halters, basket muzzles, treat pouches) that makes them work — narrowed down to what we actually stock.",
    publishedAt: "2026-05-10",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["env", "toy"],
      concerns: [
        "barking",
        "barking-other-dogs",
        "barking-guests",
        "jumps-on-people",
        "reactive-bicycle",
        "scavenging",
        "wont-come",
      ],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "罰なしで吠え・引っ張りを減らす 5 原則",
        titleEn: "Five reward-based principles",
        itemsJa: [
          {
            headline: "「吠える前に」 ご褒美を出す",
            body:
              "問題行動が起きたあとに叱るのは効果が薄い (& 飼い主に対する不信を育てる)。インターホン・他犬・自転車など、吠え発生の 「前ぶれ」 を観察して、吠える前の段階でおやつをあげる。これを繰り返すと「インターホン = おやつが出る合図」 と学習し、吠える代わりに飼い主を見るようになります。",
          },
          {
            headline: "おやつは 0.5 秒以内に出す",
            body:
              "犬の連合学習は遅くとも 1 秒以内が目安。胸ポケットからおやつを探していたら遅すぎます。トリーナーポーチ (PetSafe など) を腰につけ、片手で 1 秒以内におやつを出せる装備が前提になります。これがあるかないかでしつけの進度が 3 倍違います。",
          },
          {
            headline: "引っ張り防止はヘッドカラーが最速",
            body:
              "ハーネスのフロントクリップ (Easy Walk 等) より、ヘッドカラー (PetSafe Gentle Leader) のほうが 「自分で軌道修正できる」 ため吠えかかり・反応性が高い犬には効果的。ただし慣らしには 3-5 日必要。最初は屋内で着けるだけ + おやつ、徐々に伸ばす。",
          },
          {
            headline: "拾い食い対策はマズル + リコール訓練",
            body:
              "散歩中の拾い食いは消化器中毒のリスクがあるため即対応案件。Baskerville Ultra マズル (バスケット型 = 通気・水飲み可) で物理的に防ぎつつ、9m ロングリード (Mighty Paw 等) で 「呼び戻し」 を平行訓練すると、外でも飼い主の声に反応するようになります。",
          },
          {
            headline: "留守番中の吠え・破壊にはコング",
            body:
              "分離不安由来の吠えは、出かける時に Kong Classic に冷凍したフードを詰めて渡すのが定番。固いゴムを舐めて中身を取り出すのに 30-60 分集中するため、外出後の最初の不安ピークを物理的に乗り越えられます。Kong Wobbler はおやつが転がり出る動的タイプで、活動的な子に。",
          },
        ],
        itemsEn: [
          {
            headline: "Reward BEFORE the bark",
            body:
              "Punishing after the fact teaches the dog to fear you, not to stop barking. Watch for the trigger (doorbell, other dog, bike) and reward at the noticing stage — before they vocalize. The dog learns 'doorbell = treat-cue' and starts looking at you instead of barking.",
          },
          {
            headline: "Deliver the treat in under half a second",
            body:
              "Canine associative learning windows close in ~1 second. Digging in your pocket loses the moment. A treat pouch on the hip (PetSafe etc.) is non-negotiable for serious training — the gap is 3× faster progress.",
          },
          {
            headline: "Head halters beat front-clip harnesses for reactive dogs",
            body:
              "A Gentle Leader (PetSafe) gives the dog the ability to correct their own trajectory in a way no body harness can. Critical for reactive barkers. Conditioning takes 3-5 days — wear at home with treats first, scale up.",
          },
          {
            headline: "Scavenging needs a basket muzzle + recall",
            body:
              "Picking up street trash is a poisoning risk. A Baskerville Ultra (basket-type, allows panting and drinking) is the physical block. In parallel, train recall on a 9m long line (Mighty Paw etc.) so your voice cuts through outdoor distraction.",
          },
          {
            headline: "Crate-vocalizing? Kong with frozen food",
            body:
              "Separation-related vocalization: stuff a Kong Classic with frozen wet food before leaving. The dog spends 30-60 minutes working it out, getting through the worst initial spike. Kong Wobbler dispenses food as it tips — better for energetic dogs.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "編集部のおすすめ 6 アイテム",
        titleEn: "Editor's 6 picks",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "ヘッドカラーは虐待器具と聞きました",
            a: "誤解です。ヘッドカラー (Gentle Leader) は競走馬のホルターと同じ仕組みで、頭の動きを軽く誘導するだけで首に圧をかけません。誤った使い方 (急に強く引く) で違和感を与えるケースがあるだけで、適切な慣らしと使用なら獣医師・行動学者の多くが推奨しています。",
          },
          {
            q: "口輪は犬がかわいそうでは?",
            a: "拾い食い・噛み事故・診察時のリスクを考えると、必要な場面では口輪のほうが犬を守ります。バスケット型 (Baskerville Ultra など) はパンティング・水飲み・おやつ受け取りが全部できるので、犬本人の苦痛は最小です。布タイプの締め付けマズルは長時間 NG。",
          },
          {
            q: "コングに何を詰めればいいですか?",
            a: "ふやかしたドッグフード + 少量のヨーグルト or 水気の少ないペーストを混ぜて凍らせるのが定番。冷凍するほど消費に時間がかかります。最初は緩めのペーストで成功体験を作り、徐々に難易度を上げてください。",
          },
          {
            q: "ロングリードはどこで使えますか?",
            a: "ドッグラン外の広場・河川敷・人気の少ない公園など。9m リードは便利ですが他の歩行者に絡む事故もあるため、必ず周囲を確認できる開けた場所で。スマホを見ながらは絶対 NG。",
          },
        ],
        itemsEn: [
          {
            q: "I heard head halters are abusive",
            a: "Misconception. A Gentle Leader works like a horse halter — it gently steers the head without putting pressure on the neck. Misuse (yanking) can be uncomfortable, but with correct conditioning most behaviorists and vets recommend them.",
          },
          {
            q: "Isn't a muzzle cruel?",
            a: "When the alternative is poisoning from scavenging or a bite incident, a muzzle protects the dog. Basket-type (Baskerville Ultra) allows panting, drinking, and taking treats — minimal welfare impact. Avoid cloth/closed muzzles for any extended duration.",
          },
          {
            q: "What should I put in a Kong?",
            a: "Soaked kibble + a little yogurt or thick paste, then freeze it. Frozen takes longer to extract. Start with looser fillings to build success, ramp up difficulty.",
          },
          {
            q: "Where can I use a long line?",
            a: "Open fields, riverbanks, quiet parks — any place you can see entanglement risks coming. 9m lines are great but tangle around strangers; never check your phone while using one.",
          },
        ],
      },
    ],
  },
  {
    slug: "mix-breed-fit-guide",
    titleJa: "MIX犬・体型違いの犬の服選び完全ガイド",
    titleEn: "Sizing dog clothes for mixed breeds and odd shapes",
    leadJa:
      "MIX犬・ダックスフンドのような胴長犬・フレンチブルのような胸囲広めの短頭種は、ブランドの「S/M/L」 表記だけでは合いません。胸囲・首回り・背丈の 3 軸で実測してから選ぶのが鉄則。本ガイドでは採寸の手順、ブランドごとのサイズ展開の癖、フィット失敗を防ぐ「2 段階購入」 戦略、すぐ脱げてしまう子への対策まで、わんプロブレムの 200 商品から検証済みのアイテムをご紹介します。",
    leadEn:
      "Mixed breeds, dachshunds, French bulldogs — brand-default S/M/L sizing fails them all. Measure chest girth, neck, and back length first. This guide covers measurement technique, brand-specific quirks, a 2-step purchase strategy to avoid fit failures, and what to do for dogs whose clothes constantly slip off.",
    publishedAt: "2026-05-10",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["apparel"],
      concerns: ["mix-fit", "slips-off", "cute-outing", "small-breed"],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "サイズ失敗ゼロの 5 原則",
        titleEn: "Five rules for zero-failure sizing",
        itemsJa: [
          {
            headline: "胸囲・首回り・背丈の 3 軸を 1cm 単位で実測する",
            body:
              "前足の付け根の少し後ろを胸囲、首の付け根を首回り、首の付け根から尻尾の付け根までを背丈。柔らかいメジャーで指 2 本入る余裕で計測してください。S/M/L の表だけ見て買うと半分以上が「微妙にきつい / ゆるい」 で着てくれません。",
          },
          {
            headline: "ブランドごとに 「平均犬」 の体型が違う",
            body:
              "ALPHAICON は MIX 犬・小型 ~ 中型を想定したフィット感。Mandarine Brothers は柴犬・コーギー寄り。Frenchic は短頭種専用。Pooch Outfitters はダックス専用。先にブランドの想定体型を見て、自分の子の体型と一致するブランドを 2-3 個に絞ると失敗が激減します。",
          },
          {
            headline: "胴長犬種は 「背丈」 が決め手",
            body:
              "ダックスフンド・コーギー・MIX 胴長系は胸囲ベースで選ぶと背中が短くてお尻が出るか、背中合わせると胸囲がブカブカ。Pooch Outfitters Long Body のような胴長専用パターンか、背丈レンジが胸囲とは独立した SKU 展開のブランドを選んでください。",
          },
          {
            headline: "脱げやすい子は 「お腹側ベルクロ + 後ろ足穴」 タイプを",
            body:
              "脚を動かすと前にずれる、頭を振ると首から抜ける ——構造的にお腹側で固定する設計と、後ろ足のループ穴があれば回転 / 滑り上がりを物理的に止められます。Frenchic ワイドチェスト ベスト など短頭種向けは特にこの構造を持ちます。",
          },
          {
            headline: "「2 段階購入」 で大失敗を防ぐ",
            body:
              "気になるブランドが見つかったら、最初に 1 着だけ Amazon / 楽天 等で買って試着。ジャストフィットを確認してから同ブランドの他色 / 他種類をまとめ買い。フィット未確認のままシーズン分まとめ買いして全部合わなかった ——これが最大の損失です。",
          },
        ],
        itemsEn: [
          {
            headline: "Measure chest, neck, and back to the centimeter",
            body:
              "Chest just behind the front legs, neck at the base, back from neck base to tail base. Soft tape, 2-finger slack. Skip this step and half your purchases will be slightly off.",
          },
          {
            headline: "Brands have different 'average dog' assumptions",
            body:
              "ALPHAICON targets mixed and small-medium. Mandarine Brothers leans Shiba/Corgi. Frenchic is short-faced specialty. Pooch Outfitters is dachshund specialty. Match your dog's body type to the brand's intended one and your hit rate jumps.",
          },
          {
            headline: "For long-bodied dogs, back length is the deciding axis",
            body:
              "Dachshunds, corgis, long-bodied mixes: chest-first sizing leaves the back exposed; back-first sizing makes the chest baggy. Pick brands with long-body-specific patterns or independent back-length SKUs.",
          },
          {
            headline: "If clothes slip off, look for belly velcro + rear leg loops",
            body:
              "Movement-induced slipping is structural. Belly-side closure plus rear-leg loops physically prevent rotation and ride-up. Frenchic's wide-chest vest does this for short-faced breeds.",
          },
          {
            headline: "Buy ONE first, then bulk",
            body:
              "Found a brand? Buy a single piece, fit-check, then go back for color variants and seasonal duplicates. Don't bulk-buy a season's worth before the fit is confirmed.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "編集部のおすすめアイテム",
        titleEn: "Editor's picks",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "MIX犬の場合、親犬種が分からないと選べませんか?",
            a: "親犬種が分からなくても、自分の子の胸囲・首回り・背丈を実測して数値で選べば問題ありません。商品ページのサイズ表に必ず数値レンジが書かれているので、その範囲に入るサイズを選ぶだけです。",
          },
          {
            q: "成長中の子犬には大きめを買って育てるべき?",
            a: "大きめを買って育つのを待つのは推奨しません。脱げやすく動きを阻害し、結果として服を嫌がる原因に。成長期はワンサイズ刻みで実用フィット品を都度買い替えるのが、結局コスパも良いです。",
          },
          {
            q: "サイズが合わなかった服は返品できますか?",
            a: "ブランド・販売店によりポリシーが異なります。Amazon は 30 日以内の試着返品可 (商品状態次第)、楽天は店舗ごとに異なるため購入前に必ず返品ポリシーを確認してください。タグ・包装は捨てずに保管を。",
          },
          {
            q: "夏服と冬服でサイズ感は変わりますか?",
            a: "変わります。夏のメッシュ素材は伸びるので胸囲ジャストでも快適、一方冬のダウンは中綿の厚みで実寸より 1-2cm 縮む感覚。冬服は夏服より 1 サイズ大きめ、または冬服専用 SKU を選んでください。",
          },
        ],
        itemsEn: [
          {
            q: "What if I don't know my mixed dog's parent breeds?",
            a: "You don't need to. Just measure chest, neck, and back length and pick the size whose stated range covers your numbers.",
          },
          {
            q: "Should I buy big for a growing puppy?",
            a: "No. Loose clothes slip and discourage the dog from wearing anything. Buy correctly-sized pieces and replace as the dog grows — net cost is similar, comfort is much higher.",
          },
          {
            q: "Can I return clothes that don't fit?",
            a: "Depends on the merchant. Amazon allows 30-day try-on returns in most cases. Rakuten policies vary by shop. Always check before buying and keep tags/packaging.",
          },
          {
            q: "Does sizing differ for summer vs winter clothes?",
            a: "Yes. Mesh summer wear stretches, so a snug fit works. Down jackets effectively run smaller because of the fill. Size up by one for winter, or use brands with winter-specific SKUs.",
          },
        ],
      },
    ],
  },
  {
    slug: "outdoor-camping-guide",
    titleJa: "犬とのアウトドア・キャンプ・長時間散歩 完全ガイド",
    titleEn: "Outdoor adventures with dogs — camping, hiking, long walks",
    leadJa:
      "アクティブな飼い主と一緒に山を歩く犬は、平凡な散歩しかしない犬の 3 倍長生きするとも言われます (US ペット予防医学会 2024)。とはいえ装備なしで連れ出すと脱水・足裏の怪我・夜間の事故などリスクは多い。本ガイドでは長時間散歩から本格キャンプ・防災避難まで、安全に楽しむための装備をわんプロブレムの 200 商品から厳選してご紹介します。",
    leadEn:
      "Active dogs that hike with their humans live up to 3× longer than couch-only dogs, per 2024 pet preventive medicine research (US). But unequipped trips risk dehydration, paw injuries, and night-time accidents. This guide covers gear from long walks to serious camping to disaster evacuation — all narrowed down from our 200-product catalog.",
    publishedAt: "2026-05-10",
    authorJa: "わんプロブレム編集部",
    authorEn: "WanProblem editorial team",
    productQuery: {
      categories: ["env", "apparel", "toy"],
      concerns: [
        "outdoor-camping",
        "disaster-prep",
        "long-walker",
        "dog-run",
        "active-sports",
        "multi-dog",
      ],
      limit: 6,
    },
    sections: [
      { kind: "lead", bodyJa: "", bodyEn: "" },
      {
        kind: "points",
        titleJa: "アウトドア装備の優先順位 5 段階",
        titleEn: "Five tiers of outdoor gear priority",
        itemsJa: [
          {
            headline: "Tier 1: 給水ボトル + 折りたたみボウル (必須)",
            body:
              "犬は人より 5 倍熱中症になりやすい。30 分以上の屋外活動なら水は絶対必要です。Ruffwear Quencher のような折りたたみシリコンボウルは丸めてリュックに入る。500ml ペットボトル + ボウルで 中型犬 1 時間分。",
          },
          {
            headline: "Tier 2: 反射 / LED 装備 (夜散歩・キャンプで命を守る)",
            body:
              "夕方以降の散歩・キャンプ場では犬の存在を 30m 手前で他人に分からせる必要があります。Mighty Paw LED カラーは USB 充電式で点滅 / 点灯切替、雨天対応。これがないと自転車・車との接触事故リスクが跳ね上がります。",
          },
          {
            headline: "Tier 3: バックパック / ハーネス (中長距離向け)",
            body:
              "1 時間以上歩くなら胴に重さが分散するアクティブハーネス + (中型 ~ 大型なら) 犬用バックパックを。Kurgo Dog Backpack は犬自身が水・おやつ・処理袋を背負う設計で、人間の荷物が劇的に減ります。Ruffwear Front Range と組み合わせるとフィットも安定。",
          },
          {
            headline: "Tier 4: ロングリード + ペン (オフリード代替 + 多頭飼育)",
            body:
              "ドッグラン以外でオフリードは法律 / マナー違反。9m ロングリード (Mighty Paw) で「ほぼフリー」 を実現し、休憩時には MidWest 折りたたみペンで多頭飼育の犬同士を分離。キャンプサイトでは必須。",
          },
          {
            headline: "Tier 5: 防災キット (年に 1 回点検する)",
            body:
              "Bivvy Pet Emergency Kit のようなパッケージは 7 日分の最低限 (フード缶 / 水 / 折りたたみボウル / ID タグ / リード) を 1 つにまとめてくれる。普段は玄関・車に置きっぱなしで OK。年 1 回中身の有効期限チェックを。",
          },
        ],
        itemsEn: [
          {
            headline: "Tier 1: Water bottle + collapsible bowl (non-negotiable)",
            body:
              "Dogs overheat 5× faster than people. Any outing over 30 minutes needs water. A silicone collapsible bowl (Ruffwear Quencher) packs flat in a backpack. 500ml + bowl = ~1 hour for a medium dog.",
          },
          {
            headline: "Tier 2: Reflective / LED gear (life-safety after dusk)",
            body:
              "Walks and campsites after dusk need 30m visibility. Mighty Paw's USB-rechargeable LED collar runs steady or flashing, weather-resistant. Without this, bike/car incident risk spikes.",
          },
          {
            headline: "Tier 3: Backpack / active harness (for distance)",
            body:
              "Walks over an hour need load-spreading active harness + (for medium/large dogs) a pack the dog carries. Kurgo Dog Backpack lets the dog haul their own water, treats, and waste bags — drops human load drastically.",
          },
          {
            headline: "Tier 4: Long line + pen (off-leash alternative + multi-dog)",
            body:
              "Off-leash outside dog runs is illegal/rude in most JP locations. A 9m line (Mighty Paw) gives 'effective freedom'. Pair with a foldable pen (MidWest) at rest stops to separate dogs in multi-dog setups. Essential at campsites.",
          },
          {
            headline: "Tier 5: Disaster kit (audit yearly)",
            body:
              "Bivvy Pet Emergency Kit packages 7 days of basics (canned food, water, folding bowl, ID tag, leash) in one bag. Keep at the door or in the car. Audit expirations annually.",
          },
        ],
      },
      {
        kind: "top_picks",
        titleJa: "編集部のおすすめアイテム",
        titleEn: "Editor's picks",
        productIds: [],
      },
      {
        kind: "faq",
        titleJa: "よくある質問",
        titleEn: "FAQ",
        itemsJa: [
          {
            q: "犬用シューズは本当に必要ですか?",
            a: "夏のアスファルト (60℃ 以上で肉球火傷)、冬の融雪剤 (化学やけど)、雪山のクラスト氷 (切創) ではほぼ必須。普通の散歩なら不要です。シューズ嫌いな子は、まず室内で短時間着けて慣らす段階から。",
          },
          {
            q: "ドッグラン専用の装備とは?",
            a: "首輪 + 簡易リード + 水ボトルがあれば最低限十分。リードはランの中では外しますが、移動時に必要。あと意外と忘れがちなのが処理袋とウェットティッシュ。地面に座らせるなら携帯マットも便利です。",
          },
          {
            q: "災害時に犬を連れて避難所に入れますか?",
            a: "自治体によります。多くは「同行避難」 (避難所まで同行 OK、ただし犬は別エリア収容) は可、「同伴避難」 (室内で一緒) は限定的。事前に地元自治体の指針確認 + キャリー・ID タグ・3 日分のフード備蓄が必須です。",
          },
          {
            q: "多頭飼育のキャンプで気をつけることは?",
            a: "テント内では犬同士の距離を 1m 以上確保し、給餌・水飲みは別ボウル。サイト内ではロングリード同士の絡まり防止のため動線を分離。慣れない環境で犬同士の喧嘩リスクが上がるので、最初の数時間は飼い主が必ず目を離さないこと。",
          },
        ],
        itemsEn: [
          {
            q: "Does my dog really need shoes?",
            a: "For summer asphalt (60°C+ burns paws), winter de-icing salt (chemical burn), or snowy crusty ice (cuts) — yes. For normal walks, no. Shoe-resistant dogs: introduce indoors first, short sessions.",
          },
          {
            q: "What's the minimum dog-run kit?",
            a: "Collar, simple leash, water bottle. The leash comes off in the run but you need it in transit. People forget poo bags and wipes. Bring a portable mat if your dog will sit on the ground.",
          },
          {
            q: "Can I bring my dog to a Japanese disaster shelter?",
            a: "Depends on the municipality. Most allow 'companion evacuation' (dog stays in a separate area at the shelter); fewer allow 'cohabitation evacuation' (in the same room). Check your local government's policy in advance. Always have a carrier, ID tag, and 3+ days of food ready.",
          },
          {
            q: "Multi-dog camping tips?",
            a: "Inside the tent, keep dogs at least 1m apart and feed/water from separate bowls. Outside, separate the long lines so they don't tangle. Dog-dog conflict spikes in unfamiliar settings — supervise the first few hours actively.",
          },
        ],
      },
    ],
  },
];

/**
 * 商品ページに「関連する選び方ガイド」を出すための逆引き。
 * 商品の category が guide.productQuery.categories に含まれ、かつ concerns に
 * 1 件でも重なりがある guide を返す。重なり件数が多い順 (= 関連性が強い順)。
 */
export function findRelatedGuides(
  product: Product,
  limit = 3,
): { guide: Guide; matchedConcerns: number }[] {
  return guides
    .map((guide) => {
      const categoryMatch = guide.productQuery.categories.includes(
        product.category,
      );
      if (!categoryMatch) return null;
      const matchedConcerns = product.concerns.filter((c) =>
        guide.productQuery.concerns.includes(c),
      ).length;
      if (matchedConcerns === 0) return null;
      return { guide, matchedConcerns };
    })
    .filter((x): x is { guide: Guide; matchedConcerns: number } => x !== null)
    .sort((a, b) => b.matchedConcerns - a.matchedConcerns)
    .slice(0, limit);
}

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

/**
 * ある悩み (concern id) を扱っている guide を返す。
 * /concerns/[id] LP で「この悩みに関連するガイド」 セクションを描画する用途。
 *
 * SEO 上、悩み LP → 関連ガイド の双方向リンクで内部リンクトポロジが密になる
 * (各悩みが「商品 + 編集記事」 の両方の入口を持つ)。
 */
export function findGuidesForConcern(concernId: string): Guide[] {
  return guides.filter((g) => g.productQuery.concerns.includes(concernId));
}

/**
 * ある guide が扱う悩み id 配列を返す (= guide.productQuery.concerns の薄い alias)。
 * /guides/[slug] 詳細ページで「関連する悩み別ページ」 chip 列を描画する用途。
 */
export function getConcernIdsForGuide(slug: string): string[] {
  const g = getGuide(slug);
  return g ? g.productQuery.concerns : [];
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
