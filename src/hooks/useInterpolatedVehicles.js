import { useState, useEffect, useRef } from 'react'
import { useFleetStore } from '../store/fleetStore'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpLocation(prev, next, t) {
  if (!prev || !next) return next
  return {
    lat: lerp(prev.lat, next.lat, t),
    lng: lerp(prev.lng, next.lng, t),
  }
}

function lerpAngle(a, b, t) {
  const diff = ((b - a + 540) % 360) - 180
  return (a + diff * t + 360) % 360
}

export function useInterpolatedVehicles() {
  const vehicles    = useFleetStore(s => s.vehicles)
  const isPlaying   = useFleetStore(s => s.isPlaying)

  const [interpolated, setInterpolated] = useState(vehicles)

  const vehiclesRef  = useRef(vehicles)
  const progressRef  = useRef({})
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(null)

  const INTERP_DURATION_MS = 800

  useEffect(() => {
    vehiclesRef.current = vehicles
    Object.keys(vehicles).forEach(vid => {
      const v    = vehicles[vid]
      const prev = progressRef.current[vid]
      if (
        prev &&
        v.location &&
        prev.targetLocation &&
        (v.location.lat !== prev.targetLocation.lat ||
         v.location.lng !== prev.targetLocation.lng)
      ) {
        progressRef.current[vid] = {
          startLocation : prev.currentLocation ?? v.prevLocation ?? v.location,
          targetLocation: v.location,
          startHeading  : prev.currentHeading ?? v.heading,
          targetHeading : v.heading,
          progress      : 0,
          currentLocation: prev.currentLocation ?? v.location,
          currentHeading : prev.currentHeading  ?? v.heading,
        }
      } else if (!prev && v.location) {
        progressRef.current[vid] = {
          startLocation : v.location,
          targetLocation: v.location,
          startHeading  : v.heading,
          targetHeading : v.heading,
          progress      : 1,
          currentLocation: v.location,
          currentHeading : v.heading,
        }
      }
    })
  }, [vehicles])

  useEffect(() => {
    function animate(now) {
      if (!lastTimeRef.current) lastTimeRef.current = now
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      let changed = false

      Object.keys(progressRef.current).forEach(vid => {
        const state = progressRef.current[vid]
        if (state.progress >= 1) return

        state.progress = Math.min(1, state.progress + delta / INTERP_DURATION_MS)
        const t = easeInOut(state.progress)

        state.currentLocation = lerpLocation(state.startLocation, state.targetLocation, t)
        state.currentHeading  = lerpAngle(state.startHeading, state.targetHeading, t)
        changed = true
      })

      if (changed) {
        const result = {}
        Object.keys(vehiclesRef.current).forEach(vid => {
          const v     = vehiclesRef.current[vid]
          const state = progressRef.current[vid]
          result[vid] = {
            ...v,
            location: state?.currentLocation ?? v.location,
            heading : state?.currentHeading  ?? v.heading,
          }
        })
        setInterpolated(result)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [])

  return interpolated
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}