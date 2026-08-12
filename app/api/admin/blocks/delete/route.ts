import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const id = String(form.get("id") || "");
  await prisma.block.delete({ where: { id } });

  return NextResponse.redirect(new URL("/admin/program", origin));
}
