import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Pet } from "@/types/Pet";
import type { Result } from "@/types";
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
 * Result utility helpers for reducing boilerplate in success/error handling
 * Centralizes common Result<T> creation patterns across systems
 */
export class ResultUtils {
  /**
   * Create a successful result with data
   */
  static success<T>(data: T, message?: string): Result<T> {
    return { success: true, data, message };
  }

  /**
   * Create a successful result without data (void operations)
   */
  static successVoid(message?: string): Result<void> {
    return { success: true, message };
  }

  /**
   * Create an error result with message
   */
  static error<T>(error: string): Result<T> {
    return { success: false, error };
  }

  /**
   * Execute validation and return error result if validation fails
   * Reduces the repetitive if (validationError) { return error } pattern
   */
  static validateOrError<T>(validationError: string | null): Result<T> | null {
    if (validationError) {
      return this.error<T>(validationError);
    }
    return null;
  }

  /**
   * Process a result that might be null (no data case) vs not found
   */
  static fromNullable<T>(data: T | null | undefined, errorMessage: string): Result<T> {
    if (data === null || data === undefined) {
      return this.error<T>(errorMessage);
    }
    return this.success(data);
  }
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
   * Check if pet is healthy
   */
  static isHealthy(pet: Pet): boolean {
    return pet.health === "healthy";
  }

  /**
   * Check if pet is unhealthy (injured or sick)
   */
  static isUnhealthy(pet: Pet): boolean {
    return pet.health !== "healthy";
  }

  /**
   * Check if pet is injured
   */
  static isInjured(pet: Pet): boolean {
    return pet.health === "injured";
  }

  /**
   * Check if pet is idle and can perform actions
   */
  static isIdle(pet: Pet): boolean {
    return pet.state === "idle";
  }

  /**
   * Check if pet is busy (not idle)
   */
  static isBusy(pet: Pet): boolean {
    return pet.state !== "idle";
  }

  /**
   * Check if pet has sufficient energy for an action
   */
  static hasEnoughEnergy(pet: Pet, requiredEnergy: number): boolean {
    return pet.currentEnergy >= requiredEnergy;
  }

  /**
   * Check if pet is dead
   */
  static isDead(pet: Pet): boolean {
    return pet.life <= 0;
  }

  /**
   * Check if pet is alive
   */
  static isAlive(pet: Pet): boolean {
    return pet.life > 0;
  }

  /**
   * Check if pet has full energy
   */
  static hasFullEnergy(pet: Pet): boolean {
    return pet.currentEnergy >= pet.maxEnergy;
  }

  /**
   * Check if pet has low energy
   */
  static hasLowEnergy(pet: Pet, threshold: number = 20): boolean {
    return pet.currentEnergy < threshold;
  }

  /**
   * Get pet's energy as a percentage
   */
  static getEnergyPercentage(pet: Pet): number {
    return (pet.currentEnergy / pet.maxEnergy) * 100;
  }

