import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const blockId = String(form.get("blockId") || "");
  const type = String(form.get("type") || "WORKSHOP") === "MAIN_HALL" ? "MAIN_HALL" : "WORKSHOP";
  const kindHr = String(form.get("kindHr") || "");
  const kindEn = String(form.get("kindEn") || "");
  const titleHr = String(form.get("titleHr") || "");
  const titleEn = String(form.get("titleEn") || "");
  const descriptionHr = String(form.get("descriptionHr") || "");
  const descriptionEn = String(form.get("descriptionEn") || "");
  const speaker = String(form.get("speaker") || "");
  const room = String(form.get("room") || "");
  const capacityRaw = String(form.get("capacity") || "").trim();
  const capacity = capacityRaw === "" ? null : Math.max(0, parseInt(capacityRaw, 10) || 0);

  const order = await prisma.programItem.count({ where: { blockId } });
  await prisma.programItem.create({
    data: { blockId, type, kindHr, kindEn, titleHr, titleEn, descriptionHr, descriptionEn, speaker, room, capacity, order },
  });

  return NextResponse.redirect(new URL("/admin/program", origin));
}
