import { redirect } from "next/navigation";
import { defaultLocale } from "./[locale]/dictionaries";

// proxy.ts が locale を自動付与するが、直アクセス用にフォールバック。
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
