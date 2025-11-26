/**
 * Tests for the skills system.
 */

import { expect, test } from "bun:test";
import {
  createInitialSkills,
  MAX_SKILL_LEVEL,
  type Skill,
  SkillTier,
  SkillType,
} from "@/game/types/skill";
import {
  addSkillXp,
  addXpToPlayerSkill,
  getSkillEffectMultiplier,
  getSkillProgress,
  getSkillTier,
  getSkillTierDisplayName,
  meetsSkillRequirement,
  xpForNextLevel,
  xpToLevel,
} from "./skills";

// XP formulas
test("xpToLevel returns 0 for level 1", () => {
  expect(xpToLevel(1)).toBe(0);
});

test("xpToLevel returns correct XP for level 2", () => {
  // Formula: 50 * 2 * 3 / 2 = 150
  expect(xpToLevel(2)).toBe(150);
});

test("xpToLevel returns correct XP for level 10", () => {
  // Formula: 50 * 10 * 11 / 2 = 2750
  expect(xpToLevel(10)).toBe(2750);
});

test("xpForNextLevel returns correct XP gap", () => {
  const xp2 = xpToLevel(2);
  const xp1 = xpToLevel(1);
  expect(xpForNextLevel(1)).toBe(xp2 - xp1);
});

test("xpForNextLevel returns 0 at max level", () => {
  expect(xpForNextLevel(MAX_SKILL_LEVEL)).toBe(0);
});

// Skill tiers
test("getSkillTier returns Novice for level 1", () => {
  expect(getSkillTier(1)).toBe(SkillTier.Novice);
});

test("getSkillTier returns Apprentice for level 10", () => {
  expect(getSkillTier(10)).toBe(SkillTier.Apprentice);
});

test("getSkillTier returns Journeyman for level 25", () => {
  expect(getSkillTier(25)).toBe(SkillTier.Journeyman);
});

test("getSkillTier returns Expert for level 50", () => {
  expect(getSkillTier(50)).toBe(SkillTier.Expert);
});

test("getSkillTier returns Master for level 75", () => {
  expect(getSkillTier(75)).toBe(SkillTier.Master);
});

test("getSkillTier returns Master for max level", () => {
  expect(getSkillTier(MAX_SKILL_LEVEL)).toBe(SkillTier.Master);
});

test("getSkillTierDisplayName returns correct names", () => {
  expect(getSkillTierDisplayName(SkillTier.Novice)).toBe("Novice");
  expect(getSkillTierDisplayName(SkillTier.Master)).toBe("Master");
});

// XP gain and leveling
test("addSkillXp adds XP without leveling", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  const result = addSkillXp(skill, 50);

  expect(result.skill.level).toBe(1);
  expect(result.skill.currentXp).toBe(50);
  expect(result.leveledUp).toBe(false);
  expect(result.xpGained).toBe(50);
});

test("addSkillXp levels up when XP threshold reached", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  const xpNeeded = xpForNextLevel(1);
  const result = addSkillXp(skill, xpNeeded);

  expect(result.skill.level).toBe(2);
  expect(result.skill.currentXp).toBe(0);
  expect(result.leveledUp).toBe(true);
  expect(result.newLevel).toBe(2);
});

test("addSkillXp handles overflow XP on level up", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  const xpNeeded = xpForNextLevel(1);
  const result = addSkillXp(skill, xpNeeded + 30);

  expect(result.skill.level).toBe(2);
  expect(result.skill.currentXp).toBe(30);
  expect(result.leveledUp).toBe(true);
});

test("addSkillXp handles multiple level ups", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  const xp1to2 = xpForNextLevel(1);
  const xp2to3 = xpForNextLevel(2);
  const result = addSkillXp(skill, xp1to2 + xp2to3 + 10);

  expect(result.skill.level).toBe(3);
  expect(result.skill.currentXp).toBe(10);
  expect(result.leveledUp).toBe(true);
  expect(result.newLevel).toBe(3);
});

test("addSkillXp does not exceed max level", () => {
  const skill: Skill = {
    type: SkillType.Foraging,
    level: MAX_SKILL_LEVEL,
    currentXp: 0,
  };
  const result = addSkillXp(skill, 10000);

  expect(result.skill.level).toBe(MAX_SKILL_LEVEL);
  expect(result.skill.currentXp).toBe(0);
  expect(result.leveledUp).toBe(false);
  expect(result.xpGained).toBe(0);
});

test("addSkillXp caps at max level when leveling", () => {
  const skill: Skill = {
    type: SkillType.Foraging,
    level: MAX_SKILL_LEVEL - 1,
    currentXp: 0,
  };
  const result = addSkillXp(skill, 999999);

  expect(result.skill.level).toBe(MAX_SKILL_LEVEL);
  expect(result.skill.currentXp).toBe(0);
  expect(result.leveledUp).toBe(true);
});

// Player skills
test("addXpToPlayerSkill updates correct skill", () => {
  const skills = createInitialSkills();
  const { skills: newSkills, result } = addXpToPlayerSkill(
    skills,
    SkillType.Foraging,
    50,
  );

  expect(newSkills[SkillType.Foraging].currentXp).toBe(50);
  expect(newSkills[SkillType.Scouting].currentXp).toBe(0);
  expect(result.xpGained).toBe(50);
});

test("createInitialSkills creates all skills at level 1", () => {
  const skills = createInitialSkills();

  expect(skills[SkillType.Foraging].level).toBe(1);
  expect(skills[SkillType.Scouting].level).toBe(1);
  expect(skills[SkillType.Crafting].level).toBe(1);
  expect(skills[SkillType.Trading].level).toBe(1);
  expect(skills[SkillType.Taming].level).toBe(1);
});

// Progress calculation
test("getSkillProgress returns 0 at start of level", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  expect(getSkillProgress(skill)).toBe(0);
});

test("getSkillProgress returns 50 at half XP", () => {
  const skill: Skill = { type: SkillType.Foraging, level: 1, currentXp: 0 };
  skill.currentXp = Math.floor(xpForNextLevel(1) / 2);
  expect(getSkillProgress(skill)).toBe(50);
});

test("getSkillProgress returns 100 at max level", () => {
  const skill: Skill = {
    type: SkillType.Foraging,
    level: MAX_SKILL_LEVEL,
    currentXp: 0,
  };
  expect(getSkillProgress(skill)).toBe(100);
});

// Effect multipliers
test("getSkillEffectMultiplier returns 1 at level 1", () => {
  expect(getSkillEffectMultiplier(1)).toBe(1);
});

test("getSkillEffectMultiplier returns 1.05 at level 2", () => {
  expect(getSkillEffectMultiplier(2)).toBeCloseTo(1.05);
});

test("getSkillEffectMultiplier returns 1.5 at level 11", () => {
  expect(getSkillEffectMultiplier(11)).toBeCloseTo(1.5);
});

// Skill requirements
test("meetsSkillRequirement returns true when level meets requirement", () => {
  const skills = createInitialSkills();
  expect(meetsSkillRequirement(skills, SkillType.Foraging, 1)).toBe(true);
});

test("meetsSkillRequirement returns true when level exceeds requirement", () => {
  const skills = createInitialSkills();
  const { skills: updatedSkills } = addXpToPlayerSkill(
    skills,
    SkillType.Foraging,
    xpToLevel(5),
  );
  expect(meetsSkillRequirement(updatedSkills, SkillType.Foraging, 3)).toBe(
    true,
  );
});

test("meetsSkillRequirement returns false when level below requirement", () => {
  const skills = createInitialSkills();
  expect(meetsSkillRequirement(skills, SkillType.Foraging, 5)).toBe(false);
});
