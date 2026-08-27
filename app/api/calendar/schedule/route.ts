import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { buildCalendar } from "@/lib/ics";
import { toCalendarEvent } from "@/lib/calendarEvents";

export async function GET(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const participant = await getCurrentParticipant();
  if (!participant) return NextResponse.redirect(new URL("/login", origin), 303);

  const locale = await getLocale();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  const registrations = await prisma.registration.findMany({
    where: { participantId: participant.id },
    include: { programItem: { include: { block: { include: { day: true } } } } },
    orderBy: [{ programItem: { block: { day: { order: "asc" } } } }, { programItem: { block: { order: "asc" } } }],
  });

  const events = registrations.map((reg) =>
    toCalendarEvent(reg.programItem, reg.programItem.block, reg.programItem.block.day, locale)
  );
  const ics = buildCalendar(`${conferenceName} — ${participant.email}`, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="moj-raspored.ics"`,
    },
  });
}
