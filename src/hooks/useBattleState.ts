// Hook for managing battle state and actions

import { useState, useCallback } from "react";
import type { Battle, BattleAction } from "@/types/Battle";
import type { Pet } from "@/types/Pet";
import type { Result } from "@/types/index";
import { WILD_BEAST, FOREST_GUARDIAN, ARENA_CHAMPION } from "@/data/pets";

// Mock opponent data - would be loaded from data files in a complete implementation
const MOCK_OPPONENTS: Record<string, Pet> = {
  wild_beast: {
    id: "wild_beast",
    name: "Wild Beast",
    species: WILD_BEAST,
    rarity: "common",
    growthStage: 10,
    satiety: 80,
    hydration: 80,
    happiness: 80,
    satietyTicksLeft: 1200,
    hydrationTicksLeft: 1200,
    happinessTicksLeft: 1200,
    poopTicksLeft: 800,
    sickByPoopTicksLeft: 17280,
    life: 100000,
    maxEnergy: 120,
    currentEnergy: 120,
    health: "healthy",
    state: "idle",
    attack: 25,
    defense: 20,
    speed: 30,
    maxHealth: 100,
    currentHealth: 100,
    moves: [],
    birthTime: Date.now() - 86400000, // 1 day ago
    lastCareTime: Date.now() - 3600000, // 1 hour ago
    totalLifetime: 5760, // 24 hours worth of ticks
  },
  forest_guardian: {
    id: "forest_guardian",
    name: "Forest Guardian",
    species: FOREST_GUARDIAN,
    rarity: "uncommon",
    growthStage: 20,
    satiety: 90,
    hydration: 90,
    happiness: 90,
    satietyTicksLeft: 1200,
    hydrationTicksLeft: 1200,
    happinessTicksLeft: 1200,
    poopTicksLeft: 800,
    sickByPoopTicksLeft: 17280,
    life: 150000,
    maxEnergy: 150,
    currentEnergy: 150,
    health: "healthy",
    state: "idle",
    attack: 35,
    defense: 40,
    speed: 25,
    maxHealth: 120,
    currentHealth: 120,
    moves: [],
    birthTime: Date.now() - 172800000, // 2 days ago
    lastCareTime: Date.now() - 1800000, // 30 min ago
    totalLifetime: 11520, // 48 hours worth of ticks
  },
  arena_champion: {
    id: "arena_champion",
    name: "Arena Champion",
    species: ARENA_CHAMPION,
    rarity: "rare",
    growthStage: 30,
    satiety: 95,
    hydration: 95,
    happiness: 95,
    satietyTicksLeft: 1200,
    hydrationTicksLeft: 1200,
    happinessTicksLeft: 1200,
    poopTicksLeft: 800,
    sickByPoopTicksLeft: 17280,
    life: 200000,
    maxEnergy: 180,
    currentEnergy: 180,
    health: "healthy",
    state: "idle",
    attack: 45,
    defense: 50,
    speed: 40,
    maxHealth: 150,
    currentHealth: 150,
    moves: [],
    birthTime: Date.now() - 259200000, // 3 days ago
    lastCareTime: Date.now() - 900000, // 15 min ago
    totalLifetime: 17280, // 72 hours worth of ticks
  },
};

export function useBattleState() {
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBattle = useCallback(async (playerPet: Pet, opponentId: string): Promise<Result<void>> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get opponent data
      const opponent = MOCK_OPPONENTS[opponentId];
      if (!opponent) {
        const errorMsg = `Unknown opponent: ${opponentId}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Import BattleSystem dynamically
      const { BattleSystem } = await import("@/systems/BattleSystem");

      // Initiate battle
      const result = BattleSystem.initiateBattle(
        playerPet,
        opponent,
        "wild", // Default battle type
        "Battle Arena"
      );

      if (result.success && result.data) {
        setCurrentBattle(result.data);
        return { success: true };
      } else {
        const errorMsg = result.error || "Failed to start battle";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start battle";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeAction = useCallback(
    async (action: BattleAction): Promise<Result<void>> => {
      if (!currentBattle) {
        const errorMsg = "No active battle";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setIsLoading(true);
        setError(null);

        const { BattleSystem } = await import("@/systems/BattleSystem");

        // Process player action
        const result = BattleSystem.processPlayerAction(currentBattle, action);

        if (result.success && result.data) {
          setCurrentBattle(result.data);
          return { success: true };
        } else {
          const errorMsg = result.error || "Failed to execute action";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to execute action";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [currentBattle]
  );

  const endBattle = useCallback(() => {
    setCurrentBattle(null);
    setError(null);
  }, []);

  const applyBattleResults = useCallback(
    async (pet: Pet): Promise<Result<Pet>> => {
      if (!currentBattle) {
        return { success: false, error: "No battle to apply results from" };
      }

      try {
        const { BattleSystem } = await import("@/systems/BattleSystem");
        return BattleSystem.applyBattleResults(pet, currentBattle);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to apply battle results";
        return { success: false, error: errorMsg };
      }
    },
    [currentBattle]
  );

  return {
    currentBattle,
    isLoading,
    error,
    startBattle,
    executeAction,
    endBattle,
    applyBattleResults,
  };
}
