/**
 * Event bus utilities for managing game events.
 *
 * Provides functions to emit, consume, and clear events from the game state.
 */

import type { GameEvent } from "@/game/types/event";
import type { GameState } from "@/game/types/gameState";

/**
 * Emit one or more events to the game state's pending events queue.
 */
export function emitEvents(
  state: GameState,
  ...events: GameEvent[]
): GameState {
  if (events.length === 0) return state;

  return {
    ...state,
    pendingEvents: [...state.pendingEvents, ...events],
  };
}

/**
 * Emit a single event to the game state.
 */
export function emitEvent(state: GameState, event: GameEvent): GameState {
  return emitEvents(state, event);
}

/**
 * Clear all pending events from the game state.
 * Should be called after the UI has consumed the events.
 */
export function clearEvents(state: GameState): GameState {
  if (state.pendingEvents.length === 0) return state;

  return {
    ...state,
    pendingEvents: [],
  };
}

/**
 * Get pending events of a specific type.
 */
export function getEventsByType<T extends GameEvent>(
  state: GameState,
  type: T["type"],
): T[] {
  return state.pendingEvents.filter((e) => e.type === type) as T[];
}

/**
 * Check if there are any pending events.
 */
export function hasPendingEvents(state: GameState): boolean {
  return state.pendingEvents.length > 0;
}
