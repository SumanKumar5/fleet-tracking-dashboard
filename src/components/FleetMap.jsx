import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useFleetStore } from "../store/fleetStore";
import { useInterpolatedVehicles } from "../hooks/useInterpolatedVehicles";
import L from "leaflet";

function createVehicleIcon(color, status, heading) {
  const isInactive =
    status === "completed" || status === "cancelled" || status === "pending";
  const opacity = isInactive ? 0.45 : 1;
  const size = 36;

  const pulseRing =
    status === "moving"
      ? `
    <circle cx="17" cy="17" r="15" fill="none" stroke="${color}" stroke-width="2" opacity="0.3">
      <animate attributeName="r" from="13" to="20" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite"/>
    </circle>
  `
      : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 34">
      ${pulseRing}
      <circle cx="17" cy="17" r="13" fill="${color}" opacity="${opacity}"/>
      <circle cx="17" cy="17" r="8" fill="rgba(0,0,0,0.35)"/>
      <polygon points="17,7 20.5,16 17,13.5 13.5,16"
        fill="white" opacity="${opacity}"
        transform="rotate(${heading}, 17, 17)"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController({ vehicles }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current) return;

    const locations = Object.values(vehicles)
      .filter((v) => v.location)
      .map((v) => [v.location.lat, v.location.lng]);

    if (locations.length >= 2) {
      const bounds = L.latLngBounds(locations);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 7 });
      hasFit.current = true;
    }
  }, [vehicles]);

  return null;
}

export default function FleetMap() {
  const isLoaded = useFleetStore((s) => s.isLoaded);
  const selectedVehicleId = useFleetStore((s) => s.selectedVehicleId);
  const hoveredVehicleId = useFleetStore((s) => s.hoveredVehicleId);
  const setSelected = useFleetStore((s) => s.setSelectedVehicle);
  const rawVehicles = useFleetStore((s) => s.vehicles);
  const vehicles = useInterpolatedVehicles();

  if (!isLoaded) return null;

  const vehicleList = Object.values(vehicles);

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController vehicles={vehicles} />

      {vehicleList.map((vehicle) => {
        if (!vehicle.location) return null;

        const isSelected = selectedVehicleId === vehicle.vehicleId;
        const trailColor =
          vehicle.status === "cancelled" ? "#ef4444" : vehicle.color;
        const rawVehicle = rawVehicles[vehicle.vehicleId];

        return (
          <div key={vehicle.vehicleId}>
            {rawVehicle?.trail?.length > 1 && (
              <Polyline
                positions={rawVehicle.trail}
                pathOptions={{
                  color: trailColor,
                  weight: isSelected ? 3 : 1.5,
                  opacity: isSelected ? 0.9 : 0.45,
                }}
              />
            )}

            {hoveredVehicleId === vehicle.vehicleId &&
              rawVehicle?.fullRoute?.length > 1 && (
                <Polyline
                  positions={rawVehicle.fullRoute}
                  pathOptions={{
                    color: vehicle.color,
                    weight: 2,
                    opacity: 0.25,
                    dashArray: "6 8",
                  }}
                />
              )}
            <Marker
              position={[vehicle.location.lat, vehicle.location.lng]}
              icon={createVehicleIcon(
                vehicle.color,
                vehicle.status,
                vehicle.heading,
              )}
              eventHandlers={{
                click: () =>
                  setSelected(
                    selectedVehicleId === vehicle.vehicleId
                      ? null
                      : vehicle.vehicleId,
                  ),
              }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -18]}>
                <div className="font-semibold text-xs">{vehicle.name}</div>
                <div className="text-gray-400 text-xs">
                  {vehicle.speed_kmh.toFixed(0)} km/h · {vehicle.status}
                </div>
              </Tooltip>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}
