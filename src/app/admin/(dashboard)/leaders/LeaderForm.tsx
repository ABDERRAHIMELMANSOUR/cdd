import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, SubmitButton } from "@/components/admin/form";

export default function LeaderForm({ action, leader }: { action: (fd: FormData) => void; leader?: any }) {
  return (
    <form action={action} className="space-y-6">
      {leader && <input type="hidden" name="id" value={leader.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" name="name" defaultValue={leader?.name} required />
          <Field label="Poste" name="position" defaultValue={leader?.position} required placeholder="Président, Trésorier…" />
          <Field label="LinkedIn" name="linkedin" defaultValue={leader?.linkedin} />
          <Field label="Email" name="email" type="email" defaultValue={leader?.email} />
          <Field label="Ordre" name="order" type="number" defaultValue={leader?.order ?? 0} />
        </div>
        <div className="mt-5">
          <ImageField label="Photo" name="photo" defaultValue={leader?.photo} />
        </div>
        <div className="mt-5">
          <TextArea label="Biographie" name="bio" defaultValue={leader?.bio} rows={5} />
        </div>
        <div className="mt-5 flex gap-6">
          <Toggle label="Président" name="isPresident" defaultChecked={leader?.isPresident ?? false} />
          <Toggle label="Actif" name="active" defaultChecked={leader?.active ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/leaders" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
