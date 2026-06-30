import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">Page introuvable</h1>
        <p className="mt-2 text-gray-500">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary mt-6">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
