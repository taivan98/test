export type CapacityStatus = "available" | "almostFull" | "full";

export function capacityStatus(confirmedCount: number, capacity: number | null): CapacityStatus {
  if (capacity == null) return "available";
  if (confirmedCount >= capacity) return "full";
  if (confirmedCount / capacity >= 0.8) return "almostFull";
  return "available";
}
