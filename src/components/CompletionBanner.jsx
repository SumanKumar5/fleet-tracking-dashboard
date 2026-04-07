import { useFleetStore } from '../store/fleetStore'

export default function CompletionBanner() {
  const vehicles     = useFleetStore(s => s.vehicles)
  const masterStream = useFleetStore(s => s.masterStream)
  const eventCursor  = useFleetStore(s => s.eventCursor)
  const reset        = useFleetStore(s => s.reset)

  const isDone = eventCursor >= masterStream.length && masterStream.length > 0
  if (!isDone) return null

  const list          = Object.values(vehicles)
  const completed     = list.filter(v => v.status === 'completed').length
  const cancelled     = list.filter(v => v.status === 'cancelled').length
  const totalDistance = list.reduce((s, v) => s + v.distanceTravelled, 0)
  const totalAlerts   = list.reduce((s, v) => s + v.alerts.length, 0)

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,9,16,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center gap-6 max-w-sm w-full mx-4 animate-fade-in-up">

        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 60px rgba(16,185,129,0.08)',
        }} className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl">
          🏁
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1.5">Simulation Complete</h2>
          <p className="text-gray-500 text-sm">All 5 fleet trips have finished processing</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full">
          {[
            { label: 'Trips Completed', value: completed,                       color: '#3b82f6', icon: '✅' },
            { label: 'Trips Cancelled', value: cancelled,                       color: '#ef4444', icon: '❌' },
            { label: 'Total Distance',  value: `${totalDistance.toFixed(0)} km`,color: '#10b981', icon: '📍' },
            { label: 'Total Alerts',    value: totalAlerts,                     color: '#f59e0b', icon: '⚠️' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }} className="rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-lg">{icon}</span>
              <span className="text-lg font-bold leading-none" style={{ color }}>{value}</span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 0 24px rgba(16,185,129,0.25)',
          }}
          className="w-full py-3 rounded-xl text-black font-bold text-sm transition-all hover:opacity-90 active:scale-95"
        >
          ↺ Replay Simulation
        </button>
      </div>
    </div>
  )
}