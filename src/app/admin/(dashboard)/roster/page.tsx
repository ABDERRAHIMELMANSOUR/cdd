import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireRole } from "@/lib/session";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { UNUSABLE_PASSWORD } from "@/lib/roster";
import roster from "@/data/roster.json";
import RosterRunner from "./RosterRunner";

export const dynamic = "force-dynamic";

export default async function RosterAdmin() {
  await requireRole(["SUPER_ADMIN"]);

  const [members, imported] = await Promise.all([
    safe(() => prisma.user.count({ where: { role: "MEMBER" } }), 0),
    safe(() => prisma.user.count({ where: { password: UNUSABLE_PASSWORD } }), 0),
  ]);

  return (
    <>
      <AdminHeader
        title="Import de l'annuaire"
        subtitle="Reprend les conseillers et membres du bureau depuis le site public."
      />

      <Panel className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Dans le fichier source</p>
            <p className="font-display text-2xl font-bold text-brand">{roster.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Supporters en base</p>
            <p className="font-display text-2xl font-bold text-brand">{members}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profils importés</p>
            <p className="font-display text-2xl font-bold text-brand">{imported}</p>
          </div>
        </div>

        <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Ce sont des profils, pas des accès.</span> Les comptes
            créés ici reçoivent un mot de passe volontairement inutilisable : personne ne peut s&apos;y
            connecter. Pour donner un accès réel, ouvrez la fiche dans{" "}
            <span className="font-medium">Donateurs</span> et définissez un mot de passe.
          </p>
          <p>
            L&apos;import ne modifie jamais l&apos;email, le mot de passe, le rôle ni le statut
            d&apos;une fiche existante — il ne met à jour que la fonction, la biographie, la photo,
            le lien LinkedIn et la commission. Vous pouvez donc le relancer sans risque.
          </p>
          <p>
            Les adresses sont des espaces réservés en <code>.invalid</code> tant que les vraies
            adresses n&apos;ont pas été saisies ; la fiche affiche « Adresse non renseignée »
            plutôt qu&apos;un lien qui ne mène nulle part.
          </p>
        </div>

        <RosterRunner />
      </Panel>
    </>
  );
}
