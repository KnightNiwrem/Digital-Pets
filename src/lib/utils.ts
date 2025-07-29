import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Pet } from "@/types/Pet";
import { PET_CONSTANTS } from "@/types";

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
        play: "Pet is too sick to play. Use medicine first."
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
   */
  static ticksToDisplayValue(ticks: number, multiplier: number): number {
    return this.clamp(Math.ceil(ticks / multiplier), 0, 100);
  }

  /**
   * Convert display value to ticks for pet stats
   */
  static displayValueToTicks(displayValue: number, multiplier: number): number {
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
