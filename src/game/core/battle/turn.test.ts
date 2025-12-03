/**
 * Tests for turn order and action resolution.
 */

import { expect, test } from "bun:test";
import { createTestCombatant } from "@/game/testing/createTestCombatant";
import { DamageType } from "@/game/types/constants";
import { type Move, type MoveSlot, StatusEffectType } from "@/game/types/move";
import { calculateDerivedStats } from "./stats";
import {
  canUseMove,
  checkBattleEnd,
  determineTurnOrder,
  executeAction,
  getAvailableMoves,
  processEndOfTurn,
  selectAIMove,
} from "./turn";

const createTestMove = (overrides: Partial<Move> = {}): Move => ({
  id: "test_move",
  name: "Test Move",
  description: "A test move",
  power: 1.0,
  flatDamage: 5,
  damageType: DamageType.Crushing,
  staminaCost: 10,
  cooldown: 0,
  accuracyModifier: 0,
  effects: [],
  target: "enemy",
  ...overrides,
});

// Tests for determineTurnOrder
test("determineTurnOrder returns player first when player has higher initiative", () => {
  const player = createTestCombatant({
    derivedStats: calculateDerivedStats({
      strength: 10,
      endurance: 10,
      agility: 20, // High agility = high initiative
      precision: 10,
      fortitude: 10,
      cunning: 10,
    }),
  });
  const enemy = createTestCombatant({
    derivedStats: calculateDerivedStats({
      strength: 10,
      endurance: 10,
      agility: 5, // Low agility = low initiative
      precision: 10,
      fortitude: 10,
      cunning: 10,
    }),
  });

  const order = determineTurnOrder(player, enemy);

  expect(order[0]).toBe("player");
  expect(order[1]).toBe("enemy");
});

test("determineTurnOrder returns enemy first when enemy has higher initiative", () => {
  const player = createTestCombatant({
    derivedStats: calculateDerivedStats({
      strength: 10,
      endurance: 10,
      agility: 5,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    }),
  });
  const enemy = createTestCombatant({
    derivedStats: calculateDerivedStats({
      strength: 10,
      endurance: 10,
      agility: 20,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    }),
  });

  const order = determineTurnOrder(player, enemy);

  expect(order[0]).toBe("enemy");
  expect(order[1]).toBe("player");
});

test("determineTurnOrder returns player first when initiatives are equal", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();

  const order = determineTurnOrder(player, enemy);

  expect(order[0]).toBe("player");
});

// Tests for canUseMove
test("canUseMove returns true for available move", () => {
  const combatant = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 50,
    },
  });
  const moveSlot: MoveSlot = {
    move: createTestMove({ staminaCost: 10 }),
    currentCooldown: 0,
  };

  const result = canUseMove(combatant, moveSlot);

  expect(result.canUse).toBe(true);
  expect(result.reason).toBeUndefined();
});

test("canUseMove returns false when on cooldown", () => {
  const combatant = createTestCombatant();
  const moveSlot: MoveSlot = {
    move: createTestMove(),
    currentCooldown: 2,
  };

  const result = canUseMove(combatant, moveSlot);

  expect(result.canUse).toBe(false);
  expect(result.reason).toBe("On cooldown");
});

test("canUseMove returns false when not enough stamina", () => {
  const combatant = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 5,
    },
  });
  const moveSlot: MoveSlot = {
    move: createTestMove({ staminaCost: 20 }),
    currentCooldown: 0,
  };

  const result = canUseMove(combatant, moveSlot);

  expect(result.canUse).toBe(false);
  expect(result.reason).toBe("Not enough stamina");
});

// Tests for getAvailableMoves
test("getAvailableMoves filters out unavailable moves", () => {
  const combatant = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 50,
    },
    moveSlots: [
      {
        move: createTestMove({ id: "move1", staminaCost: 10 }),
        currentCooldown: 0,
      },
      {
        move: createTestMove({ id: "move2", staminaCost: 10 }),
        currentCooldown: 2,
      },
      {
        move: createTestMove({ id: "move3", staminaCost: 100 }),
        currentCooldown: 0,
      },
    ],
  });

  const available = getAvailableMoves(combatant);

  expect(available.length).toBe(1);
  expect(available[0]?.move.id).toBe("move1");
});

