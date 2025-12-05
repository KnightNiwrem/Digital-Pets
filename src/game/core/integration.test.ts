/**
 * Integration tests for game systems working together.
 * Tests the interaction between multiple game mechanics.
 */

import { describe, expect, test } from "bun:test";
import { calculateDamage } from "@/game/core/battle/damage";
import { applyCareLifeChange } from "@/game/core/care/careLife";
import { applyCareDecay } from "@/game/core/care/careStats";
import { calculatePetMaxStats } from "@/game/core/petStats";
import {
  processGameTick,
  processMultipleTicks,
  processOfflineCatchup,
} from "@/game/core/tickProcessor";
import {
  createSleepingTestPet,
  createTestPet,
} from "@/game/testing/createTestPet";
import { DamageType, GrowthStage } from "@/game/types/constants";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import type { Move } from "@/game/types/move";
import { createDefaultResistances } from "@/game/types/stats";

// Fixed timestamp for deterministic test fixtures
const FROZEN_TIME = 1_733_400_000_000;

// Helper to create test game state
function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState(),
    ...overrides,
  };
}

describe("Care system integration", () => {
  test("care stats and care life work together correctly", () => {
    // Start with a pet that has exactly 0 satiety (critical)
    // With ceiling rounding, a stat is only 0 when microValue is exactly 0
    const pet = createTestPet({
      careStats: {
        satiety: 0, // Exactly 0 - critical stat
        hydration: 40_000,
        happiness: 40_000,
      },
      careLifeStats: {
        careLife: 72_000,
      },
    });

    // Process care life - should drain since satiety is 0
    const maxStats = calculatePetMaxStats(pet);
    // Use proper per-stat max care values
    const maxCareStats = maxStats
      ? {
          satiety: maxStats.care.satiety,
          hydration: maxStats.care.hydration,
          happiness: maxStats.care.happiness,
        }
      : { satiety: 0, hydration: 0, happiness: 0 };
    const maxCareLife = maxStats?.careLife ?? 0;
    const updatedCareLife = applyCareLifeChange(pet, maxCareStats, maxCareLife);

    // Care life should have decreased
    expect(updatedCareLife).toBeLessThan(72_000);
  });

  test("sleeping reduces care decay rate", () => {
    const awakePet = createTestPet({
      careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
    });
    const sleepingPet = createSleepingTestPet({
      careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
    });

    const awakeStats = applyCareDecay(awakePet);
    const sleepingStats = applyCareDecay(sleepingPet);

    // Awake pet should have decayed more than sleeping pet
    expect(awakeStats.satiety).toBeLessThan(sleepingStats.satiety);
    expect(awakeStats.hydration).toBeLessThan(sleepingStats.hydration);
  });

  test("multiple ticks accumulate care decay correctly", () => {
    const state = createTestGameState({
      pet: createTestPet({
        careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
        growth: {
          stage: GrowthStage.Baby,
          substage: 1,
          birthTime: FROZEN_TIME,
          ageTicks: 0,
        },
      }),
      totalTicks: 0,
    });

    // Process 100 ticks
    const afterTicks = processMultipleTicks(state, 100);

    // Stats should have decayed significantly
    // 100 ticks * 50 decay per tick = 5000 micro units
    expect(afterTicks.pet?.careStats.satiety).toBe(40_000 - 5_000);
    expect(afterTicks.pet?.careStats.hydration).toBe(40_000 - 5_000);
  });

  test("poop affects happiness decay rate", () => {
    const cleanPet = createTestPet({
      careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
      poop: { count: 0, ticksUntilNext: 480 },
    });
    const dirtyPet = createTestPet({
      careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
      poop: { count: 7, ticksUntilNext: 480 },
    });

    const cleanStats = applyCareDecay(cleanPet);
    const dirtyStats = applyCareDecay(dirtyPet);

    // Dirty pet should have more happiness decay (3x multiplier for 7+ poop)
    expect(dirtyStats.happiness).toBeLessThan(cleanStats.happiness);
    // But satiety and hydration should be the same
    expect(dirtyStats.satiety).toBe(cleanStats.satiety);
  });
});

