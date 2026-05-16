import { SectionHead } from "./SectionHead";

type Props = {
  title: string;
  /** mono kicker (任意). 例 "01 · BREEDS" */
  kicker?: string;
  /** EN サブタイトル (任意). 例 "Browse by breed" */
  titleEn?: string;
  /** 既存 subtitle はそのまま (lead として扱う). */
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
};

export function Rail({
  title,
  kicker,
  titleEn,
  subtitle,
  viewAllHref,
  viewAllLabel,
  children,
}: Props) {
  return (
    <section className="mt-10 md:mt-14">
      <SectionHead
        kicker={kicker}
        title={title}
        titleEn={titleEn}
        lead={subtitle}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
      />

      <div className="relative mt-5">
        <div
          className="rail-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-3 md:gap-4"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
          <div className="w-1 flex-none md:w-3" aria-hidden="true" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-background to-transparent md:block"
        />
      </div>
    </section>
  );
}

export function RailItem({ children }: { children: React.ReactNode }) {
  return <div className="snap-start flex-none">{children}</div>;
}
