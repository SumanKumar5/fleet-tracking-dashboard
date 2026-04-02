
export interface RawFleetEvent {
  event_id: string;
  event_type: string;
  timestamp: string;

  vehicle_id: string;
  trip_id: string;
  device_id?: string;

  location?: {
    lat: number;
    lng: number;
    accuracy_meters?: number;
    altitude_meters?: number;
  };

  movement?: {
    speed_kmh?: number;
    heading_degrees?: number;
    moving?: boolean;
  };

  distance_travelled_km?: number;

  signal_quality?: string;

  device?: {
    battery_level?: number;
    charging?: boolean;
  };

  overspeed?: boolean;

  planned_distance_km?: number;
  estimated_duration_hours?: number;

  error_message?: string; 
  severity?: string;
}

export enum EventType {
  LOCATION_UPDATE = "LOCATION_UPDATE",

  TRIP_STARTED = "TRIP_STARTED",
  TRIP_ENDED = "TRIP_ENDED",
  TRIP_CANCELLED = "TRIP_CANCELLED",

  GPS_LOST = "GPS_LOST",
  DEVICE_ERROR = "DEVICE_ERROR",
  SIGNAL_WEAK = "SIGNAL_WEAK",

  FUEL_LOW = "FUEL_LOW",
  STOPPED = "STOPPED",
  IDLE = "IDLE",

  UNKNOWN = "UNKNOWN",
}

export interface FleetEvent {
  tripId: string;
  timestamp: string;
  eventType: EventType;

  lat?: number;
  lng?: number;

  speed?: number;

  fuelLevel?: number;

  message?: string;

  distanceTravelled?: number;
  plannedDistance?: number;

  errorMessage?: string;
  severity?: string;
}
