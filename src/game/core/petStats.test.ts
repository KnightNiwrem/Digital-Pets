/**
 * Tests for pet stats calculation utilities.
 */

import { expect, test } from "bun:test";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { Pet } from "@/game/types/pet";
import { calculatePetMaxStats } from "./petStats";

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

test("calculatePetMaxStats returns correct values for baby florabit", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const maxStats = calculatePetMaxStats(pet);

  expect(maxStats).not.toBeNull();

  const species = getSpeciesById("florabit");
  expect(species).toBeDefined();
  const stageDef = GROWTH_STAGE_DEFINITIONS.baby;

  const expectedCareMax = Math.floor(
    stageDef.baseCareStatMax * (species?.careCapMultiplier ?? 1),
  );
  const expectedEnergyMax = Math.floor(
    stageDef.baseEnergyMax * (species?.careCapMultiplier ?? 1),
  );

  expect(maxStats?.careStatMax).toBe(expectedCareMax);
  expect(maxStats?.energyMax).toBe(expectedEnergyMax);
});

test("calculatePetMaxStats returns correct values for adult stage", () => {
  const pet = createTestPet({
    growth: {
      stage: "adult",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 1_000_000,
    },
  });
  const maxStats = calculatePetMaxStats(pet);

  expect(maxStats).not.toBeNull();

  const species = getSpeciesById("florabit");
  expect(species).toBeDefined();
  const stageDef = GROWTH_STAGE_DEFINITIONS.adult;

  const expectedCareMax = Math.floor(
    stageDef.baseCareStatMax * (species?.careCapMultiplier ?? 1),
  );
  const expectedEnergyMax = Math.floor(
    stageDef.baseEnergyMax * (species?.careCapMultiplier ?? 1),
  );

  expect(maxStats?.careStatMax).toBe(expectedCareMax);
  expect(maxStats?.energyMax).toBe(expectedEnergyMax);
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
  const adultPet = createTestPet({
    growth: {
      stage: "adult",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 1_000_000,
    },
  });

  const babyStats = calculatePetMaxStats(babyPet);
  const adultStats = calculatePetMaxStats(adultPet);

  expect(babyStats).not.toBeNull();
  expect(adultStats).not.toBeNull();

  // Use nullish coalescing to satisfy linter while tests verify non-null above
  expect(adultStats?.careStatMax ?? 0).toBeGreaterThan(
    babyStats?.careStatMax ?? 0,
  );
  expect(adultStats?.energyMax ?? 0).toBeGreaterThan(babyStats?.energyMax ?? 0);
});
