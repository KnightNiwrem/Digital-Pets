import { describe, expect, mock, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import type {
  ExplorationCompleteEvent,
  GameNotification,
  GameState,
  Pet,
  StageTransitionEvent,
  TrainingCompleteEvent,
} from "@/game/types";
import { GrowthStage } from "@/game/types";
import { createEvent } from "@/game/types/event";
import { createInitialSkills } from "@/game/types/skill";
import { createDefaultResistances } from "@/game/types/stats";
import { useGameNotifications } from "./useGameNotifications";

describe("useGameNotifications", () => {
  const mockSetNotification = mock((_n: GameNotification) => {});

  const createMockState = (overrides: Partial<GameState> = {}): GameState => {
    const defaultPet: Pet = {
      identity: { id: "test-pet", name: "Fluffy", speciesId: "dog" },
      growth: {
        stage: GrowthStage.Baby,
        substage: 0,
        birthTime: 0,
        ageTicks: 0,
      },
      activeTraining: undefined,
      careStats: {
        satiety: 100,
        hydration: 100,
        happiness: 100,
      },
      energyStats: {
        energy: 100,
      },
      careLifeStats: {
        careLife: 100,
      },
      battleStats: {
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
      trainedBattleStats: {
        strength: 0,
        endurance: 0,
        agility: 0,
        precision: 0,
        fortitude: 0,
        cunning: 0,
      },
      resistances: createDefaultResistances(),
      poop: {
        count: 0,
        ticksUntilNext: 100,
      },
      sleep: {
        isSleeping: false,
        sleepStartTime: null,
        sleepTicksToday: 0,
      },
      activityState: "idle",
      bonusMaxStats: {
        satiety: 0,
        hydration: 0,
        happiness: 0,
        energy: 0,
        careLife: 0,
        battle: {
          strength: 0,
          endurance: 0,
          agility: 0,
          precision: 0,
          fortitude: 0,
          cunning: 0,
        },
      },
    };

    return {
      version: 1,
      totalTicks: 0,
      quests: [],
      pet: defaultPet,
      lastExplorationResult: undefined,
      isInitialized: true,
      lastSaveTime: Date.now(),
      lastDailyReset: Date.now(),
      lastWeeklyReset: Date.now(),
      player: {
        inventory: { items: [] },
        currency: { coins: 0 },
        currentLocationId: "home",
        skills: createInitialSkills(),
      },
      pendingEvents: [],
      ...overrides,
    };
  };

  describe("Stage Transitions", () => {
    test("notifies when stageTransition event is in pendingEvents", () => {
      mockSetNotification.mockClear();

      const stateWithEvent = createMockState({
        pendingEvents: [
          createEvent<StageTransitionEvent>({
            type: "stageTransition",
            previousStage: GrowthStage.Baby,
            newStage: GrowthStage.Child,
            petName: "Fluffy",
          }),
        ],
      });

      renderHook(() =>
        useGameNotifications(stateWithEvent, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "stageTransition",
        previousStage: GrowthStage.Baby,
        newStage: GrowthStage.Child,
        petName: "Fluffy",
      });
    });

    test("does not notify if pendingEvents is empty", () => {
      mockSetNotification.mockClear();

      const stateNoEvents = createMockState({ pendingEvents: [] });

      renderHook(() =>
        useGameNotifications(stateNoEvents, mockSetNotification),
      );

      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });

  describe("Training Completion", () => {
    test("notifies when trainingComplete event is in pendingEvents", () => {
      mockSetNotification.mockClear();

      const stateWithEvent = createMockState({
        pendingEvents: [
          createEvent<TrainingCompleteEvent>({
            type: "trainingComplete",
            facilityName: "Gym",
            statsGained: { strength: 10, endurance: 5 },
            petName: "Fluffy",
          }),
        ],
      });

      renderHook(() =>
        useGameNotifications(stateWithEvent, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "trainingComplete",
        facilityName: "Gym",
        statsGained: { strength: 10, endurance: 5 },
        petName: "Fluffy",
      });
    });
  });

  describe("Exploration Completion", () => {
    test("notifies when explorationComplete event is in pendingEvents", () => {
      mockSetNotification.mockClear();

      const stateWithEvent = createMockState({
        pendingEvents: [
          createEvent<ExplorationCompleteEvent>({
            type: "explorationComplete",
            locationName: "Forest",
            itemsFound: [],
            message: "Found nothing",
            petName: "Fluffy",
          }),
        ],
      });

      renderHook(() =>
        useGameNotifications(stateWithEvent, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "explorationComplete",
        locationName: "Forest",
        itemsFound: [],
        message: "Found nothing",
        petName: "Fluffy",
      });
    });

    test("does not duplicate notification for already-processed events", () => {
      mockSetNotification.mockClear();

      // Create event with a specific timestamp
      const eventTimestamp = Date.now();
      const event = createEvent<ExplorationCompleteEvent>(
        {
          type: "explorationComplete",
          locationName: "Forest",
          itemsFound: [],
          message: "Found nothing",
          petName: "Fluffy",
        },
        eventTimestamp,
      );

      const stateWithEvent = createMockState({
        pendingEvents: [event],
      });

      const { rerender } = renderHook<void, { state: GameState | null }>(
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: stateWithEvent } },
      );

      // First render triggers notification
      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      mockSetNotification.mockClear();

      // Create a NEW state object with the SAME event (same timestamp)
      // This tests that the timestamp-based filter prevents duplicates
      const newStateWithSameEvent = createMockState({
        pendingEvents: [event],
      });

      rerender({ state: newStateWithSameEvent });
      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });
});
