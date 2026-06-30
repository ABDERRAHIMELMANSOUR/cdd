import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import PartnerForm from "../PartnerForm";
import { updatePartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPartner({ params }: { params: { id: string } }) {
  const partner = await prisma.partner.findUnique({ where: { id: params.id } });
  if (!partner) notFound();
  return (
    <>
      <AdminHeader title="Éditer le partenaire" />
      <PartnerForm action={updatePartner} partner={partner} />
    </>
  );
}
