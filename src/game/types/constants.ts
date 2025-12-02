/**
 * Game constants defined as const objects with derived union types.
 * This pattern allows type-safe string literals while avoiding enums.
 */

/**
 * Growth stages that pets progress through.
 * Target total progression time: ~12 months real time.
 */
export const GrowthStage = {
  Baby: "baby",
  Child: "child",
  Teen: "teen",
  YoungAdult: "youngAdult",
  Adult: "adult",
} as const;

export type GrowthStage = (typeof GrowthStage)[keyof typeof GrowthStage];

/**
 * Human-friendly display names for growth stages.
 */
export const GROWTH_STAGE_DISPLAY_NAMES: Record<GrowthStage, string> = {
  baby: "Baby",
  child: "Child",
  teen: "Teen",
  youngAdult: "Young Adult",
  adult: "Adult",
} as const;

/**
 * Ordered array of growth stages for iteration.
 */
export const GROWTH_STAGE_ORDER: readonly GrowthStage[] = [
  GrowthStage.Baby,
  GrowthStage.Child,
  GrowthStage.Teen,
  GrowthStage.YoungAdult,
  GrowthStage.Adult,
] as const;

/**
 * Physical damage types for the battle system.
 * No elemental type system - purely physical categories.
 */
export const DamageType = {
  Slashing: "slashing",
  Piercing: "piercing",
  Crushing: "crushing",
  Chemical: "chemical",
  Thermal: "thermal",
  Electric: "electric",
} as const;

export type DamageType = (typeof DamageType)[keyof typeof DamageType];

/**
 * All damage types as an array for iteration.
 */
export const ALL_DAMAGE_TYPES: readonly DamageType[] = [
  DamageType.Slashing,
  DamageType.Piercing,
  DamageType.Crushing,
  DamageType.Chemical,
  DamageType.Thermal,
  DamageType.Electric,
] as const;

/**
 * Item categories for inventory organization.
 */
export const ItemCategory = {
  Food: "food",
  Drink: "drink",
  Toy: "toy",
  Cleaning: "cleaning",
  Medicine: "medicine",
  Battle: "battle",
  Equipment: "equipment",
  Material: "material",
  Key: "key",
} as const;

export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory];

/**
 * Item rarity tiers affecting acquisition and value.
 */
export const Rarity = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary",
} as const;

export type Rarity = (typeof Rarity)[keyof typeof Rarity];

/**
 * Ordered array of rarities from most common to rarest.
 */
export const RARITY_ORDER: readonly Rarity[] = [
  Rarity.Common,
  Rarity.Uncommon,
  Rarity.Rare,
  Rarity.Epic,
  Rarity.Legendary,
] as const;

/**
 * Pet activity states for determining behavior.
 */
export const ActivityState = {
  Idle: "idle",
  Sleeping: "sleeping",
  Training: "training",
  Exploring: "exploring",
  Battling: "battling",
} as const;

export type ActivityState = (typeof ActivityState)[keyof typeof ActivityState];

/**
 * Get a human-readable display name for an activity state.
 * Used for error messages when an action cannot be performed.
 */
export function getActivityDisplayName(activity: ActivityState): string {
  switch (activity) {
    case ActivityState.Sleeping:
      return "sleeping";
    case ActivityState.Training:
      return "training";
    case ActivityState.Exploring:
      return "exploring";
    case ActivityState.Battling:
      return "battling";
    case ActivityState.Idle:
      return "idle";
  }
}

/**
 * Care stat thresholds for UI/feedback purposes.
 */
export const CareThreshold = {
  Content: "content", // 76-100%
  Okay: "okay", // 51-75%
  Uncomfortable: "uncomfortable", // 26-50%
  Distressed: "distressed", // 1-25%
  Critical: "critical", // 0%
} as const;

export type CareThreshold = (typeof CareThreshold)[keyof typeof CareThreshold];

/**
 * Get the care threshold for a given percentage.
 */
export function getCareThreshold(percentage: number): CareThreshold {
  if (percentage <= 0) return CareThreshold.Critical;
  if (percentage <= 25) return CareThreshold.Distressed;
  if (percentage <= 50) return CareThreshold.Uncomfortable;
  if (percentage <= 75) return CareThreshold.Okay;
  return CareThreshold.Content;
}

/**
 * Species archetypes defining general stat distribution and playstyle.
 */
export const SpeciesArchetype = {
  Balanced: "balanced",
  GlassCannon: "glassCannon",
  Defender: "defender",
  Status: "status",
  PowerTank: "powerTank",
  Evasion: "evasion",
} as const;

export type SpeciesArchetype =
  (typeof SpeciesArchetype)[keyof typeof SpeciesArchetype];

/**
 * Methods by which new species can be unlocked.
 */
export const UnlockMethod = {
  Starting: "starting",
  Quest: "quest",
  Discovery: "discovery",
  Achievement: "achievement",
} as const;

export type UnlockMethod = (typeof UnlockMethod)[keyof typeof UnlockMethod];

/**
 * Core pet stats used in battle and training.
 */
export const PetStat = {
  Strength: "strength",
  Endurance: "endurance",
  Agility: "agility",
  Precision: "precision",
  Fortitude: "fortitude",
  Cunning: "cunning",
} as const;

export type PetStat = (typeof PetStat)[keyof typeof PetStat];
