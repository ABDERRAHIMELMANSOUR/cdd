"use client";

import { useFormState, useFormStatus } from "react-dom";
import { runRosterImport, type RosterState } from "./actions";

function Submit({ apply, label }: { apply: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="apply"
      value={apply ? "true" : "false"}
      disabled={pending}
      className={
        apply
          ? "btn-primary disabled:opacity-60"
          : "rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      }
    >
      {pending ? "…" : label}
    </button>
  );
}

export default function RosterRunner() {
  const [state, action] = useFormState<RosterState, FormData>(runRosterImport, {});
  const r = state.result;

  return (
    <form action={action} className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {/*
          Preview first, and it is the plainer of the two buttons. The import
          is the consequential action, so it should not be the one a finger
          lands on by accident.
        */}
        <Submit apply={false} label="Prévisualiser" />
        <Submit apply={true} label="Importer maintenant" />
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p className="font-semibold">L&apos;import a échoué.</p>
          <p className="mt-1 break-words font-mono text-xs">{state.error}</p>
          <p className="mt-2">
            Si le message mentionne P1001, la base est injoignable ; s&apos;il mentionne P2021,
            le schéma n&apos;a pas été appliqué.
          </p>
        </div>
      )}

      {r && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            r.applied ? "border-green-200 bg-green-50 text-green-900" : "border-blue-200 bg-blue-50 text-blue-900"
          }`}
          role="status"
        >
          <p className="font-semibold">
            {r.applied ? "Import effectué." : "Prévisualisation — rien n'a été écrit."}
          </p>
          <ul className="mt-2 space-y-0.5">
            <li>{r.created.length} profil(s) à créer</li>
            <li>{r.updated.length} profil(s) à mettre à jour</li>
            <li>{r.unchanged} déjà à jour</li>
            <li className="text-xs opacity-70">{r.total} personnes dans le fichier source</li>
          </ul>
          {r.created.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed opacity-80">
              <span className="font-medium">Créés :</span> {r.created.join(", ")}
            </p>
          )}
          {r.updated.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed opacity-80">
              <span className="font-medium">Mis à jour :</span> {r.updated.join(", ")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
