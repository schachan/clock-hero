import { describe, expect, it } from "vitest";
import { explainTime } from "./explainTime";

describe("explainTime", () => {
  it("explains o'clock times", () => {
    const result = explainTime(3, 0, 3, 0);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[1]).toContain("0 minutes");
    expect(result.words).toBe("three o'clock");
    expect(result.diffs).toHaveLength(0);
    expect(result.swap).toBe(false);
  });

  it("explains five-minute marks", () => {
    const result = explainTime(4, 15, 4, 15);
    expect(result.steps[1]).toContain("3×5");
    expect(result.words).toBe("quarter past four");
  });

  it("explains non-mark minutes", () => {
    const result = explainTime(2, 7, 2, 7);
    expect(result.steps[1]).toContain("7 minutes");
  });

  it("reports hour and minute diffs", () => {
    const result = explainTime(5, 30, 3, 15);
    expect(result.diffs).toHaveLength(2);
    expect(result.diffs[0]).toContain("hour");
    expect(result.diffs[1]).toContain("minutes");
  });

  it("detects swapped hands", () => {
    const result = explainTime(3, 15, 3, 15);
    expect(result.swap).toBe(true);
  });

  it("uses roman numerals for roman faces", () => {
    const result = explainTime(6, 0, 6, 0, "roman-classic");
    expect(result.steps[0]).toContain("VI");
  });
});
