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
  play: {
    label: "Play",
    icon: "🎾",
    category: "toy" as const,
    selectorTitle: "Select Toy",
    selectorDescription: "Choose a toy to play with your pet.",
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
 * Fallback display names for game entities.
 */
export const FallbackNames = {
  unknownLocation: "Unknown Location",
  unknownFacility: "Unknown Facility",
} as const;
