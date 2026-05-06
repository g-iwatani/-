import { notFound } from "next/navigation";
import { SearchFlow } from "@/components/SearchFlow";
import { breeds } from "@/lib/breeds";
import { concerns } from "@/lib/concerns";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function SearchPage({
  params,
}: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div>
      <header className="mx-auto max-w-3xl px-5 pt-10 pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {dict.search.title}
        </h1>
      </header>
      <SearchFlow
        locale={locale}
        dict={dict}
        breeds={breeds.filter((b) => b.id !== "mix")}
        concerns={concerns}
      />
    </div>
  );
}
