"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sunburst from "@/components/Sunburst";

/**
 * Supporter sign-in.
 *
 * Deliberately separate from /admin/login. Same credentials provider, same
 * database — a different door. Sending a supporter to a page headed
 * "Administration" tells them they are in the wrong place, and sending staff
 * to this one tells them the same; both are true only of the wording, which
 * is a bad reason to lose somebody at the login screen.
 */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reasons requireMember() can bounce someone back here.
  const reason = params.get("error");
  const notice =
    reason === "suspended"
      ? "Votre accès a été suspendu. Contactez le secrétariat."
      : reason === "inactive"
        ? "Ce compte est désactivé. Contactez le secrétariat."
        : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(data.get("email")),
      password: String(data.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      // Deliberately does not distinguish "no such account" from "wrong
      // password": the difference tells an attacker which addresses exist.
      setError("Identifiants invalides.");
      return;
    }
    router.push(params.get("callbackUrl") || "/portal");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <Sunburst className="h-14 w-14" />
        <h1 className="mt-3 font-display text-2xl font-bold text-brand">Espace donateurs</h1>
        <p className="text-sm text-gray-500">CDD Pays-Bas — réseau privé</p>
      </div>

      {notice && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <form onSubmit={onSubmit} className="card space-y-4 p-8">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Pas encore d&apos;accès ? Les identifiants sont délivrés par le secrétariat après
        validation de votre donateurschap.
      </p>
    </div>
  );
}

export default function MemberLogin() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
