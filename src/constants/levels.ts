import { getWatchFace, type WatchFaceId } from "./watchFaces";

function rangeMinutes(): number[] {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i++) minutes.push(i);
  return minutes;
}

function everyFive(): number[] {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i += 5) minutes.push(i);
  return minutes;
}

function everyTen(): number[] {
  return [0, 10, 20, 30, 40, 50];
}

function pastMinutes(): number[] {
  const minutes: number[] = [];
  for (let i = 1; i <= 29; i++) {
    if (i !== 15) minutes.push(i);
  }
  return minutes;
}

function toMinutes(): number[] {
  const minutes: number[] = [];
  for (let i = 31; i <= 59; i++) {
    if (i !== 45) minutes.push(i);
  }
  return minutes;
}

export interface LevelConfig {
  name: string;
  chapter: string;
  minutes: number[];
  watchFace: WatchFaceId;
}

export const LEVELS: LevelConfig[] = [
  // Chapter 1 — O'clock (Easy → Medium → Hard faces, same :00 skill)
  { name: "O'clock · Dotty", chapter: "O'clock", minutes: [0], watchFace: "arabic-dots" },
  { name: "O'clock · Pilot", chapter: "O'clock", minutes: [0], watchFace: "arabic-pilot" },
  { name: "O'clock · Grand", chapter: "O'clock", minutes: [0], watchFace: "roman-classic" },

  // Chapter 2 — Half past
  { name: "Half past · Bold", chapter: "Half past", minutes: [30], watchFace: "arabic-bars" },
  {
    name: "Half & O'clock · Elegant",
    chapter: "Half past",
    minutes: [0, 30],
    watchFace: "roman-minimal",
  },
  {
    name: "Half & O'clock · Royal",
    chapter: "Half past",
    minutes: [0, 30],
    watchFace: "roman-traditional",
  },

  // Chapter 3 — Quarters
  { name: "Quarter past · Dotty", chapter: "Quarters", minutes: [15], watchFace: "arabic-dots" },
  {
    name: "Quarters · Pilot",
    chapter: "Quarters",
    minutes: [15, 30, 45],
    watchFace: "arabic-pilot",
  },
  {
    name: "Full quarters · Grand",
    chapter: "Quarters",
    minutes: [0, 15, 30, 45],
    watchFace: "roman-classic",
  },

  // Chapter 4 — Tens
  { name: "Ten past · Bold", chapter: "Tens", minutes: [10, 20], watchFace: "arabic-bars" },
  { name: "Ten to · Pilot", chapter: "Tens", minutes: [40, 50], watchFace: "arabic-pilot" },
  { name: "Every ten · Grand", chapter: "Tens", minutes: everyTen(), watchFace: "roman-classic" },

  // Chapter 5 — Five minutes
  {
    name: "Five minutes · Dotty",
    chapter: "Five minutes",
    minutes: everyFive(),
    watchFace: "arabic-dots",
  },
  {
    name: "Five minutes · Pilot",
    chapter: "Five minutes",
    minutes: everyFive(),
    watchFace: "arabic-pilot",
  },
  {
    name: "Five minutes · Royal",
    chapter: "Five minutes",
    minutes: everyFive(),
    watchFace: "roman-traditional",
  },

  // Chapter 6 — Any time
  {
    name: "Minutes past · Simple",
    chapter: "Any time",
    minutes: pastMinutes(),
    watchFace: "arabic-minimal",
  },
  {
    name: "Minutes to · Elegant",
    chapter: "Any time",
    minutes: toMinutes(),
    watchFace: "roman-minimal",
  },
  { name: "Any time · Royal", chapter: "Any time", minutes: rangeMinutes(), watchFace: "roman-traditional" },
];

/** Last level index per chapter — used for progress migration. */
export const CHAPTER_END_INDICES = LEVELS.reduce<number[]>((ends, cfg, index) => {
  const next = LEVELS[index + 1];
  if (!next || next.chapter !== cfg.chapter) ends.push(index);
  return ends;
}, []);

function assertUniqueWatchFaceDifficultyPerChapter(): void {
  const complexityByChapter = new Map<string, Set<number>>();
  const faceByChapter = new Map<string, Set<WatchFaceId>>();

  for (const level of LEVELS) {
    const { complexity } = getWatchFace(level.watchFace);
    const complexities = complexityByChapter.get(level.chapter) ?? new Set<number>();
    if (complexities.has(complexity)) {
      throw new Error(
        `Chapter "${level.chapter}" has more than one level at watch-face difficulty ${complexity}`,
      );
    }
    complexities.add(complexity);
    complexityByChapter.set(level.chapter, complexities);

    const faces = faceByChapter.get(level.chapter) ?? new Set<WatchFaceId>();
    if (faces.has(level.watchFace)) {
      throw new Error(`Chapter "${level.chapter}" reuses watch face "${level.watchFace}"`);
    }
    faces.add(level.watchFace);
    faceByChapter.set(level.chapter, faces);
  }
}

assertUniqueWatchFaceDifficultyPerChapter();

export function getLevelWatchFace(levelIndex: number): WatchFaceId {
  return LEVELS[levelIndex]?.watchFace ?? LEVELS[0].watchFace;
}
