import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import PostForm from "../PostForm";
import { updatePost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true, tags: true },
  });
  if (!post) notFound();
  return (
    <>
      <AdminHeader title="Éditer l'article" />
      <PostForm action={updatePost} post={post} />
    </>
  );
}
