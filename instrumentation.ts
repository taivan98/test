export async function register() {
  // Only run in the actual Node.js server process (not edge/build workers),
  // and only once per process — this keeps a live interval for the whole
  // lifetime of the app, which is what lets the 15-minute waitlist holds
  // expire and roll over to the next person without any external cron.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { sweepExpiredOffers } = await import("./lib/registrations");
  const { notifyPromotion } = await import("./lib/notify");

  const origin = process.env.APP_URL || "http://localhost:3000";

  const sweep = async () => {
    try {
      const promotions = await sweepExpiredOffers();
      for (const promoted of promotions) {
        await notifyPromotion(promoted, origin);
      }
    } catch (err) {
      console.error("[waitlist-sweeper] failed:", err);
    }
  };

  setInterval(sweep, 60_000);
  sweep();
}