test("getAvailableMoves returns all moves when all available", () => {
  const combatant = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 100,
    },
    moveSlots: [
      {
        move: createTestMove({ id: "move1", staminaCost: 10 }),
        currentCooldown: 0,
      },
      {
        move: createTestMove({ id: "move2", staminaCost: 20 }),
        currentCooldown: 0,
      },
    ],
  });

  const available = getAvailableMoves(combatant);

  expect(available.length).toBe(2);
});

// Tests for executeAction
test("executeAction deducts stamina cost", () => {
  const actor = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 50,
    },
    moveSlots: [
      { move: createTestMove({ staminaCost: 15 }), currentCooldown: 0 },
    ],
  });
  const target = createTestCombatant();
  const move = createTestMove({ staminaCost: 15 });

  const result = executeAction(actor, target, move, "player");

  expect(result.actor.derivedStats.currentStamina).toBe(35);
});

test("executeAction sets move cooldown", () => {
  const move = createTestMove({ id: "cooldown_move", cooldown: 3 });
  const actor = createTestCombatant({
    moveSlots: [{ move, currentCooldown: 0 }],
  });
  const target = createTestCombatant();

  const result = executeAction(actor, target, move, "player");

  const updatedSlot = result.actor.moveSlots.find(
    (slot) => slot.move.id === "cooldown_move",
  );
  expect(updatedSlot?.currentCooldown).toBe(3);
});

test("executeAction returns wasStunned true when actor is stunned", () => {
  const actor = createTestCombatant({
    statusEffects: [
      {
        id: "stun-1",
        type: StatusEffectType.Stun,
        name: "Stunned",
        duration: 1,
        value: 0,
      },
    ],
  });
  const target = createTestCombatant();
  const move = createTestMove();

  const result = executeAction(actor, target, move, "player");

  expect(result.action.wasStunned).toBe(true);
});

test("executeAction deals damage to target", () => {
  const actor = createTestCombatant({
    battleStats: {
      strength: 20,
      endurance: 10,
      agility: 10,
      precision: 50, // High precision for guaranteed hit
      fortitude: 10,
      cunning: 10,
    },
    derivedStats: {
      ...calculateDerivedStats({
        strength: 20,
        endurance: 10,
        agility: 10,
        precision: 50,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 100,
    },
  });
  const target = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 100,
      dodgeChance: 0, // Guarantee hit
    },
  });
  const move = createTestMove({ power: 2.0, flatDamage: 10 });

  const result = executeAction(actor, target, move, "player");

  // Should have dealt damage (exact amount varies due to variance)
  expect(result.target.derivedStats.currentHealth).toBeLessThan(100);
  expect(result.action.damageResult?.isHit).toBe(true);
});

// Tests for processEndOfTurn
test("processEndOfTurn reduces move cooldowns", () => {
  const combatant = createTestCombatant({
    moveSlots: [
      { move: createTestMove({ id: "move1" }), currentCooldown: 3 },
      { move: createTestMove({ id: "move2" }), currentCooldown: 1 },
    ],
  });

  const result = processEndOfTurn(combatant);

  expect(result.combatant.moveSlots[0]?.currentCooldown).toBe(2);
  expect(result.combatant.moveSlots[1]?.currentCooldown).toBe(0);
});

test("processEndOfTurn processes DoT damage", () => {
  const combatant = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 100,
    },
    statusEffects: [
      {
        id: "dot-1",
        type: StatusEffectType.DamageOverTime,
        name: "Poison",
        duration: 2,
        value: 10,
        damageType: DamageType.Chemical,
      },
    ],
  });

  const result = processEndOfTurn(combatant);

  expect(result.dotDamage).toBe(10);
  expect(result.combatant.derivedStats.currentHealth).toBe(90);
});

