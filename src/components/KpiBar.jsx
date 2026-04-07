import { useFleetStore } from '../store/fleetStore'
import StatusDonut from './StatusDonut'
import { useBreakpoint } from '../hooks/useBreakpoint'

function KpiCard({ label, value, sub, accent, glow }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border    : '1px solid rgba(255,255,255,0.07)',
      boxShadow : glow ? `0 0 20px ${glow}12` : 'none',
      flexShrink: 0,
    }} className="flex flex-col gap-0.5 px-4 py-2.5 rounded-xl min-w-[120px]">
      <span className="text-gray-500 text-xs font-medium uppercase tracking-widest truncate">{label}</span>
      <span className={`text-lg font-bold leading-none ${accent ?? 'text-white'}`}>{value}</span>
      {sub && <span className="text-gray-600 text-xs truncate">{sub}</span>}
    </div>
  )
}

export default function KpiBar() {
  const vehicles   = useFleetStore(s => s.vehicles)
  const alertFeed  = useFleetStore(s => s.alertFeed)
  const virtualNow = useFleetStore(s => s.virtualNow)
  const { isMobile } = useBreakpoint()

  const list = Object.values(vehicles)

  const totalDistance  = list.reduce((sum, v) => sum + (v.distanceTravelled ?? 0), 0)
  const movingVehicles = list.filter(v => v.status === 'moving')
  const avgSpeed       = movingVehicles.length > 0
    ? movingVehicles.reduce((sum, v) => sum + v.speed_kmh, 0) / movingVehicles.length
    : 0
  const activeCount    = list.filter(v => v.status === 'moving' || v.status === 'stopped').length
  const alertCount     = alertFeed.filter(a =>
    ['speed_violation','device_error','battery_low','fuel_level_low','signal_lost','trip_cancelled'].includes(a.type)
  ).length
  const completedCount = list.filter(v => v.status === 'completed').length

  const timeStr = virtualNow
    ? virtualNow.toLocaleString('en-US', {
        month : isMobile ? 'numeric' : 'short',
        day   : 'numeric',
        hour  : '2-digit',
        minute: '2-digit',
      })
    : '--'

  return (
    <div style={{
      background    : 'rgba(6,9,16,0.8)',
      borderBottom  : '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(8px)',
      overflowX     : 'auto',
      WebkitOverflowScrolling: 'touch',
    }} className="flex items-center gap-2 px-4 py-2 shrink-0">

      <div style={{
        background: 'rgba(16,185,129,0.08)',
        border    : '1px solid rgba(16,185,129,0.15)',
        flexShrink: 0,
      }} className="flex flex-col gap-0.5 px-3 py-2 rounded-xl min-w-[130px]">
        <span className="text-emerald-500 text-xs font-medium uppercase tracking-widest">Sim Time</span>
        <span className="text-emerald-400 text-sm font-bold leading-none">{timeStr}</span>
      </div>

      <KpiCard label="Active"    value={`${activeCount} / ${list.length}`}  sub="vehicles"   accent="text-emerald-400" glow="#10b981" />
      <KpiCard label="Distance"  value={`${totalDistance.toFixed(0)} km`}   sub="total"      accent="text-blue-400"   glow="#3b82f6" />
      <KpiCard label="Avg Speed" value={`${avgSpeed.toFixed(0)} km/h`}      sub="moving"     accent="text-violet-400" glow="#8b5cf6" />
      <KpiCard label="Done"      value={completedCount}                      sub="trips"      accent="text-blue-400"   glow="#3b82f6" />
      <KpiCard
        label="Alerts"
        value={alertCount}
        sub="triggered"
        accent={alertCount > 0 ? 'text-red-400' : 'text-gray-500'}
        glow={alertCount > 0 ? '#ef4444' : undefined}
      />
      {!isMobile && <StatusDonut />}
    </div>
  )
}