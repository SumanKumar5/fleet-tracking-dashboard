import { useState } from "react";
import type { FleetState } from "../domain/types";
import { processEvent } from "../domain/eventProcessor";

export function useFleetStore() {
  const [state, setState] = useState<FleetState>({
    trips: {},
  });

  function applyEvents(events: any[]) {
    setState((prev) => {
      let updated = prev;

      for (const event of events) {
        updated = processEvent(updated, event);
      }

      return updated;
    });
  }

  return {
    state,
    applyEvents,
  };
}
