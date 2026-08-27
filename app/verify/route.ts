import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { PARTICIPANT_COOKIE_NAME, packParticipantSession } from "@/lib/session";
import { isHttpsOrigin } from "@/lib/cookieSecurity";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("token") || "";
  const origin = process.env.APP_URL || url.origin;

  const record = raw
    ? await prisma.magicLinkToken.findUnique({
        where: { tokenHash: hashToken(raw) },
        include: { participant: true },
      })
    : null;

  const valid = record && !record.usedAt && record.expiresAt.getTime() > Date.now();

  if (!valid) {
    return NextResponse.redirect(new URL("/verify/invalid", origin), 303);
  }

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const res = NextResponse.redirect(new URL("/program", origin), 303);
  const { value, maxAge } = packParticipantSession(record.participant.id, record.participant.email);
  res.cookies.set(PARTICIPANT_COOKIE_NAME, value, {
    httpOnly: true,
    secure: isHttpsOrigin(origin),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
