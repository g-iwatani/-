/**
 * 商品名 (主に楽天人気 + Amazon ベストセラー) から concerns ID を推論する。
 *
 * 設計方針:
 *  - HIGH PRECISION 優先: 誤検出は悩み LP に無関係な商品を流して UX を壊す。
 *    広く拾うより、確度の高いキーワードのみマップする。
 *  - curated (rawProducts) には適用しない: 既に手動タグ付けされているため。
 *  - 既存 concerns に追加する形 (上書きせず union)。
 *
 * 結果は呼び出し側で dedup される前提。
 */
const KEYWORDS: Array<[RegExp, string[]]> = [
  // 引っ張り・しつけ
  [/引[っ]?張り防止|引[っ]?ぱり防止|ヘッドカラー|ジェントル[\s]?リーダー/u, ["pulls-leash"]],

  // 吠え (汎用 + 来客時 + 他犬反応)
  [/無駄吠え|吠え対策|静音.*しつけ|サイレンサー/u, ["barking"]],
  [/来客.*吠え|チャイム.*吠え/u, ["barking-guests"]],
  [/他犬.*吠え|散歩.*吠え/u, ["barking-other-dogs"]],

  // 自転車反応
  [/自転車.*反応|リアクティブ/u, ["reactive-bicycle"]],

  // 拾い食い
  [/口輪|マズル|拾い食い防止/u, ["scavenging"]],

  // 噛む
  [/コング|KONG|デュラチュー|壊れにくい.*おもちゃ|頑丈.*おもちゃ|タフ.*おもちゃ/iu,
    ["destroys-toys"]],
  [/噛み癖|甘噛み/u, ["biting-habit"]],

  // 不安・音響
  [/雷|花火|騒音|サンダーシャツ|ThunderShirt/iu, ["noise-scared"]],
  [/フェロモン|アダプティル|Adaptil|リラックス.*スプレー/iu, ["anxiety-general"]],
  [/留守番|お留守番|分離.*不安/u, ["lonely-when-alone", "destructive-when-alone"]],
  [/ぬいぐるみ.*心音|スナッグル/u, ["lonely-when-alone"]],

  // 歯
  [/歯磨き|デンタル|歯垢|口臭|歯周/u, ["dental-care"]],

  // 食事
  [/早食い|スローフィーダー|ノーズワーク|スナッフル/u, ["fast-eater"]],
  [/偏食|食欲.*ない|食いつき/u, ["picky-eater"]],
  [/ダイエット|減量|低カロリー|肥満.*予防/u, ["weight-management"]],
  [/おねだり|テーブル.*物乞い/u, ["begging-for-food"]],

  // 体型・年齢
  [/超小型|小型犬|チワワ|トイ[\s]?プードル|ヨーキー|マルチーズ|ポメラニアン/u,
    ["small-breed"]],
  [/シニア|高齢犬|老犬|介護/u, ["senior-dog"]],
  [/子犬|パピー|puppy/iu, ["puppy"]],
  [/胴長|ダックス専用|コーギー専用/u, ["long-back"]],
  [/ワイド.*胸|胸囲.*太/u, ["wide-chest"]],

  // 季節
  [/冷感|クール.*マット|クール.*ベスト|アイス.*クール|ひんやり/u, ["hot-summer"]],
  [/防寒|あったか|フリース|ダウンジャケット|ニット.*ウェア|裏起毛/u,
    ["cold-winter"]],
  [/レインコート|防水.*ウェア|撥水.*ウェア|雨.*散歩/u, ["rainy-walk"]],

  // 肉球・足
  [/(?:犬|ペット).*ブーツ|肉球.*保護|アスファルト.*やけど|シューズ.*犬/u,
    ["asphalt-hot"]],
  [/肉球.*ワックス|肉球.*クリーム|パッドケア|マッシャー/u, ["cold-paws"]],

  // ケア
  [/抜け毛|脱毛|デシェディング|ファーミネーター/u, ["heavy-shedding"]],
  [/長毛.*ブラシ|もつれ|スリッカー.*ブラシ/u, ["long-coat-grooming"]],
  [/シャンプー嫌|お風呂嫌|入浴.*嫌/u, ["bath-hates"]],
  [/ブラッシング嫌|ブラシ嫌/u, ["brushing-hates"]],
  [/涙やけ|目やに/u, ["tear-stains-care"]],
  [/耳.*クリーナー|イヤー.*クリーナー|耳.*ケア/u, ["dirty-ears"]],
  [/爪切り|爪.*グラインダー|爪.*やすり|爪.*ヤスリ/u, ["nail-care-hates"]],

  // 散歩・運動量
  [/長距離.*散歩|ロング.*ウォーク/u, ["long-walker"]],
  [/アジリティ|アクティブ.*犬|ランニング.*犬/u, ["active-sports"]],
  [/キャンプ.*犬|アウトドア.*犬|登山.*犬/u, ["outdoor-camping"]],
  [/ドッグラン/u, ["dog-run"]],
  [/防災.*セット|緊急.*セット|備蓄.*ペット/u, ["disaster-prep"]],

  // 移動
  [/車.*シートベルト|ドライブ.*クレート|車載.*ハーネス|車載.*シート/u,
    ["travel-car"]],
  [/車酔い|乗り物酔い/u, ["carsick"]],
  [/キャリー(?:バッグ|ケース)|公共.*交通.*ペット|電車.*ペット/u, ["public-transport"]],
  [/カフェ.*マナー|お店.*同伴/u, ["cafe-friendly"]],
  [/ペットホテル|預ける/u, ["boarding"]],

  // 外出・ファッション
  [/お出かけ.*服|可愛い.*服|おしゃれ.*ウェア|きせかえ.*犬/u, ["cute-outing"]],

  // トイレ
  [/ペットシーツ|犬用シート|トイレ.*シート|おしっこ.*シート|うんち袋|エチケット袋|消臭.*シーツ/u,
    ["potty-training"]],

  // ミックス犬
  [/ミックス犬|雑種.*ハーネス/u, ["mix-fit"]],

  // 多頭・子供
  [/多頭飼い/u, ["multi-dog"]],
  [/お子様.*安全|子供.*ペット/u, ["with-kids"]],

  // 引越し
  [/引越し.*ペット|環境変化.*対応/u, ["moving-home"]],

  // 静電気
  [/静電気.*防止|静電気.*ブラシ/u, ["static-electricity"]],

  // 歩かない
  [/歩かない.*対策/u, ["wont-walk"]],

  // 飛びつき
  [/飛びつき.*防止/u, ["jumps-on-people"]],

  // 呼び戻し
  [/呼び戻し|ロング.*リード/u, ["wont-come"]],

  // 脱げる
  [/脱げにくい.*ハーネス|抜けない.*ハーネス/u, ["slips-off"]],
];

export function inferConcerns(
  text: string,
  hints?: { brand?: string; category?: string },
): string[] {
  const haystack = `${text} ${hints?.brand ?? ""} ${hints?.category ?? ""}`;
  const out = new Set<string>();
  for (const [re, ids] of KEYWORDS) {
    if (re.test(haystack)) {
      for (const id of ids) out.add(id);
    }
  }
  return [...out];
}

/**
 * 既存タグと推論タグの union (dedup)。
 * curated (手動タグ済み) 商品の concerns に追加する用途で使用しても安全。
 */
export function mergeInferredConcerns(
  existing: readonly string[],
  text: string,
  hints?: { brand?: string; category?: string },
): string[] {
  const set = new Set(existing);
  for (const c of inferConcerns(text, hints)) set.add(c);
  return [...set];
}
