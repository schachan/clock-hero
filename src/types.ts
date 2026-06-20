export type ActiveBox = "h" | "m";

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  correct: number;
  wrong: number;
  score: number;
}

export type LevelProgressMap = Record<number, LevelProgress>;

export interface PlayerProgress {
  registeredAge: number;
  maxUnlockedAge: number;
  activeChallengeAge: number;
  byAge: Partial<Record<number, LevelProgressMap>>;
}

export interface TimeValue {
  h: number;
  m: number;
}

export interface WindowEntry {
  correct: boolean;
  ms: number;
}

export interface HistoryEntry {
  n: number;
  h: number;
  m: number;
  gh: number;
  gm: number;
  correct: boolean;
  ms: number;
  level: number;
  pointsDelta?: number;
}

export interface WrongAnswer {
  h: number;
  m: number;
  gh: number;
  gm: number;
}

export interface FeedbackState {
  visible: boolean;
  correct: boolean;
  ms: number;
  isLevelUp?: boolean;
  pointsDelta?: number;
}

export interface ReviewState {
  open: boolean;
  h: number;
  m: number;
  gh: number;
  gm: number;
  returnsToFeedback: boolean;
}
