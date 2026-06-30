import { AdminHeader } from "@/components/admin/ui";
import ProjectForm from "../ProjectForm";
import { createProject } from "../actions";

export default function NewProject() {
  return (
    <>
      <AdminHeader title="Nouveau projet" />
      <ProjectForm action={createProject} />
    </>
  );
}
