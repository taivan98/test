import { prisma } from "./db";

export type ItemStatus = "none" | "registered" | "waiting" | "offered";

export type ProgramItemView = {
  id: string;
  blockId: string;
  type: "WORKSHOP" | "MAIN_HALL";
  kindHr: string;
  kindEn: string;
  titleHr: string;
  titleEn: string;
  descriptionHr: string;
  descriptionEn: string;
  speaker: string;
  room: string;
  detailsUrl: string;
  registrationRequired: boolean;
  capacity: number | null;
  confirmedCount: number;
  myStatus: ItemStatus;
  myWaitlistPosition: number | null;
  myOfferExpiresAt: Date | null;
};

export type BlockView = {
  id: string;
  startLabel: string;
  endLabel: string;
  items: ProgramItemView[];
  // set when the participant already holds a confirmed seat for one item in
  // this block — the rest of the block's items are unavailable to them
  myBlockPick: { id: string; titleHr: string; titleEn: string } | null;
};

export type DayView = {
  id: string;
  labelHr: string;
  labelEn: string;
  date: Date;
  blocks: BlockView[];
};

export async function getProgram(participantId: string | null): Promise<DayView[]> {
  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
    include: {
      blocks: {
        orderBy: { order: "asc" },
        include: {
          programItems: {
            orderBy: { order: "asc" },
            include: { _count: { select: { registrations: true } } },
          },
        },
      },
    },
  });

  let myRegistrations = new Set<string>();
  let myWaitlist = new Map<
    string,
    { status: "WAITING" | "OFFERED"; createdAt: Date; offerExpiresAt: Date | null }
  >();

  if (participantId) {
    const regs = await prisma.registration.findMany({
      where: { participantId },
      select: { programItemId: true },
    });
    myRegistrations = new Set(regs.map((r) => r.programItemId));

    const entries = await prisma.waitlistEntry.findMany({
      where: { participantId, status: { in: ["WAITING", "OFFERED"] } },
      select: { programItemId: true, status: true, createdAt: true, offerExpiresAt: true },
    });
    myWaitlist = new Map(
      entries.map((e) => [
        e.programItemId,
        { status: e.status as "WAITING" | "OFFERED", createdAt: e.createdAt, offerExpiresAt: e.offerExpiresAt },
      ])
    );
  }

  const result: DayView[] = [];
  for (const day of days) {
    const blocks: BlockView[] = [];
    for (const block of day.blocks) {
      const items: ProgramItemView[] = [];
      for (const item of block.programItems) {
        let myStatus: ItemStatus = "none";
        let myWaitlistPosition: number | null = null;
        let myOfferExpiresAt: Date | null = null;

        if (myRegistrations.has(item.id)) {
          myStatus = "registered";
        } else {
          const w = myWaitlist.get(item.id);
          if (w?.status === "WAITING") {
            myStatus = "waiting";
            myWaitlistPosition =
              (await prisma.waitlistEntry.count({
                where: { programItemId: item.id, status: "WAITING", createdAt: { lt: w.createdAt } },
              })) + 1;
          } else if (w?.status === "OFFERED") {
            myStatus = "offered";
            myOfferExpiresAt = w.offerExpiresAt;
          }
        }

        items.push({
          id: item.id,
          blockId: item.blockId,
          type: item.type,
          kindHr: item.kindHr,
          kindEn: item.kindEn,
          titleHr: item.titleHr,
          titleEn: item.titleEn,
          descriptionHr: item.descriptionHr,
          descriptionEn: item.descriptionEn,
          speaker: item.speaker,
          room: item.room,
          detailsUrl: item.detailsUrl,
          registrationRequired: item.registrationRequired,
          capacity: item.capacity,
          confirmedCount: item._count.registrations,
          myStatus,
          myWaitlistPosition,
          myOfferExpiresAt,
        });
      }
      const pickedItem = items.find((i) => i.myStatus === "registered") ?? null;
      const myBlockPick = pickedItem
        ? { id: pickedItem.id, titleHr: pickedItem.titleHr, titleEn: pickedItem.titleEn }
        : null;
      blocks.push({ id: block.id, startLabel: block.startLabel, endLabel: block.endLabel, items, myBlockPick });
    }
    result.push({ id: day.id, labelHr: day.labelHr, labelEn: day.labelEn, date: day.date, blocks });
  }
  return result;
}

export async function getProgramItem(participantId: string | null, programItemId: string) {
  const days = await getProgram(participantId);
  for (const day of days) {
    for (const block of day.blocks) {
      const item = block.items.find((i) => i.id === programItemId);
      if (item) return { day, block, item };
    }
  }
  return null;
}
