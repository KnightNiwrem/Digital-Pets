// WorldSystem - Manages locations, travel, and world interactions

import type { WorldState, TravelState, Location, Activity, ActiveActivity, ActivityReward, Shop } from "@/types/World";
import type { Pet } from "@/types/Pet";
import type { Inventory } from "@/types/Item";
import type { Result } from "@/types";
import { PetValidator, EnergyManager } from "@/lib/utils";
import { ItemSystem } from "@/systems/ItemSystem";
import { LOCATIONS, getLocationById, getStartingLocation } from "@/data/locations";

export class WorldSystem {
  /**
   * Initialize world state for a new game
   */
  static initializeWorldState(): WorldState {
    const startingLocation = getStartingLocation();

    // Find all locations that have no unlock requirements (should be available from start)
    const startingLocations = LOCATIONS.filter(
      location =>
        location.id === startingLocation.id || !location.unlockRequirements || location.unlockRequirements.length === 0
    ).map(location => location.id);

    return {
      currentLocationId: startingLocation.id,
      unlockedLocations: startingLocations,
      visitedLocations: [startingLocation.id],
      activeActivities: [],
    };
  }

  /**
   * Get current location
   */
  static getCurrentLocation(worldState: WorldState): Location | undefined {
    return getLocationById(worldState.currentLocationId);
  }

  /**
   * Get all available locations (unlocked)
   */
  static getAvailableLocations(worldState: WorldState): Location[] {
    return LOCATIONS.filter(location => worldState.unlockedLocations.includes(location.id));
  }

  /**
   * Get destinations available from current location
   */
  static getAvailableDestinations(worldState: WorldState, pet: Pet): Result<Location[]> {
    const currentLocation = WorldSystem.getCurrentLocation(worldState);
    if (!currentLocation) {
      return { success: false, error: "Current location not found" };
    }

    const availableDestinations: Location[] = [];

    for (const connection of currentLocation.connections) {
      const destination = getLocationById(connection.destinationId);
      if (!destination) continue;

      // Check if destination meets requirements
      if (connection.requirements) {
        const meetsRequirements = connection.requirements.every(req => {
          switch (req.type) {
            case "level":
              return pet.growthStage >= (req.value as number);
            default:
              return true;
          }
        });

        if (!meetsRequirements) continue;
      }

      availableDestinations.push(destination);
    }

    return { success: true, data: availableDestinations };
  }

  /**
   * Start travel to a destination
   */
  static startTravel(
    worldState: WorldState,
    pet: Pet,
    destinationId: string
  ): Result<{ worldState: WorldState; pet: Pet }> {
    // Check if pet is already travelling
    if (worldState.travelState) {
      return { success: false, error: "Already travelling to another location" };
    }

    // Check if pet is sleeping
    if (PetValidator.isSleeping(pet)) {
      return { success: false, error: "Cannot travel while pet is sleeping" };
    }

    // Check if destination exists and is available
    const currentLocation = WorldSystem.getCurrentLocation(worldState);
    if (!currentLocation) {
      return { success: false, error: "Current location not found" };
    }

    const connection = currentLocation.connections.find(c => c.destinationId === destinationId);
    if (!connection) {
      return { success: false, error: "Cannot travel to that destination from here" };
    }

    const destination = getLocationById(destinationId);
    if (!destination) {
      return { success: false, error: "Destination not found" };
    }

    // Check travel requirements
    if (connection.requirements) {
      for (const req of connection.requirements) {
        switch (req.type) {
          case "level":
            if (pet.growthStage < (req.value as number)) {
              return { success: false, error: `Pet must be at least level ${req.value} to travel there` };
            }
            break;
        }
      }
    }

    // Check energy cost for travel
    const energyCost = EnergyManager.calculateTravelCost(connection.travelTime);
    if (!EnergyManager.hasEnoughEnergy(pet, energyCost)) {
      return { success: false, error: EnergyManager.ERROR_MESSAGES.TRAVEL };
    }

    // Start travel
    const travelState: TravelState = {
      destinationId,
      ticksRemaining: connection.travelTime,
      totalTravelTime: connection.travelTime,
      startTime: Date.now(),
    };

    const updatedWorldState: WorldState = {
      ...worldState,
      travelState,
    };

    const updatedPet: Pet = {
      ...pet,
      state: "travelling",
      lastCareTime: Date.now(),
    };

    // Deduct energy cost for travel
    EnergyManager.deductEnergy(updatedPet, energyCost);

    return {
      success: true,
      data: { worldState: updatedWorldState, pet: updatedPet },
      message: `Started travelling to ${destination.name}. Journey will take ${Math.ceil(connection.travelTime / 4)} minutes.`,
    };
  }

