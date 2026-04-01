import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { loadAndPrepareEvents } from "./simulator/loadEvents";
import { EventEngine } from "./simulator/eventEngine";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const events = loadAndPrepareEvents();
const engine = new EventEngine(events, io);

engine.start();

app.get("/", (req, res) => {
  res.send("Fleet Tracking Server Running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("control", (data) => {
    if (data.type === "pause") engine.pause();
    if (data.type === "resume") engine.resume();
    if (data.type === "speed") engine.setSpeed(data.value);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
