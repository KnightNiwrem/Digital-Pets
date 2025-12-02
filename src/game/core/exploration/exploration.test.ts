/**
 * Tests for the new exploration system.
 */

import { describe, expect, test } from "bun:test";
import {
  applySkillXpGains,
  calculateExplorationDrops,
  cancelExploration,
  canStartExplorationActivity,
  completeExplorationActivity,
  getActivityCooldownRemaining,
  getAvailableActivities,
  getExplorationProgress,
  meetsRequirements,
  processExplorationTick,
  startExplorationActivity,
} from "@/game/core/exploration/exploration";
import { ActivityId } from "@/game/data/exploration/activities";
import { meadowForagingDropTable } from "@/game/data/exploration/dropTables";
import { createTestPet } from "@/game/testing/createTestPet";
import type { ActiveExploration } from "@/game/types/activity";
import { type Tick, toMicro } from "@/game/types/common";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import { createInitialSkills, SkillType } from "@/game/types/skill";

describe("meetsRequirements", () => {
  test("returns true when no requirements", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = meetsRequirements(pet, skills, [], undefined);
    expect(result.meets).toBe(true);
  });

  test("returns false when skill level too low", () => {
    const pet = createTestPet();
    const skills = createInitialSkills(); // All skills at level 1
    const result = meetsRequirements(pet, skills, [], {
      minSkillLevels: { [SkillType.Mining]: 5 },
    });
    expect(result.meets).toBe(false);
    expect(result.reason).toContain("mining");
  });

  test("returns true when skill level meets requirement", () => {
    const pet = createTestPet();
    const skills = {
      ...createInitialSkills(),
      [SkillType.Mining]: { type: SkillType.Mining, level: 5, currentXp: 0 },
    };
    const result = meetsRequirements(pet, skills, [], {
      minSkillLevels: { [SkillType.Mining]: 5 },
    });
    expect(result.meets).toBe(true);
  });

  test("returns false when pet stage too low", () => {
    const pet = createTestPet({ growth: { stage: GrowthStage.Baby } });
    const skills = createInitialSkills();
    const result = meetsRequirements(pet, skills, [], {
      minPetStage: GrowthStage.Adult,
    });
    expect(result.meets).toBe(false);
    expect(result.reason).toContain("adult");
  });

  test("returns true when pet stage meets requirement", () => {
    const pet = createTestPet({ growth: { stage: GrowthStage.Adult } });
    const skills = createInitialSkills();
    const result = meetsRequirements(pet, skills, [], {
      minPetStage: GrowthStage.Adult,
    });
    expect(result.meets).toBe(true);
  });

  test("returns false when quest not completed", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = meetsRequirements(pet, skills, [], {
      questCompleted: ["required_quest"],
    });
    expect(result.meets).toBe(false);
    expect(result.reason).toContain("required_quest");
  });

  test("returns true when quest is completed", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = meetsRequirements(pet, skills, ["required_quest"], {
      questCompleted: ["required_quest"],
    });
    expect(result.meets).toBe(true);
  });
});

describe("canStartExplorationActivity", () => {
  test("returns false when pet is not idle", () => {
    const pet = createTestPet({ activityState: ActivityState.Training });
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("training");
  });

  test("returns false for unknown activity", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      "unknown_activity",
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("Unknown activity");
  });

  test("returns false for unknown location", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "unknown_location",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("Unknown location");
  });

  test("returns false when activity not available at location", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    // Meadow doesn't have fishing activity
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Fishing,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("not available");
  });

  test("returns false when not enough energy", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(5) }, // Only 5 energy, foraging needs 15
    });
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("energy");
  });

  test("returns false when on cooldown", () => {
    const currentTick = 100 as Tick;
    const pet = createTestPet({
      activityCooldowns: {
        meadow: {
          [ActivityId.Foraging]: 150 as Tick, // Cooldown ends at tick 150
        },
      },
    });
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      currentTick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("cooldown");
  });

  test("returns true when all conditions met", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
    });
    const skills = createInitialSkills();
    const result = canStartExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(true);
  });
});

describe("startExplorationActivity", () => {
  test("fails when canStart returns false", () => {
    const pet = createTestPet({ activityState: ActivityState.Training });
    const skills = createInitialSkills();
    const result = startExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.success).toBe(false);
  });

  test("starts exploration and deducts energy", () => {
    const initialEnergy = toMicro(100);
    const pet = createTestPet({
      energyStats: { energy: initialEnergy },
    });
    const skills = createInitialSkills();
    const result = startExplorationActivity(
      pet,
      skills,
      [],
      "meadow",
      ActivityId.Foraging,
      10 as Tick,
    );

    expect(result.success).toBe(true);
    expect(result.pet.activityState).toBe(ActivityState.Exploring);
    expect(result.pet.activeExploration).toBeDefined();
    expect(result.pet.activeExploration?.activityId).toBe(ActivityId.Foraging);
    expect(result.pet.activeExploration?.locationId).toBe("meadow");
    expect(result.pet.activeExploration?.startTick).toBe(10);
    // Foraging costs 15 energy
    expect(result.pet.energyStats.energy).toBe(initialEnergy - toMicro(15));
  });
});

