import { useEffect, useRef } from "react";
import type {
  ExplorationCompleteEvent,
  GameEvent,
  GameNotification,
  GameState,
  StageTransitionEvent,
  TrainingCompleteEvent,
} from "@/game/types";

/**
 * Hook to handle side effects and generate notifications based on game events.
 *
 * This hook consumes events from the event bus (state.pendingEvents) instead of
 * diffing state to detect changes. This is more robust and scales better as
 * the game grows with more event types.
 *
 * @param state The current game state
 * @param setNotification callback to set a new notification
 */
export function useGameNotifications(
  state: GameState | null,
  setNotification: (notification: GameNotification) => void,
) {
  // Track processed events to avoid duplicate notifications
  const lastProcessedTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!state?.pendingEvents?.length) return;

    // Process new events (those with timestamp > last processed)
    const newEvents = state.pendingEvents.filter(
      (event) => event.timestamp > lastProcessedTimestampRef.current,
    );

    if (newEvents.length === 0) return;

    // Update the last processed timestamp
    const maxTimestamp = Math.max(...newEvents.map((e) => e.timestamp));
    lastProcessedTimestampRef.current = maxTimestamp;

    // Process each event and create notifications
    for (const event of newEvents) {
      const notification = eventToNotification(event);
      if (notification) {
        setNotification(notification);
        // Only show one notification at a time (first one wins)
        break;
      }
    }
  }, [state?.pendingEvents, setNotification]);
}

/**
 * Convert a game event to a notification for UI display.
 */
function eventToNotification(event: GameEvent): GameNotification | null {
  switch (event.type) {
    case "stageTransition": {
      const e = event as StageTransitionEvent;
      return {
        type: "stageTransition",
        previousStage: e.previousStage,
        newStage: e.newStage,
        petName: e.petName,
      };
    }
    case "trainingComplete": {
      const e = event as TrainingCompleteEvent;
      return {
        type: "trainingComplete",
        facilityName: e.facilityName,
        statsGained: e.statsGained,
        petName: e.petName,
      };
    }
    case "explorationComplete": {
      const e = event as ExplorationCompleteEvent;
      return {
        type: "explorationComplete",
        locationName: e.locationName,
        itemsFound: e.itemsFound,
        message: e.message,
        petName: e.petName,
      };
    }
    // Other event types don't have corresponding notifications yet
    default:
      return null;
  }
}
