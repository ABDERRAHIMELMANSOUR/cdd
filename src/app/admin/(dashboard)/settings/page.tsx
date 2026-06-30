import { getSiteSettings } from "@/lib/content";
import { AdminHeader } from "@/components/admin/ui";
import { Field, TextArea, ImageField, SubmitButton } from "@/components/admin/form";
import { updateSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  const s = await getSiteSettings();
  return (
    <>
      <AdminHeader title="Paramètres du site" subtitle="Logo, coordonnées et réseaux sociaux." />
      <form action={updateSettings} className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Identité</h3>
          <div className="grid gap-5">
            <Field label="Nom du site" name="siteName" defaultValue={s.siteName} />
            <Field label="Slogan" name="tagline" defaultValue={s.tagline} />
            <ImageField label="Logo" name="logo" defaultValue={s.logo} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Couleur de marque (hex)" name="brandColor" defaultValue={s.brandColor} placeholder="#2563eb" />
              <Field label="Couleur d'accent (hex)" name="accentColor" defaultValue={s.accentColor} placeholder="#5b9bd5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Coordonnées</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" name="email" type="email" defaultValue={s.email} />
            <Field label="Téléphone" name="phone" defaultValue={s.phone} />
          </div>
          <div className="mt-5">
            <TextArea label="Adresse" name="address" defaultValue={s.address} rows={2} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Réseaux sociaux</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="LinkedIn" name="linkedin" defaultValue={s.linkedin} />
            <Field label="Facebook" name="facebook" defaultValue={s.facebook} />
            <Field label="Instagram" name="instagram" defaultValue={s.instagram} />
            <Field label="Twitter / X" name="twitter" defaultValue={s.twitter} />
          </div>
        </div>

        <SubmitButton />
      </form>
    </>
  );
}
