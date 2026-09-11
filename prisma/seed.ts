import { PrismaClient, Role, PostType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CDD Pays-Bas database…");

  // ── Admin user ─────────────────────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL || "admin@cddpaysbas.nl";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Super Admin";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hashed, role: Role.SUPER_ADMIN },
  });
  console.log(`   ✓ Admin user: ${email}`);

  // ── Site settings ────────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "CDD Pays-Bas",
      tagline: "Club des Dirigeants — Les Pays-Bas",
      email: "contact@cddpaysbas.nl",
      address: "Pays-Bas",
      linkedin: "https://www.linkedin.com/company/club-des-dirigeants-cdd-les-pays-bas",
    },
  });

  // ── Pages (home / about / impactnow / membership / contact) ──────────────────
  await prisma.page.upsert({
    where: { key: "home" },
    update: {},
    create: {
      key: "home",
      title: "Accueil",
      metaTitle: "CDD Pays-Bas — Club des Dirigeants",
      metaDesc:
        "Le Club des Dirigeants aux Pays-Bas : un réseau d'affaires francophone qui rassemble entrepreneurs et dirigeants.",
      content: {
        hero: {
          title: "Club des Dirigeants — Les Pays-Bas",
          subtitle:
            "Un réseau d'affaires francophone qui rassemble entrepreneurs, dirigeants et décideurs aux Pays-Bas.",
          primaryButton: { label: "Devenir membre", href: "/network/membership" },
          secondaryButton: { label: "Découvrir le réseau", href: "/network" },
          image: "",
        },
        stats: [
          { value: "150+", label: "Membres" },
          { value: "30+", label: "Événements / an" },
          { value: "20+", label: "Partenaires" },
          { value: "10+", label: "Conseillers seniors" },
        ],
        sections: [
          {
            title: "Notre mission",
            text: "CDD Pays-Bas connecte les dirigeants francophones pour favoriser les échanges, les opportunités d'affaires et le partage d'expertise.",
          },
          {
            title: "Notre réseau",
            text: "Un écosystème d'entrepreneurs, de conseillers seniors et de partenaires engagés au service de la croissance.",
          },
          {
            title: "Nos activités",
            text: "Événements, projets, conférences et rencontres tout au long de l'année.",
          },
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { key: "about" },
    update: {},
    create: {
      key: "about",
      title: "À propos",
      metaTitle: "À propos — CDD Pays-Bas",
      metaDesc: "Découvrez le Club des Dirigeants aux Pays-Bas, sa mission et ses valeurs.",
      content: {
        intro:
          "Le Club des Dirigeants (CDD) Pays-Bas est un réseau d'affaires francophone réunissant des entrepreneurs et dirigeants établis aux Pays-Bas.",
        body: "Notre vocation est de créer des ponts entre les cultures et les marchés, de favoriser l'entraide entre dirigeants et de soutenir le développement économique de nos membres. À travers nos événements, nos projets et notre réseau de conseillers seniors, nous offrons un cadre privilégié pour échanger, apprendre et grandir ensemble.",
        values: [
          { title: "Excellence", text: "Promouvoir les meilleures pratiques entre dirigeants." },
          { title: "Solidarité", text: "Favoriser l'entraide et le partage d'expérience." },
          { title: "Impact", text: "Soutenir des projets à fort impact économique et social." },
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { key: "impactnow" },
    update: {},
    create: {
      key: "impactnow",
      title: "ImpactNow",
      metaTitle: "ImpactNow — Smart Business Platform | CDD Pays-Bas",
      metaDesc:
        "ImpactNow, la plateforme intelligente de networking et de connaissances propulsée par l'IA. Bientôt disponible.",
      content: {
        title: "ImpactNow — Smart Business Platform",
        subtitle:
          "Notre plateforme de networking et de connaissances propulsée par l'IA est en cours de développement.",
        body: "ImpactNow réinventera la manière dont les dirigeants se connectent, partagent et créent de la valeur. Restez à l'écoute.",
        status: "Coming Soon",
      },
    },
  });

  await prisma.page.upsert({
    where: { key: "membership" },
    update: {},
    create: {
      key: "membership",
      title: "Devenir membre",
      metaTitle: "Devenir membre — CDD Pays-Bas",
      metaDesc: "Rejoignez le Club des Dirigeants aux Pays-Bas.",
      content: {
        intro: "Rejoignez un réseau de dirigeants engagés et bénéficiez d'opportunités uniques.",
        benefits: [
          "Accès à tous les événements du club",
          "Mise en relation avec des dirigeants et partenaires",
          "Accompagnement par des conseillers seniors",
          "Visibilité au sein du réseau",
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { key: "contact" },
    update: {},
    create: {
      key: "contact",
      title: "Contact",
      metaTitle: "Contact — CDD Pays-Bas",
      metaDesc: "Contactez le Club des Dirigeants aux Pays-Bas.",
      content: {
        intro: "Une question ? Envie de nous rejoindre ? Écrivez-nous.",
      },
    },
  });

  // ── Leadership ───────────────────────────────────────────────────────────────
  const leaderCount = await prisma.leader.count();
  if (leaderCount === 0) {
    await prisma.leader.createMany({
      data: [
        {
          name: "Président du CDD",
          position: "Président",
          isPresident: true,
          bio: "Dirigeant expérimenté à la tête du Club des Dirigeants Pays-Bas.",
          order: 0,
        },
        { name: "Vice-Président", position: "Vice-Président", order: 1 },
        { name: "Secrétaire Général", position: "Secrétaire Général", order: 2 },
        { name: "Trésorier", position: "Trésorier", order: 3 },
      ],
    });
  }

  // ── Advisors ─────────────────────────────────────────────────────────────────
  const advisorCount = await prisma.advisor.count();
  if (advisorCount === 0) {
    await prisma.advisor.createMany({
      data: [
        {
          name: "Conseiller Senior — Finance",
          position: "Senior Advisor",
          category: "Finance",
          shortBio: "Expert en finance d'entreprise et levée de fonds.",
          longBio:
            "Plus de 20 ans d'expérience dans la finance d'entreprise, l'investissement et l'accompagnement de dirigeants.",
          order: 0,
        },
        {
          name: "Conseiller Senior — Juridique",
          position: "Senior Advisor",
          category: "Juridique",
          shortBio: "Spécialiste du droit des affaires international.",
          order: 1,
        },
        {
          name: "Conseiller Senior — Stratégie",
          position: "Senior Advisor",
          category: "Stratégie",
          shortBio: "Accompagnement stratégique de dirigeants et de PME.",
          order: 2,
        },
      ],
    });
  }

  // ── Categories & sample blog post ────────────────────────────────────────────
  const cat = await prisma.category.upsert({
    where: { slug: "actualites" },
    update: {},
    create: { name: "Actualités", slug: "actualites" },
  });

  await prisma.post.upsert({
    where: { slug: "bienvenue-sur-le-nouveau-site-cdd" },
    update: {},
    create: {
      title: "Bienvenue sur le nouveau site du CDD Pays-Bas",
      slug: "bienvenue-sur-le-nouveau-site-cdd",
      excerpt: "Découvrez la nouvelle plateforme du Club des Dirigeants aux Pays-Bas.",
      content:
        "Nous sommes ravis de vous présenter le nouveau site du CDD Pays-Bas, entièrement administrable et pensé pour mieux servir notre communauté de dirigeants.",
      type: PostType.NEWS,
      published: true,
      publishedAt: new Date(),
      authorName: "CDD Pays-Bas",
      categoryId: cat.id,
    },
  });

  // ── Networking packages ──────────────────────────────────────────────────────
  const pkgCount = await prisma.package.count();
  if (pkgCount === 0) {
    await prisma.package.createMany({
      data: [
        {
          title: "Essentiel",
          slug: "essentiel",
          description: "Pour les dirigeants qui souhaitent rejoindre le réseau.",
          price: "Sur demande",
          features: ["Accès aux événements", "Annuaire des membres", "Newsletter"],
          order: 0,
        },
        {
          title: "Premium",
          slug: "premium",
          description: "Une visibilité et un accompagnement renforcés.",
          price: "Sur demande",
          features: [
            "Tous les avantages Essentiel",
            "Mise en avant sur le site",
            "Accès prioritaire aux conseillers seniors",
            "Invitations VIP",
          ],
          featured: true,
          order: 1,
        },
        {
          title: "Partenaire",
          slug: "partenaire",
          description: "Pour les entreprises souhaitant soutenir le réseau.",
          price: "Sur demande",
          features: ["Logo sur le site", "Présence aux événements", "Co-branding"],
          order: 2,
        },
      ],
    });
  }

  // ── Partners ─────────────────────────────────────────────────────────────────
  const partnerCount = await prisma.partner.count();
  if (partnerCount === 0) {
    await prisma.partner.createMany({
      data: [
        { name: "Partenaire institutionnel", order: 0 },
        { name: "Partenaire entreprise", order: 1 },
      ],
    });
  }

  // ── Community portal: a demo supporter ───────────────────────────────────────
  // Only in development, and only when MEMBER_DEMO_PASSWORD is set. A seeded
  // account with a known password is a back door if it ever reaches production,
  // so it needs both conditions rather than a comment asking nicely.
  const demoPassword = process.env.MEMBER_DEMO_PASSWORD;
  if (process.env.NODE_ENV !== "production" && demoPassword) {
    const email = "donateur@example.test";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: "Donateur Démo",
          password: await bcrypt.hash(demoPassword, 10),
          role: "MEMBER",
          status: "ACTIVE",
          position: "Directeur général",
          company: "Exemple B.V.",
          commission: "industry-trade-logistics",
          bio: "Compte de démonstration pour le portail. À supprimer avant la mise en ligne.",
        },
      });
      console.log(`   demo supporter: ${email}`);
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
