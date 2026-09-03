import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { resetProgramStructure } from "@/lib/devTools";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  await resetProgramStructure();

  return NextResponse.redirect(new URL("/admin/reset-test-data?doneProgram=1", origin), 303);
}
