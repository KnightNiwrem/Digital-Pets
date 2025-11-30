/**
 * Tests for event bus utilities.
 */

import { expect, test } from "bun:test";
import {
  clearEvents,
  emitEvent,
  emitEvents,
  getEventsByType,
  hasPendingEvents,
} from "@/game/core/events";
import {
  createTestGameState,
  createTestPet,
} from "@/game/testing/createTestPet";
import { GrowthStage } from "@/game/types/constants";
import {
  createEvent,
  type ExplorationCompleteEvent,
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

test("getEventsByType filters events by type correctly", () => {
  const stageEvent = createEvent<StageTransitionEvent>({
    type: "stageTransition",
    previousStage: GrowthStage.Baby,
    newStage: GrowthStage.Child,
    petName: "Test Pet",
  });

  const trainingEvent = createEvent<TrainingCompleteEvent>({
    type: "trainingComplete",
    facilityName: "Gym",
    statsGained: { strength: 5 },
    petName: "Test Pet",
  });

  const explorationEvent = createEvent<ExplorationCompleteEvent>({
    type: "explorationComplete",
    locationName: "Forest",
    itemsFound: [],
    message: "Nothing found",
    petName: "Test Pet",
  });

  const state = createTestGameState(createTestPet(), {
    pendingEvents: [stageEvent, trainingEvent, explorationEvent],
  });

  const stageEvents = getEventsByType<StageTransitionEvent>(
    state,
    "stageTransition",
  );
  expect(stageEvents).toHaveLength(1);
  expect(stageEvents[0]).toBe(stageEvent);

  const trainingEvents = getEventsByType<TrainingCompleteEvent>(
    state,
    "trainingComplete",
  );
  expect(trainingEvents).toHaveLength(1);
  expect(trainingEvents[0]).toBe(trainingEvent);
});

test("getEventsByType returns empty array for non-existent type", () => {
  const state = createTestGameState(createTestPet());

  const events = getEventsByType<StageTransitionEvent>(
    state,
    "stageTransition",
  );

  expect(events).toHaveLength(0);
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
