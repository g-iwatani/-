import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "運営者情報 / About",
};

const LAST_UPDATED = "2026-05-07";

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/legal/about">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  if (locale === "en") return <AboutEn />;
  return <AboutJa />;
}

function AboutJa() {
  return (
    <>
      <h1>運営者情報</h1>
      <p className="meta">最終更新日: {LAST_UPDATED}</p>

      <h2>サイト名</h2>
      <p>わんプロブレム / WanProblem</p>

      <h2>サイトの目的</h2>
      <p>
        わんプロブレムは、犬種・体型・困りごとから複数のブランドを横断して
        ぴったりの犬用品を見つけられる紹介(アフィリエイト)型メディアです。
        MIX犬を含むあらゆる犬の飼い主が、各ブランドのサイズ表を読み比べる手間なく、
        一箇所で意思決定できることを目指しています。
      </p>

      <h2>取り扱いカテゴリ</h2>
      <ul>
        <li>服(レインコート、防寒着、Tシャツ、ドレス等)</li>
        <li>おもちゃ(知育トイ、頑丈チュー、ロープ等)</li>
        <li>環境対応グッズ(ハーネス、靴、クールマット等)</li>
        <li>ケア用品(ブラシ、爪切り、デンタルケア等)</li>
        <li>食器・給仕(スローフィーダー、スタンド等)</li>
      </ul>
      <p>
        フード・サプリ・薬品は取り扱いません(薬機法配慮)。
      </p>

      <h2>運営方針</h2>
      <ul>
        <li>商品の良し悪しは、アフィリエイト報酬の高さで判断しない</li>
        <li>
          サイズ表記は各ブランドの公式情報を尊重し、独自正規化したマッチング結果と併記する
        </li>
        <li>効果・効能の保証はしない。「同じ悩みを持つ飼い主が選んでいる」事実情報の提示に留める</li>
        <li>ユーザーのプライバシーを最優先する。第三者へのデータ販売はしない</li>
      </ul>

      <h2>運営体制</h2>
      <p>
        現在は個人運営です。お問い合わせ窓口・連絡先は{" "}
        <Link href="/ja/legal/contact">お問い合わせ</Link> ページをご覧ください。
      </p>

      <h2>使用技術</h2>
      <ul>
        <li>フレームワーク: Next.js / React / TypeScript</li>
        <li>スタイル: Tailwind CSS</li>
        <li>ホスティング: Netlify</li>
        <li>解析: Google Analytics(匿名化設定)</li>
      </ul>

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

function AboutEn() {
  return (
    <>
      <h1>About</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <h2>Name</h2>
      <p>WanProblem (わんプロブレム)</p>

      <h2>Mission</h2>
      <p>
        WanProblem is an affiliate-supported aggregator that matches dog gear
        across many brands to your dog&apos;s breed, body, and concerns —
        including mixed breeds. The goal: dog parents shouldn&apos;t have to
        cross-reference five brand size charts to find what fits.
      </p>

      <h2>Categories covered</h2>
      <ul>
        <li>Apparel (raincoats, winter coats, tees, dresses)</li>
        <li>Toys (puzzle feeders, heavy chewers, ropes)</li>
        <li>Gear (harnesses, boots, cooling mats)</li>
        <li>Care (brushes, nail tools, dental)</li>
        <li>Feeding (slow feeders, height-adjustable stands)</li>
      </ul>
      <p>We do not list food, supplements, or medications.</p>

      <h2>Editorial principles</h2>
      <ul>
        <li>Affiliate commission rates do not influence ranking.</li>
        <li>
          Size info defers to brand-published charts; our match scores are
          shown alongside.
        </li>
        <li>
          We surface what other owners with similar concerns choose, not
          medical or therapeutic claims.
        </li>
        <li>
          Privacy is paramount. We do not sell user data to third parties.
        </li>
      </ul>

      <h2>Operator</h2>
      <p>
        Currently operated by a sole proprietor. See{" "}
        <Link href="/en/legal/contact">Contact</Link> for inquiries.
      </p>

      <h2>Tech stack</h2>
      <ul>
        <li>Next.js / React / TypeScript</li>
        <li>Tailwind CSS</li>
        <li>Netlify hosting</li>
        <li>Google Analytics (anonymized)</li>
      </ul>

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