  /**
   * Process travel during game tick
   */
  static processTravelTick(worldState: WorldState): Result<WorldState> {
    if (!worldState.travelState) {
      return { success: true, data: worldState };
    }

    const travelState = worldState.travelState;
    const newTicksRemaining = travelState.ticksRemaining - 1;

    if (newTicksRemaining <= 0) {
      // Travel completed
      const destination = getLocationById(travelState.destinationId);
      if (!destination) {
        return { success: false, error: "Travel destination not found" };
      }

      const updatedWorldState: WorldState = {
        ...worldState,
        currentLocationId: travelState.destinationId,
        unlockedLocations: worldState.unlockedLocations.includes(travelState.destinationId)
          ? worldState.unlockedLocations
          : [...worldState.unlockedLocations, travelState.destinationId],
        visitedLocations: worldState.visitedLocations.includes(travelState.destinationId)
          ? worldState.visitedLocations
          : [...worldState.visitedLocations, travelState.destinationId],
        travelState: undefined,
      };

      return {
        success: true,
        data: updatedWorldState,
        message: `Arrived at ${destination.name}!`,
      };
    } else {
      // Continue travelling
      const updatedWorldState: WorldState = {
        ...worldState,
        travelState: {
          ...travelState,
          ticksRemaining: newTicksRemaining,
        },
      };

      return { success: true, data: updatedWorldState };
    }
  }

