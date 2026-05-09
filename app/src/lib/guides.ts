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
        titleJa: "子犬期の必需品 8 選",
        titleEn: "Eight puppy essentials",
        productIds: [],
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
        productIds: [],
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
