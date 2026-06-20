import { describe, expect, it } from "vitest";
import { LEVELS } from "../constants/levels";
import { DEFAULT_AGE } from "../constants/scoring";
import {
  allLevelsCompleted,
  defaultLevelProgress,
  defaultPlayerProgress,
  ensureAgeTier,
  loadLevelProgress,
  loadPlayerAge,
  loadPlayerName,
  loadPlayerProgress,
  resetAllStorage,
  saveLevelProgress,
  savePlayerAge,
  savePlayerName,
  savePlayerProgress,
  syncPlayerProgress,
} from "./storage";

describe("storage — player name and age", () => {
  it("saves and loads player name", () => {
    savePlayerName("Alex");
    expect(loadPlayerName()).toBe("Alex");
  });

  it("saves and loads player age with clamping", () => {
    savePlayerAge(3);
    expect(loadPlayerAge()).toBe(5);
    savePlayerAge(20);
    expect(loadPlayerAge()).toBe(14);
    savePlayerAge(9);
    expect(loadPlayerAge()).toBe(9);
  });

  it("returns defaults when storage is empty", () => {
    expect(loadPlayerName()).toBe("");
    expect(loadPlayerAge()).toBe(DEFAULT_AGE);
  });
});

describe("storage — level progress", () => {
  it("creates default level progress", () => {
    const map = defaultLevelProgress();
    expect(Object.keys(map)).toHaveLength(LEVELS.length);
    expect(map[0].unlocked).toBe(true);
    expect(map[1].unlocked).toBe(false);
  });

  it("creates default player progress for age", () => {
    const progress = defaultPlayerProgress(8);
    expect(progress.registeredAge).toBe(8);
    expect(progress.byAge[8]).toBeDefined();
  });

  it("ensures age tier exists", () => {
    const progress = defaultPlayerProgress(8);
    const tier = ensureAgeTier(progress, 9);
    expect(tier).toBe(progress.byAge[9]);
    expect(progress.byAge[9]).toBeDefined();
  });

  it("detects all levels completed", () => {
    const map = defaultLevelProgress();
    expect(allLevelsCompleted(map)).toBe(false);
    for (let i = 0; i < LEVELS.length; i++) {
      map[i] = { ...map[i], unlocked: true, completed: true };
    }
    expect(allLevelsCompleted(map)).toBe(true);
    expect(allLevelsCompleted(undefined)).toBe(false);
  });
});

describe("storage — save and load player progress", () => {
  it("round-trips v4 player progress", () => {
    const original = defaultPlayerProgress(8);
    original.byAge[8]![0] = {
      unlocked: true,
      completed: true,
      correct: 5,
      wrong: 1,
      score: 40,
    };
    savePlayerProgress("Sam", original);
    const loaded = loadPlayerProgress("Sam", 8);
    expect(loaded.byAge[8]?.[0].completed).toBe(true);
    expect(loaded.byAge[8]?.[0].score).toBe(40);
  });

  it("syncs progress when registered age changes", () => {
    const progress = defaultPlayerProgress(8);
    const synced = syncPlayerProgress(progress, 10);
    expect(synced.registeredAge).toBe(10);
    expect(synced.maxUnlockedAge).toBe(10);
    expect(synced.byAge[10]).toBeDefined();
  });

  it("keeps active challenge age within bounds", () => {
    const progress = {
      ...defaultPlayerProgress(8),
      activeChallengeAge: 7,
      maxUnlockedAge: 9,
    };
    const synced = syncPlayerProgress(progress, 8);
    expect(synced.activeChallengeAge).toBeGreaterThanOrEqual(8);
    expect(synced.activeChallengeAge).toBeLessThanOrEqual(9);
  });
});

