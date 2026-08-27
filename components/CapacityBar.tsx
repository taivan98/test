import { capacityColor } from "@/lib/status";

const FILL_CLASS = { good: "bg-good", warn: "bg-warn", bad: "bg-bad" };

export function CapacityBar({ confirmedCount, capacity }: { confirmedCount: number; capacity: number | null }) {
  if (capacity == null) return null;
  const pct = Math.min(100, Math.round((confirmedCount / capacity) * 100));
  const color = capacityColor(confirmedCount, capacity);
  return (
    <div className="h-1.5 rounded-full bg-paper-dim overflow-hidden">
      <div className={`h-full ${FILL_CLASS[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
