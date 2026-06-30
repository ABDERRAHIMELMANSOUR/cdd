import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireRole } from "@/lib/session";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteUser } from "./actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Éditeur",
};

export default async function UsersAdmin() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const users = await safe(() => prisma.user.findMany({ orderBy: { createdAt: "asc" } }), []);
  return (
    <>
      <AdminHeader title="Utilisateurs" subtitle="Gérez les accès à l'administration." action={{ href: "/admin/users/new", label: "Utilisateur" }} />
      <Panel>
        {users.length === 0 ? (
          <EmptyRow message="Aucun utilisateur." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Nom</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">{roleLabels[u.role]}</td>
                  <td className="p-4"><Badge active={u.active} labels={["Actif", "Désactivé"]} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/users/${u.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deleteUser} id={u.id} />
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
