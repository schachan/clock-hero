import { LEVELS } from "../constants/levels";
import { DEFAULT_AGE, MAX_AGE, MIN_AGE } from "../constants/scoring";
import type { LevelProgress, LevelProgressMap, PlayerProgress } from "../types";

const NAME_KEY = "clockHeroName";
const AGE_KEY = "clockHeroAge";

/** Old 5-level completed milestones mapped to 18-level chapter ends. */
const LEGACY_COMPLETED_THROUGH = [2, 5, 8, 14, 17];
/** Chapter start in 18-level curriculum for each old unlocked level index. */
const LEGACY_CHAPTER_START = [0, 3, 6, 12, 15];

/** 30-level curriculum chapter bounds (v3 storage). */
const V30_CHAPTER_STARTS = [0, 6, 11, 16, 20, 25];
const V30_CHAPTER_ENDS = [5, 10, 15, 19, 23, 29];

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function loadPlayerName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerAge(age: number): void {
  try {
    const clamped = Math.min(MAX_AGE, Math.max(MIN_AGE, age));
    localStorage.setItem(AGE_KEY, String(clamped));
  } catch {
    /* ignore */
  }
}

export function loadPlayerAge(): number {
  try {
    const raw = localStorage.getItem(AGE_KEY);
    if (raw === null) return DEFAULT_AGE;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return DEFAULT_AGE;
    return Math.min(MAX_AGE, Math.max(MIN_AGE, n));
  } catch {
    return DEFAULT_AGE;
  }
}

function playerProgressKey(playerName: string): string {
  return "clockHeroProgress:v4:" + (playerName || "_guest");
}

function playerProgressV3Key(playerName: string): string {
  return "clockHeroProgress:v3:" + (playerName || "_guest");
}

function flatProgressKey(playerName: string): string {
  return "clockHeroProgress:v2:" + (playerName || "_guest");
}

function legacyProgressKey(playerName: string): string {
  return "clockHeroProgress:" + (playerName || "_guest");
}

function clampAge(age: number): number {
  return Math.min(MAX_AGE, Math.max(MIN_AGE, age));
}

export function defaultLevelProgress(): LevelProgressMap {
  const map: LevelProgressMap = {};
  for (let i = 0; i < LEVELS.length; i++) {
    map[i] = {
      unlocked: i === 0,
      completed: false,
      correct: 0,
      wrong: 0,
      score: 0,
    };
  }
  return map;
}

export function defaultPlayerProgress(registeredAge: number): PlayerProgress {
  const age = clampAge(registeredAge);
  return {
    registeredAge: age,
    maxUnlockedAge: age,
    activeChallengeAge: age,
    byAge: { [age]: defaultLevelProgress() },
  };
}

export function ensureAgeTier(
  progress: PlayerProgress,
  age: number,
): LevelProgressMap {
  const clamped = clampAge(age);
  if (!progress.byAge[clamped]) {
    progress.byAge[clamped] = defaultLevelProgress();
  }
  return progress.byAge[clamped]!;
}

export function allLevelsCompleted(map: LevelProgressMap | undefined): boolean {
  if (!map) return false;
  for (let i = 0; i < LEVELS.length; i++) {
    if (!map[i]?.completed) return false;
  }
  return true;
}

function isLegacyProgress(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj).filter((k) => /^\d+$/.test(k));
  return keys.length > 0 && keys.length <= 5 && LEVELS.length > 5;
}

function isV30Progress(obj: Record<string, unknown>): boolean {
  return obj["20"] !== undefined || obj["29"] !== undefined;
}

function readLevelEntry(
  obj: Record<string, unknown>,
  index: number,
): Partial<LevelProgress> | undefined {
  const entry = obj[String(index)];
  if (!entry || typeof entry !== "object") return undefined;
  return entry as Partial<LevelProgress>;
}

function migrateV30Progress(obj: Record<string, unknown>): LevelProgressMap {
  const defaults = defaultLevelProgress();

  for (let ch = 0; ch < V30_CHAPTER_STARTS.length; ch++) {
    const oldStart = V30_CHAPTER_STARTS[ch];
    const oldEnd = V30_CHAPTER_ENDS[ch];
    const newStart = ch * 3;

    let chapterComplete = true;
    for (let i = oldStart; i <= oldEnd; i++) {
      if (!readLevelEntry(obj, i)?.completed) {
        chapterComplete = false;
        break;
      }
    }

    if (chapterComplete) {
      for (let i = newStart; i <= newStart + 2; i++) {
        defaults[i] = {
          unlocked: true,
          completed: true,
          correct: 0,
          wrong: 0,
          score: 0,
        };
      }
      continue;
    }

    let newOffset = 0;
    for (let i = oldStart; i <= oldEnd; i++) {
      const e = readLevelEntry(obj, i);
      if (!e?.unlocked) break;

      const target = newStart + newOffset;
      if (e.completed) {
        defaults[target] = {
          unlocked: true,
          completed: true,
          correct: 0,
          wrong: 0,
          score: 0,
        };
        newOffset += 1;
        continue;
      }

      defaults[target] = {
        unlocked: true,
        completed: false,
        correct: typeof e.correct === "number" && e.correct >= 0 ? e.correct : 0,
        wrong: typeof e.wrong === "number" && e.wrong >= 0 ? e.wrong : 0,
        score: typeof e.score === "number" && e.score >= 0 ? e.score : 0,
      };
      newOffset += 1;
      break;
    }

    const next = newStart + newOffset;
    if (next < LEVELS.length) {
      defaults[next] = { ...defaults[next], unlocked: true };
    }
    break;
  }

  return defaults;
}

