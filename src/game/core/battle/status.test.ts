/**
 * Tests for status effect processing.
 */

import { expect, test } from "bun:test";
import { DamageType } from "@/game/types/constants";
import {
  type MoveEffect,
  type StatusEffect,
  StatusEffectType,
} from "@/game/types/move";
import {
  applyMoveEffect,
  calculateEffectiveStats,
  getEffectSummary,
  isStunned,
  processStatusEffects,
} from "./status";

// Tests for applyMoveEffect
test("applyMoveEffect creates status effect when apply chance succeeds", () => {
  const effect: MoveEffect = {
    type: StatusEffectType.StatBuff,
    name: "Strength Up",
    stat: "strength",
    value: 20,
    duration: 3,
    applyChance: 1.0, // Guaranteed
    targetsSelf: true,
  };

  const result = applyMoveEffect(effect, 10);

  expect(result).not.toBeNull();
  expect(result?.name).toBe("Strength Up");
  expect(result?.type).toBe(StatusEffectType.StatBuff);
  expect(result?.duration).toBe(3);
  expect(result?.value).toBe(20);
});

test("applyMoveEffect returns null when apply chance fails", () => {
  const effect: MoveEffect = {
    type: StatusEffectType.StatBuff,
    name: "Strength Up",
    stat: "strength",
    value: 20,
    duration: 3,
    applyChance: 0, // Never applies
    targetsSelf: true,
  };

  const result = applyMoveEffect(effect, 10);

  expect(result).toBeNull();
});

test("applyMoveEffect can be resisted by high fortitude for debuffs", () => {
  const effect: MoveEffect = {
    type: StatusEffectType.StatDebuff,
    name: "Weakness",
    stat: "strength",
    value: 20,
    duration: 3,
    applyChance: 1.0,
    targetsSelf: false,
  };

  // Run many times with max fortitude (should resist most)
  let resistedCount = 0;
  for (let i = 0; i < 100; i++) {
    const result = applyMoveEffect(effect, 100); // Very high fortitude
    if (result === null) resistedCount++;
  }

  // With 100 fortitude and 1.5% per point, resist chance is 150% (capped)
  // So should resist most attempts
  expect(resistedCount).toBeGreaterThan(50);
});

test("applyMoveEffect includes damageType for DoT effects", () => {
  const effect: MoveEffect = {
    type: StatusEffectType.DamageOverTime,
    name: "Poison",
    value: 10,
    duration: 3,
    applyChance: 1.0,
    targetsSelf: false,
    damageType: DamageType.Chemical,
  };

  const result = applyMoveEffect(effect, 0); // 0 fortitude = no resistance

  expect(result?.damageType).toBe(DamageType.Chemical);
});

// Tests for processStatusEffects
test("processStatusEffects calculates total DoT damage", () => {
  const effects: StatusEffect[] = [
    {
      id: "dot-1",
      type: StatusEffectType.DamageOverTime,
      name: "Poison",
      duration: 3,
      value: 10,
      damageType: DamageType.Chemical,
    },
    {
      id: "dot-2",
      type: StatusEffectType.DamageOverTime,
      name: "Burn",
      duration: 2,
      value: 5,
      damageType: DamageType.Thermal,
    },
  ];

  const result = processStatusEffects(effects);

  expect(result.dotDamage).toBe(15);
});

test("processStatusEffects reduces duration of all effects", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20,
    },
    {
      id: "debuff-1",
      type: StatusEffectType.StatDebuff,
      name: "Defense Down",
      stat: "endurance",
      duration: 2,
      value: 15,
    },
  ];

  const result = processStatusEffects(effects);

  expect(result.effects.length).toBe(2);
  expect(result.effects[0]?.duration).toBe(2);
  expect(result.effects[1]?.duration).toBe(1);
});

test("processStatusEffects removes expired effects", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 1, // Will expire
      value: 20,
    },
    {
      id: "buff-2",
      type: StatusEffectType.StatBuff,
      name: "Speed Up",
      stat: "agility",
      duration: 3,
      value: 15,
    },
  ];

  const result = processStatusEffects(effects);

  expect(result.effects.length).toBe(1);
  expect(result.effects[0]?.name).toBe("Speed Up");
});

test("processStatusEffects returns empty array when all effects expire", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 1,
      value: 20,
    },
  ];

  const result = processStatusEffects(effects);

  expect(result.effects.length).toBe(0);
});

// Tests for isStunned
test("isStunned returns true when stun effect is present", () => {
  const effects: StatusEffect[] = [
    {
      id: "stun-1",
      type: StatusEffectType.Stun,
      name: "Stunned",
      duration: 1,
      value: 0,
    },
  ];

  expect(isStunned(effects)).toBe(true);
});

test("isStunned returns false when no stun effect", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20,
    },
  ];

  expect(isStunned(effects)).toBe(false);
});

test("isStunned returns false for empty effects array", () => {
  expect(isStunned([])).toBe(false);
});

// Tests for calculateEffectiveStats
test("calculateEffectiveStats applies stat buffs", () => {
  const baseStats = {
    strength: 100,
    endurance: 100,
    agility: 100,
    precision: 100,
    fortitude: 100,
    cunning: 100,
  };
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20, // 20% increase
    },
  ];

  const result = calculateEffectiveStats(baseStats, effects);

  expect(result.strength).toBe(120);
  expect(result.endurance).toBe(100); // Unchanged
});

