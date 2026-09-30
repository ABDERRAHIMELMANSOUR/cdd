import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { MEMBER_PUBLIC_SELECT, commissionLabel } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";
import { getT } from "@/i18n/locale";
import { localizePerson } from "@/lib/localize";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = getT();
  return { title: t.nav.directory, robots: { index: false } };
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const viewer = await requireMember();
  const { locale, t } = getT();

  /*
   * The status filter is part of the lookup, not a check afterwards. Fetching
   * the row first and deciding later is how a suspended profile ends up
   * rendered by whichever code path forgets the second step — here there is no
   * second step to forget.
   */
  const row = await prisma.user.findFirst({
    where: { id: params.id, role: "MEMBER", status: "ACTIVE", active: true },
    select: MEMBER_PUBLIC_SELECT,
  });

  if (!row) notFound();
  // Imported profiles have official NL/EN wording on the public site.
  const member = localizePerson(row, locale);

  const isSelf = viewer.id === member.id;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/directory" className="text-sm text-gray-500 hover:text-brand">
        ← {t.profile.back}
      </Link>

      <div className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={member.name} src={member.image} size={96} />
          <div className="min-w-0 flex-1">
            {/* The badge sits above the name, as it does on the public site's
                leadership cards: it is the standing the name is read in. */}
            {member.badge && (
              <p className="mb-2 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {member.badge}
              </p>
            )}
            <h1 className="font-display text-2xl font-bold text-gray-900">{member.name}</h1>
            {member.position && <p className="mt-1 font-medium text-brand">{member.position}</p>}
            {member.company && <p className="text-gray-500">{member.company}</p>}
            {member.commission && (
              <p className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand">
                {commissionLabel(member.commission, t)}
              </p>
            )}
          </div>
          {isSelf ? (
            <Link href="/portal/profile" className="btn-primary shrink-0 text-center">
              {t.profile.edit}
            </Link>
          ) : (
            <Link href={`/portal/messages/${member.id}`} className="btn-primary shrink-0 text-center">
              {t.profile.message}
            </Link>
          )}
        </div>

        {member.bio && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="label">{t.profile.about}</h2>
            {/* whitespace-pre-line so the author's own paragraph breaks survive,
                without interpreting anything they typed as markup. */}
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">{member.bio}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-100 pt-6 text-sm">
          {/*
            Email is shown to signed-in supporters only — which is the whole
            portal — and never rendered on a public page. That is the basis on
            which it was collected.
          */}
          {/*
            A roster profile imported from the public site has no real address
            — .invalid is reserved by RFC 2606 exactly so that it cannot route
            — so offering a mailto: would be a link that silently goes nowhere.
            Say so instead, and let the secretariat fill it in.
          */}
          {member.email.endsWith(".invalid") ? (
            <span className="text-gray-400">{t.profile.emailMissing}</span>
          ) : (
            <a href={`mailto:${member.email}`} className="text-brand underline">
              {member.email}
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              {t.profile.linkedin}
            </a>
          )}
          {member.website && (
            <a
              href={member.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              {t.profile.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
