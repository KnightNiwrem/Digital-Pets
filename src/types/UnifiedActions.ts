// Unified action system types for coordinated state management

import type { ActionType } from "@/constants/ActionTypes";

// Base interface for all game actions
export interface UnifiedGameAction {
  type: ActionType | string;
  payload: ActionPayload;
  source: "user" | "system" | "tick";
  timestamp: number;
  id?: string; // For tracking and debugging
}

// Generic payload type
export type ActionPayload = Record<string, unknown>;

// Pet care actions
export interface PetCareAction extends UnifiedGameAction {
  type: "pet_care";
  payload: {
    careType: "feed" | "drink" | "play" | "clean" | "medicine" | "sleep" | "wake";
    itemId?: string; // For item-based care
    energyCost?: number;
    value?: number; // For direct value application (non-item)
    effects?: Array<{ type: string; value: number }>; // For medicine/item effects
  };
}

// Item actions
export interface ItemAction extends UnifiedGameAction {
  type: "item_operation";
  payload: {
    operation: "add" | "remove" | "use" | "buy" | "sell" | "sort";
    itemId: string;
    quantity: number;
    targetId?: string; // For use operations (pet ID)
    priceMultiplier?: number; // For buy/sell operations
    sortBy?: "name" | "value" | "rarity" | "type" | "quantity";
  };
}

// World actions
export interface WorldAction extends UnifiedGameAction {
  type: "world_action";
  payload: {
    actionType: "travel" | "activity" | "cancel_activity";
    destinationId?: string;
    activityId?: string;
  };
}

// Quest actions
export interface QuestAction extends UnifiedGameAction {
  type: "quest_action";
  payload: {
    actionType: "start" | "abandon" | "complete" | "progress";
    questId: string;
    progressData?: Record<string, unknown>;
  };
}

// Composite actions for multiple operations
export interface CompositeAction extends UnifiedGameAction {
  type: "composite_action";
  payload: {
    actions: UnifiedGameAction[];
    rollbackOnFailure: boolean;
  };
}

// Union type for all actions
export type GameAction = PetCareAction | ItemAction | WorldAction | QuestAction | CompositeAction;

// Action factory helpers
export class ActionFactory {
  static createPetCareAction(
    careType: PetCareAction["payload"]["careType"],
    options: Partial<PetCareAction["payload"]> = {}
  ): PetCareAction {
    return {
      type: "pet_care",
      payload: {
        careType,
        ...options,
      },
      source: "user",
      timestamp: Date.now(),
      id: `pet_care_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static createItemAction(
    operation: ItemAction["payload"]["operation"],
    itemId: string,
    quantity: number = 1,
    options: Partial<ItemAction["payload"]> = {}
  ): ItemAction {
    return {
      type: "item_operation",
      payload: {
        operation,
        itemId,
        quantity,
        ...options,
      },
      source: "user",
      timestamp: Date.now(),
      id: `item_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static createWorldAction(
    actionType: WorldAction["payload"]["actionType"],
    options: Partial<WorldAction["payload"]> = {}
  ): WorldAction {
    return {
      type: "world_action",
      payload: {
        actionType,
        ...options,
      },
      source: "user",
      timestamp: Date.now(),
      id: `world_${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static createQuestAction(
    actionType: QuestAction["payload"]["actionType"],
    questId: string,
    options: Partial<QuestAction["payload"]> = {}
  ): QuestAction {
    return {
      type: "quest_action",
      payload: {
        actionType,
        questId,
        ...options,
      },
      source: "user",
      timestamp: Date.now(),
      id: `quest_${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}
