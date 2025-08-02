// Core game loop and state management

import type { GameState, GameTick, GameAction } from "@/types";
import type { ActivityReward, ActivityType } from "@/types/World";
import { GAME_CONSTANTS } from "@/types";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";
import { getLocationById } from "@/data/locations";

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
   * Update the game loop's internal state (for external state changes)
   */
  updateState(gameState: GameState): void {
    this.gameState = gameState;
  }

  /**
   * Get current game state (for testing and debugging)
   */
  getCurrentGameState(): GameState | null {
    return this.gameState;
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

      // Auto-save if on interval (autosave is always enabled)
      const interval = this.gameState.settings.autoSaveInterval;
      if (this.tickNumber % interval === 0) {
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
      const hadActivitiesCompleted = activityResult.data.rewards.length > 0;
      this.gameState.world = activityResult.data.worldState;

      // Process rewards from completed activities
      if (hadActivitiesCompleted) {
        stateChanges.push("activities_completed");
        this.processActivityRewards(activityResult.data.rewards, actions, stateChanges);
      }

      // Reset pet state to idle if it was exploring and activities completed but no more remain
      if (
        hadActivitiesCompleted &&
        this.gameState.currentPet?.state === "exploring" &&
        this.gameState.world.activeActivities.length === 0
      ) {
        this.gameState.currentPet.state = "idle";
        stateChanges.push("pet_state_reset_to_idle");
      }
    }
  }

  /**
   * Process battle-related mechanics for this tick
   * Note: Battles in this game are turn-based rather than tick-based,
   * so no continuous processing is needed during regular game ticks.
   */
  private processBattleTick(_actions: GameAction[], _stateChanges: string[]): void {
    // Battles are handled entirely through user actions in the BattleSystem
    // No continuous tick processing required for turn-based battle mechanics
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
    rewards: ActivityReward[],
    actions?: GameAction[],
    stateChanges?: string[],
    majorEvents?: string[]
  ): void {
    if (!this.gameState) return;

    GameLoop.processActivityRewardsStatic(this.gameState, rewards, majorEvents);

    // Add actions and state changes only when provided (for online processing)
    if (actions && stateChanges) {
      for (const reward of rewards) {
        // Validate reward has required properties
        if (!reward.type || reward.amount === undefined || reward.amount === null) {
          actions.push({
            type: "gold_earned",
            payload: { amount: 1, source: "activity_error_compensation" },
            timestamp: Date.now(),
            source: "system",
          });
          continue;
        }

        switch (reward.type) {
          case "gold":
            actions.push({
              type: "gold_earned",
              payload: { amount: reward.amount, source: "activity" },
              timestamp: Date.now(),
              source: "system",
            });
            break;

          case "item":
            if (reward.id) {
              const item = getItemById(reward.id);
              if (item) {
                const addResult = ItemSystem.addItem(this.gameState.inventory, item, reward.amount);
                if (!addResult.success) {
                  // Convert failed item additions to gold compensation
                  const compensationGold = Math.max(1, Math.floor(item.value * reward.amount * 0.5));
                  actions.push({
                    type: "gold_earned",
                    payload: { amount: compensationGold, source: "item_compensation" },
                    timestamp: Date.now(),
                    source: "system",
                  });
                  actions.push({
                    type: "item_conversion",
                    payload: {
                      itemId: reward.id,
                      amount: reward.amount,
                      goldReceived: compensationGold,
                      reason: "inventory_full",
                    },
                    timestamp: Date.now(),
                    source: "system",
                  });
                }
              } else {
                // Provide default gold compensation for missing items
                const compensationGold = reward.amount * 2;
                actions.push({
                  type: "gold_earned",
                  payload: { amount: compensationGold, source: "missing_item_compensation" },
                  timestamp: Date.now(),
                  source: "system",
                });
                actions.push({
                  type: "item_missing",
                  payload: { itemId: reward.id, amount: reward.amount, goldReceived: compensationGold },
                  timestamp: Date.now(),
                  source: "system",
                });
                console.warn(`Missing item definition for ${reward.id}, providing gold compensation`);
              }
              actions.push({
                type: "item_earned",
                payload: { itemId: reward.id, amount: reward.amount, source: "activity" },
                timestamp: Date.now(),
                source: "system",
              });
            } else {
              // Handle malformed item rewards missing ID
              const compensationGold = reward.amount || 1;
              actions.push({
                type: "gold_earned",
                payload: { amount: compensationGold, source: "malformed_item_compensation" },
                timestamp: Date.now(),
                source: "system",
              });
              console.warn("Item reward missing ID, providing gold compensation:", reward);
            }
            break;

          case "experience":
            actions.push({
              type: "experience_earned",
              payload: { amount: reward.amount, source: "activity" },
              timestamp: Date.now(),
              source: "system",
            });
            break;

          default: {
            // Handle unknown reward types
            const unknownCompensation = 1;
            actions.push({
              type: "gold_earned",
              payload: { amount: unknownCompensation, source: "unknown_reward_compensation" },
              timestamp: Date.now(),
              source: "system",
            });
            console.warn("Unknown reward type, providing gold compensation:", reward);
            break;
          }
        }
      }

      stateChanges.push("rewards_processed");
    }
  }

  /**
   * Process activity rewards (static version for offline processing)
   */
  private static processActivityRewardsStatic(
    gameState: GameState,
    rewards: ActivityReward[],
    majorEvents?: string[]
  ): void {
    for (const reward of rewards) {
      // Validate reward has required properties
      if (!reward.type || reward.amount === undefined || reward.amount === null) {
        // Provide minimal gold compensation for malformed rewards
        gameState.inventory.gold += 1;
        console.warn("Malformed reward data, providing gold compensation:", reward);
        continue;
      }

      switch (reward.type) {
        case "gold":
          gameState.inventory.gold += reward.amount;
          break;

        case "item":
          if (reward.id) {
            // Add item to inventory using ItemSystem
            const item = getItemById(reward.id);
            if (item) {
              const addResult = ItemSystem.addItem(gameState.inventory, item, reward.amount);
              if (addResult.success) {
                gameState.inventory = addResult.data!;
              } else {
                // Convert failed item additions to gold compensation
                const compensationGold = Math.max(1, Math.floor(item.value * reward.amount * 0.5));
                gameState.inventory.gold += compensationGold;
                if (majorEvents) {
                  majorEvents.push(`item_conversion_to_gold_${reward.id}`);
                }
              }
            } else {
              // Provide default gold compensation for missing items
              const compensationGold = reward.amount * 2;
              gameState.inventory.gold += compensationGold;
              if (majorEvents) {
                majorEvents.push(`missing_item_compensation_${reward.id}`);
              }
              console.warn(`Missing item definition for ${reward.id}, providing gold compensation`);
            }
          } else {
            // Handle malformed item rewards missing ID
            const compensationGold = reward.amount || 1;
            gameState.inventory.gold += compensationGold;
            console.warn("Item reward missing ID, providing gold compensation:", reward);
          }
          break;

        case "experience":
          gameState.playerStats.experience += reward.amount;
          break;

        default: {
          // Handle unknown reward types
          const unknownCompensation = 1;
          gameState.inventory.gold += unknownCompensation;
          console.warn("Unknown reward type, providing gold compensation:", reward);
          break;
        }
      }
    }
  }

  /**
   * Update activity statistics for completed activity
   */
  private static updateActivityStatistics(
    gameState: GameState,
    activityType: ActivityType,
    activityDuration: number,
    rewards: ActivityReward[]
  ): void {
    // Calculate totals from rewards
    let goldEarned = 0;
    let itemsEarned = 0;
    let experienceEarned = 0;

    for (const reward of rewards) {
      switch (reward.type) {
        case "gold":
          goldEarned += reward.amount;
          break;
        case "item":
          itemsEarned += reward.amount;
          break;
        case "experience":
          experienceEarned += reward.amount;
          break;
      }
    }

    // Update activity-specific stats
    if (gameState.activityStats[activityType]) {
      gameState.activityStats[activityType].completions += 1;
      gameState.activityStats[activityType].timeSpent += activityDuration;
      gameState.activityStats[activityType].goldEarned += goldEarned;
      gameState.activityStats[activityType].itemsEarned += itemsEarned;
      gameState.activityStats[activityType].experienceEarned += experienceEarned;
    }

    // Update totals
    gameState.activityStats.totals.completions += 1;
    gameState.activityStats.totals.timeSpent += activityDuration;
    gameState.activityStats.totals.goldEarned += goldEarned;
    gameState.activityStats.totals.itemsEarned += itemsEarned;
    gameState.activityStats.totals.experienceEarned += experienceEarned;

    // Also update the legacy metrics for backward compatibility
    if (activityType === "foraging") {
      gameState.metrics.totalForaging += 1;
    } else if (activityType === "fishing") {
      gameState.metrics.totalFishing += 1;
    } else if (activityType === "mining") {
      gameState.metrics.totalMining += 1;
    } else if (activityType === "training") {
      gameState.metrics.totalTraining += 1;
    }
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

      // Update activity statistics for offline completed activities
      for (const completedActivity of worldResult.data.completedActivities) {
        GameLoop.updateActivityStatistics(
          this.gameState,
          completedActivity.activityType,
          completedActivity.duration,
          completedActivity.rewards
        );
      }
    }

    // Update game time
    this.gameState.gameTime.lastTickTime = currentTime;

    // Save the updated state
    GameStorage.saveGame(this.gameState);
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
    const completedActivities: Array<{ activity: { [key: string]: unknown }; rewards: ActivityReward[] }> = [];

    gameState.world.activeActivities = gameState.world.activeActivities.filter(activity => {
      activity.ticksRemaining -= actualTicksToProcess;

      if (activity.ticksRemaining <= 0) {
        majorEvents.push("activity_completed");

        // Get activity definition from location data
        const location = getLocationById(activity.locationId);
        if (location) {
          const activityDef = location.activities.find(a => a.id === activity.activityId);
          if (activityDef) {
            // Calculate rewards based on probability rolls
            const earnedRewards: ActivityReward[] = [];
            for (const reward of activityDef.rewards) {
              if (Math.random() <= reward.probability) {
                earnedRewards.push(reward);
              }
            }

            // Store activity and rewards for later processing
            completedActivities.push({
              activity: { ...activity, definition: activityDef },
              rewards: earnedRewards,
            });
          }
        }

        return false; // Remove completed activity
      }

      return true; // Keep ongoing activity
    });

    // Process rewards for all completed activities
    for (const { activity, rewards } of completedActivities) {
      if (rewards.length > 0) {
        GameLoop.processActivityRewardsStatic(gameState, rewards, majorEvents);
      }

      // Update activity statistics if we have the activity definition
      const activityData = activity as { definition?: { type: ActivityType; duration: number } };
      if (activityData.definition) {
        GameLoop.updateActivityStatistics(
          gameState,
          activityData.definition.type,
          activityData.definition.duration,
          rewards
        );
      }
    }

    // Reset pet state to idle if it was exploring and activities completed but no more remain
    if (hadActivities && gameState.world.activeActivities.length === 0 && gameState.currentPet?.state === "exploring") {
      gameState.currentPet.state = "idle";
      majorEvents.push("pet_state_reset_to_idle");
    }

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
