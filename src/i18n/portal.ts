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
    /** Singular form of `unreadLabel`, used when n is 1 (and 0 in French). */
    unreadLabelOne: string;
    network: string;
    pendingLabel: string;
    pendingLabelOne: string;
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
    /** Singular form of `comments`, used when n is 1 (and 0 in French). */
    commentsOne: string;
    /** `{n}` */
    seeAllComments: string;
    confirmDelete: string;
    confirmDeleteComment: string;
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
    emptyReader: string;
  };
  directory: {
    title: string;
    /** `{n}` */
    count: string;
    /** Singular form of `count`, used when n is 1 (and 0 in French). */
    countOne: string;
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
    phoneHint: string;
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
    /** Singular form of `unread`, used when n is 1 (and 0 in French). */
    unreadOne: string;
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
  password: {
    title: string;
    subtitle: string;
    current: string;
    new: string;
    confirm: string;
    hint: string;
    submit: string;
    saving: string;
    success: string;
    wrongCurrent: string;
    tooShort: string;
    mismatch: string;
    sameAsOld: string;
    noPassword: string;
    required: string;
  };
  /** The locale this dictionary is for, so helpers given only `t` can format dates. */
  locale: Locale;
  time: {
    justNow: string;
    /** `{n}` */
    minutesAgo: string;
    /** `{n}` */
    hoursAgo: string;
    /** `{n}` */
    daysAgo: string;
  };
  /** Commission names, keyed by slug. Same wording as the public site. */
  commissions: Record<string, string>;
  notFound: {
    title: string;
    body: string;
    back: string;
  };
  network: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    empty: string;
    connect: string;
    connected: string;
    requestSent: string;
    withdraw: string;
    confirmWithdraw: string;
    wantsToConnect: string;
    accept: string;
    decline: string;
    remove: string;
    confirmRemove: string;
    requests: string;
    connections: string;
    sent: string;
    connectToMessage: string;
    viewProfile: string;
    requestMeeting: string;
    meetingWith: string;
    when: string;
    localTimeHint: string;
    duration: string;
    note: string;
    notePlaceholder: string;
    sendMeetingRequest: string;
    sending: string;
    meetingRequested: string;
    meetingRequests: string;
    meetingProposed: string;
    upcoming: string;
    amsterdamTime: string;
    join: string;
    cancelMeeting: string;
    confirmCancelMeeting: string;
    meetLink: string;
    createMeetLink: string;
    meetLinkHint: string;
    confirmAccept: string;
    acceptedMessage: string;
  };
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
    cannotPublish: string;
    notConnected: string;
    meetingPast: string;
    meetingInvalid: string;
    meetingTooMany: string;
    meetUrl: string;
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
    unreadLabelOne: "{n} unread message",
    network: "Network",
    pendingLabel: "{n} requests waiting for your answer",
    pendingLabelOne: "{n} request waiting for your answer",
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
    feedBody: "Read news from the board, like and comment.",
    messagesTitle: "Messages",
    messagesBody: "Write privately to your connections.",
    eventsTitle: "Events",
    eventsBody: "Past and upcoming gatherings of the network.",
    directoryTitle: "Directory",
    directoryBody: "Find supporters and connect with them.",
    latest: "Latest supporters ({n})",
    seeAll: "See all",
    noneYet: "No active supporters yet.",
  },
  feed: {
    title: "Feed",
    subtitle: "News from the CDD Pays-Bas board. Like and comment to join the conversation.",
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
    commentsOne: "{n} comment",
    seeAllComments: "See all {n} comments",
    confirmDelete: "Delete this post? This cannot be undone.",
    confirmDeleteComment: "Delete this comment?",
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
    emptyReader: "News from the CDD Pays-Bas board will appear here. You will be able to like and comment on every post.",
  },
  directory: {
    title: "Directory",
    count: "{n} supporters in the CDD Pays-Bas network.",
    countOne: "{n} supporter in the CDD Pays-Bas network.",
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
    phoneHint: "Only visible to signed-in supporters.",
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
    empty: "Messages are private, between you and one connection. Connect with a supporter from the directory; once they accept, you can write to them.",
    browse: "Browse the directory",
    you: "You: ",
    unread: "{n} unread messages",
    unreadOne: "{n} unread message",
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
  password: {
    title: "Change password",
    subtitle: "Choose a new password for signing in. You will stay signed in on this device.",
    current: "Current password",
    new: "New password",
    confirm: "Confirm new password",
    hint: "At least 10 characters.",
    submit: "Update password",
    saving: "Updating…",
    success: "Your password has been updated.",
    wrongCurrent: "The current password is incorrect.",
    tooShort: "The new password must be at least 10 characters.",
    mismatch: "The two new passwords do not match.",
    sameAsOld: "The new password must be different from the current one.",
    noPassword: "This account has no password yet. Please contact the secretariat to activate your login.",
    required: "Please fill in all three fields.",
  },
  locale: "en",
  time: {
    justNow: "just now",
    minutesAgo: "{n} min ago",
    hoursAgo: "{n} h ago",
    daysAgo: "{n} d ago",
  },
  commissions: {
    "energy-water-transition": "Energy & Water Transition",
    "digital-ai-infrastructure": "Digital, AI & Infrastructure",
    "industry-trade-logistics": "Industry, Trade & Logistics",
    "talent-knowledge-society": "Talent, Knowledge & Society",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has been moved.",
    back: "Back to home",
  },
  network: {
    title: "My network",
    subtitle: "Your connections, requests and video meetings.",
    emptyTitle: "Build your network",
    empty: "Connect with other supporters from the directory. Once they accept, you can message them and request a video meeting.",
    connect: "Connect",
    connected: "Connected",
    requestSent: "Request sent",
    withdraw: "Withdraw",
    confirmWithdraw: "Withdraw this request?",
    wantsToConnect: "Wants to connect with you",
    accept: "Accept",
    decline: "Decline",
    remove: "Remove connection",
    confirmRemove: "Remove {name} from your connections? You will no longer be able to message each other.",
    requests: "Connection requests",
    connections: "Connections",
    sent: "Sent",
    connectToMessage: "You can write to {name} once they have accepted your connection request.",
    viewProfile: "View profile",
    requestMeeting: "Request a meeting",
    meetingWith: "Video meeting with {name} (Google Meet)",
    when: "Date and time",
    localTimeHint: "In your own time zone.",
    duration: "Duration",
    note: "Message (optional)",
    notePlaceholder: "What would you like to discuss?",
    sendMeetingRequest: "Send request",
    sending: "Sending…",
    meetingRequested: "Your request has been sent to {name}.",
    meetingRequests: "Meeting requests",
    meetingProposed: "Meeting proposed",
    upcoming: "Upcoming meetings",
    amsterdamTime: "Amsterdam time",
    join: "Join Google Meet",
    cancelMeeting: "Cancel meeting",
    confirmCancelMeeting: "Cancel this meeting?",
    meetLink: "Google Meet link",
    createMeetLink: "Create a Meet link",
    meetLinkHint: "Click “Create a Meet link”, copy the address of the new meeting and paste it here. It will be shared with the other person.",
    confirmAccept: "Accept and share link",
    acceptedMessage: "I have accepted your meeting request for {when} (Amsterdam time). Google Meet: {url}",
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
    cannotPublish: "Only the board can publish in the feed. You can like and comment on posts.",
    notConnected: "You can only contact supporters you are connected with.",
    meetingPast: "Please choose a time at least 15 minutes from now.",
    meetingInvalid: "Please choose a valid date, time and duration.",
    meetingTooMany: "You already have three open requests with this person.",
    meetUrl: "Please paste a Google Meet link, like https://meet.google.com/abc-defg-hij",
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
    unreadLabelOne: "{n} ongelezen bericht",
    network: "Netwerk",
    pendingLabel: "{n} verzoeken wachten op uw antwoord",
    pendingLabelOne: "{n} verzoek wacht op uw antwoord",
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
    feedBody: "Lees nieuws van het bestuur, reageer en praat mee.",
    messagesTitle: "Berichten",
    messagesBody: "Schrijf privé aan uw connecties.",
    eventsTitle: "Evenementen",
    eventsBody: "Bijeenkomsten van het netwerk, geweest en gepland.",
    directoryTitle: "Ledenlijst",
    directoryBody: "Vind supporters en maak connectie.",
    latest: "Nieuwste supporters ({n})",
    seeAll: "Alles bekijken",
    noneYet: "Nog geen actieve supporters.",
  },
  feed: {
    title: "Tijdlijn",
    subtitle: "Nieuws van het bestuur van CDD Pays-Bas. Reageer en praat mee.",
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
    commentsOne: "{n} reactie",
    seeAllComments: "Alle {n} reacties bekijken",
    confirmDelete: "Dit bericht verwijderen? Dit kan niet ongedaan worden gemaakt.",
    confirmDeleteComment: "Deze reactie verwijderen?",
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
    emptyReader: "Nieuws van het bestuur van CDD Pays-Bas verschijnt hier. U kunt elk bericht leuk vinden en erop reageren.",
  },
  directory: {
    title: "Ledenlijst",
    count: "{n} supporters in het netwerk van CDD Pays-Bas.",
    countOne: "{n} supporter in het netwerk van CDD Pays-Bas.",
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
    phoneHint: "Alleen zichtbaar voor ingelogde supporters.",
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
    empty: "Berichten zijn privé, tussen u en één connectie. Maak connectie met een supporter via de ledenlijst; zodra die accepteert, kunt u schrijven.",
    browse: "Ledenlijst bekijken",
    you: "U: ",
    unread: "{n} ongelezen berichten",
    unreadOne: "{n} ongelezen bericht",
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
  password: {
    title: "Wachtwoord wijzigen",
    subtitle: "Kies een nieuw wachtwoord om in te loggen. U blijft op dit apparaat ingelogd.",
    current: "Huidig wachtwoord",
    new: "Nieuw wachtwoord",
    confirm: "Bevestig nieuw wachtwoord",
    hint: "Minstens 10 tekens.",
    submit: "Wachtwoord bijwerken",
    saving: "Bezig…",
    success: "Uw wachtwoord is bijgewerkt.",
    wrongCurrent: "Het huidige wachtwoord is onjuist.",
    tooShort: "Het nieuwe wachtwoord moet minstens 10 tekens bevatten.",
    mismatch: "De twee nieuwe wachtwoorden komen niet overeen.",
    sameAsOld: "Het nieuwe wachtwoord moet verschillen van het huidige.",
    noPassword: "Dit account heeft nog geen wachtwoord. Neem contact op met het secretariaat om uw login te activeren.",
    required: "Vul alle drie de velden in.",
  },
  locale: "nl",
  time: {
    justNow: "zojuist",
    minutesAgo: "{n} min geleden",
    hoursAgo: "{n} u geleden",
    daysAgo: "{n} d geleden",
  },
  commissions: {
    "energy-water-transition": "Energie- & watertransitie",
    "digital-ai-infrastructure": "Digitaal, AI & infrastructuur",
    "industry-trade-logistics": "Industrie, handel & logistiek",
    "talent-knowledge-society": "Talent, kennis & samenleving",
  },
  notFound: {
    title: "Pagina niet gevonden",
    body: "De pagina die u zoekt bestaat niet of is verplaatst.",
    back: "Terug naar home",
  },
  network: {
    title: "Mijn netwerk",
    subtitle: "Uw connecties, verzoeken en videogesprekken.",
    emptyTitle: "Bouw uw netwerk op",
    empty: "Maak contact met andere supporters via de ledenlijst. Zodra zij accepteren, kunt u hen berichten sturen en een videogesprek aanvragen.",
    connect: "Connectie maken",
    connected: "Verbonden",
    requestSent: "Verzoek verstuurd",
    withdraw: "Intrekken",
    confirmWithdraw: "Dit verzoek intrekken?",
    wantsToConnect: "Wil met u connecteren",
    accept: "Accepteren",
    decline: "Weigeren",
    remove: "Connectie verwijderen",
    confirmRemove: "{name} uit uw connecties verwijderen? U kunt elkaar dan geen berichten meer sturen.",
    requests: "Connectieverzoeken",
    connections: "Connecties",
    sent: "Verstuurd",
    connectToMessage: "U kunt {name} schrijven zodra uw connectieverzoek is geaccepteerd.",
    viewProfile: "Profiel bekijken",
    requestMeeting: "Gesprek aanvragen",
    meetingWith: "Videogesprek met {name} (Google Meet)",
    when: "Datum en tijd",
    localTimeHint: "In uw eigen tijdzone.",
    duration: "Duur",
    note: "Bericht (optioneel)",
    notePlaceholder: "Waarover wilt u spreken?",
    sendMeetingRequest: "Verzoek versturen",
    sending: "Bezig…",
    meetingRequested: "Uw verzoek is naar {name} verstuurd.",
    meetingRequests: "Gespreksverzoeken",
    meetingProposed: "Gesprek voorgesteld",
    upcoming: "Geplande gesprekken",
    amsterdamTime: "Nederlandse tijd",
    join: "Deelnemen via Google Meet",
    cancelMeeting: "Gesprek annuleren",
    confirmCancelMeeting: "Dit gesprek annuleren?",
    meetLink: "Google Meet-link",
    createMeetLink: "Meet-link aanmaken",
    meetLinkHint: "Klik op “Meet-link aanmaken”, kopieer het adres van het nieuwe gesprek en plak het hier. Het wordt met de ander gedeeld.",
    confirmAccept: "Accepteren en link delen",
    acceptedMessage: "Ik heb uw gespreksverzoek voor {when} (Nederlandse tijd) geaccepteerd. Google Meet: {url}",
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
    cannotPublish: "Alleen het bestuur kan in de tijdlijn publiceren. U kunt berichten wel leuk vinden en erop reageren.",
    notConnected: "U kunt alleen contact opnemen met supporters met wie u verbonden bent.",
    meetingPast: "Kies een tijdstip minstens 15 minuten vanaf nu.",
    meetingInvalid: "Kies een geldige datum, tijd en duur.",
    meetingTooMany: "U heeft al drie openstaande verzoeken bij deze persoon.",
    meetUrl: "Plak een Google Meet-link, zoals https://meet.google.com/abc-defg-hij",
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
    unreadLabelOne: "{n} message non lu",
    network: "Réseau",
    pendingLabel: "{n} demandes en attente de votre réponse",
    pendingLabelOne: "{n} demande en attente de votre réponse",
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
    feedBody: "Lisez les actualités du bureau, aimez et commentez.",
    messagesTitle: "Messages",
    messagesBody: "Écrivez en privé à vos relations.",
    eventsTitle: "Événements",
    eventsBody: "Les rencontres passées et à venir du réseau.",
    directoryTitle: "Annuaire",
    directoryBody: "Trouvez des supporters et connectez-vous.",
    latest: "Derniers supporters ({n})",
    seeAll: "Tout voir",
    noneYet: "Aucun supporter actif pour le moment.",
  },
  feed: {
    title: "Fil d'actualité",
    subtitle: "Les actualités du bureau de CDD Pays-Bas. Aimez et commentez pour participer.",
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
    commentsOne: "{n} commentaire",
    seeAllComments: "Voir les {n} commentaires",
    confirmDelete: "Supprimer cette publication ? Cette action est irréversible.",
    confirmDeleteComment: "Supprimer ce commentaire ?",
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
    emptyReader: "Les actualités du bureau de CDD Pays-Bas apparaîtront ici. Vous pourrez aimer et commenter chaque publication.",
  },
  directory: {
    title: "Annuaire",
    count: "{n} supporters du réseau CDD Pays-Bas.",
    countOne: "{n} supporter du réseau CDD Pays-Bas.",
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
    phoneHint: "Visible uniquement par les supporters connectés.",
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
    empty: "Les messages sont privés, entre vous et une relation. Connectez-vous à un supporter depuis l'annuaire ; une fois la demande acceptée, vous pourrez lui écrire.",
    browse: "Parcourir l'annuaire",
    you: "Vous : ",
    unread: "{n} messages non lus",
    unreadOne: "{n} message non lu",
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
  password: {
    title: "Changer le mot de passe",
    subtitle: "Choisissez un nouveau mot de passe de connexion. Vous resterez connecté sur cet appareil.",
    current: "Mot de passe actuel",
    new: "Nouveau mot de passe",
    confirm: "Confirmer le nouveau mot de passe",
    hint: "Au moins 10 caractères.",
    submit: "Mettre à jour le mot de passe",
    saving: "Mise à jour…",
    success: "Votre mot de passe a été mis à jour.",
    wrongCurrent: "Le mot de passe actuel est incorrect.",
    tooShort: "Le nouveau mot de passe doit contenir au moins 10 caractères.",
    mismatch: "Les deux nouveaux mots de passe ne correspondent pas.",
    sameAsOld: "Le nouveau mot de passe doit être différent de l'actuel.",
    noPassword: "Ce compte n'a pas encore de mot de passe. Contactez le secrétariat pour activer votre accès.",
    required: "Veuillez remplir les trois champs.",
  },
  locale: "fr",
  time: {
    justNow: "à l'instant",
    minutesAgo: "il y a {n} min",
    hoursAgo: "il y a {n} h",
    daysAgo: "il y a {n} j",
  },
  commissions: {
    "energy-water-transition": "Transition énergétique & hydrique",
    "digital-ai-infrastructure": "Numérique, IA & infrastructures",
    "industry-trade-logistics": "Industrie, commerce & logistique",
    "talent-knowledge-society": "Talents, savoir & société",
  },
  notFound: {
    title: "Page introuvable",
    body: "La page que vous recherchez n'existe pas ou a été déplacée.",
    back: "Retour à l'accueil",
  },
  network: {
    title: "Mon réseau",
    subtitle: "Vos relations, demandes et rendez-vous vidéo.",
    emptyTitle: "Construisez votre réseau",
    empty: "Entrez en relation avec d'autres supporters depuis l'annuaire. Une fois votre demande acceptée, vous pourrez leur écrire et proposer un rendez-vous vidéo.",
    connect: "Se connecter",
    connected: "Connecté",
    requestSent: "Demande envoyée",
    withdraw: "Retirer",
    confirmWithdraw: "Retirer cette demande ?",
    wantsToConnect: "Souhaite se connecter avec vous",
    accept: "Accepter",
    decline: "Refuser",
    remove: "Retirer la relation",
    confirmRemove: "Retirer {name} de vos relations ? Vous ne pourrez plus vous écrire.",
    requests: "Demandes de connexion",
    connections: "Relations",
    sent: "Envoyées",
    connectToMessage: "Vous pourrez écrire à {name} une fois votre demande de connexion acceptée.",
    viewProfile: "Voir le profil",
    requestMeeting: "Proposer un rendez-vous",
    meetingWith: "Rendez-vous vidéo avec {name} (Google Meet)",
    when: "Date et heure",
    localTimeHint: "Dans votre fuseau horaire.",
    duration: "Durée",
    note: "Message (facultatif)",
    notePlaceholder: "De quoi souhaitez-vous parler ?",
    sendMeetingRequest: "Envoyer la demande",
    sending: "Envoi…",
    meetingRequested: "Votre demande a été envoyée à {name}.",
    meetingRequests: "Demandes de rendez-vous",
    meetingProposed: "Rendez-vous proposé",
    upcoming: "Rendez-vous à venir",
    amsterdamTime: "heure d'Amsterdam",
    join: "Rejoindre Google Meet",
    cancelMeeting: "Annuler le rendez-vous",
    confirmCancelMeeting: "Annuler ce rendez-vous ?",
    meetLink: "Lien Google Meet",
    createMeetLink: "Créer un lien Meet",
    meetLinkHint: "Cliquez sur « Créer un lien Meet », copiez l'adresse de la nouvelle réunion et collez-la ici. Elle sera partagée avec l'autre personne.",
    confirmAccept: "Accepter et partager le lien",
    acceptedMessage: "J'ai accepté votre demande de rendez-vous du {when} (heure d'Amsterdam). Google Meet : {url}",
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
    cannotPublish: "Seul le bureau peut publier dans le fil. Vous pouvez aimer et commenter les publications.",
    notConnected: "Vous ne pouvez contacter que les supporters avec qui vous êtes connecté.",
    meetingPast: "Choisissez un horaire dans au moins 15 minutes.",
    meetingInvalid: "Choisissez une date, une heure et une durée valides.",
    meetingTooMany: "Vous avez déjà trois demandes en attente avec cette personne.",
    meetUrl: "Collez un lien Google Meet, par exemple https://meet.google.com/abc-defg-hij",
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

/**
 * `{n} …` with the right grammatical number. French treats 0 as singular
 * ("0 commentaire"); English and Dutch use the plural for it.
 */
export function count(t: Dictionary, one: string, other: string, n: number): string {
  const singular = n === 1 || (t.locale === "fr" && n === 0);
  return fmt(singular ? one : other, { n });
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
