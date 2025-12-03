/**
 * Skills logic for XP gain and level ups.
 */

import { PERCENTAGE_MAX } from "@/game/types/common";
import {
  BASE_SKILL_XP,
  MAX_SKILL_LEVEL,
  type PlayerSkills,
  SKILL_EFFECT_BONUS_PER_LEVEL,
  SKILL_TIER_DISPLAY_NAMES,
  SKILL_TIER_THRESHOLDS,
  type Skill,
  type SkillTier,
  SkillTier as SkillTierValues,
  type SkillType,
} from "@/game/types/skill";

/**
 * Divisor for the triangular number formula used in XP calculations.
 * The formula n × (n + 1) / 2 produces the sequence 1, 3, 6, 10, 15, ...
 * (the triangular numbers).
 */
const TRIANGULAR_DIVISOR = 2;

/**
 * Total XP required to reach level n from level 1.
 * Formula: baseXP × n × (n + 1) / 2
 * This is a triangular number formula. Total cumulative XP grows quadratically,
 * while XP required per level increases linearly.
 */
export function xpToLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((BASE_SKILL_XP * level * (level + 1)) / TRIANGULAR_DIVISOR);
}

/**
 * Calculate XP needed for next level.
 */
export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_SKILL_LEVEL) return 0;
  return xpToLevel(currentLevel + 1) - xpToLevel(currentLevel);
}

/**
 * Get the skill tier for a given level.
 */
export function getSkillTier(level: number): SkillTier {
  if (level >= SKILL_TIER_THRESHOLDS[SkillTierValues.Master].min) {
    return SkillTierValues.Master;
  }
  if (level >= SKILL_TIER_THRESHOLDS[SkillTierValues.Expert].min) {
    return SkillTierValues.Expert;
  }
  if (level >= SKILL_TIER_THRESHOLDS[SkillTierValues.Journeyman].min) {
    return SkillTierValues.Journeyman;
  }
  if (level >= SKILL_TIER_THRESHOLDS[SkillTierValues.Apprentice].min) {
    return SkillTierValues.Apprentice;
  }
  return SkillTierValues.Novice;
}

/**
 * Get display name for a skill tier.
 */
export function getSkillTierDisplayName(tier: SkillTier): string {
  return SKILL_TIER_DISPLAY_NAMES[tier];
}

/**
 * Result of adding XP to a skill.
 */
export interface XpGainResult {
  /** Updated skill */
  skill: Skill;
  /** Whether the skill leveled up */
  leveledUp: boolean;
  /** New level if leveled up */
  newLevel?: number;
  /** XP gained (after modifiers) */
  xpGained: number;
}

/**
 * Add XP to a skill and process level ups.
 */
export function addSkillXp(skill: Skill, xpAmount: number): XpGainResult {
  if (skill.level >= MAX_SKILL_LEVEL) {
    return {
      skill,
      leveledUp: false,
      xpGained: 0,
    };
  }

  let currentLevel = skill.level;
  let currentXp = skill.currentXp + xpAmount;
  let leveledUp = false;

  // Process level ups
  while (currentLevel < MAX_SKILL_LEVEL) {
    const xpNeeded = xpForNextLevel(currentLevel);
    if (currentXp >= xpNeeded) {
      currentXp -= xpNeeded;
      currentLevel++;
      leveledUp = true;
    } else {
      break;
    }
  }

  // Cap at max level
  if (currentLevel >= MAX_SKILL_LEVEL) {
    currentLevel = MAX_SKILL_LEVEL;
    currentXp = 0;
  }

  return {
    skill: {
      ...skill,
      level: currentLevel,
      currentXp,
    },
    leveledUp,
    newLevel: leveledUp ? currentLevel : undefined,
    xpGained: xpAmount,
  };
}

/**
 * Add XP to a specific skill in the player skills collection.
 */
export function addXpToPlayerSkill(
  skills: PlayerSkills,
  skillType: SkillType,
  xpAmount: number,
): { skills: PlayerSkills; result: XpGainResult } {
  const currentSkill = skills[skillType];
  const result = addSkillXp(currentSkill, xpAmount);

  return {
    skills: {
      ...skills,
      [skillType]: result.skill,
    },
    result,
  };
}

/**
 * Calculate progress percentage to next level.
 */
export function getSkillProgress(skill: Skill): number {
  if (skill.level >= MAX_SKILL_LEVEL) return PERCENTAGE_MAX;
  const xpNeeded = xpForNextLevel(skill.level);
  if (xpNeeded <= 0) return PERCENTAGE_MAX;
  return Math.min(
    PERCENTAGE_MAX,
    Math.round((skill.currentXp / xpNeeded) * PERCENTAGE_MAX),
  );
}

/**
 * Get skill effect modifier based on level.
 * Returns a multiplier (e.g., 1.0 at level 1, 1.05 at level 2, 1.10 at level 3).
 */
export function getSkillEffectMultiplier(level: number): number {
  return 1 + (level - 1) * SKILL_EFFECT_BONUS_PER_LEVEL;
}

/**
 * Check if a skill level meets a requirement.
 */
export function meetsSkillRequirement(
  skills: PlayerSkills,
  skillType: SkillType,
  requiredLevel: number,
): boolean {
  return skills[skillType].level >= requiredLevel;
}
