// Unit tests for WorldSystem

import { describe, it, expect, beforeEach } from "bun:test";
import { WorldSystem } from "@/systems/WorldSystem";
import type { WorldState, Pet, PetSpecies } from "@/types";

describe("WorldSystem", () => {
  let mockPet: Pet;
  let worldState: WorldState;

  // Test helper to create a standard test pet
  function createTestPet(overrides: Partial<Pet> = {}): Pet {
    const testSpecies: PetSpecies = {
      id: "test_species",
      name: "Test Pet",
      rarity: "common",
      description: "A pet for testing",
      baseStats: { attack: 10, defense: 8, speed: 12, health: 50 },
      growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.2, energy: 1.1 },
      sprite: "test.png",
      icon: "test_icon.png",
    };

    return {
      id: "test_pet_1",
      name: "Buddy",
      species: testSpecies,
      rarity: "common",
      growthStage: 0,

      // Care stats
      satiety: 50,
      hydration: 50,
      happiness: 50,

      // Hidden counters
      satietyTicksLeft: 100,
      hydrationTicksLeft: 100,
      happinessTicksLeft: 100,
      poopTicksLeft: 100,
      sickByPoopTicksLeft: 17280,

      // Core stats
      life: 1000000,
      maxEnergy: 100,
      currentEnergy: 100,
      health: "healthy",
      state: "idle",

      // Battle stats
      attack: 10,
      defense: 8,
      speed: 12,
      maxHealth: 50,
      currentHealth: 50,
      moves: [],

      // Metadata
      birthTime: Date.now(),
      lastCareTime: Date.now(),
      totalLifetime: 0,

      ...overrides,
    };
  }

  beforeEach(() => {
    // Create a mock pet for testing
    mockPet = createTestPet();
    
    // Initialize world state
    worldState = WorldSystem.initializeWorldState();
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
      
      expect(locations).toHaveLength(1);
      expect(locations[0].id).toBe("hometown");
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
      const lowLevelPet = { ...mockPet, growthStage: 1 }; // Need level 2 for forest
      const result = WorldSystem.startTravel(worldState, lowLevelPet, "forest_path");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet must be at least level 2 to travel there");
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
      expect(result.data.worldState.travelState).toBeDefined();
      expect(result.data.worldState.travelState?.destinationId).toBe("forest_path");
      expect(result.data.pet.state).toBe("travelling");
      expect(result.data.pet.currentEnergy).toBeLessThan(100); // Energy consumed
      expect(result.message).toContain("Started travelling to Forest Path");
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
      expect(result.data.currentLocationId).toBe("forest_path");
      expect(result.data.travelState).toBeUndefined();
      expect(result.data.unlockedLocations).toContain("forest_path");
      expect(result.data.visitedLocations).toContain("forest_path");
      expect(result.message).toBe("Arrived at Forest Path!");
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
      expect(result.data.currentLocationId).toBe("hometown"); // Still at origin
      expect(result.data.travelState?.ticksRemaining).toBe(29);
      expect(result.message).toBeUndefined();
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
      const travellingWorld = {
        ...worldState,
        travelState: {
          destinationId: "forest_path",
          ticksRemaining: 30,
          totalTravelTime: 60,
          startTime: Date.now(),
        },
      };

      const result = WorldSystem.startActivity(travellingWorld, mockPet, "hometown_foraging");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start activity while travelling");
    });

    it("should fail to start activity when pet sleeping", () => {
      const sleepingPet = { ...mockPet, state: "sleeping" as const };
      const result = WorldSystem.startActivity(worldState, sleepingPet, "hometown_foraging");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start activity while pet is sleeping");
    });

    it("should fail to start activity when insufficient energy", () => {
      const lowEnergyPet = { ...mockPet, currentEnergy: 5 }; // Need 10 for foraging
      const result = WorldSystem.startActivity(worldState, lowEnergyPet, "hometown_foraging");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet doesn't have enough energy for this activity");
    });

    it("should fail to start activity when already doing one", () => {
      const busyWorld = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 10,
          petId: mockPet.id,
        }],
      };

      const result = WorldSystem.startActivity(busyWorld, mockPet, "hometown_foraging");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Pet is already doing an activity");
    });

    it("should successfully start activity when requirements met", () => {
      const result = WorldSystem.startActivity(worldState, mockPet, "hometown_foraging");
      
      expect(result.success).toBe(true);
      expect(result.data.worldState.activeActivities).toHaveLength(1);
      expect(result.data.worldState.activeActivities[0].activityId).toBe("hometown_foraging");
      expect(result.data.pet.currentEnergy).toBeLessThan(mockPet.currentEnergy);
      expect(result.message).toContain("Started Forage in Town Square");
    });

    it("should process activity completion", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 1, // Will complete this tick
          petId: mockPet.id,
        }],
      };

      const result = WorldSystem.processActivitiesTick(worldWithActivity);
      
      expect(result.success).toBe(true);
      expect(result.data.worldState.activeActivities).toHaveLength(0);
      expect(result.data.rewards.length).toBeGreaterThanOrEqual(0); // May get rewards
    });

    it("should continue activity when ticks remaining", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 10,
          petId: mockPet.id,
        }],
      };

      const result = WorldSystem.processActivitiesTick(worldWithActivity);
      
      expect(result.success).toBe(true);
      expect(result.data.worldState.activeActivities).toHaveLength(1);
      expect(result.data.worldState.activeActivities[0].ticksRemaining).toBe(9);
    });

    it("should get activity progress correctly", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 10, // 10 remaining out of 20 total
          petId: mockPet.id,
        }],
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
      const worldWithActivity = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 10,
          petId: mockPet.id,
        }],
      };

      const result = WorldSystem.cancelActivity(worldWithActivity, mockPet.id);
      
      expect(result.success).toBe(true);
      expect(result.data.activeActivities).toHaveLength(0);
      expect(result.message).toBe("Activity cancelled");
    });

    it("should fail to cancel when no activity", () => {
      const result = WorldSystem.cancelActivity(worldState, mockPet.id);
      
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
      expect(result.data.worldState.currentLocationId).toBe("forest_path");
      expect(result.data.worldState.travelState).toBeUndefined();
    });

    it("should process offline activity completion", () => {
      const worldWithActivity = {
        ...worldState,
        activeActivities: [{
          activityId: "hometown_foraging",
          locationId: "hometown",
          startTime: Date.now(),
          ticksRemaining: 5,
          petId: mockPet.id,
        }],
      };

      const result = WorldSystem.processOfflineProgression(worldWithActivity, 10);
      
      expect(result.success).toBe(true);
      expect(result.data.worldState.activeActivities).toHaveLength(0);
      expect(result.data.rewards.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Available Destinations", () => {
    it("should return empty array for low level pet", () => {
      const lowLevelPet = { ...mockPet, growthStage: 1 };
      const result = WorldSystem.getAvailableDestinations(worldState, lowLevelPet);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it("should return forest path for high level pet", () => {
      const highLevelPet = { ...mockPet, growthStage: 5 };
      const result = WorldSystem.getAvailableDestinations(worldState, highLevelPet);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("forest_path");
    });
  });
});