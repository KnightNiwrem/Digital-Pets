// Battle system for turn-based combat

import type { Battle, BattleAction, BattlePet, BattleResult, BattleTurn, BattleType, BattleMove } from "@/types/Battle";
import type { Pet, Move } from "@/types/Pet";
import type { Result } from "@/types/index";
import { PetValidator, EnergyManager } from "@/lib/utils";
import { getMoveById, getStarterMoves } from "@/data/moves";

// Import constants
const {
  MAX_MOVES_PER_PET,
  CRITICAL_HIT_CHANCE,
  CRITICAL_HIT_MULTIPLIER,
  BASE_ACCURACY,
  MAX_STATUS_EFFECTS,
  FLEE_SUCCESS_RATE,
} = {
  MAX_MOVES_PER_PET: 4,
  CRITICAL_HIT_CHANCE: 0.0625,
  CRITICAL_HIT_MULTIPLIER: 1.5,
  BASE_ACCURACY: 100,
  MAX_STATUS_EFFECTS: 5,
  FLEE_SUCCESS_RATE: 0.8,
} as const;

/**
 * Convert a Pet Move to BattleMove format
 */
function convertMoveToBattleMove(move: Move): BattleMove {
  return {
    id: move.id,
    name: move.name,
    description: move.description,
    category: "physical", // Default category, could be enhanced based on move.type
    power: move.damage,
    accuracy: move.accuracy,
    energyCost: move.energyCost,
    priority: 0, // Default priority
    effects: [], // Convert move.effects if needed
    targetType: "opponent", // Default target
  };
}

/**
 * Get battle-ready moves for a pet
 */
function getPetBattleMoves(pet: Pet): BattleMove[] {
  if (pet.moves.length === 0) {
    // If pet has no moves, give them starter moves
    return getStarterMoves().slice(0, MAX_MOVES_PER_PET);
  }

  // Convert existing moves to battle format
  return pet.moves.slice(0, MAX_MOVES_PER_PET).map(convertMoveToBattleMove);
}

export class BattleSystem {
  /**
   * Initialize a new battle between two pets
   */
  static initiateBattle(playerPet: Pet, opponentPet: Pet, battleType: BattleType, location: string): Result<Battle> {
    try {
      // Validate pets are ready for battle
      if (playerPet.currentHealth <= 0) {
        return { success: false, error: "Your pet is unable to battle - no health remaining" };
      }

      if (!EnergyManager.hasEnoughEnergy(playerPet, 20)) {
        return { success: false, error: "Your pet is too tired to battle - needs at least 20 energy" };
      }

      if (playerPet.state !== "idle") {
        return { success: false, error: "Your pet is busy and cannot battle right now" };
      }

      // Convert pets to battle pets
      const battlePlayerPet = this.createBattlePet(playerPet);
      const battleOpponentPet = this.createBattlePet(opponentPet);

      const battle: Battle = {
        id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: battleType,
        status: "waiting",
        playerPet: battlePlayerPet,
        opponentPet: battleOpponentPet,
        currentTurn: 1,
        turns: [],
        turnPhase: "select_action",
        experience: this.calculateExperienceReward(battleOpponentPet, battleType),
        goldReward: this.calculateGoldReward(battleOpponentPet, battleType),
        itemRewards: this.calculateItemRewards(battleType),
        startTime: Date.now(),
        location,
      };

      return { success: true, data: battle };
    } catch (error) {
      return { success: false, error: `Failed to initiate battle: ${error}` };
    }
  }

  /**
   * Process a battle action from the player
   */
  static processPlayerAction(battle: Battle, action: BattleAction): Result<Battle> {
    try {
      if (battle.status !== "in_progress" && battle.status !== "waiting") {
        return { success: false, error: "Battle is not in progress" };
      }

      if (battle.turnPhase !== "select_action") {
        return { success: false, error: "Not currently accepting actions" };
      }

      // Validate action
      const validationResult = this.validateAction(battle, action);
      if (!validationResult.success) {
        return { success: false, error: validationResult.error };
      }

      // Generate opponent action (AI)
      const opponentAction = this.generateOpponentAction(battle);

      // Execute turn
      const turnResult = this.executeTurn(battle, action, opponentAction);
      if (!turnResult.success) {
        return turnResult;
      }

      const updatedBattle = turnResult.data!;

      // Check for battle end conditions
      const endResult = this.checkBattleEnd(updatedBattle);

      return { success: true, data: endResult };
    } catch (error) {
      return { success: false, error: `Failed to process action: ${error}` };
    }
  }

