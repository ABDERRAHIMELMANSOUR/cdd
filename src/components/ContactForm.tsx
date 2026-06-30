"use client";

import { useState } from "react";

export default function ContactForm({ type = "contact" }: { type?: "contact" | "membership" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl bg-brand-50 p-8 text-center">
        <p className="font-display text-xl font-bold text-brand">Merci !</p>
        <p className="mt-2 text-gray-600">Votre message a bien été envoyé. Nous vous répondrons rapidement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nom *</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" required className="input" />
        </div>
      </div>
      <div>
        <label className="label">Société</label>
        <input name="company" className="input" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="message" rows={5} className="input" />
      </div>
      <button disabled={status === "sending"} className="btn-primary w-full sm:w-auto">
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">Une erreur est survenue. Veuillez réessayer.</p>
      )}
    </form>
  );
}
