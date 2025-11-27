/**
 * Shared test utilities for creating mock Pet objects.
 */

import { SPECIES } from "@/game/data/species";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";
import { createDefaultResistances } from "@/game/types/stats";

/**
 * Factory function to create default test pet values.
 * Using a factory ensures fresh timestamps for each call.
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
    birthTime: Date.now(),
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
      sleepStartTime: sleepOverrides?.sleepStartTime ?? Date.now(),
    },
    activityState: ActivityState.Sleeping,
  });
}
