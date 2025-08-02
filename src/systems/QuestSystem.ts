// Quest system managing all quest-related mechanics

import type {
  Quest,
  QuestObjective,
  QuestProgress,
  QuestLog,
  QuestReward,
  QuestRequirement,
  QuestEvent,
} from "@/types/Quest";
import type { Result, GameState } from "@/types";
import { getItemById } from "@/data/items";
import { ItemSystem } from "@/systems/ItemSystem";
import { ResultUtils } from "@/lib/utils";

export interface QuestAction {
  type: "start_quest" | "complete_quest" | "update_objective" | "fail_quest";
  questId: string;
  objectiveId?: string;
  timestamp: number;
  data?: Record<string, string | number | boolean | string[]>;
}

export class QuestSystem {
  /**
   * Initialize a quest log for a new game
   */
  static initializeQuestLog(): QuestLog {
    return {
      activeQuests: [],
      completedQuests: [],
      failedQuests: [],
      availableQuests: [],
      questChains: [],
    };
  }

  /**
   * Check if a quest can be started by the player
   */
  static canStartQuest(quest: Quest, gameState: GameState): Result<boolean> {
    // Check if quest is already completed or active
    const questLog = gameState.questLog || this.initializeQuestLog();

    if (questLog.completedQuests.includes(quest.id)) {
      return ResultUtils.error("Quest has already been completed.");
    }

    if (questLog.activeQuests.some(q => q.questId === quest.id)) {
      return ResultUtils.error("Quest is already active.");
    }

    // Check quest requirements
    for (const requirement of quest.requirements) {
      const requirementMet = this.checkRequirement(requirement, gameState);
      if (!requirementMet.success) {
        return ResultUtils.error(requirementMet.error || "Quest requirements not met.");
      }
    }

    // Check if player has room for more active quests
    const maxActiveQuests = 10; // From QUEST_CONSTANTS
    if (questLog.activeQuests.length >= maxActiveQuests) {
      return ResultUtils.error("Too many active quests. Complete some quests first.");
    }

    return ResultUtils.success(true);
  }

  /**
   * Start a quest
   */
  static startQuest(quest: Quest, gameState: GameState): Result<GameState> {
    const canStart = this.canStartQuest(quest, gameState);
    if (!canStart.success) {
      return ResultUtils.error(canStart.error!);
    }

    const questLog = gameState.questLog || this.initializeQuestLog();

    // Create quest progress
    const questProgress: QuestProgress = {
      questId: quest.id,
      name: quest.name,
      description: quest.description,
      type: quest.type,
      status: "active",
      objectives: quest.objectives.map(obj => ({ ...obj, currentAmount: 0, completed: false })),
      rewards: quest.rewards,
      startTime: Date.now(),
      variables: {},
    };

    // Add to active quests
    questLog.activeQuests.push(questProgress);

    // Remove from available quests if present
    questLog.availableQuests = questLog.availableQuests.filter(id => id !== quest.id);

    // Update game state
    const updatedGameState = { ...gameState, questLog };

    return ResultUtils.success(updatedGameState);
  }

  /**
   * Abandon a quest
   */
  static abandonQuest(gameState: GameState, questId: string): Result<GameState> {
    const questLog = gameState.questLog || this.initializeQuestLog();

    // Find the quest in active quests
    const questIndex = questLog.activeQuests.findIndex(q => q.questId === questId);
    if (questIndex === -1) {
      return ResultUtils.error("Quest is not active.");
    }

    // Remove from active quests
    questLog.activeQuests.splice(questIndex, 1);

    // Add to failed quests
    if (!questLog.failedQuests.includes(questId)) {
      questLog.failedQuests.push(questId);
    }

    // Update game state
    const updatedGameState = { ...gameState, questLog };

    return ResultUtils.success(updatedGameState);
  }

  /**
   * Update objective progress based on game actions
   */
  static updateObjectiveProgress(
    questId: string,
    objectiveId: string,
    amount: number,
    gameState: GameState
  ): Result<QuestAction> {
    const questLog = gameState.questLog || this.initializeQuestLog();
    const questProgress = questLog.activeQuests.find(q => q.questId === questId);

    if (!questProgress) {
      return {
        success: false,
        error: "Quest is not active.",
      };
    }

    const objective = questProgress.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return {
        success: false,
        error: "Objective not found.",
      };
    }

    if (objective.completed) {
      return {
        success: false,
        error: "Objective is already completed.",
      };
    }

    // Update progress
    const currentAmount = objective.currentAmount || 0;
    const targetAmount = objective.targetAmount || 1;

