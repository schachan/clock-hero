import { LEVELS } from "../constants/levels";
import { getWatchFace } from "../constants/watchFaces";

interface LevelCompleteScreenProps {
  playerName: string;
  levelIndex: number;
  correct: number;
  wrong: number;
  onBackToMap: () => void;
}

export function LevelCompleteScreen({
  playerName,
  levelIndex,
  correct,
  wrong,
  onBackToMap,
}: LevelCompleteScreenProps) {
  const levelName = LEVELS[levelIndex]?.name ?? "";
  const greeting = playerName ? `Great job, ${playerName}!` : "Great job!";
  const nextLevel = LEVELS[levelIndex + 1];
  const nextFace = nextLevel ? getWatchFace(nextLevel.watchFace) : null;

  return (
    <div className="overlay">
      <div className="celebration-card">
        <div className="celebration-icon" aria-hidden="true">
          🎉
        </div>
        <h1>Level Complete!</h1>
        <p>
          {greeting} You finished Level {levelIndex + 1}: {levelName}
        </p>
        {nextFace && (
          <p className="celebration-next-face">
            Next up: a <strong>{nextFace.label}</strong> clock face — {nextLevel!.name}
          </p>
        )}
        <div className="win-stats">
          <div className="win-stat">
            <b>{correct}</b>
            <span>correct</span>
          </div>
          <div className="win-stat">
            <b>{wrong}</b>
            <span>wrong</span>
          </div>
          <div className="win-stat">
            <b>{correct + wrong}</b>
            <span>total</span>
          </div>
        </div>
        <button className="start-btn celebration-btn" type="button" onClick={onBackToMap}>
          Back to Levels
        </button>
      </div>
    </div>
  );
}
