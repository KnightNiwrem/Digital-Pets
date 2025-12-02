/**
 * Centralized message registry for user-facing strings.
 *
 * This module provides consistent, translatable messages for:
 * - Error messages
 * - Status updates
 * - Activity feedback
 *
 * All user-facing strings should be defined here for:
 * - Consistency across the codebase
 * - Easy future localization/i18n support
 * - Single source of truth for UI text
 */

import {
  type ActivityState,
  getActivityDisplayName,
} from "@/game/types/constants";

/**
 * Sleep-related messages.
 */
export const SleepMessages = {
  /** When attempting to put an already sleeping pet to sleep */
  alreadySleeping: "Pet is already sleeping.",
  /** When successfully putting a pet to sleep */
  nowSleeping: "Pet is now sleeping.",
  /** When attempting to wake an already awake pet */
  alreadyAwake: "Pet is already awake.",
  /** When successfully waking a pet */
  nowAwake: "Pet is now awake.",
} as const;

/**
 * Energy-related messages.
 */
export const EnergyMessages = {
  /**
   * Generate a message for insufficient energy.
   * @param required - Required energy in display units
   * @param current - Current energy in display units
   */
  notEnoughEnergy: (required: number, current: number): string =>
    `Not enough energy. Need ${required}, have ${current}.`,
} as const;

/**
 * Activity conflict messages.
 */
export const ActivityMessages = {
  /**
   * Generate a message when the pet is already doing the same activity.
   * @param activity - The current activity state
   */
  alreadyDoingActivity: (activity: ActivityState): string =>
    `Your pet is already ${getActivityDisplayName(activity)}.`,

  /**
   * Generate a message when an action cannot be performed due to current activity.
   * @param attemptedAction - The action being attempted
   * @param currentActivity - The pet's current activity state
   */
  cannotPerformWhileBusy: (
    attemptedAction: string,
    currentActivity: ActivityState,
  ): string =>
    `Cannot ${attemptedAction} while ${getActivityDisplayName(currentActivity)}.`,
} as const;

/**
 * Training-related messages.
 */
export const TrainingMessages = {
  /** When facility is not found */
  facilityNotFound: "Training facility not found.",
  /** When session is not available at facility */
  sessionNotAvailable: "Training session not available.",
  /** When ready to train */
  readyToTrain: "Ready to train!",
  /** When session is not found */
  sessionNotFound: "Session not found.",
  /** When no active training to complete */
  noActiveTraining: "No active training to complete.",
  /** When training data is not found */
  trainingDataNotFound: "Training data not found.",
  /** When no training session to cancel */
  noTrainingToCancel: "No training session to cancel.",
  /** When training is cancelled and energy refunded */
  trainingCancelled: "Training cancelled. Energy has been refunded.",
  /**
   * Generate a message for stage requirement.
   * @param minStage - The minimum required stage
   */
  requiresStage: (minStage: string): string =>
    `Requires ${minStage} stage or higher.`,
  /**
   * Generate a message for starting training.
   * @param sessionName - The training session name
   * @param facilityName - The training facility name
   */
  startedTraining: (sessionName: string, facilityName: string): string =>
    `Started ${sessionName} at ${facilityName}!`,
  /**
   * Generate a message for training completion with stat gains.
   * @param primaryGain - Primary stat gain amount
   * @param primaryStat - Primary stat name
   * @param secondaryGain - Secondary stat gain amount (optional)
   * @param secondaryStat - Secondary stat name (optional)
   */
  trainingComplete: (
    primaryGain: number,
    primaryStat: string,
    secondaryGain?: number,
    secondaryStat?: string,
  ): string => {
    const secondary =
      secondaryGain && secondaryGain > 0 && secondaryStat
        ? ` and +${secondaryGain} ${secondaryStat}`
        : "";
    return `Training complete! Gained +${primaryGain} ${primaryStat}${secondary}.`;
  },
} as const;

/**
 * Shop-related messages.
 */
