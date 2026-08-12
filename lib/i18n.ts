export type Locale = "hr" | "en";

export const LOCALES: Locale[] = ["hr", "en"];
export const DEFAULT_LOCALE: Locale = "hr";

type Dict = Record<string, string>;

export const dictionaries: Record<Locale, Dict> = {
  hr: {
    "common.appName": "Prijave na radionice",
    "common.loading": "Učitavanje…",
    "common.error": "Nešto nije u redu. Pokušaj ponovno.",
    "common.save": "Spremi",
    "common.cancel": "Odustani",
    "common.back": "Natrag",

    "nav.program": "Program",
    "nav.mySchedule": "Moje prijave",
    "nav.logout": "Odjava",
    "nav.admin": "Organizator",

    "login.title": "Prijava na radionice",
    "login.subtitle":
      "Unesi email s kojim si platio/la kotizaciju. Poslat ćemo ti poveznicu za pristup — bez lozinke.",
    "login.emailLabel": "Email",
    "login.emailPlaceholder": "ime.prezime@email.com",
    "login.submit": "Pošalji poveznicu",
    "login.submitting": "Šaljem…",
    "login.sent.title": "Provjeri poštu",
    "login.sent.body":
      "Poslali smo poveznicu za pristup na {email}. Otvori je i nastavit ćeš izravno na prijave.",
    "login.sent.resend": "Nisi dobio/la email? Zatraži ponovno",
    "login.notApproved.title": "Kotizacija još nije evidentirana",
    "login.notApproved.body":
      "Ovaj email nema evidentiranu plaćenu kotizaciju. Javi se organizatoru ili pričekaj potvrdu uplate pa pokušaj ponovno.",

    "verify.invalid.title": "Poveznica nije valjana",
    "verify.invalid.body":
      "Ova poveznica je istekla ili je već iskorištena. Zatraži novu poveznicu za pristup.",
    "verify.requestNew": "Zatraži novu poveznicu",

    "program.title": "Program",
    "program.subtitle":
      "Odaberi radionicu po bloku. U jednom bloku možeš biti prijavljen/a samo na jednu opciju.",
    "program.noDays": "Program još nije objavljen.",
    "program.yourPick": "Tvoj odabir u ovom bloku",
    "program.mainHall": "Glavna dvorana",

    "status.available": "Slobodno",
    "status.almostFull": "Skoro puno",
    "status.full": "Puno",
    "status.registered": "Prijavljeno",
    "status.waitlisted": "Na listi čekanja",

    "session.seatsLeft": "{taken}/{capacity} zauzeto",
    "session.speaker": "Predavač/ica",
    "session.room": "Dvorana",
    "session.register": "Prijavi se",
    "session.registering": "Prijavljujem…",
    "session.cancel": "Odjavi se s radionice",
    "session.cancelling": "Odjavljujem…",
    "session.joinWaitlist": "Pridruži se listi čekanja",
    "session.leaveWaitlist": "Napusti listu čekanja",
    "session.waitlistPosition": "Na listi čekanja · {position}. mjesto",
    "session.blockConflict":
      "Već si prijavljen/a na drugu sesiju u ovom bloku ({title}). Prvo se odjavi s nje.",
    "session.fullJoinWaitlist":
      "Radionica je puna. Možeš se pridružiti listi čekanja — javit ćemo ti se ako se mjesto oslobodi.",
    "session.moreDetails": "Više o sesiji i predavaču",

    "schedule.title": "Moje prijave",
    "schedule.empty": "Još nisi prijavljen/a ni na jednu radionicu.",
    "schedule.browseProgram": "Pregledaj program",
    "schedule.confirmed": "Potvrđeno",
    "schedule.downloadAll": "Preuzmi cijeli raspored (.ics)",
    "schedule.addIcs": "Dodaj u kalendar",
    "schedule.addGoogle": "Google Calendar",
    "schedule.waitlistCalendarNote": "Dodavanje u kalendar bit će dostupno čim potvrdiš mjesto.",

    "waitlist.emailSubject": "Oslobodilo se mjesto: {title}",
    "waitlist.emailBody":
      "Netko je otkazao prijavu na \"{title}\". Ti si sljedeći/a na listi čekanja. Imaš {minutes} minuta da potvrdiš mjesto, inače ide sljedećoj osobi.",
    "waitlist.emailConfirmButton": "Potvrdi prijavu",
    "waitlist.confirm.title": "Potvrdi svoje mjesto",
    "waitlist.confirm.expired.title": "Rok je istekao",
    "waitlist.confirm.expired.body":
      "Rok za potvrdu ovog mjesta je istekao pa je ponuđeno sljedećoj osobi na listi. Možeš se ponovno pridružiti listi čekanja.",
    "waitlist.confirm.button": "Potvrdi mjesto",
    "waitlist.confirm.success": "Mjesto je potvrđeno — vidimo se na radionici.",

    "magicLink.emailSubject": "Tvoja poveznica za prijavu na radionice",
    "magicLink.emailBody":
      "Klikni na poveznicu za pristup prijavama na radionice. Poveznica vrijedi 30 minuta.",
    "magicLink.emailButton": "Otvori prijave",

    "footer.language": "Jezik",
  },
  en: {
    "common.appName": "Workshop sign-up",
    "common.loading": "Loading…",
    "common.error": "Something went wrong. Please try again.",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",

    "nav.program": "Program",
    "nav.mySchedule": "My schedule",
    "nav.logout": "Sign out",
    "nav.admin": "Organizer",

    "login.title": "Sign in to register",
    "login.subtitle":
      "Enter the email you used to pay your conference ticket. We'll send you a sign-in link — no password needed.",
    "login.emailLabel": "Email",
    "login.emailPlaceholder": "name.surname@email.com",
    "login.submit": "Send link",
    "login.submitting": "Sending…",
    "login.sent.title": "Check your inbox",
    "login.sent.body":
      "We've sent a sign-in link to {email}. Open it to continue straight to registration.",
    "login.sent.resend": "Didn't get it? Request again",
    "login.notApproved.title": "Ticket not found yet",
    "login.notApproved.body":
      "This email isn't on the paid-ticket list yet. Contact the organizer, or wait for your payment to be confirmed and try again.",

    "verify.invalid.title": "This link isn't valid",
    "verify.invalid.body":
      "This link has expired or was already used. Request a new sign-in link.",
    "verify.requestNew": "Request a new link",

    "program.title": "Program",
    "program.subtitle":
      "Pick one option per block. You can only hold one registration per time slot.",
    "program.noDays": "The program hasn't been published yet.",
    "program.yourPick": "Your pick for this block",
    "program.mainHall": "Main hall",

    "status.available": "Open",
    "status.almostFull": "Almost full",
    "status.full": "Full",
    "status.registered": "Registered",
    "status.waitlisted": "Waitlisted",

    "session.seatsLeft": "{taken}/{capacity} taken",
    "session.speaker": "Speaker",
    "session.room": "Room",
    "session.register": "Register",
    "session.registering": "Registering…",
    "session.cancel": "Cancel registration",
    "session.cancelling": "Cancelling…",
    "session.joinWaitlist": "Join the waitlist",
    "session.leaveWaitlist": "Leave the waitlist",
    "session.waitlistPosition": "Waitlisted · position {position}",
    "session.blockConflict":
      "You're already registered for another session in this block ({title}). Cancel it first.",
    "session.fullJoinWaitlist":
      "This workshop is full. You can join the waitlist — we'll email you if a seat frees up.",
    "session.moreDetails": "More about this session & speaker",

    "schedule.title": "My schedule",
    "schedule.empty": "You haven't registered for any workshop yet.",
    "schedule.browseProgram": "Browse the program",
    "schedule.confirmed": "Confirmed",
    "schedule.downloadAll": "Download full schedule (.ics)",
    "schedule.addIcs": "Add to calendar",
    "schedule.addGoogle": "Google Calendar",
    "schedule.waitlistCalendarNote": "Adding to your calendar will be available once your seat is confirmed.",

    "waitlist.emailSubject": "A seat opened up: {title}",
    "waitlist.emailBody":
      "Someone cancelled their spot in \"{title}\". You're next on the waitlist. You have {minutes} minutes to claim the seat, otherwise it moves to the next person.",
    "waitlist.emailConfirmButton": "Confirm my seat",
    "waitlist.confirm.title": "Confirm your seat",
    "waitlist.confirm.expired.title": "The window has closed",
    "waitlist.confirm.expired.body":
      "The confirmation window for this seat has expired, so it was offered to the next person. You can rejoin the waitlist.",
    "waitlist.confirm.button": "Confirm seat",
    "waitlist.confirm.success": "Seat confirmed — see you at the workshop.",

    "magicLink.emailSubject": "Your workshop sign-in link",
    "magicLink.emailBody":
      "Click the link below to sign in to workshop registration. It's valid for 30 minutes.",
    "magicLink.emailButton": "Open registration",

    "footer.language": "Language",
  },
};

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    raw
  );
}
