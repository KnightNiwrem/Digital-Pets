/**
 * Centralized UI text constants for user-facing strings.
 *
 * This module provides consistent, translatable UI text for:
 * - Button labels
 * - Icons and emojis
 * - Item categories
 * - Dialog titles and descriptions
 * - Fallback display names
 *
 * All user-facing UI strings should be defined here for:
 * - Consistency across the codebase
 * - Easy future localization/i18n support
 * - Single source of truth for UI text
 */

import { FacilityType, LocationType } from "@/game/types/location";

/**
 * Care action UI text and display data.
 */
export const CareUI = {
  feed: {
    label: "Feed",
    icon: "🍖",
    category: "food" as const,
    selectorTitle: "Select Food",
    selectorDescription: "Choose a food item to feed your pet.",
  },
  water: {
    label: "Water",
    icon: "💧",
    category: "drink" as const,
    selectorTitle: "Select Drink",
    selectorDescription: "Choose a drink to give your pet.",
  },
  play: {
    label: "Play",
    icon: "🎾",
    category: "toy" as const,
    selectorTitle: "Select Toy",
    selectorDescription: "Choose a toy to play with your pet.",
  },
  clean: {
    label: "Clean",
    icon: "🧹",
    category: "cleaning" as const,
    selectorTitle: "Select Cleaning Item",
    selectorDescription: "Choose a cleaning item to clean up poop.",
  },
  sleep: {
    wakeUpLabel: "Wake Up",
    sleepLabel: "Sleep",
    wakeUpIcon: "☀️",
    sleepIcon: "🌙",
  },
} as const;

/**
 * Battle-related UI text.
 */
export const BattleUI = {
  vsIndicator: "⚔️",
} as const;

/**
 * Location and map UI text.
 */
export const LocationUI = {
  cannotTravel: "Cannot Travel",
  youAreHere: "📍 You are here",
  levelRange: "Level Range:",
  facilities: "Facilities",
  peopleHere: "People Here",
  travelHere: "Travel Here",
} as const;

/**
 * Display data for facility types.
 */
export const FacilityDisplay: Record<
  FacilityType,
  { name: string; emoji: string }
> = {
  [FacilityType.RestArea]: { name: "Rest Area", emoji: "🛏️" },
  [FacilityType.FoodStation]: { name: "Food Station", emoji: "🍽️" },
  [FacilityType.WaterStation]: { name: "Water Station", emoji: "💧" },
  [FacilityType.PlayArea]: { name: "Play Area", emoji: "🎮" },
  [FacilityType.Storage]: { name: "Storage", emoji: "📦" },
  [FacilityType.Shop]: { name: "Shop", emoji: "🛒" },
  [FacilityType.Trainer]: { name: "Trainer", emoji: "💪" },
  [FacilityType.Inn]: { name: "Inn", emoji: "🏨" },
  [FacilityType.QuestBoard]: { name: "Quest Board", emoji: "📋" },
  [FacilityType.RestPoint]: { name: "Rest Point", emoji: "⛺" },
  [FacilityType.ForageZone]: { name: "Forage Zone", emoji: "🌿" },
  [FacilityType.BattleArea]: { name: "Battle Area", emoji: "⚔️" },
};

/**
 * Fallback display for unknown facility types.
 */
export const FacilityDisplayFallback = { name: "Unknown", emoji: "❓" };

/**
 * Display data for location types (names only, colors are styling).
 */
export const LocationTypeNames: Record<LocationType, string> = {
  [LocationType.Home]: "Home",
  [LocationType.Town]: "Town",
  [LocationType.Wild]: "Wild Area",
  [LocationType.Dungeon]: "Dungeon",
};

/**
 * Fallback display names for game entities.
 */
export const FallbackNames = {
  unknownLocation: "Unknown Location",
  unknownFacility: "Unknown Facility",
} as const;
