/**
 * Quest reward granting logic.
 */

import { addItem } from "@/game/core/inventory";
import { addXpToPlayerSkill } from "@/game/core/skills";
import type { GameState } from "@/game/types/gameState";
import { type QuestReward, RewardType } from "@/game/types/quest";
import { SkillType } from "@/game/types/skill";

/**
 * Result of granting rewards.
 */
export interface RewardGrantResult {
  /** Updated game state */
  state: GameState;
  /** Description of rewards granted */
  rewardsSummary: string[];
}

/**
 * Grant a single reward.
 */
function grantReward(
  state: GameState,
  reward: QuestReward,
): { state: GameState; summary: string } {
  switch (reward.type) {
    case RewardType.Currency: {
      const newState: GameState = {
        ...state,
        player: {
          ...state.player,
          currency: {
            ...state.player.currency,
            coins: state.player.currency.coins + reward.quantity,
          },
        },
      };
      return {
        state: newState,
        summary: `${reward.quantity} coins`,
      };
    }

    case RewardType.Item: {
      const newInventory = addItem(
        state.player.inventory,
        reward.target,
        reward.quantity,
      );
      const newState: GameState = {
        ...state,
        player: {
          ...state.player,
          inventory: newInventory,
        },
      };
      return {
        state: newState,
        summary: `${reward.quantity}x ${reward.target}`,
      };
    }

    case RewardType.XP: {
      const skillType = reward.target as SkillType;
      if (!Object.values(SkillType).includes(skillType)) {
        return { state, summary: "" };
      }
      const { skills } = addXpToPlayerSkill(
        state.player.skills,
        skillType,
        reward.quantity,
      );
      const newState: GameState = {
        ...state,
        player: {
          ...state.player,
          skills,
        },
      };
      return {
        state: newState,
        summary: `${reward.quantity} ${reward.target} XP`,
      };
    }

    case RewardType.Unlock: {
      // Unlock rewards would modify unlocked features/locations
      // For now, just return a summary - would need unlock tracking in GameState
      return {
        state,
        summary: `Unlocked: ${reward.target}`,
      };
    }

    default:
      return { state, summary: "" };
  }
}

/**
 * Grant all rewards for a quest.
 */
export function grantQuestRewards(
  state: GameState,
  rewards: QuestReward[],
): RewardGrantResult {
  let currentState = state;
  const summaries: string[] = [];

  for (const reward of rewards) {
    const result = grantReward(currentState, reward);
    currentState = result.state;
    if (result.summary) {
      summaries.push(result.summary);
    }
  }

  return {
    state: currentState,
    rewardsSummary: summaries,
  };
}
