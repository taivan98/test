import { CapacityStatus } from "@/lib/status";
import { Locale, t } from "@/lib/i18n";

const VARIANT: Record<CapacityStatus, string> = {
  available: "bg-good-soft text-good",
  almostFull: "bg-warn-soft text-warn",
  full: "bg-bad-soft text-bad",
  mainHall: "bg-paper-dim text-ink-dim",
};

const KEY: Record<CapacityStatus, string> = {
  available: "status.available",
  almostFull: "status.almostFull",
  full: "status.full",
  mainHall: "status.mainHallOpen",
};

export function StatusChip({ status, locale }: { status: CapacityStatus; locale: Locale }) {
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${VARIANT[status]}`}>
      {t(locale, KEY[status])}
    </span>
  );
}
