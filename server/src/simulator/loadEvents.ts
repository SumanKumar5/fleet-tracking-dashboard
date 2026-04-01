import fs from "fs";
import path from "path";
import { RawFleetEvent, FleetEvent, EventType } from "../types/event.types";

function mapEventType(eventType: string): EventType {
  switch (eventType) {
    case "trip_started":
      return EventType.TRIP_STARTED;
    case "trip_ended":
      return EventType.TRIP_ENDED;
    case "trip_cancelled":
      return EventType.TRIP_CANCELLED;
    case "location_ping":
      return EventType.LOCATION_UPDATE;
    case "gps_lost":
      return EventType.GPS_LOST;
    case "device_error":
      return EventType.DEVICE_ERROR;
    case "signal_weak":
      return EventType.SIGNAL_WEAK;
    case "fuel_low":
      return EventType.FUEL_LOW;
    case "stopped":
      return EventType.STOPPED;
    case "idle":
      return EventType.IDLE;
    default:
      return EventType.UNKNOWN;
  }
}

function readAllFiles(): RawFleetEvent[] {
  const dataDir = path.join(__dirname, "../data");
  const files = fs.readdirSync(dataDir);

  let allEvents: RawFleetEvent[] = [];

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(dataDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed: RawFleetEvent[] = JSON.parse(raw);

      allEvents = [...allEvents, ...parsed];
    }
  });

  return allEvents;
}

function extractPlannedDistances(rawEvents: RawFleetEvent[]) {
  const map: Record<string, number> = {};

  rawEvents.forEach((event) => {
    if (
      event.event_type === "trip_started" &&
      event.planned_distance_km !== undefined
    ) {
      map[event.trip_id] = event.planned_distance_km;
    }
  });

  return map;
}

export function loadAndPrepareEvents(): FleetEvent[] {
  const rawEvents = readAllFiles();

  const plannedMap = extractPlannedDistances(rawEvents);

  const normalized: FleetEvent[] = rawEvents.map((event) => {
    return {
      tripId: event.trip_id,
      timestamp: event.timestamp,
      eventType: mapEventType(event.event_type),

      lat: event.location?.lat,
      lng: event.location?.lng,

      speed: event.movement?.speed_kmh,

      distanceTravelled: event.distance_travelled_km,

      plannedDistance: plannedMap[event.trip_id],

      errorMessage: event.error_message,
      severity: event.severity,

      message: event.signal_quality,
    };
  });

  normalized.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  console.log(`Loaded ${normalized.length} events`);

  return normalized;
}
