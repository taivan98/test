import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toRow(values: string[]): string {
  return values.map(csvEscape).join(",") + "\r\n";
}

export async function GET(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const registrations = await prisma.registration.findMany({
    include: {
      participant: true,
      programItem: { include: { block: { include: { day: true } } } },
    },
    orderBy: [{ programItem: { block: { day: { order: "asc" } } } }, { createdAt: "asc" }],
  });

  const waitlist = await prisma.waitlistEntry.findMany({
    where: { status: { in: ["WAITING", "OFFERED"] } },
    include: {
      participant: true,
      programItem: { include: { block: { include: { day: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  let csv = toRow(["Status", "Dan", "Blok", "Sesija", "Dvorana", "Email", "Ime", "Vrijeme prijave"]);

  for (const r of registrations) {
    csv += toRow([
      "Potvrđeno",
      r.programItem.block.day.labelHr,
      `${r.programItem.block.startLabel}-${r.programItem.block.endLabel}`,
      r.programItem.titleHr,
      r.programItem.room,
      r.participant.email,
      r.participant.name,
      r.createdAt.toISOString(),
    ]);
  }
  for (const w of waitlist) {
    csv += toRow([
      w.status === "OFFERED" ? "Lista čekanja (ponuđeno)" : "Lista čekanja",
      w.programItem.block.day.labelHr,
      `${w.programItem.block.startLabel}-${w.programItem.block.endLabel}`,
      w.programItem.titleHr,
      w.programItem.room,
      w.participant.email,
      w.participant.name,
      w.createdAt.toISOString(),
    ]);
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prijave.csv"`,
    },
  });
}
