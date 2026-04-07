import { useState } from "react";
import { useFleetStore } from "../store/fleetStore";
import DetailPanel from "./DetailPanel";
import StatsModal from "./StatsModal";

const STATUS_STYLES = {
  moving: {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dot: "#10b981",
  },
  stopped: {
    badge: "bg-yellow-500/15  text-yellow-400  border-yellow-500/25",
    dot: "#f59e0b",
  },
  completed: {
    badge: "bg-blue-500/15    text-blue-400    border-blue-500/25",
    dot: "#3b82f6",
  },
  cancelled: {
    badge: "bg-red-500/15     text-red-400     border-red-500/25",
    dot: "#ef4444",
  },
  pending: {
    badge: "bg-gray-500/15    text-gray-400    border-gray-500/25",
    dot: "#6b7280",
  },
};

const ALERT_META = {
  speed_violation: {
    icon: "⚡",
    color: "text-orange-400",
    bg: "rgba(249,115,22,0.08)",
    severity: "warning",
    severityColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  signal_lost: {
    icon: "📡",
    color: "text-red-400",
    bg: "rgba(239,68,68,0.08)",
    severity: "critical",
    severityColor: "bg-red-500/20    text-red-400    border-red-500/30",
  },
  signal_recovered: {
    icon: "✅",
    color: "text-emerald-400",
    bg: "rgba(16,185,129,0.08)",
    severity: "info",
    severityColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  device_error: {
    icon: "⚠️",
    color: "text-red-400",
    bg: "rgba(239,68,68,0.08)",
    severity: "critical",
    severityColor: "bg-red-500/20    text-red-400    border-red-500/30",
  },
  battery_low: {
    icon: "🔋",
    color: "text-yellow-400",
    bg: "rgba(234,179,8,0.08)",
    severity: "warning",
    severityColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  fuel_level_low: {
    icon: "⛽",
    color: "text-orange-400",
    bg: "rgba(249,115,22,0.08)",
    severity: "warning",
    severityColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  refueling_started: {
    icon: "🔄",
    color: "text-blue-400",
    bg: "rgba(59,130,246,0.08)",
    severity: "info",
    severityColor: "bg-blue-500/20   text-blue-400   border-blue-500/30",
  },
  refueling_completed: {
    icon: "✅",
    color: "text-emerald-400",
    bg: "rgba(16,185,129,0.08)",
    severity: "info",
    severityColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  trip_cancelled: {
    icon: "❌",
    color: "text-red-400",
    bg: "rgba(239,68,68,0.08)",
    severity: "critical",
    severityColor: "bg-red-500/20    text-red-400    border-red-500/30",
  },
  trip_completed: {
    icon: "🏁",
    color: "text-blue-400",
    bg: "rgba(59,130,246,0.08)",
    severity: "info",
    severityColor: "bg-blue-500/20   text-blue-400   border-blue-500/30",
  },
};

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{ background: "rgba(255,255,255,0.06)" }}
      className="w-full h-1 rounded-full overflow-hidden"
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
        }}
      />
    </div>
  );
}

