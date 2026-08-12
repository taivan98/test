import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { cancelRegistration } from "@/lib/registrations";
import { notifyPromotion } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const participantId = String(form.get("participantId") || "");
  const programItemId = String(form.get("programItemId") || "");

  const promoted = await cancelRegistration(participantId, programItemId);
  if (promoted) await notifyPromotion(promoted, origin);

  return NextResponse.redirect(new URL("/admin/program", origin));
}
