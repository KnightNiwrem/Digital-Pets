// Activity Log System for tracking player activity history

import type { GameState } from "@/types/GameState";
import type { ActivityLogEntry, ActivityLogResult } from "@/types/World";

export class ActivityLogSystem {
  private static readonly MAX_LOG_ENTRIES = 100;

  /**
   * Add a new activity log entry to the game state
   * Maintains maximum of 100 entries (removes oldest)
   */
  static addLogEntry(
    gameState: GameState,
    entry: Omit<ActivityLogEntry, 'id'>
  ): void {
    // Generate unique ID for the entry
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newEntry: ActivityLogEntry = {
      ...entry,
      id,
    };

    // Add entry to beginning of array (newest first)
    gameState.activityLog.unshift(newEntry);

    // Maintain maximum entries (remove oldest)
    if (gameState.activityLog.length > this.MAX_LOG_ENTRIES) {
      gameState.activityLog = gameState.activityLog.slice(0, this.MAX_LOG_ENTRIES);
    }

    // Ensure log is sorted by start time (newest first)
    gameState.activityLog.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Update an existing log entry by ID
   */
  static updateLogEntry(
    gameState: GameState,
    entryId: string,
    updates: Partial<ActivityLogEntry>
  ): void {
    const entryIndex = gameState.activityLog.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
      console.warn(`ActivityLogSystem: Entry with ID ${entryId} not found`);
      return;
    }

    // Update the entry
    gameState.activityLog[entryIndex] = {
      ...gameState.activityLog[entryIndex],
      ...updates,
    };
  }

  /**
   * Get activity log entries with optional limit
   */
  static getLogEntries(
    gameState: GameState,
    limit?: number
  ): ActivityLogEntry[] {
    const entries = gameState.activityLog || [];
    
    if (limit && limit > 0) {
      return entries.slice(0, limit);
    }
    
    return entries;
  }

  /**
   * Find a log entry by activity and start time (for completion tracking)
   */
  static findLogEntryByActivity(
    gameState: GameState,
    activityId: string,
    locationId: string,
    startTime: number
  ): ActivityLogEntry | undefined {
    return gameState.activityLog.find(entry => 
      entry.activityId === activityId &&
      entry.locationId === locationId &&
      entry.startTime === startTime &&
      entry.status === "started"
    );
  }

  /**
   * Create an activity log result from reward data
   */
  static createLogResult(
    type: "item" | "gold" | "experience" | "none",
    amount?: number,
    itemId?: string,
    description?: string
  ): ActivityLogResult {
    let resultDescription = description;
    
    if (!resultDescription) {
      switch (type) {
        case "item":
          resultDescription = itemId ? `Found ${itemId} x${amount || 1}` : `Found item x${amount || 1}`;
          break;
        case "gold":
          resultDescription = `Earned ${amount || 0} gold`;
          break;
        case "experience":
          resultDescription = `Gained ${amount || 0} experience`;
          break;
        case "none":
          resultDescription = "No rewards received";
          break;
        default:
          resultDescription = "Unknown reward";
      }
    }

    return {
      type,
      itemId,
      amount,
      description: resultDescription,
    };
  }

  /**
   * Create a cancellation result for cancelled activities
   */
  static createCancellationResult(energyRefunded?: number): ActivityLogResult {
    const description = energyRefunded && energyRefunded > 0 
      ? `Activity cancelled (${energyRefunded} energy refunded)`
      : "Activity cancelled";
      
    return {
      type: "none",
      description,
    };
  }

  /**
   * Get statistics from the activity log
   */
  static getLogStatistics(gameState: GameState): {
    totalActivities: number;
    completedActivities: number;
    cancelledActivities: number;
    byType: Record<string, { started: number; completed: number; cancelled: number }>;
    byLocation: Record<string, { started: number; completed: number; cancelled: number }>;
  } {
    const entries = gameState.activityLog || [];
    
    const stats = {
      totalActivities: entries.length,
      completedActivities: entries.filter(e => e.status === "completed").length,
      cancelledActivities: entries.filter(e => e.status === "cancelled").length,
      byType: {} as Record<string, { started: number; completed: number; cancelled: number }>,
      byLocation: {} as Record<string, { started: number; completed: number; cancelled: number }>,
    };

    // Count by activity type and location
    entries.forEach(entry => {
      // Initialize type stats if needed
      if (!stats.byType[entry.activityId]) {
        stats.byType[entry.activityId] = { started: 0, completed: 0, cancelled: 0 };
      }
      
      // Initialize location stats if needed
      if (!stats.byLocation[entry.locationId]) {
        stats.byLocation[entry.locationId] = { started: 0, completed: 0, cancelled: 0 };
      }

      // Count by status
      if (entry.status === "started") {
        stats.byType[entry.activityId].started++;
        stats.byLocation[entry.locationId].started++;
      } else if (entry.status === "completed") {
        stats.byType[entry.activityId].completed++;
        stats.byLocation[entry.locationId].completed++;
      } else if (entry.status === "cancelled") {
        stats.byType[entry.activityId].cancelled++;
        stats.byLocation[entry.locationId].cancelled++;
      }
    });

    return stats;
  }

  /**
   * Clean up old log entries beyond the maximum limit
   */
  static cleanupOldEntries(gameState: GameState): void {
    if (gameState.activityLog.length > this.MAX_LOG_ENTRIES) {
      gameState.activityLog = gameState.activityLog.slice(0, this.MAX_LOG_ENTRIES);
    }
  }

  /**
   * Initialize activity log for new game states
   */
  static initializeActivityLog(gameState: GameState): void {
    if (!gameState.activityLog) {
      gameState.activityLog = [];
    }
  }
}