    // Handle both positive and negative target amounts correctly
    if (targetAmount >= 0) {
      // Positive target: clamp upward (collecting items)
      objective.currentAmount = Math.min(currentAmount + amount, targetAmount);
    } else {
      // Negative target: clamp downward (selling/losing items)
      objective.currentAmount = Math.max(currentAmount + amount, targetAmount);
    }

    // Check if objective is now complete
    if (targetAmount >= 0) {
      // Positive target: complete when we reach or exceed the target
      if (objective.currentAmount >= targetAmount) {
        objective.completed = true;
      }
    } else {
      // Negative target: complete when we reach or go below the target
      if (objective.currentAmount <= targetAmount) {
        objective.completed = true;
      }
    }

    const action: QuestAction = {
      type: "update_objective",
      questId,
      objectiveId,
      timestamp: Date.now(),
      data: { amount, newProgress: objective.currentAmount, completed: objective.completed },
    };

    return { success: true, data: action };
  }

  /**
   * Check if a quest is complete (all objectives finished)
   */
  static isQuestComplete(questId: string, gameState: GameState): boolean {
    const questLog = gameState.questLog || this.initializeQuestLog();
    const questProgress = questLog.activeQuests.find(q => q.questId === questId);

    if (!questProgress) return false;

    return questProgress.objectives.every(obj => obj.completed);
  }

  /**
   * Complete a quest and distribute rewards
   */
  static completeQuest(gameState: GameState, questId: string): Result<GameState> {
    const questLog = gameState.questLog || this.initializeQuestLog();
    const questProgressIndex = questLog.activeQuests.findIndex(q => q.questId === questId);

    if (questProgressIndex === -1) {
      return {
        success: false,
        error: "Quest is not active.",
      };
    }

    const questProgress = questLog.activeQuests[questProgressIndex];

    // Verify all objectives are complete
    if (!questProgress.objectives.every(obj => obj.completed)) {
      return {
        success: false,
        error: "Not all objectives are complete.",
      };
    }

    // Remove from active quests
    questLog.activeQuests.splice(questProgressIndex, 1);

    // Add to completed quests
    questLog.completedQuests.push(questId);
    questProgress.status = "completed";
    questProgress.completeTime = Date.now();

    // Distribute rewards
    this.distributeRewards(questProgress.rewards, gameState);

    // Update game state
    const updatedGameState = { ...gameState, questLog };

    return { success: true, data: updatedGameState };
  }

  /**
   * Process game actions that might affect quest objectives
   */
  static processGameAction(
    actionType: string,
    actionData: Record<string, string | number | boolean>,
    allQuests: Quest[],
    gameState: GameState
  ): QuestEvent[] {
    const events: QuestEvent[] = [];
    const questLog = gameState.questLog || this.initializeQuestLog();

    // Process each active quest
    for (const questProgress of questLog.activeQuests) {
      const quest = allQuests.find(q => q.id === questProgress.questId);
      if (!quest) continue;

      // Check each incomplete objective
      for (const objective of questProgress.objectives) {
        if (objective.completed) continue;

        const progressResult = this.checkObjectiveProgress(objective, actionType, actionData);
        if (progressResult > 0) {
          const updateResult = this.updateObjectiveProgress(quest.id, objective.id, progressResult, gameState);

          if (updateResult.success) {
            events.push({
              type: "objective_completed",
              questId: quest.id,
              objectiveId: objective.id,
              timestamp: Date.now(),
              data: {
                progress: objective.currentAmount || 0,
                target: objective.targetAmount || 1,
              },
            });

            // Check if quest is now complete
            if (this.isQuestComplete(quest.id, gameState)) {
              const completeResult = this.completeQuest(gameState, quest.id);
              if (completeResult.success) {
                events.push({
                  type: "quest_completed",
                  questId: quest.id,
                  timestamp: Date.now(),
                  data: { rewards: quest.rewards.map(r => `${r.type}:${r.amount}`) },
                });
              }
            }
          }
        }
      }
    }

    return events;
  }

  /**
   * Get all available quests for the player
   */
  static getAvailableQuests(allQuests: Quest[], gameState: GameState): Quest[] {
    return allQuests.filter(quest => {
      const canStart = this.canStartQuest(quest, gameState);
      return canStart.success;
    });
  }

  /**
   * Get active quest progress
   */
  static getActiveQuests(gameState: GameState): QuestProgress[] {
    const questLog = gameState.questLog || this.initializeQuestLog();
    return questLog.activeQuests;
  }

  /**
   * Get completed quest IDs
   */
  static getCompletedQuests(gameState: GameState): string[] {
    const questLog = gameState.questLog || this.initializeQuestLog();
    return questLog.completedQuests;
  }

  // Private helper methods

  private static checkRequirement(requirement: QuestRequirement, gameState: GameState): Result<boolean> {
    switch (requirement.type) {
      case "level": {
        // Note: Level system not yet implemented, assume level 1 for now
        const playerLevel = gameState.currentPet?.growthStage || 0;
        if (playerLevel < (requirement.value || 0)) {
          return {
            success: false,
            error: `Requires level ${requirement.value}.`,
          };
        }
        break;
      }

      case "quest_completed": {
        const questLog = gameState.questLog || this.initializeQuestLog();
        if (!requirement.questId || !questLog.completedQuests.includes(requirement.questId)) {
          return {
            success: false,
            error: "Required quest not completed.",
          };
        }
        break;
      }

      case "location_visited":
        // Note: Location visit tracking not yet implemented
        // For now, assume player can visit any unlocked location
        break;

      case "item_owned": {
        if (!requirement.itemId) break;
        const requiredQuantity = requirement.value || 1;

        // Sum up all quantities of the required item across inventory slots
        const totalQuantity =
          gameState.inventory?.slots?.reduce((total, slot) => {
            if (slot.item.id === requirement.itemId) {
              return total + slot.quantity;
            }
            return total;
          }, 0) || 0;

        if (totalQuantity < requiredQuantity) {
          return {
            success: false,
            error: `Requires ${requiredQuantity} of item: ${requirement.itemId}. You have ${totalQuantity}.`,
          };
        }
        break;
      }

      case "pet_species":
        if (!requirement.petSpecies) break;
        if (gameState.currentPet?.species.id !== requirement.petSpecies) {
          return {
            success: false,
            error: `Requires pet species: ${requirement.petSpecies}.`,
          };
        }
        break;
    }

    return { success: true, data: true };
  }

  private static checkObjectiveProgress(
    objective: QuestObjective,
    actionType: string,
    actionData: Record<string, string | number | boolean>
  ): number {
    switch (objective.type) {
      case "collect_item":
        if (actionType === "item_obtained" && actionData.itemId === objective.itemId) {
          return Number(actionData.amount) || 1;
        }
        break;

      case "deliver_item":
        if (actionType === "item_delivered" && actionData.itemId === objective.itemId) {
          return Number(actionData.amount) || 1;
        }
        break;

      case "sell_item":
        if (actionType === "item_sold" && actionData.itemId === objective.itemId) {
          return Number(actionData.amount) || 1;
        }
        break;

      case "visit_location":
        if (actionType === "location_visited" && actionData.locationId === objective.locationId) {
          return 1;
        }
        break;

      case "defeat_pet":
        if (actionType === "battle_won" && actionData.opponentSpecies === objective.petSpecies) {
          return 1;
        }
        break;

      case "care_action":
        if (actionType === "pet_care" && actionData.action === objective.careAction) {
          return 1;
        }
        break;

      case "reach_level": {
        const targetLevel = objective.targetAmount || 1;
        const currentAmount = objective.currentAmount || 0;
        if (actionType === "level_up" && Number(actionData.newLevel) >= targetLevel) {
          return targetLevel - currentAmount; // Complete objective fully
        }
        break;
      }

      case "complete_quest":
        if (actionType === "quest_completed" && actionData.questId === objective.questId) {
          return 1;
        }
        break;
    }

    return 0;
  }

  private static distributeRewards(rewards: QuestReward[], gameState: GameState): void {
    for (const reward of rewards) {
      switch (reward.type) {
        case "item":
          if (reward.itemId && gameState.inventory) {
            const item = getItemById(reward.itemId);
            if (item) {
              const addResult = ItemSystem.addItem(gameState.inventory, item, reward.amount);
              if (addResult.success) {
                gameState.inventory = addResult.data!;
              }
            }
          }
          break;

        case "gold":
          if (gameState.inventory) {
            gameState.inventory.gold = (gameState.inventory.gold || 0) + reward.amount;
          }
          break;

        case "experience":
          gameState.playerStats.experience += reward.amount;
          break;

        case "unlock_location":
          if (reward.locationId && gameState.world) {
            if (!gameState.world.unlockedLocations.includes(reward.locationId)) {
              gameState.world.unlockedLocations.push(reward.locationId);
            }
          }
          break;

        case "unlock_pet":
          // Note: Pet unlocking system not yet implemented
          break;

        case "unlock_quest":
          if (reward.questId && gameState.questLog) {
            if (!gameState.questLog.availableQuests.includes(reward.questId)) {
              gameState.questLog.availableQuests.push(reward.questId);
            }
          }
          break;
      }
    }
  }
}
