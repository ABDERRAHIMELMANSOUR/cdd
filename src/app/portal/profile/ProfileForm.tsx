"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileState } from "./actions";
import { COMMISSIONS } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";

type Profile = {
  name: string;
  image: string | null;
  position: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  website: string | null;
  commission: string | null;
};

function SubmitButton() {
  // Reads the parent form's state, so the button disables itself while the
  // action is in flight without any state plumbing.
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary">
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useFormState<ProfileState, FormData>(updateProfile, {});

  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <Avatar name={profile.name} src={profile.image} size={64} />
        <div className="flex-1">
          <label className="label" htmlFor="image">Photo (URL)</label>
          <input
            id="image"
            name="image"
            type="url"
            defaultValue={profile.image ?? ""}
            placeholder="https://…"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">Nom complet *</label>
        <input id="name" name="name" required defaultValue={profile.name} className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="position">Fonction</label>
          <input id="position" name="position" defaultValue={profile.position ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="company">Entreprise</label>
          <input id="company" name="company" defaultValue={profile.company ?? ""} className="input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="commission">Commission</label>
        <select id="commission" name="commission" defaultValue={profile.commission ?? ""} className="input">
          <option value="">— Aucune —</option>
          {COMMISSIONS.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="bio">Présentation</label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={2000}
          defaultValue={profile.bio ?? ""}
          className="input"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="linkedinUrl">LinkedIn</label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={profile.linkedinUrl ?? ""}
            placeholder="https://www.linkedin.com/in/…"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="website">Site web</label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={profile.website ?? ""}
            placeholder="https://…"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="phone">Téléphone</label>
        <input id="phone" name="phone" defaultValue={profile.phone ?? ""} className="input" />
        <p className="mt-1 text-xs text-gray-500">
          Visible uniquement par les supporters connectés.
        </p>
      </div>

      {/* role="status" so the outcome is announced rather than only seen. */}
      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}
      {state.ok && (
        <p role="status" className="text-sm text-green-700">Profil enregistré.</p>
      )}

      <SubmitButton />
    </form>
  );
}
