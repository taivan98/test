import { prisma } from "./db";

const SETTINGS_ID = "singleton";

export type SiteSettings = {
  logoUrl: string;
  accentColor: string;
  accentInk: string;
  customCss: string;
};

const EMPTY: SiteSettings = { logoUrl: "", accentColor: "", accentInk: "", customCss: "" };

/**
 * Falls back to defaults on any DB error instead of throwing. Every page pulls
 * branding through this (via the root layout, Header, AdminHeader), including
 * ones statically prerendered at build time — when the DB/volume isn't
 * reachable yet (e.g. Railway's image-build step, before the volume is
 * mounted), throwing here would fail the whole build.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!row) return EMPTY;
    return {
      logoUrl: row.logoUrl,
      accentColor: row.accentColor,
      accentInk: row.accentInk,
      customCss: row.customCss,
    };
  } catch (err) {
    console.error("getSiteSettings: falling back to defaults", err);
    return EMPTY;
  }
}

export async function updateSiteSettings(data: SiteSettings): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

/** Builds a `:root{...}` override block from validated settings, or "" if nothing to override. */
export function buildAccentOverrideCss(settings: SiteSettings): string {
  const decls: string[] = [];
  if (/^#[0-9a-fA-F]{6}$/.test(settings.accentColor)) {
    decls.push(`--accent:${settings.accentColor};`);
  }
  if (settings.accentInk === "dark") decls.push(`--accent-ink:#1b1d24;`);
  else if (settings.accentInk === "light") decls.push(`--accent-ink:#ffffff;`);
  if (decls.length === 0) return "";
  return `:root{${decls.join("")}}`;
}

/** Neutralizes a literal "</style" so custom CSS can't prematurely close the <style> tag it's injected into. */
export function escapeForStyleTag(css: string): string {
  return css.replace(/<\/style/gi, "<\\/style");
}