test("calculateEffectiveStats applies stat debuffs", () => {
  const baseStats = {
    strength: 100,
    endurance: 100,
    agility: 100,
    precision: 100,
    fortitude: 100,
    cunning: 100,
  };
  const effects: StatusEffect[] = [
    {
      id: "debuff-1",
      type: StatusEffectType.StatDebuff,
      name: "Weakness",
      stat: "strength",
      duration: 3,
      value: 30, // 30% decrease
    },
  ];

  const result = calculateEffectiveStats(baseStats, effects);

  expect(result.strength).toBe(70);
});

test("calculateEffectiveStats stacks multiple effects", () => {
  const baseStats = {
    strength: 100,
    endurance: 100,
    agility: 100,
    precision: 100,
    fortitude: 100,
    cunning: 100,
  };
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20,
    },
    {
      id: "buff-2",
      type: StatusEffectType.StatBuff,
      name: "More Strength",
      stat: "strength",
      duration: 2,
      value: 10,
    },
  ];

  const result = calculateEffectiveStats(baseStats, effects);

  // First buff: 100 * 1.2 = 120
  // Second buff: 120 * 1.1 = 132
  expect(result.strength).toBe(132);
});

test("calculateEffectiveStats ensures minimum of 1", () => {
  const baseStats = {
    strength: 10,
    endurance: 100,
    agility: 100,
    precision: 100,
    fortitude: 100,
    cunning: 100,
  };
  const effects: StatusEffect[] = [
    {
      id: "debuff-1",
      type: StatusEffectType.StatDebuff,
      name: "Extreme Weakness",
      stat: "strength",
      duration: 3,
      value: 99, // 99% decrease
    },
  ];

  const result = calculateEffectiveStats(baseStats, effects);

  expect(result.strength).toBe(1);
});

test("calculateEffectiveStats ignores non-stat effects", () => {
  const baseStats = {
    strength: 100,
    endurance: 100,
    agility: 100,
    precision: 100,
    fortitude: 100,
    cunning: 100,
  };
  const effects: StatusEffect[] = [
    {
      id: "dot-1",
      type: StatusEffectType.DamageOverTime,
      name: "Poison",
      duration: 3,
      value: 10,
      damageType: DamageType.Chemical,
    },
    {
      id: "stun-1",
      type: StatusEffectType.Stun,
      name: "Stunned",
      duration: 1,
      value: 0,
    },
  ];

  const result = calculateEffectiveStats(baseStats, effects);

  expect(result.strength).toBe(100);
  expect(result.endurance).toBe(100);
});

// Tests for getEffectSummary
test("getEffectSummary categorizes buffs correctly", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20,
    },
  ];

  const result = getEffectSummary(effects);

  expect(result.buffs.length).toBe(1);
  expect(result.debuffs.length).toBe(0);
  expect(result.other.length).toBe(0);
});

test("getEffectSummary categorizes debuffs correctly", () => {
  const effects: StatusEffect[] = [
    {
      id: "debuff-1",
      type: StatusEffectType.StatDebuff,
      name: "Weakness",
      stat: "strength",
      duration: 3,
      value: 20,
    },
  ];

  const result = getEffectSummary(effects);

  expect(result.buffs.length).toBe(0);
  expect(result.debuffs.length).toBe(1);
  expect(result.other.length).toBe(0);
});

test("getEffectSummary categorizes DoT as debuff", () => {
  const effects: StatusEffect[] = [
    {
      id: "dot-1",
      type: StatusEffectType.DamageOverTime,
      name: "Poison",
      duration: 3,
      value: 10,
      damageType: DamageType.Chemical,
    },
  ];

  const result = getEffectSummary(effects);

  expect(result.buffs.length).toBe(0);
  expect(result.debuffs.length).toBe(1);
  expect(result.other.length).toBe(0);
});

test("getEffectSummary categorizes stun as other", () => {
  const effects: StatusEffect[] = [
    {
      id: "stun-1",
      type: StatusEffectType.Stun,
      name: "Stunned",
      duration: 1,
      value: 0,
    },
  ];

  const result = getEffectSummary(effects);

  expect(result.buffs.length).toBe(0);
  expect(result.debuffs.length).toBe(0);
  expect(result.other.length).toBe(1);
});

test("getEffectSummary handles mixed effects", () => {
  const effects: StatusEffect[] = [
    {
      id: "buff-1",
      type: StatusEffectType.StatBuff,
      name: "Strength Up",
      stat: "strength",
      duration: 3,
      value: 20,
    },
    {
      id: "debuff-1",
      type: StatusEffectType.StatDebuff,
      name: "Defense Down",
      stat: "endurance",
      duration: 2,
      value: 15,
    },
    {
      id: "dot-1",
      type: StatusEffectType.DamageOverTime,
      name: "Poison",
      duration: 3,
      value: 10,
      damageType: DamageType.Chemical,
    },
    {
      id: "stun-1",
      type: StatusEffectType.Stun,
      name: "Stunned",
      duration: 1,
      value: 0,
    },
  ];

  const result = getEffectSummary(effects);

  expect(result.buffs.length).toBe(1);
  expect(result.debuffs.length).toBe(2); // debuff + DoT
  expect(result.other.length).toBe(1);
});
