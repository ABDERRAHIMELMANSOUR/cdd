"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui";

export type AdvisorCard = {
  id: string;
  name: string;
  position: string;
  category: string;
  photo: string | null;
  shortBio: string | null;
  longBio: string | null;
  linkedin: string | null;
  email: string | null;
};

export default function AdvisorsBrowser({ advisors }: { advisors: AdvisorCard[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [active, setActive] = useState<AdvisorCard | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(advisors.map((a) => a.category)))],
    [advisors]
  );

  const filtered = advisors.filter((a) => {
    const matchCat = cat === "all" || a.category === cat;
    const text = `${a.name} ${a.position} ${a.category} ${a.shortBio ?? ""}`.toLowerCase();
    return matchCat && text.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un conseiller…"
          className="input sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                cat === c ? "bg-brand text-white" : "bg-brand-50 text-brand hover:bg-brand/10"
              }`}
            >
              {c === "all" ? "Tous" : c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Aucun conseiller ne correspond à votre recherche.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a)}
              className="card overflow-hidden text-left"
            >
              <Avatar src={a.photo} name={a.name} className="h-56 w-full" />
              <div className="p-5">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {a.category}
                </span>
                <h3 className="mt-2 font-semibold text-gray-900">{a.name}</h3>
                <p className="text-sm text-gray-500">{a.position}</p>
                {a.shortBio && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{a.shortBio}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-5 p-6">
              <Avatar src={active.photo} name={active.name} className="h-28 w-28 shrink-0 rounded-xl" />
              <div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {active.category}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-brand">{active.name}</h3>
                <p className="text-gray-500">{active.position}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  {active.linkedin && (
                    <a href={active.linkedin} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {active.email && (
                    <a href={`mailto:${active.email}`} className="text-brand hover:underline">
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-6 text-gray-600">
              <p className="whitespace-pre-line leading-relaxed">{active.longBio || active.shortBio}</p>
            </div>
            <div className="flex justify-end border-t border-gray-100 p-4">
              <button onClick={() => setActive(null)} className="btn-ghost">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
