import { describe, it, expect } from "bun:test";
import { LOCATIONS } from "@/data/locations";

describe("Activities Issue Tracker Validation", () => {
  describe("CRITICAL-001: Energy Cost Validation", () => {
    it("should have positive energy costs for all activities", () => {
      const allActivities = LOCATIONS.flatMap(location => location.activities || []);
      
      for (const activity of allActivities) {
        expect(activity.energyCost).toBeGreaterThan(0);
        console.log(`✓ ${activity.id}: energyCost = ${activity.energyCost}`);
      }
      
      console.log(`Total activities validated: ${allActivities.length}`);
    });

    it("should verify specific previously problematic activities", () => {
      const allActivities = LOCATIONS.flatMap(location => location.activities || []);
      
      // Check riverside_rest (was previously negative)
      const riversideRest = allActivities.find(a => a.id === "riverside_rest");
      expect(riversideRest).toBeDefined();
      expect(riversideRest!.energyCost).toBe(5);
      expect(riversideRest!.name).toBe("Peaceful Reflection");
      expect(riversideRest!.type).toBe("training");
      
      // Check mountain_rest (was previously negative)  
      const mountainRest = allActivities.find(a => a.id === "mountain_rest");
      expect(mountainRest).toBeDefined();
      expect(mountainRest!.energyCost).toBe(15);
      expect(mountainRest!.name).toBe("High Altitude Training");
      expect(mountainRest!.type).toBe("training");
      
      // Check pond_meditation (was previously negative)
      const pondMeditation = allActivities.find(a => a.id === "pond_meditation");
      expect(pondMeditation).toBeDefined();
      expect(pondMeditation!.energyCost).toBe(10);
      expect(pondMeditation!.name).toBe("Mindful Practice");
      expect(pondMeditation!.type).toBe("training");
    });
  });

  describe("CRITICAL-002: Activity Type Validation", () => {
    it("should only use valid activity types", () => {
      const validTypes = ["foraging", "fishing", "mining", "training"];
      const allActivities = LOCATIONS.flatMap(location => location.activities || []);
      
      for (const activity of allActivities) {
        expect(validTypes).toContain(activity.type);
      }
    });

    it("should not use invalid activity types", () => {
      const invalidTypes = ["shop", "battle", "quest"];
      const allActivities = LOCATIONS.flatMap(location => location.activities || []);
      
      for (const activity of allActivities) {
        expect(invalidTypes).not.toContain(activity.type);
      }
    });
  });
});