# FleetOS — Real-Time Fleet Tracking Dashboard

> A production-grade fleet intelligence dashboard. Processes 40,000+ real-time telemetry events across 5 simultaneous vehicle trips spanning the continental United States.

![FleetOS Dashboard](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Live Demo

🔗 **[fleet-os.vercel.app](https://fleet-os.vercel.app)**

---

## Overview

FleetOS is a fully interactive fleet tracking dashboard that replays real GPS telemetry data from 5 simultaneous vehicle trips. It simulates a live operations center where a fleet manager can monitor all vehicles, respond to alerts, and drill into individual trip analytics — all in real time.

---

## Features

### Core Simulation Engine
- **Web Worker-based simulation** — the event processing loop runs off the main thread, keeping the UI perfectly smooth at all playback speeds
- **Chronological event replay** — 40,000+ events sorted and dispatched in timestamp order across all 5 trips simultaneously
- **Playback controls** — 1x, 10x, 50x, 100x speed multipliers with play, pause, and reset
- **Virtual clock** — simulated time advances independently of wall clock time, accurately reflecting the original data timestamps

### Live Map
- **Real-time vehicle markers** with animated pulse rings on moving vehicles
- **Smooth position interpolation** — vehicles glide between GPS pings using `requestAnimationFrame` and easing functions instead of teleporting
- **Directional heading arrows** that rotate with vehicle movement
- **Color-coded trail polylines** per vehicle, with cancelled routes shown in red
- **Route preview on hover** — hover any trip card to see the full planned route as a dashed overlay on the map
- **Dark CartoDB tiles** for a professional operations center aesthetic

### Sidebar & Trip Cards
- **Live trip cards** with real-time progress bars, speed, signal quality, fuel level, and battery
- **Expandable/collapsible sidebar** — collapse to a slim icon strip for maximum map visibility
- **Click to select** any vehicle — highlights its trail on the map and opens the detail panel
- **Per-vehicle detail panel** with live speed and fuel charts (Recharts), route progress, and alert history

### Alert System
- **Real-time alert feed** with severity categorization — Critical, Warning, and Info tiers
- **Filter tabs** — filter alerts by severity level live as they arrive
- **Expand/collapse** — shows 2 alerts collapsed, virtualized scroll for full list
- **Toast notifications** — critical and warning alerts trigger dismissible toast popups with auto-dismiss timers

### Fleet Analytics
- **KPI bar** — live fleet-wide metrics including active vehicles, total distance, average speed, completed trips, and alert count
- **Status donut chart** — real-time breakdown of vehicle statuses (moving, stopped, completed, cancelled, pending)
- **Per-trip statistics modal** — click any trip's stats button to see avg speed, max speed, duration, stops, violations, signal losses, refuels, fuel consumed, and a full speed profile chart

### Completion State
- **Simulation complete overlay** — when all events are processed, a summary screen shows completed trips, cancelled trips, total distance, and total alerts with a replay button

### Responsive Design
- **Desktop** — full sidebar with trip cards, alert feed, and detail panel alongside the map
- **Tablet** — sidebar adapts to available width
- **Mobile** — full-screen map with a bottom tab bar; Fleet and Alerts open as bottom sheets with drag handles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand 5 |
| Map | React Leaflet + CartoDB Dark Tiles |
| Charts | Recharts |
| Simulation | Web Worker (native browser API) |
| Animation | requestAnimationFrame interpolation |
| Virtual Scroll | react-virtuoso |
| Deployment | Vercel |

---

## Architecture

```
src/
├── components/
│   ├── FleetMap.jsx          # Leaflet map, vehicle markers, trail polylines
│   ├── Sidebar.jsx           # Trip cards, detail panel, alert feed
│   ├── DetailPanel.jsx       # Per-vehicle live charts and metrics
│   ├── KpiBar.jsx            # Fleet-wide KPI metrics bar
│   ├── StatusDonut.jsx       # Fleet status donut chart
│   ├── StatsModal.jsx        # Per-trip statistics modal
│   ├── ToastManager.jsx      # Alert toast notifications
│   ├── CompletionBanner.jsx  # Simulation complete overlay
│   ├── MobileBar.jsx         # Mobile bottom tab bar and sheets
│   └── ErrorBoundary.jsx     # React error boundary
├── hooks/
│   ├── useSimulation.js      # Web Worker lifecycle management
│   ├── useInterpolatedVehicles.js  # rAF-based position interpolation
│   └── useBreakpoint.js      # Responsive breakpoint detection
├── store/
│   └── fleetStore.js         # Zustand global state
└── utils/
    └── dataLoader.js         # JSON loading, decimation, route extraction

public/
├── simulationWorker.js       # Off-thread simulation engine
└── data/                     # 5 trip JSON files
```

### Simulation Engine

The simulation runs entirely inside a **Web Worker** (`public/simulationWorker.js`). On each 100ms tick, the worker advances virtual time by `tickMs × playbackSpeed`, collects all events whose timestamps fall within that window, and posts them to the main thread. The main thread's Zustand store processes the batch and updates all vehicle states atomically.

This architecture ensures the UI never blocks — even at 100x speed processing thousands of events per second, the map and charts remain perfectly responsive.

### Position Interpolation

Raw GPS data produces discrete position jumps between pings. The `useInterpolatedVehicles` hook runs a `requestAnimationFrame` loop that smoothly interpolates each vehicle's position and heading between its last known location and current target using an ease-in-out function, making movement appear fluid and continuous.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/your-username/fleet-dashboard
cd fleet-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Usage

1. The dashboard loads all 5 trip files automatically
2. Press **▶ Play** to start the simulation
3. Use **1x / 10x / 50x / 100x** to control playback speed
4. Click any trip card in the sidebar to select a vehicle and open its detail panel
5. Hover a trip card to preview the vehicle's full planned route on the map
6. Click **↗** on any trip card to open the full statistics modal
7. Press **↺ Reset** to restart the simulation from the beginning

### Build for Production

```bash
npm run build
```
---

## Performance

The dashboard is optimized to handle large datasets without degrading UI performance:

- **Event decimation** — location pings are thinned to max 800 per trip for trail rendering while all alert/lifecycle events are preserved at full fidelity
- **Web Worker isolation** — simulation processing never touches the main thread
- **Trail capping** — each vehicle trail is capped at 500 points, dropping the oldest points as new ones are added
- **Virtualized alert list** — the expanded alert feed uses react-virtuoso to render only visible rows regardless of total alert count
- **Memoized stats** — the per-trip statistics modal uses `useMemo` to avoid recomputing speed profiles on every render

---

## Project Structure Notes

Trip data files are served as static assets from `public/data/` and fetched at runtime via the browser's `fetch` API. This means no bundling overhead for the large JSON files — they load in parallel on startup and are never included in the JavaScript bundle.

---

## License

MIT