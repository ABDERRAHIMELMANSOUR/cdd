import { AdminHeader } from "@/components/admin/ui";
import AdvisorForm from "../AdvisorForm";
import { createAdvisor } from "../actions";

export default function NewAdvisor() {
  return (
    <>
      <AdminHeader title="Nouveau conseiller" />
      <AdvisorForm action={createAdvisor} />
    </>
  );
}
