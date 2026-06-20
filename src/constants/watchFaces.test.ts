import { describe, expect, it } from "vitest";
import {
  DEFAULT_WATCH_FACE,
  formatClockNumeral,
  getWatchFace,
  ROMAN_NUMERALS,
  WATCH_FACES,
} from "./watchFaces";

describe("watchFaces", () => {
  it("returns known watch face config", () => {
    const face = getWatchFace("arabic-pilot");
    expect(face.label).toBe("Pilot");
    expect(face.markers).toBe("pilot");
  });

  it("falls back to default for unknown id", () => {
    const face = getWatchFace("unknown" as typeof DEFAULT_WATCH_FACE);
    expect(face.id).toBe(DEFAULT_WATCH_FACE);
  });

  it("formats arabic numerals", () => {
    expect(formatClockNumeral(7, "arabic-dots")).toBe("7");
  });

  it("formats roman numerals", () => {
    expect(formatClockNumeral(4, "roman-classic")).toBe("IV");
    expect(ROMAN_NUMERALS[3]).toBe("IV");
  });

  it("defines unique watch faces", () => {
    const ids = WATCH_FACES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
