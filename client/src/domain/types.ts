export type TripStatus =
  | "idle"
  | "active"
  | "completed"
  | "cancelled"
  | "issue";

export interface TripState {
  tripId: string;

  status: TripStatus;

  currentLocation: {
    lat: number;
    lng: number;
  } | null;

  path: { lat: number; lng: number }[];

  speed: number;

  issues: {
    message: string;
    severity: string;
  }[];

  lastUpdated: string;

  distanceTravelled: number;
  plannedDistance: number;
  progress: number;
}

export interface FleetState {
  trips: Record<string, TripState>;
}
