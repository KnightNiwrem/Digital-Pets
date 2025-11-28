/**
 * Tests for growth logic.
 */

import { expect, test } from "bun:test";
import {
  getSpeciesById,
  getSpeciesGrowthStage,
  SPECIES,
} from "@/game/data/species";
import { createTestPet } from "@/game/testing/createTestPet";
import type { GrowthStage } from "@/game/types/constants";
import { getNextStage, processGrowthTick } from "./growth";

// Helper to get the min age ticks for a given stage from species data
function getStageMinAgeTicks(speciesId: string, stage: GrowthStage): number {
  const species = getSpeciesById(speciesId);
  if (!species) return 0;
  const growthStage = species.growthStages.find(
    (gs) => gs.stage === stage && gs.subStage === "1",
  );
  return growthStage?.minAgeTicks ?? 0;
}

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
  const childMinAge = getStageMinAgeTicks(SPECIES.FLORABIT.id, "child");
  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 3,
      birthTime: Date.now(),
      ageTicks: childMinAge - 1,
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
  // Battle stats come from species growth stage definition now
  // Verify they're updated
  expect(result.battleStats.strength).toBeGreaterThan(0);
});

// Parameterized tests for stage transitions
const stageTransitions: {
  from: GrowthStage;
  to: GrowthStage;
}[] = [
  { from: "child", to: "teen" },
  { from: "teen", to: "youngAdult" },
  { from: "youngAdult", to: "adult" },
];

for (const { from, to } of stageTransitions) {
  test(`processGrowthTick transitions from ${from} to ${to}`, () => {
    const toMinAge = getStageMinAgeTicks(SPECIES.FLORABIT.id, to);
    const pet = createTestPet({
      growth: {
        stage: from,
        substage: 3,
        birthTime: Date.now(),
        ageTicks: toMinAge - 1,
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
    expect(result.growth.stage).toBe(to);
    expect(result.previousStage).toBe(from);
  });
}

test("processGrowthTick handles substage transitions", () => {
  // Get the min age for baby substage 2 (subStage is a string)
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  const babySubstage2 = species?.growthStages.find(
    (gs) => gs.stage === "baby" && gs.subStage === "2",
  );
  if (!babySubstage2) return;

  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: babySubstage2.minAgeTicks - 1,
    },
  });
  const result = processGrowthTick(pet);

  expect(result.substageTransitioned).toBe(true);
  expect(result.stageTransitioned).toBe(false);
  expect(result.growth.substage).toBe(2);
  expect(result.previousSubstage).toBe(1);
});

test("processGrowthTick recalculates battle stats on substage transition", () => {
  // Get the min age for baby substage 2 (subStage is a string)
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  const babySubstage2 = species?.growthStages.find(
    (gs) => gs.stage === "baby" && gs.subStage === "2",
  );
  if (!babySubstage2) return;

  const pet = createTestPet({
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: babySubstage2.minAgeTicks - 1,
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
  // Battle stats should be recalculated with new base stats from substage 2
  // Baby substage 2 has base stats of 11 for all battle stats
  expect(result.battleStats.strength).toBe(
    babySubstage2.baseStats.battle.strength,
  );
  expect(result.battleStats.endurance).toBe(
    babySubstage2.baseStats.battle.endurance,
  );
  expect(result.battleStats.agility).toBe(
    babySubstage2.baseStats.battle.agility,
  );
  expect(result.battleStats.precision).toBe(
    babySubstage2.baseStats.battle.precision,
  );
  expect(result.battleStats.fortitude).toBe(
    babySubstage2.baseStats.battle.fortitude,
  );
  expect(result.battleStats.cunning).toBe(
    babySubstage2.baseStats.battle.cunning,
  );
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

// Species-specific growth stage tests
test("getSpeciesGrowthStage returns correct stage for age 0", () => {
  const stage = getSpeciesGrowthStage(SPECIES.FLORABIT, 0);
  expect(stage).toBeDefined();
  expect(stage?.stage).toBe("baby");
  expect(stage?.subStage).toBe("1");
});

test("getSpeciesGrowthStage returns correct stage for adult age", () => {
  const adultMinAge = getStageMinAgeTicks(SPECIES.FLORABIT.id, "adult");
  const stage = getSpeciesGrowthStage(SPECIES.FLORABIT, adultMinAge);
  expect(stage).toBeDefined();
  expect(stage?.stage).toBe("adult");
});

test("emberfox has 4 child substages in growth", () => {
  const species = getSpeciesById(SPECIES.EMBERFOX.id);
  expect(species).toBeDefined();

  const childStages =
    species?.growthStages.filter((gs) => gs.stage === "child") ?? [];
  expect(childStages.length).toBe(4);
});

test("florabit has 3 child substages in growth", () => {
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();

  const childStages =
    species?.growthStages.filter((gs) => gs.stage === "child") ?? [];
  expect(childStages.length).toBe(3);
});
