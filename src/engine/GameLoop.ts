// Core game loop and state management

import type { GameState, GameTick, GameAction, ActivityReward, ActivityType } from "@/types";
import { GAME_CONSTANTS } from "@/types";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { ActivityLogSystem } from "@/systems/ActivityLogSystem";
import { getItemById } from "@/data/items";
import { getLocationById } from "@/data/locations";
import { QUEST_ACTION_TYPES, ACTIVITY_ACTION_TYPES, SYSTEM_ACTION_TYPES } from "@/constants/ActionTypes";

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
  async tick(): Promise<void> {
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
          // Add legacy actions for compatibility
          actions.push({
            type: SYSTEM_ACTION_TYPES.PET_GROWTH,
            payload: {
              petId: this.gameState.currentPet.id,
              newStage: this.gameState.currentPet.growthStage,
            },
            timestamp: Date.now(),
            source: "system",
          });

          // FIXED: Also emit level_up for quest system
          actions.push({
            type: QUEST_ACTION_TYPES.LEVEL_UP,
            payload: {
              petId: this.gameState.currentPet.id,
              newLevel: this.gameState.currentPet.growthStage,
            },
            timestamp: Date.now(),
            source: "system",
          });

          // Note: Future ActionCoordinator integration point
          this.dispatchPetGrowthAction(actions);
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

        // DEBUG: Log travel completion
        console.log("🗺️ TRAVEL DEBUG: Travel completed to:", travelResult.data.currentLocationId);

        actions.push({
          type: SYSTEM_ACTION_TYPES.TRAVEL_COMPLETED,
          payload: { locationId: travelResult.data.currentLocationId },
          timestamp: Date.now(),
          source: "system",
        });

        // FIXED: Emit location_visited action for quest system
        actions.push({
          type: QUEST_ACTION_TYPES.LOCATION_VISITED,
          payload: { locationId: travelResult.data.currentLocationId },
          timestamp: Date.now(),
          source: "system",
        });

        console.log("✅ QUEST FIX: location_visited action emitted for quest system");

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

      // Update activity log entries for completed activities
      if (hadActivitiesCompleted && activityResult.data.completedActivities) {
        this.updateActivityLogForCompletedActivities(
          activityResult.data.completedActivities,
          activityResult.data.rewards
        );
      }

      // Process rewards from completed activities
      if (hadActivitiesCompleted) {
        stateChanges.push("activities_completed");

        // DEBUG: Log reward processing for debugging
        console.log("🎁 REWARD DEBUG: Processing activity rewards:", {
          rewards: activityResult.data.rewards,
          actionsEmitted: actions.map(a => ({ type: a.type, payload: a.payload })),
          questSystemCalled: true, // FIXED: Quest system now called
        });

        this.processActivityRewards(activityResult.data.rewards, actions, stateChanges);

        // Process actions through ActionCoordinator for automatic quest progression
        this.dispatchActionsToCoordinator(actions, stateChanges);
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
   * Dispatch pet growth action through ActionCoordinator for quest progression
   */
  private dispatchPetGrowthAction(_actions: GameAction[]): void {
    if (!this.gameState?.currentPet) return;

    // For now, just log that this could be integrated with ActionCoordinator
    // Future enhancement: Create unified action and dispatch through ActionCoordinator
    console.log("Pet growth action could be dispatched through ActionCoordinator for automatic quest progression");

    // The legacy actions are already added above, so no additional work needed here
    // This method is a placeholder for future ActionCoordinator integration
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
              type: ACTIVITY_ACTION_TYPES.GOLD_EARNED,
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
              // FIXED: Emit both activity and quest action types
              console.log("✅ ACTION TYPE FIX: Emitting both 'item_earned' and 'item_obtained'");

              actions.push({
                type: ACTIVITY_ACTION_TYPES.ITEM_EARNED,
                payload: { itemId: reward.id, amount: reward.amount, source: "activity" },
                timestamp: Date.now(),
                source: "system",
              });

              // FIXED: Also emit quest-compatible action
              actions.push({
                type: QUEST_ACTION_TYPES.ITEM_OBTAINED,
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
              type: ACTIVITY_ACTION_TYPES.EXPERIENCE_EARNED,
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
   * Log quest-compatible actions for debugging
   * Quest progression is now handled automatically by ActionCoordinator
   */
  private dispatchActionsToCoordinator(actions: GameAction[], stateChanges: string[]): void {
    // Quest progression is now automatic through ActionCoordinator proposal system
    // This method is kept for future extensibility but currently just logs actions
    const questActions = actions.filter(action =>
      (Object.values(QUEST_ACTION_TYPES) as string[]).includes(action.type)
    );

    if (questActions.length > 0) {
      console.log(
        "🎯 QUEST ACTIONS: Generated quest-compatible actions:",
        questActions.map(a => ({
          type: a.type,
          payload: a.payload,
        }))
      );
      stateChanges.push("quest_actions_logged");
    }
  }

  /**
   * Update activity log entries for completed activities
   */
  private updateActivityLogForCompletedActivities(
    completedActivities: import("@/types/World").CompletedActivityInfo[],
    rewards: ActivityReward[]
  ): void {
    if (!this.gameState) return;

    for (const completedActivity of completedActivities) {
      // Find the corresponding log entry
      const logEntry = ActivityLogSystem.findLogEntryByActivity(
        this.gameState,
        completedActivity.activityId,
        completedActivity.locationId,
        Date.now() - completedActivity.duration * GAME_CONSTANTS.TICK_INTERVAL // Approximate start time
      );

      if (logEntry) {
        // Calculate activity rewards for this specific activity
        const activityRewards = this.calculateActivitySpecificRewards(completedActivity, rewards);

        // Create log results from the rewards
        const logResults = activityRewards.map(reward =>
          ActivityLogSystem.createLogResult(reward.type, reward.amount, reward.id, this.formatRewardDescription(reward))
        );

        // If no rewards, add a "no rewards" result
        if (logResults.length === 0) {
          logResults.push(ActivityLogSystem.createLogResult("none", 0, undefined, "No rewards received"));
        }

        // Update the log entry
        ActivityLogSystem.updateLogEntry(this.gameState, logEntry.id, {
          status: "completed",
          endTime: Date.now(),
          results: logResults,
        });
      }
    }
  }

  /**
   * Calculate rewards specific to a completed activity
   */
  private calculateActivitySpecificRewards(
    _completedActivity: import("@/types/World").CompletedActivityInfo,
    allRewards: ActivityReward[]
  ): ActivityReward[] {
    // For now, assign all rewards to the activity
    // In the future, this could be enhanced to track which rewards came from which activity
    return allRewards;
  }

  /**
   * Format reward description for activity log
   */
  private formatRewardDescription(reward: ActivityReward): string {
    switch (reward.type) {
      case "item":
        return reward.id ? `Found ${reward.id} x${reward.amount}` : `Found item x${reward.amount}`;
      case "gold":
        return `Earned ${reward.amount} gold`;
      case "experience":
        return `Gained ${reward.amount} experience`;
      default:
        return `Received ${reward.type} x${reward.amount}`;
    }
  }

  /**
   * Update activity log entries for offline completed activities
   */
  private updateOfflineActivityLogs(
    completedActivities: import("@/types/World").CompletedActivityInfo[],
    rewards: ActivityReward[]
  ): void {
    if (!this.gameState) return;

    for (const completedActivity of completedActivities) {
      // For offline activities, we need to find log entries differently since we don't have exact start times
      // We'll look for the most recent "started" entry for this activity and location
      const logEntry = this.gameState.activityLog.find(
        entry =>
          entry.activityId === completedActivity.activityId &&
          entry.locationId === completedActivity.locationId &&
          entry.status === "started"
      );

      if (logEntry) {
        // Calculate end time based on duration
        const endTime = logEntry.startTime + completedActivity.duration * GAME_CONSTANTS.TICK_INTERVAL;

        // Calculate activity rewards for this specific activity
        const activityRewards = this.calculateActivitySpecificRewards(completedActivity, rewards);

        // Create log results from the rewards
        const logResults = activityRewards.map(reward =>
          ActivityLogSystem.createLogResult(reward.type, reward.amount, reward.id, this.formatRewardDescription(reward))
        );

        // If no rewards, add a "no rewards" result
        if (logResults.length === 0) {
          logResults.push(ActivityLogSystem.createLogResult("none", 0, undefined, "No rewards received"));
        }

        // Update the log entry
        ActivityLogSystem.updateLogEntry(this.gameState, logEntry.id, {
          status: "completed",
          endTime,
          results: logResults,
        });
      }
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

      // Update activity log entries for offline completed activities
      if (worldResult.data.completedActivities.length > 0) {
        this.updateOfflineActivityLogs(worldResult.data.completedActivities, worldResult.data.rewards);
      }

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
          // Quest progression for pet growth is now handled automatically by ActionCoordinator
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
        const destinationId = gameState.world.travelState.destinationId;
        gameState.world.currentLocationId = destinationId;
        gameState.world.travelState = undefined;
        majorEvents.push("travel_completed");

        // Quest progression for travel completion is now handled automatically by ActionCoordinator

        // Set pet back to idle if it was travelling
        if (gameState.currentPet?.state === "travelling") {
          gameState.currentPet.state = "idle";
        }
      }
    }

    // Process active activities
    const hadActivities = gameState.world.activeActivities.length > 0;
    const completedActivities: Array<{ activity: { [key: string]: unknown }; rewards: ActivityReward[] }> = [];
    const completedActivityInfo: Array<{
      activityId: string;
      locationId: string;
      duration: number;
      rewards: ActivityReward[];
    }> = [];

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

            // Store completed activity info for activity log updates
            completedActivityInfo.push({
              activityId: activity.activityId,
              locationId: activity.locationId,
              duration: activityDef.duration,
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
        // Process rewards first
        GameLoop.processActivityRewardsStatic(gameState, rewards, majorEvents);

        // Quest progression for offline activities is now handled automatically by ActionCoordinator
        // during regular gameplay when items are obtained or activities are completed
        majorEvents.push("offline_rewards_processed");
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

    // FIXED: Update activity log entries for offline completed activities
    if (completedActivityInfo.length > 0) {
      for (const completedActivity of completedActivityInfo) {
        // Find the corresponding log entry (most recent "started" entry for this activity and location)
        const logEntry = gameState.activityLog.find(
          entry =>
            entry.activityId === completedActivity.activityId &&
            entry.locationId === completedActivity.locationId &&
            entry.status === "started"
        );

        if (logEntry) {
          // Calculate end time based on duration
          const endTime = logEntry.startTime + completedActivity.duration * GAME_CONSTANTS.TICK_INTERVAL;

          // Create log results from the rewards
          const logResults = completedActivity.rewards.map(reward => {
            let description: string;
            switch (reward.type) {
              case "item":
                description = reward.id ? `Found ${reward.id} x${reward.amount}` : `Found item x${reward.amount}`;
                break;
              case "gold":
                description = `Earned ${reward.amount} gold`;
                break;
              case "experience":
                description = `Gained ${reward.amount} experience`;
                break;
              default:
                description = `Received ${reward.type} x${reward.amount}`;
            }

            return {
              type: reward.type as "item" | "gold" | "experience" | "none",
              itemId: reward.id,
              amount: reward.amount,
              description,
            };
          });

          // If no rewards, add a "no rewards" result
          if (logResults.length === 0) {
            logResults.push({
              type: "none" as const,
              itemId: undefined,
              amount: 0,
              description: "No rewards received",
            });
          }

          // Update the log entry to completed status
          const entryIndex = gameState.activityLog.findIndex(entry => entry.id === logEntry.id);
          if (entryIndex !== -1) {
            gameState.activityLog[entryIndex] = {
              ...gameState.activityLog[entryIndex],
              status: "completed",
              endTime,
              results: logResults,
            };
          }
        }
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
