import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "プライバシーポリシー / Privacy Policy",
};

const LAST_UPDATED = "2026-05-07";

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/legal/privacy">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  if (locale === "en") return <PrivacyEn />;
  return <PrivacyJa />;
}

function PrivacyJa() {
  return (
    <>
      <h1>プライバシーポリシー</h1>
      <p className="meta">最終更新日: {LAST_UPDATED}</p>

      <p>
        わんプロブレム(以下「当サイト」)は、利用者のプライバシーを尊重し、
        個人情報の保護に取り組みます。本ポリシーは、当サイトが取得する情報の種類、
        利用方法、第三者提供の有無、利用者の権利について定めるものです。
      </p>

      <h2>1. 取得する情報</h2>
      <p>当サイトは以下の情報を取得することがあります。</p>
      <ul>
        <li>
          <strong>アクセス情報:</strong>{" "}
          IPアドレス、ブラウザ種別、参照元URL、閲覧ページ、滞在時間、
          デバイス種別、画面サイズ、言語設定など
        </li>
        <li>
          <strong>クッキー / ローカルストレージ:</strong>{" "}
          サイトの動作改善・利用統計のため
        </li>
        <li>
          <strong>お問い合わせ時にご入力いただく情報:</strong>{" "}
          メールアドレス、お名前、本文
        </li>
        <li>
          <strong>検索条件:</strong>{" "}
          犬種・採寸・困りごとなど、検索ステップで入力された情報。
          原則ブラウザ内に留まり、サーバーに送信される場合は匿名化された統計として扱います。
        </li>
      </ul>

      <h2>2. 利用目的</h2>
      <ul>
        <li>サイトのコンテンツ・推薦結果の提供</li>
        <li>サイトの改善および新機能の開発</li>
        <li>アクセス解析とトレンド把握</li>
        <li>不正アクセス・不正利用の検知と防止</li>
        <li>お問い合わせへの対応</li>
        <li>法令遵守</li>
      </ul>

      <h2>3. 第三者提供</h2>
      <p>
        当サイトは、本人の同意なく個人情報を第三者に提供しません。ただし、
        以下のサービスプロバイダにアクセス情報・利用統計が共有される場合があります。
      </p>
      <ul>
        <li>Netlify(ホスティング)</li>
        <li>Google Analytics(アクセス解析、匿名化設定で運用)</li>
        <li>Google Search Console(検索パフォーマンス計測)</li>
        <li>Sentry(エラー監視)</li>
        <li>各アフィリエイトプログラム提供事業者(クリック計測のため)</li>
      </ul>
      <p>
        各プロバイダのプライバシーポリシーは、それぞれの公式サイトをご確認ください。
      </p>

      <h2>4. クッキー(Cookie)について</h2>
      <p>当サイトは以下の目的でクッキーを使用します。</p>
      <ul>
        <li>言語設定・表示設定の保持</li>
        <li>サイトの利用状況の集計(Google Analytics 等)</li>
        <li>アフィリエイト広告の効果測定(各プログラム提供事業者による)</li>
      </ul>
      <p>
        ブラウザ設定によりクッキーを無効化することができますが、
        一部機能が利用できなくなる場合があります。
      </p>

      <h2>5. 個人情報の開示・訂正・削除</h2>
      <p>
        ご本人からの個人情報の開示・訂正・削除のご請求があった場合、
        本人確認のうえ合理的な範囲で速やかに対応します。
        ご請求は <Link href="/ja/legal/contact">お問い合わせ</Link> よりご連絡ください。
      </p>

      <h2>6. 安全管理措置</h2>
      <p>
        当サイトは個人情報の漏洩・滅失・改ざんを防ぐため、
        SSL/TLS による通信の暗号化、適切なアクセス管理、第三者監査済みサービスの利用など、
        合理的な安全管理措置を講じます。
      </p>

      <h2>7. 子どものプライバシー</h2>
      <p>
        当サイトは13歳未満を対象としていません。13歳未満の方からの個人情報を
        意図的に収集することはありません。
      </p>

      <h2>8. 国境を越えるデータ移転</h2>
      <p>
        当サイトは Netlify(米国)等のサービスを利用するため、利用者の情報が
        日本国外のサーバーに保存・処理される場合があります。それぞれのプロバイダは
        標準契約条項(SCC)等により適切な保護措置を講じています。
      </p>

      <h2>9. 改定について</h2>
      <p>
        本ポリシーは、法令変更・サービス内容の変更等に伴い改定されることがあります。
        改定時は本ページに掲載することで通知に代えるものとします。
      </p>

      <h2>10. お問い合わせ</h2>
      <p>
        本ポリシーに関するお問い合わせは{" "}
        <Link href="/ja/legal/contact">お問い合わせフォーム</Link> よりご連絡ください。
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <p>
        WanProblem (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;)
        respects your privacy. This policy describes what we collect, why, and
        the rights you have over that information.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Usage data:</strong> IP, user agent, referrer, pages viewed,
          time on page, device, viewport, language preference
        </li>
        <li>
          <strong>Cookies / local storage:</strong> for functionality and
          analytics
        </li>
        <li>
          <strong>Contact form input:</strong> email address, name, message
          content
        </li>
        <li>
          <strong>Search inputs:</strong> breed, measurements, concerns. These
          stay client-side wherever possible; if sent to our servers, they are
          aggregated and anonymized.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To provide content and recommendations</li>
        <li>To improve the site and develop new features</li>
        <li>To analyze trends and usage</li>
        <li>To detect and prevent abuse</li>
        <li>To respond to inquiries</li>
        <li>To comply with applicable law</li>
      </ul>

      <h2>3. Third-party services</h2>
      <p>
        We do not sell personal information. The following services may process
        usage data on our behalf:
      </p>
      <ul>
        <li>Netlify (hosting)</li>
        <li>Google Analytics (anonymized)</li>
        <li>Google Search Console</li>
        <li>Sentry (error monitoring)</li>
        <li>Affiliate networks (click attribution)</li>
      </ul>

      <h2>4. Cookies</h2>
      <p>We use cookies for:</p>
      <ul>
        <li>Language and display preferences</li>
        <li>Analytics aggregation (Google Analytics, etc.)</li>
        <li>Affiliate click attribution (operated by partner networks)</li>
      </ul>

      <h2>5. Your rights</h2>
      <p>
        You may request access, correction, or deletion of your personal data.
        Email us via the <Link href="/en/legal/contact">contact page</Link>.
      </p>

      <h2>6. Data security</h2>
      <p>
        We use TLS in transit, role-based access controls, and reputable
        third-party providers with industry security certifications.
      </p>

      <h2>7. Children</h2>
      <p>
        WanProblem is not directed at children under 13. We do not knowingly
        collect personal information from children under 13.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Our hosting and analytics providers may store and process data outside
        your country (including the United States). Providers use Standard
        Contractual Clauses or equivalent safeguards.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy. Changes are reflected here with an updated
        date.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions? See <Link href="/en/legal/contact">Contact</Link>.
      </p>
    </>
  );
}
