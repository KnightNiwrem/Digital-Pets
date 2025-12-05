import { useEffect } from "react";
import type { GameNotification, GameState } from "@/game/types";

/**
 * Hook to handle notifications from the persistent pendingNotifications queue.
 *
 * This hook reads from state.pendingNotifications (persisted) and provides
 * the first notification to the UI. Unlike the old event-based approach,
 * notifications persist across page refreshes until explicitly dismissed.
 *
 * @param state The current game state
 * @param setNotification callback to set a new notification
 */
export function useGameNotifications(
  state: GameState | null,
  setNotification: (notification: GameNotification | null) => void,
) {
  useEffect(() => {
    // Show the first pending notification, or null if none
    const firstNotification = state?.pendingNotifications?.[0] ?? null;
    setNotification(firstNotification);
  }, [state?.pendingNotifications, setNotification]);
}
