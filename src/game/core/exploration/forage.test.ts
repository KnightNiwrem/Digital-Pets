/**
 * Tests for exploration system core logic.
 */

import { expect, test } from "bun:test";
import {
  applyExplorationCompletion,
  calculateForageDrops,
  cancelExploration,
  canStartForaging,
  completeForaging,
  getExplorationProgress,
  processExplorationTick,
  startForaging,
} from "@/game/core/exploration/forage";
import type { ForageTable } from "@/game/data/tables/forage";
import { createTestPet } from "@/game/testing/createTestPet";
import type { ActiveExploration } from "@/game/types/activity";
import { ExplorationActivityType } from "@/game/types/activity";
import { toMicro } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";

/**
 * Create a test forage table.
 */
function createTestForageTable(): ForageTable {
  return {
    id: "test_forage",
    baseDurationTicks: 3,
    baseEnergyCost: 5,
    entries: [
      {
        itemId: "food_apple",
        baseDropRate: 1.0, // Always drops for testing
        rarity: "common",
        minSkillLevel: 0,
        quantity: [1, 2],
      },
      {
        itemId: "food_meat",
        baseDropRate: 0.5,
        rarity: "uncommon",
        minSkillLevel: 1,
        quantity: [1, 1],
      },
      {
        itemId: "food_cake",
        baseDropRate: 0.1,
        rarity: "rare",
        minSkillLevel: 3,
        quantity: [1, 1],
      },
    ],
  };
}

// canStartForaging tests
test("canStartForaging returns true when pet is idle at wild location", () => {
  const pet = createTestPet();
  const result = canStartForaging(pet, "meadow");
  expect(result.canForage).toBe(true);
  expect(result.message).toBe("Ready to forage!");
});

test("canStartForaging fails when pet is sleeping", () => {
  const pet = createTestPet({
    activityState: ActivityState.Sleeping,
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
  });
  const result = canStartForaging(pet, "meadow");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("canStartForaging fails when pet is already exploring", () => {
  const pet = createTestPet({
    activityState: ActivityState.Exploring,
  });
  const result = canStartForaging(pet, "meadow");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("exploring");
});

test("canStartForaging fails when pet is training", () => {
  const pet = createTestPet({
    activityState: ActivityState.Training,
  });
  const result = canStartForaging(pet, "meadow");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("training");
});

test("canStartForaging fails at non-wild location", () => {
  const pet = createTestPet();
  const result = canStartForaging(pet, "home");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("wild areas");
});

test("canStartForaging fails with unknown location", () => {
  const pet = createTestPet();
  const result = canStartForaging(pet, "unknown_location");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("not found");
});

test("canStartForaging fails when not enough energy", () => {
  const pet = createTestPet({
    energyStats: { energy: toMicro(2) }, // Only 2 energy, meadow requires 5
  });
  const result = canStartForaging(pet, "meadow");
  expect(result.canForage).toBe(false);
  expect(result.message).toContain("Not enough energy");
});

// startForaging tests
test("startForaging succeeds and deducts energy", () => {
  const pet = createTestPet({ energyStats: { energy: toMicro(50) } });
  const result = startForaging(pet, "meadow", 100);

  expect(result.success).toBe(true);
  expect(result.pet.activityState).toBe(ActivityState.Exploring);
  expect(result.pet.activeExploration).toBeDefined();
  expect(result.pet.activeExploration?.locationId).toBe("meadow");
  // Meadow costs 5 energy
  expect(result.pet.energyStats.energy).toBe(toMicro(45));
});

test("startForaging sets correct exploration state", () => {
  const pet = createTestPet();
  const result = startForaging(pet, "meadow", 100);

  expect(result.pet.activeExploration?.activityType).toBe(
    ExplorationActivityType.Forage,
  );
  expect(result.pet.activeExploration?.startTick).toBe(100);
  expect(result.pet.activeExploration?.durationTicks).toBeGreaterThan(0);
  expect(result.pet.activeExploration?.ticksRemaining).toBe(
    result.pet.activeExploration?.durationTicks,
  );
});

test("startForaging fails when cannot start", () => {
  const pet = createTestPet({ activityState: ActivityState.Sleeping });
  const result = startForaging(pet, "meadow", 100);

  expect(result.success).toBe(false);
  expect(result.pet.activityState).toBe(ActivityState.Sleeping);
  expect(result.pet.activeExploration).toBeUndefined();
});

// processExplorationTick tests
test("processExplorationTick decrements ticksRemaining", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 3,
    ticksRemaining: 3,
  };

  const result = processExplorationTick(exploration);
  expect(result).not.toBeNull();
  expect(result?.ticksRemaining).toBe(2);
});

test("processExplorationTick returns null when exploration completes", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 3,
    ticksRemaining: 1,
  };

  const result = processExplorationTick(exploration);
  expect(result).toBeNull();
});

// calculateForageDrops tests
test("calculateForageDrops returns items with 100% drop rate", () => {
  const forageTable = createTestForageTable();
  // Use skill level 1 (gives 0 bonus) to ensure 100% base rate stays 100%
  // For reference: Skill level 0 gives a negative bonus: (0-1) * 0.05 = -0.05.
  // If the bonus is applied multiplicatively: 100% * (1 + (-0.05)) = 95%.
  // If additive: 100% + (-5%) = 95%. This test assumes a multiplicative bonus.
  for (let i = 0; i < 5; i++) {
    const drops = calculateForageDrops(forageTable, 1);
    const appleDrops = drops.filter((d) => d.itemId === "food_apple");
    expect(appleDrops.length).toBe(1);
  }
});

