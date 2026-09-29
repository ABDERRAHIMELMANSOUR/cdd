/**
 * Portal dictionary — EN / NL / FR.
 *
 * Mirrors the public site's approach: one exported `Dictionary` interface, then
 * one complete object per locale. The interface is the point. TypeScript fails
 * the build when a locale is missing a key, so a half-translated portal cannot
 * ship — which is the failure mode that makes most i18n rot, a language that
 * silently falls back to another for a handful of strings nobody notices.
 *
 * ── WHY THE LOCALE LIVES IN A COOKIE AND NOT IN THE URL ──────────────────────
 * The public site prefixes its routes (/nl/events) because it needs a separate
 * indexable URL per language. The portal is behind a login and sends
 * robots: noindex on every page, so a locale segment would buy nothing and cost
 * a restructure of every route plus a rewrite of every internal link.
 *
 * A cookie read server-side gives the same result for a private app: server
 * components render already-translated HTML, there is no flash of the wrong
 * language, and the choice survives navigation and revisits.
 *
 * /admin is deliberately not covered. It is the secretariat's tool, they work
 * in French, and translating it would double the surface for no reader.
 */

export const LOCALES = ["en", "nl", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

/** French: the working language of the network, and the portal's origin. */
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

export interface Dictionary {
  common: {
    changeLanguage: string;
    back: string;
    cancel: string;
    send: string;
    search: string;
    filter: string;
    none: string;
  };
  nav: {
    home: string;
    feed: string;
    messages: string;
    events: string;
    directory: string;
    profile: string;
    admin: string;
    signOut: string;
    openMenu: string;
    closeMenu: string;
    portalLabel: string;
    /** `{n}` */
    unreadLabel: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    invalid: string;
    suspended: string;
    inactive: string;
    failed: string;
    noAccess: string;
  };
  home: {
    /** `{name}` */
    greeting: string;
    subtitle: string;
    feedTitle: string;
    feedBody: string;
    messagesTitle: string;
    messagesBody: string;
    eventsTitle: string;
    eventsBody: string;
    directoryTitle: string;
    directoryBody: string;
    /** `{n}` */
    latest: string;
    seeAll: string;
    noneYet: string;
  };
  feed: {
    title: string;
    subtitle: string;
    /** `{name}` */
    placeholder: string;
    linkLabel: string;
    linkPlaceholder: string;
    publish: string;
    publishing: string;
    emptyTitle: string;
    empty: string;
    loadMore: string;
    end: string;
    like: string;
    /** `{n}` */
    comments: string;
    share: string;
    sharePlaceholder: string;
    shareSubmit: string;
    shareCancel: string;
    shareRemarkLabel: string;
    deletedSource: string;
    commentPlaceholder: string;
    commentLabel: string;
    delete: string;
    hide: string;
    deleteComment: string;
  };
  directory: {
    title: string;
    /** `{n}` */
    count: string;
    searchLabel: string;
    searchPlaceholder: string;
    commission: string;
    allCommissions: string;
    noMatchTitle: string;
    noMatch: string;
    clearFilters: string;
  };
  profile: {
    back: string;
    message: string;
    edit: string;
    about: string;
    emailMissing: string;
    linkedin: string;
    website: string;
  };
  profileEdit: {
    title: string;
    subtitle: string;
    photo: string;
    name: string;
    position: string;
    company: string;
    bio: string;
    phone: string;
    linkedin: string;
    website: string;
    commission: string;
    noCommission: string;
    save: string;
    saving: string;
    saved: string;
  };
  messages: {
    title: string;
    subtitle: string;
    writeSomeone: string;
    emptyTitle: string;
    empty: string;
    browse: string;
    you: string;
    /** `{n}` */
    unread: string;
    /** `{name}` */
    placeholder: string;
    noMessages: string;
    back: string;
    /** `{name}` */
    messageLabel: string;
  };
  events: {
    title: string;
    subtitle: string;
    upcoming: string;
    past: string;
    emptyTitle: string;
    empty: string;
    register: string;
  };
  pending: {
    title: string;
    body: string;
  };
  /**
   * Messages returned by server actions and rendered in the UI. They belong in
   * the dictionary for the same reason the labels do: a Dutch reader who
   * submits an empty message should not be answered in French.
   */
  errors: {
    invalid: string;
    emptyPost: string;
    postTooLong: string;
    emptyComment: string;
    commentTooLong: string;
    emptyMessage: string;
    messageTooLong: string;
    badLink: string;
    linkScheme: string;
    postGone: string;
    alreadyShared: string;
    ownPost: string;
    cannotWriteSelf: string;
    cannotReceive: string;
    nameRequired: string;
    badAddress: string;
  };
}

const en: Dictionary = {
  common: {
    changeLanguage: "Change language",
    back: "Back",
    cancel: "Cancel",
    send: "Send",
    search: "Search",
    filter: "Filter",
    none: "None",
  },
  nav: {
    home: "Home",
    feed: "Feed",
    messages: "Messages",
    events: "Events",
    directory: "Directory",
    profile: "My profile",
    admin: "Administration",
    signOut: "Sign out",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    portalLabel: "CDD Pays-Bas portal",
    unreadLabel: "{n} unread messages",
  },
  login: {
    title: "Supporters area",
    subtitle: "CDD Pays-Bas — private network",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    invalid: "Invalid credentials.",
    suspended: "Your access has been suspended. Please contact the secretariat.",
    inactive: "This account is deactivated. Please contact the secretariat.",
    failed: "Sign-in failed. Try again, or contact the secretariat if it persists.",
    noAccess:
      "No access yet? Credentials are issued by the secretariat once your supporterschap is confirmed.",
  },
  home: {
    greeting: "Hello {name}",
    subtitle: "The private network of CDD Pays-Bas supporters.",
    feedTitle: "Feed",
    feedBody: "Post and react to news from the network.",
    messagesTitle: "Messages",
    messagesBody: "Write privately to other supporters.",
    eventsTitle: "Events",
    eventsBody: "Past and upcoming gatherings of the network.",
    directoryTitle: "Directory",
    directoryBody: "Find supporters by name or commission.",
    latest: "Latest supporters ({n})",
    seeAll: "See all",
    noneYet: "No active supporters yet.",
  },
  feed: {
    title: "Feed",
    subtitle: "Posts from CDD Pays-Bas supporters.",
    placeholder: "Share something, {name}…",
    linkLabel: "Link or media (optional)",
    linkPlaceholder: "https://…",
    publish: "Post",
    publishing: "Posting…",
    emptyTitle: "The feed starts here",
    empty: "This is where supporters share news, wins and what they are working on. Nobody has posted yet — the box above is waiting for the first one.",
    loadMore: "Load more",
    end: "No more posts to show.",
    like: "Like",
    comments: "{n} comments",
    share: "Share",
    sharePlaceholder: "Add a note (optional)…",
    shareSubmit: "Share",
    shareCancel: "Cancel",
    shareRemarkLabel: "Add a note to your share",
    deletedSource: "The shared post has been deleted.",
    commentPlaceholder: "Write a comment…",
    commentLabel: "Your comment",
    delete: "Delete",
    hide: "Hide",
    deleteComment: "Delete this comment",
  },
  directory: {
    title: "Directory",
    count: "{n} supporters in the CDD Pays-Bas network.",
    searchLabel: "Search",
    searchPlaceholder: "Name, company, role…",
    commission: "Commission",
    allCommissions: "All commissions",
    noMatchTitle: "No match",
    noMatch: "No supporter matches this search. Try a different name, or clear the filters to see everyone.",
    clearFilters: "Clear the filters",
  },
  profile: {
    back: "Directory",
    message: "Send a message",
    edit: "Edit",
    about: "About",
    emailMissing: "No address on file",
    linkedin: "LinkedIn",
    website: "Website",
  },
  profileEdit: {
    title: "My profile",
    subtitle: "Visible to other supporters in the directory.",
    photo: "Photo (URL)",
    name: "Full name",
    position: "Role",
    company: "Organisation",
    bio: "About",
    phone: "Telephone",
    linkedin: "LinkedIn",
    website: "Website",
    commission: "Commission",
    noCommission: "— None —",
    save: "Save",
    saving: "Saving…",
    saved: "Saved.",
  },
  messages: {
    title: "Messages",
    subtitle: "Your private conversations with supporters.",
    writeSomeone: "Write to someone",
    emptyTitle: "No conversations yet",
    empty: "Messages here are private, between you and one other supporter. Find someone in the directory to write the first one.",
    browse: "Browse the directory",
    you: "You: ",
    unread: "{n} unread messages",
    placeholder: "Write to {name}…",
    noMessages: "No messages. Write the first one.",
    back: "Back to messages",
    messageLabel: "Message to {name}",
  },
  events: {
    title: "Events",
    subtitle: "Gatherings of the CDD Pays-Bas network.",
    upcoming: "Upcoming",
    past: "Past gatherings",
    emptyTitle: "No events yet",
    empty: "Roundtables, delegations and gatherings of the network appear here as soon as the board publishes them.",
    register: "Register",
  },
  pending: {
    title: "Your access is being reviewed",
    body: "A board member reviews every request. We will contact you shortly to confirm your access.",
  },
  errors: {
    invalid: "Invalid data.",
    emptyPost: "Your post is empty.",
    postTooLong: "A post is limited to 5000 characters.",
    emptyComment: "Your comment is empty.",
    commentTooLong: "A comment is limited to 2000 characters.",
    emptyMessage: "Your message is empty.",
    messageTooLong: "A message is limited to 5000 characters.",
    badLink: "Invalid link.",
    linkScheme: "The link must start with http:// or https://",
    postGone: "This post is no longer available.",
    alreadyShared: "You have already shared this post.",
    ownPost: "This is already your post.",
    cannotWriteSelf: "You cannot write to yourself.",
    cannotReceive: "This supporter cannot receive messages.",
    nameRequired: "A name is required.",
    badAddress: "Invalid address.",
  },
};

const nl: Dictionary = {
  common: {
    changeLanguage: "Taal wijzigen",
    back: "Terug",
    cancel: "Annuleren",
    send: "Versturen",
    search: "Zoeken",
    filter: "Filteren",
    none: "Geen",
  },
  nav: {
    home: "Start",
    feed: "Tijdlijn",
    messages: "Berichten",
    events: "Evenementen",
    directory: "Ledenlijst",
    profile: "Mijn profiel",
    admin: "Beheer",
    signOut: "Uitloggen",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    portalLabel: "CDD Pays-Bas portaal",
    unreadLabel: "{n} ongelezen berichten",
  },
  login: {
    title: "Supportersomgeving",
    subtitle: "CDD Pays-Bas — besloten netwerk",
    email: "E-mail",
    password: "Wachtwoord",
    signIn: "Inloggen",
    signingIn: "Bezig met inloggen…",
    invalid: "Ongeldige inloggegevens.",
    suspended: "Uw toegang is opgeschort. Neem contact op met het secretariaat.",
    inactive: "Dit account is gedeactiveerd. Neem contact op met het secretariaat.",
    failed:
      "Inloggen is mislukt. Probeer het opnieuw of neem contact op met het secretariaat.",
    noAccess:
      "Nog geen toegang? Inloggegevens worden door het secretariaat verstrekt na bevestiging van uw supporterschap.",
  },
  home: {
    greeting: "Hallo {name}",
    subtitle: "Het besloten netwerk van supporters van CDD Pays-Bas.",
    feedTitle: "Tijdlijn",
    feedBody: "Plaats berichten en reageer op nieuws uit het netwerk.",
    messagesTitle: "Berichten",
    messagesBody: "Stuur privéberichten aan andere supporters.",
    eventsTitle: "Evenementen",
    eventsBody: "Bijeenkomsten van het netwerk, geweest en gepland.",
    directoryTitle: "Ledenlijst",
    directoryBody: "Vind supporters op naam of commissie.",
    latest: "Nieuwste supporters ({n})",
    seeAll: "Alles bekijken",
    noneYet: "Nog geen actieve supporters.",
  },
  feed: {
    title: "Tijdlijn",
    subtitle: "Berichten van supporters van CDD Pays-Bas.",
    placeholder: "Deel iets, {name}…",
    linkLabel: "Link of media (optioneel)",
    linkPlaceholder: "https://…",
    publish: "Plaatsen",
    publishing: "Bezig met plaatsen…",
    emptyTitle: "De tijdlijn begint hier",
    empty: "Hier delen supporters nieuws, successen en waar zij aan werken. Er is nog niets geplaatst — het venster hierboven wacht op het eerste bericht.",
    loadMore: "Meer laden",
    end: "Geen berichten meer.",
    like: "Vind ik leuk",
    comments: "{n} reacties",
    share: "Delen",
    sharePlaceholder: "Voeg een opmerking toe (optioneel)…",
    shareSubmit: "Delen",
    shareCancel: "Annuleren",
    shareRemarkLabel: "Opmerking bij uw deelbericht",
    deletedSource: "Het gedeelde bericht is verwijderd.",
    commentPlaceholder: "Schrijf een reactie…",
    commentLabel: "Uw reactie",
    delete: "Verwijderen",
    hide: "Verbergen",
    deleteComment: "Deze reactie verwijderen",
  },
  directory: {
    title: "Ledenlijst",
    count: "{n} supporters in het netwerk van CDD Pays-Bas.",
    searchLabel: "Zoeken",
    searchPlaceholder: "Naam, organisatie, functie…",
    commission: "Commissie",
    allCommissions: "Alle commissies",
    noMatchTitle: "Geen resultaat",
    noMatch: "Geen supporter komt overeen met deze zoekopdracht. Probeer een andere naam of wis de filters om iedereen te zien.",
    clearFilters: "Filters wissen",
  },
  profile: {
    back: "Ledenlijst",
    message: "Bericht sturen",
    edit: "Bewerken",
    about: "Over",
    emailMissing: "Geen adres bekend",
    linkedin: "LinkedIn",
    website: "Website",
  },
  profileEdit: {
    title: "Mijn profiel",
    subtitle: "Zichtbaar voor andere supporters in de ledenlijst.",
    photo: "Foto (URL)",
    name: "Volledige naam",
    position: "Functie",
    company: "Organisatie",
    bio: "Over",
    phone: "Telefoon",
    linkedin: "LinkedIn",
    website: "Website",
    commission: "Commissie",
    noCommission: "— Geen —",
    save: "Opslaan",
    saving: "Bezig met opslaan…",
    saved: "Opgeslagen.",
  },
  messages: {
    title: "Berichten",
    subtitle: "Uw privégesprekken met supporters.",
    writeSomeone: "Iemand schrijven",
    emptyTitle: "Nog geen gesprekken",
    empty: "Berichten hier zijn privé, tussen u en één andere supporter. Zoek iemand in de ledenlijst om het eerste bericht te schrijven.",
    browse: "Ledenlijst bekijken",
    you: "U: ",
    unread: "{n} ongelezen berichten",
    placeholder: "Schrijf aan {name}…",
    noMessages: "Nog geen berichten. Schrijf het eerste.",
    back: "Terug naar berichten",
    messageLabel: "Bericht aan {name}",
  },
  events: {
    title: "Evenementen",
    subtitle: "Bijeenkomsten van het netwerk van CDD Pays-Bas.",
    upcoming: "Binnenkort",
    past: "Eerdere bijeenkomsten",
    emptyTitle: "Nog geen evenementen",
    empty: "Rondetafels, missies en bijeenkomsten van het netwerk verschijnen hier zodra het bestuur ze publiceert.",
    register: "Aanmelden",
  },
  pending: {
    title: "Uw toegang wordt beoordeeld",
    body: "Een bestuurslid beoordeelt elke aanvraag. Wij nemen binnenkort contact met u op om uw toegang te bevestigen.",
  },
  errors: {
    invalid: "Ongeldige gegevens.",
    emptyPost: "Uw bericht is leeg.",
    postTooLong: "Een bericht mag maximaal 5000 tekens bevatten.",
    emptyComment: "Uw reactie is leeg.",
    commentTooLong: "Een reactie mag maximaal 2000 tekens bevatten.",
    emptyMessage: "Uw bericht is leeg.",
    messageTooLong: "Een bericht mag maximaal 5000 tekens bevatten.",
    badLink: "Ongeldige link.",
    linkScheme: "De link moet beginnen met http:// of https://",
    postGone: "Dit bericht is niet meer beschikbaar.",
    alreadyShared: "U heeft dit bericht al gedeeld.",
    ownPost: "Dit is al uw eigen bericht.",
    cannotWriteSelf: "U kunt uzelf geen bericht sturen.",
    cannotReceive: "Deze supporter kan geen berichten ontvangen.",
    nameRequired: "Een naam is verplicht.",
    badAddress: "Ongeldig adres.",
  },
};

const fr: Dictionary = {
  common: {
    changeLanguage: "Changer de langue",
    back: "Retour",
    cancel: "Annuler",
    send: "Envoyer",
    search: "Rechercher",
    filter: "Filtrer",
    none: "Aucune",
  },
  nav: {
    home: "Accueil",
    feed: "Fil d'actualité",
    messages: "Messages",
    events: "Événements",
    directory: "Annuaire",
    profile: "Mon profil",
    admin: "Administration",
    signOut: "Déconnexion",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    portalLabel: "Portail CDD Pays-Bas",
    unreadLabel: "{n} messages non lus",
  },
  login: {
    title: "Espace supporters",
    subtitle: "CDD Pays-Bas — réseau privé",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion…",
    invalid: "Identifiants invalides.",
    suspended: "Votre accès a été suspendu. Contactez le secrétariat.",
    inactive: "Ce compte est désactivé. Contactez le secrétariat.",
    failed:
      "La connexion a échoué. Réessayez, ou contactez le secrétariat si le problème persiste.",
    noAccess:
      "Pas encore d'accès ? Les identifiants sont délivrés par le secrétariat après validation de votre supporterschap.",
  },
  home: {
    greeting: "Bonjour {name}",
    subtitle: "Le réseau privé des supporters de CDD Pays-Bas.",
    feedTitle: "Fil d'actualité",
    feedBody: "Publiez et réagissez aux actualités du réseau.",
    messagesTitle: "Messages",
    messagesBody: "Échangez en privé avec les autres supporters.",
    eventsTitle: "Événements",
    eventsBody: "Les rencontres passées et à venir du réseau.",
    directoryTitle: "Annuaire",
    directoryBody: "Retrouvez les supporters par nom ou commission.",
    latest: "Derniers supporters ({n})",
    seeAll: "Tout voir",
    noneYet: "Aucun supporter actif pour le moment.",
  },
  feed: {
    title: "Fil d'actualité",
    subtitle: "Les publications des supporters de CDD Pays-Bas.",
    placeholder: "Partagez une actualité, {name}…",
    linkLabel: "Lien ou média (facultatif)",
    linkPlaceholder: "https://…",
    publish: "Publier",
    publishing: "Publication…",
    emptyTitle: "Le fil commence ici",
    empty: "C'est ici que les supporters partagent leurs actualités, leurs réussites et leurs travaux en cours. Rien n'a encore été publié — la zone ci-dessus attend la première publication.",
    loadMore: "Charger plus",
    end: "Fin des publications affichables.",
    like: "J'aime",
    comments: "{n} commentaires",
    share: "Partager",
    sharePlaceholder: "Ajouter un mot (facultatif)…",
    shareSubmit: "Partager",
    shareCancel: "Annuler",
    shareRemarkLabel: "Ajouter un commentaire au partage",
    deletedSource: "La publication partagée a été supprimée.",
    commentPlaceholder: "Écrire un commentaire…",
    commentLabel: "Votre commentaire",
    delete: "Supprimer",
    hide: "Masquer",
    deleteComment: "Supprimer ce commentaire",
  },
  directory: {
    title: "Annuaire",
    count: "{n} supporters du réseau CDD Pays-Bas.",
    searchLabel: "Rechercher",
    searchPlaceholder: "Nom, entreprise, fonction…",
    commission: "Commission",
    allCommissions: "Toutes les commissions",
    noMatchTitle: "Aucun résultat",
    noMatch: "Aucun supporter ne correspond à cette recherche. Essayez un autre nom, ou effacez les filtres pour voir tout le monde.",
    clearFilters: "Effacer les filtres",
  },
  profile: {
    back: "Annuaire",
    message: "Envoyer un message",
    edit: "Modifier",
    about: "À propos",
    emailMissing: "Adresse non renseignée",
    linkedin: "LinkedIn",
    website: "Site web",
  },
  profileEdit: {
    title: "Mon profil",
    subtitle: "Visible par les autres supporters dans l'annuaire.",
    photo: "Photo (URL)",
    name: "Nom complet",
    position: "Fonction",
    company: "Organisation",
    bio: "À propos",
    phone: "Téléphone",
    linkedin: "LinkedIn",
    website: "Site web",
    commission: "Commission",
    noCommission: "— Aucune —",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Enregistré.",
  },
  messages: {
    title: "Messages",
    subtitle: "Vos échanges privés avec les supporters.",
    writeSomeone: "Écrire à quelqu'un",
    emptyTitle: "Aucune conversation",
    empty: "Les messages sont privés, entre vous et un autre supporter. Trouvez quelqu'un dans l'annuaire pour écrire le premier.",
    browse: "Parcourir l'annuaire",
    you: "Vous : ",
    unread: "{n} messages non lus",
    placeholder: "Écrire à {name}…",
    noMessages: "Aucun message. Écrivez le premier.",
    back: "Retour aux messages",
    messageLabel: "Message à {name}",
  },
  events: {
    title: "Événements",
    subtitle: "Les rencontres du réseau CDD Pays-Bas.",
    upcoming: "À venir",
    past: "Rencontres passées",
    emptyTitle: "Aucun événement",
    empty: "Les rencontres, missions et rendez-vous du réseau apparaissent ici dès que le bureau les publie.",
    register: "S'inscrire",
  },
  pending: {
    title: "Votre accès est en cours de validation",
    body: "Un membre du bureau examine chaque demande. Nous vous contacterons prochainement pour confirmer votre accès.",
  },
  errors: {
    invalid: "Données invalides.",
    emptyPost: "Votre publication est vide.",
    postTooLong: "Une publication est limitée à 5000 caractères.",
    emptyComment: "Votre commentaire est vide.",
    commentTooLong: "Un commentaire est limité à 2000 caractères.",
    emptyMessage: "Votre message est vide.",
    messageTooLong: "Un message est limité à 5000 caractères.",
    badLink: "Lien invalide.",
    linkScheme: "Le lien doit commencer par http:// ou https://",
    postGone: "Cette publication n'est plus disponible.",
    alreadyShared: "Vous avez déjà partagé cette publication.",
    ownPost: "C'est déjà votre publication.",
    cannotWriteSelf: "Vous ne pouvez pas vous écrire à vous-même.",
    cannotReceive: "Ce supporter ne peut pas recevoir de messages.",
    nameRequired: "Le nom est requis.",
    badAddress: "Adresse invalide.",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, nl, fr };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Fill `{n}` / `{name}` in a dictionary string.
 *
 * The dictionary holds plain strings, not functions, for a reason that only
 * shows up at runtime: a server component passing `t` to a client one has to
 * serialise it, and React refuses to serialise functions. Interpolation
 * therefore happens at the call site, and the whole dictionary crosses the
 * boundary as data.
 */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key) =>
    key in vars ? String(vars[key]) : all
  );
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
