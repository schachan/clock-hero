import { fmtTime } from "../utils/timeWords";
import type { HistoryEntry } from "../types";

function useHistoryStats(history: HistoryEntry[], levelFilter?: number) {
  const filtered =
    levelFilter != null ? history.filter((a) => a.level === levelFilter) : history;
  const total = filtered.length;
  const correct = filtered.filter((a) => a.correct).length;
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const times = filtered.filter((a) => a.correct).map((a) => a.ms);
  const avg = times.length ? times.reduce((s, t) => s + t, 0) / times.length / 1000 : 0;
  const best = times.length ? Math.min(...times) / 1000 : 0;

  return {
    filtered,
    total,
    cards: [
      { b: total, s: "attempts" },
      { b: acc + "%", s: "accuracy" },
      { b: avg ? avg.toFixed(1) + "s" : "–", s: "avg speed" },
      { b: best ? best.toFixed(1) + "s" : "–", s: "best speed" },
    ],
  };
}

interface HistoryStatsProps {
  history: HistoryEntry[];
  levelFilter?: number;
}

export function HistoryStats({ history, levelFilter, compact = false }: HistoryStatsProps & { compact?: boolean }) {
  const { cards } = useHistoryStats(history, levelFilter);

  if (compact) {
    return (
      <div className="stat-cards stat-cards--compact">
        {cards.map((c) => (
          <div key={c.s} className="stat-card stat-card--compact">
            <b>{c.b}</b>
            <span>{c.s}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stat-cards">
      {cards.map((c) => (
        <div key={c.s} className="stat-card">
          <b>{c.b}</b>
          <span>{c.s}</span>
        </div>
      ))}
    </div>
  );
}

interface HistoryProps {
  history: HistoryEntry[];
  levelFilter?: number;
  layout?: "default" | "sidebar";
  fastMs?: number;
  showStats?: boolean;
  onClear: () => void;
  onReviewAttempt: (h: number, m: number, gh: number, gm: number) => void;
}

export function History({
  history,
  levelFilter,
  layout = "default",
  fastMs,
  showStats = false,
  onClear,
  onReviewAttempt,
}: HistoryProps) {
  const { filtered, total } = useHistoryStats(history, levelFilter);

  return (
    <div className={`history${layout === "sidebar" ? " history--sidebar" : ""}`}>
      <div className="history-head">
        <h3>{layout === "sidebar" ? "Attempts" : levelFilter != null ? `Level ${levelFilter + 1} Attempts` : "My Attempts"}</h3>
        <button className="clear-hist" type="button" onClick={onClear}>
          Clear
        </button>
      </div>
      {showStats && layout === "sidebar" ? (
        <HistoryStats history={history} levelFilter={levelFilter} compact />
      ) : null}
      <div className="attempts">
        {!total ? (
          <div className="hist-empty">No attempts yet — start playing! 🕐</div>
        ) : (
          filtered.map((a) => {
            const secs = (a.ms / 1000).toFixed(1);
            const fast = fastMs != null && a.ms <= fastMs && a.correct;
            const gaveCls = a.correct ? "gave" : "gave wrong";
            const lvl =
              a.level != null ? <span className="lvtag">L{a.level + 1}</span> : null;

            return (
              <div
                key={a.n}
                className={`attempt ${a.correct ? "ok" : "no"}`}
                title={a.correct ? undefined : "Tap to see why"}
                onClick={() => {
                  if (!a.correct) onReviewAttempt(a.h, a.m, a.gh, a.gm);
                }}
                role={a.correct ? undefined : "button"}
                tabIndex={a.correct ? undefined : 0}
                onKeyDown={(e) => {
                  if (!a.correct && (e.key === "Enter" || e.key === " ")) {
                    onReviewAttempt(a.h, a.m, a.gh, a.gm);
                  }
                }}
              >
                <span className="idx">#{a.n}</span>
                <span className="shown">
                  🕐 {fmtTime(a.h, a.m)} {lvl}
                </span>
                <span className={gaveCls}>typed {fmtTime(a.gh, a.gm)}</span>
                <span className={`secs${fast ? " fast" : ""}`}>{secs}s</span>
                <span className="mark">{a.correct ? "✅" : "👀"}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
