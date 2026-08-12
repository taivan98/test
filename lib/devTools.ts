import crypto from "crypto";
import { prisma } from "./db";

/**
 * Testing helper for the organizer: fills a workshop with fake, already-approved
 * participants until exactly one seat is left, so a real person can grab the last
 * seat and the next one lands on the waitlist — handy for demoing the "full +
 * waitlist" flow to real colleagues without hand-registering dozens of accounts.
 * Safe to call repeatedly: recomputes from the current confirmed count each time.
 */
export async function fillToOneSeat(programItemId: string): Promise<number> {
  const item = await prisma.programItem.findUnique({ where: { id: programItemId } });
  if (!item || item.capacity == null) return 0;

  const confirmedCount = await prisma.registration.count({ where: { programItemId } });
  const toCreate = item.capacity - confirmedCount - 1;
  if (toCreate <= 0) return 0;

  for (let i = 0; i < toCreate; i++) {
    const email = `test-${crypto.randomBytes(4).toString("hex")}@example.com`;
    const participant = await prisma.participant.create({ data: { email, locale: "hr" } });
    await prisma.approvedEmail.upsert({ where: { email }, update: {}, create: { email } });
    await prisma.registration.create({ data: { participantId: participant.id, programItemId } });
  }

  return toCreate;
}
