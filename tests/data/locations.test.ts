// Location data validation tests

import { describe, it, expect } from "bun:test";
import { getLocationById, getStartingLocation, getAvailableDestinations, getNpcById } from "@/data/locations";

describe("Location Data Validation", () => {
  describe("getLocationById", () => {
    it("should return hometown location", () => {
      const location = getLocationById("hometown");
      expect(location).toBeDefined();
      expect(location?.id).toBe("hometown");
      expect(location?.name).toBe("Hometown");
    });

    it("should return undefined for invalid location ID", () => {
      const location = getLocationById("invalid_location");
      expect(location).toBeUndefined();
    });
  });

  describe("getStartingLocation", () => {
    it("should return hometown as starting location", () => {
      const location = getStartingLocation();
      expect(location.id).toBe("hometown");
      expect(location.name).toBe("Hometown");
    });
  });

  describe("getNpcById", () => {
    it("should return NPC data for valid shopkeeper_sam", () => {
      const npc = getNpcById("shopkeeper_sam");
      expect(npc).toBeDefined();
      expect(npc?.id).toBe("shopkeeper_sam");
      expect(npc?.name).toBe("Sam");
      expect(npc?.description).toBe("The friendly owner of the general store");
    });

    it("should return NPC data for valid forest_ranger", () => {
      const npc = getNpcById("forest_ranger");
      expect(npc).toBeDefined();
      expect(npc?.id).toBe("forest_ranger");
      expect(npc?.name).toBe("Forest Ranger");
      expect(npc?.description).toBe("A knowledgeable ranger who protects the forest");
    });

    it("should return NPC data for valid angler_joe", () => {
      const npc = getNpcById("angler_joe");
      expect(npc).toBeDefined();
      expect(npc?.id).toBe("angler_joe");
      expect(npc?.name).toBe("Joe the Angler");
      expect(npc?.description).toBe("An experienced fisherman who knows all the best spots");
    });

    it("should return undefined for invalid NPC ID", () => {
      const npc = getNpcById("invalid_npc");
      expect(npc).toBeUndefined();
    });

    it("should handle empty string gracefully", () => {
      const npc = getNpcById("");
      expect(npc).toBeUndefined();
    });
  });

  describe("getAvailableDestinations", () => {
    it("should return available destinations from hometown", () => {
      const destinations = getAvailableDestinations("hometown");
      expect(destinations).toBeDefined();
      expect(destinations.length).toBeGreaterThan(0);
      
      // Check that all destinations are valid locations
      destinations.forEach(dest => {
        expect(dest.id).toBeDefined();
        expect(dest.name).toBeDefined();
      });
    });

    it("should return empty array for invalid location", () => {
      const destinations = getAvailableDestinations("invalid_location");
      expect(destinations).toEqual([]);
    });
  });
});