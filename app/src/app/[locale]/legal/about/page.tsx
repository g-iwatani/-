import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "運営者情報 / About",
};

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/legal/about">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const stats: Stats = {
    productCount: products.length,
    guideCount: guides.length,
    lastUpdated: `${site.lastUpdated.year}-${String(site.lastUpdated.month).padStart(2, "0")}`,
  };

  if (locale === "en") return <AboutEn {...stats} />;
  return <AboutJa {...stats} />;
}

type Stats = {
  productCount: number;
  guideCount: number;
  lastUpdated: string;
};

function AboutJa({ productCount, guideCount, lastUpdated }: Stats) {
  return (
    <>
      <h1>わんプロブレムについて</h1>
      <p className="meta">最終更新月: {lastUpdated}</p>

      <h2>このサイトは何か</h2>
      <p>
        わんプロブレムは、ワンちゃんの<strong>悩みベース</strong>で犬用品
        を探せるアフィリエイト型キュレーションメディアです。「冬の散歩で
        寒がる」「引っ張り癖が強い」「短頭種で胸囲が広い」「シニアで関節
        が辛そう」といった具体的な困りごとから、Amazon JP の売れ筋データ
        + 編集部の手動キュレーションで合計{" "}
        <strong>{productCount} 商品</strong> の中から候補を絞り込みます。
      </p>

      <h2>編集方針</h2>
      <ul>
        <li>
          <strong>アフィリエイト報酬で順位を変えない。</strong>{" "}
          掲載商品は popularity と悩みマッチングロジックで自動ソートして
          います。特定ブランドからの個別取引で順位を引き上げる事はありま
          せん。
        </li>
        <li>
          <strong>★評価・レビュー数を偽造しない。</strong>{" "}
          現状 Amazon PA-API の承認待ちのため、本サイトでは ★ 数を一切
          表示していません。承認後は API 取得値のみを掲載します。Google
          のスパム対策ガイドラインへの最大限の準拠でもあります。
        </li>
        <li>
          <strong>医療的効果・効能を断定しない。</strong>{" "}
          「○○病に効く」 系の表現は使いません。 「同じ悩みを持つ飼い主
          が選んでいる」 事実情報のみを提示します。
        </li>
        <li>
          <strong>サイズ情報は各ブランド公式値を尊重する。</strong>{" "}
          独自にマッチングスコアを出していますが、最終判断は各商品ページ
          のサイズチャートで行ってください。
        </li>
      </ul>

      <h2>掲載商品の選定方法</h2>
      <p>掲載商品は次の 3 系統から取得しています:</p>
      <ol>
        <li>
          <strong>編集部選定 (約 60 商品):</strong> Ruffwear、Hurtta、Kong、
          PetSafe 等の定番商品を、サイズ表・特徴・対応犬種を編集部が手動
          で確認して掲載。
        </li>
        <li>
          <strong>Amazon JP 売れ筋ランキング (約 135 商品):</strong>{" "}
          Amazon JP の各カテゴリ売れ筋ランキング上位 15 件を、月次で取り
          込んでいます。データ取得日は各商品ページの 「編集部の検証ノート」
          で明示。
        </li>
        <li>
          <strong>楽天市場ランキング (一部):</strong>{" "}
          楽天 Webservice API ベースのランキングデータ。
        </li>
      </ol>
      <p>
        いずれも各商品の購入リンクには{" "}
        <Link href="/ja/legal/affiliate">アフィリエイトトラッキング</Link>{" "}
        を含めており、購入時にサイトに収益が発生する場合があります。
      </p>

      <h2>記事 (選び方ガイド)</h2>
      <p>
        現在 <strong>{guideCount} 本</strong> の購入ガイド記事を公開して
        います。各記事は わんプロブレム編集部 が執筆し、関連する犬の困り
        ごとに対する選定ポイントと、当サイトの掲載商品から自動選定した
        おすすめを掲載しています。
      </p>

      <h2>取り扱わないもの</h2>
      <ul>
        <li>ドッグフード・おやつ (薬機法 / 個別の獣医相談を要するため)</li>
        <li>サプリメント (同上)</li>
        <li>医薬品・医療機器 (同上)</li>
        <li>動物の販売・譲渡仲介</li>
      </ul>

      <h2>運営体制</h2>
      <p>
        個人運営です。獣医師の常勤監修者は現時点では在籍していません。
        記事内に出てくる獣医関連の記述はすべて公開された一次資料に基づく
        引用 / 紹介に留めています。
      </p>

      <h2>使用技術 / インフラ</h2>
      <ul>
        <li>フレームワーク: Next.js (App Router) / React / TypeScript</li>
        <li>スタイル: Tailwind CSS</li>
        <li>ホスティング: Cloudflare Workers (OpenNext)</li>
        <li>
          商品データ取得: Rakuten Webservice API + Amazon 売れ筋ランキング
        </li>
        <li>解析: 必要な範囲のみ。第三者へのデータ販売はしません</li>
      </ul>

      <h2>サイト名・連絡先</h2>
      <p>
        わんプロブレム / WanProblem。お問い合わせは{" "}
        <Link href="/ja/legal/contact">お問い合わせフォーム</Link> から。
      </p>

      <h2>関連リンク</h2>
      <ul>
        <li>
          <Link href="/ja/legal/affiliate">アフィリエイト開示</Link>
        </li>
        <li>
          <Link href="/ja/legal/privacy">プライバシーポリシー</Link>
        </li>
        <li>
          <Link href="/ja/legal/terms">利用規約</Link>
        </li>
      </ul>
    </>
  );
}

