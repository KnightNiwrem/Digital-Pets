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

    it("should return mountain village location", () => {
      const location = getLocationById("mountain_village");
      expect(location).toBeDefined();
      expect(location?.id).toBe("mountain_village");
      expect(location?.name).toBe("Mountain Village");
      expect(location?.type).toBe("town");
      expect(location?.activities).toHaveLength(3);
      expect(location?.shops).toHaveLength(2);
      expect(location?.npcs).toHaveLength(3);
    });

    it("should return ancient ruins location", () => {
      const location = getLocationById("ancient_ruins");
      expect(location).toBeDefined();
      expect(location?.id).toBe("ancient_ruins");
      expect(location?.name).toBe("Ancient Ruins");
      expect(location?.type).toBe("ruins");
      expect(location?.activities).toBeDefined();
      expect(location?.activities.length).toBe(3);
      expect(location?.npcs.length).toBe(3);
      expect(location?.shops.length).toBe(1);

      // Check unlock requirements
      expect(location?.unlockRequirements).toBeDefined();
      expect(location?.unlockRequirements?.length).toBe(1);
      expect(location?.unlockRequirements?.[0].type).toBe("quest_completed");
      expect(location?.unlockRequirements?.[0].value).toBe("the_great_discovery_part2");

      // Check activities are unique to ruins
      const activityIds = location?.activities.map(a => a.id);
      expect(activityIds).toContain("artifact_hunting");
      expect(activityIds).toContain("puzzle_solving");
      expect(activityIds).toContain("guardian_challenge");
    });

    it("should return coastal harbor location", () => {
      const location = getLocationById("coastal_harbor");
      expect(location).toBeDefined();
      expect(location?.id).toBe("coastal_harbor");
      expect(location?.name).toBe("Coastal Harbor");
      expect(location?.type).toBe("beach");
      expect(location?.activities).toBeDefined();
      expect(location?.activities.length).toBe(3);
      expect(location?.npcs.length).toBe(3);
      expect(location?.shops.length).toBe(2);

      // Check unlock requirements
      expect(location?.unlockRequirements).toBeDefined();
      expect(location?.unlockRequirements?.length).toBe(1);
      expect(location?.unlockRequirements?.[0].type).toBe("quest_completed");
      expect(location?.unlockRequirements?.[0].value).toBe("the_great_discovery_part3");

      // Check maritime activities
      const activityIds = location?.activities.map(a => a.id);
      expect(activityIds).toContain("deep_sea_fishing");
      expect(activityIds).toContain("ship_maintenance");
      expect(activityIds).toContain("trade_negotiations");
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

    it("should return NPC data for mountain village NPCs", () => {
      const blacksmith = getNpcById("blacksmith_thor");
      expect(blacksmith).toBeDefined();
      expect(blacksmith?.id).toBe("blacksmith_thor");
      expect(blacksmith?.name).toBe("Thor the Blacksmith");

      const guide = getNpcById("mining_guide_elena");
      expect(guide).toBeDefined();
      expect(guide?.id).toBe("mining_guide_elena");
      expect(guide?.name).toBe("Elena the Mining Guide");

      const elder = getNpcById("village_elder_magnus");
      expect(elder).toBeDefined();
      expect(elder?.id).toBe("village_elder_magnus");
      expect(elder?.name).toBe("Elder Magnus");
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

    it("should return NPC data for ancient ruins NPCs", () => {
      const archaeologist = getNpcById("archaeologist_vera");
      expect(archaeologist).toBeDefined();
      expect(archaeologist?.id).toBe("archaeologist_vera");
      expect(archaeologist?.name).toBe("Dr. Vera Cross");

      const guardian = getNpcById("guardian_spirit_aeon");
      expect(guardian).toBeDefined();
      expect(guardian?.id).toBe("guardian_spirit_aeon");
      expect(guardian?.name).toBe("Aeon the Guardian");

      const treasureHunter = getNpcById("treasure_hunter_zara");
      expect(treasureHunter).toBeDefined();
      expect(treasureHunter?.id).toBe("treasure_hunter_zara");
      expect(treasureHunter?.name).toBe("Zara the Treasure Hunter");
    });

    it("should return NPC data for coastal harbor NPCs", () => {
      const harborMaster = getNpcById("harbor_master_thaddeus");
      expect(harborMaster).toBeDefined();
      expect(harborMaster?.id).toBe("harbor_master_thaddeus");
      expect(harborMaster?.name).toBe("Harbor Master Thaddeus");

      const merchantCaptain = getNpcById("merchant_captain_elena");
      expect(merchantCaptain).toBeDefined();
      expect(merchantCaptain?.id).toBe("merchant_captain_elena");
      expect(merchantCaptain?.name).toBe("Captain Elena Stormwind");

      const fishmonger = getNpcById("fishmonger_barnabus");
      expect(fishmonger).toBeDefined();
      expect(fishmonger?.id).toBe("fishmonger_barnabus");
      expect(fishmonger?.name).toBe("Barnabus the Fishmonger");
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

    it("should return available destinations from forest path including mountain village", () => {
      const destinations = getAvailableDestinations("forest_path");
      expect(destinations).toBeDefined();
      expect(destinations.length).toBe(3);

      const destinationIds = destinations.map(dest => dest.id);
      expect(destinationIds).toContain("hometown");
      expect(destinationIds).toContain("riverside");
      expect(destinationIds).toContain("mountain_village");
    });

    it("should return empty array for invalid location", () => {
      const destinations = getAvailableDestinations("invalid_location");
      expect(destinations).toEqual([]);
    });
  });
});
