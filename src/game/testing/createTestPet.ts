/**
 * Shared test utilities for creating mock Pet objects.
 */

import { createDefaultBonusMaxStats } from "@/game/core/petStats";
import { SPECIES } from "@/game/data/species";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";
import type { Pet } from "@/game/types/pet";
import { createInitialSkills } from "@/game/types/skill";
import type { BattleStats } from "@/game/types/stats";
import { createDefaultResistances } from "@/game/types/stats";
import { FROZEN_TIME } from "./constants";

/**
 * Create default (zero) battle stats for testing.
 */
export function createDefaultBattleStats(): BattleStats {
  return {
    strength: 0,
    endurance: 0,
    agility: 0,
    precision: 0,
    fortitude: 0,
    cunning: 0,
  };
}

/**
 * Factory function to create default test pet values.
 * Uses FROZEN_TIME for deterministic test fixtures.
 */
const createDefaultTestPet = (): Pet => ({
  identity: {
    id: "test-pet-1",
    name: "Test Pet",
    speciesId: SPECIES.FLORABIT.id,
  },
  growth: {
    stage: GrowthStage.Baby,
    substage: 1,
    birthTime: FROZEN_TIME,
    ageTicks: 0,
  },
  careStats: {
    satiety: 40_000,
    hydration: 40_000,
    happiness: 40_000,
  },
  energyStats: {
    energy: 40_000,
  },
  careLifeStats: {
    careLife: 72_000,
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
    ticksUntilNext: 480,
  },
  sleep: {
    isSleeping: false,
    sleepStartTime: null,
    sleepTicksToday: 0,
  },
  activityState: ActivityState.Idle,
  bonusMaxStats: createDefaultBonusMaxStats(),
});

/**
 * Deep partial type for nested overrides.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge utility for nested objects.
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as object,
          sourceValue as DeepPartial<object>,
        ) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Create a test pet with optional overrides.
 * Supports deep partial overrides for nested objects.
 */
export function createTestPet(overrides: DeepPartial<Pet> = {}): Pet {
  return deepMerge(createDefaultTestPet(), overrides) as Pet;
}

/**
 * Create a sleeping test pet.
 * Merges sleep overrides while ensuring the pet is always in a sleeping state.
 */
export function createSleepingTestPet(overrides: DeepPartial<Pet> = {}): Pet {
  const { sleep: sleepOverrides, ...otherOverrides } = overrides;
  return createTestPet({
    ...otherOverrides,
    sleep: {
      ...sleepOverrides,
      isSleeping: true,
      sleepStartTime: sleepOverrides?.sleepStartTime ?? FROZEN_TIME,
    },
    activityState: ActivityState.Sleeping,
  });
}

/**
 * Create a test game state with a pet and optional overrides.
 */
export function createTestGameState(
  pet: Pet | null = createTestPet(),
  overrides: Partial<
    Omit<GameState, "pet" | "player"> & {
      player?: Partial<GameState["player"]>;
    }
  > = {},
): GameState {
  const { player: playerOverrides, ...stateOverrides } = overrides;

  return {
    version: 1,
    lastSaveTime: FROZEN_TIME,
    totalTicks: 0,
    pet,
    player: {
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId: "home",
      skills: createInitialSkills(),
      ...playerOverrides,
    },
    quests: [],
    isInitialized: true,
    lastDailyReset: FROZEN_TIME,
    lastWeeklyReset: FROZEN_TIME,
    pendingEvents: [],
    pendingNotifications: [],
    ...stateOverrides,
  };
}
