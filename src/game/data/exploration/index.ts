/**
 * Exploration data exports.
 *
 * This module provides activity definitions and drop tables for the exploration system.
 */

export type { ActivityId as ActivityIdType } from "./activities";
// Activity definitions
export {
  ActivityId,
  deepExplorationActivity,
  EXPLORATION_ACTIVITIES,
  EXPLORATION_ACTIVITIES_LIST,
  fishingActivity,
  foragingActivity,
  getActivityById,
  miningActivity,
} from "./activities";

// Drop table definitions
export {
  // Individual drop tables for direct access
  calderaForagingDropTable,
  calderaMiningDropTable,
  cavesForagingDropTable,
  cavesMiningDropTable,
  coastFishingDropTable,
  coastForagingDropTable,
  DROP_TABLES,
  DROP_TABLES_LIST,
  depthsForagingDropTable,
  depthsMiningDropTable,
  genericDeepExplorationDropTable,
  getDropTableById,
  glacialForagingDropTable,
  glacialMiningDropTable,
  groveForagingDropTable,
  highlandsForagingDropTable,
  highlandsMiningDropTable,
  hollowForagingDropTable,
  LOCATION_DROP_TABLE_IDS,
  meadowForagingDropTable,
  peaksForagingDropTable,
  peaksMiningDropTable,
  reefFishingDropTable,
  reefForagingDropTable,
  spireForagingDropTable,
  spireMiningDropTable,
  templeFishingDropTable,
  templeForagingDropTable,
  woodsForagingDropTable,
} from "./dropTables";
