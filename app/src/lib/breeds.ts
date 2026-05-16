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
  /** チップ表示用 1 文字。未設定時は nameJa[0] を自動採用。 */
  displayChar?: string;
};

/** サイズカテゴリ別のデフォルト採寸値(個別指定がない時のフォールバック) */
const sizeDefaults: Record<
  BreedSize,
  { chest: number; back: number; neck: number }
> = {
  tiny: { chest: 32, back: 24, neck: 22 },
  small: { chest: 44, back: 32, neck: 30 },
  medium: { chest: 60, back: 44, neck: 38 },
  large: { chest: 80, back: 60, neck: 48 },
  giant: { chest: 96, back: 70, neck: 58 },
};

/**
 * 犬種マスタの定義タプル:
 * [id, nameJa, nameEn, size, weightMin, weightMax, popular?, chestAvg?, backAvg?, neckAvg?]
 *
 * 採寸が省略された場合は size に応じた sizeDefaults を使う。
 * 個別の値がある犬種はピンポイントで上書き。
 */
type BreedRow = readonly [
  string, // id
  string, // nameJa
  string, // nameEn
  BreedSize,
  number, // weightMin (kg)
  number, // weightMax (kg)
  boolean?, // popular?
  number?, // chestAvg (cm)
  number?, // backAvg (cm)
  number?, // neckAvg (cm)
];

