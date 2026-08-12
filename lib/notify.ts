import { PromotedOffer } from "./registrations";
import { sendWaitlistOfferEmail } from "./email";
import { Locale } from "./i18n";

const HOLD_MINUTES = Number(process.env.WAITLIST_HOLD_MINUTES || "15");

/**
 * The seat is already freed/reassigned in the database by the time this runs —
 * a hiccup sending the notification email shouldn't fail the registration or
 * cancellation that triggered it. Log and move on; the offer is still valid
 * and the participant can still find it by revisiting the program.
 */
export async function notifyPromotion(promoted: PromotedOffer, origin: string) {
  try {
    const locale = (promoted.participantLocale as Locale) || "hr";
    const title = locale === "en" ? promoted.titleEn : promoted.titleHr;
    const link = new URL(`/waitlist/confirm?token=${promoted.rawToken}`, origin).toString();
    await sendWaitlistOfferEmail(promoted.participantEmail, title, link, HOLD_MINUTES, locale);
  } catch (err) {
    console.error("[notifyPromotion] failed to send waitlist offer email:", err);
  }
}
