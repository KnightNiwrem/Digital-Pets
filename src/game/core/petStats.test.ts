/**
 * Tests for pet stats calculation utilities.
 */

import { afterEach, beforeEach, expect, setSystemTime, test } from "bun:test";
import {
  getSpeciesById,
  getSpeciesGrowthStage,
  SPECIES,
} from "@/game/data/species";
import { createTestPet } from "@/game/testing/createTestPet";
import {
  calculateMaxStatsForAge,
  calculatePetMaxStats,
  createDefaultBonusMaxStats,
} from "./petStats";

// Frozen time for deterministic tests: 2024-12-05T12:00:00.000Z
const FROZEN_TIME = 1_733_400_000_000;

beforeEach(() => setSystemTime(FROZEN_TIME));
afterEach(() => setSystemTime());

test("calculatePetMaxStats returns correct values for baby florabit at age 0", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const maxStats = calculatePetMaxStats(pet);

  expect(maxStats).not.toBeNull();

  // Get expected values from species data
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();
  const growthStage = getSpeciesGrowthStage(SPECIES.FLORABIT.id, 0);
  expect(growthStage).toBeDefined();

  // Use optional chaining since we've asserted they exist above
  expect(maxStats?.care.satiety).toBe(growthStage?.baseStats.care.satiety);
  expect(maxStats?.care.hydration).toBe(growthStage?.baseStats.care.hydration);
  expect(maxStats?.care.happiness).toBe(growthStage?.baseStats.care.happiness);
  expect(maxStats?.energy).toBe(growthStage?.baseStats.energy);
  expect(maxStats?.careLife).toBe(growthStage?.baseStats.careLife);
});

test("calculatePetMaxStats includes bonus max stats", () => {
  const bonusMaxStats = createDefaultBonusMaxStats();
  bonusMaxStats.satiety = 10_000;
  bonusMaxStats.hydration = 5_000;
  bonusMaxStats.happiness = 2_500;
  bonusMaxStats.energy = 1_000;
  bonusMaxStats.careLife = 500;

  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
    bonusMaxStats,
  });
  const maxStats = calculatePetMaxStats(pet);

  expect(maxStats).not.toBeNull();

  const growthStage = getSpeciesGrowthStage(SPECIES.FLORABIT.id, 0);
  expect(growthStage).toBeDefined();

  // Using ?? 0 to satisfy linter while tests verify values exist
  const baseSatiety = growthStage?.baseStats.care.satiety ?? 0;
  const baseHydration = growthStage?.baseStats.care.hydration ?? 0;
  const baseHappiness = growthStage?.baseStats.care.happiness ?? 0;
  const baseEnergy = growthStage?.baseStats.energy ?? 0;
  const baseCareLife = growthStage?.baseStats.careLife ?? 0;

  expect(maxStats?.care.satiety).toBe(baseSatiety + 10_000);
  expect(maxStats?.care.hydration).toBe(baseHydration + 5_000);
  expect(maxStats?.care.happiness).toBe(baseHappiness + 2_500);
  expect(maxStats?.energy).toBe(baseEnergy + 1_000);
  expect(maxStats?.careLife).toBe(baseCareLife + 500);
});

test("calculatePetMaxStats returns null for invalid species", () => {
  const pet = createTestPet();
  pet.identity.speciesId = "invalid_species";

  const maxStats = calculatePetMaxStats(pet);
  expect(maxStats).toBeNull();
});

test("calculatePetMaxStats values differ between growth stages", () => {
  const babyPet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });

  // Get the age ticks for an adult stage
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();
  // Find the adult stage min age (subStage is a string)
  const adultStage = species?.growthStages.find(
    (s) => s.stage === "adult" && s.subStage === "1",
  );
  expect(adultStage).toBeDefined();

  const adultPet = createTestPet({
    growth: {
      stage: "adult",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: adultStage?.minAgeTicks ?? 0,
    },
  });

  const babyStats = calculatePetMaxStats(babyPet);
  const adultStats = calculatePetMaxStats(adultPet);

  expect(babyStats).not.toBeNull();
  expect(adultStats).not.toBeNull();

  // Adult should have higher care stat caps than baby
  // Use ?? 0 to satisfy linter, tests verify non-null above
  expect(adultStats?.care.satiety ?? 0).toBeGreaterThan(
    babyStats?.care.satiety ?? 0,
  );
  expect(adultStats?.energy ?? 0).toBeGreaterThan(babyStats?.energy ?? 0);
});

