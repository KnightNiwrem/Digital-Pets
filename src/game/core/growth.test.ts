/**
 * Tests for growth logic.
 */

import { expect, test } from "bun:test";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
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
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: GROWTH_STAGE_DEFINITIONS.child.minAgeTicks - 1,
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

test("processGrowthTick transitions child to teen", () => {
  const pet = createTestPet({
    growth: {
      stage: "child",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: GROWTH_STAGE_DEFINITIONS.teen.minAgeTicks - 1,
    },
    battleStats: {
      strength: 13,
      endurance: 13,
      agility: 13,
      precision: 13,
      fortitude: 13,
      cunning: 13,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.stageTransitioned).toBe(true);
  expect(result.growth.stage).toBe("teen");
  expect(result.previousStage).toBe("child");
  expect(result.battleStats.strength).toBe(16);
});

test("processGrowthTick transitions teen to youngAdult", () => {
  const pet = createTestPet({
    growth: {
      stage: "teen",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: GROWTH_STAGE_DEFINITIONS.youngAdult.minAgeTicks - 1,
    },
    battleStats: {
      strength: 16,
      endurance: 16,
      agility: 16,
      precision: 16,
      fortitude: 16,
      cunning: 16,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.stageTransitioned).toBe(true);
  expect(result.growth.stage).toBe("youngAdult");
  expect(result.previousStage).toBe("teen");
  expect(result.battleStats.strength).toBe(19);
});

test("processGrowthTick transitions youngAdult to adult", () => {
  const pet = createTestPet({
    growth: {
      stage: "youngAdult",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: GROWTH_STAGE_DEFINITIONS.adult.minAgeTicks - 1,
    },
    battleStats: {
      strength: 19,
      endurance: 19,
      agility: 19,
      precision: 19,
      fortitude: 19,
      cunning: 19,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.stageTransitioned).toBe(true);
  expect(result.growth.stage).toBe("adult");
  expect(result.previousStage).toBe("youngAdult");
  expect(result.battleStats.strength).toBe(22);
});

test("processGrowthTick transitions substage within stage", () => {
  // Baby has 3 substages, calculate tick for substage transition
  const babyDef = GROWTH_STAGE_DEFINITIONS.baby;
  const childDef = GROWTH_STAGE_DEFINITIONS.child;
  const stageDuration = childDef.minAgeTicks - babyDef.minAgeTicks;
  const substageLength = Math.floor(stageDuration / babyDef.substageCount);
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: substageLength - 1,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.substageTransitioned).toBe(true);
  expect(result.stageTransitioned).toBe(false);
  expect(result.growth.substage).toBe(2);
  expect(result.previousSubstage).toBe(1);
});

test("processGrowthTick does not modify battle stats on substage transition", () => {
  const babyDef = GROWTH_STAGE_DEFINITIONS.baby;
  const childDef = GROWTH_STAGE_DEFINITIONS.child;
  const stageDuration = childDef.minAgeTicks - babyDef.minAgeTicks;
  const substageLength = Math.floor(stageDuration / babyDef.substageCount);
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: substageLength - 1,
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
  expect(ticks).toBe(GROWTH_STAGE_DEFINITIONS.child.minAgeTicks);
});

test("getTicksUntilNextStage returns correct ticks for baby halfway", () => {
  const halfwayTicks = GROWTH_STAGE_DEFINITIONS.child.minAgeTicks / 2;
  const ticks = getTicksUntilNextStage("baby", halfwayTicks);
  expect(ticks).toBe(halfwayTicks);
});

test("getTicksUntilNextStage returns null for adult", () => {
  const ticks = getTicksUntilNextStage(
    "adult",
    GROWTH_STAGE_DEFINITIONS.adult.minAgeTicks,
  );
  expect(ticks).toBeNull();
});

// getTicksUntilNextSubstage tests
test("getTicksUntilNextSubstage returns ticks for substage 1", () => {
  const babyDef = GROWTH_STAGE_DEFINITIONS.baby;
  const childDef = GROWTH_STAGE_DEFINITIONS.child;
  const stageDuration = childDef.minAgeTicks - babyDef.minAgeTicks;
  const expectedSubstageLength = Math.floor(
    stageDuration / babyDef.substageCount,
  );
  const ticks = getTicksUntilNextSubstage("baby", 1, 0);
  expect(ticks).toBe(expectedSubstageLength);
});

test("getTicksUntilNextSubstage returns null at max substage", () => {
  const ticks = getTicksUntilNextSubstage(
    "baby",
    3,
    GROWTH_STAGE_DEFINITIONS.child.minAgeTicks - 800,
  );
  expect(ticks).toBeNull();
});

// getStageProgressPercent tests
test("getStageProgressPercent returns 0 at stage start", () => {
  expect(getStageProgressPercent("baby", 0)).toBe(0);
});

test("getStageProgressPercent returns 50 halfway through stage", () => {
  const halfwayTicks = GROWTH_STAGE_DEFINITIONS.child.minAgeTicks / 2;
  expect(getStageProgressPercent("baby", halfwayTicks)).toBe(50);
});

test("getStageProgressPercent returns 100 at stage end", () => {
  expect(
    getStageProgressPercent("baby", GROWTH_STAGE_DEFINITIONS.child.minAgeTicks),
  ).toBe(100);
});

// formatTicksDuration tests
test("formatTicksDuration formats 0 ticks", () => {
  expect(formatTicksDuration(0)).toBe("0m");
});

test("formatTicksDuration formats 1 tick (less than a minute)", () => {
  expect(formatTicksDuration(1)).toBe("0m");
});

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
