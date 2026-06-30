import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePackage } from "./actions";

export const dynamic = "force-dynamic";

export default async function PackagesAdmin() {
  const packages = await safe(() => prisma.package.findMany({ orderBy: { order: "asc" } }), []);
  return (
    <>
      <AdminHeader title="Packages networking" subtitle="Gérez les offres de services networking." action={{ href: "/admin/packages/new", label: "Package" }} />
      <Panel>
        {packages.length === 0 ? (
          <EmptyRow message="Aucun package." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Titre</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">
                    {p.title}
                    {p.featured && <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-dark">Recommandé</span>}
                  </td>
                  <td className="p-4 text-gray-600">{p.price || "—"}</td>
                  <td className="p-4"><Badge active={p.active} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/packages/${p.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deletePackage} id={p.id} />
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
