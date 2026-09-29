import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import ProfileForm from "./ProfileForm";
import { getT } from "@/i18n/locale";

export const dynamic = "force-dynamic";
// The tab title follows the reader's language like everything else.
export async function generateMetadata() {
  const { t } = getT();
  return { title: t.profileEdit.title, robots: { index: false } };
}

export default async function ProfilePage() {
  const user = await requireMember();
  const { t } = getT();

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
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">{t.profileEdit.title}</h1>
        <p className="mt-1 text-gray-600">
          {t.profileEdit.subtitle}
        </p>
      </header>
      <ProfileForm t={t} profile={profile} />
    </div>
  );
}
