import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, SubmitButton } from "@/components/admin/form";

type Advisor = {
  id: string;
  name: string;
  position: string;
  category: string;
  photo: string | null;
  shortBio: string | null;
  longBio: string | null;
  linkedin: string | null;
  email: string | null;
  order: number;
  active: boolean;
};

export default function AdvisorForm({
  action,
  advisor,
}: {
  action: (fd: FormData) => void;
  advisor?: Advisor;
}) {
  return (
    <form action={action} className="space-y-6">
      {advisor && <input type="hidden" name="id" value={advisor.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" name="name" defaultValue={advisor?.name} required />
          <Field label="Poste / Titre" name="position" defaultValue={advisor?.position} placeholder="Senior Advisor" />
          <Field label="Catégorie / Expertise" name="category" defaultValue={advisor?.category} placeholder="Finance, Juridique…" help="Sert au filtre sur le site public." />
          <Field label="Ordre d'affichage" name="order" type="number" defaultValue={advisor?.order ?? 0} />
          <Field label="LinkedIn" name="linkedin" defaultValue={advisor?.linkedin} placeholder="https://linkedin.com/in/…" />
          <Field label="Email (optionnel)" name="email" type="email" defaultValue={advisor?.email} />
        </div>
        <div className="mt-5">
          <ImageField label="Photo" name="photo" defaultValue={advisor?.photo} />
        </div>
        <div className="mt-5 grid gap-5">
          <TextArea label="Bio courte" name="shortBio" defaultValue={advisor?.shortBio} rows={2} />
          <TextArea label="Bio longue" name="longBio" defaultValue={advisor?.longBio} rows={6} />
        </div>
        <div className="mt-5">
          <Toggle label="Actif (visible sur le site)" name="active" defaultChecked={advisor?.active ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/advisors" className="btn-ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
