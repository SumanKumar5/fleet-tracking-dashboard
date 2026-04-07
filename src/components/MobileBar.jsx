import { useState } from 'react'
import { useFleetStore } from '../store/fleetStore'
import { useBreakpoint } from '../hooks/useBreakpoint'

const ALERT_META = {
  speed_violation    : { icon: '⚡', color: 'text-orange-500', bg: 'rgba(249,115,22,0.08)',  severityColor: 'bg-orange-500/15 text-orange-500 border-orange-500/25' },
  signal_lost        : { icon: '📡', color: 'text-red-500',    bg: 'rgba(239,68,68,0.08)',   severityColor: 'bg-red-500/15    text-red-500    border-red-500/25'    },
  signal_recovered   : { icon: '✅', color: 'text-emerald-500',bg: 'rgba(16,185,129,0.08)',  severityColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' },
  device_error       : { icon: '⚠️', color: 'text-red-500',    bg: 'rgba(239,68,68,0.08)',   severityColor: 'bg-red-500/15    text-red-500    border-red-500/25'    },
  battery_low        : { icon: '🔋', color: 'text-yellow-500', bg: 'rgba(234,179,8,0.08)',   severityColor: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/25' },
  fuel_level_low     : { icon: '⛽', color: 'text-orange-500', bg: 'rgba(249,115,22,0.08)',  severityColor: 'bg-orange-500/15 text-orange-500 border-orange-500/25' },
  refueling_started  : { icon: '🔄', color: 'text-blue-500',   bg: 'rgba(59,130,246,0.08)',  severityColor: 'bg-blue-500/15   text-blue-500   border-blue-500/25'   },
  refueling_completed: { icon: '✅', color: 'text-emerald-500',bg: 'rgba(16,185,129,0.08)',  severityColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' },
  trip_cancelled     : { icon: '❌', color: 'text-red-500',    bg: 'rgba(239,68,68,0.08)',   severityColor: 'bg-red-500/15    text-red-500    border-red-500/25'    },
  trip_completed     : { icon: '🏁', color: 'text-blue-500',   bg: 'rgba(59,130,246,0.08)',  severityColor: 'bg-blue-500/15   text-blue-500   border-blue-500/25'   },
}

const STATUS_STYLES = {
  moving   : { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: '#10b981' },
  stopped  : { badge: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/25',  dot: '#f59e0b' },
  completed: { badge: 'bg-blue-500/15    text-blue-400    border-blue-500/25',    dot: '#3b82f6' },
  cancelled: { badge: 'bg-red-500/15     text-red-400     border-red-500/25',     dot: '#ef4444' },
  pending  : { badge: 'bg-gray-500/15    text-gray-400    border-gray-500/25',    dot: '#6b7280' },
}

function MobileTripCard({ vehicle }) {
  const selectedVehicleId = useFleetStore(s => s.selectedVehicleId)
  const setSelected       = useFleetStore(s => s.setSelectedVehicle)
  const isSelected        = selectedVehicleId === vehicle.vehicleId
  const style             = STATUS_STYLES[vehicle.status] ?? STATUS_STYLES.pending
  const progress          = vehicle.plannedDistance > 0
    ? Math.min(100, (vehicle.distanceTravelled / vehicle.plannedDistance) * 100)
    : 0

  return (
    <div
      onClick={() => setSelected(isSelected ? null : vehicle.vehicleId)}
      className="rounded-xl p-3 cursor-pointer transition-all"
      style={{
        background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
        border    : isSelected ? `1px solid ${style.dot}50` : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: style.dot }} />
            {vehicle.status === 'moving' && (
              <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: style.dot, opacity: 0.4 }} />
            )}
          </div>
          <span className="text-xs font-semibold text-white truncate">{vehicle.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2 ${style.badge}`}>
          {vehicle.status}
        </span>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.06)' }} className="w-full h-1 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${vehicle.color}99, ${vehicle.color})` }}
        />
      </div>

      <div className="flex justify-between mb-2">
        <span className="text-xs text-gray-600">{vehicle.distanceTravelled.toFixed(0)} km</span>
        <span className="text-xs font-semibold" style={{ color: progress > 0 ? vehicle.color : '#4b5563' }}>
          {progress.toFixed(0)}%
        </span>
        <span className="text-xs text-gray-600">{vehicle.plannedDistance} km</span>
      </div>

      <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { label: 'Speed',  value: `${vehicle.speed_kmh.toFixed(0)} km/h`, alert: vehicle.overspeed },
          { label: 'Signal', value: vehicle.signalQuality ?? '—',           alert: false             },
        ].map(({ label, value, alert }) => (
          <div key={label} style={{ background: 'rgba(6,9,16,0.6)' }} className="px-2.5 py-1.5">
            <span className="text-xs text-gray-600 block">{label}</span>
            <span className={`text-xs font-semibold capitalize ${alert ? 'text-red-400' : 'text-white'}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FleetSheet({ onClose }) {
  const vehicles    = useFleetStore(s => s.vehicles)
  const vehicleList = Object.values(vehicles).sort((a, b) => a.tripIndex - b.tripIndex)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live Fleet</span>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-white transition-colors">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-3">
        {vehicleList.map(v => (
          <MobileTripCard key={v.vehicleId} vehicle={v} />
        ))}
      </div>
    </div>
  )
}

function AlertsSheet({ onClose }) {
  const alertFeed           = useFleetStore(s => s.alertFeed)
  const [filter, setFilter] = useState('all')

  const filtered = alertFeed.filter(a => filter === 'all' ? true : a.severity === filter)

  const counts = {
    critical: alertFeed.filter(a => a.severity === 'critical').length,
    warning : alertFeed.filter(a => a.severity === 'warning').length,
    info    : alertFeed.filter(a => a.severity === 'info').length,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Alert Feed</span>
          {alertFeed.length > 0 && (
            <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
              className="text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {alertFeed.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-white transition-colors">✕</button>
      </div>

      <div className="flex items-center gap-1 px-3 py-2">
        {[
          { key: 'all',      label: 'All',      count: alertFeed.length },
          { key: 'critical', label: 'Critical', count: counts.critical  },
          { key: 'warning',  label: 'Warning',  count: counts.warning   },
          { key: 'info',     label: 'Info',     count: counts.info      },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="text-xs px-2 py-0.5 rounded-md font-medium transition-all"
            style={{
              background: filter === key ? 'rgba(255,255,255,0.1)'  : 'transparent',
              color     : filter === key ? 'white'                   : '#6b7280',
              border    : filter === key ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
            }}
          >
            {label} {count > 0 && <span className="opacity-60">{count}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-3 pb-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10">
            <span className="text-3xl">🟢</span>
            <span className="text-xs text-gray-700">No alerts yet</span>
          </div>
        )}
        {filtered.map(alert => {
          const meta = ALERT_META[alert.type] ?? { icon: '•', color: 'text-gray-400', bg: 'rgba(255,255,255,0.04)', severityColor: '' }
          return (
            <div
              key={alert.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: meta.bg, border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-base shrink-0">{meta.icon}</span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`text-xs font-semibold ${meta.color}`}>{alert.type.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-600 truncate">{alert.vehicleName}</span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium leading-none ${meta.severityColor}`}>
                  {alert.severity}
                </span>
                <span className="text-xs text-gray-700">
                  {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MobileBar() {
  const { isMobile }    = useBreakpoint()
  const alertFeed       = useFleetStore(s => s.alertFeed)
  const [open, setOpen] = useState(null)

  if (!isMobile) return null

  const criticalCount = alertFeed.filter(a => a.severity === 'critical').length

  const tabs = [
    { key: 'map',    icon: '🗺️', label: 'Map'    },
    { key: 'fleet',  icon: '🚛', label: 'Fleet'  },
    { key: 'alerts', icon: '⚠️', label: criticalCount > 0 ? `Alerts (${criticalCount})` : 'Alerts' },
  ]

  return (
    <>
      <div style={{
        position      : 'fixed',
        bottom        : 0,
        left          : 0,
        right         : 0,
        zIndex        : 1000,
        background    : 'rgba(6,9,16,0.97)',
        borderTop     : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'space-around',
        padding       : '8px 24px 16px',
      }}>
        {tabs.map(({ key, icon, label }) => {
          const isActive = open === key
          return (
            <button
              key={key}
              onClick={() => setOpen(open === key || key === 'map' ? null : key)}
              className="flex flex-col items-center gap-1 transition-all"
              style={{ color: isActive ? '#10b981' : '#6b7280' }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
            </button>
          )
        })}
      </div>

      {open && open !== 'map' && (
        <div
          style={{
            position      : 'fixed',
            inset         : 0,
            zIndex        : 999,
            background    : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(null)}
        >
          <div
            style={{
              position     : 'absolute',
              bottom       : 64,
              left         : 0,
              right        : 0,
              maxHeight    : '72vh',
              background   : 'rgba(8,12,22,0.99)',
              borderTop    : '1px solid rgba(255,255,255,0.08)',
              borderRadius : '20px 20px 0 0',
              overflow     : 'hidden',
              display      : 'flex',
              flexDirection: 'column',
              boxShadow    : '0 -8px 32px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width       : 36,
              height      : 4,
              borderRadius: 2,
              background  : 'rgba(255,255,255,0.15)',
              margin      : '10px auto 6px',
              flexShrink  : 0,
            }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {open === 'fleet'  && <FleetSheet  onClose={() => setOpen(null)} />}
              {open === 'alerts' && <AlertsSheet onClose={() => setOpen(null)} />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}