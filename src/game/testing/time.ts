/**
 * Test time utilities for deterministic time-based tests.
 *
 * Use `setupTimeFreezing()` in test files that use `Date.now()` to ensure
 * deterministic and reproducible test results.
 */

import { afterEach, beforeEach, setSystemTime } from "bun:test";

/**
 * Frozen time constant for deterministic tests: 2024-12-05T12:00:00.000Z (Thursday)
 *
 * This timestamp is chosen because:
 * - It's a weekday (Thursday), useful for weekly reset tests
 * - It's at noon, avoiding edge cases around midnight
 * - It's a recent date that won't cause issues with age calculations
 */
export const FROZEN_TIME = 1_733_400_000_000;

/**
 * Sets up time freezing for the current test file using beforeEach/afterEach hooks.
 *
 * Call this function at the top level of a test file (after imports) to freeze
 * `Date.now()` to `FROZEN_TIME` for all tests in that file.
 *
 * @example
 * ```typescript
 * import { setupTimeFreezing } from "@/game/testing/time";
 *
 * setupTimeFreezing();
 *
 * test("my test", () => {
 *   // Date.now() will return FROZEN_TIME here
 * });
 * ```
 *
 * For tests that need a different frozen time, use `setSystemTime()` directly
 * within a `describe` block with its own beforeEach/afterEach hooks.
 */
export function setupTimeFreezing(): void {
  beforeEach(() => setSystemTime(FROZEN_TIME));
  afterEach(() => setSystemTime());
}
