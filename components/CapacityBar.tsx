export function CapacityBar({ confirmedCount, capacity }: { confirmedCount: number; capacity: number | null }) {
  if (capacity == null) return null;
  const pct = Math.min(100, Math.round((confirmedCount / capacity) * 100));
  return (
    <div className="h-1.5 rounded-full bg-paper-dim overflow-hidden">
      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}
