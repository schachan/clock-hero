interface WinScreenProps {
  playerName: string;
  accuracy: number;
  avgSpeed: number;
  totalQuestions: number;
  unlockedNextAge: boolean;
  nextAge: number;
  onPlayAgain: () => void;
}

export function WinScreen({
  playerName,
  accuracy,
  avgSpeed,
  totalQuestions,
  unlockedNextAge,
  nextAge,
  onPlayAgain,
}: WinScreenProps) {
  const title = playerName ? `${playerName} — Time Master!` : "Time Master!";
  const message = playerName
    ? `You can tell any time super fast, ${playerName}!`
    : "You can tell any time super fast! Amazing!";

  return (
    <div className="overlay">
      <div className="celebration-card">
        <div className="celebration-icon" aria-hidden="true">
          🏆
        </div>
        <h1>{title}</h1>
        <p>{message}</p>
        {unlockedNextAge && (
          <p className="celebration-unlock-age">
            You unlocked Age {nextAge} levels! Try a tougher challenge.
          </p>
        )}
        <div className="win-stats">
          <div className="win-stat">
            <b>{accuracy}%</b>
            <span>accuracy</span>
          </div>
          <div className="win-stat">
            <b>{avgSpeed.toFixed(1)}s</b>
            <span>avg speed</span>
          </div>
          <div className="win-stat">
            <b>{totalQuestions}</b>
            <span>questions</span>
          </div>
        </div>
        <button className="start-btn celebration-btn" type="button" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
