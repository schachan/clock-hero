import { CORRECT_POINTS, FAST_BONUS, WRONG_PENALTY } from "../constants/scoring";
import { fmtTime, timeInWords } from "../utils/timeWords";
import type { FeedbackState, TimeValue } from "../types";

interface FeedbackProps {
  feedback: FeedbackState;
  current: TimeValue;
  answerH: string;
  answerM: string;
  streak: number;
  fastMs: number;
  playerName: string;
  levelName: string;
  levelNum: number;
  onShowMe: () => void;
  onNext: () => void;
}

export function Feedback({
  feedback,
  current,
  answerH,
  answerM,
  streak,
  fastMs,
  playerName,
  levelName,
  levelNum,
  onShowMe,
  onNext,
}: FeedbackProps) {
  if (!feedback.visible) return null;

  const words = timeInWords(current.h, current.m);
  const fast = feedback.ms <= fastMs;
  const secs = (feedback.ms / 1000).toFixed(1);

  if (feedback.isLevelUp) {
    return (
      <div className="feedback feedback--level-up show">
        <div className="fb-emoji">⬆️</div>
        <div className="fb-title" style={{ color: "var(--warn)" }}>
          Level Up!
        </div>
        <div className="fb-words">
          Level {levelNum}: {levelName}
        </div>
        <div className="fb-sub">Getting trickier! 💪</div>
      </div>
    );
  }

  if (feedback.correct) {
    const nm = playerName ? ", " + playerName : "";
    const pts = feedback.pointsDelta ?? CORRECT_POINTS;
    return (
      <div className="feedback feedback--correct show">
        <div className="fb-emoji">{fast ? "🚀" : "🎉"}</div>
        <div className="fb-title" style={{ color: "var(--good)" }}>
          {fast ? "Super fast" + nm + "!" : "Correct" + nm + "!"}
        </div>
        <div className="fb-words">{words}</div>
        <div className="fb-points-detail fb-points-detail--good">
          +{pts} points added to your score
          {fast && pts > CORRECT_POINTS ? ` (+${CORRECT_POINTS} + ${FAST_BONUS} fast bonus)` : ""}
        </div>
        <div className="fb-sub">
          <span className={fast ? "fb-time-fast" : ""}>{secs}s</span>
          {streak >= 3 ? `  •  🔥 ${streak} in a row!` : ""}
        </div>
      </div>
    );
  }

  const a = parseInt(answerH, 10);
  const b = parseInt(answerM, 10);
  const pts = feedback.pointsDelta ?? -WRONG_PENALTY;

  return (
    <div className="feedback feedback--wrong show">
      <div className="fb-emoji">🤔</div>
      <div className="fb-title" style={{ color: "var(--bad)" }}>
        Almost!
      </div>
      <div className="fb-words">{words}</div>
      <div className="fb-points-detail fb-points-detail--bad">
        {pts} points from your score (wrong answers cost {WRONG_PENALTY} pts)
      </div>
      <div
        className="fb-sub"
        dangerouslySetInnerHTML={{
          __html: `You wrote <b>${fmtTime(a, b)}</b> &nbsp;·&nbsp; it was <b>${fmtTime(current.h, current.m)}</b>`,
        }}
      />
      <div className="fb-actions">
        <button className="fb-btn show" type="button" onClick={onShowMe}>
          👀 Show me
        </button>
        <button className="fb-btn next" type="button" onClick={onNext}>
          Next ▶
        </button>
      </div>
    </div>
  );
}
