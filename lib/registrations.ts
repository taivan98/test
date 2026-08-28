import { prisma } from "./db";
import { generateToken } from "./tokens";

const HOLD_MINUTES = Number(process.env.WAITLIST_HOLD_MINUTES || "15");

export class BlockConflictError extends Error {
  constructor(public conflictTitleHr: string, public conflictTitleEn: string) {
    super("block_conflict");
  }
}
export class FullError extends Error {
  constructor() {
    super("full");
  }
}
export class NotFoundError extends Error {
  constructor() {
    super("not_found");
  }
}
export class AlreadyOnWaitlistError extends Error {
  constructor() {
    super("already_waitlisted");
  }
}

async function findConfirmedConflict(
  participantId: string,
  blockId: string,
  excludeProgramItemId: string
) {
  const conflict = await prisma.registration.findFirst({
    where: {
      participantId,
      programItem: { blockId, id: { not: excludeProgramItemId } },
    },
    include: { programItem: true },
  });
  return conflict?.programItem ?? null;
}

/**
 * Registers a participant for an item, or throws FullError / BlockConflictError.
 * Also cancels any waitlist entry the participant holds for a *different* item
 * in the same block — they can only use one slot per block, so continuing to
 * wait for the other one would just delay the next person for no reason. The
 * cancelled entries' promotions (if any) are returned so the caller can notify.
 */
export async function registerForItem(participantId: string, programItemId: string): Promise<PromotedOffer[]> {
  const item = await prisma.programItem.findUnique({ where: { id: programItemId } });
  if (!item || !item.registrationRequired) throw new NotFoundError();

  const existing = await prisma.registration.findUnique({
    where: { participantId_programItemId: { participantId, programItemId } },
  });
  if (existing) return [];

  const conflict = await findConfirmedConflict(participantId, item.blockId, programItemId);
  if (conflict) throw new BlockConflictError(conflict.titleHr, conflict.titleEn);

  if (item.capacity != null) {
    await prisma.$transaction(async (tx) => {
      const count = await tx.registration.count({ where: { programItemId } });
      if (count >= item.capacity!) throw new FullError();
      return tx.registration.create({ data: { participantId, programItemId } });
    });
  } else {
    await prisma.registration.create({ data: { participantId, programItemId } });
  }

  return cancelBlockWaitlistConflicts(participantId, item.blockId, programItemId);
}

export type PromotedOffer = {
  participantEmail: string;
  participantLocale: string;
  titleHr: string;
  titleEn: string;
  rawToken: string;
};

/** Offers a freed seat to the oldest WAITING entry, if any. Returns data to email, or null. */
async function promoteNext(programItemId: string): Promise<PromotedOffer | null> {
  const item = await prisma.programItem.findUnique({ where: { id: programItemId } });
  if (!item || item.capacity == null) return null;

  const confirmedCount = await prisma.registration.count({ where: { programItemId } });
  if (confirmedCount >= item.capacity) return null;

  const next = await prisma.waitlistEntry.findFirst({
    where: { programItemId, status: "WAITING" },
    orderBy: { createdAt: "asc" },
    include: { participant: true },
  });
  if (!next) return null;

  const { raw, hash } = generateToken();
  await prisma.waitlistEntry.update({
    where: { id: next.id },
    data: {
      status: "OFFERED",
      offeredAt: new Date(),
      offerExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
      offerTokenHash: hash,
    },
  });

  return {
    participantEmail: next.participant.email,
    participantLocale: next.participant.locale,
    titleHr: item.titleHr,
    titleEn: item.titleEn,
    rawToken: raw,
  };
}

/** Cancels every WAITING/OFFERED entry the participant holds elsewhere in the block, promoting the next person each time. */
async function cancelBlockWaitlistConflicts(
  participantId: string,
  blockId: string,
  excludeProgramItemId: string
): Promise<PromotedOffer[]> {
  const entries = await prisma.waitlistEntry.findMany({
    where: {
      participantId,
      status: { in: ["WAITING", "OFFERED"] },
      programItem: { blockId, id: { not: excludeProgramItemId } },
    },
  });

  const promotions: PromotedOffer[] = [];
  for (const entry of entries) {
    const wasOffered = entry.status === "OFFERED";
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { status: "CANCELLED", resolvedAt: new Date() },
    });
    if (!wasOffered) continue; // only an OFFERED entry was holding an open seat
    const promoted = await promoteNext(entry.programItemId);
    if (promoted) promotions.push(promoted);
  }
  return promotions;
}

/** Cancels a confirmed registration and, for capped workshops, offers the seat to the next waiter. */
export async function cancelRegistration(participantId: string, programItemId: string) {
  const reg = await prisma.registration.findUnique({
    where: { participantId_programItemId: { participantId, programItemId } },
  });
  if (!reg) return null;
  await prisma.registration.delete({ where: { id: reg.id } });
  return promoteNext(programItemId);
}

