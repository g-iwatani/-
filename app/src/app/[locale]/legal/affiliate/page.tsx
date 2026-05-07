import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "アフィリエイト開示 / Affiliate Disclosure",
};

const LAST_UPDATED = "2026-05-07";

export default async function AffiliateDisclosurePage({
  params,
}: PageProps<"/[locale]/legal/affiliate">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  if (locale === "en") return <AffiliateEn />;
  return <AffiliateJa />;
}

function AffiliateJa() {
  return (
    <>
      <h1>アフィリエイト広告に関する開示</h1>
      <p className="meta">最終更新日: {LAST_UPDATED}</p>

      <div className="callout">
        <strong>このサイトは広告を含みます。</strong>
        わんプロブレムは Amazon アソシエイトプログラム、楽天アフィリエイト、
        A8.net、ValueCommerce、Impact、Skimlinks
        などのアフィリエイトプログラムに参加しており、リンク経由で商品が購入された場合、
        運営者に成果報酬が支払われます。
      </div>

      <h2>1. アフィリエイト広告とは</h2>
      <p>
        当サイトに掲載されている「{"楽天で見る"}」「{"Amazon で見る"}」「{"公式で見る"}」
        などの外部リンクは、アフィリエイト広告です。リンクをクリックして遷移先で商品を購入すると、
        購入者の支払額には影響しない範囲で、当サイトに紹介料が支払われます。
      </p>

      <h2>2. 加入しているアフィリエイトプログラム</h2>
      <ul>
        <li>Amazon アソシエイトプログラム(amazon.co.jp / amazon.com)</li>
        <li>楽天アフィリエイト(楽天市場・楽天ブックスなど)</li>
        <li>A8.net</li>
        <li>ValueCommerce(バリューコマース)</li>
        <li>Impact(インパクト)</li>
        <li>Skimlinks(スキムリンクス)</li>
        <li>各ブランドが公開している直接アフィリエイトプログラム</li>
      </ul>

      <h2>3. ステマ規制(景表法第5条第3号)について</h2>
      <p>
        2023年10月施行の景品表示法ステルスマーケティング規制に従い、
        当サイトは広告を含むコンテンツであることを明示しています。
        外部リンクの近くに「広告」「PR」「Sponsored」のいずれかの表示を行うか、
        本ページのように一括でアフィリエイト関係を開示しています。
      </p>

      <h2>4. 商品の選定方針</h2>
      <p>
        当サイトに掲載する商品は、原則として以下の基準で選定しています。掲載順や推薦は、
        アフィリエイト報酬の高さによって不正に操作されることはありません。
      </p>
      <ul>
        <li>
          ユーザーが入力した犬種・採寸・困りごとに対する適合度(マッチングスコア)
        </li>
        <li>各商品ページのレビュー・販売実績などの公開情報</li>
        <li>サイズチャートの正確性・信頼できるブランドかどうか</li>
      </ul>

      <h2>5. 価格・在庫・仕様について</h2>
      <p>
        当サイトに表示している価格・在庫情報・仕様は取得時点のものであり、
        実際の販売価格・在庫状況・仕様は遷移先の各ECサイトでご確認ください。
        価格や在庫の差異について、当サイトは責任を負いかねます。
      </p>

      <h2>6. 効果・効能の保証について</h2>
      <p>
        当サイトはペット用品・アパレル・おもちゃ・ケア用品の紹介を行うメディアであり、
        フード・サプリメント・薬品の販売や効能訴求は行いません。
        各商品は「同じ悩みを持つ飼い主が選んでいるもの」として表示しており、
        効能を保証するものではありません。健康上の懸念がある場合は獣医師にご相談ください。
      </p>

      <h2>7. お問い合わせ</h2>
      <p>
        本開示内容についてご質問・ご指摘がある場合は{" "}
        <Link href="/ja/legal/contact">お問い合わせ</Link> よりご連絡ください。
      </p>
    </>
  );
}

function AffiliateEn() {
  return (
    <>
      <h1>Affiliate Disclosure</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <div className="callout">
        <strong>This site contains advertising.</strong>{" "}
        WanProblem participates in affiliate programs including Amazon
        Associates, Rakuten Affiliate, A8.net, ValueCommerce, Impact, and
        Skimlinks. We may earn a commission at no extra cost to you when you
        purchase through links on this site.
      </div>

      <h2>1. About affiliate links</h2>
      <p>
        Buttons such as &ldquo;View on Amazon&rdquo; or &ldquo;View on
        Rakuten&rdquo; are affiliate links. When you click through and complete
        a purchase, we may receive a referral fee. Your purchase price is not
        affected.
      </p>

      <h2>2. Programs we participate in</h2>
      <ul>
        <li>Amazon Associates (amazon.co.jp / amazon.com)</li>
        <li>Rakuten Affiliate</li>
        <li>A8.net</li>
        <li>ValueCommerce</li>
        <li>Impact</li>
        <li>Skimlinks</li>
        <li>Direct brand affiliate programs</li>
      </ul>

      <h2>3. Compliance</h2>
      <p>
        We disclose advertising in compliance with the Japan Premiums and
        Misrepresentation Prevention Act (景品表示法 / stealth marketing
        regulation, effective October 2023) and the U.S. FTC Endorsement Guides.
      </p>

      <h2>4. How we recommend products</h2>
      <p>
        Listings are ranked by fit-and-concern match scores, popularity signals,
        and brand-published size data. Affiliate commission rates do{" "}
        <em>not</em> influence ranking.
      </p>

      <h2>5. Pricing & availability</h2>
      <p>
        Prices and stock shown here are snapshots. Always verify on the
        destination retailer&apos;s site at checkout.
      </p>

      <h2>6. No medical claims</h2>
      <p>
        We surface apparel, toys, and care products. We do not sell food or
        supplements and make no health, medical, or therapeutic claims. Consult
        a veterinarian for medical concerns.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions? See <Link href="/en/legal/contact">Contact</Link>.
      </p>
    </>
  );
}
