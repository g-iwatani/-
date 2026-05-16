import type { Concern } from "./concerns";

export type Cause = {
  /** 表示順 (01-99)。 */
  num: string;
  /** 原因名 (短)。 */
  name: string;
  /** 全体に占める割合 (%) — 編集側の主観値で OK。0-100。 */
  pct: number;
  /** カテゴリカラー (左バー)。globals.css のトークンか hex。 */
  color: string;
  /** 当てはまる状況のチップ列。 */
  situations: string[];
  /** 「あなたの子に当てはまる?」の診断質問 (1-3 個)。 */
  diagnosis: string[];
  /** 推奨アクション (1-3 個)。各 title + detail。 */
  actions: { title: string; detail: string }[];
  /** 関連ガイドへのリンク先 slug (任意)。 */
  guideSlug?: string;
};

/**
 * 悩みごとの原因マトリクス。登録された concernId だけ <CauseMatrix /> が
 * 描画される。未登録の concern は section ごと非表示。
 *
 * 編集側で書き下ろすコンテンツなので、新しい悩みに展開する際は
 * 監修者と一緒にデータを入れる想定。MVP は 2 件先行投入。
 *
 * color は既存の concerns カテゴリーカラー (season=#c98c47, behavior=#a85530,
 * care=#6b8e4e, purpose=#8b7355, size=#d97a4e) を踏襲。
 */
