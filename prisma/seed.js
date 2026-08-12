// One-time seed for the real HR Days 2026 program, transcribed from the
// conference's own program page. Safe to re-run: skips if any Day already
// exists, so it won't duplicate data on a redeploy.
//
// Run manually with: npx prisma db seed
// (Prisma also runs this automatically after `prisma migrate deploy` if the
// "prisma.seed" script in package.json is present, but this project keeps it
// manual so a redeploy never silently re-seeds a database that already has
// real registrations in it.)

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DETAILS_URL = "https://hrdays.net/program-2026/";

const days = [
  {
    labelHr: "1. dan · 21.4.2026", labelEn: "Day 1 · Apr 21, 2026", date: "2026-04-21",
    blocks: [
      ["16:30", "18:00", [
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Bootcamp: Od jedne do WOW oglasa", titleEn: "Bootcamp: From One to a WOW Job Ad", speaker: "Antonija Blažić Crnković", room: "Dvorana 8", capacity: 40 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Employee Journey kao temelj dobrog Employee Experience-a", titleEn: "Employee Journey as the Foundation of a Good Employee Experience", descriptionHr: "Od prvog kontakta do odlaska zaposlenika.", descriptionEn: "From first contact to employee offboarding.", speaker: "Jelena Jakušić, Mirela Baranović Trogrlić", room: "Dvorana VIP", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Pay Transparency bez filtera: iskustva Equal Pay Champions", titleEn: "Pay Transparency Unfiltered: Equal Pay Champions Experiences", descriptionHr: "by SELECTIO GRUPA", descriptionEn: "by SELECTIO GRUPA", speaker: "Ana Raković", room: "Dvorana 5", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Retain u praksi HR-a", titleEn: "Retain in HR Practice", descriptionHr: "by SELECTIO GRUPA", descriptionEn: "by SELECTIO GRUPA", speaker: "Ana Petrušić", room: "Dvorana 6", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Paralelna aktivnost", kindEn: "Parallel activity", titleHr: "Wine Tasting & HR Speed Dating", titleEn: "Wine Tasting & HR Speed Dating", speaker: "", room: "Lore Night Club", capacity: 30 },
      ]],
      ["18:30", "20:00", [
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "HR Speed Lab: Osnaživanje zaposlenika kroz vještinu komunikacije", titleEn: "HR Speed Lab: Empowering Employees Through Communication Skills", descriptionHr: "by CREATIVA", descriptionEn: "by CREATIVA", speaker: "Danijela Čajkić, Ines Betjak Kušper", room: "Dvorana 8", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Prodajne vještine koje HR može (i treba) koristiti", titleEn: "Sales Skills HR Can (and Should) Use", descriptionHr: "by HANSEN BECK", descriptionEn: "by HANSEN BECK", speaker: "Irina Gutiprević", room: "Dvorana 5", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Emocije u poslovnom okruženju – od prepreke do resursa", titleEn: "Emotions in the Workplace – From Obstacle to Resource", descriptionHr: "by TREMOLO", descriptionEn: "by TREMOLO", speaker: "Davorka Šalić", room: "Dvorana VIP", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Masterclass", kindEn: "Masterclass", titleHr: "New Leadership at the Edge of Change", titleEn: "New Leadership at the Edge of Change", descriptionHr: "Samo za žene.", descriptionEn: "Women only.", speaker: "Boštjana Lipovšek", room: "Konferencijska dvorana", capacity: 40 },
        { type: "WORKSHOP", kindHr: "Paralelna aktivnost", kindEn: "Parallel activity", titleHr: "Wine Tasting & HR Speed Dating", titleEn: "Wine Tasting & HR Speed Dating", speaker: "", room: "Lore Night Club", capacity: 30 },
      ]],
    ],
  },
  {
    labelHr: "2. dan · 22.4.2026", labelEn: "Day 2 · Apr 22, 2026", date: "2026-04-22",
    blocks: [
      ["10:00", "10:30", [{ type: "MAIN_HALL", kindHr: "Program", kindEn: "Program", titleHr: "Otvorenje konferencije", titleEn: "Conference opening", speaker: "", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["10:30", "11:05", [{ type: "MAIN_HALL", kindHr: "Keynote", kindEn: "Keynote", titleHr: "The Future Memory Engineer", titleEn: "The Future Memory Engineer", speaker: "Julian Dziubinski", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["11:05", "12:05", [{ type: "MAIN_HALL", kindHr: "Keynote", kindEn: "Keynote", titleHr: "Attract, Retain, Comply – A Fresh Blueprint for Benefits in the Age of Pay Transparency", titleEn: "Attract, Retain, Comply – A Fresh Blueprint for Benefits in the Age of Pay Transparency", descriptionHr: "Keynote by MARSH.", descriptionEn: "Keynote by MARSH.", speaker: "Dan Dolan", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["12:25", "12:35", [{ type: "MAIN_HALL", kindHr: "Dodjela nagrada", kindEn: "Awards", titleHr: "Najbolje HR prakse 2026 – male i srednje tvrtke", titleEn: "Best HR Practices 2026 – Small & Medium Companies", speaker: "", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["12:35", "13:05", [{ type: "MAIN_HALL", kindHr: "Keynote", kindEn: "Keynote", titleHr: "Elevating Your Performance from Being a 'Swimmer' to a 'Waterwalker'", titleEn: "Elevating Your Performance from Being a 'Swimmer' to a 'Waterwalker'", speaker: "James Michael Lafferty", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["14:00", "14:20", [{ type: "MAIN_HALL", kindHr: "Dodjela nagrada", kindEn: "Awards", titleHr: "Najbolje HR prakse 2026 – velike tvrtke", titleEn: "Best HR Practices 2026 – Large Companies", speaker: "", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["14:20", "14:50", [{ type: "MAIN_HALL", kindHr: "Stand-up", kindEn: "Stand-up", titleHr: "Smijeh, istina i HR realnost u jednom!", titleEn: "Laughter, truth and HR reality in one!", speaker: "Vlatko Štampar", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
      ["14:50", "15:10", [{ type: "MAIN_HALL", kindHr: "Dodjela nagrada", kindEn: "Awards", titleHr: "Najbolje HR prakse 2026 – Enterprise kategorija", titleEn: "Best HR Practices 2026 – Enterprise Category", speaker: "", room: "Konferencijska dvorana", capacity: null, registrationRequired: false }]],
    ],
  },
  {
    labelHr: "3. dan · 23.4.2026", labelEn: "Day 3 · Apr 23, 2026", date: "2026-04-23",
    blocks: [
      ["09:00", "09:30", [{ type: "MAIN_HALL", kindHr: "Program", kindEn: "Program", titleHr: "Pozdrav voditelja", titleEn: "Host's welcome", speaker: "", room: "Konferencijska dvorana", capacity: null }]],
      ["09:30", "10:50", [
        { type: "MAIN_HALL", kindHr: "Keynote", kindEn: "Keynote", titleHr: "Beyond Survival & 'Stage is Yours'", titleEn: "Beyond Survival & 'Stage is Yours'", descriptionHr: "Dva keynote predavanja: 'Beyond Survival: Thriving in the Matrix World of Modern Tech' i \"'Stage is Yours' – AmeriCor Group Case Study: Zašto ostaju oni koji mogu ići bilo gdje\".", descriptionEn: "Two keynote talks: 'Beyond Survival: Thriving in the Matrix World of Modern Tech' and \"'Stage is Yours' – AmeriCor Group Case Study\".", speaker: "Gražina Širaitė, Adam Slaviček, Nataša Kuba", room: "Konferencijska dvorana", capacity: null },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Od Direktive do prakse: kako se pripremiti za EU Direktivu o transparentnosti plaće", titleEn: "From Directive to Practice: Preparing for the EU Pay Transparency Directive", descriptionHr: "by SEYFOR", descriptionEn: "by SEYFOR", speaker: "Ivana Jurčan Palinić, Marko Bagić", room: "Dvorana 8", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Kako spriječiti da se novi voditelj 'spotakne' u prvim mjesecima/godini?", titleEn: "How to Stop New Managers from Stumbling in Their First Months/Year", descriptionHr: "by SD Worx", descriptionEn: "by SD Worx", speaker: "Andreja Kalazić", room: "Dvorana 5", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Benefiti na testu: transformacija iz troška u strategiju", titleEn: "Benefits Under Test: Turning a Cost Into a Strategy", descriptionHr: "by MARSH", descriptionEn: "by MARSH", speaker: "Jelena Jović", room: "Dvorana VIP", capacity: 35 },
      ]],
      ["11:05", "11:35", [{ type: "MAIN_HALL", kindHr: "Predavanje", kindEn: "Talk", titleHr: "HR identitet: The iceberg is melting", titleEn: "HR Identity: The Iceberg Is Melting", speaker: "Domagoj Lipošinović", room: "Konferencijska dvorana", capacity: null }]],
      ["11:35", "12:10", [{ type: "MAIN_HALL", kindHr: "Panel", kindEn: "Panel", titleHr: "Pozicija HR-a u Upravi: realnost prakse", titleEn: "HR's Position on the Board: The Reality of Practice", descriptionHr: "Moderator: Domagoj Lipošinović.", descriptionEn: "Moderator: Domagoj Lipošinović.", speaker: "Marija Hebel, Marin Milanović, Mojca Gorečan, Marija Zorko", room: "Konferencijska dvorana", capacity: null }]],
      ["13:15", "14:35", [
        { type: "MAIN_HALL", kindHr: "Keynote", kindEn: "Keynote", titleHr: "Leadership je emocionalni proces – zato vam AI tu ne može pomoći (i neće još dugo)", titleEn: "Leadership Is an Emotional Process – Which Is Why AI Can't Help You There (and Won't For a While)", speaker: "Ivica Vlašić", room: "Konferencijska dvorana", capacity: null },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "From Insight to Impact: Designing Moments That Matter", titleEn: "From Insight to Impact: Designing Moments That Matter", speaker: "Julian Dziubinski", room: "Dvorana 8", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "Od HR-a do headlinea: uloga medija u employer brandingu", titleEn: "From HR to Headlines: The Role of Media in Employer Branding", descriptionHr: "by Večernji list", descriptionEn: "by Večernji list", speaker: "Ivana Rajić, Doris Krajcl, Matea Kuzmić", room: "Dvorana VIP", capacity: 35 },
        { type: "WORKSHOP", kindHr: "Radionica", kindEn: "Workshop", titleHr: "AI u HR-u: oduška bez sigurnosne mreže", titleEn: "AI in HR: An Outlet Without a Safety Net", speaker: "Marko Marinić", room: "Dvorana 6", capacity: 35 },
      ]],
    ],
  },
];

async function main() {
  const existing = await prisma.day.count();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} day(s) already in the database.`);
    return;
  }

  for (let d = 0; d < days.length; d++) {
    const dayDef = days[d];
    const day = await prisma.day.create({ data: { date: new Date(dayDef.date), labelHr: dayDef.labelHr, labelEn: dayDef.labelEn, order: d } });
    for (let b = 0; b < dayDef.blocks.length; b++) {
      const [startLabel, endLabel, items] = dayDef.blocks[b];
      const block = await prisma.block.create({ data: { dayId: day.id, startLabel, endLabel, order: b } });
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await prisma.programItem.create({
          data: {
            blockId: block.id,
            order: i,
            type: it.type,
            kindHr: it.kindHr || "",
            kindEn: it.kindEn || "",
            titleHr: it.titleHr,
            titleEn: it.titleEn,
            descriptionHr: it.descriptionHr || "",
            descriptionEn: it.descriptionEn || "",
            speaker: it.speaker || "",
            room: it.room || "",
            registrationRequired: it.registrationRequired !== false,
            capacity: it.capacity,
            detailsUrl: DETAILS_URL,
          },
        });
      }
    }
  }
  console.log("Seeded the HR Days 2026 program.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
