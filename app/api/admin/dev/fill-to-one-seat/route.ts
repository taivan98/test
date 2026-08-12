import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { fillToOneSeat } from "@/lib/devTools";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const programItemId = String(form.get("programItemId") || "");
  await fillToOneSeat(programItemId);

  return NextResponse.redirect(new URL("/admin/program", origin));
}
