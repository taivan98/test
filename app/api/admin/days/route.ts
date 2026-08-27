import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const date = String(form.get("date") || "");
  const labelHr = String(form.get("labelHr") || "");
  const labelEn = String(form.get("labelEn") || "");

  const order = await prisma.day.count();
  await prisma.day.create({
    data: { date: new Date(date || Date.now()), labelHr, labelEn, order },
  });

  return NextResponse.redirect(new URL("/admin/program", origin), 303);
}
