// Tests for pet species data
import { describe, it, expect } from "bun:test";
import { getAllPetSpecies, getStarterPets, getPetsByRarity, getPetSpeciesById } from "@/data/pets";
import type { PetRarity } from "@/types/Pet";

describe("Pet Species Data", () => {
  describe("Total Pet Count", () => {
    it("should have exactly 31 total pet species", () => {
      const allPets = getAllPetSpecies();
      expect(allPets).toHaveLength(31);
    });

    it("should have correct count per rarity tier", () => {
      const commonPets = getPetsByRarity("common");
      const uncommonPets = getPetsByRarity("uncommon");
      const rarePets = getPetsByRarity("rare");
      const epicPets = getPetsByRarity("epic");
      const legendaryPets = getPetsByRarity("legendary");

      expect(commonPets).toHaveLength(10); // 3 starters + 7 others = 10 total common
      expect(uncommonPets).toHaveLength(8); // 1 existing + 7 new = 8 total uncommon
      expect(rarePets).toHaveLength(6); // 1 existing + 5 new = 6 total rare
      expect(epicPets).toHaveLength(4);
      expect(legendaryPets).toHaveLength(3);
    });
  });

  describe("Starter Pets", () => {
    it("should have exactly 3 starter pets", () => {
      const starters = getStarterPets();
      expect(starters).toHaveLength(3);
    });

    it("should have starter pets with correct IDs", () => {
      const starters = getStarterPets();
      const starterIds = starters.map(pet => pet.id);
      expect(starterIds).toContain("wild_beast");
      expect(starterIds).toContain("blue_salamander");
      expect(starterIds).toContain("flame_pup");
    });

    it("should have all starter pets as common rarity", () => {
      const starters = getStarterPets();
      starters.forEach(pet => {
        expect(pet.rarity).toBe("common");
      });
    });
  });

  describe("Pet Species Validation", () => {
    it("should have unique IDs for all pets", () => {
      const allPets = getAllPetSpecies();
      const ids = allPets.map(pet => pet.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(allPets.length);
    });

    it("should have valid base stats for all pets", () => {
      const allPets = getAllPetSpecies();
      allPets.forEach(pet => {
        expect(pet.baseStats.attack).toBeGreaterThan(0);
        expect(pet.baseStats.defense).toBeGreaterThan(0);
        expect(pet.baseStats.speed).toBeGreaterThan(0);
        expect(pet.baseStats.health).toBeGreaterThan(0);
      });
    });

    it("should have valid growth rates for all pets", () => {
      const allPets = getAllPetSpecies();
      allPets.forEach(pet => {
        expect(pet.growthRates.attack).toBeGreaterThan(0);
        expect(pet.growthRates.defense).toBeGreaterThan(0);
        expect(pet.growthRates.speed).toBeGreaterThan(0);
        expect(pet.growthRates.health).toBeGreaterThan(0);
        expect(pet.growthRates.energy).toBeGreaterThan(0);
      });
    });

    it("should have higher stats for higher rarities on average", () => {
      const commonPets = getPetsByRarity("common");
      const legendaryPets = getPetsByRarity("legendary");

      const avgCommonHealth = commonPets.reduce((sum, pet) => sum + pet.baseStats.health, 0) / commonPets.length;
      const avgLegendaryHealth =
        legendaryPets.reduce((sum, pet) => sum + pet.baseStats.health, 0) / legendaryPets.length;

      expect(avgLegendaryHealth).toBeGreaterThan(avgCommonHealth);
    });
  });

  describe("Pet Lookup Functions", () => {
    it("should find pets by valid ID", () => {
      const pet = getPetSpeciesById("wild_beast");
      expect(pet).toBeDefined();
      expect(pet?.id).toBe("wild_beast");
    });

    it("should return undefined for invalid ID", () => {
      const pet = getPetSpeciesById("nonexistent_pet");
      expect(pet).toBeUndefined();
    });

    it("should find pets by all rarity types", () => {
      const rarities: PetRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
      rarities.forEach(rarity => {
        const pets = getPetsByRarity(rarity);
        expect(pets.length).toBeGreaterThan(0);
        pets.forEach(pet => {
          expect(pet.rarity).toBe(rarity);
        });
      });
    });
  });

  describe("Pet Species Properties", () => {
    it("should have required string properties for all pets", () => {
      const allPets = getAllPetSpecies();
      allPets.forEach(pet => {
        expect(typeof pet.id).toBe("string");
        expect(pet.id.length).toBeGreaterThan(0);
        expect(typeof pet.name).toBe("string");
        expect(pet.name.length).toBeGreaterThan(0);
        expect(typeof pet.description).toBe("string");
        expect(pet.description.length).toBeGreaterThan(0);
        expect(typeof pet.sprite).toBe("string");
        expect(pet.sprite.length).toBeGreaterThan(0);
        expect(typeof pet.icon).toBe("string");
        expect(pet.icon.length).toBeGreaterThan(0);
      });
    });

    it("should have balanced stat distributions", () => {
      const allPets = getAllPetSpecies();
      allPets.forEach(pet => {
        const totalStats = pet.baseStats.attack + pet.baseStats.defense + pet.baseStats.speed + pet.baseStats.health;
        // Reasonable stat total ranges based on rarity
        if (pet.rarity === "common") {
          expect(totalStats).toBeGreaterThanOrEqual(120);
          expect(totalStats).toBeLessThanOrEqual(200);
        } else if (pet.rarity === "legendary") {
          expect(totalStats).toBeGreaterThanOrEqual(250);
          expect(totalStats).toBeLessThanOrEqual(600);
        }
      });
    });
  });

  describe("Growth Rate Validation", () => {
    it("should have higher growth rates for higher rarities", () => {
      const commonPets = getPetsByRarity("common");
      const epicPets = getPetsByRarity("epic");

      const avgCommonGrowth =
        commonPets.reduce(
          (sum, pet) =>
            sum +
            (pet.growthRates.attack +
              pet.growthRates.defense +
              pet.growthRates.speed +
              pet.growthRates.health +
              pet.growthRates.energy),
          0
        ) / commonPets.length;

      const avgEpicGrowth =
        epicPets.reduce(
          (sum, pet) =>
            sum +
            (pet.growthRates.attack +
              pet.growthRates.defense +
              pet.growthRates.speed +
              pet.growthRates.health +
              pet.growthRates.energy),
          0
        ) / epicPets.length;

      expect(avgEpicGrowth).toBeGreaterThan(avgCommonGrowth);
    });

    it("should have realistic growth rate ranges", () => {
      const allPets = getAllPetSpecies();
      allPets.forEach(pet => {
        // Growth rates should be between 0.5 and 2.5
        expect(pet.growthRates.attack).toBeGreaterThanOrEqual(0.5);
        expect(pet.growthRates.attack).toBeLessThanOrEqual(2.5);
        expect(pet.growthRates.defense).toBeGreaterThanOrEqual(0.5);
        expect(pet.growthRates.defense).toBeLessThanOrEqual(2.5);
        expect(pet.growthRates.speed).toBeGreaterThanOrEqual(0.5);
        expect(pet.growthRates.speed).toBeLessThanOrEqual(2.5);
        expect(pet.growthRates.health).toBeGreaterThanOrEqual(0.5);
        expect(pet.growthRates.health).toBeLessThanOrEqual(2.5);
        expect(pet.growthRates.energy).toBeGreaterThanOrEqual(0.5);
        expect(pet.growthRates.energy).toBeLessThanOrEqual(2.5);
      });
    });
  });
});
