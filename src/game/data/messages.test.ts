import { expect, test } from "bun:test";
import { ActivityState } from "@/game/types/constants";
import { ActivityMessages, EnergyMessages, SleepMessages } from "./messages";

// SleepMessages tests
test("SleepMessages.alreadySleeping returns correct message", () => {
  expect(SleepMessages.alreadySleeping).toBe("Pet is already sleeping.");
});

test("SleepMessages.nowSleeping returns correct message", () => {
  expect(SleepMessages.nowSleeping).toBe("Pet is now sleeping.");
});

test("SleepMessages.alreadyAwake returns correct message", () => {
  expect(SleepMessages.alreadyAwake).toBe("Pet is already awake.");
});

test("SleepMessages.nowAwake returns correct message", () => {
  expect(SleepMessages.nowAwake).toBe("Pet is now awake.");
});

// EnergyMessages tests
test("EnergyMessages.notEnoughEnergy formats message correctly", () => {
  expect(EnergyMessages.notEnoughEnergy(10, 5)).toBe(
    "Not enough energy. Need 10, have 5.",
  );
});

test("EnergyMessages.notEnoughEnergy handles zero energy", () => {
  expect(EnergyMessages.notEnoughEnergy(10, 0)).toBe(
    "Not enough energy. Need 10, have 0.",
  );
});

// ActivityMessages tests
test("ActivityMessages.alreadyDoingActivity formats sleeping message", () => {
  expect(ActivityMessages.alreadyDoingActivity(ActivityState.Sleeping)).toBe(
    "Your pet is already sleeping.",
  );
});

test("ActivityMessages.alreadyDoingActivity formats training message", () => {
  expect(ActivityMessages.alreadyDoingActivity(ActivityState.Training)).toBe(
    "Your pet is already training.",
  );
});

test("ActivityMessages.alreadyDoingActivity formats exploring message", () => {
  expect(ActivityMessages.alreadyDoingActivity(ActivityState.Exploring)).toBe(
    "Your pet is already exploring.",
  );
});

test("ActivityMessages.alreadyDoingActivity formats battling message", () => {
  expect(ActivityMessages.alreadyDoingActivity(ActivityState.Battling)).toBe(
    "Your pet is already battling.",
  );
});

test("ActivityMessages.cannotPerformWhileBusy formats message with action and activity", () => {
  expect(
    ActivityMessages.cannotPerformWhileBusy("feed", ActivityState.Sleeping),
  ).toBe("Cannot feed while sleeping.");
});

test("ActivityMessages.cannotPerformWhileBusy formats message for training", () => {
  expect(
    ActivityMessages.cannotPerformWhileBusy("forage", ActivityState.Training),
  ).toBe("Cannot forage while training.");
});

test("ActivityMessages.cannotPerformWhileBusy formats message for battling", () => {
  expect(
    ActivityMessages.cannotPerformWhileBusy("rest", ActivityState.Battling),
  ).toBe("Cannot rest while battling.");
});