describe("storage — migration", () => {
  it("migrates legacy 5-level progress", () => {
    localStorage.setItem(
      "clockHeroProgress:Legacy",
      JSON.stringify({
        "0": { unlocked: true, completed: true, correct: 10, wrong: 0, score: 50 },
        "1": { unlocked: true, completed: false, correct: 2, wrong: 1, score: 8 },
      }),
    );
    const loaded = loadPlayerProgress("Legacy", 8);
    expect(loaded.byAge[8]?.[0].completed).toBe(true);
    expect(loaded.byAge[8]?.[2].completed).toBe(true);
    expect(loaded.byAge[8]?.[3].unlocked).toBe(true);
  });

  it("migrates v2 flat progress", () => {
    localStorage.setItem(
      "clockHeroProgress:v2:Flat",
      JSON.stringify({
        "0": { unlocked: true, completed: true, correct: 1, wrong: 0, score: 5 },
        "1": { unlocked: true, completed: false, correct: 0, wrong: 0, score: 0 },
      }),
    );
    const loaded = loadPlayerProgress("Flat", 9);
    expect(loaded.byAge[9]?.[0].completed).toBe(true);
    expect(localStorage.getItem("clockHeroProgress:v4:Flat")).not.toBeNull();
  });

  it("migrates v3 progress with byAge", () => {
    localStorage.setItem(
      "clockHeroProgress:v3:V3User",
      JSON.stringify({
        registeredAge: 8,
        maxUnlockedAge: 8,
        activeChallengeAge: 8,
        byAge: {
          "8": {
            "0": { unlocked: true, completed: true, correct: 0, wrong: 0, score: 0 },
            "5": { unlocked: true, completed: true, correct: 0, wrong: 0, score: 0 },
          },
        },
      }),
    );
    const loaded = loadPlayerProgress("V3User", 8);
    expect(loaded.byAge[8]?.[0].completed).toBe(true);
    expect(loaded.byAge[8]?.[1].unlocked).toBe(true);
  });

  it("migrates v3 flat progress", () => {
    localStorage.setItem(
      "clockHeroProgress:v3:V3Flat",
      JSON.stringify({
        "20": { unlocked: true, completed: true, correct: 0, wrong: 0, score: 0 },
      }),
    );
    const loaded = loadPlayerProgress("V3Flat", 8);
    expect(loaded.byAge[8]).toBeDefined();
  });

  it("migrates fully completed v30 chapter", () => {
    const chapterProgress: Record<string, unknown> = {};
    for (let i = 0; i <= 5; i++) {
      chapterProgress[String(i)] = {
        unlocked: true,
        completed: true,
        correct: 0,
        wrong: 0,
        score: 0,
      };
    }
    localStorage.setItem(
      "clockHeroProgress:v3:FullChapter",
      JSON.stringify(chapterProgress),
    );
    const loaded = loadPlayerProgress("FullChapter", 8);
    expect(loaded.byAge[8]?.[0].completed).toBe(true);
    expect(loaded.byAge[8]?.[1].completed).toBe(true);
    expect(loaded.byAge[8]?.[2].completed).toBe(true);
  });

  it("handles corrupt storage gracefully", () => {
    localStorage.setItem("clockHeroProgress:v4:Bad", "{not-json");
    const loaded = loadPlayerProgress("Bad", 8);
    expect(loaded.registeredAge).toBe(8);
  });

  it("normalizes partial level entries", () => {
    localStorage.setItem(
      "clockHeroProgress:v4:Partial",
      JSON.stringify({
        registeredAge: 8,
        maxUnlockedAge: 8,
        activeChallengeAge: 8,
        byAge: {
          "8": {
            "0": { unlocked: true, completed: false, correct: -1, wrong: -2, score: -3 },
          },
        },
      }),
    );
    const loaded = loadPlayerProgress("Partial", 8);
    expect(loaded.byAge[8]?.[0].correct).toBe(0);
    expect(loaded.byAge[8]?.[0].wrong).toBe(0);
    expect(loaded.byAge[8]?.[0].score).toBe(0);
  });

  it("migrates legacy in-progress chapter", () => {
    localStorage.setItem(
      "clockHeroProgress:InProgress",
      JSON.stringify({
        "1": {
          unlocked: true,
          completed: false,
          correct: 3,
          wrong: 2,
          score: 11,
        },
      }),
    );
    const loaded = loadPlayerProgress("InProgress", 8);
    expect(loaded.byAge[8]?.[0].completed).toBe(true);
    expect(loaded.byAge[8]?.[3].unlocked).toBe(true);
    expect(loaded.byAge[8]?.[3].correct).toBe(3);
  });
});

describe("storage — deprecated helpers and reset", () => {
  it("supports deprecated level progress helpers", () => {
    const map = defaultLevelProgress();
    map[0] = { ...map[0], score: 12 };
    savePlayerAge(8);
    saveLevelProgress("Old", map);
    const loaded = loadLevelProgress("Old");
    expect(loaded[0].score).toBe(12);
  });

  it("resets all clock hero storage", () => {
    savePlayerName("Reset");
    savePlayerAge(8);
    savePlayerProgress("Reset", defaultPlayerProgress(8));
    resetAllStorage();
    expect(loadPlayerName()).toBe("");
    expect(loadPlayerAge()).toBe(DEFAULT_AGE);
    expect(loadPlayerProgress("Reset", 8).byAge[8]?.[0].score).toBe(0);
  });
});
