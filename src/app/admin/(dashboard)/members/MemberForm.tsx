import { Field, Select } from "@/components/admin/form";
import { COMMISSIONS } from "@/lib/portal";

export type MemberFormValues = {
  id: string;
  name: string;
  email: string;
  status: string;
  position: string | null;
  company: string | null;
  commission: string | null;
};

/**
 * Create and edit share one form because the fields are identical; only the
 * password field differs, and it differs in its help text rather than in its
 * presence — on edit it is optional and leaving it blank keeps the existing
 * password, which is the behaviour /admin/users already has.
 */
export default function MemberForm({
  action,
  member,
}: {
  action: (fd: FormData) => void | Promise<void>;
  member?: MemberFormValues;
}) {
  const isNew = !member;

  return (
    <form action={action} className="space-y-5">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" defaultValue={member?.name} required />
        <Field label="Email" name="email" type="email" defaultValue={member?.email} required />
        <Field label="Fonction" name="position" defaultValue={member?.position} />
        <Field label="Organisation" name="company" defaultValue={member?.company} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Statut"
          name="status"
          defaultValue={member?.status ?? "ACTIVE"}
          options={[
            { value: "PENDING", label: "En attente d'approbation" },
            { value: "ACTIVE", label: "Actif" },
            { value: "SUSPENDED", label: "Suspendu" },
          ]}
        />
        <Select
          label="Commission"
          name="commission"
          defaultValue={member?.commission ?? ""}
          options={[
            { value: "", label: "— Aucune —" },
            ...COMMISSIONS.map((c) => ({ value: c.slug, label: c.label })),
          ]}
        />
      </div>

      <Field
        label={isNew ? "Mot de passe provisoire" : "Nouveau mot de passe"}
        name="password"
        type="password"
        required={isNew}
        help={
          isNew
            ? "Au moins 10 caractères. À transmettre au supporter, qui pourra le changer depuis son profil."
            : "Laissez vide pour conserver le mot de passe actuel."
        }
      />

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          {isNew ? "Créer le compte" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
