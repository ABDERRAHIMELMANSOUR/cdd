import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon profil", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireMember();

  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      name: true,
      image: true,
      position: true,
      company: true,
      bio: true,
      phone: true,
      linkedinUrl: true,
      website: true,
      commission: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Mon profil</h1>
        <p className="mt-1 text-gray-600">
          Ces informations sont visibles par les autres supporters du réseau.
        </p>
      </header>
      <ProfileForm profile={profile} />
    </div>
  );
}
