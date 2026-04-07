import { useEffect, useRef } from 'react'
import { useFleetStore } from '../store/fleetStore'

const TOAST_DURATION = 4000

const SEVERITY_STYLES = {
  critical: {
    bar    : '#ef4444',
    bg     : 'rgba(239,68,68,0.08)',
    border : 'rgba(239,68,68,0.2)',
    badge  : 'bg-red-500/20 text-red-400 border-red-500/30',
    icon   : '🚨',
  },
  warning: {
    bar    : '#f59e0b',
    bg     : 'rgba(245,158,11,0.08)',
    border : 'rgba(245,158,11,0.2)',
    badge  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon   : '⚠️',
  },
}

const EVENT_ICONS = {
  speed_violation : '⚡',
  signal_lost     : '📡',
  device_error    : '⚠️',
  battery_low     : '🔋',
  fuel_level_low  : '⛽',
  trip_cancelled  : '❌',
}

function Toast({ toast, onDismiss }) {
  const progressRef = useRef(null)
  const style       = SEVERITY_STYLES[toast.severity] ?? SEVERITY_STYLES.warning

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id])

  return (
    <div
      className="animate-fade-in-up relative overflow-hidden rounded-xl flex items-start gap-3 px-3.5 py-3 cursor-pointer"
      style={{
        background    : toast.severity === 'critical' ? 'rgba(15,10,10,0.97)' : 'rgba(10,12,15,0.97)',
        border        : `1px solid ${style.border}`,
        boxShadow     : `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${style.border}`,
        backdropFilter: 'blur(16px)',
        minWidth      : '280px',
        maxWidth      : '320px',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 origin-left"
        ref={progressRef}
        style={{
          background : style.bar,
          animation  : `shrink ${TOAST_DURATION}ms linear forwards`,
        }}
      />

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
        style={{ background: `${style.bar}18`, border: `1px solid ${style.bar}30` }}
      >
        {EVENT_ICONS[toast.type] ?? style.icon}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold capitalize">
            {toast.message}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium leading-none ml-auto shrink-0 ${style.badge}`}>
            {toast.severity}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: toast.color }} />
          <span className="text-gray-500 text-xs truncate">{toast.vehicle}</span>
        </div>
      </div>
    </div>
  )
}

export default function ToastManager() {
  const toasts      = useFleetStore(s => s.toasts)
  const dismissToast = useFleetStore(s => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div
        className="fixed bottom-6 left-6 flex flex-col-reverse gap-2 z-[9999]"
        style={{ pointerEvents: 'none' }}
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </>
  )
}