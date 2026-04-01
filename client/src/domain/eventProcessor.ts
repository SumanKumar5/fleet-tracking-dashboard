import type { FleetState, TripState } from "./types";

function createInitialTrip(tripId: string): TripState {
  return {
    tripId,
    status: "idle",
    currentLocation: null,
    path: [],
    speed: 0,
    issues: [],
    lastUpdated: "",

    distanceTravelled: 0,
    plannedDistance: 0,
    progress: 0,
  };
}

export function processEvent(state: FleetState, event: any): FleetState {
  const existingTrip = state.trips[event.tripId];
  const trip = existingTrip || createInitialTrip(event.tripId);

  switch (event.eventType) {
    case "LOCATION_UPDATE":
      if (event.lat !== undefined && event.lng !== undefined) {
        const newPoint = {
          lat: event.lat,
          lng: event.lng,
        };

        trip.currentLocation = newPoint;
        trip.path = [...trip.path, newPoint];
      }

      trip.speed = event.speed || 0;

      if (event.distanceTravelled !== undefined) {
        trip.distanceTravelled = event.distanceTravelled;
      }

      if (trip.plannedDistance === 0 && event.plannedDistance !== undefined) {
        trip.plannedDistance = event.plannedDistance;
      }

      if (trip.plannedDistance > 0) {
        trip.progress = Math.min(
          (trip.distanceTravelled / trip.plannedDistance) * 100,
          100,
        );
      }

      if (trip.progress >= 100) {
        trip.status = "completed";
      } else if (trip.status !== "completed") {
        trip.status = "active";
      }
      break;

    case "TRIP_STARTED":
      trip.status = "active";
      if (event.plannedDistance !== undefined) {
        trip.plannedDistance = event.plannedDistance;
      }
      break;

    case "TRIP_ENDED":
      trip.status = "completed";
      trip.progress = 100;
      break;

    case "TRIP_CANCELLED":
      trip.status = "cancelled";
      break;

    case "DEVICE_ERROR":
      trip.status = "issue";

      const errorMsg = event.errorMessage || "Unknown device error";
      const severity = event.severity || "warning";

      trip.issues = [
        ...trip.issues.filter((i) => i.message !== errorMsg),
        { message: errorMsg, severity },
      ];

      break;

    case "GPS_LOST":
      trip.issues = [
        ...trip.issues.filter((i) => i.message !== "GPS lost"),
        { message: "GPS lost", severity: "warning" },
      ];
      break;

    case "FUEL_LOW":
      trip.issues = [
        ...trip.issues.filter((i) => i.message !== "Fuel low"),
        { message: "Fuel low", severity: "warning" },
      ];
      break;
  }

  trip.lastUpdated = event.timestamp;

  return {
    ...state,
    trips: {
      ...state.trips,
      [trip.tripId]: trip,
    },
  };
}