export const concernCauses: Record<string, Cause[]> = {
  // 散歩拒否
  "wont-walk": [
    {
      num: "01",
      name: "暑さ・路面温度",
      pct: 42,
      color: "#c98c47",
      situations: ["6-9月", "14時前後", "黒系アスファルト"],
      diagnosis: [
        "散歩を拒否する時間帯が決まっていますか?",
        "地面に手のひらを 5 秒置いて熱いですか?",
      ],
      actions: [
        {
          title: "時間帯を 早朝 / 夜 にシフト",
          detail: "5-7時または 20 時以降。地面温度 30℃ 以下を目安に。",
        },
        {
          title: "クールベスト + 携帯ファン を装備",
          detail: "気化熱式 + 局所送風で体表温を -1.5℃。",
        },
        {
          title: "2-3 日 で改善傾向を確認",
          detail: "装備直後でも嫌がる場合は別原因の可能性。",
        },
      ],
      guideSlug: "summer-cooling-guide",
    },
    {
      num: "02",
      name: "警戒・恐怖",
      pct: 28,
      color: "#a85530",
      situations: ["工事音", "他犬遭遇", "社会化不足"],
      diagnosis: [
        "特定の場所・音で固まりますか?",
        "子犬期 (3-16週) に多様な刺激に触れる機会が少なかった?",
      ],
      actions: [
        {
          title: "ルートを変えて 成功体験 を積む",
          detail: "静かな道 + 距離短くで「歩けた」回数を貯める。",
        },
        {
          title: "ハーネス + 反射素材 で安心を視覚化",
          detail: "首輪より体を支えるハーネスが恐怖時に安全。",
        },
        {
          title: "専門家相談 を 1ヶ月以内に",
          detail: "ドッグトレーナーの初回セッション (¥8-15k) で軌道修正。",
        },
      ],
    },
    {
      num: "03",
      name: "体調・関節",
      pct: 18,
      color: "#6b8e4e",
      situations: ["シニア期", "急な拒否増", "特定動作で痛がる"],
      diagnosis: [
        "7歳以上 + 拒否が増えてきていますか?",
        "段差・階段・立ち上がりで痛がる素振りはありますか?",
      ],
      actions: [
        {
          title: "動物病院 で関節 / 心臓を確認",
          detail: "突然の拒否は内科疾患のサインのことが多い。",
        },
        {
          title: "関節サプリ + ハーネス見直し",
          detail: "グルコサミン系 + 首に負担の少ない Y 字ハーネス。",
        },
        {
          title: "散歩を 短時間 × 複数回 に分割",
          detail: "1 回 30 分 × 1 → 15 分 × 2 へ。",
        },
      ],
    },
    {
      num: "04",
      name: "ハーネス・装備の不快",
      pct: 12,
      color: "#8b7355",
      situations: ["新調直後", "サイズ違い", "首輪きつい"],
      diagnosis: [
        "装備を新しくしてから拒否が始まりましたか?",
        "ハーネスの脇 (前足の付け根) に擦れの跡はないですか?",
      ],
      actions: [
        {
          title: "胸囲・首回り を実測",
          detail:
            "指 2 本入る余裕で締める。実測値でメーカー早見表を再選定。",
        },
        {
          title: "Y字 / H字 ハーネス に切替",
          detail:
            "前足の動きを邪魔しない構造。1 段サイズ大きめが正解の場合も。",
        },
        {
          title: "室内で 30 分 装着して慣らす",
          detail: "装備に「散歩 = 楽しい」 を連合させる。",
        },
      ],
    },
  ],

  // 抜け毛
  "heavy-shedding": [
    {
      num: "01",
      name: "換毛期 (季節)",
      pct: 55,
      color: "#c98c47",
      situations: ["3-5月", "10-11月", "ダブルコート犬種"],
      diagnosis: [
        "柴・コーギー・ゴールデン等のダブルコート犬種ですか?",
        "春と秋に「ごっそり抜ける」感覚はありますか?",
      ],
      actions: [
        {
          title: "毎日 5 分 のブラッシング",
          detail:
            "アンダーコートブラシで下毛を取り除く。掃除負担が劇的に減る。",
        },
        {
          title: "週 1-2 回 のシャンプー",
          detail: "毛のすき間に溜まる抜け毛を流す。乾燥は徹底的に。",
        },
        {
          title: "抜け毛キャッチ用ウェア",
          detail: "通気性のあるカバーオールで床への落ち毛を 70% カット。",
        },
      ],
    },
    {
      num: "02",
      name: "ブラッシング不足",
      pct: 25,
      color: "#a85530",
      situations: ["週 1 回以下", "ブラシ嫌がる", "皮膚トラブル"],
      diagnosis: [
        "週 3 回未満のブラッシング頻度ですか?",
        "ブラシを嫌がって短時間で終わってしまう?",
      ],
      actions: [
        {
          title: "やわらかいラバーブラシ から始める",
          detail:
            "肌当たりが優しく、ブラシ = 気持ちいい の連合を作る。",
        },
        {
          title: "ご褒美と組み合わせて 5 分習慣化",
          detail:
            "歯磨き同様に「毎日のセット」 にすると犬も諦める。",
        },
        {
          title: "毛玉になったら はさみ無理切りは NG",
          detail:
            "強引にハサミを入れると皮膚を切る事故が多い。トリマー相談を。",
        },
      ],
    },
    {
      num: "03",
      name: "栄養・体調",
      pct: 12,
      color: "#6b8e4e",
      situations: ["脂質不足", "アレルギー", "皮膚炎"],
      diagnosis: ["毛艶が以前より明らかに悪い?", "皮膚に赤み・フケがある?"],
      actions: [
        {
          title: "オメガ 3/6 サプリ を 1ヶ月試す",
          detail:
            "サーモンオイル / 亜麻仁油など。毛艶と皮膚に直接効く。",
        },
        {
          title: "アレルギー検査 を動物病院で",
          detail:
            "食物・環境アレルギーが抜け毛増加の隠れ原因のことも。",
        },
        {
          title: "シャンプー剤の見直し",
          detail: "刺激の強い洗浄成分が皮膚を荒らしている可能性。",
        },
      ],
    },
    {
      num: "04",
      name: "室内環境",
      pct: 8,
      color: "#8b7355",
      situations: ["乾燥", "エアコン直風", "ベッド・カーペット蓄積"],
      diagnosis: [
        "冬の室内が乾燥していますか? (湿度 30% 以下)",
        "犬のベッドや布製ソファに毛がびっしり溜まっていませんか?",
      ],
      actions: [
        {
          title: "加湿器 で湿度 50-60%",
          detail: "乾燥は皮膚バリアを壊して抜け毛を促進する。",
        },
        {
          title: "週 1 で 寝具・ベッド の洗濯",
          detail:
            "蓄積した毛がアレルゲン化する前に物理的に除去。",
        },
        {
          title: "ロボット掃除機 / コードレスサイクロン",
          detail: "毎日 10 分の掃除導線を機械化する。",
        },
      ],
    },
  ],
};

export function getCausesForConcern(concernId: string): Cause[] | undefined {
  return concernCauses[concernId];
}

/** Concern 型に displayCauses ヘルパが必要ない場合、これで判定できる。 */
export function hasCauseMatrix(concern: Concern): boolean {
  return (concernCauses[concern.id]?.length ?? 0) > 0;
}
