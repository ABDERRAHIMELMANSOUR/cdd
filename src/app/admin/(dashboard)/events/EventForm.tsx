import Link from "next/link";
import { Field, TextArea, Toggle, ImageField, ListField, SubmitButton } from "@/components/admin/form";

export default function EventForm({ action, event }: { action: (fd: FormData) => void; event?: any }) {
  const dateVal = event ? new Date(event.date).toISOString().slice(0, 10) : "";
  return (
    <form action={action} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Titre" name="title" defaultValue={event?.title} required />
          <Field label="Slug (URL)" name="slug" defaultValue={event?.slug} help="Laisser vide pour générer automatiquement." />
          <Field label="Date" name="date" type="date" defaultValue={dateVal} required />
          <Field label="Heure" name="time" defaultValue={event?.time} placeholder="18:00 - 21:00" />
          <Field label="Lieu" name="location" defaultValue={event?.location} />
          <Field label="Lien d'inscription" name="registration" defaultValue={event?.registration} />
        </div>
        <div className="mt-5">
          <ImageField label="Bannière" name="banner" defaultValue={event?.banner} />
        </div>
        <div className="mt-5">
          <TextArea label="Description" name="description" defaultValue={event?.description} rows={6} />
        </div>
        <div className="mt-5">
          <ListField label="Galerie (après l'événement)" name="gallery" defaultValue={event?.gallery} help="Une URL d'image par ligne." />
        </div>
        <div className="mt-5">
          <Toggle label="Publié" name="published" defaultChecked={event?.published ?? true} />
        </div>
      </div>
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/events" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