export const ShopMessages = {
  /** When quantity is invalid */
  invalidQuantity: "Quantity must be at least 1.",
  /** When shop is not found */
  shopNotFound: "Shop not found.",
  /** When item is not available in shop */
  itemNotInShop: "Item not available in this shop.",
  /** When item definition is not found */
  itemNotFound: "Item not found.",
  /** When player doesn't have enough items to sell */
  notEnoughItems: "Not enough items to sell.",
  /** When item cannot be sold */
  cannotSellItem: "This item cannot be sold.",
  /**
   * Generate a message for insufficient coins.
   * @param totalCost - The total cost required
   */
  notEnoughCoins: (totalCost: number): string =>
    `Not enough coins. Need ${totalCost} coins.`,
  /**
   * Generate a message for successful purchase.
   * @param quantity - Number of items purchased
   * @param itemName - Name of the item
   * @param totalCost - Total coins spent
   */
  purchaseSuccess: (
    quantity: number,
    itemName: string,
    totalCost: number,
  ): string => `Purchased ${quantity}x ${itemName} for ${totalCost} coins.`,
  /**
   * Generate a message for successful sale.
   * @param quantity - Number of items sold
   * @param itemName - Name of the item
   * @param totalEarned - Total coins earned
   */
  saleSuccess: (
    quantity: number,
    itemName: string,
    totalEarned: number,
  ): string => `Sold ${quantity}x ${itemName} for ${totalEarned} coins.`,
} as const;

/**
 * Travel-related messages.
 */
export const TravelMessages = {
  /** When pet is required but not present */
  petRequired: "Pet required",
  /** When destination is unknown */
  unknownDestination: "Unknown destination.",
  /** When locations are not connected */
  notConnected: "Not connected",
  /** When requirements are not met */
  requirementsNotMet: "Requirements not met.",
  /** When travel cost cannot be calculated */
  cannotCalculateCost: "Cannot calculate travel cost.",
  /** When state is invalid for travel */
  invalidState: "Invalid state.",
  /** When ready to travel */
  readyToTravel: "Ready to travel.",
  /**
   * Generate a message for successful travel.
   * @param destinationName - Name of the destination
   */
  traveledTo: (destinationName: string): string =>
    `Traveled to ${destinationName}!`,
  /**
   * Generate a message for stage requirement.
   * @param stageName - The required stage display name
   */
  requiresStage: (stageName: string): string => `Requires ${stageName} stage`,
} as const;

/**
 * Quest-related messages.
 */
export const QuestMessages = {
  /** When quest is not found */
  questNotFound: "Quest not found.",
  /** When quest is locked */
  questLocked: "Quest requirements not met.",
  /** When quest is already in progress or completed */
  questAlreadyStarted: "Quest is already in progress or completed.",
  /** When quest is not started */
  questNotStarted: "Quest not started.",
  /** When quest is not active */
  questNotActive: "Quest is not active.",
  /** When not all objectives are complete */
  objectivesIncomplete: "Not all objectives are complete.",
  /** When player needs to go to start location */
  goToStartLocation: "Go to start location",
  /** When player needs to go to turn-in location */
  goToTurnInLocation: "Go to turn-in location",
  /** When quest is not a timed quest */
  notTimedQuest: "Quest is not a timed quest.",
  /** When timed quest has no duration configured */
  noDurationConfigured: "Timed quest has no duration configured.",
  /** When timed quest is expired */
  questExpired: "Quest is already in progress, completed, or expired.",
  /** When should use startTimedQuest instead */
  useStartTimedQuest: "Use startTimedQuest for timed quests.",
  /**
   * Generate a message for starting a quest.
   * @param questName - Name of the quest
   */
  startedQuest: (questName: string): string => `Started quest: ${questName}`,
  /**
   * Generate a message for completing a quest.
   * @param questName - Name of the quest
   */
  completedQuest: (questName: string): string =>
    `Completed quest: ${questName}`,
} as const;

/**
 * Exploration-related messages.
 */
