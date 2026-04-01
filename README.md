Fleet Tracking Dashboard (Real-Time Simulation)

A full-stack real-time fleet tracking dashboard that simulates live GPS data using an event-driven architecture.
It visualizes multiple concurrent trips on a map, tracks progress, and surfaces intelligent alerts for fleet monitoring.


---

Live Demo

Frontend: https://your-frontend-url.vercel.app

Backend: https://your-backend-url.onrender.com



---

Tech Stack

Frontend (/client)

React (TypeScript + Vite)

Tailwind CSS

Google Maps API

Recharts

Socket.io Client


Backend (/server)

Node.js + Express

TypeScript

Socket.io (real-time)

Event-driven simulation engine



---

Features

Real-Time Simulation

Event stream processed using timestamps

Simulates live fleet movement

Adjustable playback speed (1x, 5x, 10x, 30x)

Pause / Resume controls



---

Live Map Tracking

Google Maps integration

Smooth vehicle animation

Path (polyline) tracking

Multi-trip visualization with unique colors



---

Fleet Analytics

Total trips overview

Trips above 50% and 80% completion

Active vs completed trips

Pie chart visualization



---

Trip Progress Tracking

Real-time progress calculation:


progress = (distance_travelled / planned_distance) * 100

Visual progress bars

Auto-completion when progress reaches 100%



---

Intelligent Alert System

Handles anomaly events:

Device errors

GPS loss

Fuel alerts


Displays real error messages from dataset:


⚠ Fuel level sensor reading invalid (warning)

Prevents duplicate alerts

Shows latest issue state



---

Controls & Filtering

Playback controls (Play / Pause / Speed)

Filter trips by:

All

Active

Completed

Issues




---

System Design

Event Stream Processing

Events sorted chronologically

Streamed in batches via Socket.io

Efficient handling of 40k+ events



---

State Management

Each trip maintains:

location

path history

speed

progress

issues

status



---

Edge Case Handling

Handles missing trip_started events

Ensures progress works even mid-stream

Prevents duplicate alerts

Syncs progress with status automatically



---

Project Structure

fleet-tracking-dashboard/
├── client/          # React frontend
├── server/          # Node backend
├── README.md
├── .gitignore


---

Setup Instructions

1. Clone Repository

git clone https://github.com/your-username/fleet-tracking-dashboard.git
cd fleet-tracking-dashboard


---

Run Locally

Backend

cd server
npm install
npm run dev


---

Frontend

cd client
npm install
npm run dev


---

Environment Variables

Create .env inside /client:

VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_api_key


---
