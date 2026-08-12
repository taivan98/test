import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";

export const PARTICIPANT_COOKIE_NAME = "session";
export const ADMIN_COOKIE_NAME = "admin_session";

const PARTICIPANT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days: covers prep + the event itself
const ADMIN_MAX_AGE = 60 * 60 * 12; // 12h

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function pack(obj: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function unpack<T>(value: string | undefined | null): T | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  try {
    const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof obj.exp === "number" && Date.now() > obj.exp) return null;
    return obj as T;
  } catch {
    return null;
  }
}

export type ParticipantSession = { pid: string; email: string; exp: number };
export type AdminSession = { admin: true; exp: number };

export function packParticipantSession(pid: string, email: string) {
  return {
    value: pack({ pid, email, exp: Date.now() + PARTICIPANT_MAX_AGE * 1000 }),
    maxAge: PARTICIPANT_MAX_AGE,
  };
}

export function unpackParticipantSession(value: string | undefined | null) {
  return unpack<ParticipantSession>(value);
}

export function packAdminSession() {
  return {
    value: pack({ admin: true, exp: Date.now() + ADMIN_MAX_AGE * 1000 }),
    maxAge: ADMIN_MAX_AGE,
  };
}

export function unpackAdminSession(value: string | undefined | null) {
  return unpack<AdminSession>(value);
}