export async function joinWaitlist(participantId: string, programItemId: string) {
  const item = await prisma.programItem.findUnique({ where: { id: programItemId } });
  if (!item || !item.registrationRequired) throw new NotFoundError();
  if (item.capacity == null) return null; // main hall never needs a waitlist

  const alreadyReg = await prisma.registration.findUnique({
    where: { participantId_programItemId: { participantId, programItemId } },
  });
  if (alreadyReg) return null;

  const activeEntry = await prisma.waitlistEntry.findFirst({
    where: { participantId, programItemId, status: { in: ["WAITING", "OFFERED"] } },
  });
  if (activeEntry) throw new AlreadyOnWaitlistError();

  const conflict = await findConfirmedConflict(participantId, item.blockId, programItemId);
  if (conflict) throw new BlockConflictError(conflict.titleHr, conflict.titleEn);

  return prisma.waitlistEntry.create({ data: { participantId, programItemId, status: "WAITING" } });
}

/** Leaving the waitlist while OFFERED releases the held seat to the next person. */
export async function leaveWaitlist(participantId: string, programItemId: string) {
  const entry = await prisma.waitlistEntry.findFirst({
    where: { participantId, programItemId, status: { in: ["WAITING", "OFFERED"] } },
  });
  if (!entry) return null;

  const wasOffered = entry.status === "OFFERED";
  await prisma.waitlistEntry.update({
    where: { id: entry.id },
    data: { status: "CANCELLED", resolvedAt: new Date() },
  });

  if (wasOffered) return promoteNext(programItemId);
  return null;
}

export type OfferCheckResult =
  | { status: "expired" }
  | { status: "showable"; titleHr: string; titleEn: string };

/**
 * Read-only check for the "confirm your seat" landing page — deliberately does
 * NOT claim the seat. Corporate email scanners (e.g. Outlook Safe Links) visit
 * links in HTML emails automatically before a human opens them; if merely
 * *visiting* the link claimed the seat, the scanner would silently burn the
 * participant's own offer. Claiming only happens on the explicit form POST
 * from this page (see claimWaitlistOffer).
 */
export async function checkWaitlistOffer(rawToken: string): Promise<OfferCheckResult> {
  const { hashToken } = await import("./tokens");
  const entry = await prisma.waitlistEntry.findUnique({
    where: { offerTokenHash: hashToken(rawToken) },
    include: { programItem: true },
  });
  if (!entry) return { status: "expired" };
  if (entry.status === "CONFIRMED") {
    return { status: "showable", titleHr: entry.programItem.titleHr, titleEn: entry.programItem.titleEn };
  }
  const stillValid =
    entry.status === "OFFERED" && !!entry.offerExpiresAt && entry.offerExpiresAt.getTime() > Date.now();
  if (!stillValid) return { status: "expired" };
  return { status: "showable", titleHr: entry.programItem.titleHr, titleEn: entry.programItem.titleEn };
}

export type ConfirmResult =
  | { ok: true; participantId: string; participantEmail: string; programItemId: string }
  | { ok: false; reason: "invalid_or_expired" }
  | { ok: false; reason: "conflict"; conflictTitleHr: string; conflictTitleEn: string; promoted: PromotedOffer | null };

/** Called when someone submits the "confirm your seat" button on the waitlist landing page. */
export async function claimWaitlistOffer(rawToken: string): Promise<ConfirmResult> {
  const { hashToken } = await import("./tokens");
  const entry = await prisma.waitlistEntry.findUnique({
    where: { offerTokenHash: hashToken(rawToken) },
    include: { participant: true, programItem: true },
  });

  if (!entry) return { ok: false, reason: "invalid_or_expired" };

  if (entry.status === "CONFIRMED") {
    return {
      ok: true,
      participantId: entry.participantId,
      participantEmail: entry.participant.email,
      programItemId: entry.programItemId,
    };
  }

  const expired = entry.status !== "OFFERED" || !entry.offerExpiresAt || entry.offerExpiresAt.getTime() < Date.now();
  if (expired) {
    if (entry.status === "OFFERED") {
      await prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: { status: "EXPIRED", resolvedAt: new Date() },
      });
      await promoteNext(entry.programItemId);
    }
    return { ok: false, reason: "invalid_or_expired" };
  }

  const conflict = await findConfirmedConflict(entry.participantId, entry.programItem.blockId, entry.programItemId);
  if (conflict) {
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { status: "CANCELLED", resolvedAt: new Date() },
    });
    const promoted = await promoteNext(entry.programItemId);
    return {
      ok: false,
      reason: "conflict",
      conflictTitleHr: conflict.titleHr,
      conflictTitleEn: conflict.titleEn,
      promoted,
    };
  }

  await prisma.$transaction([
    prisma.registration.create({
      data: { participantId: entry.participantId, programItemId: entry.programItemId },
    }),
    prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { status: "CONFIRMED", resolvedAt: new Date() },
    }),
  ]);

  return {
    ok: true,
    participantId: entry.participantId,
    participantEmail: entry.participant.email,
    programItemId: entry.programItemId,
  };
}

/** Sweeps offers whose 15-minute window lapsed, promoting the next person in line. Run on an interval. */
export async function sweepExpiredOffers(): Promise<PromotedOffer[]> {
  const expired = await prisma.waitlistEntry.findMany({
    where: { status: "OFFERED", offerExpiresAt: { lt: new Date() } },
  });

  const promotions: PromotedOffer[] = [];
  for (const entry of expired) {
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { status: "EXPIRED", resolvedAt: new Date() },
    });
    const promoted = await promoteNext(entry.programItemId);
    if (promoted) promotions.push(promoted);
  }
  return promotions;
}