function TripCard({ vehicle, onViewStats }) {
  const selectedVehicleId = useFleetStore((s) => s.selectedVehicleId);
  const setSelected = useFleetStore((s) => s.setSelectedVehicle);
  const setHovered = useFleetStore((s) => s.setHoveredVehicle);

  const isSelected = selectedVehicleId === vehicle.vehicleId;
  const style = STATUS_STYLES[vehicle.status] ?? STATUS_STYLES.pending;
  const progress =
    vehicle.plannedDistance > 0
      ? Math.min(
          100,
          (vehicle.distanceTravelled / vehicle.plannedDistance) * 100,
        )
      : 0;

  return (
    <div
      onClick={() => setSelected(isSelected ? null : vehicle.vehicleId)}
      onMouseEnter={() => setHovered(vehicle.vehicleId)}
      onMouseLeave={() => setHovered(null)}
      className="cursor-pointer rounded-xl p-3 transition-all duration-200 animate-fade-in-up"
      style={{
        background: isSelected
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.025)",
        border: isSelected
          ? `1px solid ${style.dot}40`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isSelected ? `0 0 16px ${style.dot}12` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: style.dot }}
            />
            {vehicle.status === "moving" && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: style.dot, opacity: 0.4 }}
              />
            )}
          </div>
          <span className="text-xs font-semibold text-white truncate">
            {vehicle.name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}
          >
            {vehicle.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewStats(vehicle.vehicleId);
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md transition-all"
          >
            ↗
          </button>
        </div>
      </div>

      <ProgressBar
        value={vehicle.distanceTravelled}
        max={vehicle.plannedDistance}
        color={vehicle.color}
      />

      <div className="flex justify-between mt-1.5 mb-2.5">
        <span className="text-gray-600 text-xs">
          {vehicle.distanceTravelled.toFixed(0)} km
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: progress > 0 ? vehicle.color : "#4b5563" }}
        >
          {progress.toFixed(0)}%
        </span>
        <span className="text-gray-600 text-xs">
          {vehicle.plannedDistance} km
        </span>
      </div>

      <div
        style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8 }}
        className="grid grid-cols-2 gap-px overflow-hidden"
      >
        {[
          {
            label: "Speed",
            value: `${vehicle.speed_kmh.toFixed(0)} km/h`,
            alert: vehicle.overspeed,
          },
          {
            label: "Signal",
            value: vehicle.signalQuality ?? "—",
            alert: false,
          },
          {
            label: "Fuel",
            value:
              vehicle.fuelLevel != null
                ? `${vehicle.fuelLevel.toFixed(0)}%`
                : "—",
            alert: vehicle.fuelLevel != null && vehicle.fuelLevel < 15,
          },
          {
            label: "Battery",
            value:
              vehicle.batteryLevel != null
                ? `${vehicle.batteryLevel.toFixed(0)}%`
                : "—",
            alert: vehicle.batteryLevel != null && vehicle.batteryLevel < 15,
          },
        ].map(({ label, value, alert }) => (
          <div
            key={label}
            style={{ background: "rgba(6,9,16,0.6)" }}
            className="px-2.5 py-1.5 flex flex-col gap-0.5"
          >
            <span className="text-gray-600 text-xs">{label}</span>
            <span
              className={`text-xs font-semibold ${alert ? "text-red-400" : value === "—" ? "text-gray-700" : "text-white"}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


function AlertFeed() {
  const alertFeed = useFleetStore((s) => s.alertFeed);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = alertFeed.filter((a) => {
    if (filter === "all") return true;
    if (filter === "critical") return a.severity === "critical";
    if (filter === "warning") return a.severity === "warning";
    if (filter === "info") return a.severity === "info";
    return true;
  });

  const counts = {
    critical: alertFeed.filter((a) => a.severity === "critical").length,
    warning: alertFeed.filter((a) => a.severity === "warning").length,
    info: alertFeed.filter((a) => a.severity === "info").length,
  };

  const ITEM_HEIGHT = 58;
  const COLLAPSED_MAX = 2;
  const collapsedItems = filtered.slice(0, COLLAPSED_MAX);

  return (
    <div
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      className="shrink-0 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Alerts
          </span>
          {alertFeed.length > 0 && (
            <span
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
              className="text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none"
            >
              {alertFeed.length}
            </span>
          )}
        </div>
        {filtered.length > COLLAPSED_MAX && (
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg transition-all font-medium"
          >
            {expanded ? "↑ Collapse" : `↓ All ${filtered.length}`}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 pb-2">
        {[
          { key: "all", label: "All", count: alertFeed.length },
          { key: "critical", label: "Critical", count: counts.critical },
          { key: "warning", label: "Warning", count: counts.warning },
          { key: "info", label: "Info", count: counts.info },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="text-xs px-2 py-0.5 rounded-md font-medium transition-all duration-150"
            style={{
              background:
                filter === key ? "rgba(255,255,255,0.1)" : "transparent",
              color: filter === key ? "white" : "#6b7280",
              border:
                filter === key
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid transparent",
            }}
          >
            {label} {count > 0 && <span className="opacity-60">{count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-700 text-xs py-5 flex flex-col items-center gap-2 pb-3">
          <span className="text-2xl">🟢</span>
          <span>No alerts yet</span>
        </div>
      )}

      {!expanded && filtered.length > 0 && (
        <div className="flex flex-col gap-1 pb-3">
          {collapsedItems.map((alert, i) => {
            const meta = ALERT_META[alert.type] ?? {
              icon: "•",
              color: "text-gray-400",
              bg: "rgba(255,255,255,0.04)",
              severityColor: "",
            };
            return (
              <div
                key={alert.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg mx-3 animate-fade-in-up"
                style={{
                  background: meta.bg,
                  border: "1px solid rgba(255,255,255,0.05)",
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <span className="text-sm shrink-0">{meta.icon}</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-xs font-semibold ${meta.color}`}>
                    {alert.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-600 truncate">
                    {alert.vehicleName}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full border font-medium leading-none ${meta.severityColor}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-700">
                    {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && filtered.length > 0 && (
        <List
          height={Math.min(filtered.length * ITEM_HEIGHT, 300)}
          itemCount={filtered.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
          itemData={{ items: filtered }}
          style={{ paddingBottom: 8 }}
        >
          {AlertRow}
        </List>
      )}
    </div>
  );
}

export default function Sidebar() {
  const vehicles    = useFleetStore(s => s.vehicles)
  const vehicleList = Object.values(vehicles).sort((a, b) => a.tripIndex - b.tripIndex)
  const [statsVehicleId, setStatsVehicleId] = useState(null)
  const [collapsed, setCollapsed]           = useState(false)

  if (collapsed) {
    return (
      <div
        style={{
          width        : '52px',
          height       : '100%',
          display      : 'flex',
          flexDirection: 'column',
          alignItems   : 'center',
          background   : 'rgba(6,9,16,0.92)',
          borderLeft   : '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          paddingTop   : 12,
          gap          : 8,
        }}
        className="shrink-0"
      >
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Expand sidebar"
        >
          ◀
        </button>

        <div style={{ width: '1px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

        {vehicleList.map(v => {
          const style = STATUS_STYLES[v.status] ?? STATUS_STYLES.pending
          return (
            <div
              key={v.vehicleId}
              title={`${v.name} · ${v.status}`}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: `${style.dot}18`,
                border    : `1px solid ${style.dot}35`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.dot }} />
              {v.status === 'moving' && (
                <div
                  className="absolute inset-0 rounded-lg animate-ping"
                  style={{ backgroundColor: style.dot, opacity: 0.15 }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      width         : '288px',
      height        : '100%',
      display       : 'flex',
      flexDirection : 'column',
      background    : 'rgba(6,9,16,0.92)',
      borderLeft    : '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    }} className="shrink-0">

      <DetailPanel />

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-2.5 shrink-0 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Fleet</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-600 hover:text-white transition-all text-xs px-2 py-1 rounded-md"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          title="Collapse sidebar"
        >
          ▶
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div className="absolute inset-0 overflow-y-auto flex flex-col gap-2 p-3">
          {vehicleList.map(v => (
            <TripCard key={v.vehicleId} vehicle={v} onViewStats={setStatsVehicleId} />
          ))}
        </div>
        <div style={{
          position      : 'absolute',
          bottom        : 0,
          left          : 0,
          right         : 0,
          height        : '32px',
          background    : 'linear-gradient(to top, rgba(6,9,16,0.9), transparent)',
          pointerEvents : 'none',
        }} />
      </div>

      <AlertFeed />

      {statsVehicleId && (
        <StatsModal
          vehicleId={statsVehicleId}
          onClose={() => setStatsVehicleId(null)}
        />
      )}
    </div>
  )
}
