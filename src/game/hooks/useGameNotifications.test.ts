import { describe, expect, mock, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import type { GameNotification, GameState, Pet } from "@/game/types";
import { GrowthStage } from "@/game/types";
import { createInitialSkills } from "@/game/types/skill";
import { createDefaultResistances } from "@/game/types/stats";
import { useGameNotifications } from "./useGameNotifications";

// Fixed timestamp for deterministic test fixtures
const FROZEN_TIME = 1_733_400_000_000;

describe("useGameNotifications", () => {
  const mockSetNotification = mock((_n: GameNotification | null) => {});

  const createMockState = (overrides: Partial<GameState> = {}): GameState => {
    const defaultPet: Pet = {
      identity: { id: "test-pet", name: "Fluffy", speciesId: "dog" },
      growth: {
        stage: GrowthStage.Baby,
        substage: 0,
        birthTime: FROZEN_TIME,
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
      isInitialized: true,
      lastSaveTime: FROZEN_TIME,
      lastDailyReset: FROZEN_TIME,
      lastWeeklyReset: FROZEN_TIME,
      player: {
        inventory: { items: [] },
        currency: { coins: 0 },
        currentLocationId: "home",
        skills: createInitialSkills(),
      },
      pendingEvents: [],
      pendingNotifications: [],
      ...overrides,
    };
  };

  describe("Stage Transitions", () => {
    test("shows notification when stageTransition is in pendingNotifications", () => {
      mockSetNotification.mockClear();

      const stageNotification: GameNotification = {
        type: "stageTransition",
        previousStage: GrowthStage.Baby,
        newStage: GrowthStage.Child,
        petName: "Fluffy",
      };

      const stateWithNotification = createMockState({
        pendingNotifications: [stageNotification],
      });

      renderHook(() =>
        useGameNotifications(stateWithNotification, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith(stageNotification);
    });

    test("sets null when pendingNotifications is empty", () => {
      mockSetNotification.mockClear();

      const stateNoNotifications = createMockState({
        pendingNotifications: [],
      });

      renderHook(() =>
        useGameNotifications(stateNoNotifications, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith(null);
    });
  });

  describe("Training Completion", () => {
    test("shows notification when trainingComplete is in pendingNotifications", () => {
      mockSetNotification.mockClear();

      const trainingNotification: GameNotification = {
        type: "trainingComplete",
        facilityName: "Gym",
        statsGained: { strength: 10, endurance: 5 },
        message: "Training complete! +10 strength, +5 endurance",
        petName: "Fluffy",
      };

      const stateWithNotification = createMockState({
        pendingNotifications: [trainingNotification],
      });

      renderHook(() =>
        useGameNotifications(stateWithNotification, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith(trainingNotification);
    });
  });

  describe("Exploration Completion", () => {
    test("shows notification when explorationComplete is in pendingNotifications", () => {
      mockSetNotification.mockClear();

      const explorationNotification: GameNotification = {
        type: "explorationComplete",
        locationName: "Forest",
        itemsFound: [],
        message: "Found nothing",
        petName: "Fluffy",
      };

      const stateWithNotification = createMockState({
        pendingNotifications: [explorationNotification],
      });

      renderHook(() =>
        useGameNotifications(stateWithNotification, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith(explorationNotification);
    });

    test("shows first notification when multiple are pending", () => {
      mockSetNotification.mockClear();

      const firstNotification: GameNotification = {
        type: "explorationComplete",
        locationName: "Forest",
        itemsFound: [],
        message: "Found nothing",
        petName: "Fluffy",
      };

      const secondNotification: GameNotification = {
        type: "trainingComplete",
        facilityName: "Gym",
        statsGained: { strength: 10 },
        message: "Training complete!",
        petName: "Fluffy",
      };

      const stateWithNotifications = createMockState({
        pendingNotifications: [firstNotification, secondNotification],
      });

      renderHook(() =>
        useGameNotifications(stateWithNotifications, mockSetNotification),
      );

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith(firstNotification);
    });
  });
});