function isFlatLevelProgress(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  if ("registeredAge" in obj && "byAge" in obj) return false;
  return Object.keys(obj).some((k) => /^\d+$/.test(k));
}

function migrateLegacyProgress(obj: Record<string, unknown>): LevelProgressMap {
  const defaults = defaultLevelProgress();

  let highestCompleted = -1;
  let highestUnlocked = 0;

  for (let i = 0; i < LEGACY_COMPLETED_THROUGH.length; i++) {
    const entry = obj[String(i)];
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Partial<LevelProgress>;
    if (e.unlocked) highestUnlocked = Math.max(highestUnlocked, i);
    if (e.completed) highestCompleted = Math.max(highestCompleted, i);
  }

  if (highestCompleted >= 0) {
    const through = LEGACY_COMPLETED_THROUGH[highestCompleted];
    for (let i = 0; i <= through; i++) {
      defaults[i] = { ...defaults[i], unlocked: true, completed: true };
    }
    const next = through + 1;
    if (next < LEVELS.length) {
      defaults[next] = { ...defaults[next], unlocked: true };
    }
    return defaults;
  }

  const start = LEGACY_CHAPTER_START[highestUnlocked] ?? 0;
  const oldEntry = obj[String(highestUnlocked)] as Partial<LevelProgress> | undefined;

  for (let i = 0; i < start; i++) {
    defaults[i] = { ...defaults[i], unlocked: true, completed: true };
  }
  for (let i = start; i < LEVELS.length; i++) {
    defaults[i] = { ...defaults[i], unlocked: i === start };
  }

  if (oldEntry) {
    defaults[start] = {
      unlocked: true,
      completed: false,
      correct: typeof oldEntry.correct === "number" && oldEntry.correct >= 0 ? oldEntry.correct : 0,
      wrong: typeof oldEntry.wrong === "number" && oldEntry.wrong >= 0 ? oldEntry.wrong : 0,
      score: typeof oldEntry.score === "number" && oldEntry.score >= 0 ? oldEntry.score : 0,
    };
  }

  return defaults;
}

function normalizeLevelProgress(raw: unknown, opts?: { fromV30?: boolean }): LevelProgressMap {
  const defaults = defaultLevelProgress();
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Record<string, unknown>;
  if (opts?.fromV30 || isV30Progress(obj)) {
    return migrateV30Progress(obj);
  }
  if (isLegacyProgress(obj)) {
    return migrateLegacyProgress(obj);
  }

  for (let i = 0; i < LEVELS.length; i++) {
    const entry = obj[String(i)];
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Partial<LevelProgress>;
    defaults[i] = {
      unlocked: typeof e.unlocked === "boolean" ? e.unlocked : defaults[i].unlocked,
      completed: typeof e.completed === "boolean" ? e.completed : defaults[i].completed,
      correct: typeof e.correct === "number" && e.correct >= 0 ? e.correct : 0,
      wrong: typeof e.wrong === "number" && e.wrong >= 0 ? e.wrong : 0,
      score: typeof e.score === "number" && e.score >= 0 ? e.score : 0,
    };
  }
  return defaults;
}

function normalizeByAge(raw: unknown): Partial<Record<number, LevelProgressMap>> {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const byAge: Partial<Record<number, LevelProgressMap>> = {};

  for (const key of Object.keys(obj)) {
    const age = parseInt(key, 10);
    if (!Number.isFinite(age) || age < MIN_AGE || age > MAX_AGE) continue;
    byAge[age] = normalizeLevelProgress(obj[key]);
  }

  return byAge;
}

function normalizePlayerProgress(raw: unknown, registeredAge: number): PlayerProgress {
  const age = clampAge(registeredAge);

  if (!raw || typeof raw !== "object") {
    return defaultPlayerProgress(age);
  }

  const obj = raw as Record<string, unknown>;

  if (isFlatLevelProgress(raw)) {
    return {
      registeredAge: age,
      maxUnlockedAge: age,
      activeChallengeAge: age,
      byAge: { [age]: normalizeLevelProgress(raw) },
    };
  }

  const byAge = normalizeByAge(obj.byAge);
  const storedRegistered =
    typeof obj.registeredAge === "number" ? clampAge(obj.registeredAge) : age;
  let maxUnlockedAge =
    typeof obj.maxUnlockedAge === "number"
      ? clampAge(obj.maxUnlockedAge)
      : storedRegistered;
  let activeChallengeAge =
    typeof obj.activeChallengeAge === "number"
      ? clampAge(obj.activeChallengeAge)
      : storedRegistered;

  maxUnlockedAge = Math.max(maxUnlockedAge, age);
  activeChallengeAge = Math.min(Math.max(activeChallengeAge, age), maxUnlockedAge);

  if (!byAge[age]) {
    byAge[age] = defaultLevelProgress();
  }
  if (!byAge[activeChallengeAge]) {
    byAge[activeChallengeAge] = defaultLevelProgress();
  }

  return {
    registeredAge: age,
    maxUnlockedAge,
    activeChallengeAge,
    byAge,
  };
}