test("calculateMaxStatsForAge returns correct values when called directly", () => {
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();

  const bonusMaxStats = createDefaultBonusMaxStats();
  const maxStats = calculateMaxStatsForAge(
    SPECIES.FLORABIT.id,
    0,
    bonusMaxStats,
  );
  expect(maxStats).not.toBeNull();

  const growthStage = getSpeciesGrowthStage(SPECIES.FLORABIT.id, 0);
  expect(growthStage).toBeDefined();

  expect(maxStats?.care.satiety).toBe(growthStage?.baseStats.care.satiety);
  expect(maxStats?.care.hydration).toBe(growthStage?.baseStats.care.hydration);
});

test("calculateMaxStatsForAge returns null for invalid species", () => {
  const bonusMaxStats = createDefaultBonusMaxStats();
  const maxStats = calculateMaxStatsForAge("invalid_species", 0, bonusMaxStats);
  expect(maxStats).toBeNull();
});

test("createDefaultBonusMaxStats creates zero-initialized bonus stats", () => {
  const bonus = createDefaultBonusMaxStats();

  expect(bonus.satiety).toBe(0);
  expect(bonus.hydration).toBe(0);
  expect(bonus.happiness).toBe(0);
  expect(bonus.energy).toBe(0);
  expect(bonus.careLife).toBe(0);
  expect(bonus.battle.strength).toBe(0);
  expect(bonus.battle.endurance).toBe(0);
  expect(bonus.battle.agility).toBe(0);
  expect(bonus.battle.precision).toBe(0);
  expect(bonus.battle.fortitude).toBe(0);
  expect(bonus.battle.cunning).toBe(0);
});

test("emberfox has 4 child substages", () => {
  const species = getSpeciesById(SPECIES.EMBERFOX.id);
  expect(species).toBeDefined();

  const childStages =
    species?.growthStages.filter((s) => s.stage === "child") ?? [];
  expect(childStages.length).toBe(4);

  // Verify substages are numbered correctly (as strings)
  expect(childStages.map((s) => s.subStage).sort()).toEqual([
    "1",
    "2",
    "3",
    "4",
  ]);
});

test("florabit has 3 child substages", () => {
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();

  const childStages =
    species?.growthStages.filter((s) => s.stage === "child") ?? [];
  expect(childStages.length).toBe(3);

  // Verify substages are numbered correctly (as strings)
  expect(childStages.map((s) => s.subStage).sort()).toEqual(["1", "2", "3"]);
});

test("calculateMaxStatsForAge handles age progression correctly", () => {
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();
  const bonusMaxStats = createDefaultBonusMaxStats();

  // Get stats at different ages
  const statsAtAge0 = calculateMaxStatsForAge(
    SPECIES.FLORABIT.id,
    0,
    bonusMaxStats,
  );

  // Find the child stage 1 min age (subStage is a string)
  const childStage1 = species?.growthStages.find(
    (s) => s.stage === "child" && s.subStage === "1",
  );
  expect(childStage1).toBeDefined();

  const statsAtChildAge = calculateMaxStatsForAge(
    SPECIES.FLORABIT.id,
    childStage1?.minAgeTicks ?? 0,
    bonusMaxStats,
  );

  expect(statsAtAge0).not.toBeNull();
  expect(statsAtChildAge).not.toBeNull();

  // Stats should progress as the pet ages
  expect(statsAtChildAge?.care.satiety ?? 0).toBeGreaterThan(
    statsAtAge0?.care.satiety ?? 0,
  );
});
