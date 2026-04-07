import { useFleetStore } from '../store/fleetStore'
import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

const STATUS_STYLES = {
  moving   : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  stopped  : 'bg-yellow-500/20  text-yellow-400  border-yellow-500/30',
  completed: 'bg-blue-500/20    text-blue-400    border-blue-500/30',
  cancelled: 'bg-red-500/20     text-red-400     border-red-500/30',
  pending  : 'bg-gray-500/20    text-gray-400    border-gray-500/30',
}

const ALERT_ICONS = {
  speed_violation    : { icon: '⚡', color: 'text-orange-400'  },
  signal_lost        : { icon: '📡', color: 'text-yellow-400'  },
  signal_recovered   : { icon: '✅', color: 'text-emerald-400' },
  device_error       : { icon: '⚠️', color: 'text-red-400'     },
  battery_low        : { icon: '🔋', color: 'text-yellow-400'  },
  fuel_level_low     : { icon: '⛽', color: 'text-orange-400'  },
  refueling_started  : { icon: '🔄', color: 'text-blue-400'    },
  refueling_completed: { icon: '✅', color: 'text-emerald-400' },
  trip_cancelled     : { icon: '❌', color: 'text-red-400'     },
  trip_completed     : { icon: '🏁', color: 'text-blue-400'    },
}

function MiniChart({ data, dataKey, color, label, unit, dangerBelow }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
        <div className="h-16 flex items-center justify-center text-gray-700 text-xs">No data yet</div>
      </div>
    )
  }

  const latest = data[data.length - 1]?.[dataKey] ?? 0

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {typeof latest === 'number' ? latest.toFixed(0) : latest}{unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={data}>
          <YAxis domain={['auto', 'auto']} hide />
          <XAxis dataKey="time" hide />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#6b7280' }}
            itemStyle={{ color }}
            formatter={v => [`${v.toFixed(1)}${unit}`, label]}
            labelFormatter={() => ''}
          />
          {dangerBelow && (
            <ReferenceLine y={dangerBelow} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DetailPanel() {
  const selectedVehicleId = useFleetStore(s => s.selectedVehicleId)
  const vehicles          = useFleetStore(s => s.vehicles)
  const setSelected       = useFleetStore(s => s.setSelectedVehicle)
  const virtualNow        = useFleetStore(s => s.virtualNow)

  const [speedHistory, setSpeedHistory] = useState([])
  const [fuelHistory,  setFuelHistory]  = useState([])

  const vehicle = selectedVehicleId ? vehicles[selectedVehicleId] : null

  useEffect(() => {
    setSpeedHistory([])
    setFuelHistory([])
  }, [selectedVehicleId])

  useEffect(() => {
    if (!vehicle || !virtualNow) return

    const timeLabel = virtualNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    if (vehicle.speed_kmh != null) {
      setSpeedHistory(prev => {
        const next = [...prev, { time: timeLabel, speed: vehicle.speed_kmh }]
        return next.length > 60 ? next.slice(-60) : next
      })
    }

    if (vehicle.fuelLevel != null) {
      setFuelHistory(prev => {
        const next = [...prev, { time: timeLabel, fuel: vehicle.fuelLevel }]
        return next.length > 60 ? next.slice(-60) : next
      })
    }
  }, [vehicle?.speed_kmh, vehicle?.fuelLevel, virtualNow])

  if (!vehicle) return null

  const progress = vehicle.plannedDistance > 0
    ? Math.min(100, (vehicle.distanceTravelled / vehicle.plannedDistance) * 100)
    : 0

  const statusStyle = STATUS_STYLES[vehicle.status] ?? STATUS_STYLES.pending

  return (
    <div className="border-b border-gray-800 bg-gray-950 flex flex-col shrink-0" style={{ maxHeight: '55vh', overflowY: 'auto' }}>

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: vehicle.color }} />
          <span className="text-sm font-bold text-white">{vehicle.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyle}`}>
            {vehicle.status}
          </span>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="text-gray-600 hover:text-white text-lg leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Route Progress</span>
          <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: vehicle.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{vehicle.distanceTravelled.toFixed(0)} km travelled</span>
          <span>{vehicle.plannedDistance} km planned</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-gray-800 mx-4 mt-3 rounded-xl overflow-hidden">
        {[
          { label: 'Speed',   value: `${vehicle.speed_kmh.toFixed(0)} km/h`, alert: vehicle.overspeed },
          { label: 'Battery', value: vehicle.batteryLevel != null ? `${vehicle.batteryLevel.toFixed(0)}%` : '—', alert: vehicle.batteryLevel != null && vehicle.batteryLevel < 15 },
          { label: 'Signal',  value: vehicle.signalQuality ?? '—', alert: false },
        ].map(({ label, value, alert }) => (
          <div key={label} className="bg-gray-900 px-3 py-2 flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-sm font-bold ${alert ? 'text-red-400' : 'text-white'}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <MiniChart
          data={speedHistory}
          dataKey="speed"
          color={vehicle.color}
          label="Speed"
          unit=" km/h"
        />
        <MiniChart
          data={fuelHistory}
          dataKey="fuel"
          color="#f59e0b"
          label="Fuel Level"
          unit="%"
          dangerBelow={15}
        />
      </div>

      {vehicle.alerts.length > 0 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Alert History</div>
          <div className="flex flex-col gap-1">
            {vehicle.alerts.map(alert => {
              const cfg = ALERT_ICONS[alert.type] ?? { icon: '•', color: 'text-gray-400' }
              return (
                <div key={alert.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-800/40">
                  <span>{cfg.icon}</span>
                  <span className={`font-medium ${cfg.color}`}>{alert.type.replace(/_/g, ' ')}</span>
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
  )
}