import { describe, expect, it } from "vitest";
import {
  applyAnswerScore,
  CORRECT_POINTS,
  FAST_BONUS,
  getCorrectAnswersLeft,
  getFastMs,
  getFastSeconds,
  getLevelCutoff,
  getPointsDelta,
  isFastAnswer,
  LEVEL_CUTOFF,
  WRONG_PENALTY,
} from "../constants/scoring";

describe("scoring", () => {
  it("returns level cutoff", () => {
    expect(getLevelCutoff(8, 0)).toBe(LEVEL_CUTOFF);
  });

  it("returns fast ms by age", () => {
    expect(getFastMs(5)).toBe(9000);
    expect(getFastMs(14)).toBe(3000);
    expect(getFastMs(99)).toBe(3000);
    expect(getFastSeconds(8)).toBe(7.5);
  });

  it("detects fast answers", () => {
    expect(isFastAnswer(5000, 8)).toBe(true);
    expect(isFastAnswer(8000, 8)).toBe(false);
  });

  it("computes correct answers left", () => {
    expect(getCorrectAnswersLeft(50, 50)).toBe(0);
    expect(getCorrectAnswersLeft(40, 50)).toBe(2);
    expect(getCorrectAnswersLeft(48, 50)).toBe(1);
  });

  it("applies answer score with floor at zero", () => {
    expect(applyAnswerScore(10, 5)).toBe(15);
    expect(applyAnswerScore(1, -WRONG_PENALTY)).toBe(0);
  });

  it("returns points delta for correct and wrong", () => {
    expect(getPointsDelta(false)).toBe(-WRONG_PENALTY);
    expect(getPointsDelta(true)).toBe(CORRECT_POINTS);
    expect(getPointsDelta(true, { ms: 1000, age: 8 })).toBe(
      CORRECT_POINTS + FAST_BONUS,
    );
    expect(getPointsDelta(true, { ms: 10000, age: 8 })).toBe(CORRECT_POINTS);
  });
});
