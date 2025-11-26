/**
 * Pet types and interfaces.
 */

import type { ActiveTraining } from "./activity";
import type { MicroValue, Tick, Timestamp } from "./common";
import type { ActivityState, GrowthStage } from "./constants";
import type {
  BattleStats,
  CareLifeStats,
  CareStats,
  DamageResistances,
  EnergyStats,
} from "./stats";

/**
 * Pet identity information.
 */
export interface PetIdentity {
  /** Unique identifier for this pet */
  id: string;
  /** Pet's name given by the player */
  name: string;
  /** Species identifier */
  speciesId: string;
}

/**
 * Pet growth tracking.
 */
export interface PetGrowth {
  /** Current growth stage */
  stage: GrowthStage;
  /** Current substage within the growth stage (1-indexed) */
  substage: number;
  /** Timestamp when the pet was born/created */
  birthTime: Timestamp;
  /** Total age in ticks */
  ageTicks: Tick;
}

/**
 * Pet poop tracking.
 */
export interface PetPoop {
  /** Current accumulated poop count */
  count: number;
  /** Ticks until next poop generation */
  ticksUntilNext: Tick;
}

/**
 * Pet sleep tracking.
 */
export interface PetSleep {
  /** Whether the pet is currently sleeping */
  isSleeping: boolean;
  /** Timestamp when sleep started (if sleeping) */
  sleepStartTime: Timestamp | null;
  /** Total sleep ticks accumulated today */
  sleepTicksToday: Tick;
}

/**
 * Complete pet state combining all aspects.
 */
export interface Pet {
  /** Pet identity */
  identity: PetIdentity;
  /** Growth stage information */
  growth: PetGrowth;
  /** Care stats (satiety, hydration, happiness) */
  careStats: CareStats;
  /** Energy stat */
  energyStats: EnergyStats;
  /** Hidden care life stat */
  careLifeStats: CareLifeStats;
  /** Battle stats */
  battleStats: BattleStats;
  /** Damage type resistances */
  resistances: DamageResistances;
  /** Poop tracking */
  poop: PetPoop;
  /** Sleep tracking */
  sleep: PetSleep;
  /** Current activity state */
  activityState: ActivityState;
  /** Active training session (if training) */
  activeTraining?: ActiveTraining;
}

/**
 * Pet state for serialization (same as Pet but may evolve separately).
 */
export type PetState = Pet;

/**
 * Create a unique pet ID.
 */
export function createPetId(): string {
  return `pet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Maximum values for care stats by growth stage (in micro-units).
 */
export const CARE_STAT_MAX_BY_STAGE: Record<GrowthStage, MicroValue> = {
  baby: 50_000,
  child: 80_000,
  teen: 120_000,
  youngAdult: 160_000,
  adult: 200_000,
};

/**
 * Maximum values for energy by growth stage (in micro-units).
 */
export const ENERGY_MAX_BY_STAGE: Record<GrowthStage, MicroValue> = {
  baby: 50_000,
  child: 75_000,
  teen: 100_000,
  youngAdult: 150_000,
  adult: 200_000,
};

/**
 * Maximum care life by growth stage (in micro-units, representing hours).
 */
export const CARE_LIFE_MAX_BY_STAGE: Record<GrowthStage, MicroValue> = {
  baby: 72_000,
  child: 120_000,
  teen: 168_000,
  youngAdult: 240_000,
  adult: 336_000,
};
