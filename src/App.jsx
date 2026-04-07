import { useEffect } from 'react'
import { loadAllTrips } from './utils/dataLoader'
import { useFleetStore } from './store/fleetStore'
import { useSimulation } from './hooks/useSimulation'
import { useBreakpoint } from './hooks/useBreakpoint'
import FleetMap from './components/FleetMap'
import KpiBar from './components/KpiBar'
import Sidebar from './components/Sidebar'
import CompletionBanner from './components/CompletionBanner'
import ToastManager from './components/ToastManager'
import ErrorBoundary from './components/ErrorBoundary'
import MobileBar from './components/MobileBar'

function App() {
  const setData        = useFleetStore(s => s.setData)
  const isLoaded       = useFleetStore(s => s.isLoaded)
  const isPlaying      = useFleetStore(s => s.isPlaying)
  const setPlaying     = useFleetStore(s => s.setPlaying)
  const setSpeed       = useFleetStore(s => s.setSpeed)
  const playbackSpeed  = useFleetStore(s => s.playbackSpeed)
  const reset          = useFleetStore(s => s.reset)
  const { isMobile }   = useBreakpoint()

  useSimulation()

  useEffect(() => {
    loadAllTrips().then(setData)
  }, [])

  if (!isLoaded) {
    return (
      <div style={{ background: '#060910' }} className="text-white min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-white font-semibold text-base">Loading Fleet Data</p>
          <p className="text-gray-500 text-sm">Processing 40,000+ telemetry events...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height       : '100vh',
      display      : 'flex',
      flexDirection: 'column',
      background   : '#060910',
    }} className="text-white">

      <header style={{
        background    : 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom  : '1px solid rgba(255,255,255,0.06)',
      }} className="flex items-center gap-3 px-4 py-2.5 shrink-0 z-10">

        <div className="flex items-center gap-2">
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <span className="text-black font-black text-xs">F</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-bold text-sm tracking-tight ${'text-white' }`}>FleetOS</span>
            {!isMobile && <span className="text-gray-500 text-xs">Fleet Intelligence</span>}
          </div>
        </div>

        {!isMobile && (
          <>
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} className="mx-1" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-500 text-xs font-medium">Live Simulation</span>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!isMobile && <span className="text-gray-500 text-xs">Speed</span>}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border    : '1px solid rgba(255,255,255,0.06)',
          }} className="flex items-center rounded-lg p-0.5 gap-0.5">
            {(isMobile ? [1, 10, 100] : [1, 10, 50, 100]).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-all duration-150 ${
                  playbackSpeed === s
                    ? 'bg-emerald-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />

          <button
            onClick={() => setPlaying(!isPlaying)}
            style={isPlaying
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.25)' }
            }
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
              isPlaying ? 'text-red-400' : 'text-black'
            }`}
          >
            {isPlaying ? '⏸' : '▶'}{!isMobile && (isPlaying ? ' Pause' : ' Play')}
          </button>

          <button
            onClick={() => {
              reset()
              if (window.__fleetWorker) {
                window.__fleetWorker.postMessage({
                  type   : 'RESET',
                  payload: { virtualNow: new Date('2025-11-03T08:00:00.000Z').toISOString() },
                })
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border    : '1px solid rgba(255,255,255,0.08)',
            }}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
               'text-gray-400 hover:text-white' 
            }`}
          >
            {isMobile ? '↺' : '↺ Reset'}
          </button>
        </div>
      </header>

      <KpiBar />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: isMobile ? '56px' : 0 }}>
          <ErrorBoundary>
            <FleetMap />
          </ErrorBoundary>
        </div>
        {!isMobile && (
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        )}
        <CompletionBanner />
        <MobileBar />
      </div>

      <ToastManager />
    </div>
  )
}

export default App