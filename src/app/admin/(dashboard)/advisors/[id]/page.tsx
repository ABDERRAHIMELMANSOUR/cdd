import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import AdvisorForm from "../AdvisorForm";
import { updateAdvisor } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditAdvisor({ params }: { params: { id: string } }) {
  const advisor = await prisma.advisor.findUnique({ where: { id: params.id } });
  if (!advisor) notFound();
  return (
    <>
      <AdminHeader title="Éditer le conseiller" />
      <AdvisorForm action={updateAdvisor} advisor={advisor} />
    </>
  );
}
