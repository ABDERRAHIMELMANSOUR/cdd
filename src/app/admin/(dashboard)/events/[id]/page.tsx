import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import EventForm from "../EventForm";
import { updateEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditEvent({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();
  return (
    <>
      <AdminHeader title="Éditer l'événement" />
      <EventForm action={updateEvent} event={event} />
    </>
  );
}
