import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const dayId = String(form.get("dayId") || "");
  const startLabel = String(form.get("startLabel") || "");
  const endLabel = String(form.get("endLabel") || "");

  const order = await prisma.block.count({ where: { dayId } });
  await prisma.block.create({ data: { dayId, startLabel, endLabel, order } });

  return NextResponse.redirect(new URL("/admin/program", origin));
}
