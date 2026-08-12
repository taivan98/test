# Prijave na radionice

Web aplikacija za prijavu i odjavu sudionika s paralelnih konferencijskih
radionica, s automatskom listom čekanja ("tko prvi, njegov" s 15-minutnim
rokom za potvrdu). Radi u browseru na mobitelu i desktopu — sudionici ne
instaliraju ništa.

Kratak pregled kako je sve zamišljeno (dani → blokovi → paralelne radionice,
tijek liste čekanja, ekrani) je u planu koji je prethodio ovom kodu.

## Kako funkcionira, ukratko

- **Sudionici** se prijavljuju bez lozinke: unesu email, dobiju poveznicu
  ("magic link"). Samo emailovi s popisa "Odobreni e-mailovi" (oni koji su
  platili kotizaciju) mogu proći dalje — taj popis organizator ručno
  ažurira u `/admin/approved-emails`.
- **Program** je strukturiran kao Dan → Blok (vremenski termin) → Sesija
  (radionica s kapacitetom, ili glavna dvorana bez limita).
- **Lista čekanja**: kad je radionica puna, sudionik se pridruži listi. Kad
  netko otkaže, prvi na listi dobiva email s rokom za potvrdu
  (`WAITLIST_HOLD_MINUTES`, zadano 15 min). Ne potvrdi li na vrijeme, mjesto
  automatski ide sljedećoj osobi — provjerava se svake minute unutar
  pokrenutog servera (`instrumentation.ts`), bez potrebe za vanjskim cron
  servisom.
- **Organizator** (`/admin`) uređuje program, popis odobrenih e-mailova, i
  ima pregled popunjenosti uživo te izvoz CSV-a.
- **Jezik**: HR/EN prekidač na svakom ekranu; naziv/opis radionice se unosi
  dvojezično.

## Pokretanje lokalno

```bash
npm install
cp .env.example .env   # po potrebi izmijeni vrijednosti
npx prisma migrate dev
npm run dev
```

Otvori http://localhost:3000. Bez `RESEND_API_KEY` u `.env`, e-mailovi se ne
šalju nego samo ispisuju u terminal (dovoljno za testiranje).

Prvi organizatorski korak: otvori `/admin`, prijavi se s `ADMIN_PASSWORD` iz
`.env`, pa u `/admin/program` dodaj dane, blokove i radionice, i u
`/admin/approved-emails` dodaj barem svoj email da testiraš prijavu.

## Varijable okoline (`.env`)

| Varijabla | Značenje |
|---|---|
| `DATABASE_URL` | Putanja do SQLite baze, npr. `file:./dev.db` |
| `APP_URL` | Puna adresa aplikacije (koristi se u linkovima unutar e-mailova) |
| `CONFERENCE_NAME` | Naziv prikazan u zaglavlju i naslovu stranice |
| `CONTACT_EMAIL` | Prikazuje se ljudima čiji email nije na odobrenom popisu |
| `SESSION_SECRET` | Slučajan string za potpisivanje kolačića sesije — generiraj s `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Lozinka za `/admin` |
| `RESEND_API_KEY` | API ključ za [Resend](https://resend.com) (slanje e-mailova); prazno = ispis u konzolu |
| `EMAIL_FROM` | Pošiljatelj e-mailova, npr. `Konferencija <prijave@tvojadomena.hr>` |
| `WAITLIST_HOLD_MINUTES` | Koliko dugo vrijedi ponuda oslobođenog mjesta (zadano 15) |

## Deploy (bez plaćanja postojećeg WordPress hostinga)

Aplikacija je namjerno napravljena da radi kao jedan, dugotrajno pokrenut
Node proces s SQLite bazom u datoteci — bez potrebe za posebnom bazom
podataka ili vanjskim cron servisom. To znači da joj treba host koji drži
proces trajno pokrenutim i ima **trajni disk** (za SQLite datoteku), npr.
[Fly.io](https://fly.io) ili [Railway](https://railway.app) — oba imaju
besplatnu/vrlo jeftinu razinu koja je za ~500 sudionika i par dana rada
sasvim dovoljna.

Koraci (isti princip na oba servisa):

1. `npm run build` mora proći lokalno bez grešaka (već provjereno).
2. Postavi varijable okoline iz `.env` na hostu (uključujući pravi,
   slučajan `SESSION_SECRET` i `ADMIN_PASSWORD`).
3. Postavi `DATABASE_URL` na putanju na **trajnom disku/volumenu** hosta
   (ne u privremeni prostor koji se briše kod svakog restarta).
4. Pokreni `npx prisma migrate deploy` jednom pri prvom postavljanju (kreira
   tablice), zatim `npm run build && npm run start`.
5. Postavi `APP_URL` na konačnu HTTPS adresu (bitno za sigurne kolačiće).

### Povezivanje s WordPress stranicom

Ne treba dirati postojeći WordPress hosting. Zamoli osobu koja vodi vaš web
da doda jedan DNS zapis — poddomenu (npr. `prijave.vasakonferencija.hr`)
koja pokazuje na novi host — i na WordPress stranici dodaš gumb/link koji
vodi na tu poddomenu. To je jedina dodirna točka s postojećim sajtom.

## Struktura projekta

- `prisma/schema.prisma` — model podataka (Day, Block, ProgramItem,
  Participant, Registration, WaitlistEntry, ApprovedEmail…)
- `lib/` — poslovna logika (prijave, lista čekanja, i18n, sesije, e-mail)
- `app/` — stranice i API rute (Next.js App Router)
- `instrumentation.ts` — pozadinska provjera isteklih ponuda na listi
  čekanja, pokreće se svake minute dok je server aktivan
