export const CORRECT_POINTS = 5;
export const FAST_BONUS = 2;
export const WRONG_PENALTY = 2;
export const LEVEL_CUTOFF = 50;
export const MIN_AGE = 5;
export const MAX_AGE = 14;
export const DEFAULT_AGE = 8;

/** Fast-answer threshold (ms) by age — younger players get more time for typing. */
const FAST_MS_BY_AGE: Record<number, number> = {
  5: 9000,
  6: 8500,
  7: 8000,
  8: 7500,
  9: 7000,
  10: 6000,
  11: 5000,
  12: 4500,
  13: 3500,
  14: 3000,
};

export function getLevelCutoff(_age: number, _level: number): number {
  return LEVEL_CUTOFF;
}

export function getFastMs(age: number): number {
  const clampedAge = Math.min(MAX_AGE, Math.max(MIN_AGE, age));
  return FAST_MS_BY_AGE[clampedAge] ?? FAST_MS_BY_AGE[DEFAULT_AGE];
}

export function getFastSeconds(age: number): number {
  return getFastMs(age) / 1000;
}

export function isFastAnswer(ms: number, age: number): boolean {
  return ms <= getFastMs(age);
}

export function getCorrectAnswersLeft(score: number, cutoff: number): number {
  const pointsNeeded = Math.max(0, cutoff - score);
  if (pointsNeeded === 0) return 0;
  return Math.ceil(pointsNeeded / CORRECT_POINTS);
}

export function applyAnswerScore(currentScore: number, delta: number): number {
  return Math.max(0, currentScore + delta);
}

export function getPointsDelta(
  correct: boolean,
  opts?: { ms?: number; age?: number },
): number {
  if (!correct) return -WRONG_PENALTY;
  let pts = CORRECT_POINTS;
  if (
    opts?.ms != null &&
    opts?.age != null &&
    isFastAnswer(opts.ms, opts.age)
  ) {
    pts += FAST_BONUS;
  }
  return pts;
}
