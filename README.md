# CDD Pays-Bas — Site web + Admin CMS

Site web du **Club des Dirigeants — Les Pays-Bas** avec un tableau de bord
d'administration complet permettant de gérer l'intégralité du contenu sans
toucher au code.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — thème de marque centralisé
- **PostgreSQL** (compatible **Supabase**) via **Prisma**
- **NextAuth (Auth.js)** — authentification sécurisée + rôles
- Médiathèque (upload local), SEO par page, sitemap & robots

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
#   → renseignez DATABASE_URL (PostgreSQL/Supabase) et NEXTAUTH_SECRET

# 3. Créer le schéma de base de données
npx prisma db push

# 4. Insérer les données initiales (+ compte admin)
npm run seed

# 5. Lancer le serveur de développement
npm run dev
```

Le site est disponible sur http://localhost:3000 et l'administration sur
http://localhost:3000/admin.

### Connexion admin (par défaut)

Définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Par défaut :

- Email : `admin@cddpaysbas.nl`
- Mot de passe : `ChangeMe123!` — **à changer immédiatement.**

## Identité visuelle (logo & couleurs)

Tout est centralisé pour préserver l'identité existante :

- **Couleurs** : `src/app/globals.css` (variables `--brand`, `--accent`, …)
  et `tailwind.config.ts`.
- **Logo** : recréé fidèlement en SVG dans `src/components/Sunburst.tsx` +
  `src/components/Logo.tsx`. Pour utiliser le fichier officiel, téléversez-le
  dans **Paramètres** du dashboard (champ Logo) ou déposez-le dans `/public`.

## Navigation (simplifiée — 5 catégories)

`Accueil · À propos · Activités · Réseau · ImpactNow`
avec menus déroulants. Modifiable dans `src/lib/nav.ts`.

## Administration (CMS)

`/admin` permet de gérer :

| Section | Gestion |
|---|---|
| Pages & contenu | Accueil (hero, stats, sections), À propos, ImpactNow, Adhésion, Contact + SEO |
| Direction | Président + bureau (photo, bio, LinkedIn) |
| Conseillers | CRUD complet, réordonnancement, recherche/filtre par expertise |
| Événements | Bannière, date, lieu, inscription, galerie |
| Projets | CRUD complet |
| Blog & Actualités | Articles, catégories, tags, image à la une, SEO, brouillon/publié |
| Partenaires | Logos, descriptions, liens |
| Packages networking | Offres avec fonctionnalités, prix, CTA |
| Médiathèque | Upload images / PDF / documents |
| Messages | Demandes de contact & d'adhésion |
| Utilisateurs | Rôles : Super Admin · Admin · Éditeur |
| Paramètres | Logo, coordonnées, réseaux sociaux, couleurs |

## Déploiement

Compatible **Vercel** + **Supabase** (ou tout PostgreSQL).
Variables requises : `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

> Pour l'upload de médias en production sur un hébergement sans système de
> fichiers persistant (ex. Vercel), branchez un stockage objet (Supabase
> Storage / S3) dans `src/app/api/upload/route.ts`.