describe("processExplorationTick", () => {
  test("decrements ticks remaining", () => {
    const exploration: ActiveExploration = {
      activityId: ActivityId.Foraging,
      locationId: "meadow",
      startTick: 0 as Tick,
      durationTicks: 10 as Tick,
      ticksRemaining: 5 as Tick,
      energyCost: toMicro(15),
    };

    const result = processExplorationTick(exploration);
    expect(result).not.toBeNull();
    expect(result?.ticksRemaining).toBe(4);
  });

  test("returns null when exploration completes", () => {
    const exploration: ActiveExploration = {
      activityId: ActivityId.Foraging,
      locationId: "meadow",
      startTick: 0 as Tick,
      durationTicks: 10 as Tick,
      ticksRemaining: 1 as Tick,
      energyCost: toMicro(15),
    };

    const result = processExplorationTick(exploration);
    expect(result).toBeNull();
  });
});

describe("calculateExplorationDrops", () => {
  test("returns empty array when no tables found", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = calculateExplorationDrops(
      ["nonexistent_table"],
      pet,
      skills,
      [],
    );
    expect(result).toEqual([]);
  });

  test("returns drops based on roll (high roll)", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    // High roll should pass most minRoll checks
    const result = calculateExplorationDrops(
      [meadowForagingDropTable.id],
      pet,
      skills,
      [],
      0.9, // Inject high roll
    );
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns no drops on very low roll", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    // Very low roll should fail all minRoll checks
    const result = calculateExplorationDrops(
      [meadowForagingDropTable.id],
      pet,
      skills,
      [],
      0.01, // Inject very low roll
    );
    // At roll 0.01, no entries should pass (lowest minRoll is 0.2)
    expect(result.length).toBe(0);
  });

  test("aggregates quantities for same item", () => {
    const pet = createTestPet();
    const skills = {
      ...createInitialSkills(),
      [SkillType.Foraging]: {
        type: SkillType.Foraging,
        level: 10,
        currentXp: 0,
      },
    };
    // High roll with high skill should get multiple entries for same item
    const result = calculateExplorationDrops(
      [meadowForagingDropTable.id],
      pet,
      skills,
      [],
      0.9,
    );

    // Check that items are aggregated
    const itemCounts = new Map<string, number>();
    for (const drop of result) {
      itemCounts.set(drop.itemId, drop.quantity);
    }
    // With a high roll and skill, we should get multiple herbs (item ID is "material_herb")
    const herbCount = itemCounts.get("material_herb") ?? 0;
    expect(herbCount).toBeGreaterThan(0);
  });

  test("respects skill requirements in drop entries", () => {
    const pet = createTestPet();
    const lowSkills = createInitialSkills(); // level 1
    const highSkills = {
      ...createInitialSkills(),
      [SkillType.Foraging]: {
        type: SkillType.Foraging,
        level: 10,
        currentXp: 0,
      },
    };

    // Same roll, different skill levels should yield different results
    const lowSkillDrops = calculateExplorationDrops(
      [meadowForagingDropTable.id],
      pet,
      lowSkills,
      [],
      0.5,
    );
    const highSkillDrops = calculateExplorationDrops(
      [meadowForagingDropTable.id],
      pet,
      highSkills,
      [],
      0.5,
    );

    // High skill should potentially get more drops due to skill-gated entries
    const lowTotal = lowSkillDrops.reduce((sum, d) => sum + d.quantity, 0);
    const highTotal = highSkillDrops.reduce((sum, d) => sum + d.quantity, 0);
    expect(highTotal).toBeGreaterThanOrEqual(lowTotal);
  });
});

describe("completeExplorationActivity", () => {
  test("returns failure when no active exploration", () => {
    const pet = createTestPet();
    const skills = createInitialSkills();
    const result = completeExplorationActivity(pet, skills, [], 100 as Tick);
    expect(result.success).toBe(false);
  });

  test("completes exploration and applies cooldown", () => {
    const pet = createTestPet({
      activityState: ActivityState.Exploring,
      activeExploration: {
        activityId: ActivityId.Foraging,
        locationId: "meadow",
        startTick: 0 as Tick,
        durationTicks: 10 as Tick,
        ticksRemaining: 0 as Tick,
        energyCost: toMicro(15),
      },
    });
    const skills = createInitialSkills();
    const result = completeExplorationActivity(pet, skills, [], 100 as Tick);

    expect(result.success).toBe(true);
    expect(result.pet.activityState).toBe(ActivityState.Idle);
    expect(result.pet.activeExploration).toBeUndefined();
    // Check cooldown was applied (foraging has 5 tick cooldown)
    expect(result.pet.activityCooldowns?.meadow?.[ActivityId.Foraging]).toBe(
      105,
    ); // 100 + 5
  });

  test("calculates skill XP gains", () => {
    const pet = createTestPet({
      activityState: ActivityState.Exploring,
      activeExploration: {
        activityId: ActivityId.Foraging,
        locationId: "meadow",
        startTick: 0 as Tick,
        durationTicks: 10 as Tick,
        ticksRemaining: 0 as Tick,
        energyCost: toMicro(15),
      },
    });
    const skills = createInitialSkills();
    const result = completeExplorationActivity(pet, skills, [], 100 as Tick);

    expect(result.success).toBe(true);
    expect(result.skillXpGains[SkillType.Foraging]).toBeDefined();
    expect(result.skillXpGains[SkillType.Foraging]).toBeGreaterThan(0);
  });
});

