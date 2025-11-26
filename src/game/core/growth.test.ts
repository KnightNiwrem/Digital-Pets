/**
 * Tests for growth logic.
 */

import { expect, test } from "bun:test";
import type { Pet } from "@/game/types/pet";
import {
  applyStatGains,
  calculateStageTransitionStatGains,
  formatTicksDuration,
  getNextStage,
  getStageProgressPercent,
  getStatGainForRate,
  getTicksUntilNextStage,
  getTicksUntilNextSubstage,
  processGrowthTick,
} from "./growth";

function createTestPet(overrides: Partial<Pet> = {}): Pet {
  return {
    identity: {
      id: "test_pet",
      name: "Test Pet",
      speciesId: "florabit",
    },
    growth: {
      stage: "baby",
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
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 0,
      chemical: 0,
      thermal: 0,
      electric: 0,
    },
    poop: {
      count: 0,
      ticksUntilNext: 480,
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: 0,
    },
    activityState: "idle",
    ...overrides,
  };
}

// getStatGainForRate tests
test("getStatGainForRate returns 1 for low growth rate", () => {
  expect(getStatGainForRate("low")).toBe(1);
});

test("getStatGainForRate returns 3 for medium growth rate", () => {
  expect(getStatGainForRate("medium")).toBe(3);
});

test("getStatGainForRate returns 5 for high growth rate", () => {
  expect(getStatGainForRate("high")).toBe(5);
});

// calculateStageTransitionStatGains tests
test("calculateStageTransitionStatGains returns correct gains for florabit", () => {
  const gains = calculateStageTransitionStatGains("florabit");
  expect(gains).not.toBeNull();
  // Florabit has all medium growth rates
  expect(gains?.strength).toBe(3);
  expect(gains?.endurance).toBe(3);
  expect(gains?.agility).toBe(3);
  expect(gains?.precision).toBe(3);
  expect(gains?.fortitude).toBe(3);
  expect(gains?.cunning).toBe(3);
});

test("calculateStageTransitionStatGains returns correct gains for sparkfin", () => {
  const gains = calculateStageTransitionStatGains("sparkfin");
  expect(gains).not.toBeNull();
  // Sparkfin has high agility/precision, low endurance/fortitude
  expect(gains?.agility).toBe(5);
  expect(gains?.precision).toBe(5);
  expect(gains?.endurance).toBe(1);
  expect(gains?.fortitude).toBe(1);
});

test("calculateStageTransitionStatGains returns null for unknown species", () => {
  const gains = calculateStageTransitionStatGains("unknown_species");
  expect(gains).toBeNull();
});

// applyStatGains tests
test("applyStatGains correctly adds gains to stats", () => {
  const current = {
    strength: 10,
    endurance: 10,
    agility: 10,
    precision: 10,
    fortitude: 10,
    cunning: 10,
  };
  const gains = {
    strength: 3,
    endurance: 3,
    agility: 3,
    precision: 3,
    fortitude: 3,
    cunning: 3,
  };

  const result = applyStatGains(current, gains);

  expect(result.strength).toBe(13);
  expect(result.endurance).toBe(13);
  expect(result.agility).toBe(13);
  expect(result.precision).toBe(13);
  expect(result.fortitude).toBe(13);
  expect(result.cunning).toBe(13);
});

// processGrowthTick tests
test("processGrowthTick increments ageTicks", () => {
  const pet = createTestPet();
  const result = processGrowthTick(pet);

  expect(result.growth.ageTicks).toBe(1);
});

test("processGrowthTick does not transition when within same stage", () => {
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 100,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.stageTransitioned).toBe(false);
  expect(result.growth.stage).toBe("baby");
});

test("processGrowthTick transitions stage when reaching threshold", () => {
  // Child stage starts at 172_800 ticks
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: 172_799,
    },
    battleStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.stageTransitioned).toBe(true);
  expect(result.growth.stage).toBe("child");
  expect(result.previousStage).toBe("baby");
  // Should have gained stats (florabit has medium growth = +3)
  expect(result.battleStats.strength).toBe(13);
});

test("processGrowthTick transitions substage within stage", () => {
  // Baby has 3 substages over 172_800 ticks = ~57_600 ticks per substage
  // Substage 2 starts at tick 57_600
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 57_599,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.substageTransitioned).toBe(true);
  expect(result.stageTransitioned).toBe(false);
  expect(result.growth.substage).toBe(2);
  expect(result.previousSubstage).toBe(1);
});

test("processGrowthTick does not modify battle stats on substage transition", () => {
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 57_599,
    },
    battleStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.substageTransitioned).toBe(true);
  expect(result.battleStats.strength).toBe(10);
});

// getNextStage tests
test("getNextStage returns child for baby", () => {
  expect(getNextStage("baby")).toBe("child");
});

test("getNextStage returns teen for child", () => {
  expect(getNextStage("child")).toBe("teen");
});

test("getNextStage returns youngAdult for teen", () => {
  expect(getNextStage("teen")).toBe("youngAdult");
});

test("getNextStage returns adult for youngAdult", () => {
  expect(getNextStage("youngAdult")).toBe("adult");
});

test("getNextStage returns null for adult", () => {
  expect(getNextStage("adult")).toBeNull();
});

// getTicksUntilNextStage tests
test("getTicksUntilNextStage returns correct ticks for baby at start", () => {
  const ticks = getTicksUntilNextStage("baby", 0);
  expect(ticks).toBe(172_800); // Child stage starts at 172_800
});

test("getTicksUntilNextStage returns correct ticks for baby halfway", () => {
  const ticks = getTicksUntilNextStage("baby", 86_400);
  expect(ticks).toBe(86_400); // Half way to child
});

test("getTicksUntilNextStage returns null for adult", () => {
  const ticks = getTicksUntilNextStage("adult", 1_036_800);
  expect(ticks).toBeNull();
});

// getTicksUntilNextSubstage tests
test("getTicksUntilNextSubstage returns ticks for substage 1", () => {
  const ticks = getTicksUntilNextSubstage("baby", 1, 0);
  // Baby has 3 substages over 172_800 ticks = 57_600 per substage
  expect(ticks).toBe(57_600);
});

test("getTicksUntilNextSubstage returns null at max substage", () => {
  const ticks = getTicksUntilNextSubstage("baby", 3, 172_000);
  expect(ticks).toBeNull();
});

// getStageProgressPercent tests
test("getStageProgressPercent returns 0 at stage start", () => {
  expect(getStageProgressPercent("baby", 0)).toBe(0);
});

test("getStageProgressPercent returns 50 halfway through stage", () => {
  expect(getStageProgressPercent("baby", 86_400)).toBe(50);
});

test("getStageProgressPercent returns 100 at stage end", () => {
  expect(getStageProgressPercent("baby", 172_800)).toBe(100);
});

// formatTicksDuration tests
test("formatTicksDuration formats minutes", () => {
  expect(formatTicksDuration(2)).toBe("1m"); // 2 ticks = 60 seconds = 1 minute
});

test("formatTicksDuration formats hours", () => {
  expect(formatTicksDuration(120)).toBe("1h"); // 120 ticks = 1 hour
});

test("formatTicksDuration formats hours and minutes", () => {
  expect(formatTicksDuration(150)).toBe("1h 15m"); // 150 ticks = 1h 15m
});

test("formatTicksDuration formats days", () => {
  expect(formatTicksDuration(2880)).toBe("1d"); // 2880 ticks = 1 day
});

test("formatTicksDuration formats days and hours", () => {
  expect(formatTicksDuration(3000)).toBe("1d 1h"); // 1 day + 1 hour
});
