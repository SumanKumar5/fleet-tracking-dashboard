const TRIP_FILES = [
  {
    file: "trip_1_cross_country.json",
    name: "Cross Country Long Haul",
    color: "#10b981",
  },
  {
    file: "trip_2_urban_dense.json",
    name: "Urban Dense Delivery",
    color: "#3b82f6",
  },
  {
    file: "trip_3_mountain_cancelled.json",
    name: "Mountain Route Cancelled",
    color: "#ef4444",
  },
  {
    file: "trip_4_southern_technical.json",
    name: "Southern Technical Issues",
    color: "#f59e0b",
  },
  {
    file: "trip_5_regional_logistics.json",
    name: "Regional Logistics",
    color: "#8b5cf6",
  },
];

function decimateEvents(events) {
  const special = events.filter((e) => e.event_type !== "location_ping");
  const pings = events.filter((e) => e.event_type === "location_ping");

  if (pings.length <= 800) return events;

  const step = Math.ceil(pings.length / 800);
  const thinned = pings.filter((_, i) => i % step === 0);

  return [...special, ...thinned].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
}

export function extractFullRoute(events) {
  return events
    .filter((e) => e.event_type === "location_ping" && e.location?.lat)
    .map((e) => [e.location.lat, e.location.lng]);
}

export async function loadAllTrips() {
  const trips = await Promise.all(
    TRIP_FILES.map(async (meta, index) => {
      const res = await fetch(`/data/${meta.file}`);
      const events = await res.json();
      const decimated = decimateEvents(events);

      return {
        tripIndex: index + 1,
        vehicleId: events[0]?.vehicle_id,
        tripId: events[0]?.trip_id,
        name: meta.name,
        color: meta.color,
        allEvents: decimated,
        totalEvents: decimated.length,
        startTime: new Date(decimated[0]?.timestamp),
        endTime: new Date(decimated[decimated.length - 1]?.timestamp),
        plannedDistanceKm: events[0]?.planned_distance_km ?? null,
        fullRoute: extractFullRoute(events),
      };
    }),
  );

  const masterStream = trips
    .flatMap((trip) =>
      trip.allEvents.map((event) => ({
        ...event,
        _tripMeta: {
          tripIndex: trip.tripIndex,
          name: trip.name,
          color: trip.color,
          vehicleId: trip.vehicleId,
        },
      })),
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const globalStart = new Date(Math.min(...trips.map((t) => t.startTime)));
  const globalEnd = new Date(Math.max(...trips.map((t) => t.endTime)));

  return { trips, masterStream, globalStart, globalEnd };
}
