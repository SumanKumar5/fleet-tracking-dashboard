import { create } from "zustand";

const INITIAL_VEHICLE = {
  vehicleId: null,
  name: "",
  color: "#fff",
  status: "pending",
  location: null,
  prevLocation: null,
  speed_kmh: 0,
  heading: 0,
  distanceTravelled: 0,
  plannedDistance: 0,
  fuelLevel: null,
  batteryLevel: null,
  signalQuality: null,
  overspeed: false,
  trail: [],
  alerts: [],
  eventCount: 0,
  fullRoute: [],
};

const ALERT_SEVERITY = {
  trip_cancelled: "critical",
  device_error: "critical",
  signal_lost: "critical",
  battery_low: "warning",
  fuel_level_low: "warning",
  speed_violation: "warning",
  signal_recovered: "info",
  refueling_started: "info",
  refueling_completed: "info",
  trip_completed: "info",
};

const ALERT_TYPES = new Set(Object.keys(ALERT_SEVERITY));

export const useFleetStore = create((set, get) => ({
  trips: [],
  masterStream: [],
  globalStart: null,
  globalEnd: null,
  isLoaded: false,
  selectedVehicleId: null,
  hoveredVehicleId: null,

  vehicles: {},
  virtualNow: null,
  eventCursor: 0,
  isPlaying: false,
  playbackSpeed: 10,
  alertFeed: [],
  toasts: [],

  setData({ trips, masterStream, globalStart, globalEnd }) {
    const vehicles = {};
    trips.forEach((trip) => {
      vehicles[trip.vehicleId] = {
        ...INITIAL_VEHICLE,
        vehicleId: trip.vehicleId,
        name: trip.name,
        color: trip.color,
        plannedDistance: trip.plannedDistanceKm,
        tripIndex: trip.tripIndex,
        allEvents: trip.allEvents,
        fullRoute: trip.fullRoute ?? [],
      };
    });
    set({
      trips,
      masterStream,
      globalStart,
      globalEnd,
      vehicles,
      virtualNow: new Date(globalStart),
      eventCursor: 0,
      isLoaded: true,
    });
  },

  setPlaying(val) {
    set({ isPlaying: val });
  },
  setSpeed(val) {
    set({ playbackSpeed: val });
  },
  setSelectedVehicle(id) {
    set({ selectedVehicleId: id });
  },
  setHoveredVehicle(id) {
    set({ hoveredVehicleId: id });
  },

  processEvents(events, virtualNowISO, eventCursor) {
    const { vehicles, alertFeed, toasts } = get();
    const newVehicles = { ...vehicles };
    const newAlerts = [...alertFeed];
    const newToasts = [...toasts];

    events.forEach((event) => {
      const vid = event.vehicle_id;
      if (!newVehicles[vid]) return;

      const v = { ...newVehicles[vid] };

      if (event.location?.lat != null) {
        v.prevLocation = v.location;
        v.location = { lat: event.location.lat, lng: event.location.lng };
        if (
          event.event_type === "location_ping" ||
          event.event_type === "trip_started"
        ) {
          v.trail = [...v.trail, [event.location.lat, event.location.lng]];
          if (v.trail.length > 500) v.trail = v.trail.slice(-500);
        }
      }

      if (event.movement) {
        v.speed_kmh = event.movement.speed_kmh;
        v.heading = event.movement.heading_degrees;
        v.overspeed = event.overspeed ?? false;
      }

      if (event.distance_travelled_km != null)
        v.distanceTravelled = event.distance_travelled_km;
      if (event.device) v.batteryLevel = event.device.battery_level;
      if (event.signal_quality) v.signalQuality = event.signal_quality;
      if (event.telemetry?.fuel_level_percent != null)
        v.fuelLevel = event.telemetry.fuel_level_percent;
      if (event.fuel_level_percent != null)
        v.fuelLevel = event.fuel_level_percent;

      if (event.event_type === "trip_started") v.status = "moving";
      if (event.event_type === "vehicle_stopped") v.status = "stopped";
      if (event.event_type === "vehicle_moving") v.status = "moving";
      if (event.event_type === "trip_completed") v.status = "completed";
      if (event.event_type === "trip_cancelled") v.status = "cancelled";

      v.eventCount++;

      if (ALERT_TYPES.has(event.event_type)) {
        const severity = ALERT_SEVERITY[event.event_type];
        const alert = {
          id: event.event_id,
          type: event.event_type,
          severity,
          timestamp: event.timestamp,
          vehicleId: vid,
          vehicleName: v.name,
          color: v.color,
          details: event,
        };

        newAlerts.unshift(alert);
        if (newAlerts.length > 200) newAlerts.length = 200;
        v.alerts = [alert, ...v.alerts].slice(0, 50);

        if (severity === "critical" || severity === "warning") {
          const toast = {
            id: `toast_${event.event_id}`,
            type: event.event_type,
            severity,
            message: event.event_type.replace(/_/g, " "),
            vehicle: v.name,
            color: v.color,
            timestamp: Date.now(),
          };
          newToasts.push(toast);
          if (newToasts.length > 5) newToasts.shift();
        }
      }

      newVehicles[vid] = v;
    });

    set({
      vehicles: newVehicles,
      alertFeed: newAlerts,
      toasts: newToasts,
      virtualNow: new Date(virtualNowISO),
      eventCursor,
    });
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  reset() {
    const { globalStart, vehicles } = get();
    const resetVehicles = {};
    Object.values(vehicles).forEach((v) => {
      resetVehicles[v.vehicleId] = {
        ...INITIAL_VEHICLE,
        vehicleId: v.vehicleId,
        name: v.name,
        color: v.color,
        plannedDistance: v.plannedDistance,
        tripIndex: v.tripIndex,
        allEvents: v.allEvents,
        fullRoute: v.fullRoute,
      };
    });
    set({
      vehicles: resetVehicles,
      virtualNow: new Date(globalStart),
      eventCursor: 0,
      isPlaying: false,
      alertFeed: [],
      toasts: [],
    });
  },
}));