  /**
   * Execute a complete battle turn with both player and opponent actions
   */
  static executeTurn(battle: Battle, playerAction: BattleAction, opponentAction: BattleAction): Result<Battle> {
    try {
      const updatedBattle = { ...battle };
      const results: BattleResult[] = [];

      // Determine action order based on speed and priority
      const actions = this.determineActionOrder(updatedBattle, playerAction, opponentAction);

      // Execute actions in order
      for (const actionData of actions) {
        const { action, isPlayer } = actionData;
        const actor = isPlayer ? updatedBattle.playerPet : updatedBattle.opponentPet;
        const target = isPlayer ? updatedBattle.opponentPet : updatedBattle.playerPet;

        // Process action
        if (action.type === "move" && action.moveId) {
          const moveResults = this.executeMove(actor, target, action.moveId);
          results.push(...moveResults);
        } else if (action.type === "flee") {
          const fleeResult = this.attemptFlee(updatedBattle, isPlayer);
          results.push(fleeResult);
          if (fleeResult.type === "status_applied") {
            updatedBattle.status = "fled";
            break;
          }
        }

        // Check if target is defeated
        if (target.currentHealth <= 0) {
          results.push({
            type: "status_applied",
            targetId: target.id,
            sourceId: actor.id,
            message: `${target.name} has been defeated!`,
          });
          break;
        }
      }

      // Process status effects at end of turn
      this.processStatusEffects(updatedBattle.playerPet, results);
      this.processStatusEffects(updatedBattle.opponentPet, results);

      // Create turn record
      const turn: BattleTurn = {
        turnNumber: updatedBattle.currentTurn,
        playerAction,
        opponentAction,
        results,
        timestamp: Date.now(),
      };

      updatedBattle.turns.push(turn);
      updatedBattle.currentTurn++;
      updatedBattle.status = "in_progress";
      updatedBattle.turnPhase = "select_action";

      return { success: true, data: updatedBattle };
    } catch (error) {
      return { success: false, error: `Failed to execute turn: ${error}` };
    }
  }

  /**
   * Execute a specific move between two battle pets
   */
  static executeMove(attacker: BattlePet, defender: BattlePet, moveId: string): BattleResult[] {
    const results: BattleResult[] = [];
    const move = getMoveById(moveId);

    if (!move) {
      results.push({
        type: "miss",
        targetId: defender.id,
        sourceId: attacker.id,
        moveId,
        message: `${attacker.name} tried to use an unknown move!`,
      });
      return results;
    }

    // Check energy cost
    if (!EnergyManager.hasEnoughEnergy(attacker, move.energyCost)) {
      results.push({
        type: "miss",
        targetId: defender.id,
        sourceId: attacker.id,
        moveId,
        message: `${attacker.name} doesn't have enough energy to use ${move.name}!`,
      });
      return results;
    }

    // Deduct energy cost
    EnergyManager.deductEnergy(attacker, move.energyCost);

    // Check accuracy
    const accuracy = this.calculateAccuracy(attacker, defender, move.accuracy);
    const hitRoll = Math.random() * 100;
    if (hitRoll > accuracy) {
      results.push({
        type: "miss",
        targetId: defender.id,
        sourceId: attacker.id,
        moveId,
        message: `${attacker.name}'s ${move.name} missed!`,
      });
      return results;
    }

    // Calculate damage for damage-dealing moves
    if (move.power > 0) {
      const damage = this.calculateDamage(attacker, defender, move);
      const isCritical = Math.random() < CRITICAL_HIT_CHANCE;
      const finalDamage = isCritical ? Math.floor(damage * CRITICAL_HIT_MULTIPLIER) : damage;

      defender.currentHealth = Math.max(0, defender.currentHealth - finalDamage);

      if (isCritical) {
        results.push({
          type: "critical",
          targetId: defender.id,
          sourceId: attacker.id,
          value: finalDamage,
          moveId,
          message: `Critical hit! ${defender.name} took ${finalDamage} damage!`,
        });
      } else {
        results.push({
          type: "damage",
          targetId: defender.id,
          sourceId: attacker.id,
          value: finalDamage,
          moveId,
          message: `${defender.name} took ${finalDamage} damage from ${move.name}!`,
        });
      }
    } else {
      results.push({
        type: "status_applied",
        targetId: defender.id,
        sourceId: attacker.id,
        moveId,
        message: `${attacker.name} used ${move.name}!`,
      });
    }

    // Apply move effects
    for (const effect of move.effects) {
      if (effect.probability && Math.random() > effect.probability) {
        continue; // Effect didn't trigger
      }

      const target = move.targetType === "self" ? attacker : defender;

      switch (effect.type) {
        case "heal": {
          const healAmount = Math.floor(target.maxHealth * (effect.value / 100));
          target.currentHealth = Math.min(target.maxHealth, target.currentHealth + healAmount);
          results.push({
            type: "heal",
            targetId: target.id,
            sourceId: attacker.id,
            value: healAmount,
            moveId,
            message: `${target.name} recovered ${healAmount} health!`,
          });
          break;
        }

        case "stat_change":
          if (effect.stat) {
            this.applyStatModifier(target, effect.stat, effect.value);
            results.push({
              type: "stat_changed",
              targetId: target.id,
              sourceId: attacker.id,
              value: effect.value,
              moveId,
              message: `${target.name}'s ${effect.stat} ${effect.value > 0 ? "increased" : "decreased"}!`,
            });
          }
          break;

        case "status_effect":
          if (effect.statusEffect && target.statusEffects.length < MAX_STATUS_EFFECTS) {
            target.statusEffects.push({ ...effect.statusEffect });
            results.push({
              type: "status_applied",
              targetId: target.id,
              sourceId: attacker.id,
              statusEffect: effect.statusEffect,
              moveId,
              message: `${target.name} is now ${effect.statusEffect.name.toLowerCase()}!`,
            });
          }
          break;
      }
    }

    return results;
  }

