/**
 * Shared test factory for creating mock Combatant objects.
 */

import { calculateDerivedStats } from "@/game/core/battle/stats";
import type { Combatant } from "@/game/core/battle/turn";
import { SPECIES } from "@/game/data/species";
import { createDefaultResistances } from "@/game/types/stats";
import { createDefaultBattleStats } from "./createTestPet";

/**
 * Create a test combatant with optional overrides.
 * Provides sensible defaults for all required fields.
 */
export function createTestCombatant(
  overrides: Partial<Combatant> = {},
): Combatant {
  const battleStats = createDefaultBattleStats();
  battleStats.strength = 10;
  battleStats.endurance = 10;
  battleStats.agility = 10;
  battleStats.precision = 10;
  battleStats.fortitude = 10;
  battleStats.cunning = 10;

  return {
    name: "Test Pet",
    speciesId: SPECIES.FLORABIT.id,
    battleStats,
    derivedStats: calculateDerivedStats(battleStats),
    resistances: createDefaultResistances(),
    statusEffects: [],
    moveSlots: [],
    isPlayer: true,
    ...overrides,
  };
}
