import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { HistoryEntry } from "../types";
import { History, HistoryStats } from "./History";

const entries: HistoryEntry[] = [
  { n: 1, h: 3, m: 15, gh: 3, gm: 15, correct: true, ms: 2000, level: 0 },
  { n: 2, h: 4, m: 30, gh: 4, gm: 20, correct: false, ms: 5000, level: 0 },
];

describe("History", () => {
  it("shows empty state", () => {
    render(
      <History
        history={[]}
        onClear={vi.fn()}
        onReviewAttempt={vi.fn()}
      />,
    );
    expect(screen.getByText(/No attempts yet/)).toBeInTheDocument();
  });

  it("renders attempts and handles review on wrong answers", async () => {
    const user = userEvent.setup();
    const onReviewAttempt = vi.fn();
    render(
      <History
        history={entries}
        levelFilter={0}
        fastMs={7500}
        showStats
        layout="sidebar"
        onClear={vi.fn()}
        onReviewAttempt={onReviewAttempt}
      />,
    );

    expect(screen.getByText(/Attempts/)).toBeInTheDocument();
    await user.click(screen.getByText(/typed 4:20/));
    expect(onReviewAttempt).toHaveBeenCalledWith(4, 30, 4, 20);
  });

  it("clears history", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <History history={entries} onClear={onClear} onReviewAttempt={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalled();
  });
});

describe("HistoryStats", () => {
  it("renders compact and default stat cards", () => {
    const { rerender } = render(<HistoryStats history={entries} levelFilter={0} />);
    expect(screen.getByText("accuracy")).toBeInTheDocument();

    rerender(<HistoryStats history={entries} levelFilter={0} compact />);
    expect(screen.getByText("avg speed")).toBeInTheDocument();
  });
});
