# わんプロブレム / WanProblem

> ワンちゃんの困りごとに、世界中のブランドから答えを。
> An aggregator that matches your dog's troubles to the right gear from anywhere.

複数のブランドを横断して、犬種・体型(MIX犬対応)・困りごとから最適な犬用品を探せる紹介(アフィリエイト)型メディア。発送・在庫は持たず、各ブランドの公式サイトに送客するだけの中立アグリゲーター。

## Live

- Production: https://swart-kappa-13.vercel.app/
- Vercel project: `g-iwatani/-` / branch `claude/build-new-website-3AHnd`

## スコープ(MVP)

- スコープ: **服 + おもちゃ + 環境対応グッズ**(医療色のあるカテゴリは意図的に除外)
- 市場: **日本 + 英語版 同時提供**(`/ja`, `/en`)
- 収益モデル: アフィリエイト

## 構成

| パス | 内容 |
|---|---|
| `app/` | Next.js 16(App Router)+ TypeScript + Tailwind v4 のフロントエンド |
| `app/src/app/[locale]/` | ロケール別のページ群 |
| `app/src/app/[locale]/dictionaries/` | i18n 辞書(`ja.json` / `en.json`) |
| `app/src/lib/` | 犬種・困りごと・商品マスタ + サイズマッチングロジック |
| `app/src/components/` | UI コンポーネント |
| `app/src/proxy.ts` | ロケール自動振り分け |

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

- `/[locale]` — ランディング(人気の悩み・人気商品)
- `/[locale]/search` — 犬種 → 採寸 → 困りごとの3ステップ入力フロー
- `/[locale]/results?breeds=&chest=&concerns=` — 結果一覧(Trivago 型カード、ソート・絞り込み)
- `/[locale]/products/[id]` — 商品詳細(あなたの犬への推奨サイズ、サイズチャート、購入ショップ複数候補)

## モックデータ

MVP は静的 TS データで検証フェーズ:

- `app/src/lib/breeds.ts` — 20 犬種(チワワ〜ジャーマンシェパードまで)+ MIX 犬扱い
- `app/src/lib/concerns.ts` — 15 の困りごと(サイズ / 季節 / 行動 / 用途)
- `app/src/lib/products.ts` — 19 商品(Ruffwear / Hurtta / Canada Pooch / Mandarine Brothers / Free Stitch / ALPHAICON 等)
- 各商品に複数の「ショップで見る」リンク(現状は `#` のモック)

実商品データへの差し替え・Supabase 移行は次フェーズ。

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
- 利用規約・プライバシーポリシー・特商法・アフィリエイト開示は本番化前に整備
