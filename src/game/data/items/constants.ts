/**
 * Item-related constants for stack sizes, poop acceleration, and other item properties.
 */

import type { Rarity } from "@/game/types/constants";

/**
 * Maximum stack sizes by item rarity.
 * Higher rarity items generally stack in smaller quantities.
 */
export const MAX_STACK_BY_RARITY: Record<Rarity, number> = {
  common: 99,
  uncommon: 50,
  rare: 20,
  epic: 5,
  legendary: 1,
} as const;

/**
 * Poop acceleration tiers in micro-units.
 * These values are added to the poop timer when food is consumed.
 * Higher values mean the pet will need to poop sooner.
 *
 * With POOP_MICRO_THRESHOLD = 960, divide by 2 to get equivalent ticks when awake.
 */
export const POOP_ACCELERATION = {
  /** Very light snack: ~10 minutes equivalent */
  VERY_LIGHT: 40,
  /** Light meal: ~15 minutes equivalent */
  LIGHT: 60,
  /** Light-medium meal: ~22.5 minutes equivalent */
  LIGHT_MEDIUM: 90,
  /** Standard meal: ~30 minutes equivalent */
  STANDARD: 120,
  /** Heavy meal: ~45 minutes equivalent */
  HEAVY: 180,
  /** Very heavy meal: ~50 minutes equivalent */
  VERY_HEAVY: 200,
  /** Indulgent meal: ~60 minutes equivalent */
  INDULGENT: 240,
  /** Massive feast: ~90 minutes equivalent */
  MASSIVE: 360,
} as const;
