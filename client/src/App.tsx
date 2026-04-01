import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { useFleetStore } from "./store/fleetStore";
import MapView from "./components/MapView";
import Controls from "./components/Controls";
import Sidebar from "./components/layout/Sidebar";
import Filters from "./components/Filters";
import FleetStatsChart from "./components/charts/FleetStatsChart";

const socket = io("http://localhost:5000");

function App() {
  const { state, applyEvents } = useFleetStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    socket.on("events", applyEvents);
    return () => socket.off("events");
  }, []);

  let trips = Object.values(state.trips);

  if (filter !== "all") {
    trips = trips.filter((t) => t.status === filter);
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl mb-4">Fleet Dashboard</h1>

        <Controls socket={socket} />
        <Filters setFilter={setFilter} />

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800 p-4 rounded">
            <p>Total</p>
            <p>{trips.length}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <p>Above 50%</p>
            <p>{trips.filter((t) => t.progress > 50).length}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <p>Above 80%</p>
            <p>{trips.filter((t) => t.progress > 80).length}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <p>Completed</p>
            <p>{trips.filter((t) => t.status === "completed").length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <MapView trips={trips} />
          <FleetStatsChart trips={trips} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div key={trip.tripId} className="bg-gray-800 p-4 rounded">
              <p>{trip.tripId}</p>
              <p>Status: {trip.status}</p>
              <p>Speed: {trip.speed}</p>

              <p>Progress: {trip.progress.toFixed(1)}%</p>

              <div className="w-full bg-gray-700 h-2 rounded mt-1">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${trip.progress}%` }}
                />
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {trip.currentLocation
                  ? `${trip.currentLocation.lat.toFixed(3)}, ${trip.currentLocation.lng.toFixed(3)}`
                  : "No location"}
              </p>

              {trip.issues.length > 0 && (
                <div className="mt-2">
                  {trip.issues.map((issue, idx) => (
                    <p
                      key={idx}
                      className={`text-sm ${
                        issue.severity === "critical"
                          ? "text-red-500"
                          : issue.severity === "warning"
                            ? "text-yellow-400"
                            : "text-gray-400"
                      }`}
                    >
                      ⚠ {issue.message} ({issue.severity})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
