/**
 * Pet types and interfaces.
 */

import type { ActiveExploration, ActiveTraining } from "./activity";
import type { Tick, Timestamp } from "./common";
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
 * Bonus max stats that can be added to a pet from items, quests, or events.
 * These are added on top of the base max stats from the species growth stage.
 */
export interface BonusMaxStats {
  /** Bonus to satiety max (micro-units) */
  satiety: number;
  /** Bonus to hydration max (micro-units) */
  hydration: number;
  /** Bonus to happiness max (micro-units) */
  happiness: number;
  /** Bonus to energy max (micro-units) */
  energy: number;
  /** Bonus to care life max (micro-units) */
  careLife: number;
  /** Bonus to battle stat maximums */
  battle: BattleStats;
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
  /** Active exploration session (if exploring) */
  activeExploration?: ActiveExploration;
  /** Bonus max stats from items, quests, events */
  bonusMaxStats: BonusMaxStats;
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
