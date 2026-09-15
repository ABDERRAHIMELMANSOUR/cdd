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

| Variable | Rôle | Ce qui casse si elle est absente ou erronée |
|---|---|---|
| `DATABASE_URL` | Connexion de l'application — pooler **transaction**, port **6543**, avec `?pgbouncer=true&connection_limit=1` | Sans `pgbouncer=true` : erreurs `prepared statement "s0" already exists`, intermittentes et uniquement en production |
| `DIRECT_URL` | Connexion des migrations — pooler **session**, port **5432** | **`prisma generate` refuse de démarrer**, donc `npm run build` échoue : cette variable est requise, pas optionnelle |
| `NEXTAUTH_SECRET` | Signe les jetons de session (`openssl rand -base64 32`) | Qui la connaît peut fabriquer une session d'administrateur — ne jamais la partager entre projets |
| `NEXTAUTH_URL` | `https://www.cddpaysbas.nl` — le domaine **public**, pas l'URL `.vercel.app` du projet portail | La connexion échoue par une redirection vers un domaine inexistant. Le portail étant servi via les rewrites du site public, cookies et callbacks doivent être émis pour le domaine que le navigateur voit |

Les deux URL se copient depuis *Supabase → Project Settings → Database →
Connection string → Connection pooling*, en changeant le mode dans le menu
déroulant. Deux pièges :

- **L'identifiant est `postgres.<project-ref>`**, pas `postgres`. C'est ainsi
  que le pooler sait à quel projet se connecter ; un `postgres` seul échoue
  l'authentification avec un mot de passe pourtant correct.
- **L'hôte contient la région** (`aws-0-<region>.pooler.supabase.com`). Prenez
  celui qu'affiche le tableau de bord : une région devinée donne un nom qui ne
  résout pas.

Un mot de passe contenant `@ : / ? # &` doit être encodé (`@` → `%40`, etc.),
sinon l'URL se lit comme un autre hôte et l'erreur accuse l'hôte plutôt que le
mot de passe.

> On passe par le pooler et non par `db.<ref>.supabase.co` : cet hôte direct ne
> résout plus qu'en IPv6, que le réseau de Vercel atteint mal.

Variables facultatives : `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` (compte
super-admin initial créé par `npm run seed`).

> `MEMBER_DEMO_PASSWORD` crée un supporter de démonstration. Le seed l'ignore
> lorsque `NODE_ENV=production`, mais ne la définissez pas en production : une
> variable inutile est une variable qu'on finit par utiliser.

### 2. Appliquer le schéma à la base

Depuis une machine ayant accès à la base (un poste de travail ; l'environnement
d'exécution de Claude bloque `supabase.co` au niveau du proxy) :

```bash
cp .env.example .env        # puis renseignez PASSWORD et REGION dans les deux URL
npx prisma db push          # crée/met à jour les tables
npm run seed                # (première fois) crée le compte super-admin
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
plutôt que de planter, ce qui ressemble beaucoup à « aucun supporter inscrit ».

Après le seed, connectez-vous une fois sur `/admin/login` et changez le mot de
passe : `ADMIN_PASSWORD` a transité par un fichier et par l'historique du shell.

### 3. Relier le site public — un seul domaine

Il n'y a **pas** de sous-domaine `portail.`. Le portail est servi sous le
domaine public via les *rewrites* du projet `CDDAYOUB` (`vercel.json`) : le
site public reçoit la requête et la relaie au déploiement du portail, sans que
le navigateur quitte `www.cddpaysbas.nl`.

Les préfixes relayés sont `/login`, `/portal`, `/admin`, `/api` et `/_next`.
Aucun n'entre en conflit avec une route du site public, qui n'en sert aucune.

**`/_next` et `/portal` ne sont pas optionnels.** Sans `/_next`, la page de
connexion s'affiche sans styles ni JavaScript ; sans `/portal`, la connexion
réussit puis mène à une page que le site public ne sert pas.

La destination de ces rewrites est l'URL du déploiement du portail
(`https://<projet>.vercel.app`). C'est la seule valeur à renseigner dans
`CDDAYOUB/vercel.json`, où elle figure sous la forme
`REPLACE-WITH-PORTAL-DEPLOYMENT`.

`VITE_PORTAL_URL` n'est plus nécessaire : `https://www.cddpaysbas.nl` est la
valeur par défaut compilée dans le bundle. La variable ne sert qu'à pointer une
préproduction ailleurs. C'est une variable de build Vite : un redéploiement du
site public est nécessaire pour qu'un changement prenne effet.

### 4. Avant la mise en production

- [ ] `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` définis sur Vercel
- [ ] `npx prisma db push` exécuté sur la base de production
- [ ] `npm run seed` exécuté une fois, puis mot de passe admin changé
- [ ] Destination des rewrites renseignée dans `CDDAYOUB/vercel.json`, et le site public redéployé
- [ ] Déclaration de confidentialité (AVG/RGPD) mise à jour : le portail
      stocke désormais employeur, téléphone, biographie et **messages privés
      entre supporters**

> Pour l'upload de médias en production sur un hébergement sans système de
> fichiers persistant (ex. Vercel), branchez un stockage objet (Supabase
> Storage / S3) dans `src/app/api/upload/route.ts`.
