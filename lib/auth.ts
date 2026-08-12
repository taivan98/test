import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import {
  ADMIN_COOKIE_NAME,
  PARTICIPANT_COOKIE_NAME,
  unpackAdminSession,
  unpackParticipantSession,
} from "./session";

export async function getCurrentParticipant() {
  const store = await cookies();
  const session = unpackParticipantSession(store.get(PARTICIPANT_COOKIE_NAME)?.value);
  if (!session) return null;
  return prisma.participant.findUnique({ where: { id: session.pid } });
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return !!unpackAdminSession(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
