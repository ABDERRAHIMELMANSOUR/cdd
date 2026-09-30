import Link from "next/link";
import { getT } from "@/i18n/locale";
import HtmlLang from "@/components/portal/HtmlLang";

/** Reached from the portal (a deleted post, a suspended profile), so it follows the portal language. */
export default function NotFound() {
  const { locale, t } = getT();
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6 text-center">
      <HtmlLang lang={locale} />
      <div>
        <p className="font-display text-7xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">{t.notFound.title}</h1>
        <p className="mt-2 text-gray-500">{t.notFound.body}</p>
        <Link href="/" className="btn-primary mt-6">
          {t.notFound.back}
        </Link>
      </div>
    </main>
  );
}
