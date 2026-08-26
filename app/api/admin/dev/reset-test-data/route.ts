import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { resetTestData } from "@/lib/devTools";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  await resetTestData();

  return NextResponse.redirect(new URL("/admin/reset-test-data?done=1", origin));
}