  /**
   * Check if battle has ended and determine winner
   */
  static checkBattleEnd(battle: Battle): Battle {
    const updatedBattle = { ...battle };

    if (updatedBattle.playerPet.currentHealth <= 0) {
      updatedBattle.status = "defeat";
      updatedBattle.endTime = Date.now();
    } else if (updatedBattle.opponentPet.currentHealth <= 0) {
      updatedBattle.status = "victory";
      updatedBattle.endTime = Date.now();
    }

    return updatedBattle;
  }

  /**
   * Apply battle results to the original pet
   */
  static applyBattleResults(pet: Pet, battle: Battle): Result<Pet> {
    try {
      const updatedPet = { ...pet };

      // Apply health changes
      const healthLoss = battle.playerPet.maxHealth - battle.playerPet.currentHealth;
      updatedPet.currentHealth = Math.max(0, updatedPet.currentHealth - healthLoss);

      // Apply energy changes
      updatedPet.currentEnergy = Math.max(0, battle.playerPet.currentEnergy);

      // Apply rewards for victory
      if (battle.status === "victory") {
        // Note: Experience and gold would be handled by other systems
        // This method focuses on pet stat changes
      }

      return { success: true, data: updatedPet };
    } catch (error) {
      return { success: false, error: `Failed to apply battle results: ${error}` };
    }
  }

  // Private helper methods

