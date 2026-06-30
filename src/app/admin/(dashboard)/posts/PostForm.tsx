import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, Select, SubmitButton } from "@/components/admin/form";

export default function PostForm({ action, post }: { action: (fd: FormData) => void; post?: any }) {
  const tagString = post?.tags?.map((t: any) => t.name).join(", ") ?? "";
  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="grid gap-5">
              <Field label="Titre" name="title" defaultValue={post?.title} required />
              <Field label="Slug (URL)" name="slug" defaultValue={post?.slug} help="Auto si vide." />
              <TextArea label="Extrait" name="excerpt" defaultValue={post?.excerpt} rows={2} />
              <TextArea label="Contenu" name="content" defaultValue={post?.content} rows={14} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">SEO</h3>
            <div className="grid gap-5">
              <Field label="Meta title" name="metaTitle" defaultValue={post?.metaTitle} />
              <TextArea label="Meta description" name="metaDesc" defaultValue={post?.metaDesc} rows={2} />
              <ImageField label="Image Open Graph" name="ogImage" defaultValue={post?.ogImage} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="grid gap-5">
              <Select
                label="Type"
                name="type"
                defaultValue={post?.type ?? "BLOG"}
                options={[
                  { value: "BLOG", label: "Blog" },
                  { value: "NEWS", label: "Actualité" },
                ]}
              />
              <Toggle label="Publié" name="published" defaultChecked={post?.published ?? false} />
              <Field label="Auteur" name="authorName" defaultValue={post?.authorName} />
              <Field label="Catégorie" name="category" defaultValue={post?.category?.name} placeholder="Actualités" />
              <Field label="Tags" name="tags" defaultValue={tagString} help="Séparés par des virgules." />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <ImageField label="Image à la une" name="featured" defaultValue={post?.featured} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/posts" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
