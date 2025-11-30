/**
 * Tests for the headless battle system.
 */

import { expect, test } from "bun:test";
import {
  BattlePhase,
  createCombatantFromPet,
  createWildCombatant,
  initializeBattle,
} from "@/game/core/battle/battle";
import {
  processBattleRound,
  processFleeAttempt,
} from "@/game/core/battle/system";
import { getDefaultMoves } from "@/game/data/moves";
import { createNewPet } from "@/game/data/starting";
import { createInitialGameState } from "@/game/types/gameState";

test("processBattleRound executes player turn, enemy turn, and resolution", () => {
  // Setup
  const pet = createNewPet("TestPet", "florabit");
  const playerCombatant = createCombatantFromPet(pet, true);
  const enemyCombatant = createWildCombatant("florabit", 1);
  const battleState = initializeBattle(playerCombatant, enemyCombatant);

  // Ensure player goes first
  battleState.player.derivedStats.initiative = 100;
  battleState.enemy.derivedStats.initiative = 0;
  // Reset to ensure correct order
  battleState.turnOrder = ["player", "enemy"];
  battleState.phase = BattlePhase.PlayerTurn;

  const state = {
    ...createInitialGameState(),
    activeBattle: {
      enemySpeciesId: "florabit",
      enemyLevel: 1,
      battleState,
    },
  };

  const move = getDefaultMoves()[0]; // Tackle
  if (!move) throw new Error("No default moves found");

  // Execute
  const newState = processBattleRound(state, move);

  // Verify
  const newBattle = newState.activeBattle?.battleState;
  expect(newBattle).toBeDefined();
  if (!newBattle) return;

  // Check events
  expect(newBattle.roundEvents).toBeDefined();
  expect(newBattle.roundEvents?.length).toBeGreaterThanOrEqual(3);

  // 1. Player attack
  const playerAttack = newBattle.roundEvents?.find(
    (e) => e.type === "ATTACK" && e.actorId === "player",
  );
  expect(playerAttack).toBeDefined();

  // 2. Enemy attack (assuming no OHKO)
  const enemyAttack = newBattle.roundEvents?.find(
    (e) => e.type === "ATTACK" && e.actorId === "enemy",
  );
  expect(enemyAttack).toBeDefined();

  // 3. Turn end
  const turnEnd = newBattle.roundEvents?.find((e) => e.type === "TURN_END");
  expect(turnEnd).toBeDefined();

  // Check timestamps are monotonic
  const timestamps = newBattle.roundEvents?.map((e) => e.timestamp);
  expect(timestamps).toBeDefined();
  if (timestamps) {
    for (let i = 1; i < timestamps.length; i++) {
      // Use non-null assertion since we know index is valid
      expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]!);
    }
  }
});

test("processFleeAttempt handles success/failure", () => {
  // This test is non-deterministic due to Math.random(),
  // but we can verify it returns a valid state in either case.

  const pet = createNewPet("TestPet", "florabit");
  const playerCombatant = createCombatantFromPet(pet, true);
  const enemyCombatant = createWildCombatant("florabit", 1);
  const battleState = initializeBattle(playerCombatant, enemyCombatant);

  const state = {
    ...createInitialGameState(),
    activeBattle: {
      enemySpeciesId: "florabit",
      enemyLevel: 1,
      battleState,
    },
  };

  const newState = processFleeAttempt(state);

  if (newState.activeBattle) {
    // Failed to flee
    const battle = newState.activeBattle.battleState;
    const fleeEvent = battle.roundEvents?.find((e) => e.type === "FLEE");
    expect(fleeEvent).toBeDefined();
    expect(fleeEvent?.message).toBe("Failed to flee!");

    // Should have triggered enemy attack
    const enemyAttack = battle.roundEvents?.find(
      (e) => e.type === "ATTACK" && e.actorId === "enemy",
    );
    expect(enemyAttack).toBeDefined();
  } else {
    // Fled successfully
    expect(newState.activeBattle).toBeUndefined();
    const fledEvent = newState.pendingEvents.find(
      (e) => e.type === "battleFled",
    );
    expect(fledEvent).toBeDefined();
  }
});
