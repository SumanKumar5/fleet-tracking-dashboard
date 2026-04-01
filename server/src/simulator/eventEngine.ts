import { Server } from "socket.io";
import { FleetEvent } from "../types/event.types";

export class EventEngine {
  private events: FleetEvent[];
  private io: Server;

  private pointer = 0;
  private interval: NodeJS.Timeout | null = null;

  private speed = 30;
  private currentTime: number = 0;
  private isRunning = true;

  constructor(events: FleetEvent[], io: Server) {
    this.events = events;
    this.io = io;

    this.currentTime = new Date(events[0].timestamp).getTime();
  }

  start() {
    console.log("Simulation started");

    this.interval = setInterval(() => {
      if (this.isRunning) {
        this.tick();
      }
    }, 1000);
  }

  private tick() {
    this.currentTime += 1000 * this.speed;

    const batch: FleetEvent[] = [];

    while (
      this.pointer < this.events.length &&
      new Date(this.events[this.pointer].timestamp).getTime() <=
        this.currentTime
    ) {
      batch.push(this.events[this.pointer]);
      this.pointer++;
    }

    if (batch.length > 0) {
      this.io.emit("events", batch);
    }

    if (this.pointer >= this.events.length) {
      console.log("Simulation completed");
      this.stop();
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  pause() {
    this.isRunning = false;
    console.log("Paused");
  }

  resume() {
    this.isRunning = true;
    console.log("Resumed");
  }

  setSpeed(newSpeed: number) {
    this.speed = newSpeed;
    console.log("Speed set to", newSpeed);
  }
}
