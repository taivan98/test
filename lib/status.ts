export type CapacityStatus = "available" | "almostFull" | "full";

export function capacityStatus(confirmedCount: number, capacity: number | null): CapacityStatus {
  if (capacity == null) return "available";
  if (confirmedCount >= capacity) return "full";
  if (confirmedCount / capacity >= 0.8) return "almostFull";
  return "available";
}

export type CapacityColor = "good" | "warn" | "bad";

/** Color for the capacity bar/seat count: green under half full, orange past half, red once full. */
export function capacityColor(confirmedCount: number, capacity: number | null): CapacityColor {
  if (capacity == null) return "good";
  if (confirmedCount >= capacity) return "bad";
  if (confirmedCount / capacity >= 0.5) return "warn";
  return "good";
}
