import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProjectsAdmin() {
  const projects = await safe(() => prisma.project.findMany({ orderBy: { order: "asc" } }), []);
  return (
    <>
      <AdminHeader title="Projets" subtitle="Gérez les projets du club." action={{ href: "/admin/projects/new", label: "Projet" }} />
      <Panel>
        {projects.length === 0 ? (
          <EmptyRow message="Aucun projet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Titre</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Publié</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">{p.title}</td>
                  <td className="p-4 text-gray-600">{p.status}</td>
                  <td className="p-4"><Badge active={p.published} labels={["Publié", "Brouillon"]} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/projects/${p.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deleteProject} id={p.id} />
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
