import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import { Avatar } from "@/components/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteAdvisor, reorderAdvisor } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdvisorsAdmin() {
  const advisors = await safe(() => prisma.advisor.findMany({ orderBy: { order: "asc" } }), []);

  return (
    <>
      <AdminHeader
        title="Conseillers seniors"
        subtitle="Gérez le collège de conseillers, leurs expertises et leur ordre."
        action={{ href: "/admin/advisors/new", label: "Conseiller" }}
      />
      <Panel>
        {advisors.length === 0 ? (
          <EmptyRow message="Aucun conseiller. Ajoutez-en un pour commencer." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Conseiller</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {advisors.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={a.photo} name={a.name} className="h-10 w-10 rounded-full" />
                      <div>
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{a.category}</td>
                  <td className="p-4">
                    <Badge active={a.active} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <form action={reorderAdvisor} className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button className="text-gray-400 hover:text-brand" title="Monter">↑</button>
                      </form>
                      <form action={reorderAdvisor} className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button className="text-gray-400 hover:text-brand" title="Descendre">↓</button>
                      </form>
                      <Link href={`/admin/advisors/${a.id}`} className="text-xs font-medium text-brand hover:underline">
                        Éditer
                      </Link>
                      <DeleteButton action={deleteAdvisor} id={a.id} />
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
