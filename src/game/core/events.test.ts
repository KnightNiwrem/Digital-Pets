/**
 * Tests for event bus utilities.
 */

import { expect, test } from "bun:test";
import {
  clearEvents,
  emitEvent,
  emitEvents,
  hasPendingEvents,
} from "@/game/core/events";
import {
  createTestGameState,
  createTestPet,
} from "@/game/testing/createTestPet";
import { GrowthStage } from "@/game/types/constants";
import {
  createEvent,
  type StageTransitionEvent,
  type TrainingCompleteEvent,
} from "@/game/types/event";

test("emitEvents appends events to the queue", () => {
  const state = createTestGameState(createTestPet());
  expect(state.pendingEvents).toHaveLength(0);

  const event1 = createEvent<StageTransitionEvent>({
    type: "stageTransition",
    previousStage: GrowthStage.Baby,
    newStage: GrowthStage.Child,
    petName: "Test Pet",
  });

  const event2 = createEvent<TrainingCompleteEvent>({
    type: "trainingComplete",
    facilityName: "Gym",
    statsGained: { strength: 5 },
    message: "Training complete! +5 strength",
    petName: "Test Pet",
  });

  const newState = emitEvents(state, event1, event2);

  expect(newState.pendingEvents).toHaveLength(2);
  expect(newState.pendingEvents[0]).toBe(event1);
  expect(newState.pendingEvents[1]).toBe(event2);
  // Original state unchanged
  expect(state.pendingEvents).toHaveLength(0);
});

test("emitEvents returns same state for empty events", () => {
  const state = createTestGameState(createTestPet());
  const newState = emitEvents(state);

  expect(newState).toBe(state);
});

test("emitEvent appends a single event", () => {
  const state = createTestGameState(createTestPet());

  const event = createEvent<StageTransitionEvent>({
    type: "stageTransition",
    previousStage: GrowthStage.Baby,
    newStage: GrowthStage.Child,
    petName: "Test Pet",
  });

  const newState = emitEvent(state, event);

  expect(newState.pendingEvents).toHaveLength(1);
  expect(newState.pendingEvents[0]).toBe(event);
});

test("clearEvents removes all pending events", () => {
  const event = createEvent<StageTransitionEvent>({
    type: "stageTransition",
    previousStage: GrowthStage.Baby,
    newStage: GrowthStage.Child,
    petName: "Test Pet",
  });

  const state = createTestGameState(createTestPet(), {
    pendingEvents: [event],
  });

  expect(state.pendingEvents).toHaveLength(1);

  const clearedState = clearEvents(state);

  expect(clearedState.pendingEvents).toHaveLength(0);
  // Original state unchanged
  expect(state.pendingEvents).toHaveLength(1);
});

test("clearEvents returns same state when already empty", () => {
  const state = createTestGameState(createTestPet());
  expect(state.pendingEvents).toHaveLength(0);

  const clearedState = clearEvents(state);

  expect(clearedState).toBe(state);
});

test("hasPendingEvents returns true when events exist", () => {
  const event = createEvent<StageTransitionEvent>({
    type: "stageTransition",
    previousStage: GrowthStage.Baby,
    newStage: GrowthStage.Child,
    petName: "Test Pet",
  });

  const state = createTestGameState(createTestPet(), {
    pendingEvents: [event],
  });

  expect(hasPendingEvents(state)).toBe(true);
});

test("hasPendingEvents returns false when no events", () => {
  const state = createTestGameState(createTestPet());

  expect(hasPendingEvents(state)).toBe(false);
});