describe("cancelExploration", () => {
  test("returns unchanged pet when no exploration", () => {
    const pet = createTestPet();
    const result = cancelExploration(pet);
    expect(result.pet).toEqual(pet);
    expect(result.message).toContain("No active exploration");
  });

  test("refunds energy on cancel", () => {
    const initialEnergy = toMicro(50);
    const energyCost = toMicro(15);
    const pet = createTestPet({
      activityState: ActivityState.Exploring,
      energyStats: { energy: initialEnergy },
      activeExploration: {
        activityId: ActivityId.Foraging,
        locationId: "meadow",
        startTick: 0 as Tick,
        durationTicks: 10 as Tick,
        ticksRemaining: 5 as Tick,
        energyCost,
      },
    });

    const result = cancelExploration(pet);
    expect(result.pet.activityState).toBe(ActivityState.Idle);
    expect(result.pet.activeExploration).toBeUndefined();
    expect(result.pet.energyStats.energy).toBe(initialEnergy + energyCost);
    expect(result.message).toContain("refunded");
  });
});

describe("getActivityCooldownRemaining", () => {
  test("returns 0 when no cooldowns", () => {
    const pet = createTestPet();
    const result = getActivityCooldownRemaining(
      pet,
      "meadow",
      ActivityId.Foraging,
      100 as Tick,
    );
    expect(result).toBe(0);
  });

  test("returns 0 when cooldown expired", () => {
    const pet = createTestPet({
      activityCooldowns: {
        meadow: {
          [ActivityId.Foraging]: 50 as Tick, // Expired at tick 50
        },
      },
    });
    const result = getActivityCooldownRemaining(
      pet,
      "meadow",
      ActivityId.Foraging,
      100 as Tick, // Current tick is 100
    );
    expect(result).toBe(0);
  });

  test("returns remaining ticks when on cooldown", () => {
    const pet = createTestPet({
      activityCooldowns: {
        meadow: {
          [ActivityId.Foraging]: 150 as Tick, // Expires at tick 150
        },
      },
    });
    const result = getActivityCooldownRemaining(
      pet,
      "meadow",
      ActivityId.Foraging,
      100 as Tick, // Current tick is 100
    );
    expect(result).toBe(50);
  });
});

describe("getExplorationProgress", () => {
  test("calculates progress percentage", () => {
    const exploration: ActiveExploration = {
      activityId: ActivityId.Foraging,
      locationId: "meadow",
      startTick: 0 as Tick,
      durationTicks: 10 as Tick,
      ticksRemaining: 3 as Tick,
      energyCost: toMicro(15),
    };

    const progress = getExplorationProgress(exploration);
    expect(progress.activityId).toBe(ActivityId.Foraging);
    expect(progress.activityName).toBe("Foraging");
    expect(progress.locationId).toBe("meadow");
    expect(progress.totalTicks).toBe(10);
    expect(progress.ticksRemaining).toBe(3);
    expect(progress.progressPercent).toBe(70); // 7/10 = 70%
  });
});

describe("getAvailableActivities", () => {
  test("returns empty array for unknown location", () => {
    const result = getAvailableActivities("unknown_location");
    expect(result).toEqual([]);
  });

  test("returns activities available at meadow", () => {
    const result = getAvailableActivities("meadow");
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((a) => a.id === ActivityId.Foraging)).toBe(true);
  });

  test("returns multiple activities for locations with multiple", () => {
    // Whispering coast has foraging and fishing
    const result = getAvailableActivities("whispering_coast");
    expect(result.length).toBeGreaterThan(1);
    expect(result.some((a) => a.id === ActivityId.Foraging)).toBe(true);
    expect(result.some((a) => a.id === ActivityId.Fishing)).toBe(true);
  });
});

describe("applySkillXpGains", () => {
  test("applies XP to multiple skills", () => {
    const skills = createInitialSkills();
    const gains = {
      [SkillType.Foraging]: 100,
      [SkillType.Mining]: 50,
    };

    const result = applySkillXpGains(skills, gains);
    expect(result.skills[SkillType.Foraging].currentXp).toBeGreaterThan(0);
    expect(result.skills[SkillType.Mining].currentXp).toBeGreaterThan(0);
  });

  test("tracks level ups", () => {
    const skills = createInitialSkills();
    // Large XP gain to trigger level up
    const gains = {
      [SkillType.Foraging]: 1000,
    };

    const result = applySkillXpGains(skills, gains);
    expect(result.levelUps[SkillType.Foraging]).toBe(true);
    expect(result.skills[SkillType.Foraging].level).toBeGreaterThan(1);
  });
});
