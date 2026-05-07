import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "利用規約 / Terms of Service",
};

const LAST_UPDATED = "2026-05-07";

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/legal/terms">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  if (locale === "en") return <TermsEn />;
  return <TermsJa />;
}

function TermsJa() {
  return (
    <>
      <h1>利用規約</h1>
      <p className="meta">最終更新日: {LAST_UPDATED}</p>

      <p>
        本利用規約(以下「本規約」)は、わんプロブレム(以下「当サイト」)が提供する
        ウェブサイトおよび関連サービス(以下「本サービス」)の利用条件を定めるものです。
        本サービスをご利用いただくユーザー(以下「利用者」)は、本規約に同意したものとみなします。
      </p>

      <div className="callout">
        <strong>当サイトの位置づけ:</strong>{" "}
        当サイトは商品の販売を行いません。
        ペット関連商品を紹介し、各販売事業者(楽天市場、Amazon、各ブランド公式サイト等)へ送客する
        紹介メディアです。商品の購入・代金支払い・配送・返品・カスタマーサポートは、
        全て遷移先の各販売事業者が定める規約および条件に従います。
      </div>

      <h2>1. 適用範囲</h2>
      <p>
        本規約は、利用者と当サイトとの間の本サービスの利用に関する一切の関係に適用されます。
      </p>

      <h2>2. 本サービスの内容</h2>
      <p>
        本サービスは、犬種・採寸・困りごとの入力に応じて、複数のブランド・販売店の商品を
        横断的に検索・推薦し、外部リンクとして遷移先を提示するサービスです。
        ユーザー登録は現時点では不要です。
      </p>

      <h2>3. 知的財産権</h2>
      <p>
        当サイトに掲載されているテキスト、画像、ロゴ、コードその他のコンテンツの著作権は、
        当サイトまたは正当な権利者に帰属します。商品名・ブランドロゴは各社の商標です。
        無断転載・複製を禁じます。
      </p>

      <h2>4. 禁止事項</h2>
      <p>利用者は本サービスの利用に際して、以下の行為を行ってはなりません。</p>
      <ul>
        <li>法令または公序良俗に違反する行為</li>
        <li>当サイト・第三者の権利を侵害する行為</li>
        <li>当サイトのサーバーに過度の負荷をかける行為(スクレイピング、自動アクセスを含む)</li>
        <li>当サイトの運営を妨害する行為</li>
        <li>不正アクセス、マルウェアの送信</li>
        <li>本サービスの内容を改変・転売する行為</li>
        <li>その他、当サイトが不適切と判断する行為</li>
      </ul>

      <h2>5. 免責事項</h2>
      <ul>
        <li>
          当サイトは紹介サービスであり、商品の品質・安全性・適合性・効果について
          保証するものではありません。実際の購入判断は利用者の責任において行ってください。
        </li>
        <li>
          推薦結果はマッチングアルゴリズムに基づく機械的なものであり、
          特定の効果や成果を保証するものではありません。
        </li>
        <li>
          価格・在庫・仕様は遷移先サイトでご確認ください。
          当サイト上の表示と遷移先の実際との差異について、当サイトは責任を負いません。
        </li>
        <li>
          外部サイトでの購入トラブル(配送遅延、不良品、返品対応等)については、
          各販売事業者へ直接お問い合わせください。
        </li>
        <li>
          サイトの一時的な停止、リンク切れ、データ消失等について、
          当サイトは責任を負わないものとします。
        </li>
        <li>
          ペットの健康に関する判断は獣医師にご相談ください。
          当サイトは医療助言を行うものではありません。
        </li>
      </ul>

      <h2>6. アフィリエイト広告</h2>
      <p>
        当サイトはアフィリエイト広告を含みます。詳細は{" "}
        <Link href="/ja/legal/affiliate">アフィリエイト開示</Link> をご覧ください。
      </p>

      <h2>7. 個人情報の取り扱い</h2>
      <p>
        個人情報の取り扱いについては{" "}
        <Link href="/ja/legal/privacy">プライバシーポリシー</Link> をご覧ください。
      </p>

      <h2>8. 規約の変更</h2>
      <p>
        当サイトは、必要と判断した場合に、利用者への事前通知なしに本規約を変更できるものとします。
        変更後の規約は本ページへの掲載をもって効力を生じます。
      </p>

      <h2>9. 準拠法および管轄裁判所</h2>
      <p>
        本規約の解釈には日本法を準拠法とし、本サービスに関して生じた紛争については、
        当サイト運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
      </p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <p>
        These Terms govern your use of WanProblem (the &ldquo;Service&rdquo;).
        By accessing the Service you agree to these Terms.
      </p>

      <div className="callout">
        <strong>What WanProblem is:</strong> a referral aggregator. We do not
        sell products. Purchases, payment, delivery, returns, and customer
        support are governed by the terms of the destination retailer (Amazon,
        Rakuten, each brand&apos;s official site, etc.).
      </div>

      <h2>1. Scope</h2>
      <p>These Terms apply to all use of the Service.</p>

      <h2>2. Service description</h2>
      <p>
        The Service surfaces dog products across multiple brands and retailers
        based on user-supplied breed, measurement, and concern data, and
        provides outbound affiliate links.
      </p>

      <h2>3. Intellectual property</h2>
      <p>
        Content on the Service is owned by WanProblem or its licensors.
        Brand and product names are trademarks of their respective owners.
        Unauthorized reproduction is prohibited.
      </p>

      <h2>4. Prohibited conduct</h2>
      <ul>
        <li>Violating laws or public order</li>
        <li>Infringing rights of WanProblem or third parties</li>
        <li>Excessive automated access (scraping)</li>
        <li>Disrupting Service operation</li>
        <li>Unauthorized access or malware</li>
        <li>Reselling or repurposing Service content</li>
      </ul>

      <h2>5. Disclaimers</h2>
      <ul>
        <li>
          We make no warranty as to product quality, safety, fit, or efficacy.
          Purchase decisions are your own.
        </li>
        <li>
          Recommendations are produced algorithmically and do not guarantee a
          specific outcome.
        </li>
        <li>
          Pricing, stock, and specifications must be verified at the
          destination retailer.
        </li>
        <li>
          For order issues at external retailers, contact those retailers
          directly.
        </li>
        <li>We are not liable for downtime, broken links, or data loss.</li>
        <li>We do not provide veterinary advice. Consult a veterinarian.</li>
      </ul>

      <h2>6. Affiliate advertising</h2>
      <p>
        See <Link href="/en/legal/affiliate">Affiliate Disclosure</Link>.
      </p>

      <h2>7. Privacy</h2>
      <p>
        See <Link href="/en/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>8. Changes</h2>
      <p>We may update these Terms by posting changes here.</p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of Japan. Disputes shall be
        subject to the exclusive jurisdiction of the courts in the
        operator&apos;s residence as a court of first instance.
      </p>
    </>
  );
}
