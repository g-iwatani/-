# わんプロブレム / WanProblem

> ワンちゃんの困りごとに、世界中のブランドから答えを。
> An aggregator that matches your dog's troubles to the right gear from anywhere.

複数のブランドを横断して、犬種・体型(MIX犬対応)・困りごとから最適な犬用品を探せる紹介(アフィリエイト)型メディア。発送・在庫は持たず、各ブランドの公式サイトに送客するだけの中立アグリゲーター。

## Live

- 本番(予定): https://wanproblem.com/ ※ ドメイン取得・Netlify紐付け待ち
- Netlify 一時URL: https://swart-kappa-13.vercel.app/
- ブランチ: `claude/build-new-website-3AHnd`

## スコープ(MVP)

- スコープ: **服 + おもちゃ + 環境対応グッズ + ケア用品 + しつけ・トレーニング用具**
- 市場: **日本 + 英語版 同時提供**(`/ja`, `/en`)
- 収益モデル: アフィリエイト(Amazon, 楽天, A8, ValueCommerce 等)
- 法令対応: ステマ規制(2023年10月施行)・景表法・プライバシー保護

## 構成

| パス | 内容 |
|---|---|
| `app/` | Next.js 16(App Router)+ TypeScript + Tailwind v4 のフロントエンド |
| `app/src/app/[locale]/` | ロケール別のページ群 |
| `app/src/app/[locale]/legal/` | 法的ページ(アフィリ開示・プライバシー・利用規約・運営者情報・お問い合わせ) |
| `app/src/lib/` | 犬種・困りごと・商品マスタ + サイズマッチングロジック + サイト設定 |
| `app/src/components/` | UI コンポーネント |
| `app/src/proxy.ts` | ロケール自動振り分け(Next.js 16 の middleware) |

## 開発

```bash
cd app
npm install
npm run dev
# http://localhost:3000 → /ja に自動リダイレクト
```

ビルド:

```bash
cd app
npm run build
```

Lint:

```bash
cd app
npm run lint
```

## 主要ページ

- `/[locale]` — ランディング(Netflix風の多段スクロール: 人気の犬種・人気の悩み・テーマ別商品レール)
- `/[locale]/search` — 犬種 → 採寸 → 困りごとの3ステップ入力フロー
- `/[locale]/results?breeds=&chest=&concerns=` — 結果一覧(Trivago型カード、フィルタ・ソート・ボトムシート)
- `/[locale]/products/[id]` — 商品詳細(あなたの犬への推奨サイズ、サイズチャート、購入ショップ複数候補)
- `/[locale]/legal/*` — 法的ページ

## データ規模

- **260犬種**(AKC/FCI/JKC公認 + デザイナーミックス + 日本犬すべて)
- **50悩み**(ケア・行動・サイズ・季節・用途の5カテゴリ、リサーチベース)
- **57商品**(Ruffwear / Hurtta / Canada Pooch / Kong / FURminator / Adaptil 等の主要ブランド)

## カスタムドメイン設定手順

### 1. ドメインを取得

候補(空き確認済み・最終確認は登録時に):

| 候補 | 推奨度 | 想定年額 |
|---|---|---|
| **wanproblem.com** | ★★★★★(国際展開向け) | ¥1,500-2,500 |
| **wanproblem.jp** | ★★★★(日本特化なら) | ¥3,000-4,000 |
| wanproblem.io | ★★★ | ¥6,000-8,000 |
| wanproblem.app | ★★★ | ¥2,500 |
| wan-problem.com | ★★ | ¥1,500 |

推奨レジストラ: お名前.com / Cloudflare Registrar(原価) / Namecheap

### 2. Netlify Custom Domain を設定

1. Netlify ダッシュボード → Site settings → **Domain management**
2. **Add a domain** → `wanproblem.com` を入力
3. Netlify が DNS 設定指示を提示
4. **DNS の選択**:
   - **Netlify DNS に切替**(推奨): ドメインのネームサーバを Netlify の値に変更(`dns1.p01.nsone.net` 系)
   - または **External DNS** で Apex(`A` レコード)と `www`(`CNAME`)を設定