test("processEndOfTurn reduces status effect duration", () => {
  const combatant = createTestCombatant({
    statusEffects: [
      {
        id: "buff-1",
        type: StatusEffectType.StatBuff,
        name: "Strength Up",
        stat: "strength",
        duration: 2,
        value: 20,
      },
    ],
  });

  const result = processEndOfTurn(combatant);

  expect(result.combatant.statusEffects.length).toBe(1);
  expect(result.combatant.statusEffects[0]?.duration).toBe(1);
});

test("processEndOfTurn removes expired status effects", () => {
  const combatant = createTestCombatant({
    statusEffects: [
      {
        id: "buff-1",
        type: StatusEffectType.StatBuff,
        name: "Strength Up",
        stat: "strength",
        duration: 1,
        value: 20,
      },
    ],
  });

  const result = processEndOfTurn(combatant);

  expect(result.combatant.statusEffects.length).toBe(0);
});

// Tests for checkBattleEnd
test("checkBattleEnd returns player victory when enemy health is 0", () => {
  const player = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 50,
    },
  });
  const enemy = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 0,
    },
  });

  const result = checkBattleEnd(player, enemy);

  expect(result.isOver).toBe(true);
  expect(result.winner).toBe("player");
});

test("checkBattleEnd returns enemy victory when player health is 0", () => {
  const player = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 0,
    },
  });
  const enemy = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 50,
    },
  });

  const result = checkBattleEnd(player, enemy);

  expect(result.isOver).toBe(true);
  expect(result.winner).toBe("enemy");
});

test("checkBattleEnd returns not over when both have health", () => {
  const player = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 50,
    },
  });
  const enemy = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentHealth: 50,
    },
  });

  const result = checkBattleEnd(player, enemy);

  expect(result.isOver).toBe(false);
  expect(result.winner).toBeUndefined();
});

// Tests for selectAIMove
test("selectAIMove returns a move from available moves", () => {
  const enemy = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 100,
    },
    moveSlots: [
      {
        move: createTestMove({ id: "move1", name: "Attack 1" }),
        currentCooldown: 0,
      },
      {
        move: createTestMove({ id: "move2", name: "Attack 2" }),
        currentCooldown: 0,
      },
    ],
  });

  const move = selectAIMove(enemy);

  expect(["Attack 1", "Attack 2"]).toContain(move.name);
});

test("selectAIMove falls back to first move when all on cooldown", () => {
  const fallbackMove = createTestMove({ id: "fallback", name: "Fallback" });
  const enemy = createTestCombatant({
    moveSlots: [
      { move: fallbackMove, currentCooldown: 2 },
      { move: createTestMove({ id: "move2" }), currentCooldown: 3 },
    ],
  });

  const move = selectAIMove(enemy);

  expect(move.name).toBe("Fallback");
});

test("selectAIMove throws when enemy has no moves", () => {
  const enemy = createTestCombatant({
    moveSlots: [],
  });

  expect(() => selectAIMove(enemy)).toThrow("Enemy has no moves available");
});

test("selectAIMove prefers high damage moves", () => {
  const lowPowerMove = createTestMove({
    id: "low",
    name: "Low Power",
    power: 0.5,
  });
  const highPowerMove = createTestMove({
    id: "high",
    name: "High Power",
    power: 3.0,
  });
  const enemy = createTestCombatant({
    derivedStats: {
      ...calculateDerivedStats({
        strength: 10,
        endurance: 10,
        agility: 10,
        precision: 10,
        fortitude: 10,
        cunning: 10,
      }),
      currentStamina: 100,
    },
    moveSlots: [
      { move: lowPowerMove, currentCooldown: 0 },
      { move: highPowerMove, currentCooldown: 0 },
    ],
  });

  // Run multiple times to account for randomness (30% support move chance)
  let highPowerCount = 0;
  for (let i = 0; i < 100; i++) {
    const move = selectAIMove(enemy);
    if (move.name === "High Power") highPowerCount++;
  }

  // Should select high power move most of the time (around 70%)
  expect(highPowerCount).toBeGreaterThan(50);
});
