import crypto from "crypto";

/** Generates a single-use token: the raw value goes in the emailed link, only its hash is stored. */
export function generateToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
