import crypto from "crypto";
import { prisma } from "./db";

/**
 * Testing helper for the organizer: fills a workshop with fake, already-approved
 * participants, leaving `seatsToLeave` open — handy for demoing the "full +
 * waitlist" flow to real colleagues without hand-registering dozens of accounts.
 * Safe to call repeatedly: recomputes from the current confirmed count each time.
 */
async function fillSeats(programItemId: string, seatsToLeave: number): Promise<number> {
  const item = await prisma.programItem.findUnique({ where: { id: programItemId } });
  if (!item || item.capacity == null) return 0;

  const confirmedCount = await prisma.registration.count({ where: { programItemId } });
  const toCreate = item.capacity - confirmedCount - seatsToLeave;
  if (toCreate <= 0) return 0;

  for (let i = 0; i < toCreate; i++) {
    const email = `test-${crypto.randomBytes(4).toString("hex")}@example.com`;
    const participant = await prisma.participant.create({ data: { email, locale: "hr" } });
    await prisma.approvedEmail.upsert({ where: { email }, update: {}, create: { email } });
    await prisma.registration.create({ data: { participantId: participant.id, programItemId } });
  }

  return toCreate;
}

/** Leaves exactly one seat open, so a real person can grab the last one. */
export function fillToOneSeat(programItemId: string): Promise<number> {
  return fillSeats(programItemId, 1);
}

/** Fills every seat, so real sign-ups start straight on the waitlist. */
export function fillCompletely(programItemId: string): Promise<number> {
  return fillSeats(programItemId, 0);
}
