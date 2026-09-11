import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { AdminHeader, Panel } from "@/components/admin/ui";
import MemberForm from "../MemberForm";
import { updateMember } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditMember({ params }: { params: { id: string } }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const member = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      position: true,
      company: true,
      commission: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });

  // A staff account reached by id is a 404 here rather than an editable form:
  // this screen writes MEMBER semantics and would misrepresent a staff row.
  if (!member || member.role !== "MEMBER") notFound();

  const fmt = (d: Date | null) =>
    d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d) : "jamais";

  return (
    <>
      <AdminHeader
        title={member.name}
        subtitle={`Inscrit le ${fmt(member.createdAt)} · dernière visite : ${fmt(member.lastSeenAt)}`}
      />
      <Panel className="p-6">
        <MemberForm action={updateMember} member={member} />
      </Panel>
    </>
  );
}
