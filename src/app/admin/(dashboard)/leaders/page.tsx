import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import { Avatar } from "@/components/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteLeader } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadersAdmin() {
  const leaders = await safe(
    () => prisma.leader.findMany({ orderBy: [{ isPresident: "desc" }, { order: "asc" }] }),
    []
  );
  return (
    <>
      <AdminHeader title="Direction" subtitle="Président et membres du bureau." action={{ href: "/admin/leaders/new", label: "Membre" }} />
      <Panel>
        {leaders.length === 0 ? (
          <EmptyRow message="Aucun membre de direction." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Membre</th>
                <th className="p-4">Poste</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={l.photo} name={l.name} className="h-10 w-10 rounded-full" />
                      <span className="font-medium text-gray-900">{l.name}</span>
                      {l.isPresident && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-dark">Président</span>}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{l.position}</td>
                  <td className="p-4"><Badge active={l.active} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/leaders/${l.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deleteLeader} id={l.id} />
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
