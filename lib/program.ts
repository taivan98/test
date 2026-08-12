import { prisma } from "./db";

export type ItemStatus = "none" | "registered" | "waiting" | "offered";

export type ProgramItemView = {
  id: string;
  blockId: string;
  type: "WORKSHOP" | "MAIN_HALL";
  titleHr: string;
  titleEn: string;
  descriptionHr: string;
  descriptionEn: string;
  speaker: string;
  room: string;
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
          titleHr: item.titleHr,
          titleEn: item.titleEn,
          descriptionHr: item.descriptionHr,
          descriptionEn: item.descriptionEn,
          speaker: item.speaker,
          room: item.room,
          capacity: item.capacity,
          confirmedCount: item._count.registrations,
          myStatus,
          myWaitlistPosition,
          myOfferExpiresAt,
        });
      }
      blocks.push({ id: block.id, startLabel: block.startLabel, endLabel: block.endLabel, items });
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
