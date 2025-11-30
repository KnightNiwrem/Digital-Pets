import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import { renderHook } from "@testing-library/react";
import * as facilitiesData from "@/game/data/facilities";
import type {
  ActiveTraining,
  ExplorationResult,
  GameNotification,
  GameState,
  Pet,
} from "@/game/types";
import { GrowthStage, TrainingSessionType } from "@/game/types";
import { createInitialSkills } from "@/game/types/skill";
import { createDefaultResistances } from "@/game/types/stats";
import { useGameNotifications } from "./useGameNotifications";

describe("useGameNotifications", () => {
  const mockSetNotification = mock((_n: GameNotification) => {});
  let getFacilitySpy: ReturnType<typeof spyOn>;
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    mockSetNotification.mockClear();
    // Spy on the facility methods
    getFacilitySpy = spyOn(facilitiesData, "getFacility");
    getSessionSpy = spyOn(facilitiesData, "getSession");
  });

  afterEach(() => {
    getFacilitySpy.mockRestore();
    getSessionSpy.mockRestore();
  });

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
      player: {
        inventory: { items: [] },
        currency: { coins: 0 },
        currentLocationId: "home",
        skills: createInitialSkills(),
      },
      ...overrides,
    };
  };

  describe("Stage Transitions", () => {
    test("notifies when growth stage changes", () => {
      const baseState = createMockState();
      if (!baseState.pet) throw new Error("Pet missing in mock state");

      const initialState = {
        ...baseState,
        pet: {
          ...baseState.pet,
          growth: { ...baseState.pet.growth, stage: GrowthStage.Baby },
        },
      };

      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Update stage
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          growth: { ...initialState.pet.growth, stage: GrowthStage.Child },
        },
      };

      rerender({ state: newState });

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "stageTransition",
        previousStage: GrowthStage.Baby,
        newStage: GrowthStage.Child,
        petName: "Fluffy",
      });
    });

    test("does not notify if stage remains the same", () => {
      const initialState = createMockState();
      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      rerender({ state: initialState });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });

    test("does not notify if pet is null", () => {
      const initialState = createMockState();
      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Set pet to null (e.g. reset)
      const newState = { ...initialState, pet: null };
      rerender({ state: newState });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });

  describe("Training Completion", () => {
    const mockFacility = {
      id: "gym",
      name: "Gym",
      primaryStat: "strength",
      secondaryStat: "endurance",
      facilityType: "strength",
      description: "Test Gym",
      sessions: [],
      emoji: "🏋️",
    };
    const mockSession = {
      type: TrainingSessionType.Basic,
      name: "Basic",
      description: "Desc",
      durationTicks: 10,
      energyCost: 10,
      primaryStatGain: 10,
      secondaryStatGain: 5,
    };

    beforeEach(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing mock methods
      getFacilitySpy.mockReturnValue(mockFacility as any);
      // biome-ignore lint/suspicious/noExplicitAny: Accessing mock methods
      getSessionSpy.mockReturnValue(mockSession as any);
    });

    test("notifies on natural completion (ticks <= 1 -> null)", () => {
      const trainingState: ActiveTraining = {
        facilityId: "gym",
        sessionType: TrainingSessionType.Basic,
        startTick: 100,
        durationTicks: 10,
        ticksRemaining: 1,
        energyCost: 10,
      };

      const baseState = createMockState();
      if (!baseState.pet) throw new Error("Pet missing in mock state");

      const initialState = {
        ...baseState,
        pet: {
          ...baseState.pet,
          activeTraining: trainingState,
        },
      };

      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Complete training
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          activeTraining: undefined as ActiveTraining | undefined,
        },
      };

      rerender({ state: newState });

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "trainingComplete",
        facilityName: "Gym",
        statsGained: { strength: 10, endurance: 5 },
        petName: "Fluffy",
      });
    });

    test("does not notify if training was cancelled (ticks > 1 -> null)", () => {
      const trainingState: ActiveTraining = {
        facilityId: "gym",
        sessionType: TrainingSessionType.Basic,
        startTick: 100,
        durationTicks: 10,
        ticksRemaining: 5,
        energyCost: 10,
      };

      const baseState = createMockState();
      if (!baseState.pet) throw new Error("Pet missing in mock state");

      const initialState = {
        ...baseState,
        pet: {
          ...baseState.pet,
          activeTraining: trainingState,
        },
      };

      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Cancel training
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          activeTraining: undefined as ActiveTraining | undefined,
        },
      };

      rerender({ state: newState });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });

  describe("Exploration Completion", () => {
    test("notifies when new exploration result appears", () => {
      const initialState = createMockState({
        lastExplorationResult: undefined,
      });

      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      const result: ExplorationResult & { locationName: string } = {
        success: true,
        itemsFound: [],
        message: "Found nothing",
        locationName: "Forest",
      };

      const newState = createMockState({ lastExplorationResult: result });

      rerender({ state: newState });

      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "explorationComplete",
        locationName: "Forest",
        itemsFound: [],
        message: "Found nothing",
        petName: "Fluffy",
      });
    });

    test("does not duplicate notification for same result object", () => {
      const result: ExplorationResult & { locationName: string } = {
        success: true,
        itemsFound: [],
        message: "Found nothing",
        locationName: "Forest",
      };

      const initialState = createMockState({ lastExplorationResult: result });

      const { rerender } = renderHook(
        ({ state }: { state: GameState | null }) =>
          useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // First render triggers notification because ref was null
      expect(mockSetNotification).toHaveBeenCalledTimes(1);
      mockSetNotification.mockClear();

      // Rerender with SAME state/object
      rerender({ state: initialState });
      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });
});
