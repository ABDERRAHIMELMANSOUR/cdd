/**
 * Simplified primary navigation — 5 top-level categories with grouped dropdowns.
 * Edit here to change the menu structure site-wide.
 */
export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const NAV: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "À propos",
    href: "/about",
    children: [
      { label: "CDD Pays-Bas", href: "/about" },
      { label: "Direction", href: "/about/leadership" },
      { label: "Conseillers seniors", href: "/about/advisors" },
    ],
  },
  {
    label: "Activités",
    href: "/activities",
    children: [
      { label: "Événements", href: "/activities/events" },
      { label: "Projets", href: "/activities/projects" },
      { label: "Blog", href: "/activities/blog" },
      { label: "Actualités", href: "/activities/news" },
    ],
  },
  {
    label: "Réseau",
    href: "/network",
    children: [
      { label: "Partenariats", href: "/network/partnerships" },
      { label: "Packages networking", href: "/network/packages" },
      { label: "Devenir membre", href: "/network/membership" },
      { label: "Contact", href: "/network/contact" },
    ],
  },
  { label: "ImpactNow", href: "/impactnow" },
];
