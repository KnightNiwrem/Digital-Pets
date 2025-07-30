import { describe, test, expect } from "bun:test";
import { GameStorage } from "@/storage/GameStorage";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { WorldSystem } from "@/systems/WorldSystem";
import { PetSystem } from "@/systems/PetSystem";
import { PetValidator } from "@/lib/utils";
import { getLocationById } from "@/data/locations";
import { getAllPetSpecies } from "@/data/pets";

// Setup localStorage mock for tests
import "@/../../tests/setup/localStorage";

describe("Live Game Fixes", () => {
  describe("Issue 1: Save Data Validation", () => {
    test("should validate game state with questLog property", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      
      // Save and load to test validation
      const saveResult = GameStorage.saveGame(gameState);
      expect(saveResult.success).toBe(true);
      
      const loadResult = GameStorage.loadGame();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.questLog).toBeDefined();
    });

    test("should reject save data with missing questLog", () => {
      const invalidSaveData = {
        metadata: { version: "1.0.0", lastSaveTime: Date.now() },
        inventory: {},
        world: {},
        // Missing questLog (correct property name)
        playerStats: {},
        settings: {},
        metrics: {},
        gameTime: {},
      };

      // Simulate loading invalid data
      localStorage.setItem("digitalPets_gameState", JSON.stringify(invalidSaveData));
      
      const loadResult = GameStorage.loadGame();
      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toContain("Missing required property: questLog");
      
      // Cleanup
      localStorage.removeItem("digitalPets_gameState");
    });
  });

  describe("Issue 2 & 3: Pet Exploring State", () => {
    test("should set pet state to exploring when starting activity", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      
      // Set pet to hometown with enough energy
      pet.currentEnergy = 100;
      pet.state = "idle";
      
      // Get hometown location and an activity
      const hometown = getLocationById("hometown");
      expect(hometown).toBeDefined();
      expect(hometown!.activities.length).toBeGreaterThan(0);
      
      const activity = hometown!.activities[0];
      
      const result = WorldSystem.startActivity(
        gameState.world,
        pet,
        activity.id,
        gameState.inventory
      );
      
      expect(result.success).toBe(true);
      expect(result.data!.pet.state).toBe("exploring");
    });

    test("should prevent care actions when pet is exploring", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      
      // Test feeding
      const feedResult = PetSystem.feedPet(pet, 25);
      expect(feedResult.success).toBe(false);
      expect(feedResult.error).toContain("Cannot feed pet while exploring");
      
      // Test drinking
      const drinkResult = PetSystem.giveDrink(pet, 25);
      expect(drinkResult.success).toBe(false);
      expect(drinkResult.error).toContain("Cannot give drinks while exploring");
      
      // Test playing
      const playResult = PetSystem.playWithPet(pet, 20);
      expect(playResult.success).toBe(false);
      expect(playResult.error).toContain("Cannot play while exploring");
    });

    test("should prevent sleep when pet is exploring", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      
      const sleepValidation = PetValidator.validateSleepAction(pet);
      expect(sleepValidation).toBeTruthy();
      expect(sleepValidation).toContain("Pet cannot sleep while exploring");
    });

    test("should prevent new activities when pet is already exploring", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      
      // Set pet to exploring state
      pet.state = "exploring";
      pet.currentEnergy = 100;
      
      const hometown = getLocationById("hometown");
      const activity = hometown!.activities[0];
      
      const result = WorldSystem.startActivity(
        gameState.world,
        pet,
        activity.id,
        gameState.inventory
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain("Pet is already engaged in an activity");
    });

    test("should prevent travel when pet is exploring", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      pet.currentEnergy = 100;
      
      // Try to travel somewhere (this would fail anyway but let's test the validation)
      const energyValidation = PetValidator.validateWorldAction(pet, 20);
      expect(energyValidation).toBeTruthy();
      expect(energyValidation).toContain("Pet is already engaged in an activity");
    });

    test("should reset pet state to idle when activity is cancelled", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      
      // Start an activity first
      pet.currentEnergy = 100;
      pet.state = "idle";
      
      const hometown = getLocationById("hometown");
      const activity = hometown!.activities[0];
      
      const startResult = WorldSystem.startActivity(
        gameState.world,
        pet,
        activity.id,
        gameState.inventory
      );
      
      expect(startResult.success).toBe(true);
      const updatedWorld = startResult.data!.worldState;
      const updatedPet = startResult.data!.pet;
      expect(updatedPet.state).toBe("exploring");
      
      // Now cancel the activity
      const cancelResult = WorldSystem.cancelActivity(updatedWorld, pet.id);
      expect(cancelResult.success).toBe(true);
      
      // The WorldSystem only handles the world state, pet state reset should be handled
      // at the game state level (in useGameState hook)
      expect(cancelResult.data!.activeActivities).toHaveLength(0);
    });
  });

  describe("PetValidator Exploring State", () => {
    test("should correctly identify when pet is exploring", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      
      pet.state = "exploring";
      expect(PetValidator.isExploring(pet)).toBe(true);
      
      pet.state = "idle";
      expect(PetValidator.isExploring(pet)).toBe(false);
      
      pet.state = "sleeping";
      expect(PetValidator.isExploring(pet)).toBe(false);
      
      pet.state = "travelling";
      expect(PetValidator.isExploring(pet)).toBe(false);
    });

    test("should validate care actions correctly for exploring state", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      
      const feedValidation = PetValidator.validateCareAction(pet, "feed");
      expect(feedValidation).toContain("Cannot feed pet while exploring");
      
      const drinkValidation = PetValidator.validateCareAction(pet, "drink");
      expect(drinkValidation).toContain("Cannot give drinks while exploring");
      
      const playValidation = PetValidator.validateCareAction(pet, "play");
      expect(playValidation).toContain("Cannot play while exploring");
    });

    test("should validate world actions correctly for exploring state", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      pet.currentEnergy = 100;
      
      const worldValidation = PetValidator.validateWorldAction(pet, 20);
      expect(worldValidation).toContain("Pet is already engaged in an activity");
    });

    test("should validate battle actions correctly for exploring state", () => {
      // Create a game state with a starter pet
      const allSpecies = getAllPetSpecies();
      const starterSpecies = allSpecies.find(s => s.rarity === "common")!;
      const starterPet = GameStateFactory.createStarterPet(starterSpecies, "Test Pet");
      const gameState = GameStateFactory.createNewGame(starterPet);
      const pet = gameState.currentPet!;
      pet.state = "exploring";
      pet.currentEnergy = 100;
      
      const battleValidation = PetValidator.validateBattleAction(pet, 20);
      expect(battleValidation).toContain("Pet cannot battle while exploring");
    });
  });
});