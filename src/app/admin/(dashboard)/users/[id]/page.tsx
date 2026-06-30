import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { AdminHeader } from "@/components/admin/ui";
import UserForm from "../UserForm";
import { updateUser } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditUser({ params }: { params: { id: string } }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();
  return (
    <>
      <AdminHeader title="Éditer l'utilisateur" />
      <UserForm action={updateUser} user={user} />
    </>
  );
}
