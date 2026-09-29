import Link from "next/link";
import Logo from "@/components/Logo";
import { getT } from "@/i18n/locale";

/**
 * Shown to a supporter whose registration exists but has not been approved.
 *
 * Outside the portal layout on purpose — that layout calls requireMember(),
 * which is what redirects here, so rendering this inside it would loop.
 */
// The tab title follows the reader's language like everything else.
export async function generateMetadata() {
  const { t } = getT();
  return { title: t.pending.title, robots: { index: false } };
}

export default function PendingPage() {
  const { t } = getT();
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6">
      <div className="w-full max-w-md text-center">
        <Logo href={null} className="mx-auto h-12 max-w-[240px]" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">
          {t.pending.title}
        </h1>
        <p className="mt-3 text-gray-600">
          {t.pending.body}
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Une question ?{" "}
          <a className="text-brand underline" href="mailto:contact@cddpaysbas.nl">
            contact@cddpaysbas.nl
          </a>
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-gray-500 underline">
          {t.common.back}
        </Link>
      </div>
    </main>
  );
}
