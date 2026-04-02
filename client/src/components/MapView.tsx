import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import type { TripState } from "../domain/types";
import { useEffect, useRef, useState } from "react";

const containerStyle = { width: "100%", height: "500px" };
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

type Props = { trips: TripState[] };

const colors = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];
function getTripColor(tripId: string) {
  let hash = 0;
  for (let i = 0; i < tripId.length; i++) {
    hash = tripId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MapView({ trips }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const prevTripCountRef = useRef(0);

  const [animatedPositions, setAnimatedPositions] = useState<
    Record<string, { lat: number; lng: number }>
  >({});

  const onLoad = (map: google.maps.Map) => { mapRef.current = map; };

  useEffect(() => {
    if (!mapRef.current) return;
    const valid = trips.filter((t) => t.currentLocation);
    const count = valid.length;

    if (count === prevTripCountRef.current) return;
    prevTripCountRef.current = count;

    if (count === 1) {
      mapRef.current.setCenter(valid[0].currentLocation!);
      mapRef.current.setZoom(12);
      return;
    }
    if (count > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      valid.forEach((t) => bounds.extend(t.currentLocation!));
      mapRef.current.fitBounds(bounds);
    }
  }, [trips]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPositions((prev) => {
        const next = { ...prev };

        trips.forEach((trip) => {
          if (!trip.currentLocation) return;

          const target = trip.currentLocation;
          const current = prev[trip.tripId] || target;

          const factor = 0.2;
          next[trip.tripId] = {
            lat: current.lat + (target.lat - current.lat) * factor,
            lng: current.lng + (target.lng - current.lng) * factor,
          };
        });

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [trips]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={4}
      onLoad={onLoad}
    >
      {trips.map((trip) => {
        const pos = animatedPositions[trip.tripId];
        if (!pos) return null;

        return (
          <div key={trip.tripId}>
            <Marker position={pos} />

            {trip.path.length > 0 && (
              <Polyline
                path={trip.path}
                options={{
                  strokeColor: getTripColor(trip.tripId),
                  strokeOpacity: 1,
                  strokeWeight: 4,
                }}
              />
            )}
          </div>
        );
      })}
    </GoogleMap>
  );
}
