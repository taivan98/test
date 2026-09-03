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

export type ResetTestDataResult = {
  participants: number;
  approvedEmails: number;
};

/**
 * Wipes everyone who ever logged in or was approved — registrations, waitlist
 * entries and magic links go with them via cascading deletes — while leaving
 * the real program (days/blocks/sessions) completely untouched. Use this to
 * clear out fake/test participants (from manual testing or the fill-seats
 * buttons above) before real registrations start.
 */
export async function resetTestData(): Promise<ResetTestDataResult> {
  const [participants, approvedEmails] = await prisma.$transaction([
    prisma.participant.deleteMany({}),
    prisma.approvedEmail.deleteMany({}),
  ]);
  return { participants: participants.count, approvedEmails: approvedEmails.count };
}

export type ResetProgramResult = {
  days: number;
  blocks: number;
  programItems: number;
};

/**
 * Wipes the entire program — days, blocks and sessions — plus every
 * registration/waitlist entry tied to them, via cascading deletes. Completely
 * independent of resetTestData: participants and approved emails are untouched.
 */
export async function resetProgramStructure(): Promise<ResetProgramResult> {
  const [blocks, programItems] = await Promise.all([
    prisma.block.count(),
    prisma.programItem.count(),
  ]);
  const { count: days } = await prisma.day.deleteMany({});
  return { days, blocks, programItems };
}
