import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";

export const metadata = {
  title: "お問い合わせ / Contact",
};

const LAST_UPDATED = "2026-05-07";
const CONTACT_EMAIL = "hello@wanproblem.example";

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/legal/contact">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  if (locale === "en") return <ContactEn />;
  return <ContactJa />;
}

function ContactJa() {
  return (
    <>
      <h1>お問い合わせ</h1>
      <p className="meta">最終更新日: {LAST_UPDATED}</p>

      <p>ご質問・ご意見・掲載商品についてのお知らせは、メールでご連絡ください。</p>

      <div className="callout">
        <strong>連絡先メールアドレス:</strong>{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        <span style={{ fontSize: "0.8em", opacity: 0.85 }}>
          ※ 正式運用前のため、上記アドレスは仮のプレースホルダです。実運用時に差し替えます。
        </span>
      </div>

      <h2>受付内容</h2>
      <ul>
        <li>サイトの不具合報告(リンク切れ、表示崩れ、サイズ表の誤りなど)</li>
        <li>商品掲載のご相談(ブランドの方より)</li>
        <li>取材・記事掲載のご依頼</li>
        <li>個人情報の開示・訂正・削除のご請求</li>
        <li>アフィリエイト・広告関連のご質問</li>
      </ul>

      <h2>お受けできないこと</h2>
      <ul>
        <li>個別の獣医療相談・健康相談(専門家にご相談ください)</li>
        <li>
          外部販売事業者(Amazon、楽天、各ブランド公式ストア等)で発生した
          注文・配送・返品トラブル — 各事業者へ直接ご連絡ください
        </li>
        <li>個別の犬種・サイズ判定に関する保証</li>
      </ul>

      <h2>返信について</h2>
      <p>
        通常 3 営業日以内に返信を心がけていますが、内容によってはお時間をいただく場合があります。
        スパム対策のため、返信できないアドレスからのお問い合わせはお返事できません。
      </p>
    </>
  );
}

function ContactEn() {
  return (
    <>
      <h1>Contact</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <p>For questions, feedback, or partnership inquiries, please email us.</p>

      <div className="callout">
        <strong>Email:</strong>{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        <span style={{ fontSize: "0.8em", opacity: 0.85 }}>
          (Placeholder address during pre-launch. Will be replaced for live
          operation.)
        </span>
      </div>

      <h2>What we can help with</h2>
      <ul>
        <li>
          Site issues (broken links, layout problems, sizing errors)
        </li>
        <li>Product listing inquiries (brands)</li>
        <li>Press / editorial requests</li>
        <li>Personal-data access, correction, or deletion requests</li>
        <li>Affiliate and advertising questions</li>
      </ul>

      <h2>Outside scope</h2>
      <ul>
        <li>Individual veterinary or medical advice</li>
        <li>
          Order, delivery, or return issues at external retailers — please
          contact those retailers directly
        </li>
        <li>Individual fit guarantees</li>
      </ul>

      <h2>Response time</h2>
      <p>
        We aim to reply within 3 business days. We can&apos;t respond to
        addresses that block replies.
      </p>
    </>
  );
}
