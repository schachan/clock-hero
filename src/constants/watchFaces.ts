export type WatchFaceId =
  | "arabic-dots"
  | "arabic-bars"
  | "arabic-minimal"
  | "arabic-pilot"
  | "roman-minimal"
  | "roman-simple"
  | "roman-classic"
  | "roman-traditional";

export type NumeralStyle = "arabic" | "roman";
export type MarkerStyle = "dots" | "ticks" | "bars" | "pilot" | "arrow-dots";
export type HandStyle = "tapered" | "bars" | "thin" | "classic";

export interface WatchFaceConfig {
  id: WatchFaceId;
  label: string;
  complexity: 1 | 2 | 3;
  numerals: NumeralStyle;
  markers: MarkerStyle;
  hands: HandStyle;
}

/** Roman labels at clock positions 1–12 (index n-1). */
export const ROMAN_NUMERALS: readonly string[] = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export const COMPLEXITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

export const DEFAULT_WATCH_FACE: WatchFaceId = "arabic-dots";

export const WATCH_FACES: WatchFaceConfig[] = [
  {
    id: "arabic-dots",
    label: "Dotty",
    complexity: 1,
    numerals: "arabic",
    markers: "dots",
    hands: "tapered",
  },
  {
    id: "arabic-bars",
    label: "Bold",
    complexity: 1,
    numerals: "arabic",
    markers: "bars",
    hands: "bars",
  },
  {
    id: "arabic-minimal",
    label: "Simple",
    complexity: 1,
    numerals: "arabic",
    markers: "ticks",
    hands: "bars",
  },
  {
    id: "arabic-pilot",
    label: "Pilot",
    complexity: 2,
    numerals: "arabic",
    markers: "pilot",
    hands: "tapered",
  },
  {
    id: "roman-minimal",
    label: "Elegant",
    complexity: 2,
    numerals: "roman",
    markers: "arrow-dots",
    hands: "thin",
  },
  {
    id: "roman-simple",
    label: "Classic",
    complexity: 2,
    numerals: "roman",
    markers: "dots",
    hands: "tapered",
  },
  {
    id: "roman-classic",
    label: "Grand",
    complexity: 3,
    numerals: "roman",
    markers: "ticks",
    hands: "classic",
  },
  {
    id: "roman-traditional",
    label: "Royal",
    complexity: 3,
    numerals: "roman",
    markers: "ticks",
    hands: "tapered",
  },
];

const FACE_MAP = new Map(WATCH_FACES.map((f) => [f.id, f]));

export function getWatchFace(id: WatchFaceId): WatchFaceConfig {
  const face = FACE_MAP.get(id);
  if (!face) return WATCH_FACES[0];
  return face;
}

/** Clock-face label for hour/minute marks (Arabic digit or Roman numeral). */
export function formatClockNumeral(n: number, faceId: WatchFaceId): string {
  const face = getWatchFace(faceId);
  if (face.numerals === "roman") {
    return ROMAN_NUMERALS[n - 1] ?? String(n);
  }
  return String(n);
}
