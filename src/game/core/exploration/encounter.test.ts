/**
 * Tests for the encounter system.
 */

import { describe, expect, spyOn, test } from "bun:test";
import {
  calculateWildLevel,
  forceEncounter,
  getApproximatePetLevel,
  rollForEncounter,
} from "@/game/core/exploration/encounter";
import * as encounterTables from "@/game/data/tables/encounters";
import { EncounterType } from "@/game/data/tables/encounters";
import { createTestPet } from "@/game/testing/createTestPet";
import { GrowthStage } from "@/game/types/constants";

describe("calculateWildLevel", () => {
  test("returns 1 for unknown location", () => {
    const result = calculateWildLevel("unknown_location", 5);
    expect(result).toBe(1);
  });

  test("returns level within location range", () => {
    // Meadow has levelMin: 1, levelMax: 5
    const result = calculateWildLevel("meadow", 1);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10); // Base + scaling + random
  });

  test("scales with player pet level", () => {
    // Higher player level should increase wild level due to scaling factor
    const lowLevelResults: number[] = [];
    const highLevelResults: number[] = [];

    for (let i = 0; i < 100; i++) {
      lowLevelResults.push(calculateWildLevel("meadow", 1));
      highLevelResults.push(calculateWildLevel("meadow", 50));
    }

    const lowAvg =
      lowLevelResults.reduce((a, b) => a + b, 0) / lowLevelResults.length;
    const highAvg =
      highLevelResults.reduce((a, b) => a + b, 0) / highLevelResults.length;

    // High level player should encounter higher level pets on average
    expect(highAvg).toBeGreaterThan(lowAvg);
  });
});

describe("getApproximatePetLevel", () => {
  test("returns level based on battle stats", () => {
    const pet = createTestPet({
      battleStats: {
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
    });

    const level = getApproximatePetLevel(pet);
    expect(level).toBe(5); // (10+10+10+10+10+10) / 6 / 2 = 5
  });

  test("returns minimum level of 1", () => {
    const pet = createTestPet({
      battleStats: {
        strength: 1,
        endurance: 1,
        agility: 1,
        precision: 1,
        fortitude: 1,
        cunning: 1,
      },
    });

    const level = getApproximatePetLevel(pet);
    expect(level).toBeGreaterThanOrEqual(1);
  });
});

describe("forceEncounter", () => {
  test("returns no encounter for unknown location", () => {
    const pet = createTestPet();
    const result = forceEncounter("unknown_location", pet);
    expect(result.hasEncounter).toBe(false);
  });

  test("returns no encounter for location without encounter table", () => {
    const pet = createTestPet();
    // Home location doesn't have an encounter table
    const result = forceEncounter("home", pet);
    expect(result.hasEncounter).toBe(false);
  });

  test("returns encounter for wild location with encounter table", () => {
    const pet = createTestPet({
      growth: { stage: GrowthStage.Adult },
    });
    // Meadow has an encounter table
    const result = forceEncounter("meadow", pet);
    expect(result.hasEncounter).toBe(true);
    expect(result.speciesId).toBeDefined();
    expect(result.level).toBeDefined();
    expect(result.level).toBeGreaterThanOrEqual(1);
  });

  test("respects pet stage requirements", () => {
    const babyPet = createTestPet({
      growth: { stage: GrowthStage.Baby },
    });
    const adultPet = createTestPet({
      growth: { stage: GrowthStage.Adult },
    });

    // Both should get encounters since meadow has no stage requirements
    const babyResult = forceEncounter("meadow", babyPet);
    const adultResult = forceEncounter("meadow", adultPet);

    expect(babyResult.hasEncounter).toBe(true);
    expect(adultResult.hasEncounter).toBe(true);
  });
});

describe("rollForEncounter", () => {
  test("returns no encounter when random roll exceeds encounter chance", () => {
    const pet = createTestPet();
    // With 0 encounter chance, should never trigger
    const result = rollForEncounter("meadow", pet, "foraging", 0);
    expect(result.hasEncounter).toBe(false);
  });

  test("returns no encounter for location without encounter table", () => {
    const pet = createTestPet();
    const result = rollForEncounter("home", pet, "foraging", 1.0);
    expect(result.hasEncounter).toBe(false);
  });

  test("can return encounter when roll is within chance", () => {
    const pet = createTestPet({
      growth: { stage: GrowthStage.Adult },
    });

    // Mock Math.random to ensure encounter triggers and selection is predictable
    const randomSpy = spyOn(Math, "random").mockReturnValue(0);

    // With 100% encounter chance and mocked random, should always trigger
    const result = rollForEncounter("meadow", pet, "foraging", 1.0);

    expect(result.hasEncounter).toBe(true);
    expect(result.speciesId).toBeDefined();
    expect(result.level).toBeDefined();

    // Restore original Math.random
    randomSpy.mockRestore();
  });

  test("filters encounters by activity", () => {
    const getEncounterTableSpy = spyOn(
      encounterTables,
      "getEncounterTable",
    ).mockImplementation(() => ({
      id: "test-meadow-table",
      baseEncounterChance: 1.0,
      entries: [
        {
          encounterType: EncounterType.WildBattle,
          probability: 1,
          speciesIds: ["florabit"],
          levelOffset: [0, 0] as [number, number],
          activityIds: ["foraging"], // Only for foraging
        },
      ],
    }));

    // Mock Math.random to ensure predictable behavior
    const randomSpy = spyOn(Math, "random").mockReturnValue(0);

    const pet = createTestPet({
      growth: { stage: GrowthStage.Adult },
    });

    // Foraging should find an encounter
    const foragingResult = rollForEncounter("meadow", pet, "foraging", 1.0);
    expect(foragingResult.hasEncounter).toBe(true);

    // Mining should not find an encounter (filtered out by activityIds)
    const miningResult = rollForEncounter("meadow", pet, "mining", 1.0);
    expect(miningResult.hasEncounter).toBe(false);

    getEncounterTableSpy.mockRestore();
    randomSpy.mockRestore();
  });
});
