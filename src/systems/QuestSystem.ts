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

export interface QuestSystemState {
  questLog: QuestLog;
  completedQuestIds: string[];
  activeQuestIds: string[];
  availableQuestIds: string[];
}

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
      return {
        success: false,
        error: "Quest has already been completed.",
      };
    }

    if (questLog.activeQuests.some(q => q.questId === quest.id)) {
      return {
        success: false,
        error: "Quest is already active.",
      };
    }

    // Check quest requirements
    for (const requirement of quest.requirements) {
      const requirementMet = this.checkRequirement(requirement, gameState);
      if (!requirementMet.success) {
        return {
          success: false,
          error: requirementMet.error || "Quest requirements not met.",
        };
      }
    }

    // Check if player has room for more active quests
    const maxActiveQuests = 10; // From QUEST_CONSTANTS
    if (questLog.activeQuests.length >= maxActiveQuests) {
      return {
        success: false,
        error: "Too many active quests. Complete some quests first.",
      };
    }

    return { success: true, data: true };
  }

  /**
   * Start a quest
   */
  static startQuest(quest: Quest, gameState: GameState): Result<QuestAction> {
    const canStart = this.canStartQuest(quest, gameState);
    if (!canStart.success) {
      return {
        success: false,
        error: canStart.error,
      };
    }

    const questLog = gameState.questLog || this.initializeQuestLog();

    // Create quest progress
    const questProgress: QuestProgress = {
      questId: quest.id,
      status: "active",
      objectives: quest.objectives.map(obj => ({ ...obj, currentAmount: 0, completed: false })),
      startTime: Date.now(),
      variables: {},
    };

    // Add to active quests
    questLog.activeQuests.push(questProgress);

    // Remove from available quests if present
    questLog.availableQuests = questLog.availableQuests.filter(id => id !== quest.id);

    // Update game state
    gameState.questLog = questLog;

    const action: QuestAction = {
      type: "start_quest",
      questId: quest.id,
      timestamp: Date.now(),
      data: { npcId: quest.npcId, location: quest.location },
    };

    return { success: true, data: action };
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
    objective.currentAmount = Math.min(objective.currentAmount + amount, objective.targetAmount);

    // Check if objective is now complete
    if (objective.currentAmount >= objective.targetAmount) {
      objective.completed = true;
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
  static completeQuest(quest: Quest, gameState: GameState): Result<QuestAction> {
    const questLog = gameState.questLog || this.initializeQuestLog();
    const questProgressIndex = questLog.activeQuests.findIndex(q => q.questId === quest.id);

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
    questLog.completedQuests.push(quest.id);
    questProgress.status = "completed";
    questProgress.completeTime = Date.now();

    // Distribute rewards
    this.distributeRewards(quest.rewards, gameState);

    // Update game state
    gameState.questLog = questLog;

    const action: QuestAction = {
      type: "complete_quest",
      questId: quest.id,
      timestamp: Date.now(),
      data: { rewards: quest.rewards.map(r => `${r.type}:${r.amount}`) },
    };

    return { success: true, data: action };
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
              data: { progress: objective.currentAmount, target: objective.targetAmount },
            });

            // Check if quest is now complete
            if (this.isQuestComplete(quest.id, gameState)) {
              const completeResult = this.completeQuest(quest, gameState);
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
        const hasItem = gameState.inventory?.slots?.some(slot => slot.item.id === requirement.itemId);
        if (!hasItem) {
          return {
            success: false,
            error: `Requires item: ${requirement.itemId}.`,
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

      case "reach_level":
        if (actionType === "level_up" && Number(actionData.newLevel) >= objective.targetAmount) {
          return objective.targetAmount - objective.currentAmount; // Complete objective fully
        }
        break;

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
            // Note: Item creation will need integration with ItemSystem
            // For now, just track that reward should be given
          }
          break;

        case "gold":
          if (gameState.inventory) {
            gameState.inventory.gold = (gameState.inventory.gold || 0) + reward.amount;
          }
          break;

        case "experience":
          // Note: Experience system not yet implemented
          // Track that experience should be awarded
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
