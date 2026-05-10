import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
};

export function Rail({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  children,
}: Props) {
  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-5">
        <div>
          <h2 className="t-section">{title}</h2>
          {subtitle && <p className="mt-0.5 t-section-sub">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="whitespace-nowrap text-xs font-semibold text-primary hover:underline md:text-sm"
          >
            {viewAllLabel ?? "もっと見る"} →
          </Link>
        )}
      </div>

      <div className="relative mt-3">
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
