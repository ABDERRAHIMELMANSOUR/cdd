import Link from "next/link";
import { Field, Toggle, Select, SubmitButton } from "@/components/admin/form";

export default function UserForm({ action, user }: { action: (fd: FormData) => void; user?: any }) {
  return (
    <form action={action} className="space-y-6">
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" name="name" defaultValue={user?.name} required />
          <Field label="Email" name="email" type="email" defaultValue={user?.email} required />
          <Field
            label={user ? "Nouveau mot de passe" : "Mot de passe"}
            name="password"
            type="password"
            required={!user}
            help={user ? "Laisser vide pour conserver l'actuel." : undefined}
          />
          <Select
            label="Rôle"
            name="role"
            defaultValue={user?.role ?? "EDITOR"}
            options={[
              { value: "SUPER_ADMIN", label: "Super Admin" },
              { value: "ADMIN", label: "Admin" },
              { value: "EDITOR", label: "Éditeur" },
            ]}
          />
        </div>
        <div className="mt-5">
          <Toggle label="Compte actif" name="active" defaultChecked={user?.active ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/users" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
