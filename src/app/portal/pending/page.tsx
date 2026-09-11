import Link from "next/link";
import Sunburst from "@/components/Sunburst";

/**
 * Shown to a supporter whose registration exists but has not been approved.
 *
 * Outside the portal layout on purpose — that layout calls requireMember(),
 * which is what redirects here, so rendering this inside it would loop.
 */
export const metadata = { title: "Accès en attente", robots: { index: false } };

export default function PendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6">
      <div className="w-full max-w-md text-center">
        <Sunburst className="mx-auto h-14 w-14" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">
          Votre accès est en cours de validation
        </h1>
        <p className="mt-3 text-gray-600">
          Votre inscription a bien été enregistrée. Un membre du bureau examine chaque
          demande personnellement ; vous recevrez un e-mail dès que votre accès sera ouvert.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Une question ?{" "}
          <a className="text-brand underline" href="mailto:contact@cddpaysbas.nl">
            contact@cddpaysbas.nl
          </a>
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-gray-500 underline">
          Retour au site
        </Link>
      </div>
    </main>
  );
}
