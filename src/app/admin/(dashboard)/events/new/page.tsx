import { AdminHeader } from "@/components/admin/ui";
import EventForm from "../EventForm";
import { createEvent } from "../actions";

export default function NewEvent() {
  return (
    <>
      <AdminHeader title="Nouvel événement" />
      <EventForm action={createEvent} />
    </>
  );
}
