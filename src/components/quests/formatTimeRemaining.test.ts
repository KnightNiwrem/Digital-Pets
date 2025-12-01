import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { formatTimeRemaining } from "./formatTimeRemaining";

describe("formatTimeRemaining", () => {
  let originalDateNow: () => number;
  const fixedNow = 1000000000000; // Fixed timestamp for testing

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => fixedNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  test("returns 'Expired' when time has passed", () => {
    expect(formatTimeRemaining(fixedNow - 1000)).toBe("Expired");
  });

  test("returns 'Expired' when exactly at expiration time", () => {
    expect(formatTimeRemaining(fixedNow)).toBe("Expired");
  });

  test("formats seconds only", () => {
    expect(formatTimeRemaining(fixedNow + 30 * 1000)).toBe("30s");
    expect(formatTimeRemaining(fixedNow + 59 * 1000)).toBe("59s");
  });

  test("formats minutes with remaining seconds", () => {
    expect(formatTimeRemaining(fixedNow + 90 * 1000)).toBe("1m 30s");
    expect(formatTimeRemaining(fixedNow + 5 * 60 * 1000 + 15 * 1000)).toBe(
      "5m 15s",
    );
  });

  test("formats minutes without seconds when exact", () => {
    expect(formatTimeRemaining(fixedNow + 60 * 1000)).toBe("1m");
    expect(formatTimeRemaining(fixedNow + 5 * 60 * 1000)).toBe("5m");
  });

  test("formats hours with remaining minutes", () => {
    expect(
      formatTimeRemaining(fixedNow + 2 * 60 * 60 * 1000 + 30 * 60 * 1000),
    ).toBe("2h 30m");
  });

  test("formats hours without minutes when exact", () => {
    expect(formatTimeRemaining(fixedNow + 60 * 60 * 1000)).toBe("1h");
    expect(formatTimeRemaining(fixedNow + 3 * 60 * 60 * 1000)).toBe("3h");
  });

  test("formats days with remaining hours", () => {
    expect(
      formatTimeRemaining(fixedNow + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    ).toBe("1d 5h");
  });

  test("formats days without hours when exact", () => {
    expect(formatTimeRemaining(fixedNow + 24 * 60 * 60 * 1000)).toBe("1d");
    expect(formatTimeRemaining(fixedNow + 3 * 24 * 60 * 60 * 1000)).toBe("3d");
  });

  test("handles boundary at exactly 60 seconds", () => {
    expect(formatTimeRemaining(fixedNow + 60 * 1000)).toBe("1m");
  });

  test("handles boundary at exactly 60 minutes", () => {
    expect(formatTimeRemaining(fixedNow + 60 * 60 * 1000)).toBe("1h");
  });

  test("handles boundary at exactly 24 hours", () => {
    expect(formatTimeRemaining(fixedNow + 24 * 60 * 60 * 1000)).toBe("1d");
  });
});
