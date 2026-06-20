import { describe, expect, it } from "vitest";
import { buildClockSVG, getWatchFacePalette } from "./clock";

describe("clock utils", () => {
  it("returns palette for watch faces", () => {
    const arabic = getWatchFacePalette("arabic-dots");
    const roman = getWatchFacePalette("roman-classic");
    expect(arabic.fill).toBe("#fffefb");
    expect(roman.fill).toBe("#faf6ee");
    expect(roman.numeralFont).toContain("Georgia");
  });

  it("builds SVG with hands and numerals", () => {
    const svg = buildClockSVG(3, 15, false, "arabic-dots");
    expect(svg).toContain("<defs>");
    expect(svg).toContain("polygon");
    expect(svg).toContain(">3<");
  });

  it("includes annotations when requested", () => {
    const svg = buildClockSVG(6, 30, true, "arabic-bars");
    expect(svg).toContain("stroke-dasharray");
  });

  it("renders different marker styles", () => {
    expect(buildClockSVG(1, 0, false, "arabic-pilot")).toContain("polygon");
    expect(buildClockSVG(1, 0, false, "arabic-bars")).toContain("stroke-linecap");
    expect(buildClockSVG(1, 0, false, "roman-minimal")).toContain("polygon");
  });

  it("renders different hand styles", () => {
    expect(buildClockSVG(1, 0, false, "arabic-bars")).toContain('stroke-width="6.5"');
    expect(buildClockSVG(1, 0, false, "roman-minimal")).toContain('stroke-width="3"');
    expect(buildClockSVG(1, 0, false, "roman-classic")).toContain("polygon");
  });

  it("uses instance id in gradient ids", () => {
    const svg = buildClockSVG(12, 0, false, "arabic-dots", "abc123");
    expect(svg).toContain("face-arabic-dots-abc123");
  });
});