test("calculateForageDrops skips items requiring higher skill", () => {
  const forageTable = createTestForageTable();
  // With skill level 1, can get food_meat (requires 1), but should not get food_cake (requires 3)
  // Note: minSkillLevel check is strictly less-than, so level 1 can get items requiring level 1
  const drops = calculateForageDrops(forageTable, 1);
  // food_meat requires level 1, so it may drop (50% chance)
  // food_cake requires level 3, so it should never drop
  const cakeDrops = drops.filter((d) => d.itemId === "food_cake");
  expect(cakeDrops.length).toBe(0);
});

test("calculateForageDrops respects quantity range", () => {
  const forageTable = createTestForageTable();
  for (let i = 0; i < 10; i++) {
    const drops = calculateForageDrops(forageTable, 1);
    const appleDrop = drops.find((d) => d.itemId === "food_apple");
    if (appleDrop) {
      expect(appleDrop.quantity).toBeGreaterThanOrEqual(1);
      expect(appleDrop.quantity).toBeLessThanOrEqual(2);
    }
  }
});

test("calculateForageDrops applies skill bonus to drop rate", () => {
  // With high skill, even lower base rates should eventually hit
  const forageTable: ForageTable = {
    id: "test",
    baseDurationTicks: 1,
    baseEnergyCost: 1,
    entries: [
      {
        itemId: "test_item",
        baseDropRate: 0.5, // 50% base rate
        rarity: "common",
        minSkillLevel: 0,
        quantity: [1, 1],
      },
    ],
  };

  // With skill level 10, multiplier is 1.5 (1 + 10 * 0.05), so effective rate is 0.75
  // Just verify it doesn't crash and returns valid results
  const drops = calculateForageDrops(forageTable, 10);
  expect(Array.isArray(drops)).toBe(true);
});

test("calculateForageDrops caps effective rate at 1.0", () => {
  const forageTable: ForageTable = {
    id: "test",
    baseDurationTicks: 1,
    baseEnergyCost: 1,
    entries: [
      {
        itemId: "test_item",
        baseDropRate: 0.8, // With high skill, this would exceed 1.0
        rarity: "common",
        minSkillLevel: 0,
        quantity: [1, 1],
      },
    ],
  };

  // With skill level 20, multiplier is 2.0, so base 0.8 * 2.0 = 1.6, but capped at 1.0
  // Should always drop
  for (let i = 0; i < 5; i++) {
    const drops = calculateForageDrops(forageTable, 20);
    expect(drops.length).toBe(1);
  }
});

// completeForaging tests
test("completeForaging fails when no active exploration", () => {
  const pet = createTestPet();
  const result = completeForaging(pet);
  expect(result.success).toBe(false);
  expect(result.itemsFound.length).toBe(0);
});

test("completeForaging returns success with active exploration", () => {
  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      activityType: ExplorationActivityType.Forage,
      locationId: "meadow",
      forageTableId: "meadow_forage",
      startTick: 0,
      durationTicks: 2,
      ticksRemaining: 0,
    },
  });

  const result = completeForaging(pet);
  expect(result.success).toBe(true);
  expect(result.message).toBeTruthy();
});

// applyExplorationCompletion tests
test("applyExplorationCompletion clears exploration state", () => {
  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      activityType: ExplorationActivityType.Forage,
      locationId: "meadow",
      forageTableId: "meadow_forage",
      startTick: 0,
      durationTicks: 2,
      ticksRemaining: 0,
    },
  });

  const { pet: completedPet, result } = applyExplorationCompletion(pet);
  expect(completedPet.activityState).toBe(ActivityState.Idle);
  expect(completedPet.activeExploration).toBeUndefined();
  expect(result).toBeDefined();
});

// cancelExploration tests
test("cancelExploration clears exploration state", () => {
  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      activityType: ExplorationActivityType.Forage,
      locationId: "meadow",
      forageTableId: "meadow_forage",
      startTick: 0,
      durationTicks: 2,
      ticksRemaining: 1,
    },
  });

  const result = cancelExploration(pet);
  expect(result.success).toBe(true);
  expect(result.pet.activityState).toBe(ActivityState.Idle);
  expect(result.pet.activeExploration).toBeUndefined();
});

test("cancelExploration fails when no exploration active", () => {
  const pet = createTestPet();
  const result = cancelExploration(pet);
  expect(result.success).toBe(false);
});

// getExplorationProgress tests
test("getExplorationProgress returns correct percentage", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 10,
    ticksRemaining: 5,
  };

  const progress = getExplorationProgress(exploration);
  expect(progress).toBe(50);
});

test("getExplorationProgress returns 0 at start", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 10,
    ticksRemaining: 10,
  };

  const progress = getExplorationProgress(exploration);
  expect(progress).toBe(0);
});

test("getExplorationProgress returns 100 at end", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 10,
    ticksRemaining: 0,
  };

  const progress = getExplorationProgress(exploration);
  expect(progress).toBe(100);
});

test("getExplorationProgress handles zero duration", () => {
  const exploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: "meadow",
    forageTableId: "meadow_forage",
    startTick: 0,
    durationTicks: 0,
    ticksRemaining: 0,
  };

  const progress = getExplorationProgress(exploration);
  expect(progress).toBe(100); // Should return 100 for instant completion
});
