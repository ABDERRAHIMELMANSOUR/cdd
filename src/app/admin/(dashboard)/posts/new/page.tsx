import { AdminHeader } from "@/components/admin/ui";
import PostForm from "../PostForm";
import { createPost } from "../actions";

export default function NewPost() {
  return (
    <>
      <AdminHeader title="Nouvel article" />
      <PostForm action={createPost} />
    </>
  );
}
