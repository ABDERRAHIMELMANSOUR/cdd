"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changePassword, type PasswordState } from "./actions";
import type { Dictionary } from "@/i18n/portal";

function SubmitButton({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary">
      {pending ? t.password.saving : t.password.submit}
    </button>
  );
}

export default function ChangePasswordForm({ t }: { t: Dictionary }) {
  const [state, action] = useFormState<PasswordState, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (state.ok) {
      // Never leave passwords sitting in the fields after they have done their job.
      formRef.current?.reset();
      setToast({ kind: "ok", text: t.password.success });
    } else if (state.error) {
      setToast({ kind: "error", text: t.password[state.error] });
    }
  }, [state, t]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <form ref={formRef} action={action} className="card mt-8 space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900">{t.password.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{t.password.subtitle}</p>
      </div>

      <div>
        <label className="label" htmlFor="currentPassword">{t.password.current}</label>
        <input id="currentPassword" name="currentPassword" type="password" required
          autoComplete="current-password" className="input" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="newPassword">{t.password.new}</label>
          <input id="newPassword" name="newPassword" type="password" required minLength={10}
            autoComplete="new-password" aria-describedby="pw-hint" className="input" />
          <p id="pw-hint" className="mt-1 text-xs text-gray-500">{t.password.hint}</p>
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">{t.password.confirm}</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required minLength={10}
            autoComplete="new-password" className="input" />
        </div>
      </div>

      <SubmitButton t={t} />

      {toast && (
        <div
          role={toast.kind === "ok" ? "status" : "alert"}
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
    </form>
  );
}
