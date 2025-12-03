/**
 * Battle reward constants.
 */
export const BATTLE_REWARD_CONSTANTS = {
  /** Base coin reward for winning a battle */
  BASE_COIN_REWARD: 5,
  /** Coin reward scaling per point of enemy power */
  COIN_POWER_SCALING: 0.5,
  /** Base experience reward for winning a battle */
  BASE_EXPERIENCE_REWARD: 10,
  /** Experience reward scaling per point of enemy power */
  EXPERIENCE_POWER_SCALING: 0.3,
} as const;
