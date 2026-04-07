import { useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFleetStore } from '../store/fleetStore'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

const ALERT_META = {
  speed_violation    : { icon: '⚡', color: 'text-orange-400' },
  signal_lost        : { icon: '📡', color: 'text-red-400'    },
  signal_recovered   : { icon: '✅', color: 'text-emerald-400'},
  device_error       : { icon: '⚠️', color: 'text-red-400'    },
  battery_low        : { icon: '🔋', color: 'text-yellow-400' },
  fuel_level_low     : { icon: '⛽', color: 'text-orange-400' },
  refueling_started  : { icon: '🔄', color: 'text-blue-400'   },
  refueling_completed: { icon: '✅', color: 'text-emerald-400'},
  trip_cancelled     : { icon: '❌', color: 'text-red-400'    },
  trip_completed     : { icon: '🏁', color: 'text-blue-400'   },
}

const STATUS_STYLES = {
  moving   : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  stopped  : 'bg-yellow-500/15  text-yellow-400  border-yellow-500/25',
  completed: 'bg-blue-500/15    text-blue-400    border-blue-500/25',
  cancelled: 'bg-red-500/15     text-red-400     border-red-500/25',
  pending  : 'bg-gray-500/15    text-gray-400    border-gray-500/25',
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border    : '1px solid rgba(255,255,255,0.07)',
    }} className="rounded-xl p-3.5 flex flex-col gap-1">
      <span className="text-gray-500 text-xs uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold leading-none" style={{ color: color ?? 'white' }}>{value}</span>
    </div>
  )
}

const ChartTooltip = ({ active, payload, color }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background    : 'rgba(10,14,26,0.97)',
      border        : '1px solid rgba(255,255,255,0.1)',
      borderRadius  : 8,
      padding       : '6px 10px',
      backdropFilter: 'blur(12px)',
    }}>
      <span style={{ color }} className="text-xs font-bold">
        {payload[0].value?.toFixed(1)} km/h
      </span>
    </div>
  )
}

function ModalContent({ vehicle, stats, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 w-full max-w-xl max-h-[85vh] overflow-y-auto animate-fade-in-up"
        style={{
          background    : 'rgba(10,14,26,0.99)',
          border        : '1px solid rgba(255,255,255,0.08)',
          borderRadius  : 20,
          padding       : 24,
          boxShadow     : '0 24px 80px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vehicle.color }} />
            <div>
              <h2 className="text-white font-bold text-base leading-none">{vehicle.name}</h2>
              <span className="text-gray-500 text-xs">{vehicle.vehicleId}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[vehicle.status] ?? STATUS_STYLES.pending}`}>
              {vehicle.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px' }}>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Route Progress</span>
            <span className="font-semibold" style={{ color: vehicle.color }}>{stats.progress.toFixed(1)}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)' }} className="w-full h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width     : `${stats.progress}%`,
                background: `linear-gradient(90deg, ${vehicle.color}99, ${vehicle.color})`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1.5">
            <span>{vehicle.distanceTravelled.toFixed(0)} km travelled</span>
            <span>{vehicle.plannedDistance} km planned</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Avg Speed"    value={`${stats.avgSpeed.toFixed(0)} km/h`}  color={vehicle.color} />
          <StatCard label="Max Speed"    value={`${stats.maxSpeed.toFixed(0)} km/h`}  color="#f59e0b"       />
          <StatCard label="Duration"     value={`${stats.durationHrs.toFixed(1)}h`}   color="white"         />
          <StatCard label="Stops"        value={stats.stops}                           color="white"         />
          <StatCard label="Violations"   value={stats.violations}                      color={stats.violations   > 0 ? '#f87171' : 'white'} />
          <StatCard label="Signal Loss"  value={stats.signalLosses}                    color={stats.signalLosses > 0 ? '#fbbf24' : 'white'} />
          <StatCard label="Refuels"      value={stats.refuels}                         color="#3b82f6"       />
          <StatCard label="Fuel Used"    value={stats.fuelUsed != null ? `${stats.fuelUsed.toFixed(0)}%` : '—'} color="#f59e0b" />
          <StatCard label="Total Alerts" value={stats.totalAlerts}                     color={stats.totalAlerts  > 0 ? '#f87171' : 'white'} />
        </div>

        {stats.speedChart.length > 2 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border    : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding   : 16,
          }}>
            <span className="text-gray-500 text-xs uppercase tracking-widest">Speed Profile</span>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={stats.speedChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="i" hide />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip content={<ChartTooltip color={vehicle.color} />} />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke={vehicle.color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {vehicle.alerts.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border    : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding   : 16,
          }}>
            <span className="text-gray-500 text-xs uppercase tracking-widest">Alert History</span>
            <div className="flex flex-col gap-1.5 mt-3">
              {vehicle.alerts.map(alert => {
                const meta = ALERT_META[alert.type] ?? { icon: '•', color: 'text-gray-400' }
                return (
                  <div key={alert.id} className="flex items-center gap-2.5 text-xs">
                    <span>{meta.icon}</span>
                    <span className={`font-semibold ${meta.color}`}>{alert.type.replace(/_/g, ' ')}</span>
                    <span className="text-gray-600 ml-auto">
                      {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsModal({ vehicleId, onClose }) {
  const vehicles  = useFleetStore(s => s.vehicles)
  const vehicle   = vehicles[vehicleId]
  const portalRef = useRef(null)

  useEffect(() => {
    portalRef.current = document.body
  }, [])

  const stats = useMemo(() => {
    if (!vehicle) return null

    const events   = vehicle.allEvents ?? []
    const pings    = events.filter(e => e.event_type === 'location_ping' && e.movement)
    const speeds   = pings.map(e => e.movement.speed_kmh)
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0

    const stops        = events.filter(e => e.event_type === 'vehicle_stopped').length
    const violations   = events.filter(e => e.event_type === 'speed_violation').length
    const signalLosses = events.filter(e => e.event_type === 'signal_lost').length
    const refuels      = events.filter(e => e.event_type === 'refueling_completed').length

    const fuelEvents = events.filter(e => e.telemetry?.fuel_level_percent != null)
    const fuelStart  = fuelEvents[0]?.telemetry?.fuel_level_percent ?? null
    const fuelEnd    = fuelEvents[fuelEvents.length - 1]?.telemetry?.fuel_level_percent ?? null
    const fuelUsed   = fuelStart != null && fuelEnd != null ? fuelStart - fuelEnd : null

    const startTime    = events[0] ? new Date(events[0].timestamp) : null
    const endTime      = events[events.length - 1] ? new Date(events[events.length - 1].timestamp) : null
    const durationMs   = startTime && endTime ? endTime - startTime : 0
    const durationHrs  = durationMs / 1000 / 60 / 60

    const step       = Math.max(1, Math.floor(pings.length / 40))
    const speedChart = pings
      .filter((_, i) => i % step === 0)
      .map((e, i) => ({ i, speed: e.movement.speed_kmh }))

    return {
      avgSpeed, maxSpeed, stops, violations,
      signalLosses, refuels, fuelUsed,
      durationHrs, speedChart,
      totalAlerts: vehicle.alerts.length,
      progress   : vehicle.plannedDistance > 0
        ? Math.min(100, (vehicle.distanceTravelled / vehicle.plannedDistance) * 100)
        : 0,
    }
  }, [vehicle])

  if (!vehicle || !stats || !portalRef.current) return null

  return createPortal(
    <ModalContent vehicle={vehicle} stats={stats} onClose={onClose} />,
    document.body
  )
}