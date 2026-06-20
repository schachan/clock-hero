import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Feedback } from "./Feedback";

const baseProps = {
  feedback: { visible: true, correct: true, ms: 2000 },
  current: { h: 3, m: 15 },
  answerH: "3",
  answerM: "15",
  streak: 0,
  fastMs: 7500,
  playerName: "Sam",
  levelName: "Quarters",
  levelNum: 4,
  onShowMe: vi.fn(),
  onNext: vi.fn(),
};

describe("Feedback", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <Feedback {...baseProps} feedback={{ visible: false, correct: true, ms: 0 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows level up state", () => {
    render(
      <Feedback
        {...baseProps}
        feedback={{ visible: true, correct: true, ms: 0, isLevelUp: true }}
      />,
    );
    expect(screen.getByText("Level Up!")).toBeInTheDocument();
  });

  it("shows correct feedback with fast bonus", () => {
    render(
      <Feedback
        {...baseProps}
        feedback={{ visible: true, correct: true, ms: 1000, pointsDelta: 7 }}
        streak={4}
      />,
    );
    expect(screen.getByText(/Super fast/)).toBeInTheDocument();
    expect(screen.getByText(/4 in a row/)).toBeInTheDocument();
  });

  it("shows wrong feedback with actions", async () => {
    const user = userEvent.setup();
    const onShowMe = vi.fn();
    const onNext = vi.fn();
    render(
      <Feedback
        {...baseProps}
        playerName=""
        feedback={{ visible: true, correct: false, ms: 4000, pointsDelta: -2 }}
        answerH="2"
        answerM="10"
        onShowMe={onShowMe}
        onNext={onNext}
      />,
    );
    expect(screen.getByText("Almost!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Show me/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(onShowMe).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });

  it("shows correct feedback without fast bonus breakdown", () => {
    render(
      <Feedback
        {...baseProps}
        playerName=""
        feedback={{ visible: true, correct: true, ms: 9000, pointsDelta: 5 }}
      />,
    );
    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.queryByText(/fast bonus/)).not.toBeInTheDocument();
  });
});