function AboutEn({ productCount, guideCount, lastUpdated }: Stats) {
  return (
    <>
      <h1>About WanProblem</h1>
      <p className="meta">Last updated: {lastUpdated}</p>

      <h2>What this site is</h2>
      <p>
        WanProblem is a concern-driven affiliate aggregator for dog gear.
        Search by your dog&apos;s actual problem — &quot;cold winter
        walks&quot;, &quot;pulls on the leash&quot;, &quot;short-faced
        breed with broad chest&quot;, &quot;senior dog with joint
        pain&quot; — and we narrow down{" "}
        <strong>{productCount} products</strong> from Amazon JP
        best-sellers + editorial curation.
      </p>

      <h2>Editorial principles</h2>
      <ul>
        <li>
          <strong>Affiliate commission never moves rankings.</strong>{" "}
          Sort order is driven by popularity and concern-match logic,
          never by per-brand deals.
        </li>
        <li>
          <strong>We do not fake star ratings or review counts.</strong>{" "}
          We are pending Amazon PA-API approval; until then, no ★
          numbers appear anywhere on the site. Once approved we will
          only display API-sourced values.
        </li>
        <li>
          <strong>No medical claims.</strong> We never assert efficacy
          for a condition. We only surface what owners with similar
          concerns choose.
        </li>
        <li>
          <strong>Size info defers to brand-published charts.</strong>{" "}
          We surface a match score, but final decisions belong to the
          brand&apos;s own size chart.
        </li>
      </ul>

      <h2>How we source products</h2>
      <ol>
        <li>
          <strong>Editorial curation (~60 items):</strong> Brand staples
          (Ruffwear, Hurtta, Kong, PetSafe, etc.) verified by hand for
          size, feature, and breed fit.
        </li>
        <li>
          <strong>Amazon JP best-sellers (~135 items):</strong> Top 15
          from each Amazon JP category, refreshed monthly. The pull date
          appears in each product page&apos;s &quot;editor&apos;s
          verification notes&quot; section.
        </li>
        <li>
          <strong>Rakuten Ichiba rankings (subset):</strong> Ranked
          items from Rakuten Webservice API.
        </li>
      </ol>
      <p>
        Buy links include{" "}
        <Link href="/en/legal/affiliate">affiliate tracking</Link>; the
        site may earn commission on qualifying purchases.
      </p>

      <h2>Buying guides</h2>
      <p>
        We publish <strong>{guideCount}</strong> long-form buying guides,
        written by the WanProblem editorial team, each pairing decision
        criteria with auto-pulled top picks from our catalog.
      </p>

      <h2>What we do not cover</h2>
      <ul>
        <li>Dog food / treats (regulatory caution; consult your vet)</li>
        <li>Supplements (same)</li>
        <li>Pharmaceuticals or medical devices (same)</li>
        <li>Animal sales or rehoming services</li>
      </ul>

      <h2>Operator</h2>
      <p>
        Independently operated. We do not currently retain a staff
        veterinarian. Any veterinary content references published
        primary sources only.
      </p>

      <h2>Tech &amp; infrastructure</h2>
      <ul>
        <li>Next.js (App Router), React, TypeScript</li>
        <li>Tailwind CSS</li>
        <li>Cloudflare Workers (OpenNext)</li>
        <li>Data: Rakuten Webservice API + Amazon best-seller pulls</li>
        <li>Analytics: minimal; no data resale to third parties</li>
      </ul>

      <h2>Contact</h2>
      <p>
        WanProblem (わんプロブレム). Reach us at{" "}
        <Link href="/en/legal/contact">the contact form</Link>.
      </p>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/en/legal/affiliate">Affiliate disclosure</Link>
        </li>
        <li>
          <Link href="/en/legal/privacy">Privacy policy</Link>
        </li>
        <li>
          <Link href="/en/legal/terms">Terms of service</Link>
        </li>
      </ul>
    </>
  );
}
