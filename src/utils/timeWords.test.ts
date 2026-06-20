import { describe, expect, it } from "vitest";
import { fmtTime, timeInWords } from "./timeWords";

describe("timeInWords", () => {
  it("returns o'clock for zero minutes", () => {
    expect(timeInWords(3, 0)).toBe("three o'clock");
    expect(timeInWords(12, 0)).toBe("twelve o'clock");
  });

  it("returns quarter and half phrases", () => {
    expect(timeInWords(3, 15)).toBe("quarter past three");
    expect(timeInWords(6, 30)).toBe("half past six");
    expect(timeInWords(4, 45)).toBe("quarter to five");
  });

  it("returns minutes past for under 30", () => {
    expect(timeInWords(2, 5)).toBe("five minutes past two");
    expect(timeInWords(1, 1)).toBe("one minute past one");
    expect(timeInWords(11, 22)).toBe("twenty-two minutes past eleven");
  });

  it("returns minutes to for over 30", () => {
    expect(timeInWords(3, 40)).toBe("twenty minutes to four");
    expect(timeInWords(7, 59)).toBe("one minute to eight");
  });
});

describe("fmtTime", () => {
  it("pads minutes to two digits", () => {
    expect(fmtTime(3, 5)).toBe("3:05");
    expect(fmtTime(12, 0)).toBe("12:00");
    expect(fmtTime(9, 45)).toBe("9:45");
  });
});
