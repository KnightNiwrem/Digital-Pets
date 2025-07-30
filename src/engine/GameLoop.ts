// Core game loop and state management

import type { GameState, GameTick, GameAction } from "@/types";
import { GAME_CONSTANTS } from "@/types";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";

export class GameLoop {
  private static instance: GameLoop | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private gameState: GameState | null = null;
  private tickNumber = 0;
  private isRunning = false;
  private listeners: Set<(gameState: GameState) => void> = new Set();

  private constructor() {}

  /**
   * Get the singleton instance of the game loop
   */
  static getInstance(): GameLoop {
    if (!GameLoop.instance) {
      GameLoop.instance = new GameLoop();
    }
    return GameLoop.instance;
  }

  /**
   * Initialize the game loop with a game state
   */
  initialize(gameState: GameState): void {
    this.gameState = gameState;
    this.tickNumber = gameState.gameTime.totalTicks;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning || !this.gameState) {
      return;
    }

    this.isRunning = true;

    // Use globalThis to handle both browser and test environments
    const globalSetInterval = typeof window !== "undefined" ? window.setInterval : globalThis.setInterval;
    this.intervalId = globalSetInterval(() => {
      this.tick();
    }, GAME_CONSTANTS.TICK_INTERVAL);

    console.log("Game loop started");
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId !== null) {
      // Use globalThis to handle both browser and test environments
      const globalClearInterval = typeof window !== "undefined" ? window.clearInterval : globalThis.clearInterval;
      globalClearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("Game loop stopped");
  }

  /**
   * Execute a single game tick
   */
  tick(): void {
    if (!this.gameState) {
      console.error("Cannot tick without game state");
      return;
    }

    const startTime = performance.now();
    const actions: GameAction[] = [];
    const stateChanges: string[] = [];

    try {
      // Update game time
      this.tickNumber++;
      this.gameState.gameTime.totalTicks = this.tickNumber;
      this.gameState.gameTime.lastTickTime = Date.now();

      // Process pet if one exists
      if (this.gameState.currentPet) {
        const petChanges = PetSystem.processPetTick(this.gameState.currentPet);
        stateChanges.push(...petChanges);

        // Add specific actions for important changes
        if (petChanges.includes("pet_died")) {
          this.handlePetDeath(actions, stateChanges);
        }
        if (petChanges.includes("pet_grew")) {
          actions.push({
            type: "pet_growth",
            payload: {
              petId: this.gameState.currentPet.id,
              newStage: this.gameState.currentPet.growthStage,
            },
            timestamp: Date.now(),
            source: "system",
          });
        }
        if (petChanges.includes("pet_pooped")) {
          actions.push({
            type: "pet_pooped",
            payload: { petId: this.gameState.currentPet.id },
            timestamp: Date.now(),
            source: "system",
          });
        }
        if (petChanges.includes("pet_sick_from_poop")) {
          actions.push({
            type: "pet_became_sick",
            payload: { petId: this.gameState.currentPet.id, reason: "uncleaned_poop" },
            timestamp: Date.now(),
            source: "system",
          });
        }
      }

      // Process world activities
      this.processWorldTick(actions, stateChanges);

      // Process current battle
      if (this.gameState.currentBattle) {
        this.processBattleTick(actions, stateChanges);
      }

      // Update metrics
      this.gameState.metrics.totalTicks++;
      this.gameState.metrics.ticksThisSession++;

      // Auto-save if needed
      if (this.shouldAutoSave()) {
        const saveResult = GameStorage.saveGame(this.gameState);
        if (saveResult.success) {
          stateChanges.push("auto_saved");
        } else {
          console.error("Auto-save failed:", saveResult.error);
        }
      }

      // Create tick record
      const endTime = performance.now();
      const tick: GameTick = {
        tickNumber: this.tickNumber,
        timestamp: Date.now(),
        duration: endTime - startTime,
        actions,
        stateChanges,
      };

      // Notify listeners
      this.notifyListeners();

      // Log performance warnings
      if (tick.duration > 100) {
        console.warn(`Slow tick ${this.tickNumber}: ${tick.duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error("Error during game tick:", error);
    }
  }

  /**
   * Process world-related mechanics for this tick
   */
  private processWorldTick(actions: GameAction[], stateChanges: string[]): void {
    if (!this.gameState) return;

    // Process travel using WorldSystem
    const travelResult = WorldSystem.processTravelTick(this.gameState.world);
    if (travelResult.success && travelResult.data) {
      if (travelResult.message) {
        stateChanges.push("travel_completed");
        actions.push({
          type: "travel_completed",
          payload: { locationId: travelResult.data.currentLocationId },
          timestamp: Date.now(),
          source: "system",
        });

        // If pet was travelling, set back to idle
        if (this.gameState.currentPet?.state === "travelling") {
          this.gameState.currentPet.state = "idle";
        }
      }
      this.gameState.world = travelResult.data;
    }

    // Process activities using WorldSystem
    const activityResult = WorldSystem.processActivitiesTick(this.gameState.world);
    if (activityResult.success && activityResult.data) {
      this.gameState.world = activityResult.data.worldState;

      // Process rewards from completed activities
      if (activityResult.data.rewards.length > 0) {
        stateChanges.push("activities_completed");
        this.processActivityRewards(activityResult.data.rewards, actions, stateChanges);

        // Reset pet state to idle if it was exploring and no more activities
        if (this.gameState.currentPet?.state === "exploring" && this.gameState.world.activeActivities.length === 0) {
          this.gameState.currentPet.state = "idle";
          stateChanges.push("pet_state_reset_to_idle");
        }
      }
    }
  }

  /**
   * Process battle-related mechanics for this tick
   */
  private processBattleTick(_actions: GameAction[], _stateChanges: string[]): void {
    // Battle processing would be implemented here
    // For now, just a placeholder
  }

  /**
   * Handle pet death
   */
  private handlePetDeath(actions: GameAction[], stateChanges: string[]): void {
    if (!this.gameState) return;

    stateChanges.push("pet_died");
    actions.push({
      type: "pet_died",
      payload: { petId: this.gameState.currentPet?.id || "unknown" },
      timestamp: Date.now(),
      source: "system",
    });

    // Reset to starting city
    this.gameState.world.currentLocationId = "hometown";
    this.gameState.world.travelState = undefined;

    // Clear current pet (player will need to select new one)
    this.gameState.currentPet = null;
  }

  /**
   * Process activity rewards
   */
  private processActivityRewards(
    rewards: import("@/types/World").ActivityReward[],
    actions: GameAction[],
    stateChanges: string[]
  ): void {
    if (!this.gameState) return;

    for (const reward of rewards) {
      switch (reward.type) {
        case "gold":
          this.gameState.inventory.gold += reward.amount;
          actions.push({
            type: "gold_earned",
            payload: { amount: reward.amount, source: "activity" },
            timestamp: Date.now(),
            source: "system",
          });
          break;

        case "item":
          if (reward.id) {
            // Add item to inventory using ItemSystem
            const item = getItemById(reward.id);
            if (item) {
              const addResult = ItemSystem.addItem(this.gameState.inventory, item, reward.amount);
              if (addResult.success) {
                this.gameState.inventory = addResult.data!;
              }
            }
            actions.push({
              type: "item_earned",
              payload: { itemId: reward.id, amount: reward.amount, source: "activity" },
              timestamp: Date.now(),
              source: "system",
            });
          }
          break;

        case "experience":
          this.gameState.playerStats.experience += reward.amount;
          actions.push({
            type: "experience_earned",
            payload: { amount: reward.amount, source: "activity" },
            timestamp: Date.now(),
            source: "system",
          });
          break;
      }
    }

    stateChanges.push("rewards_processed");
  }

  /**
   * Calculate offline progression when loading a saved game
   */
  calculateOfflineProgression(lastSaveTime: number): void {
    if (!this.gameState) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastSaveTime;
    const ticksPassed = Math.floor(timeDiff / GAME_CONSTANTS.TICK_INTERVAL);

    if (ticksPassed <= 0) return;

    console.log(`Processing ${ticksPassed} offline ticks (${Math.round(timeDiff / 60000)} minutes offline)`);

    // Process each tick (up to a reasonable limit to avoid performance issues)
    const maxOfflineTicks = 40320; // 7 days worth of ticks
    const actualTicks = Math.min(ticksPassed, maxOfflineTicks);

    // Process pet progression
    for (let i = 0; i < actualTicks; i++) {
      this.tickNumber++;
      this.gameState.gameTime.totalTicks = this.tickNumber;

      if (this.gameState.currentPet) {
        PetSystem.processPetTick(this.gameState.currentPet);
      }
    }

    // Process world progression (travel and activities)
    const worldResult = WorldSystem.processOfflineProgression(this.gameState.world, actualTicks);
    if (worldResult.success && worldResult.data) {
      this.gameState.world = worldResult.data.worldState;

      // Process any rewards from offline activities
      if (worldResult.data.rewards.length > 0) {
        const actions: GameAction[] = [];
        const stateChanges: string[] = [];
        this.processActivityRewards(worldResult.data.rewards, actions, stateChanges);
      }
    }

    // Update game time
    this.gameState.gameTime.lastTickTime = currentTime;

    // Save the updated state
    GameStorage.saveGame(this.gameState);
  }

  /**
   * Check if auto-save should happen this tick
   */
  private shouldAutoSave(): boolean {
    if (!this.gameState?.settings.autoSave) return false;

    const interval = this.gameState.settings.autoSaveInterval;
    return this.tickNumber % interval === 0;
  }

  /**
   * Add a listener for game state changes
   */
  addListener(callback: (gameState: GameState) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Remove a listener
   */
  removeListener(callback: (gameState: GameState) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    if (this.gameState) {
      this.listeners.forEach(callback => {
        try {
          callback(this.gameState!);
        } catch (error) {
          console.error("Error in game state listener:", error);
        }
      });
    }
  }

  /**
   * Get current game state (read-only)
   */
  getGameState(): GameState | null {
    return this.gameState;
  }

  /**
   * Force an immediate save
   */
  forceSave(): void {
    if (this.gameState) {
      const result = GameStorage.saveGame(this.gameState);
      if (!result.success) {
        console.error("Force save failed:", result.error);
      }
    }
  }

  /**
   * Calculate and apply offline progression when loading a saved game
   */
  static calculateOfflineProgression(gameState: GameState): {
    ticksElapsed: number;
    progressionApplied: boolean;
    majorEvents: string[];
  } {
    const now = Date.now();
    const lastSaveTime = gameState.metadata.lastSaveTime;
    const offlineTimeMs = now - lastSaveTime;

    // Convert offline time to ticks (15 second intervals)
    const ticksElapsed = Math.floor(offlineTimeMs / GAME_CONSTANTS.TICK_INTERVAL);
    const majorEvents: string[] = [];

    // Don't process if less than one tick elapsed or offline progression is disabled
    if (ticksElapsed < 1 || !gameState.settings.offlineProgressEnabled) {
      return { ticksElapsed: 0, progressionApplied: false, majorEvents: [] };
    }

    // Cap offline progression to prevent excessive calculation (max 7 days)
    const maxOfflineTicks = Math.floor((7 * 24 * 60 * 60 * 1000) / GAME_CONSTANTS.TICK_INTERVAL);
    const actualTicksToProcess = Math.min(ticksElapsed, maxOfflineTicks);

    console.log(
      `Processing ${actualTicksToProcess} offline ticks (${((actualTicksToProcess * GAME_CONSTANTS.TICK_INTERVAL) / 1000 / 60).toFixed(1)} minutes)`
    );

    // Update game time
    gameState.gameTime.totalTicks += actualTicksToProcess;
    gameState.gameTime.lastTickTime = now;

    // Process pet progression if pet exists
    if (gameState.currentPet) {
      for (let i = 0; i < actualTicksToProcess; i++) {
        const petChanges = PetSystem.processPetTick(gameState.currentPet);

        // Track major events
        if (petChanges.includes("pet_died")) {
          majorEvents.push("pet_died");
          // Reset to starting city and clear pet like in normal tick
          gameState.world.currentLocationId = "hometown";
          gameState.world.travelState = undefined;
          gameState.currentPet = null;
          break; // Stop processing if pet died
        }
        if (petChanges.includes("pet_grew")) {
          majorEvents.push("pet_grew");
        }
        if (petChanges.includes("pet_sick_from_poop")) {
          majorEvents.push("pet_became_sick");
        }
      }
    }

    // Process world progression
    if (gameState.world.travelState) {
      gameState.world.travelState.ticksRemaining -= actualTicksToProcess;

      if (gameState.world.travelState.ticksRemaining <= 0) {
        // Travel completed during offline time
        gameState.world.currentLocationId = gameState.world.travelState.destinationId;
        gameState.world.travelState = undefined;
        majorEvents.push("travel_completed");

        // Set pet back to idle if it was travelling
        if (gameState.currentPet?.state === "travelling") {
          gameState.currentPet.state = "idle";
        }
      }
    }

    // Process active activities
    const hadActivities = gameState.world.activeActivities.length > 0;
    gameState.world.activeActivities = gameState.world.activeActivities.filter(activity => {
      activity.ticksRemaining -= actualTicksToProcess;

      if (activity.ticksRemaining <= 0) {
        majorEvents.push("activity_completed");
        // Note: Actual reward distribution would need ItemSystem implementation
        return false; // Remove completed activity
      }

      return true; // Keep ongoing activity
    });

    // Reset pet state to idle if it was exploring and no more activities
    if (hadActivities && gameState.currentPet?.state === "exploring" && gameState.world.activeActivities.length === 0) {
      gameState.currentPet.state = "idle";
      majorEvents.push("pet_state_reset_to_idle");
    }

    // Update metrics
    gameState.metrics.totalTicks += actualTicksToProcess;
    gameState.metrics.totalPlayTime += offlineTimeMs;

    return {
      ticksElapsed: actualTicksToProcess,
      progressionApplied: true,
      majorEvents: [...new Set(majorEvents)], // Remove duplicates
    };
  }

  /**
   * Load a game state and apply offline progression
   */
  static loadGameWithProgression(): {
    success: boolean;
    gameState?: GameState;
    offlineProgression?: {
      ticksElapsed: number;
      progressionApplied: boolean;
      majorEvents: string[];
    };
    error?: string;
  } {
    // Load the game state
    const loadResult = GameStorage.loadGame();
    if (!loadResult.success) {
      return {
        success: false,
        error: loadResult.error,
      };
    }

    const gameState = loadResult.data!;

    // Calculate and apply offline progression
    const offlineProgression = this.calculateOfflineProgression(gameState);

    // Update save timestamp and save the updated state
    gameState.metadata.lastSaveTime = Date.now();
    const saveResult = GameStorage.saveGame(gameState);

    if (!saveResult.success) {
      console.warn("Failed to save after offline progression:", saveResult.error);
    }

    return {
      success: true,
      gameState,
      offlineProgression,
    };
  }
}
