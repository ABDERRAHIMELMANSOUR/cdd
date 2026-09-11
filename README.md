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

### 1. Variables d'environnement Vercel

À définir dans *Project → Settings → Environment Variables*, pour les trois
environnements (Production, Preview, Development) :

| Variable | Exemple | Rôle |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:MOTDEPASSE@db.xxxx.supabase.co:5432/postgres?schema=public` | Connexion PostgreSQL. Sur Supabase, prenez la *Connection string* du **session pooler** : le pooler en mode transaction ne supporte pas les requêtes préparées de Prisma. |
| `NEXTAUTH_SECRET` | sortie de `openssl rand -base64 32` | Signe les jetons de session. **Ne doit jamais être partagé avec un autre projet** : qui le connaît peut fabriquer une session d'administrateur. |
| `NEXTAUTH_URL` | `https://portail.cddpaysbas.nl` | URL publique **exacte** du portail, avec `https://` et sans barre oblique finale. Une valeur erronée fait échouer la connexion par une redirection vers un domaine inexistant. |

Variables facultatives : `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` (compte
super-admin initial créé par `npm run seed`).

> `MEMBER_DEMO_PASSWORD` crée un donateur de démonstration. Le seed l'ignore
> lorsque `NODE_ENV=production`, mais ne la définissez pas en production : une
> variable inutile est une variable qu'on finit par utiliser.

### 2. Appliquer le schéma à la base

Depuis une machine ayant accès à la base, avec le `DATABASE_URL` de production :

```bash
npx prisma db push     # crée/mets à jour les tables sans fichier de migration
npm run seed           # (première fois) crée le compte super-admin
```

`db push` convient tant que la base n'a pas d'historique de migrations à
préserver. Dès qu'il y a des données de production auxquelles tenir, passez à
`npx prisma migrate deploy`, qui rejoue des migrations versionnées et sait ce
qu'il a déjà appliqué — `db push` compare le schéma et peut proposer de
détruire une colonne pour y arriver.

Les modèles du portail (`CommunityPost`, `CommunityComment`, `CommunityLike`,
`Message`) et les champs ajoutés à `User` (`status`, `position`, `company`,
`bio`, `linkedinUrl`, `website`, `phone`, `commission`, `lastSeenAt`) sont
créés par cette étape. **Tant qu'elle n'a pas été exécutée, `/portal` et
`/admin/members` s'affichent vides** : les pages tolèrent l'absence de tables
plutôt que de planter, ce qui ressemble beaucoup à « aucun donateur inscrit ».

### 3. Relier le site public

Le site public (dépôt `CDDAYOUB`) pointe vers ce portail via sa propre variable
`VITE_PORTAL_URL`, à définir sur **son** projet Vercel :

```
VITE_PORTAL_URL=https://portail.cddpaysbas.nl
```

Tant qu'elle est absente, le bouton « Supporter Login » reste inactif et
annonce que la plateforme est en préparation, au lieu de mener à une page 404.
C'est une variable de build Vite : un redéploiement du site public est
nécessaire pour qu'un changement prenne effet.

### 4. Avant la mise en production

- [ ] `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` définis sur Vercel
- [ ] `npx prisma db push` exécuté sur la base de production
- [ ] `npm run seed` exécuté une fois, puis mot de passe admin changé
- [ ] `VITE_PORTAL_URL` défini sur le projet du site public, et celui-ci redéployé
- [ ] Déclaration de confidentialité (AVG/RGPD) mise à jour : le portail
      stocke désormais employeur, téléphone, biographie et **messages privés
      entre donateurs**

> Pour l'upload de médias en production sur un hébergement sans système de
> fichiers persistant (ex. Vercel), branchez un stockage objet (Supabase
> Storage / S3) dans `src/app/api/upload/route.ts`.
