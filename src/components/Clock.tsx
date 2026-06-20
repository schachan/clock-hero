import { useId } from "react";
import { DEFAULT_WATCH_FACE, type WatchFaceId } from "../constants/watchFaces";
import { buildClockSVG } from "../utils/clock";

interface ClockProps {
  h: number;
  m: number;
  className?: string;
  annotate?: boolean;
  face?: WatchFaceId;
}

export function Clock({
  h,
  m,
  className = "clock",
  annotate = false,
  face = DEFAULT_WATCH_FACE,
}: ClockProps) {
  const instanceId = useId().replace(/:/g, "");

  return (
    <div className="clock-shell">
      <svg
        className={className}
        viewBox="0 0 200 200"
        dangerouslySetInnerHTML={{
          __html: buildClockSVG(h, m, annotate, face, instanceId),
        }}
      />
    </div>
  );
}
