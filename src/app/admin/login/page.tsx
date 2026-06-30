"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sunburst from "@/components/Sunburst";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError("Identifiants invalides.");
    } else {
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      router.push(callbackUrl || "/admin");
      router.refresh();
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Sunburst className="h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-bold text-brand">Administration</h1>
          <p className="text-sm text-gray-500">CDD Pays-Bas — Tableau de bord</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4 p-8">
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input name="password" type="password" required className="input" autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
