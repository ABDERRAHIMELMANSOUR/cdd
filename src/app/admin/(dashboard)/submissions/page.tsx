import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/format";
import { toggleHandled, deleteSubmission } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubmissionsAdmin() {
  const items = await safe(() => prisma.submission.findMany({ orderBy: { createdAt: "desc" } }), []);
  return (
    <>
      <AdminHeader title="Messages" subtitle="Demandes de contact et d'adhésion reçues depuis le site." />
      <Panel>
        {items.length === 0 ? (
          <EmptyRow message="Aucun message reçu." />
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((s) => (
              <li key={s.id} className={`p-5 ${s.handled ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand">
                        {s.type === "membership" ? "Adhésion" : "Contact"}
                      </span>
                      {s.handled && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Traité</span>}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      <a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a>
                      {s.company && <span> · {s.company}</span>}
                      <span> · {formatDate(s.createdAt)}</span>
                    </p>
                    {s.message && <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-gray-700">{s.message}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <form action={toggleHandled}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-xs font-medium text-brand hover:underline">
                        {s.handled ? "Marquer non traité" : "Marquer traité"}
                      </button>
                    </form>
                    <DeleteButton action={deleteSubmission} id={s.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
