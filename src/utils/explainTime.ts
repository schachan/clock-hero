import {
  DEFAULT_WATCH_FACE,
  formatClockNumeral,
  type WatchFaceId,
} from "../constants/watchFaces";
import { getWatchFacePalette } from "./clock";
import { timeInWords } from "./timeWords";

function clockMark(m: number): number | null {
  if (m % 5 !== 0) return null;
  const n = m / 5;
  return n === 0 ? 12 : n;
}

export interface ExplainResult {
  steps: string[];
  diffs: string[];
  swap: boolean;
  words: string;
}

export function explainTime(
  h: number,
  m: number,
  gh: number,
  gm: number,
  faceId: WatchFaceId = DEFAULT_WATCH_FACE,
): ExplainResult {
  const steps: string[] = [];
  const diffs: string[] = [];
  const palette = getWatchFacePalette(faceId);
  const hourLabel = formatClockNumeral(h, faceId);
  const twelveLabel = formatClockNumeral(12, faceId);

  steps.push(
    `👉 The <b style="color:${palette.hourHand}">short hand</b> points near the <b>${hourLabel}</b> — so the hour is <b>${hourLabel}</b>.`,
  );

  if (m === 0) {
    steps.push(
      `👉 The <b style="color:${palette.minuteHand}">long hand</b> points straight up to <b>${twelveLabel}</b> — that means <b>0 minutes</b> (o'clock).`,
    );
  } else {
    const mk = clockMark(m);
    if (mk) {
      const markLabel = formatClockNumeral(mk, faceId);
      steps.push(
        `👉 The <b style="color:${palette.minuteHand}">long hand</b> points to the <b>${markLabel}</b>. Count by 5s: ${mk}×5 = <b>${m} minutes</b>.`,
      );
    } else {
      steps.push(
        `👉 The <b style="color:${palette.minuteHand}">long hand</b> is <b>${m} minutes</b> around the clock (between the marks).`,
      );
    }
  }

  const mk = clockMark(m);
  const hMarkMin = (h % 12) * 5;
  const swap =
    mk != null &&
    Number.isFinite(gh) &&
    Number.isFinite(gm) &&
    gh === mk &&
    gm === hMarkMin;

  if (Number.isFinite(gh) && gh !== h) {
    diffs.push(`You wrote hour <b>${gh}</b>, but the short hand was at <b>${h}</b>.`);
  }
  if (Number.isFinite(gm) && gm !== m) {
    diffs.push(`You wrote <b>${gm}</b> minutes, but the long hand was at <b>${m}</b>.`);
  }

  return { steps, diffs, swap, words: timeInWords(h, m) };
}
