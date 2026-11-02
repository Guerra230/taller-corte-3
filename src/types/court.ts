export type CourtKind = "soccer" | "basketball" | "other";

export interface Court {
  id: string;
  name: string;
  kind: CourtKind;
  location: string | null;
  description: string | null;
  pricePerHour: number | null;
  capacity: number | null;
  isAvailable: boolean | null;
}

export interface ActivityEntry {
  id: string;
  message: string;
  at: number;
}
