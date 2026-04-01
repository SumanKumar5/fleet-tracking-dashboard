import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { loadAndPrepareEvents } from "./simulator/loadEvents";
import { EventEngine } from "./simulator/eventEngine";

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const events = loadAndPrepareEvents();
const engine = new EventEngine(events, io);

engine.start();

app.get("/", (req, res) => {
  res.send("Fleet Tracking Server Running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("control", (data) => {
    if (data.type === "pause") engine.pause();
    if (data.type === "resume") engine.resume();
    if (data.type === "speed") engine.setSpeed(data.value);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", socket.id, err);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});