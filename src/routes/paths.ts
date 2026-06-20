export const paths = {
  start: "/",
  levels: "/levels",
  game: (levelIndex: number) => `/game/${levelIndex}`,
  gamePattern: "/game/:levelIndex",
  levelComplete: "/level-complete",
  win: "/win",
} as const;

export interface LevelCompleteLocationState {
  correct: number;
  wrong: number;
  levelIndex: number;
}

export interface WinLocationState {
  accuracy: number;
  avgSpeed: number;
  totalQuestions: number;
  unlockedNextAge: boolean;
  nextAge: number;
}