  /**
   * Start an activity at current location
   */
  static startActivity(
    worldState: WorldState,
    pet: Pet,
    activityId: string,
    inventory: Inventory
  ): Result<{ worldState: WorldState; pet: Pet }> {
    // Check if pet is travelling
    if (worldState.travelState) {
      return { success: false, error: "Cannot start activity while travelling" };
    }

    // Check if pet is already doing an activity
    const existingActivity = worldState.activeActivities.find(a => a.petId === pet.id);
    if (existingActivity) {
      return { success: false, error: "Pet is already doing an activity" };
    }

    // Get current location and activity
    const currentLocation = WorldSystem.getCurrentLocation(worldState);
    if (!currentLocation) {
      return { success: false, error: "Current location not found" };
    }

    const activity = currentLocation.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, error: "Activity not found at this location" };
    }

    // Check energy requirements
    if (!EnergyManager.hasEnoughEnergy(pet, activity.energyCost)) {
      return { success: false, error: EnergyManager.ERROR_MESSAGES.ACTIVITY };
    }

    // Check pet state
    if (PetValidator.isSleeping(pet)) {
      return { success: false, error: "Cannot start activity while pet is sleeping" };
    }

    if (PetValidator.isExploring(pet)) {
      return { success: false, error: "Pet is already engaged in an activity" };
    }

    // Check activity requirements
    if (activity.requirements) {
      for (const req of activity.requirements) {
        switch (req.type) {
          case "level":
            if (pet.growthStage < (req.value as number)) {
              return { success: false, error: `Pet must be at least level ${req.value}` };
            }
            break;
          case "item":
            // Check inventory for required items
            if (!ItemSystem.hasItem(inventory, req.value as string, 1)) {
              return { success: false, error: `Requires ${req.value}` };
            }
            break;
          case "quest_completed":
            // TODO: Quest integration not yet implemented
            console.warn(`Quest requirement "${req.value}" not yet implemented - allowing activity to proceed`);
            break;
          case "pet_species":
            if (pet.species.id !== req.value) {
              return { success: false, error: `Requires ${req.value} species pet` };
            }
            break;
          default:
            console.warn(`Unknown requirement type "${req.type}" - allowing activity to proceed`);
            break;
        }
      }
    }

    // Start activity
    const activeActivity: ActiveActivity = {
      activityId: activity.id,
      locationId: currentLocation.id,
      startTime: Date.now(),
      ticksRemaining: activity.duration,
      petId: pet.id,
    };

    const updatedWorldState: WorldState = {
      ...worldState,
      activeActivities: [...worldState.activeActivities, activeActivity],
    };

    const updatedPet: Pet = {
      ...pet,
      state: "exploring",
      lastCareTime: Date.now(),
    };

    // Deduct energy cost for activity
    EnergyManager.deductEnergy(updatedPet, activity.energyCost);

    return {
      success: true,
      data: { worldState: updatedWorldState, pet: updatedPet },
      message: `Started ${activity.name}. Will complete in ${Math.ceil(activity.duration / 4)} minutes.`,
    };
  }

  /**
   * Process active activities during game tick
   */
  static processActivitiesTick(worldState: WorldState): Result<{ worldState: WorldState; rewards: ActivityReward[] }> {
    const completedActivities: ActiveActivity[] = [];
    const continuingActivities: ActiveActivity[] = [];
    const allRewards: ActivityReward[] = [];

    for (const activeActivity of worldState.activeActivities) {
      const newTicksRemaining = activeActivity.ticksRemaining - 1;

      if (newTicksRemaining <= 0) {
        // Activity completed
        completedActivities.push(activeActivity);

        // Get activity definition to determine rewards
        const location = getLocationById(activeActivity.locationId);
        if (location) {
          const activity = location.activities.find(a => a.id === activeActivity.activityId);
          if (activity) {
            // Calculate rewards based on probability
            for (const reward of activity.rewards) {
              if (Math.random() < reward.probability) {
                allRewards.push(reward);
              }
            }
          }
        }
      } else {
        // Activity continues
        continuingActivities.push({
          ...activeActivity,
          ticksRemaining: newTicksRemaining,
        });
      }
    }

    const updatedWorldState: WorldState = {
      ...worldState,
      activeActivities: continuingActivities,
    };

    return {
      success: true,
      data: { worldState: updatedWorldState, rewards: allRewards },
      message: completedActivities.length > 0 ? `Completed ${completedActivities.length} activities` : undefined,
    };
  }

  /**
   * Get travel progress as percentage
   */
  static getTravelProgress(worldState: WorldState): number {
    if (!worldState.travelState) return 0;

    const { ticksRemaining, totalTravelTime } = worldState.travelState;
    return Math.max(0, Math.min(100, ((totalTravelTime - ticksRemaining) / totalTravelTime) * 100));
  }

  /**
   * Get activity progress for a pet
   */
  static getActivityProgress(
    worldState: WorldState,
    petId: string
  ): {
    activity: Activity | undefined;
    progress: number;
    timeRemaining: number;
  } {
    const activeActivity = worldState.activeActivities.find(a => a.petId === petId);
    if (!activeActivity) {
      return { activity: undefined, progress: 0, timeRemaining: 0 };
    }

    const location = getLocationById(activeActivity.locationId);
    const activity = location?.activities.find(a => a.id === activeActivity.activityId);

    if (!activity) {
      return { activity: undefined, progress: 0, timeRemaining: 0 };
    }

    const totalDuration = activity.duration;
    const completed = totalDuration - activeActivity.ticksRemaining;
    const progress = Math.max(0, Math.min(100, (completed / totalDuration) * 100));
    const timeRemaining = Math.ceil(activeActivity.ticksRemaining / 4); // convert to minutes

    return { activity, progress, timeRemaining };
  }

  /**
   * Cancel current activity for a pet
   */
  static cancelActivity(worldState: WorldState, petId: string): Result<WorldState> {
    const activeActivityIndex = worldState.activeActivities.findIndex(a => a.petId === petId);
    if (activeActivityIndex === -1) {
      return { success: false, error: "No active activity to cancel" };
    }

    const updatedWorldState: WorldState = {
      ...worldState,
      activeActivities: worldState.activeActivities.filter((_, index) => index !== activeActivityIndex),
    };

    return {
      success: true,
      data: updatedWorldState,
      message: "Activity cancelled",
    };
  }

  /**
   * Process offline progression for world state
   */
  static processOfflineProgression(
    worldState: WorldState,
    ticksToProcess: number
  ): Result<{ worldState: WorldState; rewards: ActivityReward[] }> {
    let currentWorldState = worldState;
    const allRewards: ActivityReward[] = [];

    for (let i = 0; i < ticksToProcess; i++) {
      // Process travel
      const travelResult = WorldSystem.processTravelTick(currentWorldState);
      if (!travelResult.success || !travelResult.data) {
        return { success: false, error: travelResult.error };
      }
      currentWorldState = travelResult.data;

      // Process activities
      const activityResult = WorldSystem.processActivitiesTick(currentWorldState);
      if (!activityResult.success || !activityResult.data) {
        return { success: false, error: activityResult.error };
      }
      currentWorldState = activityResult.data.worldState;
      allRewards.push(...activityResult.data.rewards);
    }

    return {
      success: true,
      data: { worldState: currentWorldState, rewards: allRewards },
    };
  }

  /**
   * Check for newly unlocked locations based on current pet level and completed quests
   */
  static checkForNewUnlocks(
    worldState: WorldState,
    pet: Pet,
    completedQuests: string[] = []
  ): Result<{ worldState: WorldState; newlyUnlocked: Location[] }> {
    const currentlyUnlocked = new Set(worldState.unlockedLocations);
    const newlyUnlocked: Location[] = [];

    for (const location of LOCATIONS) {
      // Skip if already unlocked
      if (currentlyUnlocked.has(location.id)) continue;

      // Check if location meets unlock requirements
      if (location.unlockRequirements) {
        const meetsRequirements = location.unlockRequirements.every(req => {
          switch (req.type) {
            case "level":
              return pet.growthStage >= (req.value as number);
            case "quest_completed":
              return completedQuests.includes(req.value as string);
            default:
              return false;
          }
        });

        if (meetsRequirements) {
          newlyUnlocked.push(location);
        }
      }
    }

    if (newlyUnlocked.length === 0) {
      return { success: true, data: { worldState, newlyUnlocked: [] } };
    }

    const updatedWorldState: WorldState = {
      ...worldState,
      unlockedLocations: [...worldState.unlockedLocations, ...newlyUnlocked.map(loc => loc.id)],
    };

    return {
      success: true,
      data: { worldState: updatedWorldState, newlyUnlocked },
      message: `New locations unlocked: ${newlyUnlocked.map(loc => loc.name).join(", ")}!`,
    };
  }

  // ============= SHOP SYSTEM =============

  /**
   * Get available shops at current location
   */
  static getAvailableShops(worldState: WorldState): Shop[] {
    const currentLocation = this.getCurrentLocation(worldState);
    if (!currentLocation) {
      return [];
    }
    return currentLocation.shops || [];
  }

  /**
   * Get a specific shop by ID at current location
   */
  static getShopById(worldState: WorldState, shopId: string): Shop | undefined {
    const shops = this.getAvailableShops(worldState);
    return shops.find(shop => shop.id === shopId);
  }

  /**
   * Check if a shop is available at the current location
   */
  static isShopAvailable(worldState: WorldState, shopId: string): boolean {
    return this.getShopById(worldState, shopId) !== undefined;
  }
}
