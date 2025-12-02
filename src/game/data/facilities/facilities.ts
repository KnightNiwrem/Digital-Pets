/**
 * Training facility definitions.
 */

import {
  type TrainingFacility,
  TrainingFacilityType,
  type TrainingSession,
  TrainingSessionType,
} from "@/game/types/activity";
import { GrowthStage } from "@/game/types/constants";
import { TRAINING_SESSION_CONFIG } from "./constants";

/**
 * Basic training session available at all facilities.
 */
const basicSession: TrainingSession = {
  type: TrainingSessionType.Basic,
  name: "Basic Training",
  description: "A light training session for beginners.",
  durationTicks: TRAINING_SESSION_CONFIG.BASIC.DURATION_TICKS,
  energyCost: TRAINING_SESSION_CONFIG.BASIC.ENERGY_COST,
  primaryStatGain: TRAINING_SESSION_CONFIG.BASIC.PRIMARY_STAT_GAIN,
  secondaryStatGain: TRAINING_SESSION_CONFIG.BASIC.SECONDARY_STAT_GAIN,
};

/**
 * Intensive training session with moderate requirements.
 */
const intensiveSession: TrainingSession = {
  type: TrainingSessionType.Intensive,
  name: "Intensive Training",
  description: "A challenging session that pushes your pet harder.",
  durationTicks: TRAINING_SESSION_CONFIG.INTENSIVE.DURATION_TICKS,
  energyCost: TRAINING_SESSION_CONFIG.INTENSIVE.ENERGY_COST,
  primaryStatGain: TRAINING_SESSION_CONFIG.INTENSIVE.PRIMARY_STAT_GAIN,
  secondaryStatGain: TRAINING_SESSION_CONFIG.INTENSIVE.SECONDARY_STAT_GAIN,
  minStage: GrowthStage.Child,
};

/**
 * Advanced training session requiring higher growth stage.
 */
const advancedSession: TrainingSession = {
  type: TrainingSessionType.Advanced,
  name: "Advanced Training",
  description: "An elite training regimen for serious growth.",
  durationTicks: TRAINING_SESSION_CONFIG.ADVANCED.DURATION_TICKS,
  energyCost: TRAINING_SESSION_CONFIG.ADVANCED.ENERGY_COST,
  primaryStatGain: TRAINING_SESSION_CONFIG.ADVANCED.PRIMARY_STAT_GAIN,
  secondaryStatGain: TRAINING_SESSION_CONFIG.ADVANCED.SECONDARY_STAT_GAIN,
  minStage: GrowthStage.Teen,
};

/**
 * All session types in order of intensity.
 */
const allSessions: TrainingSession[] = [
  basicSession,
  intensiveSession,
  advancedSession,
];

/**
 * Strength training facility.
 */
export const strengthFacility: TrainingFacility = {
  id: "facility_strength",
  name: "Strength Gym",
  description: "Build raw power with weight training and resistance exercises.",
  facilityType: TrainingFacilityType.Strength,
  primaryStat: "strength",
  secondaryStat: "endurance",
  sessions: allSessions,
  emoji: "🏋️",
};

/**
 * Endurance training facility.
 */
export const enduranceFacility: TrainingFacility = {
  id: "facility_endurance",
  name: "Stamina Track",
  description:
    "Improve staying power with long-distance running and endurance drills.",
  facilityType: TrainingFacilityType.Endurance,
  primaryStat: "endurance",
  secondaryStat: "fortitude",
  sessions: allSessions,
  emoji: "🏃",
};

/**
 * Agility training facility.
 */
export const agilityFacility: TrainingFacility = {
  id: "facility_agility",
  name: "Agility Course",
  description:
    "Develop speed and reflexes through obstacle courses and sprints.",
  facilityType: TrainingFacilityType.Agility,
  primaryStat: "agility",
  secondaryStat: "precision",
  sessions: allSessions,
  emoji: "🤸",
};

/**
 * Precision training facility.
 */
export const precisionFacility: TrainingFacility = {
  id: "facility_precision",
  name: "Target Range",
  description:
    "Hone accuracy and focus with precision drills and target practice.",
  facilityType: TrainingFacilityType.Precision,
  primaryStat: "precision",
  secondaryStat: "cunning",
  sessions: allSessions,
  emoji: "🎯",
};

/**
 * Fortitude training facility.
 */
export const fortitudeFacility: TrainingFacility = {
  id: "facility_fortitude",
  name: "Resilience Dojo",
  description:
    "Build mental and physical toughness through endurance challenges.",
  facilityType: TrainingFacilityType.Fortitude,
  primaryStat: "fortitude",
  secondaryStat: "cunning",
  sessions: allSessions,
  emoji: "🛡️",
};

/**
 * Cunning training facility.
 */
export const cunningFacility: TrainingFacility = {
  id: "facility_cunning",
  name: "Tactics Arena",
  description:
    "Sharpen wit and strategy through puzzle challenges and tactical drills.",
  facilityType: TrainingFacilityType.Cunning,
  primaryStat: "cunning",
  secondaryStat: "precision",
  sessions: allSessions,
  emoji: "🧠",
};

/**
 * All training facilities indexed by ID.
 */
export const trainingFacilities: Record<string, TrainingFacility> = {
  facility_strength: strengthFacility,
  facility_endurance: enduranceFacility,
  facility_agility: agilityFacility,
  facility_precision: precisionFacility,
  facility_fortitude: fortitudeFacility,
  facility_cunning: cunningFacility,
};

/**
 * Get a training facility by ID.
 */
export function getFacility(facilityId: string): TrainingFacility | undefined {
  return trainingFacilities[facilityId];
}

/**
 * Get all training facilities as an array.
 */
export function getAllFacilities(): TrainingFacility[] {
  return Object.values(trainingFacilities);
}

/**
 * Get a specific training session from a facility.
 */
export function getSession(
  facilityId: string,
  sessionType: TrainingSessionType,
): TrainingSession | undefined {
  const facility = getFacility(facilityId);
  if (!facility) return undefined;
  return facility.sessions.find((s) => s.type === sessionType);
}
