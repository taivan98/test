import { Locale, t } from "./i18n";

const FROM = process.env.EMAIL_FROM || "Konferencija <prijave@example.com>";

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "", email: from.trim() };
}

async function send(to: string, subject: string, html: string) {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    // Dev fallback: no Brevo key configured, log instead of sending.
    console.log(`\n--- EMAIL (not sent, no BREVO_API_KEY) ---\nTo: ${to}\nSubject: ${subject}\n${html}\n---\n`);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      sender: parseFrom(FROM),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }
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
