import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

/** Returns a redirect response if the caller isn't an authenticated admin, else null. */
export async function requireAdminApi(origin: string) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", origin));
  return null;
}
