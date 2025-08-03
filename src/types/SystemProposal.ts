import type { GameState } from "./GameState";
import type { Pet } from "./Pet";
import type { Item } from "./Item";

/**
 * Represents a proposed change to game state that can be validated and applied atomically
 */
export interface SystemProposal {
  /** Unique identifier for this proposal */
  id: string;
  /** System that generated this proposal */
  systemId: string;
  /** Human-readable description of the proposed change */
  description: string;
  /** Priority for conflict resolution (higher = more important) */
  priority: number;
  /** Proposed state changes */
  changes: StateChange[];
  /** Dependencies on other proposals */
  dependencies: string[];
}

/**
 * Individual state change within a proposal
 */
export interface StateChange {
  /** Type of state change */
  type: "pet_update" | "inventory_update" | "game_state_update" | "activity_log";
  /** Target entity identifier */
  target?: string;
  /** Specific property being changed */
  property?: string;
  /** Previous value (for rollback) */
  previousValue?: unknown;
  /** New value to apply */
  newValue?: unknown;
  /** Change operation type */
  operation: "set" | "add" | "subtract" | "multiply" | "push" | "remove" | "replace";
  /** Additional metadata for the change */
  metadata?: Record<string, unknown>;
}

/**
 * Result of validating a system proposal
 */
export interface ValidationResult {
  /** Whether the proposal is valid */
  isValid: boolean;
  /** Error messages if invalid */
  errors: string[];
  /** Warning messages (non-blocking) */
  warnings: string[];
  /** Conflicts with other proposals */
  conflicts: ProposalConflict[];
  /** Required modifications to make valid */
  requiredModifications?: StateChange[];
}

/**
 * Conflict between two proposals
 */
export interface ProposalConflict {
  /** ID of conflicting proposal */
  conflictingProposalId: string;
  /** Type of conflict */
  conflictType: "resource_contention" | "state_inconsistency" | "dependency_violation";
  /** Description of the conflict */
  description: string;
  /** Suggested resolution strategy */
  resolutionStrategy: "reject_lower_priority" | "merge_changes" | "sequence_execution" | "manual_review";
}

/**
 * Result of executing a collection of proposals
 */
export interface ExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Proposals that were successfully applied */
  appliedProposals: string[];
  /** Proposals that were rejected */
  rejectedProposals: string[];
  /** Final game state after execution */
  finalState: GameState;
  /** Execution errors */
  errors: string[];
  /** Activity log entries generated */
  activityEntries: ActivityLogEntry[];
}

/**
 * Activity log entry for state changes
 */
export interface ActivityLogEntry {
  /** Timestamp of the activity */
  timestamp: number;
  /** Type of activity */
  type: string;
  /** Description of what happened */
  description: string;
  /** Details about the activity */
  details?: Record<string, unknown>;
}

/**
 * Context provided to systems for generating proposals
 */
export interface ProposalContext {
  /** Current game state */
  currentState: GameState;
  /** Active pet */
  activePet: Pet;
  /** Available items in inventory */
  availableItems: Item[];
  /** Current timestamp */
  timestamp: number;
  /** Previous proposals in this transaction */
  existingProposals: SystemProposal[];
}

/**
 * Interface for systems that can generate proposals
 */
export interface ProposalGenerator {
  /** Generate proposals for a given action */
  generateProposals(action: unknown, context: ProposalContext): SystemProposal[];
  /** Validate a proposal against current state */
  validateProposal(proposal: SystemProposal, context: ProposalContext): ValidationResult;
  /** Check for conflicts with other proposals */
  checkConflicts(
    proposal: SystemProposal,
    otherProposals: SystemProposal[],
    context: ProposalContext
  ): ProposalConflict[];
}

/**
 * Factory for creating common proposal types
 */
export class ProposalFactory {
  private static proposalCounter = 0;

  static generateId(systemId: string): string {
    return `${systemId}_${Date.now()}_${++this.proposalCounter}`;
  }

  static createPetUpdateProposal(
    systemId: string,
    description: string,
    petUpdates: Partial<Pet>,
    priority: number = 100
  ): SystemProposal {
    const changes: StateChange[] = Object.entries(petUpdates).map(([property, newValue]) => ({
      type: "pet_update" as const,
      property,
      newValue,
      operation: "set" as const,
    }));

    return {
      id: this.generateId(systemId),
      systemId,
      description,
      priority,
      changes,
      dependencies: [],
    };
  }

  static createInventoryUpdateProposal(
    systemId: string,
    description: string,
    itemId: string,
    quantityChange: number,
    priority: number = 100
  ): SystemProposal {
    return {
      id: this.generateId(systemId),
      systemId,
      description,
      priority,
      changes: [
        {
          type: "inventory_update" as const,
          target: itemId,
          property: "quantity",
          newValue: Math.abs(quantityChange),
          operation: quantityChange > 0 ? "add" : "subtract",
        },
      ],
      dependencies: [],
    };
  }

  static createActivityLogProposal(
    systemId: string,
    description: string,
    activityType: string,
    activityDescription: string,
    details?: Record<string, unknown>,
    priority: number = 50
  ): SystemProposal {
    return {
      id: this.generateId(systemId),
      systemId,
      description,
      priority,
      changes: [
        {
          type: "activity_log" as const,
          newValue: {
            timestamp: Date.now(),
            type: activityType,
            description: activityDescription,
            details,
          },
          operation: "push" as const,
        },
      ],
      dependencies: [],
    };
  }

  static createGameStateUpdateProposal(
    systemId: string,
    description: string,
    updates: Record<string, unknown>,
    priority: number = 100
  ): SystemProposal {
    const changes: StateChange[] = Object.entries(updates).map(([property, newValue]) => ({
      type: "game_state_update" as const,
      property,
      newValue,
      operation: "set" as const,
    }));

    return {
      id: this.generateId(systemId),
      systemId,
      description,
      priority,
      changes,
      dependencies: [],
    };
  }
}

/**
 * Utility for working with proposals
 */
export class ProposalUtils {
  static hasConflicts(proposals: SystemProposal[]): boolean {
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
    for (const [, conflictingProposals] of targetMap) {
      if (conflictingProposals.length > 1) {
        // Multiple proposals targeting the same property
        const hasNonMergeableOperations = conflictingProposals.some(p =>
          p.changes.some(c => c.operation === "set" || c.operation === "replace")
        );
        if (hasNonMergeableOperations) {
          return true;
        }
      }
    }

    return false;
  }

  static sortByPriority(proposals: SystemProposal[]): SystemProposal[] {
    return [...proposals].sort((a, b) => b.priority - a.priority);
  }

  static resolveDependencies(proposals: SystemProposal[]): SystemProposal[] {
    const resolved: SystemProposal[] = [];
    const remaining = [...proposals];
    const resolvedIds = new Set<string>();

    while (remaining.length > 0) {
      const initialLength = remaining.length;

      for (let i = remaining.length - 1; i >= 0; i--) {
        const proposal = remaining[i];
        const allDependenciesResolved = proposal.dependencies.every(depId => resolvedIds.has(depId));

        if (allDependenciesResolved) {
          resolved.push(proposal);
          resolvedIds.add(proposal.id);
          remaining.splice(i, 1);
        }
      }

      // Prevent infinite loop if there are circular dependencies
      if (remaining.length === initialLength) {
        throw new Error("Circular dependency detected in proposals");
      }
    }

    return resolved;
  }
}