const rows: BreedRow[] = [
  // ─── Tiny / 超小型 ───
  ["chihuahua", "チワワ", "Chihuahua", "tiny", 1.5, 3, true, 30, 22, 19],
  ["pomeranian", "ポメラニアン", "Pomeranian", "tiny", 1.5, 3.5, true, 33, 24, 21],
  ["maltese", "マルチーズ", "Maltese", "tiny", 2, 3.5, false, 32, 23, 20],
  ["yorkie", "ヨークシャテリア", "Yorkshire Terrier", "tiny", 2, 3.5, false, 31, 22, 20],
  ["miniature-pinscher", "ミニチュアピンシャー", "Miniature Pinscher", "tiny", 4, 5, false, 36, 28, 24],
  ["affenpinscher", "アーフェンピンシャー", "Affenpinscher", "tiny", 3, 6, false, 35, 26, 23],
  ["brussels-griffon", "ブリュッセルグリフォン", "Brussels Griffon", "tiny", 3.5, 5.5, false, 36, 25, 26],
  ["chinese-crested", "チャイニーズクレステッド", "Chinese Crested", "tiny", 4, 6, false, 36, 28, 24],
  ["japanese-chin", "狆(チン)", "Japanese Chin", "tiny", 1.5, 7, false, 36, 26, 24],
  ["english-toy-spaniel", "イングリッシュトイスパニエル", "English Toy Spaniel", "tiny", 4, 6, false, 38, 26, 26],
  ["toy-fox-terrier", "トイフォックステリア", "Toy Fox Terrier", "tiny", 1.5, 3, false, 32, 24, 22],
  ["russian-toy", "ロシアントイ", "Russian Toy", "tiny", 1, 3, false, 30, 22, 20],
  ["chiwawa-poodle", "チワプー", "Chi-poo", "tiny", 2, 5, false, 32, 24, 22],
  ["pomchi", "ポメチワワ", "Pomchi", "tiny", 2, 5, false, 32, 24, 21],
  ["yorkipoo", "ヨーキープー", "Yorkipoo", "tiny", 2, 5, false, 32, 24, 22],

  // ─── Small / 小型 ───
  ["toy-poodle", "トイプードル", "Toy Poodle", "small", 3, 5, true, 38, 28, 24],
  ["miniature-poodle", "ミニチュアプードル", "Miniature Poodle", "small", 7, 8, false, 50, 36, 32],
  ["dachshund", "ダックスフンド", "Dachshund", "small", 4, 9, true, 45, 36, 28],
  ["dachshund-mini", "ミニチュアダックスフンド", "Miniature Dachshund", "small", 4, 5, true, 36, 30, 24],
  ["french-bulldog", "フレンチブルドッグ", "French Bulldog", "small", 8, 14, true, 52, 32, 36],
  ["pug", "パグ", "Pug", "small", 6, 9, true, 50, 30, 34],
  ["shih-tzu", "シーズー", "Shih Tzu", "small", 4, 7, false, 42, 30, 27],
  ["miniature-schnauzer", "ミニチュアシュナウザー", "Miniature Schnauzer", "small", 5, 9, true, 46, 32, 30],
  ["cavalier", "キャバリア", "Cavalier King Charles Spaniel", "small", 6, 8, false, 44, 32, 30],
  ["bichon-frise", "ビションフリーゼ", "Bichon Frise", "small", 5, 7, false, 42, 30, 28],
  ["boston-terrier", "ボストンテリア", "Boston Terrier", "small", 5, 11, false, 48, 34, 32],
  ["italian-greyhound", "イタリアングレーハウンド", "Italian Greyhound", "small", 3, 5, false, 38, 30, 24],
  ["pekingese", "ペキニーズ", "Pekingese", "small", 3, 6, false, 44, 28, 30],
  ["lhasa-apso", "ラサアプソ", "Lhasa Apso", "small", 5, 8, false, 44, 32, 28],
  ["japanese-spitz", "日本スピッツ", "Japanese Spitz", "small", 5, 11, false, 48, 34, 32],
  ["cairn-terrier", "ケアーンテリア", "Cairn Terrier", "small", 6, 8, false, 42, 30, 28],
  ["west-highland", "ウエストハイランドホワイトテリア", "West Highland White Terrier", "small", 7, 10, false, 44, 32, 30],
  ["norfolk-terrier", "ノーフォークテリア", "Norfolk Terrier", "small", 5, 6, false, 42, 30, 28],
  ["norwich-terrier", "ノーリッチテリア", "Norwich Terrier", "small", 5, 6, false, 42, 30, 28],
  ["scottish-terrier", "スコティッシュテリア", "Scottish Terrier", "small", 8, 10, false, 48, 30, 32],
  ["sealyham-terrier", "シーリハムテリア", "Sealyham Terrier", "small", 7, 11, false, 46, 32, 30],
  ["dandie-dinmont", "ダンディディモントテリア", "Dandie Dinmont Terrier", "small", 8, 11, false, 48, 32, 32],
  ["bedlington-terrier", "ベドリントンテリア", "Bedlington Terrier", "small", 7, 10, false, 48, 36, 32],
  ["border-terrier", "ボーダーテリア", "Border Terrier", "small", 5, 7, false, 44, 32, 28],
  ["jack-russell", "ジャックラッセル", "Jack Russell Terrier", "small", 5, 8, false, 42, 30, 28],
  ["parson-russell", "パーソンラッセルテリア", "Parson Russell Terrier", "small", 6, 8, false, 44, 32, 30],
  ["smooth-fox-terrier", "スムースフォックステリア", "Smooth Fox Terrier", "small", 7, 8, false, 46, 34, 30],
  ["wire-fox-terrier", "ワイヤーフォックステリア", "Wire Fox Terrier", "small", 7, 9, false, 46, 34, 30],
  ["welsh-terrier", "ウェルシュテリア", "Welsh Terrier", "small", 9, 10, false, 50, 36, 32],
  ["lakeland-terrier", "レイクランドテリア", "Lakeland Terrier", "small", 7, 8, false, 46, 34, 30],
  ["manchester-terrier", "マンチェスターテリア", "Manchester Terrier", "small", 5, 10, false, 44, 32, 28],
  ["silky-terrier", "シルキーテリア", "Silky Terrier", "small", 4, 5, false, 38, 28, 24],
  ["australian-terrier", "オーストラリアンテリア", "Australian Terrier", "small", 5, 7, false, 42, 30, 28],
  ["coton-de-tulear", "コトンドテュレアール", "Coton de Tulear", "small", 4, 6, false, 40, 28, 26],
  ["havanese", "ハバニーズ", "Havanese", "small", 4, 6, false, 40, 30, 26],
  ["papillon", "パピヨン", "Papillon", "small", 3, 5, false, 36, 26, 22],
  ["phalene", "ファレーヌ", "Phalène", "small", 3, 5, false, 36, 26, 22],
  ["tibetan-spaniel", "チベタンスパニエル", "Tibetan Spaniel", "small", 4, 7, false, 42, 30, 28],
  ["tibetan-terrier", "チベタンテリア", "Tibetan Terrier", "small", 8, 14, false, 50, 36, 32],
  ["löwchen", "レーベンヒェン", "Löwchen", "small", 4, 8, false, 44, 32, 28],
  ["schipperke", "スキッパーキ", "Schipperke", "small", 4, 9, false, 46, 32, 30],
  ["shiba-mame", "豆柴", "Mame Shiba", "small", 3, 5, false, 42, 32, 28],
  ["king-charles", "キングチャールズスパニエル", "King Charles Spaniel", "small", 4, 6, false, 38, 28, 26],
  ["cockapoo", "コッカプー", "Cockapoo", "small", 5, 12, false, 48, 34, 32],
  ["maltipoo", "マルプー", "Maltipoo", "small", 3, 6, true, 36, 26, 24],
  ["shihpoo", "シープー", "Shih-poo", "small", 4, 8, false, 42, 30, 28],
  ["puggle", "パグル", "Puggle", "small", 7, 14, false, 52, 36, 32],
  ["morkie", "モーキー", "Morkie", "small", 2, 4, false, 34, 26, 24],

  // ─── Medium / 中型 ───
  ["shiba", "柴犬", "Shiba Inu", "medium", 8, 12, true, 55, 42, 34],
  ["corgi", "コーギー", "Pembroke Welsh Corgi", "medium", 10, 14, true, 58, 38, 36],
  ["cardigan-corgi", "カーディガンウェルシュコーギー", "Cardigan Welsh Corgi", "medium", 11, 17, false, 60, 40, 38],
  ["beagle", "ビーグル", "Beagle", "medium", 9, 13, false, 56, 40, 35],
  ["border-collie", "ボーダーコリー", "Border Collie", "medium", 14, 20, false, 64, 48, 38],
  ["sheltie", "シェルティ", "Shetland Sheepdog", "medium", 7, 10, false, 52, 38, 34],
  ["english-bulldog", "イングリッシュブルドッグ", "English Bulldog", "medium", 18, 25, false, 70, 36, 46],
  ["whippet", "ウィペット", "Whippet", "medium", 9, 19, false, 58, 50, 36],
  ["australian-shepherd", "オーストラリアンシェパード", "Australian Shepherd", "medium", 16, 32, false, 72, 50, 42],
  ["miniature-australian-shepherd", "ミニチュアアメリカンシェパード", "Miniature American Shepherd", "medium", 9, 18, false, 56, 42, 36],
  ["vizsla", "ビズラ", "Vizsla", "medium", 18, 30, false, 70, 52, 42],
  ["wirehaired-vizsla", "ワイヤーヘアードビズラ", "Wirehaired Vizsla", "medium", 20, 30, false, 70, 52, 42],
  ["cocker-spaniel", "コッカースパニエル", "Cocker Spaniel", "medium", 11, 14, false, 56, 38, 36],
  ["english-cocker", "イングリッシュコッカースパニエル", "English Cocker Spaniel", "medium", 12, 15, false, 58, 40, 36],
  ["english-springer", "イングリッシュスプリンガースパニエル", "English Springer Spaniel", "medium", 18, 25, false, 66, 46, 40],
  ["welsh-springer", "ウェルシュスプリンガースパニエル", "Welsh Springer Spaniel", "medium", 16, 25, false, 64, 44, 38],
  ["field-spaniel", "フィールドスパニエル", "Field Spaniel", "medium", 16, 23, false, 64, 44, 38],
  ["sussex-spaniel", "サセックススパニエル", "Sussex Spaniel", "medium", 16, 20, false, 62, 42, 38],
  ["clumber-spaniel", "クランバースパニエル", "Clumber Spaniel", "medium", 25, 38, false, 76, 48, 46],
  ["brittany", "ブリタニー", "Brittany", "medium", 14, 18, false, 60, 44, 38],
  ["schnauzer-standard", "スタンダードシュナウザー", "Standard Schnauzer", "medium", 14, 23, false, 64, 46, 40],
  ["wheaten-terrier", "アイリッシュソフトコーテッドウィートン", "Soft Coated Wheaten Terrier", "medium", 14, 18, false, 60, 44, 38],
  ["staffordshire-bull", "スタッフォードシャーブルテリア", "Staffordshire Bull Terrier", "medium", 11, 17, false, 60, 38, 38],
  ["american-staffordshire", "アメリカンスタッフォードシャーテリア", "American Staffordshire Terrier", "medium", 18, 32, false, 70, 46, 42],
  ["bull-terrier", "ブルテリア", "Bull Terrier", "medium", 22, 38, false, 72, 46, 44],
  ["miniature-bull-terrier", "ミニチュアブルテリア", "Miniature Bull Terrier", "medium", 11, 15, false, 58, 40, 36],
  ["airedale-terrier", "エアデールテリア", "Airedale Terrier", "medium", 22, 30, false, 70, 50, 42],
  ["irish-terrier", "アイリッシュテリア", "Irish Terrier", "medium", 11, 12, false, 58, 42, 36],
  ["kerry-blue-terrier", "ケリーブルーテリア", "Kerry Blue Terrier", "medium", 15, 18, false, 62, 44, 38],
  ["pumi", "プーミー", "Pumi", "medium", 8, 15, false, 54, 40, 34],
  ["puli", "プーリー", "Puli", "medium", 10, 15, false, 56, 42, 36],
  ["norwegian-elkhound", "ノルウェジアンエルクハウンド", "Norwegian Elkhound", "medium", 20, 25, false, 66, 48, 40],
  ["finnish-spitz", "フィンランドスピッツ", "Finnish Spitz", "medium", 12, 13, false, 56, 42, 36],
  ["swedish-vallhund", "スウェディッシュバルフンド", "Swedish Vallhund", "medium", 9, 14, false, 56, 38, 36],
  ["icelandic-sheepdog", "アイスランドシープドッグ", "Icelandic Sheepdog", "medium", 9, 14, false, 56, 40, 36],
  ["kishu-ken", "紀州犬", "Kishu Ken", "medium", 14, 27, false, 64, 48, 40],
  ["kai-ken", "甲斐犬", "Kai Ken", "medium", 11, 25, false, 60, 46, 38],
  ["hokkaido-ken", "北海道犬", "Hokkaido Ken", "medium", 20, 30, false, 66, 50, 40],
  ["shikoku-ken", "四国犬", "Shikoku Ken", "medium", 16, 25, false, 62, 48, 38],
  ["basenji", "バセンジー", "Basenji", "medium", 9, 11, false, 50, 40, 32],
  ["basset-hound", "バセットハウンド", "Basset Hound", "medium", 20, 30, false, 70, 46, 40],
  ["bloodhound", "ブラッドハウンド", "Bloodhound", "large", 36, 50, false, 88, 64, 56],
  ["beagle-harrier", "ビーグルハリアー", "Beagle-Harrier", "medium", 18, 22, false, 64, 46, 38],
  ["harrier", "ハリア", "Harrier", "medium", 20, 27, false, 68, 50, 40],
  ["pharaoh-hound", "ファラオハウンド", "Pharaoh Hound", "medium", 18, 25, false, 64, 48, 38],
  ["ibizan-hound", "イビザンハウンド", "Ibizan Hound", "medium", 20, 23, false, 66, 50, 40],
  ["portuguese-water-dog", "ポーチュギーズウォータードッグ", "Portuguese Water Dog", "medium", 16, 27, false, 66, 48, 40],
  ["spanish-water-dog", "スパニッシュウォータードッグ", "Spanish Water Dog", "medium", 14, 22, false, 60, 44, 38],
  ["lagotto-romagnolo", "ラゴットロマニョーロ", "Lagotto Romagnolo", "medium", 11, 16, false, 56, 42, 36],
  ["xoloitzcuintli", "ショロイッツクインツレ", "Xoloitzcuintli", "medium", 9, 25, false, 60, 46, 36],
  ["thai-ridgeback", "タイリッジバック", "Thai Ridgeback", "medium", 18, 32, false, 68, 50, 40],
  ["nova-scotia-duck", "ノヴァスコシアダックトーリングレトリバー", "Nova Scotia Duck Tolling Retriever", "medium", 17, 23, false, 64, 46, 40],
  ["catahoula-leopard", "カタフーラレオパード", "Catahoula Leopard Dog", "medium", 18, 35, false, 72, 50, 42],
  ["chow-chow", "チャウチャウ", "Chow Chow", "medium", 20, 32, false, 76, 46, 46],
  ["shar-pei", "シャーペイ", "Shar-Pei", "medium", 18, 30, false, 72, 46, 42],
  ["mudi", "ムーディ", "Mudi", "medium", 8, 13, false, 52, 40, 34],
  ["dutch-shepherd", "ダッチシェパード", "Dutch Shepherd", "medium", 23, 32, false, 70, 52, 42],
  ["belgian-tervuren", "ベルジアンタービュレン", "Belgian Tervuren", "medium", 20, 30, false, 68, 52, 40],
  ["belgian-malinois", "ベルジアンマリノア", "Belgian Malinois", "medium", 18, 36, false, 70, 52, 42],
  ["belgian-laekenois", "ベルジアンラケノア", "Belgian Laekenois", "medium", 20, 30, false, 68, 52, 40],
  ["belgian-groenendael", "ベルジアングローネンダール", "Belgian Groenendael", "medium", 20, 30, false, 68, 52, 40],

  // ─── Large / 大型 ───
  ["golden-retriever", "ゴールデンレトリバー", "Golden Retriever", "large", 25, 34, true, 78, 60, 48],
  ["labrador", "ラブラドールレトリバー", "Labrador Retriever", "large", 25, 36, true, 80, 60, 50],
  ["chesapeake-bay", "チェサピークベイレトリバー", "Chesapeake Bay Retriever", "large", 25, 36, false, 80, 60, 50],
  ["flat-coated", "フラットコーテッドレトリバー", "Flat-Coated Retriever", "large", 25, 36, false, 78, 58, 48],
  ["curly-coated", "カーリーコーテッドレトリバー", "Curly-Coated Retriever", "large", 27, 41, false, 80, 60, 50],
  ["husky", "シベリアンハスキー", "Siberian Husky", "large", 20, 28, false, 76, 60, 46],
  ["german-shepherd", "ジャーマンシェパード", "German Shepherd", "large", 28, 40, false, 84, 65, 52],
  ["doberman", "ドーベルマン", "Doberman Pinscher", "large", 27, 45, false, 86, 65, 52],
  ["rottweiler", "ロットワイラー", "Rottweiler", "large", 35, 60, false, 92, 60, 56],
  ["standard-poodle", "スタンダードプードル", "Standard Poodle", "large", 20, 32, false, 78, 56, 46],
  ["samoyed", "サモエド", "Samoyed", "large", 16, 30, false, 76, 56, 46],
  ["boxer", "ボクサー", "Boxer", "large", 25, 32, false, 76, 56, 48],
  ["akita", "秋田犬", "Akita", "large", 32, 59, true, 88, 65, 56],
  ["american-akita", "アメリカンアキタ", "American Akita", "large", 32, 59, false, 92, 66, 58],
  ["alaskan-malamute", "アラスカンマラミュート", "Alaskan Malamute", "giant", 32, 43, false, 88, 66, 54],
  ["bernese", "バーニーズマウンテンドッグ", "Bernese Mountain Dog", "giant", 35, 50, true, 92, 66, 56],
  ["greater-swiss-mountain", "グレータースイスマウンテンドッグ", "Greater Swiss Mountain Dog", "giant", 38, 65, false, 96, 70, 58],
  ["collie-rough", "ラフコリー", "Rough Collie", "large", 22, 34, false, 76, 58, 46],
  ["collie-smooth", "スムースコリー", "Smooth Collie", "large", 22, 34, false, 76, 58, 46],
  ["bearded-collie", "ビアデッドコリー", "Bearded Collie", "large", 18, 27, false, 70, 56, 44],
  ["old-english-sheepdog", "オールドイングリッシュシープドッグ", "Old English Sheepdog", "large", 27, 45, false, 84, 60, 52],
  ["dalmatian", "ダルメシアン", "Dalmatian", "large", 20, 32, false, 76, 58, 46],
  ["weimaraner", "ワイマラナー", "Weimaraner", "large", 25, 40, false, 80, 60, 50],
  ["german-shorthaired", "ジャーマンショートヘアードポインター", "German Shorthaired Pointer", "large", 20, 32, false, 76, 58, 48],
  ["german-wirehaired", "ジャーマンワイヤーヘアードポインター", "German Wirehaired Pointer", "large", 27, 32, false, 78, 58, 48],
  ["pointer", "ポインター", "Pointer", "large", 20, 34, false, 76, 58, 48],
  ["irish-setter", "アイリッシュセッター", "Irish Setter", "large", 25, 32, false, 76, 60, 48],
  ["english-setter", "イングリッシュセッター", "English Setter", "large", 20, 36, false, 76, 60, 48],
  ["gordon-setter", "ゴードンセッター", "Gordon Setter", "large", 20, 36, false, 78, 60, 48],
  ["saluki", "サルーキ", "Saluki", "large", 18, 29, false, 70, 60, 44],
  ["afghan-hound", "アフガンハウンド", "Afghan Hound", "large", 20, 27, false, 74, 60, 46],
  ["borzoi", "ボルゾイ", "Borzoi", "large", 27, 48, false, 84, 70, 50],
  ["greyhound", "グレーハウンド", "Greyhound", "large", 27, 32, false, 76, 65, 46],
  ["scottish-deerhound", "スコティッシュディアハウンド", "Scottish Deerhound", "giant", 36, 50, false, 92, 70, 56],
  ["irish-wolfhound", "アイリッシュウルフハウンド", "Irish Wolfhound", "giant", 48, 70, false, 100, 78, 60],
  ["rhodesian-ridgeback", "ローデシアンリッジバック", "Rhodesian Ridgeback", "large", 32, 39, false, 80, 62, 50],
  ["foxhound-american", "アメリカンフォックスハウンド", "American Foxhound", "large", 29, 32, false, 76, 60, 46],
  ["foxhound-english", "イングリッシュフォックスハウンド", "English Foxhound", "large", 29, 36, false, 78, 60, 48],
  ["coonhound-bluetick", "ブルーティッククーンハウンド", "Bluetick Coonhound", "large", 20, 36, false, 76, 60, 48],
  ["coonhound-redbone", "レッドボーンクーンハウンド", "Redbone Coonhound", "large", 20, 32, false, 74, 58, 46],
  ["coonhound-treeing", "トリーイングウォーカークーンハウンド", "Treeing Walker Coonhound", "large", 22, 32, false, 76, 60, 46],
  ["coonhound-black-tan", "ブラックアンドタンクーンハウンド", "Black and Tan Coonhound", "large", 25, 50, false, 84, 64, 52],
  ["coonhound-plott", "プロットハウンド", "Plott Hound", "large", 22, 27, false, 74, 60, 46],
  ["beauceron", "ボースロン", "Beauceron", "large", 30, 50, false, 84, 64, 52],
  ["briard", "ブリアード", "Briard", "large", 25, 45, false, 84, 62, 52],
  ["picardy-shepherd", "ピカルディシェパード", "Picardy Shepherd", "large", 23, 32, false, 76, 60, 46],
  ["polish-lowland-sheepdog", "ポーリッシュローランドシープドッグ", "Polish Lowland Sheepdog", "medium", 14, 23, false, 64, 48, 40],
  ["komondor", "コモンドール", "Komondor", "giant", 36, 60, false, 92, 66, 56],
  ["kuvasz", "クーバース", "Kuvasz", "giant", 32, 52, false, 92, 66, 56],
  ["maremma-sheepdog", "マレンマシープドッグ", "Maremma Sheepdog", "large", 30, 45, false, 84, 64, 52],
  ["leonberger", "レオンベルガー", "Leonberger", "giant", 41, 77, false, 100, 72, 60],
  ["central-asian-shepherd", "セントラルアジアンシェパード", "Central Asian Shepherd", "giant", 40, 79, false, 100, 70, 60],
  ["caucasian-shepherd", "コーカシアンシェパード", "Caucasian Shepherd", "giant", 45, 100, false, 104, 72, 64],
  ["anatolian-shepherd", "アナトリアンシェパード", "Anatolian Shepherd", "giant", 41, 68, false, 96, 70, 58],
  ["tibetan-mastiff", "チベタンマスティフ", "Tibetan Mastiff", "giant", 45, 73, false, 100, 70, 60],
  ["mastiff-english", "イングリッシュマスティフ", "English Mastiff", "giant", 54, 100, false, 110, 70, 66],
  ["mastiff-bull", "ブルマスティフ", "Bullmastiff", "giant", 45, 60, false, 100, 65, 60],
  ["neapolitan-mastiff", "ネアポリタンマスティフ", "Neapolitan Mastiff", "giant", 50, 70, false, 104, 68, 64],
  ["dogue-de-bordeaux", "ボルドーマスティフ", "Dogue de Bordeaux", "giant", 45, 65, false, 100, 65, 62],
  ["cane-corso", "カーネコルソ", "Cane Corso", "giant", 40, 50, false, 96, 65, 58],
  ["spanish-mastiff", "スパニッシュマスティフ", "Spanish Mastiff", "giant", 52, 100, false, 110, 72, 64],
  ["pyrenean-mastiff", "ピレネーマスティフ", "Pyrenean Mastiff", "giant", 55, 100, false, 108, 70, 64],

  // ─── Giant / 超大型 ───
  ["great-dane", "グレートデーン", "Great Dane", "giant", 50, 80, false, 100, 78, 60],
  ["saint-bernard", "セントバーナード", "Saint Bernard", "giant", 65, 90, false, 104, 70, 64],
  ["great-pyrenees", "グレートピレニーズ", "Great Pyrenees", "giant", 38, 60, false, 96, 70, 58],
  ["newfoundland", "ニューファンドランド", "Newfoundland", "giant", 45, 70, false, 100, 70, 60],
  ["dogo-argentino", "ドゴアルヘンティーノ", "Dogo Argentino", "giant", 36, 45, false, 92, 65, 56],
  ["fila-brasileiro", "フィラブラジレイロ", "Fila Brasileiro", "giant", 40, 60, false, 100, 70, 60],
  ["black-russian-terrier", "ブラックロシアンテリア", "Black Russian Terrier", "giant", 36, 60, false, 88, 66, 54],
  ["giant-schnauzer", "ジャイアントシュナウザー", "Giant Schnauzer", "giant", 30, 47, false, 84, 64, 52],

  // ─── デザイナーミックス ───
  ["labradoodle", "ラブラドゥードル", "Labradoodle", "large", 22, 32, true, 76, 56, 46],
  ["goldendoodle", "ゴールデンドゥードル", "Goldendoodle", "large", 20, 32, false, 76, 56, 46],
  ["bernedoodle", "バーニードゥードル", "Bernedoodle", "large", 20, 40, false, 84, 60, 52],
  ["sheepadoodle", "シープドゥードル", "Sheepadoodle", "large", 20, 36, false, 80, 58, 50],
  ["aussiedoodle", "オージードゥードル", "Aussiedoodle", "medium", 11, 32, false, 64, 48, 40],
  ["cavapoo", "キャバプー", "Cavapoo", "small", 5, 11, false, 46, 32, 30],
  ["pomsky", "ポムスキー", "Pomsky", "small", 8, 15, false, 54, 40, 36],
  ["chiweenie", "チワワ&ダックス", "Chiweenie", "small", 3, 7, false, 38, 32, 24],

  // ─── アジア系 ───
  ["tosa", "土佐犬", "Tosa Inu", "giant", 36, 90, false, 100, 70, 60],
  ["jindo", "珍島犬", "Jindo", "medium", 16, 23, false, 60, 46, 38],
  ["pungsan", "豊山犬", "Pungsan", "large", 25, 50, false, 80, 60, 50],
  ["sapsali", "サプサル犬", "Sapsali", "medium", 18, 28, false, 64, 48, 40],
  ["xiasi-quan", "下司犬", "Xiasi Quan", "medium", 15, 25, false, 60, 46, 38],
  ["kunming-wolfdog", "崑明犬", "Kunming Wolfdog", "large", 30, 38, false, 80, 60, 50],
  ["chongqing", "重慶犬", "Chongqing Dog", "medium", 18, 25, false, 64, 48, 40],
  ["formosan-mountain", "台湾犬", "Formosan Mountain Dog", "medium", 12, 18, false, 56, 44, 36],
  ["phu-quoc-ridgeback", "フーコックリッジバック", "Phu Quoc Ridgeback", "medium", 15, 25, false, 60, 46, 38],
  ["thai-bangkaew", "タイバンケオ", "Thai Bangkaew", "medium", 16, 26, false, 60, 44, 38],
  ["rajapalayam", "ラジャパラヤム", "Rajapalayam", "large", 25, 35, false, 76, 60, 48],
  ["chippiparai", "チッピパライ", "Chippiparai", "medium", 15, 22, false, 60, 46, 38],
  ["mudhol-hound", "ムドルハウンド", "Mudhol Hound", "medium", 18, 28, false, 64, 50, 38],
  ["kombai", "コンバイ", "Kombai", "medium", 16, 22, false, 60, 46, 38],
  ["bakharwal", "バクワル犬", "Bakharwal Dog", "giant", 35, 60, false, 92, 66, 56],
  ["bhotia", "ボーチアシェパード", "Bhotia", "large", 25, 45, false, 80, 60, 50],
  ["aksaray-malaklisi", "アクサライマラクリシ", "Aksaray Malaklısı", "giant", 50, 90, false, 104, 70, 62],

  // ─── スカンジナビア / 北欧 ───
  ["finnish-lapphund", "フィニッシュラップフンド", "Finnish Lapphund", "medium", 15, 25, false, 64, 46, 40],
  ["swedish-lapphund", "スウェディッシュラップフンド", "Swedish Lapphund", "medium", 14, 21, false, 60, 44, 38],
  ["lapinporokoira", "ラポニアントナカイ犬", "Lapponian Herder", "medium", 25, 30, false, 66, 50, 40],
  ["norwegian-buhund", "ノルウェジアンブーフント", "Norwegian Buhund", "medium", 14, 18, false, 60, 44, 38],
  ["norwegian-lundehund", "ノルウェジアンルンデフント", "Norwegian Lundehund", "small", 6, 7, false, 44, 36, 30],
  ["danish-spitz", "デンマークスピッツ", "Danish Spitz", "small", 5, 11, false, 48, 34, 32],
  ["karelian-bear-dog", "カレリアンベアドッグ", "Karelian Bear Dog", "medium", 17, 28, false, 64, 48, 40],
  ["russo-european-laika", "ロシアン・ヨーロピアン・ライカ", "Russo-European Laika", "medium", 20, 30, false, 66, 50, 40],
  ["west-siberian-laika", "西シベリアライカ", "West Siberian Laika", "medium", 18, 25, false, 64, 48, 40],
  ["east-siberian-laika", "東シベリアライカ", "East Siberian Laika", "medium", 18, 25, false, 64, 48, 40],
  ["yakutian-laika", "ヤクーチアン・ライカ", "Yakutian Laika", "medium", 18, 30, false, 66, 50, 40],
  ["nenets-herding-laika", "ネネツ犬", "Nenets Herding Laika", "medium", 18, 25, false, 64, 48, 40],
  ["hamiltonstovare", "ハミルトニアン", "Hamilton Hound", "large", 23, 27, false, 70, 56, 44],
  ["smaland-hound", "スモーランドストーバレ", "Småland Hound", "medium", 15, 20, false, 60, 46, 38],
  ["drever", "ドレーバー", "Drever", "small", 14, 16, false, 50, 40, 32],

  // ─── 東欧 / バルカン ───
  ["czechoslovakian-wolfdog", "チェコスロバキアン・ウルフドッグ", "Czechoslovakian Wolfdog", "large", 20, 26, false, 76, 58, 46],
  ["saarloos-wolfdog", "サールースウルフホンド", "Saarloos Wolfdog", "large", 30, 41, false, 84, 64, 52],
  ["cesky-terrier", "セスキーテリア", "Cesky Terrier", "small", 5, 9, false, 44, 32, 28],
  ["slovak-cuvac", "スロバキアンクヴァック", "Slovak Cuvac", "giant", 31, 44, false, 92, 66, 56],
  ["slovensky-kopov", "スロバキアンハウンド", "Slovenský Kopov", "medium", 15, 20, false, 60, 48, 38],
  ["polish-hunting-dog", "ポーリッシュハンティングドッグ", "Polish Hunting Dog", "medium", 20, 26, false, 64, 50, 40],
  ["polish-tatra", "ポーリッシュタトラシープドッグ", "Polish Tatra Sheepdog", "giant", 36, 60, false, 92, 66, 56],
  ["serbian-hound", "セルビアン・ハウンド", "Serbian Hound", "medium", 19, 22, false, 60, 46, 38],
  ["transylvanian-hound", "トランシルヴァニアハウンド", "Transylvanian Hound", "medium", 22, 35, false, 66, 50, 40],
  ["mioritic", "ミオリティック", "Romanian Mioritic", "giant", 50, 65, false, 96, 70, 58],
  ["carpathian-shepherd", "カルパティアンシェパード", "Carpathian Shepherd", "large", 32, 45, false, 84, 64, 52],
  ["croatian-sheepdog", "クロアチアンシープドッグ", "Croatian Sheepdog", "medium", 13, 20, false, 56, 42, 36],
  ["istrian-hound", "イストリアハウンド", "Istrian Coarse-Haired Hound", "medium", 16, 24, false, 60, 46, 38],
  ["tornjak", "トルニャック", "Tornjak", "giant", 28, 50, false, 88, 66, 54],
  ["sarplaninac", "シャールプラニナッツ", "Sarplaninac", "giant", 30, 50, false, 92, 68, 58],
  ["greek-harehound", "ギリシャハウンド", "Greek Harehound", "medium", 17, 20, false, 60, 46, 38],

  // ─── 西欧 / 南欧 追加 ───
  ["estrela-mountain", "エストレラマウンテンドッグ", "Estrela Mountain Dog", "giant", 30, 50, false, 92, 66, 56],
  ["portuguese-podengo", "ポルチュギーズポデンゴ", "Portuguese Podengo", "medium", 5, 30, false, 56, 42, 36],
  ["spanish-greyhound", "スパニッシュグレーハウンド", "Spanish Greyhound", "large", 20, 32, false, 76, 60, 48],
  ["catalan-sheepdog", "カタロニアンシープドッグ", "Catalan Sheepdog", "medium", 18, 27, false, 64, 48, 40],
  ["pyrenean-shepherd", "ピレニアンシェパード", "Pyrenean Shepherd", "medium", 7, 15, false, 56, 42, 36],
  ["picardy-spaniel", "ピカルディスパニエル", "Picardy Spaniel", "medium", 18, 25, false, 64, 46, 38],
  ["pont-audemer-spaniel", "ポンタドゥメールスパニエル", "Pont-Audemer Spaniel", "medium", 18, 25, false, 64, 46, 38],
  ["french-spaniel", "フレンチスパニエル", "French Spaniel", "medium", 20, 25, false, 64, 48, 40],
  ["epagneul-bleu", "エパニュールブルードピカルディ", "Blue Picardy Spaniel", "medium", 20, 25, false, 64, 48, 40],
  ["bouvier-flandres", "ブービエデフランダース", "Bouvier des Flandres", "large", 27, 40, false, 84, 60, 52],
  ["belgian-shepherd-laekenois", "ベルジアンシェパードラケノア", "Belgian Shepherd (Laekenois)", "medium", 25, 30, false, 68, 52, 40],
  ["schipperke", "スキッパーキー", "Schipperke (BE)", "small", 4, 9, false, 46, 32, 30],

  // ─── 英国系 追加 ───
  ["otterhound", "オッターハウンド", "Otterhound", "large", 36, 52, false, 88, 65, 56],
  ["glen-of-imaal", "グレンオブイマールテリア", "Glen of Imaal Terrier", "small", 14, 18, false, 50, 38, 32],
  ["skye-terrier", "スカイテリア", "Skye Terrier", "small", 11, 18, false, 50, 38, 32],
  ["bull-staffy", "オールドイングリッシュブルテリア", "Old English Bulldog", "medium", 27, 38, false, 76, 46, 44],
  ["lurcher", "ラーチャー", "Lurcher", "large", 25, 45, false, 76, 62, 46],
  ["patterdale-terrier", "パターデールテリア", "Patterdale Terrier", "small", 5, 13, false, 44, 32, 28],
  ["plummer-terrier", "プラマーテリア", "Plummer Terrier", "small", 6, 11, false, 44, 32, 28],

  // ─── ポインター系 / セッター系 追加 ───
  ["large-munsterlander", "ラージミュンスターレンダー", "Large Münsterländer", "large", 25, 32, false, 76, 60, 48],
  ["small-munsterlander", "スモールミュンスターレンダー", "Small Münsterländer", "medium", 18, 25, false, 64, 48, 40],
  ["irish-red-white", "アイリッシュレッド&ホワイトセッター", "Irish Red and White Setter", "large", 22, 32, false, 76, 60, 48],
  ["italian-spinone", "スピノーネイタリアーノ", "Spinone Italiano", "large", 28, 40, false, 84, 62, 52],
  ["bracco-italiano", "ブラッコイタリアーノ", "Bracco Italiano", "large", 25, 40, false, 80, 62, 50],
  ["braque-francais", "ブラックフランセ", "Braque Francais", "large", 25, 32, false, 78, 60, 48],
  ["pudelpointer", "プデルポインター", "Pudelpointer", "large", 20, 30, false, 76, 58, 48],
  ["wirehaired-pointing-griffon", "ワイヤーヘアードポインティンググリフォン", "Wirehaired Pointing Griffon", "medium", 23, 27, false, 70, 52, 42],
  ["stabyhoun", "スタビーフン", "Stabyhoun", "medium", 18, 25, false, 64, 48, 40],
  ["wetterhoun", "ウェッタフン", "Wetterhoun", "medium", 25, 35, false, 70, 52, 42],
  ["drentsche-patrijshond", "ドレンチェパトライヨンド", "Drentsche Patrijshond", "medium", 21, 32, false, 66, 50, 40],
  ["portuguese-pointer", "ポルトギーズポインター", "Portuguese Pointer", "medium", 16, 27, false, 64, 50, 40],
  ["old-danish-pointer", "オールドデーニッシュポインター", "Old Danish Pointer", "medium", 26, 35, false, 66, 50, 40],
  ["cesky-fousek", "セスキーフーセック", "Cesky Fousek", "medium", 22, 34, false, 70, 52, 42],

  // ─── ハウンド系 追加 ───
  ["dachshund-wire", "ワイアーヘアードダックスフンド", "Wirehaired Dachshund", "small", 7, 14, false, 48, 36, 30],
  ["dachshund-long", "ロングヘアードダックスフンド", "Long-Haired Dachshund", "small", 7, 14, false, 48, 36, 30],
  ["petit-basset-griffon", "プティバセグリフォンバンデーン", "Petit Basset Griffon Vendéen", "small", 14, 18, false, 56, 40, 36],
  ["grand-basset-griffon", "グランバセグリフォンバンデーン", "Grand Basset Griffon Vendéen", "medium", 18, 22, false, 60, 46, 38],
  ["basset-bleu-gascogne", "バセブルードガスコーニュ", "Basset Bleu de Gascogne", "medium", 16, 20, false, 60, 44, 38],
  ["basset-fauve-bretagne", "バセフォーヴドブルターニュ", "Basset Fauve de Bretagne", "small", 16, 18, false, 50, 38, 32],
  ["griffon-bleu-gascogne", "グリフォンブルードガスコーニュ", "Griffon Bleu de Gascogne", "medium", 17, 22, false, 60, 46, 38],
  ["porcelaine", "ポーセレン", "Porcelaine", "large", 25, 28, false, 68, 54, 44],
  ["billy", "ビリー", "Billy", "large", 25, 33, false, 70, 54, 44],
  ["poitevin", "ポワトヴァン", "Poitevin", "large", 28, 35, false, 72, 56, 46],
  ["francais-tricolore", "フランセトリコロール", "Français Tricolore", "large", 32, 35, false, 72, 56, 46],
  ["sloughi", "スルーギ", "Sloughi", "large", 18, 28, false, 70, 56, 44],
  ["azawakh", "アザワク", "Azawakh", "large", 15, 25, false, 70, 60, 44],

  // ─── スピッツ系 追加 ───
  ["volpino-italiano", "ボルピーノイタリアーノ", "Volpino Italiano", "small", 4, 5, false, 38, 28, 26],
  ["german-spitz", "ジャーマンスピッツ", "German Spitz", "small", 4, 11, false, 44, 30, 28],
  ["keeshond", "キースホンド", "Keeshond", "medium", 16, 20, false, 58, 42, 38],
  ["pomsky-tiny", "ミニポムスキー", "Mini Pomsky", "small", 4, 9, false, 46, 36, 32],
  ["eurasier", "ユーラシア", "Eurasier", "medium", 18, 32, false, 70, 52, 42],
  ["wolfspitz", "ウォルフスピッツ", "Wolfspitz", "medium", 16, 20, false, 60, 44, 38],

  // ─── テリア追加 ───
  ["rat-terrier", "ラットテリア", "Rat Terrier", "small", 4, 11, false, 42, 30, 28],
  ["american-hairless-terrier", "アメリカンヘアレステリア", "American Hairless Terrier", "small", 5, 11, false, 42, 30, 28],
  ["miniature-bull-terrier-wht", "ミニチュアブルテリア(ホワイト)", "Miniature Bull Terrier (White)", "small", 11, 15, false, 56, 38, 36],
  ["fox-paulistinha", "ブラジリアンテリア", "Brazilian Terrier", "small", 6, 10, false, 44, 32, 30],
  ["cesky-toy", "プラハラトラー", "Prague Ratter (Pražský Krysařík)", "tiny", 1.5, 3.5, false, 30, 22, 20],
  ["bohemian-terrier", "ボヘミアンテリア", "Bohemian Terrier", "small", 6, 10, false, 44, 32, 30],
  ["jagdterrier", "ヤークトテリア", "Jagdterrier", "small", 7, 10, false, 44, 32, 30],
  ["welsh-corgi-pembroke-bobtail", "ウェルシュコーギーペンブローク(ボブテイル)", "Welsh Corgi (Pembroke, bobtail)", "medium", 10, 14, false, 58, 38, 36],
  ["sealyham-terrier-2", "シーリハムテリア(英)", "Sealyham Terrier (UK)", "small", 7, 11, false, 46, 32, 30],

  // ─── マスティフ / モロサー追加 ───
  ["presa-canario", "プレサカナリオ", "Perro de Presa Canario", "giant", 38, 60, false, 96, 65, 60],
  ["english-mastiff-bull", "オールドイングリッシュマスティフ", "Old English Mastiff", "giant", 65, 110, false, 110, 70, 66],
  ["argentine-pila", "アルゼンチンピラ", "Argentine Pila", "small", 4, 11, false, 44, 32, 28],
  ["dosa-mastiff", "韓国マスティフ(ドサ)", "Korean Dosa Mastiff", "giant", 60, 100, false, 110, 72, 66],
  ["pyrenean-mountain", "ピレニアン・マウンテン・ドッグ", "Pyrenean Mountain Dog", "giant", 38, 60, false, 96, 70, 58],
  ["kangal-shepherd", "カンガルシェパード", "Kangal Shepherd", "giant", 50, 75, false, 100, 70, 60],
  ["broholmer", "ブロホルマー", "Broholmer", "giant", 40, 70, false, 100, 70, 60],
  ["leon-de-st-bernard", "アルパインマスティフ", "Alpine Mastiff", "giant", 55, 95, false, 104, 70, 64],

  // ─── 雑種 / その他 ───
  ["mountain-cur", "マウンテンカー", "Mountain Cur", "medium", 13, 27, false, 60, 46, 38],
  ["catahoula-bulldog", "カタフーラブルドッグ", "Catahoula Bulldog", "large", 30, 45, false, 84, 60, 52],
  ["alapaha-blue-blood", "アラパハブルーブラッドブルドッグ", "Alapaha Blue Blood Bulldog", "large", 25, 45, false, 80, 56, 50],
  ["american-bulldog", "アメリカンブルドッグ", "American Bulldog", "large", 27, 45, false, 84, 56, 52],
  ["alano-espanol", "アラノ・エスパニョール", "Alano Español", "large", 34, 40, false, 88, 60, 54],
  ["telomian", "テロミアン", "Telomian", "small", 7, 12, false, 48, 36, 32],
  ["new-guinea-singing", "ニューギニアシンギング", "New Guinea Singing Dog", "small", 7, 14, false, 50, 38, 32],
  ["dingo", "ディンゴ", "Australian Dingo", "medium", 13, 19, false, 60, 46, 38],
  ["africanis", "アフリカニス", "Africanis", "medium", 25, 45, false, 70, 52, 42],

  // ─── 「リストにない犬種」のフォールバック ───
  ["unknown-tiny", "リストにない超小型犬(〜4kg)", "Other tiny breed (under 4kg)", "tiny", 1, 4, false],
  ["unknown-small", "リストにない小型犬(4〜10kg)", "Other small breed (4-10kg)", "small", 4, 10, false],
  ["unknown-medium", "リストにない中型犬(10〜25kg)", "Other medium breed (10-25kg)", "medium", 10, 25, false],
  ["unknown-large", "リストにない大型犬(25〜45kg)", "Other large breed (25-45kg)", "large", 25, 45, false],
  ["unknown-giant", "リストにない超大型犬(45kg以上)", "Other giant breed (45kg+)", "giant", 45, 90, false],

  // ─── MIX(親犬種を選ぶ用エントリ) ───
  ["mix", "ミックス犬(親犬種を選択)", "Mixed breed (pick parents)", "small", 0, 0, false, 0, 0, 0],
];

function build(): Breed[] {
  return rows.map((row) => {
    const [
      id,
      nameJa,
      nameEn,
      size,
      weightMin,
      weightMax,
      popular,
      chestAvg,
      backAvg,
      neckAvg,
    ] = row;
    const def = sizeDefaults[size];
    return {
      id,
      nameJa,
      nameEn,
      size,
      weightMin,
      weightMax,
      chestAvg: chestAvg ?? def.chest,
      backAvg: backAvg ?? def.back,
      neckAvg: neckAvg ?? def.neck,
      ...(popular ? { popular: true } : {}),
    };
  });
}

export const breeds: Breed[] = build();

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
        (((parentA.weightMin + parentA.weightMax) / 2 +
          (parentB.weightMin + parentB.weightMax) / 2) /
          2) *
          10,
      ) / 10,
  };
}
