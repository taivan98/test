import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Uploaded branding assets (logo, favicon, OG image, custom font) are stored
 * as plain files next to the SQLite database — same directory, so they live
 * on the same persistent volume without needing any extra hosting
 * configuration (e.g. Railway's volume, already used for DATABASE_URL).
 */
function uploadsDir(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  const dbPath = dbUrl.replace(/^file:/, "");
  return path.join(path.dirname(path.resolve(dbPath)), "uploads");
}

export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".gif": "image/gif",
};

export const FONT_TYPES: Record<string, string> = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

export const CONTENT_TYPES: Record<string, string> = { ...IMAGE_TYPES, ...FONT_TYPES };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_FONT_BYTES = 8 * 1024 * 1024;

export class UploadValidationError extends Error {}

/** Saves an uploaded image or font file and returns its serving path ("/uploads/<name>"). */
export async function saveUpload(file: File, kind: "image" | "font"): Promise<string> {
  const allowed = kind === "image" ? IMAGE_TYPES : FONT_TYPES;
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_FONT_BYTES;

  const ext = path.extname(file.name || "").toLowerCase();
  if (!allowed[ext]) {
    throw new UploadValidationError(`Nepodržana vrsta datoteke: ${ext || "(nepoznato)"}`);
  }
  if (file.size > maxBytes) {
    throw new UploadValidationError(`Datoteka je prevelika (max ${Math.round(maxBytes / 1024 / 1024)}MB).`);
  }

  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });

  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return `/uploads/${filename}`;
}

/** Reads a previously saved upload by its serving path. Returns null if missing or the path is invalid. */
export async function readUpload(filename: string): Promise<Buffer | null> {
  if (filename !== path.basename(filename)) return null; // reject path traversal
  try {
    return await fs.readFile(path.join(uploadsDir(), filename));
  } catch {
    return null;
  }
}

/** Best-effort delete of a previously stored upload, given its "/uploads/<name>" serving path. */
export async function deleteUploadByServingPath(servingPath: string): Promise<void> {
  if (!servingPath.startsWith("/uploads/")) return;
  const filename = servingPath.slice("/uploads/".length);
  if (filename !== path.basename(filename)) return;
  try {
    await fs.unlink(path.join(uploadsDir(), filename));
  } catch {
    // already gone, or never existed — fine
  }
}
