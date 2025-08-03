import type { GameState, Pet, Quest, Result } from "@/types";
import type {
  UnifiedGameAction,
  PetCareAction,
  ItemAction,
  WorldAction,
  QuestAction,
  CompositeAction,
} from "@/types/UnifiedActions";
import type {
  SystemProposal,
  StateChange,
  ValidationResult,
  ProposalContext,
  ProposalGenerator,
  ActivityLogEntry,
} from "@/types/SystemProposal";
import { ProposalFactory, ProposalUtils } from "@/types/SystemProposal";
import { ActivityLogSystem } from "@/systems/ActivityLogSystem";
import { QuestSystem } from "@/systems/QuestSystem";
import { WorldSystem } from "@/systems/WorldSystem";
import { QUESTS } from "@/data/quests";
import { getItemById } from "@/data/items";

/**
 * Result of executing an action through ActionCoordinator
 */
interface ActionResult {
  success: boolean;
  gameState: GameState;
  proposals: SystemProposal[];
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive Action Validator for all action types
 */
class ActionValidator {
  /**
   * Validate any unified game action before processing
   */
  validateAction(action: UnifiedGameAction, gameState: GameState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic action structure
    if (!action.type || !action.payload) {
      errors.push("Invalid action structure: missing type or payload");
      return { isValid: false, errors, warnings, conflicts: [] };
    }

    // Validate specific action types
    switch (action.type) {
      case "pet_care":
        this.validatePetCareAction(action as PetCareAction, gameState, errors, warnings);
        break;
      case "item_operation":
        this.validateItemAction(action as ItemAction, gameState, errors, warnings);
        break;
      case "world_action":
        this.validateWorldAction(action as WorldAction, gameState, errors, warnings);
        break;
      case "quest_action":
        this.validateQuestAction(action as QuestAction, gameState, errors, warnings);
        break;
      case "composite_action":
        this.validateCompositeAction(action as CompositeAction, gameState, errors, warnings);
        break;
      default:
        errors.push(`Unknown action type: ${action.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  /**
   * Validate pet care actions
   */
  private validatePetCareAction(
    action: PetCareAction,
    gameState: GameState,
    errors: string[],
    warnings: string[]
  ): void {
    // Check if pet exists
    if (!gameState.currentPet) {
      errors.push("No active pet found for pet care action");
      return;
    }

    const pet = gameState.currentPet;

    // Check if pet is alive
    if (pet.life <= 0) {
      errors.push("Cannot perform pet care actions on deceased pet");
      return;
    }

    // Validate specific care types
    switch (action.payload.careType) {
      case "feed":
      case "drink":
      case "play": {
        // Validate item exists if specified
        if (action.payload.itemId) {
          const item = getItemById(action.payload.itemId);
          if (!item) {
            errors.push(`Item not found: ${action.payload.itemId}`);
          } else {
            // Check if player owns the item
            const inventorySlot = gameState.inventory.slots.find(slot => slot.item.id === action.payload.itemId);
            if (!inventorySlot || inventorySlot.quantity <= 0) {
              errors.push(`Item not in inventory or insufficient quantity: ${action.payload.itemId}`);
            }

            // Validate item type matches care type
            const hasRelevantEffect = item.effects.some(effect => {
              if (action.payload.careType === "feed" && effect.type === "satiety") return true;
              if (action.payload.careType === "drink" && effect.type === "hydration") return true;
              if (action.payload.careType === "play" && effect.type === "happiness") return true;
              return false;
            });

            if (!hasRelevantEffect) {
              warnings.push(`Item ${item.name} may not be suitable for ${action.payload.careType} action`);
            }
          }
        } else {
          errors.push(`${action.payload.careType} action requires an item`);
        }
        break;
      }

      case "clean": {
        // Check if pet needs cleaning
        if (pet.poopCount === 0) {
          warnings.push("Pet does not need cleaning");
        }
        break;
      }

      case "sleep": {
        // Check if pet can sleep
        if (pet.state === "sleeping") {
          errors.push("Pet is already sleeping");
        } else if (pet.state === "travelling") {
          errors.push("Pet cannot sleep while travelling");
        } else if (pet.currentEnergy >= pet.maxEnergy) {
          warnings.push("Pet is already at full energy");
        }
        break;
      }

      case "wake": {
        // Check if pet is actually sleeping
        if (pet.state !== "sleeping") {
          errors.push("Pet is not sleeping");
        }
        break;
      }

      default:
        errors.push(`Unknown pet care type: ${action.payload.careType}`);
    }
  }

  /**
   * Validate item operations
   */
  private validateItemAction(action: ItemAction, gameState: GameState, errors: string[], warnings: string[]): void {
    const { itemId, operation, quantity = 1 } = action.payload;

    // Validate item exists
    const item = getItemById(itemId);
    if (!item) {
      errors.push(`Item not found: ${itemId}`);
      return;
    }

    // Validate quantity
    if (quantity <= 0) {
      errors.push("Quantity must be positive");
      return;
    }

    switch (operation) {
      case "use": {
        // Check if player owns the item
        const inventorySlot = gameState.inventory.slots.find(slot => slot.item.id === itemId);
        if (!inventorySlot || inventorySlot.quantity < quantity) {
          errors.push(`Insufficient item quantity in inventory: ${itemId}`);
        }

        // Check if item is usable (basic validation)
        if (item.effects.length === 0) {
          warnings.push("This item has no effects when used");
        }
        break;
      }

      case "buy": {
        // Check if player has enough gold
        const cost = item.value * quantity;
        if (gameState.inventory.gold < cost) {
          errors.push(`Insufficient gold. Need ${cost}, have ${gameState.inventory.gold}`);
        }

        // Check inventory space
        const availableSlots = gameState.inventory.maxSlots - gameState.inventory.slots.length;
        if (availableSlots < 1 && !gameState.inventory.slots.some(slot => slot.item.id === itemId)) {
          errors.push("Insufficient inventory space");
        }
        break;
      }

      case "sell": {
        // Check if player owns the item
        const sellSlot = gameState.inventory.slots.find(slot => slot.item.id === itemId);
        if (!sellSlot || sellSlot.quantity < quantity) {
          errors.push(`Insufficient item quantity to sell: ${itemId}`);
        }

        // Check if item can be sold
        if (item.value === 0) {
          warnings.push("This item has no market value");
        }
        break;
      }

      default:
        errors.push(`Unknown item operation: ${operation}`);
    }
  }

  /**
   * Validate world actions
   */
  private validateWorldAction(action: WorldAction, gameState: GameState, errors: string[], warnings: string[]): void {
    const pet = gameState.currentPet;

    // Check if pet exists for world actions
    if (!pet) {
      errors.push("No active pet found for world action");
      return;
    }

    switch (action.payload.actionType) {
      case "travel": {
        // Validate destination
        if (!action.payload.destinationId) {
          errors.push("Travel action requires destination ID");
          return;
        }

        // Check if already traveling
        if (gameState.world.travelState) {
          errors.push("Pet is already traveling");
        }

        // Check if destination is different from current location
        if (action.payload.destinationId === gameState.world.currentLocationId) {
          errors.push("Already at destination location");
        }

        // Check pet state and energy
        if (pet.state !== "idle") {
          errors.push("Pet must be idle to start traveling");
        }
        if (pet.currentEnergy < 10) {
          errors.push("Pet needs more energy to travel");
        }
        if (pet.health === "sick") {
          warnings.push("Pet is sick but can still travel");
        }
        break;
      }

      case "activity": {
        // Validate activity ID
        if (!action.payload.activityId) {
          errors.push("Activity action requires activity ID");
          return;
        }

        // Check if already doing an activity
        if (gameState.world.activeActivities.length > 0) {
          errors.push("Pet is already engaged in an activity");
        }

        // Check pet state and energy
        if (pet.state === "travelling") {
          errors.push("Cannot start activity while traveling");
        }
        if (pet.state === "sleeping") {
          errors.push("Cannot start activity while pet is sleeping");
        }
        if (pet.currentEnergy < 15) {
          errors.push("Pet needs more energy for activities");
        }
        break;
      }

      case "cancel_activity": {
        // Check if there's an activity to cancel
        if (gameState.world.activeActivities.length === 0) {
          errors.push("No active activity to cancel");
        }
        break;
      }

      default:
        errors.push(`Unknown world action type: ${action.payload.actionType}`);
    }
  }

  /**
   * Validate quest actions
   */
  private validateQuestAction(action: QuestAction, gameState: GameState, errors: string[], _warnings: string[]): void {
    const { questId, actionType } = action.payload;

    if (!questId) {
      errors.push("Quest action requires quest ID");
      return;
    }

    // Find quest definition
    const quest = QUESTS.find((q: Quest) => q.id === questId);
    if (!quest) {
      errors.push(`Quest not found: ${questId}`);
      return;
    }

    switch (actionType) {
      case "start": {
        // Check if quest is already active
        const activeQuest = gameState.questLog.activeQuests.find(q => q.questId === questId);
        if (activeQuest) {
          errors.push("Quest is already active");
        }

        // Check if quest was already completed (basic check)
        const completedQuest = gameState.questLog.completedQuests.find(q => q === questId);
        if (completedQuest) {
          errors.push("Quest has already been completed");
        }
        break;
      }

      case "abandon": {
        // Check if quest is active
        const abandonQuest = gameState.questLog.activeQuests.find(q => q.questId === questId);
        if (!abandonQuest) {
          errors.push("Quest is not currently active");
        }
        break;
      }

      case "complete": {
        // Check if quest is active
        const completeQuest = gameState.questLog.activeQuests.find(q => q.questId === questId);
        if (!completeQuest) {
          errors.push("Quest is not currently active");
        }
        break;
      }

      default:
        errors.push(`Unknown quest action type: ${actionType}`);
    }
  }

  /**
   * Validate composite actions
   */
  private validateCompositeAction(
    action: CompositeAction,
    gameState: GameState,
    errors: string[],
    warnings: string[]
  ): void {
    if (!action.payload.actions || action.payload.actions.length === 0) {
      errors.push("Composite action requires at least one sub-action");
      return;
    }

    // Validate each sub-action
    for (let i = 0; i < action.payload.actions.length; i++) {
      const subAction = action.payload.actions[i];
      const subResult = this.validateAction(subAction, gameState);

      if (!subResult.isValid) {
        errors.push(`Sub-action ${i + 1} invalid: ${subResult.errors.join(", ")}`);
      }
      warnings.push(...subResult.warnings.map(w => `Sub-action ${i + 1}: ${w}`));
    }

    // Check for conflicts between sub-actions
    this.validateCompositeActionConflicts(action.payload.actions, errors, warnings);
  }

  /**
   * Check for conflicts between sub-actions in composite actions
   */
  private validateCompositeActionConflicts(actions: UnifiedGameAction[], _errors: string[], warnings: string[]): void {
    // Check for conflicting pet states
    const petStateChanges = actions.filter(
      a =>
        (a.type === "pet_care" && ["sleep", "wake"].includes((a as PetCareAction).payload.careType)) ||
        (a.type === "world_action" && ["travel", "activity"].includes((a as WorldAction).payload.actionType))
    );

    if (petStateChanges.length > 1) {
      warnings.push("Multiple actions may conflict with pet state changes");
    }

    // Check for conflicting item operations on the same item
    const itemActions = actions.filter(a => a.type === "item_operation") as ItemAction[];
    const itemUsage = new Map<string, number>();

    for (const action of itemActions) {
      const itemId = action.payload.itemId;
      const quantity = action.payload.quantity || 1;
      const current = itemUsage.get(itemId) || 0;

      if (action.payload.operation === "use" || action.payload.operation === "sell") {
        itemUsage.set(itemId, current + quantity);
      } else if (action.payload.operation === "buy") {
        itemUsage.set(itemId, current - quantity);
      }
    }

    for (const [itemId, totalUsage] of itemUsage) {
      if (totalUsage > 0) {
        warnings.push(`Composite action may use more ${itemId} than available`);
      }
    }
  }
}

/**
 * Central coordinator for unified action processing with atomic state management
 */
export class ActionCoordinator {
  private static proposalGenerators: Map<string, ProposalGenerator> = new Map();
  private static actionValidator = new ActionValidator();

  /**
   * Initialize proposal generators for different systems
   */
  private static initializeProposalGenerators(): void {
    if (this.proposalGenerators.size === 0) {
      this.proposalGenerators.set("pet_system", new PetSystemProposalGenerator());
      this.proposalGenerators.set("item_system", new ItemSystemProposalGenerator());
      this.proposalGenerators.set("world_system", new WorldSystemProposalGenerator());
      this.proposalGenerators.set("quest_system", new QuestSystemProposalGenerator());
    }
  }

  /**
   * Main entry point for all game actions (matches documentation)
   */
  static async dispatchAction(gameState: GameState, action: UnifiedGameAction): Promise<Result<ActionResult>> {
    this.initializeProposalGenerators();
    try {
      // Pre-validate the action before processing
      const actionValidation = this.actionValidator.validateAction(action, gameState);
      if (!actionValidation.isValid) {
        return {
          success: false,
          error: `Action validation failed: ${actionValidation.errors.join(", ")}`,
        };
      }

      // Create proposal context
      const context = this.createProposalContext(gameState);

      // Generate proposals from relevant systems
      const proposals = this.generateProposals(action, context);

      // Validate all proposals
      const validationResult = this.validateProposedChanges(gameState, proposals);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Resolve conflicts and dependencies
      const resolvedProposals = this.resolveProposals(proposals);

      // Execute proposals atomically
      const newGameState = this.commitChanges(gameState, resolvedProposals);

      return {
        success: true,
        data: {
          success: true,
          gameState: newGameState,
          proposals: resolvedProposals,
          errors: [],
          warnings: [...actionValidation.warnings, ...(validationResult.data?.warnings || [])],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate all proposed changes before committing (matches documentation)
   */
  static validateProposedChanges(gameState: GameState, proposals: SystemProposal[]): Result<{ warnings?: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate each proposal individually
    for (const proposal of proposals) {
      const generator = this.proposalGenerators.get(proposal.systemId);
      if (generator) {
        try {
          const validationResult = generator.validateProposal(proposal, this.createProposalContext(gameState));
          if (!validationResult.isValid) {
            errors.push(...validationResult.errors);
          }
          warnings.push(...validationResult.warnings);
        } catch (error) {
          errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        errors.push(`No validator found for system: ${proposal.systemId}`);
      }
    }

    // 2. Check dependencies are satisfied
    const dependencyErrors = this.validateDependencies(proposals);
    errors.push(...dependencyErrors);

    // 3. Check for conflicting changes
    const conflictErrors = this.validateConflicts(proposals);
    errors.push(...conflictErrors);

    if (errors.length > 0) {
      return { success: false, error: errors.join("; ") };
    }

    return { success: true, data: { warnings } };
  }

  /**
   * Atomically commit all validated changes (matches documentation)
   */
  static commitChanges(gameState: GameState, proposals: SystemProposal[]): GameState {
    let newState = { ...gameState };

    // Sort proposals by dependencies
    const sortedProposals = this.sortByDependencies(proposals);

    // Apply changes in dependency order
    for (const proposal of sortedProposals) {
      newState = this.applyProposal(newState, proposal);
    }

    return newState;
  }

  /**
   * Create proposal context for systems
   */
  private static createProposalContext(gameState: GameState): ProposalContext {
    return {
      currentState: gameState,
      activePet: gameState.currentPet || ({} as Pet),
      availableItems: gameState.inventory.slots.map(slot => slot.item),
      timestamp: Date.now(),
      existingProposals: [],
    };
  }

  /**
   * Generate proposals from relevant systems
   */
  private static generateProposals(action: UnifiedGameAction, context: ProposalContext): SystemProposal[] {
    const proposals: SystemProposal[] = [];

    // Determine which systems should handle this action
    const relevantSystems = this.getRelevantSystems(action);

    for (const systemId of relevantSystems) {
      const generator = this.proposalGenerators.get(systemId);
      if (generator) {
        try {
          const systemProposals = generator.generateProposals(action, context);
          proposals.push(...systemProposals);
        } catch (error) {
          console.error(`Error generating proposals from ${systemId}:`, error);
        }
      }
    }

    return proposals;
  }

  /**
   * Determine which systems are relevant for an action
   */
  private static getRelevantSystems(action: UnifiedGameAction): string[] {
    const systems: string[] = [];

    switch (action.type) {
      case "pet_care":
        systems.push("pet_system");
        if ((action as PetCareAction).payload.itemId) {
          systems.push("item_system");
        }
        systems.push("quest_system"); // For quest progression
        break;

      case "item_operation":
        systems.push("item_system");
        if ((action as ItemAction).payload.operation === "use") {
          systems.push("pet_system");
        }
        systems.push("quest_system"); // For quest progression
        break;

      case "world_action":
        systems.push("world_system");
        systems.push("quest_system"); // For quest progression
        break;

      case "quest_action":
        systems.push("quest_system");
        break;

      case "composite_action": {
        // Composite actions may involve multiple systems
        const compositeAction = action as CompositeAction;
        for (const subAction of compositeAction.payload.actions) {
          systems.push(...this.getRelevantSystems(subAction));
        }
        break;
      }
    }

    // Always include activity log system for action tracking
    systems.push("activity_log_system");

    return [...new Set(systems)]; // Remove duplicates
  }

  /**
   * Resolve conflicts and dependencies between proposals
   */
  private static resolveProposals(proposals: SystemProposal[]): SystemProposal[] {
    // Check for conflicts
    if (ProposalUtils.hasConflicts(proposals)) {
      // Sort by priority and resolve conflicts
      const sortedProposals = ProposalUtils.sortByPriority(proposals);
      return this.resolveConflicts(sortedProposals);
    }

    // Resolve dependencies
    try {
      return ProposalUtils.resolveDependencies(proposals);
    } catch (error) {
      console.error("Failed to resolve dependencies:", error);
      return proposals; // Return as-is if dependency resolution fails
    }
  }

  /**
   * Resolve conflicts between proposals
   */
  private static resolveConflicts(sortedProposals: SystemProposal[]): SystemProposal[] {
    const resolved: SystemProposal[] = [];
    const targetMap = new Map<string, SystemProposal>();

    for (const proposal of sortedProposals) {
      let hasConflict = false;

      for (const change of proposal.changes) {
        const key = `${change.type}:${change.target || "global"}:${change.property || "*"}`;
        const existingProposal = targetMap.get(key);

        if (existingProposal && (change.operation === "set" || change.operation === "replace")) {
          // Conflict detected - higher priority proposal wins
          console.warn(`Conflict resolved: ${proposal.id} takes precedence over ${existingProposal.id}`);
          hasConflict = true;
          break;
        }

        targetMap.set(key, proposal);
      }

      if (!hasConflict) {
        resolved.push(proposal);
      }
    }

    return resolved;
  }

  /**
   * Apply a single proposal to game state
   */
  private static applyProposal(gameState: GameState, proposal: SystemProposal): GameState {
    let newState = { ...gameState };

    for (const change of proposal.changes) {
      newState = this.applyStateChange(change, newState);
    }

    return newState;
  }

  /**
   * Apply a single state change
   */
  private static applyStateChange(change: StateChange, gameState: GameState): GameState {
    let newState = { ...gameState };
    switch (change.type) {
      case "pet_update":
        if (newState.currentPet && change.property) {
          const currentValue = (newState.currentPet as unknown as Record<string, unknown>)[change.property];

          switch (change.operation) {
            case "set":
              (newState.currentPet as unknown as Record<string, unknown>)[change.property] = change.newValue;
              break;
            case "add":
              (newState.currentPet as unknown as Record<string, unknown>)[change.property] =
                (currentValue as number) + (change.newValue as number);
              break;
            case "subtract":
              (newState.currentPet as unknown as Record<string, unknown>)[change.property] =
                (currentValue as number) - (change.newValue as number);
              break;
          }
        }
        break;

      case "inventory_update":
        if (change.target && change.property === "quantity") {
          const slotIndex = newState.inventory.slots.findIndex(slot => slot.item.id === change.target);

          if (slotIndex !== -1) {
            // Item exists in inventory
            const slot = newState.inventory.slots[slotIndex];
            switch (change.operation) {
              case "add":
                newState.inventory.slots[slotIndex] = {
                  ...slot,
                  quantity: slot.quantity + (change.newValue as number),
                };
                break;
              case "subtract": {
                const newQuantity = slot.quantity - (change.newValue as number);
                if (newQuantity <= 0) {
                  // Remove the slot entirely
                  newState.inventory.slots = newState.inventory.slots.filter((_, i) => i !== slotIndex);
                } else {
                  newState.inventory.slots[slotIndex] = {
                    ...slot,
                    quantity: newQuantity,
                  };
                }
                break;
              }
            }
          } else if (change.operation === "add") {
            // Item doesn't exist, need to add it
            const item = getItemById(change.target);
            if (item) {
              // Create new inventory slot
              const newSlot = {
                item: { ...item },
                quantity: change.newValue as number,
                slotIndex: newState.inventory.slots.length,
              };
              newState.inventory.slots.push(newSlot);
            }
          }
        }
        break;

      case "game_state_update":
        if (change.property) {
          // Handle nested property paths
          const propertyPath = change.property.split(".");
          let target: Record<string, unknown> = newState as Record<string, unknown>;

          // Navigate to the parent object
          for (let i = 0; i < propertyPath.length - 1; i++) {
            if (target[propertyPath[i]] === undefined) {
              target[propertyPath[i]] = {};
            }
            target = target[propertyPath[i]] as Record<string, unknown>;
          }

          const finalProperty = propertyPath[propertyPath.length - 1];
          const currentValue = target[finalProperty];

          switch (change.operation) {
            case "set":
              target[finalProperty] = change.newValue;
              break;
            case "add":
              target[finalProperty] = (currentValue as number) + (change.newValue as number);
              break;
            case "subtract":
              target[finalProperty] = (currentValue as number) - (change.newValue as number);
              break;
            case "push":
              if (Array.isArray(target[finalProperty])) {
                (target[finalProperty] as unknown[]).push(change.newValue);
              } else {
                target[finalProperty] = [change.newValue];
              }
              break;
            case "replace":
              target[finalProperty] = change.newValue;
              break;
          }
        }
        break;

      case "activity_log":
        if (change.operation === "push" && change.newValue) {
          ActivityLogSystem.addLogEntry(newState, {
            activityId: (change.newValue as ActivityLogEntry).type,
            locationId: newState.world.currentLocationId,
            startTime: (change.newValue as ActivityLogEntry).timestamp,
            endTime: (change.newValue as ActivityLogEntry).timestamp,
            status: "completed",
            energyCost: 0,
            results: [
              {
                type: "none",
                amount: 0,
                description: (change.newValue as ActivityLogEntry).description,
              },
            ],
          });
        }
        break;
    }

    return newState;
  }

  /**
   * Validate dependencies between proposals
   */
  private static validateDependencies(proposals: SystemProposal[]): string[] {
    const errors: string[] = [];
    const proposalIds = new Set(proposals.map(p => p.id));

    for (const proposal of proposals) {
      for (const depId of proposal.dependencies) {
        if (!proposalIds.has(depId)) {
          errors.push(`Proposal ${proposal.id} depends on missing proposal ${depId}`);
        }
      }
    }

    return errors;
  }

  /**
   * Validate conflicts between proposals
   */
  private static validateConflicts(proposals: SystemProposal[]): string[] {
    const errors: string[] = [];
    const targetMap = new Map<string, SystemProposal[]>();

    // Group proposals by their targets
    for (const proposal of proposals) {
      for (const change of proposal.changes) {
        const key = `${change.type}:${change.target || "global"}:${change.property || "*"}`;
        if (!targetMap.has(key)) {
          targetMap.set(key, []);
        }
        targetMap.get(key)!.push(proposal);
      }
    }

    // Check for conflicts
    for (const [target, conflictingProposals] of targetMap) {
      if (conflictingProposals.length > 1) {
        const hasNonMergeableOperations = conflictingProposals.some(p =>
          p.changes.some(c => c.operation === "set" || c.operation === "replace")
        );
        if (hasNonMergeableOperations) {
          errors.push(`Conflicting proposals for ${target}: ${conflictingProposals.map(p => p.id).join(", ")}`);
        }
      }
    }

    return errors;
  }

  /**
   * Sort proposals by dependencies
   */
  private static sortByDependencies(proposals: SystemProposal[]): SystemProposal[] {
    return ProposalUtils.resolveDependencies(proposals);
  }
}

/**
 * Pet System Proposal Generator
 */
class PetSystemProposalGenerator implements ProposalGenerator {
  generateProposals(action: unknown, context: ProposalContext): SystemProposal[] {
    const petCareAction = action as PetCareAction;
    if (petCareAction.type !== "pet_care") return [];

    const proposals: SystemProposal[] = [];

    switch (petCareAction.payload.careType) {
      case "feed":
        if (petCareAction.payload.itemId) {
          const item = getItemById(petCareAction.payload.itemId);
          if (item) {
            const satietyEffect = item.effects.find(e => e.type === "satiety");
            if (satietyEffect) {
              proposals.push(
                ProposalFactory.createPetUpdateProposal(
                  "pet_system",
                  `Feed pet with ${item.name}`,
                  { satietyTicksLeft: context.activePet.satietyTicksLeft + satietyEffect.value * 50 },
                  100
                )
              );
            }
          }
        }
        break;

      case "drink":
        if (petCareAction.payload.itemId) {
          const item = getItemById(petCareAction.payload.itemId);
          if (item) {
            const hydrationEffect = item.effects.find(e => e.type === "hydration");
            if (hydrationEffect) {
              proposals.push(
                ProposalFactory.createPetUpdateProposal(
                  "pet_system",
                  `Give drink to pet with ${item.name}`,
                  { hydrationTicksLeft: context.activePet.hydrationTicksLeft + hydrationEffect.value * 40 },
                  100
                )
              );
            }
          }
        }
        break;

      case "play":
        if (petCareAction.payload.itemId) {
          const item = getItemById(petCareAction.payload.itemId);
          if (item) {
            const happinessEffect = item.effects.find(e => e.type === "happiness");
            if (happinessEffect) {
              proposals.push(
                ProposalFactory.createPetUpdateProposal(
                  "pet_system",
                  `Play with pet using ${item.name}`,
                  {
                    happinessTicksLeft: context.activePet.happinessTicksLeft + happinessEffect.value * 60,
                    currentEnergy: Math.max(0, context.activePet.currentEnergy - 10),
                  },
                  100
                )
              );
            }
          }
        }
        break;

      case "clean":
        proposals.push(
          ProposalFactory.createPetUpdateProposal(
            "pet_system",
            "Clean pet",
            {
              poopCount: 0,
              poopTicksLeft: Math.floor(Math.random() * 240) + 240,
              sickByPoopTicksLeft: 17280,
            },
            100
          )
        );
        break;

      case "sleep":
        proposals.push(
          ProposalFactory.createPetUpdateProposal("pet_system", "Put pet to sleep", { state: "sleeping" }, 100)
        );
        break;

      case "wake":
        proposals.push(ProposalFactory.createPetUpdateProposal("pet_system", "Wake pet up", { state: "idle" }, 100));
        break;
    }

    return proposals;
  }

  validateProposal(_proposal: SystemProposal, context: ProposalContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate pet exists
    if (!context.activePet || !context.activePet.id) {
      errors.push("No active pet found");
    }

    // Validate pet is not dead
    if (context.activePet && context.activePet.life <= 0) {
      errors.push("Cannot perform actions on deceased pet");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  checkConflicts(
    _proposal: SystemProposal,
    _otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    return []; // Basic implementation - no conflicts for now
  }
}

/**
 * Item System Proposal Generator
 */
class ItemSystemProposalGenerator implements ProposalGenerator {
  generateProposals(action: unknown, _context: ProposalContext): SystemProposal[] {
    const itemAction = action as ItemAction;
    if (itemAction.type !== "item_operation") return [];

    const proposals: SystemProposal[] = [];

    switch (itemAction.payload.operation) {
      case "use":
        proposals.push(
          ProposalFactory.createInventoryUpdateProposal(
            "item_system",
            `Use item ${itemAction.payload.itemId}`,
            itemAction.payload.itemId,
            -1, // Remove one item
            100
          )
        );
        break;

      case "buy":
        {
          const item = getItemById(itemAction.payload.itemId);
          if (item) {
            const cost = item.value * itemAction.payload.quantity;
            proposals.push({
              id: ProposalFactory.generateId("item_system"),
              systemId: "item_system",
              description: `Deduct ${cost} gold for purchase`,
              priority: 100,
              changes: [
                {
                  type: "game_state_update" as const,
                  property: "inventory.gold",
                  newValue: cost,
                  operation: "subtract" as const,
                },
              ],
              dependencies: [],
            });
            proposals.push(
              ProposalFactory.createInventoryUpdateProposal(
                "item_system",
                `Add purchased items to inventory`,
                itemAction.payload.itemId,
                itemAction.payload.quantity,
                100
              )
            );
          }
        }
        break;

      case "sell":
        {
          const item = getItemById(itemAction.payload.itemId);
          if (item) {
            const value = Math.floor(item.value * 0.5) * itemAction.payload.quantity;
            proposals.push(
              ProposalFactory.createInventoryUpdateProposal(
                "item_system",
                `Sell ${itemAction.payload.quantity}x ${item.name}`,
                itemAction.payload.itemId,
                -itemAction.payload.quantity,
                100
              )
            );
            proposals.push({
              id: ProposalFactory.generateId("item_system"),
              systemId: "item_system",
              description: `Add ${value} gold from sale`,
              priority: 100,
              changes: [
                {
                  type: "game_state_update" as const,
                  property: "inventory.gold",
                  newValue: value,
                  operation: "add" as const,
                },
              ],
              dependencies: [],
            });
          }
        }
        break;
    }

    return proposals;
  }

  validateProposal(_proposal: SystemProposal, _context: ProposalContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Add inventory-specific validations here
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  checkConflicts(
    _proposal: SystemProposal,
    _otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    return [];
  }
}

/**
 * World System Proposal Generator
 */
class WorldSystemProposalGenerator implements ProposalGenerator {
  generateProposals(action: unknown, context: ProposalContext): SystemProposal[] {
    const worldAction = action as WorldAction;
    if (worldAction.type !== "world_action") return [];

    const proposals: SystemProposal[] = [];

    switch (worldAction.payload.actionType) {
      case "travel":
        if (worldAction.payload.destinationId) {
          // Use WorldSystem to start travel and get the proper data
          const travelResult = WorldSystem.startTravel(
            context.currentState.world,
            context.activePet,
            worldAction.payload.destinationId
          );

          if (travelResult.success && travelResult.data) {
            const { worldState, pet } = travelResult.data;
            proposals.push({
              id: ProposalFactory.generateId("world_system"),
              systemId: "world_system",
              description: `Start travel to ${worldAction.payload.destinationId}`,
              priority: 100,
              changes: [
                {
                  type: "game_state_update" as const,
                  property: "world.travelState",
                  newValue: worldState.travelState,
                  operation: "set" as const,
                },
                {
                  type: "pet_update" as const,
                  property: "state",
                  newValue: pet.state,
                  operation: "set" as const,
                },
                {
                  type: "pet_update" as const,
                  property: "currentEnergy",
                  newValue: pet.currentEnergy,
                  operation: "set" as const,
                },
              ],
              dependencies: [],
            });

            // Log travel start
            proposals.push(
              ProposalFactory.createActivityLogProposal(
                "world_system",
                "Travel started",
                "travel_started",
                travelResult.message || `Started traveling to ${worldAction.payload.destinationId}`,
                {
                  destinationId: worldAction.payload.destinationId,
                  travelTime: worldState.travelState?.ticksRemaining || 0,
                },
                50
              )
            );
          }
        }
        break;

      case "activity":
        if (worldAction.payload.activityId) {
          // Start activity using WorldSystem
          const activityResult = WorldSystem.startActivity(context.currentState, worldAction.payload.activityId);

          if (activityResult.success && activityResult.data) {
            proposals.push({
              id: ProposalFactory.generateId("world_system"),
              systemId: "world_system",
              description: `Start activity ${worldAction.payload.activityId}`,
              priority: 100,
              changes: [
                {
                  type: "game_state_update" as const,
                  property: "world.activeActivities",
                  newValue: activityResult.data.worldState.activeActivities,
                  operation: "set" as const,
                },
                {
                  type: "pet_update" as const,
                  property: "state",
                  newValue: activityResult.data.pet.state,
                  operation: "set" as const,
                },
                {
                  type: "pet_update" as const,
                  property: "currentEnergy",
                  newValue: activityResult.data.pet.currentEnergy,
                  operation: "set" as const,
                },
              ],
              dependencies: [],
            });

            // Log activity start
            proposals.push(
              ProposalFactory.createActivityLogProposal(
                "world_system",
                "Activity started",
                "activity_started",
                `Started activity: ${worldAction.payload.activityId}`,
                { activityId: worldAction.payload.activityId },
                50
              )
            );
          }
        }
        break;

      case "cancel_activity":
        proposals.push({
          id: ProposalFactory.generateId("world_system"),
          systemId: "world_system",
          description: "Cancel current activity",
          priority: 100,
          changes: [
            {
              type: "game_state_update" as const,
              property: "world.activeActivities",
              newValue: [],
              operation: "set" as const,
            },
            {
              type: "pet_update" as const,
              property: "state",
              newValue: "idle",
              operation: "set" as const,
            },
          ],
          dependencies: [],
        });

        // Log activity cancellation
        proposals.push(
          ProposalFactory.createActivityLogProposal(
            "world_system",
            "Activity cancelled",
            "activity_cancelled",
            "Cancelled current activity",
            {},
            50
          )
        );
        break;
    }

    return proposals;
  }

  validateProposal(proposal: SystemProposal, context: ProposalContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract action type from proposal description
    const description = proposal.description.toLowerCase();

    if (description.includes("travel")) {
      // Validate travel requirements
      if (!context.activePet) {
        errors.push("No active pet found for travel");
      } else {
        if (context.activePet.currentEnergy < 10) {
          errors.push("Pet needs more energy to travel");
        }
        if (context.activePet.state !== "idle") {
          errors.push("Pet must be idle to start traveling");
        }
        if (context.activePet.health === "sick") {
          warnings.push("Pet is sick but can still travel");
        }
      }

      // Check if already traveling
      if (context.currentState.world.travelState) {
        errors.push("Pet is already traveling");
      }
    }

    if (description.includes("activity")) {
      // Validate activity requirements
      if (!context.activePet) {
        errors.push("No active pet found for activity");
      } else {
        if (context.activePet.currentEnergy < 15) {
          errors.push("Pet needs more energy for activities");
        }
        if (context.activePet.state === "travelling") {
          errors.push("Cannot start activity while traveling");
        }
        if (context.activePet.state === "sleeping") {
          errors.push("Cannot start activity while pet is sleeping");
        }
      }

      // Check if already doing an activity
      if (context.currentState.world.activeActivities.length > 0) {
        errors.push("Pet is already engaged in an activity");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  checkConflicts(
    proposal: SystemProposal,
    otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    const conflicts: import("@/types/SystemProposal").ProposalConflict[] = [];

    // Check for conflicting world state changes
    const worldStateChanges = proposal.changes.filter(
      c => c.property?.startsWith("world.") || c.type === "game_state_update"
    );

    for (const otherProposal of otherProposals) {
      if (otherProposal.id === proposal.id) continue;

      const otherWorldChanges = otherProposal.changes.filter(
        c => c.property?.startsWith("world.") || c.type === "game_state_update"
      );

      if (worldStateChanges.length > 0 && otherWorldChanges.length > 0) {
        conflicts.push({
          conflictingProposalId: otherProposal.id,
          conflictType: "state_inconsistency",
          description: "Conflicting world state changes",
          resolutionStrategy: "reject_lower_priority",
        });
      }
    }

    return conflicts;
  }
}

/**
 * Quest System Proposal Generator
 */
class QuestSystemProposalGenerator implements ProposalGenerator {
  generateProposals(action: unknown, context: ProposalContext): SystemProposal[] {
    const proposals: SystemProposal[] = [];

    // Handle direct quest actions
    const typedAction = action as UnifiedGameAction;
    if (typedAction.type === "quest_action") {
      const questAction = action as QuestAction;
      proposals.push(...this.generateDirectQuestActionProposals(questAction, context));
      return proposals;
    }

    // Generate proposals for quest progression monitoring
    // This monitors all actions and updates quest progress automatically
    proposals.push(...this.generateQuestProgressionProposals(action, context));

    return proposals;
  }

  /**
   * Generate proposals for direct quest actions (start, abandon, complete)
   */
  private generateDirectQuestActionProposals(questAction: QuestAction, context: ProposalContext): SystemProposal[] {
    const proposals: SystemProposal[] = [];
    const questId = questAction.payload.questId;

    if (!questId) return proposals;

    switch (questAction.payload.actionType) {
      case "start": {
        // Get quest definition
        const quest = QUESTS.find((q: Quest) => q.id === questId);
        if (!quest) break;

        // Create proposal to add quest to active quests
        proposals.push({
          id: ProposalFactory.generateId("quest_system"),
          systemId: "quest_system",
          description: `Start quest: ${questId}`,
          priority: 100,
          changes: [
            {
              type: "game_state_update" as const,
              property: "questLog.activeQuests",
              newValue: [
                ...context.currentState.questLog.activeQuests,
                {
                  questId,
                  status: "active" as const,
                  progress: {},
                  startTime: Date.now(),
                },
              ],
              operation: "set" as const,
            },
          ],
          dependencies: [],
        });

        // Log quest start
        proposals.push(
          ProposalFactory.createActivityLogProposal(
            "quest_system",
            "Quest started",
            "quest_started",
            `Started quest: ${quest.name}`,
            { questId, questTitle: quest.name },
            50
          )
        );
        break;
      }

      case "abandon": {
        // Create proposal to remove quest from active quests
        const updatedActiveQuests = context.currentState.questLog.activeQuests.filter(q => q.questId !== questId);

        proposals.push({
          id: ProposalFactory.generateId("quest_system"),
          systemId: "quest_system",
          description: `Abandon quest: ${questId}`,
          priority: 100,
          changes: [
            {
              type: "game_state_update" as const,
              property: "questLog.activeQuests",
              newValue: updatedActiveQuests,
              operation: "set" as const,
            },
          ],
          dependencies: [],
        });

        // Log quest abandonment
        proposals.push(
          ProposalFactory.createActivityLogProposal(
            "quest_system",
            "Quest abandoned",
            "quest_abandoned",
            `Abandoned quest: ${questId}`,
            { questId },
            50
          )
        );
        break;
      }

      case "complete": {
        // Get quest definition for rewards
        const quest = QUESTS.find((q: Quest) => q.id === questId);
        if (!quest) break;

        // Create proposal to move quest from active to completed
        const updatedActiveQuests = context.currentState.questLog.activeQuests.filter(q => q.questId !== questId);
        const completedQuest = {
          questId,
          completedTime: Date.now(),
          rewards: quest.rewards || [],
        };

        proposals.push({
          id: ProposalFactory.generateId("quest_system"),
          systemId: "quest_system",
          description: `Complete quest: ${questId}`,
          priority: 100,
          changes: [
            {
              type: "game_state_update" as const,
              property: "questLog.activeQuests",
              newValue: updatedActiveQuests,
              operation: "set" as const,
            },
            {
              type: "game_state_update" as const,
              property: "questLog.completedQuests",
              newValue: [...context.currentState.questLog.completedQuests, completedQuest],
              operation: "set" as const,
            },
          ],
          dependencies: [],
        });

        // Create proposals for quest rewards
        if (quest.rewards) {
          for (const reward of quest.rewards) {
            switch (reward.type) {
              case "gold":
                proposals.push({
                  id: ProposalFactory.generateId("quest_system"),
                  systemId: "quest_system",
                  description: `Quest reward: ${reward.amount} gold`,
                  priority: 90,
                  changes: [
                    {
                      type: "game_state_update" as const,
                      property: "inventory.gold",
                      newValue: reward.amount,
                      operation: "add" as const,
                    },
                  ],
                  dependencies: [],
                });
                break;

              case "item":
                if (reward.itemId) {
                  proposals.push(
                    ProposalFactory.createInventoryUpdateProposal(
                      "quest_system",
                      `Quest reward: ${reward.itemId} x${reward.amount}`,
                      reward.itemId,
                      reward.amount,
                      90
                    )
                  );
                }
                break;
            }
          }
        }

        // Log quest completion with rewards
        proposals.push(
          ProposalFactory.createActivityLogProposal(
            "quest_system",
            "Quest completed",
            "quest_completed",
            `Completed quest: ${quest.name}`,
            { questId, questTitle: quest.name, rewards: quest.rewards },
            50
          )
        );
        break;
      }
    }

    return proposals;
  }

  private generateQuestProgressionProposals(action: unknown, context: ProposalContext): SystemProposal[] {
    const proposals: SystemProposal[] = [];
    const gameState = context.currentState;
    const questLog = gameState.questLog;

    if (!questLog || questLog.activeQuests.length === 0) {
      return proposals;
    }

    // Convert action to quest system format
    const { actionType, actionData } = this.convertActionToQuestFormat(action);
    if (!actionType) return proposals;

    // Process quest progression using existing QuestSystem logic
    try {
      const questEvents = QuestSystem.processGameAction(actionType, actionData, QUESTS, gameState);

      for (const event of questEvents) {
        if (event.type === "objective_completed") {
          // Create proposal for objective completion logging
          proposals.push(
            ProposalFactory.createActivityLogProposal(
              "quest_system",
              "Objective completed",
              "objective_completed",
              `Completed objective in quest: ${event.questId}`,
              { questId: event.questId, objectiveId: event.objectiveId },
              50
            )
          );
        } else if (event.type === "quest_completed") {
          // Create proposal for quest completion logging
          proposals.push(
            ProposalFactory.createActivityLogProposal(
              "quest_system",
              "Quest completed",
              "quest_completed",
              `Completed quest: ${event.questId}`,
              { questId: event.questId, rewards: event.data?.rewards },
              50
            )
          );
        }
      }
    } catch (error) {
      console.error("Error processing quest progression:", error);
    }

    return proposals;
  }

  private convertActionToQuestFormat(action: unknown): {
    actionType: string;
    actionData: Record<string, string | number | boolean>;
  } {
    const actionData: Record<string, string | number | boolean> = {};
    let actionType = "";

    // Convert different action types to quest system format
    const typedAction = action as UnifiedGameAction;
    switch (typedAction?.type) {
      case "pet_care": {
        const petCareAction = action as PetCareAction;
        actionType = "pet_care";
        actionData.action = petCareAction.payload.careType;
        if (petCareAction.payload.itemId) {
          actionData.itemId = petCareAction.payload.itemId;
        }
        break;
      }

      case "item_operation": {
        const itemAction = action as ItemAction;
        actionData.itemId = itemAction.payload.itemId;
        actionData.amount = itemAction.payload.quantity || 1;

        switch (itemAction.payload.operation) {
          case "use":
            actionType = "item_obtained";
            break;
          case "buy":
            actionType = "item_obtained";
            break;
          case "sell":
            actionType = "item_sold";
            break;
          default:
            actionType = "item_obtained";
        }
        break;
      }

      case "world_action": {
        const worldAction = action as WorldAction;
        switch (worldAction.payload.actionType) {
          case "travel":
            if (worldAction.payload.destinationId) {
              actionType = "location_visited";
              actionData.locationId = worldAction.payload.destinationId;
            }
            break;
          case "activity":
            if (worldAction.payload.activityId) {
              actionType = "activity_completed";
              actionData.activityId = worldAction.payload.activityId;
            }
            break;
        }
        break;
      }

      case "quest_action": {
        const questAction = action as QuestAction;
        switch (questAction.payload.actionType) {
          case "complete":
            actionType = "quest_completed";
            actionData.questId = questAction.payload.questId || "";
            break;
        }
        break;
      }
    }
    return { actionType, actionData };
  }

  validateProposal(_proposal: SystemProposal, _context: ProposalContext): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      conflicts: [],
    };
  }

  checkConflicts(
    _proposal: SystemProposal,
    _otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    return [];
  }
}
