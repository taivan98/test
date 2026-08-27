import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/settings";
import { saveUpload, deleteUploadByServingPath, UploadValidationError } from "@/lib/uploads";

const IMAGE_FIELDS = new Set(["logoUrl", "faviconUrl", "ogImageUrl"]);
const FONT_FIELDS = new Set(["fontUrl"]);

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const field = String(form.get("field") || "");
  if (!IMAGE_FIELDS.has(field) && !FONT_FIELDS.has(field)) {
    return NextResponse.redirect(new URL("/admin/branding?error=field", origin), 303);
  }

  const current = await getSiteSettings();
  const key = field as keyof SiteSettings;

  if (form.get("clear")) {
    await deleteUploadByServingPath(current[key]);
    await updateSiteSettings({ ...current, [key]: "" });
    return NextResponse.redirect(new URL("/admin/branding?done=1", origin), 303);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/admin/branding?error=nofile", origin), 303);
  }

  try {
    const servingPath = await saveUpload(file, IMAGE_FIELDS.has(field) ? "image" : "font");
    await deleteUploadByServingPath(current[key]);
    await updateSiteSettings({ ...current, [key]: servingPath });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.redirect(new URL("/admin/branding?error=invalid", origin), 303);
    }
    throw err;
  }

  return NextResponse.redirect(new URL("/admin/branding?done=1", origin), 303);
}