  private static createBattlePet(pet: Pet): BattlePet {
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species.name,
      currentHealth: pet.currentHealth,
      maxHealth: pet.maxHealth,
      attack: pet.attack,
      defense: pet.defense,
      speed: pet.speed,
      accuracy: BASE_ACCURACY,
      evasion: 0,
      currentEnergy: pet.currentEnergy,
      maxEnergy: pet.maxEnergy,
      moves: getPetBattleMoves(pet),
      statusEffects: [],
      tempStatModifiers: {
        attack: 0,
        defense: 0,
        speed: 0,
        accuracy: 0,
        evasion: 0,
      },
    };
  }

  private static validateAction(battle: Battle, action: BattleAction): Result<void> {
    if (action.type === "move") {
      if (!action.moveId) {
        return { success: false, error: "Move ID is required for move actions" };
      }

      const move = getMoveById(action.moveId);
      if (!move) {
        return { success: false, error: "Invalid move selected" };
      }

      const petMoves = battle.playerPet.moves.map(m => m.id);
      if (!petMoves.includes(action.moveId)) {
        return { success: false, error: "Pet doesn't know this move" };
      }

      if (!EnergyManager.hasEnoughEnergy(battle.playerPet, move.energyCost)) {
        return { success: false, error: EnergyManager.ERROR_MESSAGES.BATTLE };
      }
    }

    return { success: true };
  }

  private static generateOpponentAction(battle: Battle): BattleAction {
    // Simple AI: randomly select a move the opponent knows
    const availableMoves = battle.opponentPet.moves.filter(move => {
      const moveData = getMoveById(move.id);
      return battle.opponentPet.currentEnergy >= (moveData?.energyCost || 0);
    });

    if (availableMoves.length === 0) {
      // Opponent has no energy for moves, try to flee
      return {
        type: "flee",
        petId: battle.opponentPet.id,
        priority: -1,
        timestamp: Date.now(),
      };
    }

    const selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const move = getMoveById(selectedMove.id)!;

    return {
      type: "move",
      moveId: selectedMove.id,
      petId: battle.opponentPet.id,
      priority: move.priority,
      timestamp: Date.now(),
    };
  }

  private static determineActionOrder(
    battle: Battle,
    playerAction: BattleAction,
    opponentAction: BattleAction
  ): Array<{ action: BattleAction; isPlayer: boolean }> {
    const actions = [
      { action: playerAction, isPlayer: true },
      { action: opponentAction, isPlayer: false },
    ];

    // Sort by priority (higher first), then by speed, then randomly
    return actions.sort((a, b) => {
      if (a.action.priority !== b.action.priority) {
        return b.action.priority - a.action.priority;
      }

      const aSpeed = (a.isPlayer ? battle.playerPet : battle.opponentPet).speed;
      const bSpeed = (b.isPlayer ? battle.playerPet : battle.opponentPet).speed;

      if (aSpeed !== bSpeed) {
        return bSpeed - aSpeed;
      }

      return Math.random() - 0.5;
    });
  }

  private static calculateDamage(attacker: BattlePet, defender: BattlePet, move: { power: number }): number {
    const baseAttack = attacker.attack + attacker.tempStatModifiers.attack;
    const baseDefense = defender.defense + defender.tempStatModifiers.defense;

    // Damage formula: ((Attack / Defense) * MovePower * Random(0.85-1.15))
    const attackDefenseRatio = baseAttack / Math.max(1, baseDefense);
    const randomFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15

    return Math.max(1, Math.floor(attackDefenseRatio * move.power * randomFactor));
  }

  private static calculateAccuracy(attacker: BattlePet, defender: BattlePet, moveAccuracy: number): number {
    const attackerAccuracy = attacker.accuracy + attacker.tempStatModifiers.accuracy;
    const defenderEvasion = defender.evasion + defender.tempStatModifiers.evasion;

    return Math.max(5, Math.min(100, moveAccuracy + (attackerAccuracy - defenderEvasion) / 10));
  }

  private static applyStatModifier(pet: BattlePet, stat: string, value: number): void {
    if (stat in pet.tempStatModifiers) {
      const currentMod = pet.tempStatModifiers[stat as keyof typeof pet.tempStatModifiers];
      pet.tempStatModifiers[stat as keyof typeof pet.tempStatModifiers] = Math.max(
        -50,
        Math.min(50, currentMod + value)
      );
    }
  }

  private static processStatusEffects(pet: BattlePet, results: BattleResult[]): void {
    pet.statusEffects = pet.statusEffects.filter(effect => {
      effect.duration--;

      if (effect.tickDamage && effect.tickDamage > 0) {
        pet.currentHealth = Math.max(0, pet.currentHealth - effect.tickDamage);
        results.push({
          type: "damage",
          targetId: pet.id,
          sourceId: pet.id,
          value: effect.tickDamage,
          message: `${pet.name} took ${effect.tickDamage} damage from ${effect.name}!`,
        });
      }

      if (effect.duration <= 0) {
        results.push({
          type: "status_removed",
          targetId: pet.id,
          sourceId: pet.id,
          statusEffect: effect,
          message: `${pet.name} is no longer ${effect.name.toLowerCase()}!`,
        });
        return false;
      }

      return true;
    });
  }

  private static attemptFlee(battle: Battle, isPlayer: boolean): BattleResult {
    const fleeing = isPlayer ? battle.playerPet : battle.opponentPet;
    const success = Math.random() < FLEE_SUCCESS_RATE;

    if (success) {
      return {
        type: "status_applied",
        targetId: fleeing.id,
        sourceId: fleeing.id,
        message: `${fleeing.name} successfully fled from battle!`,
      };
    } else {
      return {
        type: "miss",
        targetId: fleeing.id,
        sourceId: fleeing.id,
        message: `${fleeing.name} couldn't escape!`,
      };
    }
  }

  private static calculateExperienceReward(opponent: BattlePet, battleType: BattleType): number {
    const baseExp = Math.floor(opponent.maxHealth / 10);
    const typeMultiplier = battleType === "training" ? 1.5 : battleType === "tournament" ? 2.0 : 1.0;
    return Math.floor(baseExp * typeMultiplier);
  }

  private static calculateGoldReward(opponent: BattlePet, battleType: BattleType): number {
    const baseGold = Math.floor(opponent.maxHealth / 20);
    const typeMultiplier = battleType === "wild" ? 0.5 : battleType === "tournament" ? 3.0 : 1.0;
    return Math.floor(baseGold * typeMultiplier);
  }

  private static calculateItemRewards(battleType: BattleType): string[] {
    // Simple item reward system - could be expanded
    const rewards: string[] = [];

    if (Math.random() < 0.3) {
      rewards.push("energy_drink");
    }

    if (battleType === "tournament" && Math.random() < 0.5) {
      rewards.push("basic_medicine");
    }

    return rewards;
  }
}
