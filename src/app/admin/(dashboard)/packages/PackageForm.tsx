import Link from "next/link";
import { Field, TextArea, Toggle, ListField, SubmitButton } from "@/components/admin/form";

export default function PackageForm({ action, pkg }: { action: (fd: FormData) => void; pkg?: any }) {
  return (
    <form action={action} className="space-y-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Titre" name="title" defaultValue={pkg?.title} required />
          <Field label="Slug (URL)" name="slug" defaultValue={pkg?.slug} help="Auto si vide." />
          <Field label="Prix (optionnel)" name="price" defaultValue={pkg?.price} placeholder="Sur demande" />
          <Field label="Ordre" name="order" type="number" defaultValue={pkg?.order ?? 0} />
          <Field label="Libellé du bouton" name="ctaLabel" defaultValue={pkg?.ctaLabel ?? "Nous contacter"} />
          <Field label="Lien du bouton" name="ctaUrl" defaultValue={pkg?.ctaUrl ?? "/network/contact"} />
        </div>
        <div className="mt-5">
          <TextArea label="Description" name="description" defaultValue={pkg?.description} rows={3} />
        </div>
        <div className="mt-5">
          <ListField label="Fonctionnalités incluses" name="features" defaultValue={pkg?.features} />
        </div>
        <div className="mt-5 flex gap-6">
          <Toggle label="Mis en avant (Recommandé)" name="featured" defaultChecked={pkg?.featured ?? false} />
          <Toggle label="Actif" name="active" defaultChecked={pkg?.active ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/packages" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
