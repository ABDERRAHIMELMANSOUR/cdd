import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader, Panel, Badge, EmptyRow } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePost } from "./actions";

export const dynamic = "force-dynamic";

export default async function PostsAdmin() {
  const posts = await safe(
    () => prisma.post.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } }),
    []
  );
  return (
    <>
      <AdminHeader title="Blog & Actualités" subtitle="Rédigez et publiez vos articles." action={{ href: "/admin/posts/new", label: "Article" }} />
      <Panel>
        {posts.length === 0 ? (
          <EmptyRow message="Aucun article." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">Titre</th>
                <th className="p-4">Type</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">{p.title}</td>
                  <td className="p-4 text-gray-600">{p.type === "NEWS" ? "Actualité" : "Blog"}</td>
                  <td className="p-4 text-gray-600">{p.category?.name || "—"}</td>
                  <td className="p-4"><Badge active={p.published} labels={["Publié", "Brouillon"]} /></td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/posts/${p.id}`} className="text-xs font-medium text-brand hover:underline">Éditer</Link>
                      <DeleteButton action={deletePost} id={p.id} />
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
