import { AdminHeader } from "@/components/admin/ui";
import PartnerForm from "../PartnerForm";
import { createPartner } from "../actions";

export default function NewPartner() {
  return (
    <>
      <AdminHeader title="Nouveau partenaire" />
      <PartnerForm action={createPartner} />
    </>
  );
}
