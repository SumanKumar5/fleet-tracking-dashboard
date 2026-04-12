<div align="center">

# FleetOS- Real-Time Fleet Tracking Dashboard

**A production-grade fleet intelligence dashboard that processes 40,000+ real-time telemetry events across 5 simultaneous vehicle trips spanning the continental United States.**

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_4-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand_5-FF6B35?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

 **[Live Demo → fleet-tracking-dashboard-dusky.vercel.app](https://fleet-tracking-dashboard-dusky.vercel.app/)**

</div>

---

## What is FleetOS?

FleetOS simulates a live fleet operations center. It replays real GPS telemetry data from 5 vehicle trips — from a 2,959 km cross-country haul to an urban delivery route — with full real-time event processing, alert management, and trip analytics. Every architectural decision was made with production-grade performance in mind.

---

## Features

### Simulation Engine
- **Web Worker architecture** — the entire event loop runs off the main thread, the UI never blocks regardless of playback speed
- **Chronological replay** — 40,000+ events dispatched in timestamp order across all 5 trips simultaneously
- **Variable speed playback** — 1x, 10x, 50x, 100x multipliers with play, pause, and reset
- **Virtual clock** — simulation time advances independently of wall clock, accurately reflecting original data timestamps

### Live Map
- **Animated vehicle markers** with SVG pulse rings on moving vehicles
- **Smooth position interpolation** — `requestAnimationFrame` + ease-in-out easing glides vehicles between GPS pings instead of teleporting
- **Directional heading arrows** that rotate with vehicle movement in real time
- **Color-coded trail polylines** per vehicle — cancelled routes render in red
- **Route preview on hover** — hover any trip card to overlay the full planned route as a dashed line on the map
- **CartoDB dark tiles** — genuine dark navy map with no CSS filter hacks

### Sidebar & Trip Cards
- **Live trip cards** — real-time progress bars, speed, signal quality, fuel level, and battery per vehicle
- **Collapsible sidebar** — collapse to a 52px icon strip for maximum map real estate
- **Vehicle selection** — click any card to highlight its trail on the map and open the detail panel
- **Per-vehicle detail panel** — live speed and fuel charts (Recharts), route progress, and alert history

### Alert System
- **Severity tiers** — Critical, Warning, and Info with distinct visual treatment
- **Filter tabs** — filter the live alert feed by severity in real time
- **Expand / collapse** — 2 alerts shown collapsed, virtualized scroll (react-virtuoso) for the full list
- **Toast notifications** — critical and warning events trigger dismissible popups with shrinking progress timers

### Fleet Analytics
- **KPI bar** — live fleet-wide metrics: active vehicles, total distance, avg speed, completed trips, alert count
- **Status donut chart** — real-time breakdown of vehicle statuses across the entire fleet
- **Per-trip statistics modal** — avg speed, max speed, duration, stops, violations, signal losses, refuels, fuel consumed, and a full speed profile chart

### Responsive Design
- **Desktop** — full sidebar with trip cards, alert feed, and detail panel
- **Tablet** — sidebar adapts gracefully to reduced width
- **Mobile** — full-screen map with a bottom tab bar; Fleet and Alerts open as native-feeling bottom sheets

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Map | React Leaflet + CartoDB |
| Charts | Recharts |
| Simulation | Web Worker (native) |
| Animation | requestAnimationFrame |
| Virtual Scroll | react-virtuoso |
| Deployment | Vercel |

---

## Architecture

```
src/
├── components/
│   ├── FleetMap.jsx            
│   ├── Sidebar.jsx            
│   ├── DetailPanel.jsx          
│   ├── KpiBar.jsx               
│   ├── StatusDonut.jsx          
│   ├── StatsModal.jsx           
│   ├── ToastManager.jsx         
│   ├── CompletionBanner.jsx    
│   ├── MobileBar.jsx           
│   └── ErrorBoundary.jsx       
├── hooks/
│   ├── useSimulation.js        
│   ├── useInterpolatedVehicles.js 
│   └── useBreakpoint.js         
├── store/
│   └── fleetStore.js            
└── utils/
    └── dataLoader.js            

public/
├── simulationWorker.js         
└── data/
    ├── trip_1_cross_country.json
    ├── trip_2_urban_dense.json
    ├── trip_3_mountain_cancelled.json
    ├── trip_4_southern_technical.json
    └── trip_5_regional_logistics.json
```

### How the Simulation Works

The simulation engine runs entirely inside a **Web Worker**. On each 100ms tick, the worker advances virtual time by `tickMs × playbackSpeed`, collects all events whose timestamps fall within that window, and posts the batch to the main thread. Zustand processes the batch and updates all vehicle states atomically in a single render cycle.

This means the UI never blocks — at 100x speed, thousands of events per second are processed without a single dropped frame on the map or charts.

### How Interpolation Works

Raw GPS data produces discrete position jumps between pings. The `useInterpolatedVehicles` hook runs a persistent `requestAnimationFrame` loop that tracks each vehicle's `startLocation`, `targetLocation`, and interpolation `progress`. Each frame, positions and headings are interpolated using an ease-in-out function, producing fluid continuous movement between GPS pings.

---

## Dataset

| Trip | Vehicle | Route | Events | Distance | Status |
|---|---|---|---|---|---|
| Cross Country Long Haul | VH_001 | Houston TX → Boston MA | 28,901 | 2,959 km | Completed |
| Urban Dense Delivery | VH_002 | San Francisco urban loop | 497 | 18 km | Completed |
| Mountain Route Cancelled | VH_003 | Denver CO mountain route | 1,042 | 49 km | Cancelled |
| Southern Technical Issues | VH_004 | Houston TX → Miami FL | 9,212 | 1,910 km | Completed |
| Regional Logistics | VH_005 | Sacramento → Fresno CA | 2,270 | 273 km | Completed |

**Total: 41,922 events · 5,209 km · 55-hour simulated timespan**

---

## Performance Optimizations

| Optimization | Implementation |
|---|---|
| Off-thread simulation | Web Worker prevents main thread blocking |
| Event decimation | Location pings thinned to max 800/trip for trail rendering |
| Trail capping | Vehicle trails capped at 500 points, oldest dropped as new arrive |
| Virtualized alerts | react-virtuoso renders only visible DOM nodes regardless of alert count |
| Memoized stats | `useMemo` prevents speed profile recomputation on every render |
| Atomic state updates | All vehicle states updated in a single Zustand batch per tick |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/SumanKumar5/fleet-tracking-dashboard
cd fleet-tracking-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)


---


## License

MIT © [Suman Kumar](https://github.com/SumanKumar5)
