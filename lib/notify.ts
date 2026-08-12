import { PromotedOffer } from "./registrations";
import { sendWaitlistOfferEmail } from "./email";
import { Locale } from "./i18n";

const HOLD_MINUTES = Number(process.env.WAITLIST_HOLD_MINUTES || "15");

export async function notifyPromotion(promoted: PromotedOffer, origin: string) {
  const locale = (promoted.participantLocale as Locale) || "hr";
  const title = locale === "en" ? promoted.titleEn : promoted.titleHr;
  const link = new URL(`/waitlist/confirm?token=${promoted.rawToken}`, origin).toString();
  await sendWaitlistOfferEmail(promoted.participantEmail, title, link, HOLD_MINUTES, locale);
}
