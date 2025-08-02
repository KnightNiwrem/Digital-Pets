import { describe, it, expect } from "bun:test";
import { LOCATIONS } from "@/data/locations";
import type { ActivityType } from "@/types/World";

describe("Activity System", () => {
  describe("Energy Cost Validation", () => {
    it("should ensure all activities have positive energy costs", () => {
      const negativeEnergyActivities: Array<{ locationId: string; activityId: string; energyCost: number }> = [];
      
      LOCATIONS.forEach(location => {
        location.activities.forEach(activity => {
          if (activity.energyCost < 0) {
            negativeEnergyActivities.push({
              locationId: location.id,
              activityId: activity.id,
              energyCost: activity.energyCost
            });
          }
        });
      });

      // Should pass now that negative energy costs have been fixed
      expect(negativeEnergyActivities).toEqual([]);
    });

    it("should have fixed the previously problematic activities", () => {
      const fixedActivities = [
        { id: "riverside_rest", expectedCost: 5 },
        { id: "mountain_rest", expectedCost: 15 },
        { id: "pond_meditation", expectedCost: 10 }
      ];

      const foundActivities: Array<{ id: string; energyCost: number }> = [];
      
      LOCATIONS.forEach(location => {
        location.activities.forEach(activity => {
          const fixed = fixedActivities.find(p => p.id === activity.id);
          if (fixed) {
            foundActivities.push({
              id: activity.id,
              energyCost: activity.energyCost
            });
          }
        });
      });

      // Verify the fixes
      expect(foundActivities).toHaveLength(3);
      expect(foundActivities.find(a => a.id === "riverside_rest")?.energyCost).toBe(5);
      expect(foundActivities.find(a => a.id === "mountain_rest")?.energyCost).toBe(15);
      expect(foundActivities.find(a => a.id === "pond_meditation")?.energyCost).toBe(10);
    });
  });

  describe("Activity Type Validation", () => {
    it("should only use valid activity types", () => {
      const validTypes: ActivityType[] = ["foraging", "fishing", "mining", "training"];
      const invalidActivities: Array<{ locationId: string; activityId: string; type: string }> = [];
      
      LOCATIONS.forEach(location => {
        location.activities.forEach(activity => {
          if (!validTypes.includes(activity.type as ActivityType)) {
            invalidActivities.push({
              locationId: location.id,
              activityId: activity.id,
              type: activity.type
            });
          }
        });
      });

      expect(invalidActivities).toEqual([]);
    });

    it("should have updated activity types for fixed activities", () => {
      const updatedActivities = [
        { id: "riverside_rest", expectedType: "training" },
        { id: "mountain_rest", expectedType: "training" },
        { id: "pond_meditation", expectedType: "training" }
      ];

      const foundActivities: Array<{ id: string; type: string }> = [];
      
      LOCATIONS.forEach(location => {
        location.activities.forEach(activity => {
          const updated = updatedActivities.find(p => p.id === activity.id);
          if (updated) {
            foundActivities.push({
              id: activity.id,
              type: activity.type
            });
          }
        });
      });

      // Verify the activity type updates
      expect(foundActivities).toHaveLength(3);
      expect(foundActivities.find(a => a.id === "riverside_rest")?.type).toBe("training");
      expect(foundActivities.find(a => a.id === "mountain_rest")?.type).toBe("training");
      expect(foundActivities.find(a => a.id === "pond_meditation")?.type).toBe("training");
    });
  });
});