export function syncPlayerProgress(
  progress: PlayerProgress,
  newRegisteredAge: number,
): PlayerProgress {
  const registeredAge = clampAge(newRegisteredAge);
  let maxUnlockedAge = Math.max(progress.maxUnlockedAge, registeredAge);
  let activeChallengeAge = progress.activeChallengeAge;

  if (registeredAge > progress.registeredAge && registeredAge > progress.maxUnlockedAge) {
    maxUnlockedAge = registeredAge;
  }

  activeChallengeAge = Math.min(Math.max(activeChallengeAge, registeredAge), maxUnlockedAge);

  const byAge = { ...progress.byAge };
  ensureAgeTier({ registeredAge, maxUnlockedAge, activeChallengeAge, byAge }, registeredAge);
  ensureAgeTier({ registeredAge, maxUnlockedAge, activeChallengeAge, byAge }, activeChallengeAge);

  return {
    registeredAge,
    maxUnlockedAge,
    activeChallengeAge,
    byAge,
  };
}

export function loadPlayerProgress(
  playerName: string,
  registeredAge: number,
): PlayerProgress {
  const age = clampAge(registeredAge);

  try {
    const v4Raw = localStorage.getItem(playerProgressKey(playerName));
    if (v4Raw) {
      return syncPlayerProgress(normalizePlayerProgress(JSON.parse(v4Raw), age), age);
    }

    const v3Raw = localStorage.getItem(playerProgressV3Key(playerName));
    if (v3Raw) {
      const parsed = JSON.parse(v3Raw) as Record<string, unknown>;
      const byAgeRaw = parsed.byAge;
      if (byAgeRaw && typeof byAgeRaw === "object") {
        const byAgeObj = byAgeRaw as Record<string, unknown>;
        const migratedByAge: Partial<Record<number, LevelProgressMap>> = {};
        for (const key of Object.keys(byAgeObj)) {
          const tierAge = parseInt(key, 10);
          if (!Number.isFinite(tierAge)) continue;
          migratedByAge[tierAge] = normalizeLevelProgress(byAgeObj[key], { fromV30: true });
        }
        const migrated: PlayerProgress = {
          registeredAge:
            typeof parsed.registeredAge === "number" ? clampAge(parsed.registeredAge) : age,
          maxUnlockedAge:
            typeof parsed.maxUnlockedAge === "number"
              ? clampAge(parsed.maxUnlockedAge)
              : age,
          activeChallengeAge:
            typeof parsed.activeChallengeAge === "number"
              ? clampAge(parsed.activeChallengeAge)
              : age,
          byAge: migratedByAge,
        };
        savePlayerProgress(playerName, migrated);
        return syncPlayerProgress(migrated, age);
      }

      const flatMigrated = normalizeLevelProgress(parsed, { fromV30: true });
      const migrated: PlayerProgress = {
        registeredAge: age,
        maxUnlockedAge: age,
        activeChallengeAge: age,
        byAge: { [age]: flatMigrated },
      };
      savePlayerProgress(playerName, migrated);
      return syncPlayerProgress(migrated, age);
    }

    const v2Raw = localStorage.getItem(flatProgressKey(playerName));
    if (v2Raw) {
      const migrated = normalizePlayerProgress(JSON.parse(v2Raw), age);
      savePlayerProgress(playerName, migrated);
      return syncPlayerProgress(migrated, age);
    }

    const legacyRaw = localStorage.getItem(legacyProgressKey(playerName));
    if (legacyRaw) {
      const migrated = normalizePlayerProgress(JSON.parse(legacyRaw), age);
      savePlayerProgress(playerName, migrated);
      return syncPlayerProgress(migrated, age);
    }
  } catch {
    /* ignore */
  }

  return defaultPlayerProgress(age);
}

export function savePlayerProgress(playerName: string, progress: PlayerProgress): void {
  try {
    localStorage.setItem(playerProgressKey(playerName), JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

/** @deprecated Use loadPlayerProgress */
export function loadLevelProgress(playerName: string): LevelProgressMap {
  return loadPlayerProgress(playerName, loadPlayerAge()).byAge[loadPlayerAge()] ?? defaultLevelProgress();
}

/** @deprecated Use savePlayerProgress */
export function saveLevelProgress(playerName: string, progress: LevelProgressMap): void {
  const age = loadPlayerAge();
  savePlayerProgress(playerName, {
    registeredAge: age,
    maxUnlockedAge: age,
    activeChallengeAge: age,
    byAge: { [age]: progress },
  });
}

export function resetAllStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("clockHero")) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
