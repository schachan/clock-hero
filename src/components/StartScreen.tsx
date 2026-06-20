import { useEffect, useState } from "react";
import { FAST_BONUS, getFastSeconds, MAX_AGE, MIN_AGE } from "../constants/scoring";
import { LEVELS } from "../constants/levels";
import { Clock } from "./Clock";

interface StartScreenProps {
  name: string;
  age: number;
  onNameChange: (name: string) => void;
  onAgeChange: (age: number) => void;
  onStart: () => void;
  onReset: () => void;
}

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

const FLOATERS = [
  { char: "3", top: "8%", left: "6%", delay: "0s", size: 28 },
  { char: "6", top: "18%", right: "8%", delay: "1.2s", size: 22 },
  { char: "9", top: "62%", left: "4%", delay: "2.4s", size: 20 },
  { char: "12", top: "72%", right: "5%", delay: "0.8s", size: 24 },
  { char: "⚡", top: "42%", left: "2%", delay: "1.8s", size: 18 },
  { char: "⭐", top: "28%", right: "3%", delay: "3s", size: 16 },
] as const;

export function StartScreen({
  name,
  age,
  onNameChange,
  onAgeChange,
  onStart,
  onReset,
}: StartScreenProps) {
  const [clockTime, setClockTime] = useState(() => {
    const now = new Date();
    return { h: now.getHours() % 12 || 12, m: now.getMinutes() };
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      setClockTime({ h: now.getHours() % 12 || 12, m: now.getMinutes() });
    }, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const fastSecs = getFastSeconds(age);
  const trimmedName = name.trim();
  const greeting = trimmedName ? `Ready, ${trimmedName}?` : "Ready to play?";

  return (
    <div className="start-screen">
      <div className="start-bg" aria-hidden="true">
        <div className="start-blob start-blob--1" />
        <div className="start-blob start-blob--2" />
        <div className="start-blob start-blob--3" />
        {FLOATERS.map((f) => (
          <span
            key={f.char + f.top}
            className="start-floater"
            style={{
              top: f.top,
              left: "left" in f ? f.left : undefined,
              right: "right" in f ? f.right : undefined,
              fontSize: f.size,
              animationDelay: f.delay,
            }}
          >
            {f.char}
          </span>
        ))}
      </div>

      <header className="start-hero">
        <div className="start-clock-wrap">
          <div className="start-clock-glow" aria-hidden="true" />
          <Clock h={clockTime.h} m={clockTime.m} className="start-clock" />
        </div>
        <p className="start-badge">Time-telling adventure</p>
        <h1>
          <span className="start-title-accent">Clock</span> Hero
        </h1>
        <p className="start-tagline">
          Read the clock, type the time, and level up your skills.
        </p>
      </header>

      <div className="start-panel">
        <p className="start-panel-greeting">{greeting}</p>

        <label className="start-field start-field--full">
          <span className="start-field-label">Your name</span>
          <input
            className="start-input"
            type="text"
            maxLength={14}
            placeholder="Enter your name"
            autoComplete="off"
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onStart();
            }}
          />
        </label>

        <fieldset className="start-age-field">
          <legend className="start-field-label">Your age</legend>
          <div className="start-age-picker" role="radiogroup" aria-label="Your age">
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={a === age}
                className={`start-age-pill${a === age ? " start-age-pill--active" : ""}`}
                onClick={() => onAgeChange(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="start-btn" type="button" onClick={onStart}>
          <span className="start-btn-label">Let&apos;s Go!</span>
          <span className="start-btn-icon" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      <div className="start-features">
        <div className="start-feature">
          <span className="start-feature-icon" aria-hidden="true">
            ⚡
          </span>
          <div>
            <strong>Speed bonus</strong>
            <p>
              Answer under {fastSecs.toFixed(1)}s for +{FAST_BONUS} extra points
            </p>
          </div>
        </div>
        <div className="start-feature">
          <span className="start-feature-icon" aria-hidden="true">
            🏆
          </span>
          <div>
            <strong>{LEVELS.length} levels</strong>
            <p>Clear them all to unlock the next age challenge</p>
          </div>
        </div>
      </div>

      <button className="start-reset-btn" type="button" onClick={onReset}>
        Reset saved progress
      </button>
    </div>
  );
}
