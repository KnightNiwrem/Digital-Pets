/**
 * Tests for pet stats calculation utilities.
 */

import { expect, test } from "bun:test";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById, SPECIES } from "@/game/data/species";
import { createTestPet } from "@/game/testing/createTestPet";
import { calculateMaxStats, calculatePetMaxStats } from "./petStats";

test("calculatePetMaxStats returns correct values for baby florabit", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const maxStats = calculatePetMaxStats(pet);

  expect(maxStats).not.toBeNull();

  const species = getSpeciesById(SPECIES.FLORABIT.id);
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

  const species = getSpeciesById(SPECIES.FLORABIT.id);
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

test("calculateMaxStats returns correct values when called directly", () => {
  const species = getSpeciesById(SPECIES.FLORABIT.id);
  expect(species).toBeDefined();

  const maxStats = calculateMaxStats(SPECIES.FLORABIT.id, "baby");
  expect(maxStats).not.toBeNull();

  const stageDef = GROWTH_STAGE_DEFINITIONS.baby;
  const expectedCareMax = Math.floor(
    stageDef.baseCareStatMax * (species?.careCapMultiplier ?? 1),
  );

  expect(maxStats?.careStatMax).toBe(expectedCareMax);
});

test("calculateMaxStats returns null for invalid species", () => {
  const maxStats = calculateMaxStats("invalid_species", "baby");
  expect(maxStats).toBeNull();
});

test("calculateMaxStats is equivalent to calculatePetMaxStats", () => {
  const pet = createTestPet({
    growth: {
      stage: "teen",
      substage: 2,
      birthTime: Date.now(),
      ageTicks: 500_000,
    },
  });

  const petStats = calculatePetMaxStats(pet);
  const directStats = calculateMaxStats(
    pet.identity.speciesId,
    pet.growth.stage,
  );

  expect(petStats).toEqual(directStats);
});
