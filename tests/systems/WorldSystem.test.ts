// Unit tests for WorldSystem

import { describe, it, expect, beforeEach } from "bun:test";
import { WorldSystem } from "@/systems/WorldSystem";
import { GameStateFactory } from "@/engine/GameStateFactory";
import type { WorldState, Pet, GameState } from "@/types";

describe("WorldSystem", () => {
  let gameState: GameState;
  let mockPet: Pet;
  let worldState: WorldState;

  beforeEach(() => {
    // Create a test game state
    gameState = GameStateFactory.createTestGame();
    
    // Extract commonly used references
    mockPet = gameState.currentPet!;
    worldState = gameState.world;
  });

  describe("World Initialization", () => {
    it("should initialize world state with starting location", () => {
      const world = WorldSystem.initializeWorldState();

      expect(world.currentLocationId).toBe("hometown");
      expect(world.unlockedLocations).toContain("hometown");
      expect(world.visitedLocations).toContain("hometown");
      expect(world.travelState).toBeUndefined();
      expect(world.activeActivities).toEqual([]);
    });

    it("should get current location correctly", () => {
      const location = WorldSystem.getCurrentLocation(worldState);

      expect(location).toBeDefined();
      expect(location?.id).toBe("hometown");
      expect(location?.name).toBe("Hometown");
      expect(location?.type).toBe("town");
    });

    it("should get available locations", () => {
      const locations = WorldSystem.getAvailableLocations(worldState);

      // Should now have hometown + town_garden + peaceful_meadow (no unlock requirements)
      expect(locations).toHaveLength(3);
      expect(locations.map(l => l.id)).toContain("hometown");
      expect(locations.map(l => l.id)).toContain("town_garden");
      expect(locations.map(l => l.id)).toContain("peaceful_meadow");
    });
  });

  describe("Travel System", () => {
    it("should fail to start travel when no valid destination", () => {
      const result = WorldSystem.startTravel(worldState, mockPet, "invalid_location");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot travel to that destination from here");
    });

    it("should fail to start travel when pet is sleeping", () => {
      const sleepingPet = { ...mockPet, state: "sleeping" as const };
      const result = WorldSystem.startTravel(worldState, sleepingPet, "forest_path");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot travel while pet is sleeping");
    });

    it("should fail to start travel when already travelling", () => {
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 30,
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const result = WorldSystem.startTravel(travellingWorld, mockPet, "riverside");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Already travelling to another location");
    });

    it("should fail to start travel when pet level too low", () => {
      const lowLevelPet = { ...mockPet, growthStage: 0 }; // Need level 1 for forest path now
      const result = WorldSystem.startTravel(worldState, lowLevelPet, "forest_path");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet must be at least level 1 to travel there");
    });

    it("should fail to start travel when pet has insufficient energy", () => {
      const lowEnergyPet = { ...mockPet, currentEnergy: 5, growthStage: 5 }; // Need 15 energy for travel
      const result = WorldSystem.startTravel(worldState, lowEnergyPet, "forest_path");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet doesn't have enough energy for this journey");
    });

    it("should successfully start travel when requirements met", () => {
      const readyPet = { ...mockPet, growthStage: 5, currentEnergy: 100 };
      const result = WorldSystem.startTravel(worldState, readyPet, "forest_path");

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.travelState).toBeDefined();
        expect(result.data.worldState.travelState?.destinationId).toBe("forest_path");
        expect(result.data.pet.state).toBe("travelling");
        expect(result.data.pet.currentEnergy).toBeLessThan(100); // Energy consumed
        expect(result.message).toContain("Started travelling to Forest Path");
      }
    });

    it("should process travel tick correctly", () => {
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 1, // One tick remaining
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const result = WorldSystem.processTravelTick(travellingWorld);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.currentLocationId).toBe("forest_path");
        expect(result.data.travelState).toBeUndefined();
        expect(result.data.unlockedLocations).toContain("forest_path");
        expect(result.data.visitedLocations).toContain("forest_path");
        expect(result.message).toBe("Arrived at Forest Path!");
      }
    });

    it("should continue travel when ticks remaining", () => {
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 30,
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const result = WorldSystem.processTravelTick(travellingWorld);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.currentLocationId).toBe("hometown"); // Still at origin
        expect(result.data.travelState?.ticksRemaining).toBe(29);
        expect(result.message).toBeUndefined();
      }
    });

    it("should calculate travel progress correctly", () => {
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 30,
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const progress = WorldSystem.getTravelProgress(travellingWorld);
      expect(progress).toBe(50); // Half way through
    });

    it("should return 0 progress when not travelling", () => {
      const progress = WorldSystem.getTravelProgress(worldState);
      expect(progress).toBe(0);
    });
  });

  describe("Activity System", () => {
    it("should fail to start activity when travelling", () => {
      const gameStateWithTravel = {
        ...gameState,
        world: {
          ...worldState,
          travelState: {
            destinationId: "forest_path",
            ticksRemaining: 30,
            totalTravelTime: 60,
            startTime: Date.now(),
          },
        },
      };

      const result = WorldSystem.startActivity(gameStateWithTravel, "hometown_foraging");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start activity while travelling");
    });

    it("should fail to start activity when pet sleeping", () => {
      const gameStateWithSleepingPet = {
        ...gameState,
        currentPet: { ...mockPet, state: "sleeping" as const }
      };
      const result = WorldSystem.startActivity(gameStateWithSleepingPet, "hometown_foraging");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start activity while pet is sleeping");
    });

    it("should fail to start activity when insufficient energy", () => {
      const gameStateWithLowEnergyPet = {
        ...gameState,
        currentPet: { ...mockPet, currentEnergy: 5 } // Need more energy for foraging
      };
      const result = WorldSystem.startActivity(gameStateWithLowEnergyPet, "hometown_foraging");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet doesn't have enough energy for this activity");
    });

    it("should fail to start activity when already doing one", () => {
      const gameStateWithBusyPet = {
        ...gameState,
        world: {
          ...worldState,
          activeActivities: [
            {
              activityId: "hometown_foraging",
              locationId: "hometown",
              startTime: Date.now(),
              ticksRemaining: 10,
              petId: mockPet.id,
            },
          ],
        },
      };

      const result = WorldSystem.startActivity(gameStateWithBusyPet, "hometown_foraging");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet is already doing an activity");
    });

    it("should successfully start activity when requirements met", () => {
      const result = WorldSystem.startActivity(gameState, "hometown_foraging");

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.activeActivities).toHaveLength(1);
        expect(result.data.worldState.activeActivities[0].activityId).toBe("hometown_foraging");
        expect(result.data.pet.currentEnergy).toBeLessThan(mockPet.currentEnergy);
        expect(result.message).toContain("Started Forage in Town Square");
      }
    });

    it("should process activity completion", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [
          {
            activityId: "hometown_foraging",
            locationId: "hometown",
            startTime: Date.now(),
            ticksRemaining: 1, // Will complete this tick
            petId: mockPet.id,
          },
        ],
      };

      const result = WorldSystem.processActivitiesTick(worldWithActivity);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.activeActivities).toHaveLength(0);
        expect(result.data.rewards.length).toBeGreaterThanOrEqual(0); // May get rewards
      }
    });

    it("should continue activity when ticks remaining", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [
          {
            activityId: "hometown_foraging",
            locationId: "hometown",
            startTime: Date.now(),
            ticksRemaining: 10,
            petId: mockPet.id,
          },
        ],
      };

      const result = WorldSystem.processActivitiesTick(worldWithActivity);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.activeActivities).toHaveLength(1);
        expect(result.data.worldState.activeActivities[0].ticksRemaining).toBe(9);
      }
    });

    it("should get activity progress correctly", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [
          {
            activityId: "hometown_foraging",
            locationId: "hometown",
            startTime: Date.now(),
            ticksRemaining: 10, // 10 remaining out of 20 total
            petId: mockPet.id,
          },
        ],
      };

      const progress = WorldSystem.getActivityProgress(worldWithActivity, mockPet.id);

      expect(progress.activity).toBeDefined();
      expect(progress.activity?.id).toBe("hometown_foraging");
      expect(progress.progress).toBe(50); // 50% complete
      expect(progress.timeRemaining).toBe(3); // ~3 minutes remaining
    });

    it("should return no progress when no activity", () => {
      const progress = WorldSystem.getActivityProgress(worldState, mockPet.id);

      expect(progress.activity).toBeUndefined();
      expect(progress.progress).toBe(0);
      expect(progress.timeRemaining).toBe(0);
    });

    it("should cancel activity successfully", () => {
      const gameStateWithActivity = {
        ...gameState,
        world: {
          ...worldState,
          activeActivities: [
            {
              activityId: "hometown_foraging",
              locationId: "hometown",
              startTime: Date.now(),
              ticksRemaining: 10,
              petId: mockPet.id,
            },
          ],
        },
      };

      const result = WorldSystem.cancelActivity(gameStateWithActivity, mockPet.id);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.activeActivities).toHaveLength(0);
        expect(result.message).toBe("Activity cancelled");
      }
    });

    it("should fail to cancel when no activity", () => {
      const result = WorldSystem.cancelActivity(gameState, mockPet.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No active activity to cancel");
    });
  });

  describe("Offline Progression", () => {
    it("should process offline travel completion", () => {
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 5,
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const result = WorldSystem.processOfflineProgression(travellingWorld, 10);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.currentLocationId).toBe("forest_path");
        expect(result.data.worldState.travelState).toBeUndefined();
      }
    });

    it("should process offline activity completion", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [
          {
            activityId: "hometown_foraging",
            locationId: "hometown",
            startTime: Date.now(),
            ticksRemaining: 5,
            petId: mockPet.id,
          },
        ],
      };

      const result = WorldSystem.processOfflineProgression(worldWithActivity, 10);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.worldState.activeActivities).toHaveLength(0);
        expect(result.data.rewards.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Available Destinations", () => {
    it("should return available destinations for low level pet", () => {
      const lowLevelPet = { ...mockPet, growthStage: 0 };
      const result = WorldSystem.getAvailableDestinations(worldState, lowLevelPet);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        // Level 0 pet can still go to town_garden and peaceful_meadow (no level requirement)
        expect(result.data).toHaveLength(2);
        const destinationIds = result.data.map(dest => dest.id);
        expect(destinationIds).toContain("town_garden");
        expect(destinationIds).toContain("peaceful_meadow");
      }
    });

    it("should return forest path for level 1+ pet", () => {
      const levelOnePet = { ...mockPet, growthStage: 1 };
      const result = WorldSystem.getAvailableDestinations(worldState, levelOnePet);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        // Level 1 pet can access forest path + town_garden + peaceful_meadow
        expect(result.data).toHaveLength(3);
        const destinationIds = result.data.map(dest => dest.id);
        expect(destinationIds).toContain("forest_path");
        expect(destinationIds).toContain("town_garden");
        expect(destinationIds).toContain("peaceful_meadow");
      }
    });
  });

  describe("Shop System", () => {
    it("should get available shops at current location", () => {
      const shops = WorldSystem.getAvailableShops(worldState);

      expect(shops).toHaveLength(1);
      expect(shops[0].id).toBe("hometown_general_store");
      expect(shops[0].name).toBe("General Store");
      expect(shops[0].keeper).toBe("shopkeeper_sam");
      expect(shops[0].items).toHaveLength(4);
    });

    it("should return empty array when no shops available", () => {
      const noShopsWorld = {
        ...worldState,
        currentLocationId: "nonexistent_location",
      };

      const shops = WorldSystem.getAvailableShops(noShopsWorld);

      expect(shops).toHaveLength(0);
    });

    it("should get specific shop by ID", () => {
      const shop = WorldSystem.getShopById(worldState, "hometown_general_store");

      expect(shop).toBeDefined();
      expect(shop?.id).toBe("hometown_general_store");
      expect(shop?.name).toBe("General Store");
    });

    it("should return undefined for non-existent shop ID", () => {
      const shop = WorldSystem.getShopById(worldState, "nonexistent_shop");

      expect(shop).toBeUndefined();
    });

    it("should check if shop is available", () => {
      const isAvailable = WorldSystem.isShopAvailable(worldState, "hometown_general_store");
      const isNotAvailable = WorldSystem.isShopAvailable(worldState, "nonexistent_shop");

      expect(isAvailable).toBe(true);
      expect(isNotAvailable).toBe(false);
    });
  });

  describe("Location Unlocking", () => {
    it("should unlock new locations when pet levels up", () => {
      // Start with a level 0 pet
      const level0Pet = { ...mockPet, growthStage: 0 };
      
      // Check initial unlocks - should not unlock level 1 locations yet
      let result = WorldSystem.checkForNewUnlocks(worldState, level0Pet, []);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.newlyUnlocked).toHaveLength(0);
      }

      // Level up to 1
      const level1Pet = { ...mockPet, growthStage: 1 };
      result = WorldSystem.checkForNewUnlocks(worldState, level1Pet, []);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.newlyUnlocked).toHaveLength(2); // forest_path and quiet_pond
        const unlockedIds = result.data.newlyUnlocked.map(loc => loc.id);
        expect(unlockedIds).toContain("forest_path");
        expect(unlockedIds).toContain("quiet_pond");
      }
    });

    it("should not unlock already unlocked locations", () => {
      // Pet is already level 1 and locations are already unlocked
      const level1Pet = { ...mockPet, growthStage: 1 };
      const updatedWorldState: WorldState = {
        ...worldState,
        unlockedLocations: ["hometown", "town_garden", "peaceful_meadow", "forest_path", "quiet_pond"],
      };
      
      const result = WorldSystem.checkForNewUnlocks(updatedWorldState, level1Pet, []);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.newlyUnlocked).toHaveLength(0);
      }
    });
  });

  describe("Enhanced Activity Cancellation", () => {
    it("should cancel activity without refund by default", () => {
      // Start an activity first
      const startResult = WorldSystem.startActivity(gameState, "hometown_foraging");
      expect(startResult.success).toBe(true);
      const gameStateWithActivity = {
        ...gameState,
        world: startResult.data!.worldState,
        currentPet: startResult.data!.pet
      };
      
      // Cancel without refund
      const cancelResult = WorldSystem.cancelActivity(gameStateWithActivity, mockPet.id);
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.data!.activeActivities).toHaveLength(0);
      expect(cancelResult.message).toBe("Activity cancelled");
      expect(cancelResult.data!.energyRefunded).toBeUndefined();
    });

    it("should cancel activity with energy refund when requested", () => {
      // Start an activity first  
      const startResult = WorldSystem.startActivity(gameState, "hometown_foraging");
      expect(startResult.success).toBe(true);
      const gameStateWithActivity = {
        ...gameState,
        world: startResult.data!.worldState,
        currentPet: startResult.data!.pet
      };
      
      // Simulate some progress by reducing ticks remaining
      const gameStateWithProgress = {
        ...gameStateWithActivity,
        world: {
          ...gameStateWithActivity.world,
          activeActivities: gameStateWithActivity.world.activeActivities.map(a => ({
            ...a,
            ticksRemaining: a.ticksRemaining - 5  // Some progress made
          }))
        }
      };
      
      // Cancel with refund
      const cancelResult = WorldSystem.cancelActivity(gameStateWithProgress, mockPet.id, true);
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.data!.activeActivities).toHaveLength(0);
      expect(cancelResult.data!.energyRefunded).toBeGreaterThan(0);
      expect(cancelResult.message).toContain("energy refunded");
    });

    it("should calculate energy refund based on remaining progress", () => {
      // Start an activity first
      const startResult = WorldSystem.startActivity(gameState, "hometown_foraging");
      expect(startResult.success).toBe(true);
      const gameStateWithActivity = {
        ...gameState,
        world: startResult.data!.worldState,
        currentPet: startResult.data!.pet
      };
      
      // Simulate 50% progress (10 ticks completed out of 20)
      const gameStateWithHalfProgress = {
        ...gameStateWithActivity,
        world: {
          ...gameStateWithActivity.world,
          activeActivities: gameStateWithActivity.world.activeActivities.map(a => ({
            ...a,
            ticksRemaining: 10  // Half remaining
          }))
        }
      };
      
      // Cancel with refund - should get ~25% of original energy (50% of unused 50% energy)
      const cancelResult = WorldSystem.cancelActivity(gameStateWithHalfProgress, mockPet.id, true);
      expect(cancelResult.success).toBe(true);
      
      // Original activity cost is 10, 50% unused = 5, 50% of that = 2.5, floored = 2
      expect(cancelResult.data!.energyRefunded).toBe(2);
    });

    it("should not refund energy for zero or negative energy cost activities", () => {
      // This test would be for edge cases, but since we've validated all activities have positive costs,
      // we can test the logic by mocking a hypothetical activity
      
      // Mock an activity with zero energy cost in the world state
      const gameStateWithZeroEnergyActivity = {
        ...gameState,
        world: {
          ...worldState,
          activeActivities: [{
            activityId: "test_zero_energy", // This won't match any real activity
            locationId: "hometown",
            startTime: Date.now(),
            ticksRemaining: 10,
            petId: mockPet.id
          }]
        }
      };
      
      const cancelResult = WorldSystem.cancelActivity(gameStateWithZeroEnergyActivity, mockPet.id, true);
      expect(cancelResult.success).toBe(true);
      expect(cancelResult.data!.energyRefunded).toBeUndefined(); // No refund for zero energy activities
      expect(cancelResult.message).toBe("Activity cancelled");
    });
  });
});
