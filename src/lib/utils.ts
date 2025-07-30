import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Pet } from "@/types/Pet";
import { PET_CONSTANTS } from "@/types";

// Interface for objects that have energy properties
interface HasEnergy {
  currentEnergy: number;
  maxEnergy?: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility class for common pet state validations
 * Centralizes repeated validation logic across systems
 */
export class PetValidator {
  /**
   * Check if pet is sick and cannot perform actions that require health
   */
  static isSick(pet: Pet): boolean {
    return pet.health === "sick";
  }

  /**
   * Check if pet is sleeping and cannot perform active actions
   */
  static isSleeping(pet: Pet): boolean {
    return pet.state === "sleeping";
  }

  /**
   * Check if pet is exploring and cannot perform other actions
   */
  static isExploring(pet: Pet): boolean {
    return pet.state === "exploring";
  }

  /**
   * Check if pet is travelling and cannot perform location-based actions
   */
  static isTravelling(pet: Pet): boolean {
    return pet.state === "travelling";
  }

  /**
   * Check if pet has sufficient energy for an action
   */
  static hasEnoughEnergy(pet: Pet, requiredEnergy: number): boolean {
    return pet.currentEnergy >= requiredEnergy;
  }

  /**
   * Validate if pet can perform care actions (feeding, drinking, playing)
   * Returns error message if invalid, null if valid
   */
  static validateCareAction(pet: Pet, actionType: "feed" | "drink" | "play", energyCost: number = 0): string | null {
    if (this.isSick(pet)) {
      const actionMessages = {
        feed: "Pet is too sick to eat. Use medicine first.",
        drink: "Pet is too sick to drink. Use medicine first.",
        play: "Pet is too sick to play. Use medicine first.",
      };
      return actionMessages[actionType];
    }

    if (this.isExploring(pet)) {
      const actionMessages = {
        feed: "Cannot feed pet while exploring. Wait for activity to complete or cancel it.",
        drink: "Cannot give drinks while exploring. Wait for activity to complete or cancel it.",
        play: "Cannot play while exploring. Wait for activity to complete or cancel it.",
      };
      return actionMessages[actionType];
    }

    if (actionType === "play" && !this.hasEnoughEnergy(pet, energyCost)) {
      return "Pet doesn't have enough energy to play.";
    }

    return null;
  }

  /**
   * Validate if pet can be put to sleep
   */
  static validateSleepAction(pet: Pet): string | null {
    if (this.isSleeping(pet)) {
      return "Pet is already sleeping.";
    }

    if (this.isTravelling(pet)) {
      return "Pet cannot sleep while travelling.";
    }

    if (this.isExploring(pet)) {
      return "Pet cannot sleep while exploring. Wait for activity to complete or cancel it.";
    }

    return null;
  }

  /**
   * Validate if pet can perform world activities
   */
  static validateWorldAction(pet: Pet, energyCost: number): string | null {
    if (this.isSleeping(pet)) {
      return "Pet cannot perform activities while sleeping.";
    }

    if (this.isTravelling(pet)) {
      return "Pet cannot perform activities while travelling.";
    }

    if (this.isExploring(pet)) {
      return "Pet is already engaged in an activity. Complete or cancel current activity first.";
    }

    if (!this.hasEnoughEnergy(pet, energyCost)) {
      return "Pet has insufficient energy for this activity.";
    }

    return null;
  }

  /**
   * Validate if pet can participate in battle
   */
  static validateBattleAction(pet: Pet, energyCost: number): string | null {
    if (this.isSick(pet)) {
      return "Pet is too sick to battle.";
    }

    if (this.isExploring(pet)) {
      return "Pet cannot battle while exploring. Wait for activity to complete or cancel it.";
    }

    if (!this.hasEnoughEnergy(pet, energyCost)) {
      return "Pet has insufficient energy for this move.";
    }

    return null;
  }
}

/**
 * Utility class for common game calculations
 * Centralizes repeated math operations across systems
 */
export class GameMath {
  /**
   * Clamp a value between min and max bounds
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Convert ticks to display value for pet stats
   * Using Math.round instead of Math.ceil for better round-trip accuracy
   */
  static ticksToDisplayValue(ticks: number, multiplier: number): number {
    return this.clamp(Math.round(ticks / multiplier), 0, 100);
  }

  /**
   * Convert display value to ticks for pet stats
   */
  static displayValueToTicks(displayValue: number, multiplier: number): number {
    return displayValue * multiplier;
  }

