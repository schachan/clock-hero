import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Clock } from "./Clock";
import { getWatchFacePalette } from "../utils/clock";
import { explainTime } from "../utils/explainTime";
import { fmtTime } from "../utils/timeWords";
import type { WatchFaceId } from "../constants/watchFaces";
import type { ReviewState } from "../types";

interface ReviewProps {
  review: ReviewState;
  watchFace: WatchFaceId;
  onClose: () => void;
}

export function Review({ review, watchFace, onClose }: ReviewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!review.open) return;

    const overlay = overlayRef.current;
    const host = hostRef.current;
    const card = cardRef.current;
    if (!overlay || !host || !card) return;

    const fitCard = () => {
      card.style.transform = "none";
      host.style.width = "";
      host.style.height = "";

      const pad = 4;
      const maxH = overlay.clientHeight - pad;
      const maxW = overlay.clientWidth - pad;
      const cardH = card.offsetHeight;
      const cardW = card.offsetWidth;
      if (cardH <= 0 || cardW <= 0 || maxH <= 0 || maxW <= 0) return;

      const scale = Math.min(1, maxH / cardH, maxW / cardW);
      if (scale < 1) {
        host.style.width = `${Math.floor(cardW * scale)}px`;
        host.style.height = `${Math.floor(cardH * scale)}px`;
        card.style.transform = `scale(${scale})`;
        card.style.transformOrigin = "top left";
      }
    };

    fitCard();
    const observer = new ResizeObserver(fitCard);
    observer.observe(overlay);
    return () => observer.disconnect();
  }, [review.open, review.h, review.m, review.gh, review.gm]);

  if (!review.open) return null;

  const palette = getWatchFacePalette(watchFace);
  const ex = explainTime(review.h, review.m, review.gh, review.gm, watchFace);
  const reviewStyle = {
    "--hour": palette.hourHand,
    "--minute": palette.minuteHand,
  } as CSSProperties;

  return (
    <div className="review" ref={overlayRef}>
      <div className="review-scale-host" ref={hostRef}>
        <div className="review-card" ref={cardRef} style={reviewStyle}>
          <h2>👀 Let&apos;s read the clock!</h2>
          <Clock
            h={review.h}
            m={review.m}
            className="clock review-clock"
            annotate
            face={watchFace}
          />
          <div className="review-legend">
            <span>
              <i className="dot hour" /> short hand = hour
            </span>
            <span>
              <i className="dot minute" /> long hand = minutes
            </span>
          </div>
          <ol className="review-steps">
            {ex.steps.map((step, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </ol>
          <div className="review-answer">
            The clock shows <b>{fmtTime(review.h, review.m)}</b> = <b>{ex.words}</b>
          </div>
          {ex.swap && (
            <div className="review-swap">
              🔄 Oops! Looks like the two hands got swapped. The{" "}
              <b style={{ color: palette.hourHand }}>short hand</b> tells the <b>hour</b>, the{" "}
              <b style={{ color: palette.minuteHand }}>long hand</b> tells the <b>minutes</b>.
            </div>
          )}
          {ex.diffs.length > 0 && (
            <div className="review-diff">
              {ex.diffs.map((d, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: "• " + d }} />
              ))}
            </div>
          )}
          <button className="big-btn review-done" type="button" onClick={onClose}>
            Got it! 👍
          </button>
        </div>
      </div>
    </div>
  );
}
