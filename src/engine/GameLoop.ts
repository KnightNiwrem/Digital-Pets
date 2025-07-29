// Core game loop and state management

import type { GameState, GameTick, GameAction, Pet } from "@/types";
import { GAME_CONSTANTS, PET_CONSTANTS } from "@/types";
import { GameStorage } from "@/storage/GameStorage";

export class GameLoop {
  private static instance: GameLoop | null = null;
  private intervalId: number | null = null;
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
    this.intervalId = window.setInterval(() => {
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
      clearInterval(this.intervalId);
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
        this.processPetTick(this.gameState.currentPet, actions, stateChanges);
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
   * Process pet-related mechanics for this tick
   */
  private processPetTick(pet: Pet, actions: GameAction[], stateChanges: string[]): void {
    // Decrement hidden counters
    pet.satietyTicksLeft = Math.max(0, pet.satietyTicksLeft - 1);
    pet.hydrationTicksLeft = Math.max(0, pet.hydrationTicksLeft - 1);
    pet.happinessTicksLeft = Math.max(0, pet.happinessTicksLeft - 1);
    pet.poopTicksLeft = Math.max(0, pet.poopTicksLeft - 1);
    pet.sickByPoopTicksLeft = Math.max(0, pet.sickByPoopTicksLeft - 1);

    // Update displayed stats
    pet.satiety = Math.ceil(pet.satietyTicksLeft / PET_CONSTANTS.STAT_MULTIPLIER.satiety);
    pet.hydration = Math.ceil(pet.hydrationTicksLeft / PET_CONSTANTS.STAT_MULTIPLIER.hydration);
    pet.happiness = Math.ceil(pet.happinessTicksLeft / PET_CONSTANTS.STAT_MULTIPLIER.happiness);

    // Handle poop
    if (pet.poopTicksLeft === 0) {
      // Pet pooped, reset counter to random value
      pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // 1-2 hours
      stateChanges.push("pet_pooped");

      actions.push({
        type: "pet_pooped",
        payload: { petId: pet.id },
        timestamp: Date.now(),
        source: "system",
      });
    }

    // Handle sickness from uncleaned poop
    if (pet.sickByPoopTicksLeft === 0 && pet.health === "healthy") {
      pet.health = "sick";
      pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
      stateChanges.push("pet_sick_from_poop");

      actions.push({
        type: "pet_became_sick",
        payload: { petId: pet.id, reason: "uncleaned_poop" },
        timestamp: Date.now(),
        source: "system",
      });
    }

    // Handle life changes
    let lifeDecrease = 0;
    let shouldRecover = true;

    // Life decreases
    if (pet.health === "injured") {
      lifeDecrease += PET_CONSTANTS.LIFE_DECREASE.injured;
      shouldRecover = false;
    }
    if (pet.health === "sick") {
      lifeDecrease += PET_CONSTANTS.LIFE_DECREASE.sick;
      shouldRecover = false;
    }
    if (pet.satiety === 0) {
      lifeDecrease += PET_CONSTANTS.LIFE_DECREASE.noSatiety;
      shouldRecover = false;
    }
    if (pet.hydration === 0) {
      lifeDecrease += PET_CONSTANTS.LIFE_DECREASE.noHydration;
      shouldRecover = false;
    }
    if (pet.growthStage === PET_CONSTANTS.GROWTH_STAGES - 1) {
      lifeDecrease += PET_CONSTANTS.LIFE_DECREASE.finalStage;
    }

    // Apply life changes
    if (lifeDecrease > 0) {
      pet.life = Math.max(0, pet.life - lifeDecrease);
      stateChanges.push("pet_life_decreased");
    } else if (shouldRecover) {
      pet.life = Math.min(PET_CONSTANTS.MAX_LIFE, pet.life + PET_CONSTANTS.LIFE_RECOVERY);
      stateChanges.push("pet_life_recovered");
    }

    // Handle death
    if (pet.life === 0) {
      this.handlePetDeath(actions, stateChanges);
    }

    // Handle energy recovery during sleep
    if (pet.state === "sleeping") {
      const energyRecovery = this.calculateEnergyRecovery(pet);
      pet.currentEnergy = Math.min(pet.maxEnergy, pet.currentEnergy + energyRecovery);
      if (energyRecovery > 0) {
        stateChanges.push("pet_energy_recovered");
      }
    }

    // Handle growth
    pet.totalLifetime++;
    this.checkPetGrowth(pet, actions, stateChanges);
  }

  /**
   * Process world-related mechanics for this tick
   */
  private processWorldTick(actions: GameAction[], stateChanges: string[]): void {
    if (!this.gameState) return;

    // Process travel
    if (this.gameState.world.travelState) {
      this.gameState.world.travelState.ticksRemaining--;

      if (this.gameState.world.travelState.ticksRemaining <= 0) {
        // Travel completed
        this.gameState.world.currentLocationId = this.gameState.world.travelState.destinationId;
        this.gameState.world.travelState = undefined;

        stateChanges.push("travel_completed");
        actions.push({
          type: "travel_completed",
          payload: { locationId: this.gameState.world.currentLocationId },
          timestamp: Date.now(),
          source: "system",
        });

        // If pet was travelling, set back to idle
        if (this.gameState.currentPet?.state === "travelling") {
          this.gameState.currentPet.state = "idle";
        }
      }
    }

    // Process active activities
    this.gameState.world.activeActivities = this.gameState.world.activeActivities.filter(activity => {
      activity.ticksRemaining--;

      if (activity.ticksRemaining <= 0) {
        // Activity completed
        this.completeActivity(activity, actions, stateChanges);
        return false; // Remove from active activities
      }

      return true; // Keep in active activities
    });
  }

  /**
   * Process battle-related mechanics for this tick
   */
  private processBattleTick(_actions: GameAction[], _stateChanges: string[]): void {
    // Battle processing would be implemented here
    // For now, just a placeholder
  }

  /**
   * Calculate energy recovery for a sleeping pet
   */
  private calculateEnergyRecovery(pet: Pet): number {
    // Base recovery of 1 energy per tick while sleeping
    let recovery = 1;

    // Higher stages recover energy faster
    const stageBonus = Math.floor(pet.growthStage / 10);
    recovery += stageBonus;

    return recovery;
  }

  /**
   * Check if pet should grow to next stage
   */
  private checkPetGrowth(pet: Pet, actions: GameAction[], stateChanges: string[]): void {
    // Growth calculation would be based on lifetime and other factors
    // This is a simplified version
    const requiredLifetime = (pet.growthStage + 1) * 10000; // Example growth requirement

    if (pet.totalLifetime >= requiredLifetime && pet.growthStage < PET_CONSTANTS.GROWTH_STAGES - 1) {
      pet.growthStage++;
      pet.maxEnergy += 10; // Increase energy capacity

      stateChanges.push("pet_grew");
      actions.push({
        type: "pet_growth",
        payload: { petId: pet.id, newStage: pet.growthStage },
        timestamp: Date.now(),
        source: "system",
      });
    }
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
   * Complete an activity and distribute rewards
   */
  private completeActivity(
    activity: { activityId: string; locationId: string; startTime: number; petId: string },
    actions: GameAction[],
    stateChanges: string[]
  ): void {
    stateChanges.push("activity_completed");
    actions.push({
      type: "activity_completed",
      payload: {
        activityId: activity.activityId,
        locationId: activity.locationId,
        petId: activity.petId,
      },
      timestamp: Date.now(),
      source: "system",
    });

    // Reward distribution would be implemented here
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

    console.log(`Processing ${ticksPassed} offline ticks (${Math.round(timeDiff / 1000)}s offline)`);

    // Process each tick (up to a reasonable limit to avoid performance issues)
    const maxOfflineTicks = 2880; // 12 hours worth of ticks
    const actualTicks = Math.min(ticksPassed, maxOfflineTicks);

    for (let i = 0; i < actualTicks; i++) {
      this.tickNumber++;
      this.gameState.gameTime.totalTicks = this.tickNumber;

      if (this.gameState.currentPet) {
        this.processPetTick(this.gameState.currentPet, [], []);
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
}
