import { prisma } from "@/lib/prisma";

/**
 * Resilient content helpers. Every getter wraps the DB call in try/catch and
 * returns a sensible default, so the public site renders gracefully even if the
 * database is unavailable (e.g. before `DATABASE_URL` is configured).
 */

export type PageContent = Record<string, any>;

const DEFAULT_PAGES: Record<string, { title: string; content: PageContent }> = {
  home: {
    title: "Accueil",
    content: {
      hero: {
        title: "Club des Dirigeants — Les Pays-Bas",
        subtitle:
          "Un réseau d'affaires francophone qui rassemble entrepreneurs, dirigeants et décideurs aux Pays-Bas.",
        primaryButton: { label: "Devenir membre", href: "/network/membership" },
        secondaryButton: { label: "Découvrir le réseau", href: "/network" },
      },
      stats: [
        { value: "150+", label: "Membres" },
        { value: "30+", label: "Événements / an" },
        { value: "20+", label: "Partenaires" },
        { value: "10+", label: "Conseillers seniors" },
      ],
      sections: [
        { title: "Notre mission", text: "CDD Pays-Bas connecte les dirigeants francophones." },
        { title: "Notre réseau", text: "Un écosystème d'entrepreneurs et de partenaires engagés." },
        { title: "Nos activités", text: "Événements, projets et rencontres toute l'année." },
      ],
    },
  },
  about: {
    title: "À propos",
    content: {
      intro:
        "Le Club des Dirigeants (CDD) Pays-Bas est un réseau d'affaires francophone réunissant des entrepreneurs et dirigeants établis aux Pays-Bas.",
      body: "",
      values: [],
    },
  },
  impactnow: {
    title: "ImpactNow",
    content: {
      title: "ImpactNow — Smart Business Platform",
      subtitle:
        "Notre plateforme de networking et de connaissances propulsée par l'IA est en cours de développement.",
      body: "Restez à l'écoute.",
      status: "Coming Soon",
    },
  },
  membership: {
    title: "Devenir membre",
    content: { intro: "Rejoignez un réseau de dirigeants engagés.", benefits: [] },
  },
  contact: {
    title: "Contact",
    content: { intro: "Une question ? Écrivez-nous." },
  },
};

export async function getPage(key: string) {
  try {
    const page = await prisma.page.findUnique({ where: { key } });
    if (page) return page;
  } catch {
    /* fall through to default */
  }
  const def = DEFAULT_PAGES[key] ?? { title: key, content: {} };
  return {
    id: key,
    key,
    title: def.title,
    content: def.content,
    published: true,
    metaTitle: null as string | null,
    metaDesc: null as string | null,
    ogImage: null as string | null,
    updatedAt: new Date(),
  };
}

export async function getSiteSettings() {
  const fallback = {
    id: "singleton",
    siteName: "CDD Pays-Bas",
    logo: null as string | null,
    tagline: "Club des Dirigeants — Les Pays-Bas",
    email: "contact@cddpaysbas.nl",
    phone: null as string | null,
    address: "Pays-Bas",
    linkedin: null as string | null,
    facebook: null as string | null,
    instagram: null as string | null,
    twitter: null as string | null,
    brandColor: null as string | null,
    accentColor: null as string | null,
    updatedAt: new Date(),
  };
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    return s ?? fallback;
  } catch {
    return fallback;
  }
}

export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
