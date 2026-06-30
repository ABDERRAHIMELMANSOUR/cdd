import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, Select, SubmitButton } from "@/components/admin/form";

export default function ProjectForm({ action, project }: { action: (fd: FormData) => void; project?: any }) {
  return (
    <form action={action} className="space-y-6">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Titre" name="title" defaultValue={project?.title} required />
          <Field label="Slug (URL)" name="slug" defaultValue={project?.slug} help="Auto si vide." />
          <Select
            label="Statut"
            name="status"
            defaultValue={project?.status ?? "ongoing"}
            options={[
              { value: "ongoing", label: "En cours" },
              { value: "completed", label: "Terminé" },
              { value: "upcoming", label: "À venir" },
            ]}
          />
          <Field label="Ordre" name="order" type="number" defaultValue={project?.order ?? 0} />
        </div>
        <div className="mt-5">
          <ImageField label="Image" name="image" defaultValue={project?.image} />
        </div>
        <div className="mt-5 grid gap-5">
          <TextArea label="Résumé" name="summary" defaultValue={project?.summary} rows={2} />
          <TextArea label="Contenu détaillé" name="content" defaultValue={project?.content} rows={8} />
        </div>
        <div className="mt-5">
          <Toggle label="Publié" name="published" defaultChecked={project?.published ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/projects" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
