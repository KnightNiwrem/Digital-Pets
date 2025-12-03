/**
 * Tests for persistence functions including save/load validation.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createTestGameState } from "@/game/testing/createTestPet";
import {
  deleteSave,
  exportSave,
  hasSave,
  importSave,
  loadGame,
  saveGame,
  validateGameState,
} from "./persistence";

// Mock localStorage for testing
const localStorageData: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => localStorageData[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageData[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageData[key];
  },
  clear: () => {
    for (const key of Object.keys(localStorageData)) {
      delete localStorageData[key];
    }
  },
};

// Replace global localStorage
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  configurable: true,
});

beforeEach(() => {
  mockLocalStorage.clear();
});

afterEach(() => {
  mockLocalStorage.clear();
});

describe("validateGameState", () => {
  test("returns true for valid game state", () => {
    const state = createTestGameState();
    expect(validateGameState(state)).toBe(true);
  });

  test("returns true for game state without pet", () => {
    const state = createTestGameState(null);
    expect(validateGameState(state)).toBe(true);
  });

  test("returns false for null", () => {
    expect(validateGameState(null)).toBe(false);
  });

  test("returns false for non-object", () => {
    expect(validateGameState("string")).toBe(false);
    expect(validateGameState(123)).toBe(false);
    expect(validateGameState(undefined)).toBe(false);
  });

  test("returns false for missing version", () => {
    const state = createTestGameState();
    const invalid = { ...state, version: undefined };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for missing lastSaveTime", () => {
    const state = createTestGameState();
    const invalid = { ...state, lastSaveTime: undefined };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for missing totalTicks", () => {
    const state = createTestGameState();
    const invalid = { ...state, totalTicks: undefined };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for missing isInitialized", () => {
    const state = createTestGameState();
    const invalid = { ...state, isInitialized: undefined };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for missing player", () => {
    const state = createTestGameState();
    const invalid = { ...state, player: undefined };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for invalid player structure", () => {
    const state = createTestGameState();
    const invalid = { ...state, player: { inventory: null } };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for non-array quests", () => {
    const state = createTestGameState();
    const invalid = { ...state, quests: {} };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for invalid pet structure", () => {
    const state = createTestGameState();
    const invalid = { ...state, pet: { identity: null } };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns true for valid game state with activeBattle", () => {
    const state = createTestGameState();
    const stateWithBattle = {
      ...state,
      activeBattle: {
        enemySpeciesId: "enemy_1",
        enemyLevel: 5,
        battleState: { turn: 1 },
      },
    };
    expect(validateGameState(stateWithBattle)).toBe(true);
  });

  test("returns false for invalid activeBattle structure", () => {
    const state = createTestGameState();
    const invalidMissingFields = { ...state, activeBattle: {} };
    expect(validateGameState(invalidMissingFields)).toBe(false);

    const invalidNonObject = { ...state, activeBattle: "not an object" };
    expect(validateGameState(invalidNonObject)).toBe(false);
  });

  test("returns false for invalid inventory.items", () => {
    const state = createTestGameState();
    const invalid = {
      ...state,
      player: { ...state.player, inventory: { items: "not an array" } },
    };
    expect(validateGameState(invalid)).toBe(false);
  });

  test("returns false for invalid currency.coins", () => {
    const state = createTestGameState();
    const invalid = {
      ...state,
      player: { ...state.player, currency: { coins: "not a number" } },
    };
    expect(validateGameState(invalid)).toBe(false);
  });
});

describe("saveGame and loadGame", () => {
  test("save and load round-trip preserves state", () => {
    const state = createTestGameState();

    const saved = saveGame(state);
    expect(saved).toBe(true);

    const loaded = loadGame();
    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.state.version).toBe(state.version);
      expect(loaded.state.totalTicks).toBe(state.totalTicks);
      expect(loaded.state.isInitialized).toBe(state.isInitialized);
      expect(loaded.state.pet?.identity.name).toBe(state.pet?.identity.name);
    }
  });

  test("loadGame returns initial state when no save exists", () => {
    const loaded = loadGame();
    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.state.isInitialized).toBe(false);
      expect(loaded.state.pet).toBe(null);
    }
  });

  test("loadGame fails for corrupted data", () => {
    mockLocalStorage.setItem("digital_pets_save", "not valid json");
    const loaded = loadGame();
    expect(loaded.success).toBe(false);
  });

  test("loadGame fails for malformed save structure", () => {
    const malformed = JSON.stringify({ version: 1, foo: "bar" });
    mockLocalStorage.setItem("digital_pets_save", malformed);
    const loaded = loadGame();
    expect(loaded.success).toBe(false);
    if (!loaded.success) {
      expect(loaded.error).toContain("Invalid save data");
    }
  });

  test("saveGame clears pendingEvents before saving", () => {
    const state = createTestGameState();
    state.pendingEvents = [
      {
        type: "stageTransition",
        timestamp: Date.now(),
        previousStage: "baby",
        newStage: "child",
        petName: "Test",
      },
    ];

    saveGame(state);
    const loaded = loadGame();

    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.state.pendingEvents).toEqual([]);
    }
  });
});

describe("hasSave and deleteSave", () => {
  test("hasSave returns false when no save exists", () => {
    expect(hasSave()).toBe(false);
  });

  test("hasSave returns true after saving", () => {
    const state = createTestGameState();
    saveGame(state);
    expect(hasSave()).toBe(true);
  });

  test("deleteSave removes saved data", () => {
    const state = createTestGameState();
    saveGame(state);
    expect(hasSave()).toBe(true);

    const deleted = deleteSave();
    expect(deleted).toBe(true);
    expect(hasSave()).toBe(false);
  });
});

describe("exportSave and importSave", () => {
  test("export returns saved data as string", () => {
    const state = createTestGameState();
    saveGame(state);

    const exported = exportSave();
    expect(exported).not.toBeNull();
    expect(typeof exported).toBe("string");

    if (exported) {
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe(state.version);
    }
  });

  test("export returns null when no save exists", () => {
    expect(exportSave()).toBeNull();
  });

  test("import saves valid data and returns state", () => {
    const state = createTestGameState();
    const data = JSON.stringify(state);

    const result = importSave(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.version).toBe(state.version);
      expect(result.state.pendingEvents).toEqual([]);
    }

    // Verify data was saved to localStorage
    expect(hasSave()).toBe(true);
  });

  test("import fails for invalid JSON", () => {
    const result = importSave("not valid json");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  test("import fails for malformed save structure", () => {
    const malformed = JSON.stringify({ version: 1, foo: "bar" });
    const result = importSave(malformed);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid save data");
    }
  });

  test("import/export round-trip preserves state", () => {
    const state = createTestGameState();
    saveGame(state);

    const exported = exportSave();
    expect(exported).not.toBeNull();

    if (exported) {
      deleteSave();
      expect(hasSave()).toBe(false);

      const imported = importSave(exported);
      expect(imported.success).toBe(true);

      if (imported.success) {
        expect(imported.state.version).toBe(state.version);
        expect(imported.state.totalTicks).toBe(state.totalTicks);
      }
    }
  });
});
