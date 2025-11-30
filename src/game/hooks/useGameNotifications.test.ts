import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import * as facilitiesData from "@/game/data/facilities";
import type {
  ActiveTraining,
  ExplorationResult,
  GameNotification,
  GameState,
  Pet,
} from "@/game/types";
import { GrowthStage, TrainingSessionType } from "@/game/types";
import { renderHook } from "@testing-library/react";
import { Window } from "happy-dom";
import { useGameNotifications } from "./useGameNotifications";

// Setup DOM environment for React hooks
if (typeof window === "undefined") {
  const window = new Window();
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global window
  global.window = window as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global document
  global.document = window.document as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global navigator
  global.navigator = window.navigator as any;
}

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
      id: "test-pet",
      identity: { name: "Fluffy", speciesId: "dog", speciesName: "Dog" },
      growth: { stage: GrowthStage.Baby, progress: 0 },
      stats: {
        energy: 100,
        hunger: 0,
        happiness: 100,
        hygiene: 100,
        strength: 0,
        endurance: 0,
        agility: 0,
        precision: 0,
        fortitude: 0,
        cunning: 0,
      },
      status: { isSick: false, isAsleep: false },
      activeTraining: null,
    };

    return {
      pet: defaultPet,
      lastExplorationResult: null,
      isInitialized: true,
      lastSaveTime: Date.now(),
      player: {
        inventory: { items: [] },
        currency: { coins: 0 },
        currentLocationId: "home",
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
          growth: { stage: GrowthStage.Baby, progress: 0 },
        },
      };

      const { rerender } = renderHook(
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Update stage
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          growth: { stage: GrowthStage.Child, progress: 0 },
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
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      rerender({ state: initialState });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });

    test("does not notify if pet is null", () => {
      const initialState = createMockState();
      const { rerender } = renderHook(
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Set pet to null (e.g. reset)
      const newState = { ...initialState, pet: null };
      // biome-ignore lint/suspicious/noExplicitAny: Simulating null pet in state type
      rerender({ state: newState as any });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });

  describe("Training Completion", () => {
    const mockFacility = {
      id: "gym",
      name: "Gym",
      primaryStat: "strength",
      secondaryStat: "endurance",
      // Added required fields for TrainingFacility type satisfaction if needed by the hook or simple return
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
        startTime: Date.now(),
        ticksRemaining: 1,
        originalDuration: 10,
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
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Complete training
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          activeTraining: null,
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
        startTime: Date.now(),
        ticksRemaining: 5, // > 1 means cancelled
        originalDuration: 10,
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
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      // Cancel training
      const newState = {
        ...initialState,
        pet: {
          ...initialState.pet,
          activeTraining: null,
        },
      };

      rerender({ state: newState });

      expect(mockSetNotification).not.toHaveBeenCalled();
    });
  });

  describe("Exploration Completion", () => {
    test("notifies when new exploration result appears", () => {
      const initialState = createMockState({ lastExplorationResult: null });

      const { rerender } = renderHook(
        ({ state }) => useGameNotifications(state, mockSetNotification),
        { initialProps: { state: initialState } },
      );

      const result: ExplorationResult & { locationName: string } = {
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
        itemsFound: [],
        message: "Found nothing",
        locationName: "Forest",
      };

      const initialState = createMockState({ lastExplorationResult: result });

      const { rerender } = renderHook(
        ({ state }) => useGameNotifications(state, mockSetNotification),
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
