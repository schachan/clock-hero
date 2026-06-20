import { describe, expect, it } from "vitest";
import { CHAPTER_END_INDICES, getLevelWatchFace, LEVELS } from "./levels";

describe("levels", () => {
  it("defines 18 levels in 6 chapters", () => {
    expect(LEVELS).toHaveLength(18);
    expect(CHAPTER_END_INDICES).toHaveLength(6);
  });

  it("returns watch face for valid level", () => {
    expect(getLevelWatchFace(0)).toBe("arabic-dots");
    expect(getLevelWatchFace(17)).toBe("roman-traditional");
  });

  it("falls back for out-of-range level", () => {
    expect(getLevelWatchFace(99)).toBe(LEVELS[0].watchFace);
  });

  it("assigns unique watch faces per chapter", () => {
    const chapters = new Set(LEVELS.map((l) => l.chapter));
    expect(chapters.size).toBe(6);
  });
});
