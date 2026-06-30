import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, SubmitButton } from "@/components/admin/form";

export default function PartnerForm({ action, partner }: { action: (fd: FormData) => void; partner?: any }) {
  return (
    <form action={action} className="space-y-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" name="name" defaultValue={partner?.name} required />
          <Field label="Lien (site web)" name="url" defaultValue={partner?.url} />
          <Field label="Ordre" name="order" type="number" defaultValue={partner?.order ?? 0} />
        </div>
        <div className="mt-5">
          <ImageField label="Logo" name="logo" defaultValue={partner?.logo} />
        </div>
        <div className="mt-5">
          <TextArea label="Description" name="description" defaultValue={partner?.description} rows={3} />
        </div>
        <div className="mt-5">
          <Toggle label="Actif" name="active" defaultChecked={partner?.active ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/partners" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
