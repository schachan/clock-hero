import { useCallback, useEffect, useRef, useState } from "react";
import { getLevelWatchFace, LEVELS } from "../constants/levels";
import {
  applyAnswerScore,
  CORRECT_POINTS,
  FAST_BONUS,
  getCorrectAnswersLeft,
  getFastMs,
  getFastSeconds,
  getLevelCutoff,
  getPointsDelta,
  WRONG_PENALTY,
} from "../constants/scoring";
import type {
  ActiveBox,
  FeedbackState,
  HistoryEntry,
  ReviewState,
  TimeValue,
  WrongAnswer,
} from "../types";
import { soundBad, soundGood, soundTick, soundWin } from "../utils/audio";
import { confettiBurst } from "../utils/confetti";
import { Clock } from "./Clock";
import { Feedback } from "./Feedback";
import { History } from "./History";
import { Keypad } from "./Keypad";
import { Review } from "./Review";
import { TimeInput } from "./TimeInput";

interface GameProps {
  playerName: string;
  playerAge: number;
  levelIndex: number;
  history: HistoryEntry[];
  onHistoryChange: (history: HistoryEntry[]) => void;
  onLevelComplete: (stats: { correct: number; wrong: number; levelIndex: number }) => void;
  onWin: (stats: {
    accuracy: number;
    avgSpeed: number;
    totalQuestions: number;
    correct: number;
    wrong: number;
    levelIndex: number;
  }) => void;
  onProgressChange: (stats: {
    correct: number;
    wrong: number;
    score: number;
    levelIndex: number;
  }) => void;
  onBackToMap: () => void;
  appRef: React.RefObject<HTMLDivElement | null>;
}

const IDLE_CLOCK: TimeValue = { h: 10, m: 10 };

