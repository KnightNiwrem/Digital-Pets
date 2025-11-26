/**
 * Skill types for the skills system.
 */

/**
 * Available skills in the game.
 */
export const SkillType = {
  Foraging: "foraging",
  Scouting: "scouting",
  Crafting: "crafting",
  Trading: "trading",
  Taming: "taming",
} as const;

export type SkillType = (typeof SkillType)[keyof typeof SkillType];

/**
 * Skill tier thresholds.
 */
export const SkillTier = {
  Novice: "novice",
  Apprentice: "apprentice",
  Journeyman: "journeyman",
  Expert: "expert",
  Master: "master",
} as const;

export type SkillTier = (typeof SkillTier)[keyof typeof SkillTier];

/**
 * Skill tier level ranges.
 */
export const SKILL_TIER_THRESHOLDS: Record<SkillTier, { min: number }> = {
  [SkillTier.Novice]: { min: 1 },
  [SkillTier.Apprentice]: { min: 10 },
  [SkillTier.Journeyman]: { min: 25 },
  [SkillTier.Expert]: { min: 50 },
  [SkillTier.Master]: { min: 75 },
};

/**
 * Maximum skill level.
 */
export const MAX_SKILL_LEVEL = 99;

/**
 * A single skill's current state.
 */
export interface Skill {
  /** Skill type identifier */
  type: SkillType;
  /** Current level (1-99) */
  level: number;
  /** Current XP towards next level */
  currentXp: number;
}

/**
 * All player skills.
 */
export interface PlayerSkills {
  [SkillType.Foraging]: Skill;
  [SkillType.Scouting]: Skill;
  [SkillType.Crafting]: Skill;
  [SkillType.Trading]: Skill;
  [SkillType.Taming]: Skill;
}

/**
 * Create initial skills at level 1 with 0 XP.
 */
export function createInitialSkills(): PlayerSkills {
  return {
    [SkillType.Foraging]: { type: SkillType.Foraging, level: 1, currentXp: 0 },
    [SkillType.Scouting]: { type: SkillType.Scouting, level: 1, currentXp: 0 },
    [SkillType.Crafting]: { type: SkillType.Crafting, level: 1, currentXp: 0 },
    [SkillType.Trading]: { type: SkillType.Trading, level: 1, currentXp: 0 },
    [SkillType.Taming]: { type: SkillType.Taming, level: 1, currentXp: 0 },
  };
}

/**
 * Get display name for a skill.
 */
export function getSkillDisplayName(skillType: SkillType): string {
  const names: Record<SkillType, string> = {
    [SkillType.Foraging]: "Foraging",
    [SkillType.Scouting]: "Scouting",
    [SkillType.Crafting]: "Crafting",
    [SkillType.Trading]: "Trading",
    [SkillType.Taming]: "Taming",
  };
  return names[skillType];
}

/**
 * Get emoji for a skill.
 */
export function getSkillEmoji(skillType: SkillType): string {
  const emojis: Record<SkillType, string> = {
    [SkillType.Foraging]: "🌿",
    [SkillType.Scouting]: "🔍",
    [SkillType.Crafting]: "🔧",
    [SkillType.Trading]: "💰",
    [SkillType.Taming]: "🤝",
  };
  return emojis[skillType];
}
