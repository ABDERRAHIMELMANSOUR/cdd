import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import LeaderForm from "../LeaderForm";
import { updateLeader } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditLeader({ params }: { params: { id: string } }) {
  const leader = await prisma.leader.findUnique({ where: { id: params.id } });
  if (!leader) notFound();
  return (
    <>
      <AdminHeader title="Éditer le membre" />
      <LeaderForm action={updateLeader} leader={leader} />
    </>
  );
}
