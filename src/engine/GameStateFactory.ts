// Factory for creating game state objects

import type { GameState, Pet, PetSpecies, Inventory, WorldState, QuestLog } from "@/types";
import { GAME_CONSTANTS, DEFAULT_GAME_SETTINGS, DEFAULT_PLAYER_STATS, DEFAULT_ACTIVITY_STATS } from "@/types";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";
import { getStarterPets } from "@/data/pets";

export class GameStateFactory {
  /**
   * Create a new game state for a fresh game
   */
  static createNewGame(starterPet?: Pet): GameState {
    const now = Date.now();

    return {
      metadata: {
        version: GAME_CONSTANTS.SAVE_VERSION,
        lastSaveTime: now,
        saveCount: 0,
        platform: this.getPlatform(),
        gameVersion: GAME_CONSTANTS.SAVE_VERSION,
      },

      currentPet: starterPet || null,
      ownedPets: starterPet ? [starterPet] : [],

      inventory: this.createStartingInventory(),
      world: this.createStartingWorld(),
      questLog: this.createEmptyQuestLog(),

      currentBattle: null,

      playerStats: { ...DEFAULT_PLAYER_STATS },
      settings: { ...DEFAULT_GAME_SETTINGS },

      metrics: {
        sessionStartTime: now,
        ticksThisSession: 0,
        totalSessions: 1,
        totalTicks: 0,
        totalPlayTime: 0,
        totalFeedings: 0,
        totalDrinks: 0,
        totalPlays: 0,
        totalCleanings: 0,
        totalMedicineUsed: 0,
        totalBattles: 0,
        totalForaging: 0,
        totalFishing: 0,
        totalMining: 0,
        totalTraining: 0,
        totalGoldEarned: 0,
        totalGoldSpent: 0,
        totalItemsUsed: 0,
        totalItemsSold: 0,
      },

      activityStats: {
        foraging: { ...DEFAULT_ACTIVITY_STATS.foraging },
        fishing: { ...DEFAULT_ACTIVITY_STATS.fishing },
        mining: { ...DEFAULT_ACTIVITY_STATS.mining },
        training: { ...DEFAULT_ACTIVITY_STATS.training },
        totals: { ...DEFAULT_ACTIVITY_STATS.totals },
      },

      // Initialize empty activity log
      activityLog: [],

      gameTime: {
        totalTicks: 0,
        lastTickTime: now,
        isPaused: false,
      },

      tutorial: {
        completed: false,
        currentStep: "welcome",
        skippedSteps: [],
      },

      achievements: {},
      notifications: [],
    };
  }

  /**
   * Create a new game state with a specific starter pet
   */
  static createNewGameWithStarter(starterPetName: string = "Buddy", starterSpeciesId?: string): GameState {
    const starterPets = getStarterPets();

    // Find the specified starter pet species, or default to the first one
    let chosenSpecies = starterPets[0]; // Default to Wild Beast
    if (starterSpeciesId) {
      const foundSpecies = starterPets.find(species => species.id === starterSpeciesId);
      if (foundSpecies) {
        chosenSpecies = foundSpecies;
      }
    }

    // Create the starter pet
    const starterPet = this.createStarterPet(chosenSpecies, starterPetName);

    // Create and return the new game state
    return this.createNewGame(starterPet);
  }

  /**
   * Create a starter pet for new players
   */
  static createStarterPet(species: PetSpecies, name: string): Pet {
    const now = Date.now();

    return {
      id: this.generateId(),
      name,
      species,
      rarity: species.rarity,
      growthStage: 0,

      // Starting care stats
      satiety: 100,
      hydration: 100,
      happiness: 100,

      // Starting hidden counters (full)
      satietyTicksLeft: 10000, // ~41 hours
      hydrationTicksLeft: 8000, // ~33 hours
      happinessTicksLeft: 12000, // ~50 hours
      poopTicksLeft: 480, // ~2 hours
      poopCount: 0, // Start with no uncleaned poop
      sickByPoopTicksLeft: 17280, // 72 hours

      // Core stats
      life: 1000000, // Start with full life
      maxEnergy: 100,
      currentEnergy: 100,
      health: "healthy",
      state: "idle",

      // Battle stats based on species
      attack: species.baseStats.attack,
      defense: species.baseStats.defense,
      speed: species.baseStats.speed,
      maxHealth: species.baseStats.health,
      currentHealth: species.baseStats.health,
      moves: [], // No moves initially

      // Metadata
      birthTime: now,
      lastCareTime: now,
      totalLifetime: 0,
    };
  }

  /**
   * Create starting inventory for new players
   */
  private static createStartingInventory(): Inventory {
    // Create empty inventory
    let inventory = ItemSystem.createInventory(GAME_CONSTANTS.STARTING_INVENTORY_SLOTS, GAME_CONSTANTS.STARTING_GOLD);

    // Add starting items
    const startingItems = [
      { id: "apple", quantity: 3 },
      { id: "water_bottle", quantity: 3 },
      { id: "ball", quantity: 1 },
      { id: "basic_medicine", quantity: 1 },
      { id: "soap", quantity: 2 },
    ];

    startingItems.forEach(({ id, quantity }) => {
      const item = getItemById(id);
      if (item) {
        const result = ItemSystem.addItem(inventory, item, quantity);
        if (result.success) {
          inventory = result.data!;
        }
      }
    });

    return inventory;
  }

  /**
   * Create starting world state
   */
  private static createStartingWorld(): WorldState {
    return WorldSystem.initializeWorldState();
  }

  /**
   * Create empty quest log for new players
   */
  private static createEmptyQuestLog(): QuestLog {
    return {
      activeQuests: [],
      completedQuests: [],
      failedQuests: [],
      availableQuests: ["welcome_quest"], // Starting quest
      questChains: [],
    };
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect the current platform
   */
  private static getPlatform(): string {
    if (typeof window === "undefined") return "server";

    const userAgent = window.navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return "mobile";
    } else if (/tablet/.test(userAgent)) {
      return "tablet";
    } else {
      return "desktop";
    }
  }

  /**
   * Validate a game state object
   */
  static validateGameState(gameState: unknown): gameState is GameState {
    if (!gameState || typeof gameState !== "object") {
      return false;
    }

    const state = gameState as Record<string, unknown>;

    // Check for required properties
    const requiredProps = [
      "metadata",
      "inventory",
      "world",
      "questLog",
      "playerStats",
      "settings",
      "metrics",
      "activityStats",
      "activityLog",
      "gameTime",
      "tutorial",
      "achievements",
      "notifications",
    ];

    return requiredProps.every(prop => prop in state);
  }

  /**
   * Create a minimal test game state for development
   */
  static createTestGame(): GameState {
    // This would create a game state with test data for development
    const testSpecies: PetSpecies = {
      id: "test_pet",
      name: "Test Pet",
      rarity: "common",
      description: "A pet for testing",
      baseStats: { attack: 10, defense: 8, speed: 12, health: 50 },
      growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.2, energy: 1.1 },
      sprite: "test_pet.png",
      icon: "test_pet_icon.png",
    };

    const testPet = this.createStarterPet(testSpecies, "Test");
    return this.createNewGame(testPet);
  }
}
