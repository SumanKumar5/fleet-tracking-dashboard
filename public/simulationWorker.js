let masterStream = []
let eventCursor  = 0
let virtualNow   = null
let isPlaying    = false
let playbackSpeed = 10
let intervalId   = null

const TICK_MS = 100

function tick() {
  if (!isPlaying || eventCursor >= masterStream.length) return

  const msToAdvance  = TICK_MS * playbackSpeed
  const newVirtualNow = new Date(virtualNow.getTime() + msToAdvance)

  const events = []
  while (
    eventCursor < masterStream.length &&
    new Date(masterStream[eventCursor].timestamp) <= newVirtualNow
  ) {
    events.push(masterStream[eventCursor])
    eventCursor++
  }

  virtualNow = newVirtualNow

  self.postMessage({
    type      : 'TICK',
    events,
    virtualNow: virtualNow.toISOString(),
    eventCursor,
    done      : eventCursor >= masterStream.length,
  })
}

self.onmessage = (e) => {
  const { type, payload } = e.data

  if (type === 'INIT') {
    masterStream  = payload.masterStream
    virtualNow    = new Date(payload.virtualNow)
    eventCursor   = payload.eventCursor ?? 0
    isPlaying     = false
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(tick, TICK_MS)
  }

  if (type === 'SET_PLAYING') {
    isPlaying = payload.isPlaying
  }

  if (type === 'SET_SPEED') {
    playbackSpeed = payload.speed
  }

  if (type === 'RESET') {
    virtualNow  = new Date(payload.virtualNow)
    eventCursor = 0
    isPlaying   = false
  }
}