import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import ProjectForm from "../ProjectForm";
import { updateProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();
  return (
    <>
      <AdminHeader title="Éditer le projet" />
      <ProjectForm action={updateProject} project={project} />
    </>
  );
}
