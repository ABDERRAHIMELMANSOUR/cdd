import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/format";
import { deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function EventsAdmin() {
  const events = await safe(() => prisma.event.findMany({ orderBy: { date: "desc" } }), []);
  return (
    <>
      <AdminHeader title="Événements" subtitle="Gérez l'agenda du club." action={{ href: "/admin/events/new", label: "Événement" }} />
      <Panel>
        {events.length === 0 ? (
          <EmptyRow message="Aucun événement." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Titre</th>
                <th className="p-4">Date</th>
                <th className="p-4">Lieu</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">{e.title}</td>
                  <td className="p-4 text-gray-600">{formatDate(e.date)}</td>
                  <td className="p-4 text-gray-600">{e.location || "—"}</td>
                  <td className="p-4"><Badge active={e.published} labels={["Publié", "Brouillon"]} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/events/${e.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deleteEvent} id={e.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