  /**
   * Check if pet has critically low life
   */
  static hasCriticalLife(pet: Pet, threshold: number = 0.2): boolean {
    return pet.life < 1000000 * threshold; // Using PET_CONSTANTS.MAX_LIFE value
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

    // Add sleeping validation - only play is restricted while sleeping
    if (actionType === "play" && this.isSleeping(pet)) {
      return "Pet cannot play while sleeping. Wake up the pet first.";
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
 * Factory for creating PetCareAction objects
 * Reduces duplicate action creation patterns across PetSystem methods
 */
export class PetCareActionFactory {
  /**
   * Create a pet care action with standard properties
   */
  static createAction(
    type: "feed" | "drink" | "play" | "clean" | "medicine" | "sleep" | "wake",
    energyCost?: number
  ): import("@/types/Pet").PetCareAction {
    const action: import("@/types/Pet").PetCareAction = {
      type,
      timestamp: Date.now(),
    };

    // Add energy cost for actions that require it
    if (energyCost !== undefined) {
      action.energyCost = energyCost;
    }

    return action;
  }

  /**
   * Create a feed action
   */
  static feed(): import("@/types/Pet").PetCareAction {
    return this.createAction("feed");
  }

  /**
   * Create a drink action
   */
  static drink(): import("@/types/Pet").PetCareAction {
    return this.createAction("drink");
  }

  /**
   * Create a play action with energy cost
   */
  static play(energyCost: number): import("@/types/Pet").PetCareAction {
    return this.createAction("play", energyCost);
  }

  /**
   * Create a clean action
   */
  static clean(): import("@/types/Pet").PetCareAction {
    return this.createAction("clean");
  }

  /**
   * Create a medicine action
   */
  static medicine(): import("@/types/Pet").PetCareAction {
    return this.createAction("medicine");
  }

  /**
   * Create a sleep action
   */
  static sleep(): import("@/types/Pet").PetCareAction {
    return this.createAction("sleep");
  }

  /**
   * Create a wake action
   */
  static wake(): import("@/types/Pet").PetCareAction {
    return this.createAction("wake");
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

  // UI and display utilities
  static roundToPercentage(progress: number): number {
    return Math.round(progress);
  }

  static probabilityToPercentage(probability: number): number {
    return Math.round(probability * 100);
  }

  static convertTicksToMinutes(ticks: number): number {
    return Math.ceil(ticks / 4);
  }

  static convertTicksToEnergyCost(ticks: number): number {
    return Math.floor(ticks / 4);
  }

  static adjustQuantity(current: number, change: number, min: number, max: number): number {
    return this.clamp(current + change, min, max);
  }

  static limitArrayDisplay(arrayLength: number, maxDisplay: number): number {
    return Math.min(arrayLength, maxDisplay);
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

// Import Item type from the proper location
import type { Item, Inventory } from "@/types/Item";

/**
 * Utility class for inventory operations
 * Centralizes common inventory filtering and processing patterns
 */
export class InventoryUtils {
  /**
   * Filter inventory items by effect type
   */
  static getItemsByEffectType(inventory: Inventory, effectType: string): Item[] {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === effectType))
      .map(slot => slot.item);
  }

  /**
   * Get food items (satiety effect)
   */
  static getFoodItems(inventory: Inventory): Item[] {
    return this.getItemsByEffectType(inventory, "satiety");
  }

  /**
   * Get drink items (hydration effect)
   */
  static getDrinkItems(inventory: Inventory): Item[] {
    return this.getItemsByEffectType(inventory, "hydration");
  }

  /**
   * Get happiness items (happiness effect)
   */
  static getHappinessItems(inventory: Inventory): Item[] {
    return this.getItemsByEffectType(inventory, "happiness");
  }

  /**
   * Get cleaning items (clean effect)
   */
  static getCleaningItems(inventory: Inventory): Item[] {
    return this.getItemsByEffectType(inventory, "clean");
  }

  /**
   * Get medicine items (cure or health effects)
   */
  static getMedicineItems(inventory: Inventory): Item[] {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "cure" || effect.type === "health"))
      .map(slot => slot.item);
  }
}

/**
 * Utility class for quest operations
 * Centralizes common quest calculation patterns
 */
export class QuestUtils {
  /**
   * Calculate quest completion progress as percentage
   */
  static calculateQuestProgress(quest: { objectives?: Array<{ completed: boolean }> }): number {
    if (!quest.objectives || !Array.isArray(quest.objectives) || quest.objectives.length === 0) return 0;
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    return Math.round((completedObjectives / quest.objectives.length) * 100);
  }

  /**
   * Get completed objectives count
   */
  static getCompletedObjectivesCount(quest: { objectives?: Array<{ completed: boolean }> }): number {
    if (!quest.objectives || !Array.isArray(quest.objectives)) {
      return 0;
    }
    return quest.objectives.filter(obj => obj.completed).length;
  }

  /**
   * Check if all objectives are completed
   */
  static isQuestComplete(quest: { objectives?: Array<{ completed: boolean }> }): boolean {
    if (!quest.objectives || !Array.isArray(quest.objectives)) {
      return false;
    }
    return quest.objectives.every(obj => obj.completed);
  }
}

/**
 * Utility class for item pricing calculations
 * Centralizes common pricing operations
 */
export class ItemPricing {
  /**
   * Calculate sell price as percentage of item value
   */
  static calculateSellPrice(itemValue: number, sellPercentage: number = 0.5): number {
    return Math.floor(itemValue * sellPercentage);
  }

  /**
   * Get standard sell price (50% of item value)
   */
  static getStandardSellPrice(itemValue: number): number {
    return this.calculateSellPrice(itemValue, 0.5);
  }
}

/**
 * Utility class for text formatting operations
 * Centralizes common text manipulation patterns
 */
export class TextUtils {
  /**
   * Add plural suffix based on count
   */
  static pluralize(word: string, count: number, suffix: string = "s"): string {
    return `${word}${count !== 1 ? suffix : ""}`;
  }

  /**
   * Create item count description with pluralization
   */
  static formatItemCount(count: number, itemType: string): string {
    return `${count} ${this.pluralize(itemType, count)} available`;
  }
}

/**
 * Utility class for item effect operations
 * Centralizes common item effect checking patterns
 */
export class ItemEffectUtils {
  /**
   * Check if item has specific effect type
   */
  static hasEffectType(item: { effects: Array<{ type: string }> }, effectType: string): boolean {
    return item.effects.some(effect => effect.type === effectType);
  }

  /**
   * Check if item has any of the specified effect types
   */
  static hasAnyEffectType(item: { effects: Array<{ type: string }> }, effectTypes: string[]): boolean {
    return item.effects.some(effect => effectTypes.includes(effect.type));
  }

  /**
   * Get effect value from item
   */
  static getEffectValue(item: { effects: Array<{ type: string; value?: number }> }, effectType: string): number {
    const effect = item.effects.find(e => e.type === effectType);
    return effect?.value || 0;
  }

  /**
   * Get effect description for display
   */
  static getEffectDescription(effects: Array<{ type: string; value?: number }>): string {
    return effects
      .map(effect => {
        switch (effect.type) {
          case "satiety":
            return `+${effect.value} Satiety`;
          case "hydration":
            return `+${effect.value} Hydration`;
          case "happiness":
            return `+${effect.value} Happiness`;
          case "energy":
            return `+${effect.value} Energy`;
          case "health":
            return "Heals injuries";
          case "cure":
            return "Cures illness";
          case "clean":
            return "Cleans pet";
          default:
            return effect.type;
        }
      })
      .join(", ");
  }
}

/**
 * Utility class for error handling operations
 * Centralizes common error handling patterns
 */
export class ErrorHandler {
  /**
   * Handle caught errors with consistent logging and response format
   */
  static handleCatchError(
    error: unknown,
    defaultMessage: string,
    logPrefix: string
  ): { success: false; error: string } {
    const message = error instanceof Error ? error.message : defaultMessage;
    console.error(`${logPrefix} error:`, error);
    return { success: false, error: message };
  }
}

/**
 * Utility class for UI display formatting
 * Centralizes common UI formatting patterns
 */
export class UIUtils {
  /**
   * Get rarity color class for items/pets
   */
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case "common":
        return "text-gray-600";
      case "uncommon":
        return "text-green-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  }

  /**
   * Get quest type color class
   */
  static getQuestTypeColor(type: string): string {
    switch (type) {
      case "story":
        return "bg-yellow-100 text-yellow-800";
      case "exploration":
        return "bg-green-100 text-green-800";
      case "collection":
        return "bg-blue-100 text-blue-800";
      case "battle":
        return "bg-red-100 text-red-800";
      case "care":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  /**
   * Format reward text for display
   */
  static formatRewardText(reward: {
    type: string;
    amount?: number;
    itemId?: string;
    locationId?: string;
    questId?: string;
  }): string {
    switch (reward.type) {
      case "gold":
        return `${reward.amount} Gold`;
      case "experience":
        return `${reward.amount} EXP`;
      case "item": {
        // Import getItemById dynamically to avoid circular dependencies
        const itemName = reward.itemId || "Unknown Item";
        return `${reward.amount || 1}x ${itemName}`;
      }
      case "unlock_location":
        return `Unlock ${reward.locationId}`;
      case "unlock_quest":
        return `Unlock Quest: ${reward.questId}`;
      default:
        return "Unknown Reward";
    }
  }

  /**
   * Format activity reward text with probability
   */
  static formatActivityRewardText(reward: { type: string; amount?: number; id?: string; probability: number }): string {
    const chance = GameMath.probabilityToPercentage(reward.probability);

    switch (reward.type) {
      case "gold":
        return `${reward.amount} gold (${chance}%)`;
      case "item":
        return `${reward.id || "Unknown Item"} (${chance}%)`;
      case "experience":
        return `${reward.amount} exp (${chance}%)`;
      default:
        return `${reward.type} (${chance}%)`;
    }
  }
}

/**
 * Centralized stat update utilities
 * Consolidates the duplicate stat update logic from PetSystem and ItemSystem
 */
export class StatUpdateUtils {
  /**
   * Update pet stat with display value conversion and limits
   */
  static updateStat(
    pet: Pet,
    statType: "satiety" | "hydration" | "happiness",
    value: number,
    multiplier: number,
    maxTicks: number
  ): { actualIncrease: number; updatedPet: Pet } {
    const currentDisplayValue = pet[statType];
    const actualIncrease = Math.min(value, 100 - currentDisplayValue);

    if (actualIncrease <= 0) {
      return { actualIncrease: 0, updatedPet: pet };
    }

    const tickIncrease = GameMath.displayValueToTicks(actualIncrease, multiplier);

    const updatedPet: Pet = {
      ...pet,
      lastCareTime: Date.now(),
    };

    // Update display value based on stat type
    switch (statType) {
      case "satiety":
        updatedPet.satietyTicksLeft = GameMath.addToStat(pet.satietyTicksLeft, tickIncrease, maxTicks);
        updatedPet.satiety = GameMath.calculateSatietyDisplay(updatedPet.satietyTicksLeft);
        break;
      case "hydration":
        updatedPet.hydrationTicksLeft = GameMath.addToStat(pet.hydrationTicksLeft, tickIncrease, maxTicks);
        updatedPet.hydration = GameMath.calculateHydrationDisplay(updatedPet.hydrationTicksLeft);
        break;
      case "happiness":
        updatedPet.happinessTicksLeft = GameMath.addToStat(pet.happinessTicksLeft, tickIncrease, maxTicks);
        updatedPet.happiness = GameMath.calculateHappinessDisplay(updatedPet.happinessTicksLeft);
        break;
    }

    return { actualIncrease, updatedPet };
  }
}

/**
 * Game state validation utilities
 */
export class GameStateValidator {
  /**
   * Validates that gameState has currentPet and optionally world
   */
  static validateGameState(
    gameState: { currentPet?: unknown; world?: unknown } | null | undefined,
    requiresWorld = false
  ): boolean {
    if (!gameState?.currentPet) return false;
    if (requiresWorld && !gameState?.world) return false;
    return true;
  }

  /**
   * Validates gameState with early return if invalid
   */
  static requireGameState(
    gameState: { currentPet?: unknown; world?: unknown } | null | undefined,
    requiresWorld = false
  ): boolean {
    return this.validateGameState(gameState, requiresWorld);
  }
}

/**
 * Action handler utilities for consistent logging and error handling
 */
export class ActionHandler {
  /**
   * Executes an async action with consistent error handling and result logging
   */
  static async executeWithLogging<T>(
    actionName: string,
    actionFn: () => Promise<{ success: boolean; error?: string; data?: T }>,
    successMessage?: string
  ): Promise<{ success: boolean; error?: string; data?: T }> {
    try {
      const result = await actionFn();
      if (result.success) {
        if (successMessage) {
          console.log(successMessage);
        }
      } else {
        console.error(`${actionName} failed:`, result.error);
      }
      return result;
    } catch (error) {
      return ErrorHandler.handleCatchError(error, `${actionName} failed`, actionName);
    }
  }

  /**
   * Logs successful purchase/sale transactions
   */
  static logTransaction(action: "bought" | "sold", quantity: number, itemId: string, totalPrice: number): void {
    const actionText = action === "bought" ? "Bought" : "Sold";
    console.log(`${actionText} ${quantity}x ${itemId} for ${totalPrice} gold`);
  }
}

/**
 * Activity Log Utility Functions
 */
export class ActivityLogUtils {
  /**
   * Format activity duration from start and end times
   */
  static formatActivityDuration(startTime: number, endTime?: number): string {
    if (!endTime) {
      return "In progress...";
    }

    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format activity results for display
   */
  static formatActivityResults(results: import("@/types/World").ActivityLogResult[]): string {
    if (results.length === 0) {
      return "No results";
    }

    return results.map(result => result.description).join(", ");
  }

  /**
   * Get display name for activity ID
   */
  static getActivityDisplayName(activityId: string): string {
    // Convert snake_case to Title Case
    return activityId
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get display name for location ID
   */
  static getLocationDisplayName(locationId: string): string {
    // Convert snake_case to Title Case
    return locationId
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Calculate total value of activity results
   */
  static calculateActivityValue(results: import("@/types/World").ActivityLogResult[]): number {
    return results.reduce((total, result) => {
      if (result.type === "gold" && result.amount) {
        return total + result.amount;
      }
      // For items, we could add estimated value but for now just count as 1 gold each
      if (result.type === "item" && result.amount) {
        return total + result.amount;
      }
      return total;
    }, 0);
  }

  /**
   * Format timestamp to local time string
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Format timestamp to relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  /**
   * Get status badge styling for activity status
   */
  static getStatusBadgeClass(status: "started" | "cancelled" | "completed"): string {
    switch (status) {
      case "started":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  /**
   * Filter activity log entries by various criteria
   */
  static filterEntries(
    entries: import("@/types/World").ActivityLogEntry[],
    filters: {
      status?: "started" | "cancelled" | "completed" | "all";
      locationId?: string;
      activityId?: string;
      dateRange?: { start: number; end: number };
    }
  ): import("@/types/World").ActivityLogEntry[] {
    return entries.filter(entry => {
      // Status filter
      if (filters.status && filters.status !== "all" && entry.status !== filters.status) {
        return false;
      }

      // Location filter
      if (filters.locationId && entry.locationId !== filters.locationId) {
        return false;
      }

      // Activity filter
      if (filters.activityId && entry.activityId !== filters.activityId) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        if (entry.startTime < filters.dateRange.start || entry.startTime > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }
}
