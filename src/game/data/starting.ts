/**
 * Starting data for new game and pet creation.
 */

import { getInitialPoopTimer } from "@/game/core/care/poop";
import { calculateMaxStats } from "@/game/core/petStats";
import { createPetId, type GrowthStage, type Pet } from "@/game/types";
import type { InventoryItem } from "@/game/types/gameState";
import { GROWTH_STAGE_DEFINITIONS } from "./growthStages";
import { CLEANING_ITEMS, DRINK_ITEMS, FOOD_ITEMS, TOY_ITEMS } from "./items";
import { getSpeciesById, SPECIES } from "./species";

/**
 * Default starting species ID.
 */
export const DEFAULT_STARTING_SPECIES = SPECIES.FLORABIT.id;

/**
 * Default starting growth stage.
 */
export const DEFAULT_STARTING_STAGE: GrowthStage = "baby";

/**
 * Create a new pet with the given name and species.
 */
export function createNewPet(name: string, speciesId: string): Pet {
  const species = getSpeciesById(speciesId);
  if (!species) {
    throw new Error(`Unknown species: ${speciesId}`);
  }

  const stage = DEFAULT_STARTING_STAGE;
  const stageDef = GROWTH_STAGE_DEFINITIONS[stage];

  // Use centralized max stat calculation
  const maxStats = calculateMaxStats(speciesId, stage);
  if (!maxStats) {
    throw new Error(`Failed to calculate max stats for species: ${speciesId}`);
  }

  // Start with full stats
  const now = Date.now();

  return {
    identity: {
      id: createPetId(),
      name,
      speciesId,
    },
    growth: {
      stage,
      substage: 1,
      birthTime: now,
      ageTicks: 0,
    },
    careStats: {
      satiety: maxStats.careStatMax,
      hydration: maxStats.careStatMax,
      happiness: maxStats.careStatMax,
    },
    energyStats: {
      energy: maxStats.energyMax,
    },
    careLifeStats: {
      careLife: stageDef.careLifeMax,
    },
    battleStats: { ...species.baseStats },
    resistances: { ...species.resistances },
    poop: {
      count: 0,
      ticksUntilNext: getInitialPoopTimer(),
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: 0,
    },
    activityState: "idle",
  };
}

/**
 * Create a default starter pet for testing.
 */
export function createDefaultStarterPet(): Pet {
  return createNewPet("Buddy", DEFAULT_STARTING_SPECIES);
}

/**
 * Starting inventory items for new players.
 * Provides basic care items to get started.
 */
export const STARTING_INVENTORY: readonly InventoryItem[] = [
  // Food items
  { itemId: FOOD_ITEMS.KIBBLE.id, quantity: 5, currentDurability: null },
  { itemId: FOOD_ITEMS.APPLE.id, quantity: 3, currentDurability: null },
  // Drink items
  { itemId: DRINK_ITEMS.WATER.id, quantity: 5, currentDurability: null },
  { itemId: DRINK_ITEMS.JUICE.id, quantity: 3, currentDurability: null },
  // Cleaning items
  { itemId: CLEANING_ITEMS.TISSUE.id, quantity: 5, currentDurability: null },
  { itemId: CLEANING_ITEMS.WIPES.id, quantity: 2, currentDurability: null },
  // Toy (with durability)
  { itemId: TOY_ITEMS.BALL.id, quantity: 1, currentDurability: 10 },
] as const;

/**
 * Starting currency for new players.
 */
export const STARTING_COINS = 100;

/**
 * Get a copy of starting inventory items.
 * Returns a new array with shallow copies of each item to prevent
 * mutations to the readonly STARTING_INVENTORY constant.
 */
export function getStartingInventory(): InventoryItem[] {
  return STARTING_INVENTORY.map((item) => ({ ...item }));
}
