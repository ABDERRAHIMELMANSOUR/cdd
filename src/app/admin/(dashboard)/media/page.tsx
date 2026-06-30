import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { AdminHeader } from "@/components/admin/ui";
import MediaUploader from "@/components/admin/MediaUploader";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMedia } from "./actions";

export const dynamic = "force-dynamic";

export default async function MediaAdmin() {
  const media = await safe(() => prisma.media.findMany({ orderBy: { createdAt: "desc" } }), []);
  return (
    <>
      <AdminHeader title="Médiathèque" subtitle="Téléversez et gérez vos images, logos, PDF et documents." />
      <div className="mb-6">
        <MediaUploader />
      </div>

      {media.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Aucun média pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="grid h-32 place-items-center bg-gray-50">
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">{m.type === "pdf" ? "📄" : "📁"}</span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-gray-700" title={m.filename}>
                  {m.filename}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">
                    Ouvrir
                  </a>
                  <DeleteButton action={deleteMedia} id={m.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
