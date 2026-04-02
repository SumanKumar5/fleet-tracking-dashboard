# Fleet Tracking Dashboard

A full-stack real-time fleet tracking dashboard that simulates live GPS data using an event-driven architecture. Visualizes multiple concurrent trips on a map, tracks progress, and surfaces intelligent alerts for fleet monitoring.

**[Live Demo →](https://fleet-tracking-dashboard-dusky.vercel.app/)**

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS · Google Maps API · Recharts · Socket.io Client |
| **Backend** | Node.js · Express · TypeScript · Socket.io · Event-driven simulation engine |

---

## Features

### Real-Time Simulation
- Processes a chronologically sorted event stream, batched and streamed via Socket.io
- Efficiently handles 40,000+ events
- Adjustable playback speed: `1×` `5×` `10×` `30×`
- Play / Pause controls

### Live Map Tracking
- Google Maps integration with smooth vehicle animation
- Polyline path history per vehicle
- Multi-trip visualization with unique per-trip colors

### Fleet Analytics
- Overview of total, active, and completed trips
- Completion milestones tracked at 50% and 80%
- Pie chart visualization via Recharts

### Trip Progress
Progress is calculated as:
```
progress = (distance_travelled / planned_distance) * 100
```
Visual progress bars auto-complete when a trip reaches 100%.

### Alert System
Handles anomaly events including device errors, GPS loss, and fuel alerts. Deduplicates alerts and surfaces the latest issue state per trip.

### Controls & Filtering
Filter trips by **All**, **Active**, **Completed**, or **Issues** — combined with playback speed controls.

---

## System Design

### State Per Trip
Each trip maintains: `location`, `path history`, `speed`, `progress`, `issues`, `status`

### Edge Cases Handled
- Missing `trip_started` events — progress works mid-stream without them
- Duplicate alert suppression
- Progress and status stay in sync automatically

---

## Project Structure

```
fleet-tracking-dashboard/
├── client/        # React frontend (TypeScript + Vite)
├── server/        # Node.js backend (Express + Socket.io)
├── README.md
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Maps API key

### Clone

```bash
git clone https://github.com/your-username/fleet-tracking-dashboard.git
cd fleet-tracking-dashboard
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Create a `.env` file inside `/client`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## License

MIT