export const ExplorationMessages = {
  /** When there's no active exploration to complete */
  noActiveExploration: "No active exploration to complete",
  /** When there's no active exploration to cancel */
  noExplorationToCancel: "No active exploration to cancel",
  /** When exploration is cancelled and energy refunded */
  explorationCancelled: "Exploration cancelled. Energy has been refunded.",
  /** When activity is unknown */
  unknownActivity: "Unknown activity",
  /**
   * Generate a message for pet being busy.
   * @param activityState - Current activity state
   */
  petBusy: (activityState: string): string =>
    `Pet is currently ${activityState}`,
  /**
   * Generate a message for unknown activity with ID.
   * @param activityId - The unknown activity ID
   */
  unknownActivityId: (activityId: string): string =>
    `Unknown activity: ${activityId}`,
  /**
   * Generate a message for unknown location.
   * @param locationId - The unknown location ID
   */
  unknownLocation: (locationId: string): string =>
    `Unknown location: ${locationId}`,
  /**
   * Generate a message for activity not available at location.
   * @param activityName - The activity name
   */
  activityNotAvailable: (activityName: string): string =>
    `${activityName} is not available at this location`,
  /**
   * Generate a message for insufficient energy.
   * @param energyCost - Required energy cost
   */
  notEnoughEnergy: (energyCost: number): string =>
    `Not enough energy (need ${energyCost})`,
  /**
   * Generate a message for activity on cooldown.
   * @param ticksRemaining - Ticks remaining on cooldown
   */
  onCooldown: (ticksRemaining: number): string =>
    `Activity on cooldown (${ticksRemaining} ticks remaining)`,
  /**
   * Generate a message for exploration completion with items found.
   * @param itemCount - Number of items found
   * @param locationName - Name of the location
   */
  explorationComplete: (itemCount: number, locationName: string): string =>
    itemCount > 0
      ? `Found ${itemCount} item${itemCount !== 1 ? "s" : ""} at ${locationName}!`
      : `Exploration complete at ${locationName}, but nothing was found this time.`,
} as const;

/**
 * Item usage messages.
 */
export const ItemMessages = {
  /** When there's no pet to use item on */
  noPetToFeed: "No pet to feed!",
  /** When there's no pet to give water to */
  noPetToWater: "No pet to give water!",
  /** When there's no pet to clean */
  noPetToClean: "No pet to clean!",
  /** When there's no pet to play with */
  noPetToPlay: "No pet to play with!",
  /** When food item is invalid */
  invalidFoodItem: "Invalid food item!",
  /** When drink item is invalid */
  invalidDrinkItem: "Invalid drink item!",
  /** When cleaning item is invalid */
  invalidCleaningItem: "Invalid cleaning item!",
  /** When toy item is invalid */
  invalidToyItem: "Invalid toy item!",
  /** When there's nothing to clean */
  nothingToClean: "Nothing to clean!",
  /** When inventory item has corrupted durability */
  corruptedDurability: (itemName: string): string =>
    `Corrupted inventory: ${itemName} is missing durability!`,
  /**
   * Generate a message for item not in inventory.
   * @param itemName - Name of the item
   */
  notInInventory: (itemName: string): string => `No ${itemName} in inventory!`,
  /**
   * Generate a message for feeding.
   * @param itemName - Name of the food item
   */
  fed: (itemName: string): string => `Fed ${itemName}!`,
  /**
   * Generate a message for giving drink.
   * @param itemName - Name of the drink item
   */
  gaveDrink: (itemName: string): string => `Gave ${itemName}!`,
  /**
   * Generate a message for cleaning.
   * @param cleaned - Number of poop cleaned
   * @param itemName - Name of the cleaning item
   */
  cleaned: (cleaned: number, itemName: string): string =>
    `Cleaned ${cleaned} poop with ${itemName}!`,
  /**
   * Generate a message for playing with toy.
   * @param itemName - Name of the toy item
   * @param broke - Whether the toy broke
   */
  playedWith: (itemName: string, broke: boolean): string =>
    broke ? `Played with ${itemName}! It broke!` : `Played with ${itemName}!`,
} as const;
