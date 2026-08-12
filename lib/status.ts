export type CapacityStatus = "available" | "almostFull" | "full" | "mainHall";

export function capacityStatus(confirmedCount: number, capacity: number | null): CapacityStatus {
  if (capacity == null) return "mainHall";
  if (confirmedCount >= capacity) return "full";
  if (confirmedCount / capacity >= 0.8) return "almostFull";
  return "available";
}
