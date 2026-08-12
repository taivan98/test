import { Resend } from "resend";
import { Locale, t } from "./i18n";

const FROM = process.env.EMAIL_FROM || "Konferencija <prijave@example.com>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    // Dev fallback: no Resend key configured, log instead of sending.
    console.log(`\n--- EMAIL (not sent, no RESEND_API_KEY) ---\nTo: ${to}\nSubject: ${subject}\n${html}\n---\n`);
    return;
  }
  await client.emails.send({ from: FROM, to, subject, html });
}

function wrap(bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1b1d24">${bodyHtml}</div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#5b4fe8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;margin-top:16px">${label}</a>`;
}

export async function sendMagicLinkEmail(to: string, link: string, locale: Locale) {
  const subject = t(locale, "magicLink.emailSubject");
  const html = wrap(`
    <p>${t(locale, "magicLink.emailBody")}</p>
    ${button(link, t(locale, "magicLink.emailButton"))}
    <p style="color:#8a8f9c;font-size:12px;margin-top:24px">${link}</p>
  `);
  await send(to, subject, html);
}

export async function sendWaitlistOfferEmail(
  to: string,
  title: string,
  link: string,
  minutes: number,
  locale: Locale
) {
  const subject = t(locale, "waitlist.emailSubject", { title });
  const html = wrap(`
    <p>${t(locale, "waitlist.emailBody", { title, minutes })}</p>
    ${button(link, t(locale, "waitlist.emailConfirmButton"))}
    <p style="color:#8a8f9c;font-size:12px;margin-top:24px">${link}</p>
  `);
  await send(to, subject, html);
}
