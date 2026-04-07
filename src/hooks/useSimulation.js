import { useEffect, useRef } from 'react'
import { useFleetStore } from '../store/fleetStore'

export function useSimulation() {
  const workerRef      = useRef(null)
  const isLoaded       = useFleetStore(s => s.isLoaded)
  const isPlaying      = useFleetStore(s => s.isPlaying)
  const playbackSpeed  = useFleetStore(s => s.playbackSpeed)
  const masterStream   = useFleetStore(s => s.masterStream)
  const globalStart    = useFleetStore(s => s.globalStart)
  const processEvents  = useFleetStore(s => s.processEvents)
  const setPlaying     = useFleetStore(s => s.setPlaying)

  useEffect(() => {
    if (!isLoaded) return

    const worker = new Worker('/simulationWorker.js')
    workerRef.current = worker

    worker.postMessage({
      type   : 'INIT',
      payload: {
        masterStream,
        virtualNow  : globalStart.toISOString(),
        eventCursor : 0,
      },
    })

    window.__fleetWorker = worker

    worker.onmessage = (e) => {
      const { type, events, virtualNow, eventCursor, done } = e.data
      if (type === 'TICK') {
        if (events.length > 0 || done) {
          processEvents(events, virtualNow, eventCursor)
        }
        if (done) setPlaying(false)
      }
    }

    return () => worker.terminate()
  }, [isLoaded])

  useEffect(() => {
    if (!workerRef.current) return
    workerRef.current.postMessage({ type: 'SET_PLAYING', payload: { isPlaying } })
  }, [isPlaying])

  useEffect(() => {
    if (!workerRef.current) return
    workerRef.current.postMessage({ type: 'SET_SPEED', payload: { speed: playbackSpeed } })
  }, [playbackSpeed])
}