export function Game({
  playerName,
  playerAge,
  levelIndex,
  history,
  onHistoryChange,
  onLevelComplete,
  onWin,
  onProgressChange,
  onBackToMap,
  appRef,
}: GameProps) {
  const isFinalLevel = levelIndex === LEVELS.length - 1;
  const levelCutoff = getLevelCutoff(playerAge, levelIndex);
  const fastMs = getFastMs(playerAge);
  const fastSecs = getFastSeconds(playerAge);
  const watchFace = getLevelWatchFace(levelIndex);

  const [answerH, setAnswerH] = useState("");
  const [answerM, setAnswerM] = useState("");
  const [activeBox, setActiveBox] = useState<ActiveBox>("h");
  const [current, setCurrent] = useState<TimeValue>(IDLE_CLOCK);
  const [levelScore, setLevelScore] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [wrongInLevel, setWrongInLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    correct: false,
    ms: 0,
  });
  const [review, setReview] = useState<ReviewState>({
    open: false,
    h: 0,
    m: 0,
    gh: 0,
    gm: 0,
    returnsToFeedback: false,
  });
  const [lastWrong, setLastWrong] = useState<WrongAnswer | null>(null);

  const qStartTime = useRef(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completingRef = useRef(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const stopRoundTimer = useCallback(() => {
    if (roundTimerInterval.current) {
      clearInterval(roundTimerInterval.current);
      roundTimerInterval.current = null;
    }
  }, []);

  const startRoundTimer = useCallback(() => {
    stopRoundTimer();
    qStartTime.current = performance.now();
    setElapsedMs(0);
    roundTimerInterval.current = setInterval(() => {
      setElapsedMs(performance.now() - qStartTime.current);
    }, 100);
  }, [stopRoundTimer]);

  const pickQuestion = useCallback(() => {
    const cfg = LEVELS[levelIndex];
    const h = 1 + Math.floor(Math.random() * 12);
    const m = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
    setCurrent({ h, m });
    setAnswerH("");
    setAnswerM("");
    setActiveBox("h");
    setLocked(false);
    startRoundTimer();
  }, [levelIndex, startRoundTimer]);

  const resetLevel = useCallback(() => {
    setAnswerH("");
    setAnswerM("");
    setActiveBox("h");
    setLevelScore(0);
    setCorrectInLevel(0);
    setWrongInLevel(0);
    setStreak(0);
    setLocked(false);
    setFeedback({ visible: false, correct: false, ms: 0 });
    setReview((r) => ({ ...r, open: false }));
    completingRef.current = false;
    pickQuestion();
  }, [pickQuestion]);

  useEffect(() => {
    resetLevel();
  }, [resetLevel]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      stopRoundTimer();
    };
  }, [stopRoundTimer]);

  useEffect(() => {
    if (completingRef.current) return;
    onProgressChange({
      correct: correctInLevel,
      wrong: wrongInLevel,
      score: levelScore,
      levelIndex,
    });
  }, [correctInLevel, wrongInLevel, levelScore, levelIndex, onProgressChange]);

  const ready = answerH.length >= 1 && answerM.length >= 1;

  const updateHistory = useCallback(
    (entry: HistoryEntry) => {
      const next = [entry, ...history].slice(0, 200);
      onHistoryChange(next);
    },
    [history, onHistoryChange],
  );

  const triggerLevelComplete = useCallback(
    (correct: number, wrong: number) => {
      if (completingRef.current) return;
      completingRef.current = true;
      soundWin();
      if (appRef.current) confettiBurst(appRef.current, 18);
      onLevelComplete({ correct, wrong, levelIndex });
    },
    [appRef, levelIndex, onLevelComplete],
  );

  const triggerWin = useCallback(
    (correct: number, wrong: number, score: number) => {
      if (completingRef.current) return;
      completingRef.current = true;
      const totalQ = correct + wrong;
      const acc = totalQ ? Math.round((correct / totalQ) * 100) : 100;
      const levelAttempts = history.filter((a) => a.level === levelIndex);
      const recent = levelAttempts.slice(0, 12);
      const avg = recent.length
        ? recent.reduce((s, w) => s + w.ms, 0) / recent.length / 1000
        : 0;
      onProgressChange({ correct, wrong, score, levelIndex });
      onWin({
        accuracy: acc,
        avgSpeed: avg,
        totalQuestions: totalQ,
        correct,
        wrong,
        levelIndex,
      });
      soundWin();
      if (appRef.current) {
        let bursts = 0;
        const iv = setInterval(() => {
          confettiBurst(appRef.current!, 24);
          if (++bursts >= 5) clearInterval(iv);
        }, 350);
      }
    },
    [appRef, history, levelIndex, onProgressChange, onWin],
  );

  const afterFeedback = useCallback(
    (
      nextLevelScore: number,
      nextCorrectInLevel: number,
      nextWrongInLevel: number,
    ) => {
      if (nextLevelScore >= levelCutoff) {
        if (isFinalLevel) {
          triggerWin(nextCorrectInLevel, nextWrongInLevel, nextLevelScore);
        } else {
          triggerLevelComplete(nextCorrectInLevel, nextWrongInLevel);
        }
        return;
      }

      pickQuestion();
    },
    [
      isFinalLevel,
      levelCutoff,
      pickQuestion,
      triggerLevelComplete,
      triggerWin,
    ],
  );

  const dismissFeedbackAndContinue = useCallback(() => {
    setFeedback({ visible: false, correct: false, ms: 0 });
    afterFeedback(levelScore, correctInLevel, wrongInLevel);
  }, [afterFeedback, correctInLevel, levelScore, wrongInLevel]);

  const checkAnswer = useCallback(() => {
    if (locked || completingRef.current) return;
    const h = parseInt(answerH, 10);
    const m = parseInt(answerM, 10);
    stopRoundTimer();
    const ms = performance.now() - qStartTime.current;
    setElapsedMs(ms);
    const correct = h === current.h && m === current.m;

    setLocked(true);

    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);

    const delta = getPointsDelta(correct, { ms, age: playerAge });
    const nextLevelScore = applyAnswerScore(levelScore, delta);
    setLevelScore(nextLevelScore);

    let nextCorrectInLevel = correctInLevel;
    let nextWrongInLevel = wrongInLevel;
    if (correct) {
      nextCorrectInLevel = correctInLevel + 1;
      setCorrectInLevel(nextCorrectInLevel);
    } else {
      nextWrongInLevel = wrongInLevel + 1;
      setWrongInLevel(nextWrongInLevel);
    }

    const attemptNo = (history.length ? history[0].n : 0) + 1;
    updateHistory({
      n: attemptNo,
      h: current.h,
      m: current.m,
      gh: h,
      gm: m,
      correct,
      ms,
      level: levelIndex,
      pointsDelta: delta,
    });

    if (correct) {
      soundGood();
      setFeedback({ visible: true, correct: true, ms, pointsDelta: delta });
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      const delay = ms <= fastMs ? 900 : 1200;
      feedbackTimer.current = setTimeout(() => {
        setFeedback({ visible: false, correct: false, ms: 0 });
        afterFeedback(nextLevelScore, nextCorrectInLevel, nextWrongInLevel);
      }, delay);
    } else {
      soundBad();
      setLastWrong({ h: current.h, m: current.m, gh: h, gm: m });
      setFeedback({ visible: true, correct: false, ms, pointsDelta: delta });
    }
  }, [
    locked,
    answerH,
    answerM,
    current,
    streak,
    levelIndex,
    levelScore,
    correctInLevel,
    wrongInLevel,
    history,
    updateHistory,
    afterFeedback,
    stopRoundTimer,
    playerAge,
    fastMs,
  ]);

  const pressDigit = useCallback(
    (d: string) => {
      if (locked) return;
      soundTick();
      if (activeBox === "h") {
        setAnswerH((prev) => {
          let next = prev.length >= 2 ? "" : prev;
          next += d;
          const hv = parseInt(next, 10);
          if (next.length === 2 || hv > 1) {
            if (next !== "1") setActiveBox("m");
          }
          if (next.length === 2) setActiveBox("m");
          return next;
        });
      } else {
        setAnswerM((prev) => {
          let next = prev.length >= 2 ? "" : prev;
          next += d;
          return next;
        });
      }
    },
    [activeBox, locked],
  );

  const backspace = useCallback(() => {
    if (locked) return;
    soundTick();
    if (activeBox === "m" && answerM.length > 0) {
      setAnswerM((prev) => prev.slice(0, -1));
    } else if (activeBox === "m" && answerM.length === 0) {
      setActiveBox("h");
    } else if (activeBox === "h" && answerH.length > 0) {
      setAnswerH((prev) => prev.slice(0, -1));
    }
  }, [activeBox, answerH, answerM, locked]);

  const openReview = useCallback(
    (h: number, m: number, gh: number, gm: number, returnsToFeedback: boolean) => {
      setReview({ open: true, h, m, gh, gm, returnsToFeedback });
    },
    [],
  );

  const closeReview = useCallback(() => {
    setReview((r) => ({ ...r, open: false, returnsToFeedback: false }));
  }, []);

  const handleReset = useCallback(() => {
    const totalQ = correctInLevel + wrongInLevel;
    if (totalQ > 0 && !confirm("Reset this level and start over?")) return;
    resetLevel();
    onProgressChange({ correct: 0, wrong: 0, score: 0, levelIndex });
  }, [correctInLevel, wrongInLevel, levelIndex, onProgressChange, resetLevel]);

  const handleClearHistory = useCallback(() => {
    const levelHistory = history.filter((a) => a.level === levelIndex);
    if (levelHistory.length && !confirm("Clear attempts for this level?")) return;
    const next = history.filter((a) => a.level !== levelIndex);
    onHistoryChange(next);
  }, [history, levelIndex, onHistoryChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (review.open) {
        if (e.key === "Enter" || e.key === "Escape") closeReview();
        return;
      }
      if (feedback.visible && !feedback.correct) {
        if (e.key === "Enter") dismissFeedbackAndContinue();
        return;
      }
      if (e.key >= "0" && e.key <= "9") pressDigit(e.key);
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Enter" && ready && !locked) checkAnswer();
      else if (e.key === ":" || e.key === "ArrowRight") setActiveBox("m");
      else if (e.key === "ArrowLeft") setActiveBox("h");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    review.open,
    feedback,
    pressDigit,
    backspace,
    ready,
    locked,
    checkAnswer,
    closeReview,
    dismissFeedbackAndContinue,
  ]);

  const levelHistory = history.filter((a) => a.level === levelIndex);
  const levelTotal = correctInLevel + wrongInLevel;
  const acc = levelTotal ? Math.round((correctInLevel / levelTotal) * 100) : 100;
  const correctAnswersLeft = getCorrectAnswersLeft(levelScore, levelCutoff);
  let spd = "–";
  if (levelHistory.length) {
    const recent = levelHistory.slice(0, 12);
    const avg = recent.reduce((s, w) => s + w.ms, 0) / recent.length / 1000;
    spd = avg.toFixed(1) + "s";
  }

  const pct = (levelScore / levelCutoff) * 100;

  const streakFlames =
    streak >= 3 ? "🔥".repeat(Math.min(streak, 8)) + " " + streak + " streak!" : "";

  return (
    <div id="game">
      <header className="game-hud">
        <div className="game-hud__row">
          <div className="game-hud__identity">
            <span className="level-chip">
              Level <span>{levelIndex + 1}</span>
            </span>
            <span className="level-name">{LEVELS[levelIndex].name}</span>
          </div>

          <div className="game-hud__progress" aria-label={`Score ${levelScore} of ${levelCutoff}`}>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: Math.min(100, pct) + "%" }} />
            </div>
            <span className="game-hud__score">
              {Math.min(levelScore, levelCutoff)}/{levelCutoff}
            </span>
          </div>

          <div className="game-hud__actions">
            <button className="back-map-btn" type="button" title="Back to levels" onClick={onBackToMap}>
              🗺️
            </button>
            <button className="reset-btn" type="button" title="Reset level" onClick={handleReset}>
              ↺
            </button>
          </div>
        </div>

        <div className="game-hud__metrics" aria-label="Session stats">
          <span className="hud-metric hud-metric--acc">{acc}% accurate</span>
          <span className="hud-metric hud-metric--speed">{spd === "–" ? "—" : `${spd} avg`}</span>
          {correctAnswersLeft > 0 && (
            <span className="hud-metric hud-metric--goal">{correctAnswersLeft} to go</span>
          )}
          {wrongInLevel > 0 && (
            <span className="hud-metric hud-metric--wrong">{wrongInLevel} wrong</span>
          )}
        </div>
      </header>

      <div className="game-body">
        <div className="game-main">
          <div className="play-area">
            <div className="play-clock">
              {streakFlames ? <div className="streak-flames">{streakFlames}</div> : null}
              <div
                className={
                  "round-timer" +
                  (elapsedMs > 0 && elapsedMs <= fastMs ? " round-timer--fast" : "")
                }
                aria-live="polite"
                aria-label={`Elapsed time ${(elapsedMs / 1000).toFixed(1)} seconds`}
              >
                ⏱ {(elapsedMs / 1000).toFixed(1)}s
              </div>
              <div className="clock-stage">
                <Clock h={current.h} m={current.m} face={watchFace} />
              </div>
            </div>

            <div className="play-input">
              <TimeInput
                answerH={answerH}
                answerM={answerM}
                activeBox={activeBox}
                locked={locked}
                onSelectBox={setActiveBox}
              />
              <div className="scoring-guide" aria-label="How points work">
                <span className="scoring-guide-item scoring-guide-item--good">
                  ✅ Correct: <strong>+{CORRECT_POINTS}</strong> pts
                </span>
                <span className="scoring-guide-item scoring-guide-item--fast">
                  ⚡ Under {fastSecs.toFixed(1)}s: <strong>+{FAST_BONUS}</strong> bonus
                </span>
                <span className="scoring-guide-item scoring-guide-item--bad">
                  ❌ Wrong: <strong>−{WRONG_PENALTY}</strong> pts
                </span>
              </div>
              <Keypad
                ready={ready}
                onDigit={pressDigit}
                onBackspace={backspace}
                onCheck={checkAnswer}
              />
            </div>
          </div>
        </div>

        <aside className="col-history">
          <History
            history={levelHistory}
            levelFilter={levelIndex}
            layout="sidebar"
            fastMs={fastMs}
            showStats
            onClear={handleClearHistory}
            onReviewAttempt={(h, m, gh, gm) => openReview(h, m, gh, gm, false)}
          />
        </aside>
      </div>

      <Feedback
        feedback={feedback}
        current={current}
        answerH={answerH}
        answerM={answerM}
        streak={streak}
        fastMs={fastMs}
        playerName={playerName}
        levelName={LEVELS[levelIndex].name}
        levelNum={levelIndex + 1}
        onShowMe={() => {
          if (lastWrong) openReview(lastWrong.h, lastWrong.m, lastWrong.gh, lastWrong.gm, true);
        }}
        onNext={dismissFeedbackAndContinue}
      />

      <Review review={review} watchFace={watchFace} onClose={closeReview} />
    </div>
  );
}