5. SSL/TLS 証明書(Let's Encrypt)が自動発行される(数分)

### 3. 環境変数を設定

Netlify ダッシュボード → Site settings → **Environment variables** に追加:

```
NEXT_PUBLIC_SITE_URL = https://wanproblem.com
```

→ Trigger redeploy(または次の git push 時に反映)

これでカノニカル URL / sitemap / OG 画像 / Twitter カードがすべて新ドメインを参照するようになります。

### 4. Google Search Console に登録

1. [Search Console](https://search.google.com/search-console) → **プロパティを追加**
2. ドメインプロパティで `wanproblem.com` を登録(DNSレコードで所有者確認)
3. **サイトマップ送信**: `https://wanproblem.com/sitemap.xml`

## アフィリエイトリンクの統合手順

### 1. 各プログラムへの申請

| プログラム | 申請URL | 審査期間 / 注意 | 報酬目安 |
|---|---|---|---|
| **楽天アフィリエイト** | https://affiliate.rakuten.co.jp/ | **即時利用可**(楽天会員で誰でも) | 商品価格の 1-7% |
| **Amazon アソシエイト(JP)** | https://affiliate.amazon.co.jp/ | 仮承認 → 180日以内に**3件以上の成約**で本承認 | ペット 3% |
| **Amazon アソシエイト(US)** | https://affiliate-program.amazon.com/ | 同上(180日以内3件) | 同上 |
| **A8.net** | https://www.a8.net/ | 即時。広告主毎に個別審査 | 案件次第(犬服系で 5-15%) |
| **ValueCommerce** | https://www.valuecommerce.ne.jp/ | 1-3営業日。広告主毎に個別審査 | 同上 |
| **Skimlinks** | https://skimlinks.com/ | 1営業日 | 自動アフィリ化 |
| **Impact** | https://impact.com/ | 個別ブランド毎にアプライ | 5-15% |

**最初にやるべきこと**:
1. **楽天アフィリエイト**(即時利用可で楽天市場の商品が大量にある)
2. **A8.net**(国内ペット系ブランドの直接案件が豊富)
3. **Amazon アソシエイト**(申請しておくと並行で本承認に進める)

### 2. 環境変数を Netlify に登録

Netlify → Site configuration → Environment variables:

```
AMAZON_ASSOC_TAG_JP   = xxxxxxx-22       (例: wanproblem-22)
AMAZON_ASSOC_TAG_US   = xxxxxxx-20
RAKUTEN_AFFILIATE_ID  = (32文字のID、楽天アフィリの管理画面で取得)
VALUECOMMERCE_SID     = (8桁ID、VC管理画面)
VALUECOMMERCE_PID     = (10桁ID、案件選択時)
IMPACT_PARTNER_ID     = (Impact 管理画面)
```

未設定の段階でも、ターゲット指定された商品はアフィリ無しの素のURLに自動フォールバックします。

### 3. 商品データを実 ID に置き換える

`app/src/lib/products.ts` の各 `BuyOption` を以下の形式で更新:

```ts
// Amazon の場合(ASIN が必要)
{
  shop: "Amazon",
  target: { network: "amazon-jp", asin: "B07XXXXXXX" },
  priceJpy: 4980,
  region: "jp",
}

// 楽天の場合(店舗コード/商品コード)
{
  shop: "楽天",
  target: { network: "rakuten", shopCode: "petio", itemCode: "abc-123" },
  priceJpy: 4980,
  region: "jp",
}

// A8.net の場合(発行された a8mat= パラメータと遷移先URL)
{
  shop: "公式",
  target: {
    network: "a8",
    programTracking: "a8mat=ABCDEF+XXX+YYYY+ZZZZZZ",
    directUrl: "https://www.brand-official.com/products/xxx",
  },
  priceJpy: 4980,
  region: "jp",
}

// ValueCommerce の場合(deep link 発行済み)
{
  shop: "公式",
  target: {
    network: "valuecommerce",
    directUrl: "https://www.brand-official.com/products/xxx",
  },
  priceJpy: 4980,
  region: "jp",
}

// アフィリ非対応のブランド公式(直接遷移)
{
  shop: "公式",
  target: { network: "direct", url: "https://www.brand-official.com/" },
  priceJpy: 4980,
  region: "global",
}
```

### 4. 計測

- `rel="nofollow noopener sponsored"` 全リンクに自動付与済み
- ボタン左に「PR」表記を自動表示(ステマ規制対応)
- クリック計測は将来的に GA4 のイベント or Netlify Analytics で(別タスク)

## SEO / メタデータ

- **canonical URL**: 各ページ自動付与(`metadataBase` + alternates)
- **hreflang**: `/ja` と `/en` 相互リンク
- **Open Graph 画像**: `app/src/app/opengraph-image.tsx` で動的生成(1200×630)
- **Twitter Card**: summary_large_image
- **sitemap.xml**: 静的ページ + 全商品 + 全悩み + 主要犬種を含む(`app/src/app/sitemap.ts`)
- **robots.txt**: `app/src/app/robots.ts` から自動生成

## サイズマッチングロジック

`app/src/lib/matching.ts`:

- 採寸が直接入力された場合はそのまま使用
- 犬種選択のみ(MIX 犬の場合は親犬種 2 つの平均)から推定
- 各商品サイズの範囲に対し、中央値からの距離でフィット度(%)を算出
- 困りごとマッチ度・人気度と合算してスコアリング

## 設計の中立性

- 在庫・物流・決済は持たない(発送しない)
- 商品画像は CSS グラデーションでプレースホルダ表現(各ブランドの権利に配慮し MVP では未掲載)
- 外部リンクは `rel="nofollow noopener sponsored"` 付与済み
- 利用規約・プライバシーポリシー・アフィリエイト開示は実装済み(本番化前に運営者所在地・連絡先を実値へ差し替え)
