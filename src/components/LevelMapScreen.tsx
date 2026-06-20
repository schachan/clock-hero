import { Fragment } from "react";
import { getCorrectAnswersLeft, getFastSeconds, getLevelCutoff, MAX_AGE } from "../constants/scoring";
import { LEVELS } from "../constants/levels";
import { COMPLEXITY_LABELS, getWatchFace } from "../constants/watchFaces";
import type { LevelProgressMap } from "../types";
import { Clock } from "./Clock";

interface LevelMapScreenProps {
  playerName: string;
  registeredAge: number;
  challengeAge: number;
  maxUnlockedAge: number;
  levelProgress: LevelProgressMap;
  onSelectChallengeAge: (age: number) => void;
  onSelectLevel: (levelIndex: number) => void;
  onReset: () => void;
}

export function LevelMapScreen({
  playerName,
  registeredAge,
  challengeAge,
  maxUnlockedAge,
  levelProgress,
  onSelectChallengeAge,
  onSelectLevel,
  onReset,
}: LevelMapScreenProps) {
  const greeting = playerName ? `Hi ${playerName}!` : "Hi there!";
  const finalLevelIndex = LEVELS.length - 1;
  const nextLockedAge = maxUnlockedAge + 1;
  const showNextLockedHint = nextLockedAge <= MAX_AGE;
  const fastSecs = getFastSeconds(challengeAge);

  const unlockedAges: number[] = [];
  for (let age = registeredAge; age <= maxUnlockedAge; age++) {
    unlockedAges.push(age);
  }

  return (
    <div className="level-map">
      <div className="level-map-head">
        <h1>🗺️ Pick a Level</h1>
        <p>{greeting} Each level uses a trickier clock face — choose one and practice!</p>

        <div className="age-tier-section">
          <p className="age-tier-label">Age {challengeAge} challenge</p>
          <p className="age-tier-hint">
            ⚡ Speed bonus under {fastSecs.toFixed(1)}s at this age
          </p>
          <div className="age-tier-picker" role="tablist" aria-label="Challenge age">
            {unlockedAges.map((age) => (
              <button
                key={age}
                type="button"
                role="tab"
                aria-selected={age === challengeAge}
                className={`age-tier-pill${age === challengeAge ? " age-tier-pill--active" : ""}`}
                onClick={() => onSelectChallengeAge(age)}
              >
                Age {age}
              </button>
            ))}
            {showNextLockedHint && (
              <span className="age-tier-pill age-tier-pill--locked" title={`Complete all levels at Age ${maxUnlockedAge} to unlock`}>
                Age {nextLockedAge} 🔒
              </span>
            )}
          </div>
          {showNextLockedHint && (
            <p className="age-tier-unlock-hint">
              Complete all {LEVELS.length} levels at Age {maxUnlockedAge} to unlock Age {nextLockedAge}!
            </p>
          )}
        </div>

        <button className="level-map-reset" type="button" onClick={onReset}>
          Reset progress
        </button>
      </div>

      <div className="level-cards">
        {LEVELS.map((cfg, index) => {
          const progress = levelProgress[index];
          const locked = !progress?.unlocked;
          const completed = progress?.completed ?? false;
          const correct = progress?.correct ?? 0;
          const wrong = progress?.wrong ?? 0;
          const score = progress?.score ?? 0;
          const cutoff = getLevelCutoff(challengeAge, index);
          const isFinalLevel = index === finalLevelIndex;
          const scorePct = Math.min(100, (score / cutoff) * 100);
          const answersLeft = completed ? 0 : getCorrectAnswersLeft(score, cutoff);
          const face = getWatchFace(cfg.watchFace);
          const showChapterHeader =
            index === 0 || LEVELS[index - 1].chapter !== cfg.chapter;

          return (
            <Fragment key={`${cfg.chapter}-${cfg.name}`}>
              {showChapterHeader && (
                <h2 className="level-chapter">{cfg.chapter}</h2>
              )}
              <div
                className={`level-card${locked ? " level-card--locked" : ""}${completed ? " level-card--completed" : ""}`}
              >
                <div className="level-card-layout">
                  <div className="level-card-clock-wrap" aria-hidden="true">
                    <Clock h={3} m={0} face={cfg.watchFace} className="level-card-clock" />
                  </div>

                  <div className="level-card-body">
                    <div className="level-card-top">
                      <div className="level-card-title">
                        <span className="level-num">Level {index + 1}</span>
                        <span className="level-label">{cfg.name}</span>
                        <span className={`level-face-badge level-face-badge-${face.complexity}`}>
                          {face.label} · {COMPLEXITY_LABELS[face.complexity]}
                        </span>
                      </div>
                      <div className="level-card-badge">
                        {locked ? "🔒" : completed ? "⭐" : "▶️"}
                      </div>
                    </div>

                    {locked ? (
                      <p className="level-card-locked-msg">Complete the previous level to unlock</p>
                    ) : (
                      <>
                        <div className="level-progress-wrap">
                          <div
                            className="level-progress-correct"
                            style={{ width: `${completed ? 100 : scorePct}%` }}
                          />
                        </div>
                        <div className="level-stats">
                          <span className="level-stat level-stat--score">
                            ⭐ {Math.min(score, cutoff)}/{cutoff}
                          </span>
                          {answersLeft > 0 && (
                            <span className="level-stat level-stat--remaining">
                              🎯 {answersLeft} more correct
                            </span>
                          )}
                          <span className="level-stat level-stat--wrong">❌ {wrong}</span>
                        </div>
                        {isFinalLevel && !completed && (
                          <p className="level-card-hint">
                            Reach 50 points to become Time Master!
                          </p>
                        )}
                        <button
                          className="level-play-btn"
                          type="button"
                          onClick={() => onSelectLevel(index)}
                        >
                          {completed ? "Play again" : score > 0 || correct > 0 ? "Continue" : "Play"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