describe("Battle system integration", () => {
  const createTestMove = (overrides: Partial<Move> = {}): Move => ({
    id: "test_move",
    name: "Test Move",
    description: "A test move",
    power: 1.0,
    flatDamage: 10,
    damageType: DamageType.Crushing,
    staminaCost: 10,
    cooldown: 0,
    accuracyModifier: 0,
    effects: [],
    target: "enemy",
    ...overrides,
  });

  test("damage calculation respects all combat stats", () => {
    const attacker = {
      battleStats: {
        strength: 50,
        endurance: 10,
        agility: 10,
        precision: 30,
        fortitude: 10,
        cunning: 10,
      },
      criticalChance: 0, // Disable crits for consistent testing
      criticalDamage: 1.5,
    };

    const weakDefender = {
      battleStats: {
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
      resistances: createDefaultResistances(),
      dodgeChance: 0,
    };

    const tankDefender = {
      battleStats: {
        strength: 10,
        endurance: 100,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
      resistances: createDefaultResistances(),
      dodgeChance: 0,
    };

    const move = createTestMove({ power: 2.0, flatDamage: 10 });

    // Run multiple trials to account for variance
    let weakTotal = 0;
    let tankTotal = 0;
    const trials = 100;

    for (let i = 0; i < trials; i++) {
      const weakResult = calculateDamage(attacker, weakDefender, move);
      const tankResult = calculateDamage(attacker, tankDefender, move);
      if (weakResult.isHit) weakTotal += weakResult.damage;
      if (tankResult.isHit) tankTotal += tankResult.damage;
    }

    // Tank should take less damage on average due to endurance mitigation
    expect(tankTotal / trials).toBeLessThan(weakTotal / trials);
  });

  test("damage type resistances reduce damage", () => {
    const attacker = {
      battleStats: {
        strength: 50,
        endurance: 10,
        agility: 10,
        precision: 100,
        fortitude: 10,
        cunning: 10,
      },
      criticalChance: 0,
      criticalDamage: 1.5,
    };

    const noResistDefender = {
      battleStats: {
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
      resistances: { ...createDefaultResistances(), crushing: 0 },
      dodgeChance: 0,
    };

    const resistDefender = {
      battleStats: {
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      },
      resistances: { ...createDefaultResistances(), crushing: 50 },
      dodgeChance: 0,
    };

    const move = createTestMove({ damageType: DamageType.Crushing });

    // Run trials
    let noResistTotal = 0;
    let resistTotal = 0;
    const trials = 100;

    for (let i = 0; i < trials; i++) {
      const noResistResult = calculateDamage(attacker, noResistDefender, move);
      const resistResult = calculateDamage(attacker, resistDefender, move);
      if (noResistResult.isHit) noResistTotal += noResistResult.damage;
      if (resistResult.isHit) resistTotal += resistResult.damage;
    }

    // Defender with resistance should take less damage
    expect(resistTotal / trials).toBeLessThan(noResistTotal / trials);
  });
});

describe("Tick processor integration", () => {
  test("processGameTick updates all pet systems in correct order", () => {
    const pet = createTestPet({
      careStats: { satiety: 40_000, hydration: 40_000, happiness: 40_000 },
      energyStats: { energy: 40_000 },
      growth: {
        stage: GrowthStage.Baby,
        substage: 1,
        birthTime: FROZEN_TIME,
        ageTicks: 0,
      },
      poop: { count: 0, ticksUntilNext: 960 }, // POOP_MICRO_THRESHOLD
    });

    const state = createTestGameState({ pet, totalTicks: 0 });
    const newState = processGameTick(state);

    // Verify all systems were updated
    expect(newState.totalTicks).toBe(1);
    expect(newState.pet?.growth.ageTicks).toBe(1);
    expect(newState.pet?.careStats.satiety).toBeLessThan(40_000);
    expect(newState.pet?.poop.ticksUntilNext).toBe(958); // 960 - 2 (awake decay rate)
  });

  test("offline catchup processes many ticks correctly", () => {
    const pet = createTestPet({
      careStats: { satiety: 100_000, hydration: 100_000, happiness: 100_000 },
      growth: {
        stage: GrowthStage.Adult,
        substage: 1,
        birthTime: FROZEN_TIME - 1_000_000,
        ageTicks: 0,
      },
    });

    const state = createTestGameState({ pet, totalTicks: 0 });

    // Simulate 1 hour offline (120 ticks)
    const result = processOfflineCatchup(state, 120, 20160);

    expect(result.ticksProcessed).toBe(120);
    expect(result.wasCapped).toBe(false);
    expect(result.state.pet?.growth.ageTicks).toBe(120);

    // Stats should have decayed from initial value
    // Note: decay is 50 per tick for awake pets, so 120 * 50 = 6000 micro units
    expect(result.state.pet?.careStats.satiety).toBeLessThan(100_000);
    expect(result.state.pet?.careStats.hydration).toBeLessThan(100_000);
  });

  test("offline catchup respects max offline ticks cap", () => {
    const pet = createTestPet();
    const state = createTestGameState({ pet, totalTicks: 0 });

    // Request more ticks than allowed
    const result = processOfflineCatchup(state, 50000, 20160);

    expect(result.ticksProcessed).toBe(20160);
    expect(result.wasCapped).toBe(true);
  });

  test("offline report contains correct before/after stats", () => {
    const pet = createTestPet({
      careStats: { satiety: 50_000, hydration: 50_000, happiness: 50_000 },
      energyStats: { energy: 50_000 },
    });

    const state = createTestGameState({ pet, totalTicks: 0 });
    const result = processOfflineCatchup(state, 10, 100);

    expect(result.report.beforeStats).not.toBeNull();
    expect(result.report.afterStats).not.toBeNull();
    expect(result.report.beforeStats?.satiety).toBe(50_000);
    expect(result.report.afterStats?.satiety).toBeLessThan(50_000);
  });
});

describe("Growth system integration", () => {
  test("pet ages correctly over time", () => {
    const pet = createTestPet({
      growth: {
        stage: GrowthStage.Baby,
        substage: 1,
        birthTime: FROZEN_TIME,
        ageTicks: 0,
      },
    });

    const state = createTestGameState({ pet, totalTicks: 0 });
    const newState = processMultipleTicks(state, 100);

    expect(newState.pet?.growth.ageTicks).toBe(100);
  });
});

describe("Energy system integration", () => {
  test("energy regenerates faster while sleeping", () => {
    const awakePet = createTestPet({
      energyStats: { energy: 20_000 },
    });
    const sleepingPet = createSleepingTestPet({
      energyStats: { energy: 20_000 },
    });

    const awakeState = createTestGameState({ pet: awakePet, totalTicks: 0 });
    const sleepingState = createTestGameState({
      pet: sleepingPet,
      totalTicks: 0,
    });

    const awakeAfter = processMultipleTicks(awakeState, 10);
    const sleepingAfter = processMultipleTicks(sleepingState, 10);

    // Sleeping pet should have more energy (faster regen)
    expect(sleepingAfter.pet?.energyStats.energy).toBeGreaterThan(
      awakeAfter.pet?.energyStats.energy ?? 0,
    );
  });
});
