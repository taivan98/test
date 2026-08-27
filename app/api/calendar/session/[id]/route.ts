import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/db";
import { buildCalendar } from "@/lib/ics";
import { toCalendarEvent } from "@/lib/calendarEvents";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const participant = await getCurrentParticipant();
  if (!participant) return NextResponse.redirect(new URL("/login", origin), 303);

  const { id } = await params;
  const locale = await getLocale();

  const reg = await prisma.registration.findUnique({
    where: { participantId_programItemId: { participantId: participant.id, programItemId: id } },
    include: { programItem: { include: { block: { include: { day: true } } } } },
  });
  if (!reg) return new NextResponse("Not found", { status: 404 });

  const event = toCalendarEvent(reg.programItem, reg.programItem.block, reg.programItem.block.day, locale);
  const ics = buildCalendar(event.summary, [event]);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reg.programItem.id}.ics"`,
    },
  });
}
