import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePartner } from "./actions";

export const dynamic = "force-dynamic";

export default async function PartnersAdmin() {
  const partners = await safe(() => prisma.partner.findMany({ orderBy: { order: "asc" } }), []);
  return (
    <>
      <AdminHeader title="Partenaires" subtitle="Gérez les partenaires affichés sur le site." action={{ href: "/admin/partners/new", label: "Partenaire" }} />
      <Panel>
        {partners.length === 0 ? (
          <EmptyRow message="Aucun partenaire." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Partenaire</th>
                <th className="p-4">Lien</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo} alt={p.name} className="h-8 w-auto object-contain" />
                      ) : (
                        <div className="grid h-8 w-8 place-items-center rounded bg-brand-50 text-xs font-bold text-brand">{p.name.charAt(0)}</div>
                      )}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{p.url || "—"}</td>
                  <td className="p-4"><Badge active={p.active} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/partners/${p.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deletePartner} id={p.id} />
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
