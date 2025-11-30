import { useEffect, useRef } from "react";
import type { GameEvent, GameNotification, GameState } from "@/game/types";

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

    // Find the maximum timestamp using reduce (avoids potential stack overflow
    // from Math.max(...array) with very large arrays)
    const maxTimestamp = newEvents.reduce(
      (max, e) => Math.max(max, e.timestamp),
      0,
    );
    lastProcessedTimestampRef.current = maxTimestamp;

    // Process each event and create notifications
    // Note: Only one notification is shown at a time (first one wins).
    // Additional events are marked as processed and won't trigger duplicate notifications.
    for (const event of newEvents) {
      const notification = eventToNotification(event);
      if (notification) {
        setNotification(notification);
        break;
      }
    }
    // Depends on pendingEvents reference changing (created via spread in emitEvents)
  }, [state?.pendingEvents, setNotification]);
}

/**
 * Convert a game event to a notification for UI display.
 */
function eventToNotification(event: GameEvent): GameNotification | null {
  switch (event.type) {
    case "stageTransition":
      return {
        type: "stageTransition",
        previousStage: event.previousStage,
        newStage: event.newStage,
        petName: event.petName,
      };
    case "trainingComplete":
      return {
        type: "trainingComplete",
        facilityName: event.facilityName,
        statsGained: event.statsGained,
        petName: event.petName,
      };
    case "explorationComplete":
      return {
        type: "explorationComplete",
        locationName: event.locationName,
        itemsFound: event.itemsFound,
        message: event.message,
        petName: event.petName,
      };
    // Other event types don't have corresponding notifications yet
    default:
      return null;
  }
}
