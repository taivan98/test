import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { registerForItem, BlockConflictError, FullError, NotFoundError } from "@/lib/registrations";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const participant = await getCurrentParticipant();
  if (!participant) return NextResponse.redirect(new URL("/login", origin), 303);

  const form = await req.formData();
  const programItemId = String(form.get("programItemId") || "");
  const redirectTo = String(form.get("redirectTo") || `/sessions/${programItemId}`);
  const backTo = new URL(redirectTo, origin);

  try {
    await registerForItem(participant.id, programItemId);
    backTo.searchParams.set("msg", "registered");
  } catch (err) {
    if (err instanceof FullError) {
      backTo.searchParams.set("msg", "full");
      backTo.searchParams.set("item", programItemId);
    } else if (err instanceof BlockConflictError) backTo.searchParams.set("msg", "conflict");
    else if (err instanceof NotFoundError) {
      return NextResponse.redirect(new URL("/program", origin), 303);
    } else {
      throw err;
    }
  }

  return NextResponse.redirect(backTo, 303);
}