  /**
   * Convert display value to ticks with improved accuracy
   * Preserves fractional tick values when possible for better precision
   */
  static displayValueToTicksAccurate(displayValue: number, currentTicks: number, multiplier: number): number {
    // If the current ticks would round to the same display value, preserve them
    // This helps maintain precision in round-trip conversions
    const currentDisplay = this.ticksToDisplayValue(currentTicks, multiplier);
    if (currentDisplay === displayValue) {
      return currentTicks;
    }
    
    // Otherwise, use the standard conversion
    return displayValue * multiplier;
  }

  /**
   * Calculate satiety display value from ticks
   */
  static calculateSatietyDisplay(satietyTicks: number): number {
    return this.ticksToDisplayValue(satietyTicks, PET_CONSTANTS.STAT_MULTIPLIER.SATIETY);
  }

  /**
   * Calculate hydration display value from ticks
   */
  static calculateHydrationDisplay(hydrationTicks: number): number {
    return this.ticksToDisplayValue(hydrationTicks, PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION);
  }

  /**
   * Calculate happiness display value from ticks
   */
  static calculateHappinessDisplay(happinessTicks: number): number {
    return this.ticksToDisplayValue(happinessTicks, PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS);
  }

  /**
   * Safely subtract energy from a pet without going below 0
   */
  static subtractEnergy(currentEnergy: number, cost: number): number {
    return Math.max(0, currentEnergy - cost);
  }

  /**
   * Safely add to a stat without exceeding the maximum
   */
  static addToStat(currentValue: number, increase: number, maximum: number): number {
    return Math.min(maximum, currentValue + increase);
  }

  /**
   * Calculate percentage-based healing
   */
  static calculatePercentageHeal(maxValue: number, percentage: number): number {
    return Math.floor(maxValue * (percentage / 100));
  }

  /**
   * Generate random number within range (inclusive)
   */
  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Check if a random chance succeeds
   */
  static randomChance(probability: number): boolean {
    return Math.random() < probability;
  }

  /**
   * Calculate battle damage with min/max bounds
   */
  static calculateDamage(attack: number, defense: number, movePower: number, isCritical: boolean = false): number {
    const attackDefenseRatio = attack / Math.max(1, defense);
    const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
    let damage = Math.floor(attackDefenseRatio * movePower * randomFactor);

    if (isCritical) {
      damage = Math.floor(damage * 1.5); // 1.5x critical multiplier
    }

    return Math.max(1, damage); // Minimum 1 damage
  }

  /**
   * Calculate accuracy for moves
   */
  static calculateAccuracy(baseAccuracy: number, attackerAccuracy: number, defenderEvasion: number): number {
    return this.clamp(baseAccuracy + (attackerAccuracy - defenderEvasion) / 10, 5, 100);
  }
}

/**
 * Utility class for energy management across systems
 * Centralizes energy cost validation and deduction patterns
 */
export class EnergyManager {
  /**
   * Check if an entity has enough energy for an action
   */
  static hasEnoughEnergy(entity: HasEnergy, requiredEnergy: number): boolean {
    return entity.currentEnergy >= requiredEnergy;
  }

  /**
   * Safely deduct energy from entity, preventing negative values
   */
  static deductEnergy(entity: HasEnergy, energyCost: number): void {
    entity.currentEnergy = GameMath.subtractEnergy(entity.currentEnergy, energyCost);
  }

  /**
   * Calculate travel energy cost based on time
   */
  static calculateTravelCost(travelTime: number): number {
    return Math.floor(travelTime / 4); // 1 energy per minute of travel
  }

  /**
   * Validate and deduct energy for an action
   * Returns error message if insufficient energy, null if successful
   */
  static validateAndDeductEnergy(entity: HasEnergy, energyCost: number, actionName: string): string | null {
    if (!this.hasEnoughEnergy(entity, energyCost)) {
      return `Pet doesn't have enough energy for ${actionName}.`;
    }

    this.deductEnergy(entity, energyCost);
    return null;
  }

  /**
   * Common energy validation messages
   */
  static readonly ERROR_MESSAGES = {
    TRAVEL: "Pet doesn't have enough energy for this journey",
    ACTIVITY: "Pet doesn't have enough energy for this activity",
    BATTLE: "Insufficient energy for this move",
    PLAY: "Pet doesn't have enough energy to play",
    GENERAL: (action: string) => `Pet doesn't have enough energy for ${action}`,
  } as const;
}
