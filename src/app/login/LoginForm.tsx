"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import ParticleNetwork from "@/components/ParticleNetwork";
import type { Dictionary, Locale } from "@/i18n/portal";

/**
 * Supporter sign-in.
 *
 * Deliberately separate from /admin/login. Same credentials provider, same
 * database — a different door. Sending a supporter to a page headed
 * "Administration" tells them they are in the wrong place, and sending staff
 * to this one tells them the same; both are true only of the wording, which
 * is a bad reason to lose somebody at the login screen.
 */
function LoginForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reasons requireMember() can bounce someone back here.
  const reason = params.get("error");
  const notice =
    reason === "suspended"
      ? t.login.suspended
      : reason === "inactive"
        ? t.login.inactive
        : reason
          ? // Anything else is NextAuth redirecting here with its own error
            // code, now that `pages.error` points at this page instead of at
            // /api/auth/error. Without this branch the visitor lands on a form
            // that silently rejected them and says nothing about why.
            t.login.failed
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
      setError(t.login.invalid);
      return;
    }
    router.push(params.get("callbackUrl") || "/portal");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-7 flex flex-col items-center text-center">
        {/* surface="dark" — the wordmark is black artwork and would vanish
            against the constellation without the inversion. */}
        <Logo href={null} surface="dark" className="h-12 max-w-[240px] sm:h-14 sm:max-w-[260px]" priority />
        <h1 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
          {t.login.title}
        </h1>
        <p className="mt-1 text-sm text-slate-300">{t.login.subtitle}</p>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-100 backdrop-blur">
          {notice}
        </p>
      )}

      {/*
        Glass, not a white card. A solid panel here would punch a bright hole
        through the constellation and undo the reason for having it; the blur
        keeps the field readable behind the form while the 8% white lift and
        the hairline border keep the edges of the card findable.

        `supports-[backdrop-filter]` is the honest part: where backdrop-filter
        is unavailable the fallback is a near-opaque slate panel rather than a
        translucent one, because 8% white over a moving field with no blur is
        illegible rather than merely different.
      */}
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-white/15 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 supports-[backdrop-filter]:bg-white/[0.07] supports-[backdrop-filter]:backdrop-blur-xl sm:p-8"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="email">
            {t.login.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="password">
            {t.login.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/30"
          />
        </div>
        {/* red-600 on this ground is under 4.5:1; red-300 clears it. */}
        {error && (
          <p className="text-sm font-medium text-red-300" role="alert">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60"
        >
          {loading ? t.login.signingIn : t.login.signIn}
        </button>
      </form>

      <p className="mx-auto mt-6 max-w-xs text-center text-sm leading-relaxed text-slate-400">
        {t.login.noAccess}
      </p>
    </div>
  );
}


export default LoginForm;
