import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "./Game";

vi.mock("../utils/audio", () => ({
  soundGood: vi.fn(),
  soundBad: vi.fn(),
  soundTick: vi.fn(),
  soundWin: vi.fn(),
}));

vi.mock("../utils/confetti", () => ({
  confettiBurst: vi.fn(),
}));

describe("Game", () => {
  const appRef = createRef<HTMLDivElement>();
  const onHistoryChange = vi.fn();
  const onLevelComplete = vi.fn();
  const onWin = vi.fn();
  const onProgressChange = vi.fn();
  const onBackToMap = vi.fn();

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderGame(levelIndex = 0) {
    return render(
      <div ref={appRef}>
        <Game
          playerName="Sam"
          playerAge={8}
          levelIndex={levelIndex}
          history={[]}
          onHistoryChange={onHistoryChange}
          onLevelComplete={onLevelComplete}
          onWin={onWin}
          onProgressChange={onProgressChange}
          onBackToMap={onBackToMap}
          appRef={appRef}
        />
      </div>,
    );
  }

  it("renders game HUD and keypad", () => {
    renderGame();
    expect(screen.getByText("O'clock · Dotty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go/i })).toBeDisabled();
  });

  it("accepts a correct answer", async () => {
    const user = userEvent.setup();
    renderGame();

    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));

    expect(screen.getByText(/Correct/)).toBeInTheDocument();
    expect(onHistoryChange).toHaveBeenCalled();
    expect(onProgressChange).toHaveBeenCalled();
  });

  it("shows review flow for wrong answers", async () => {
    const user = userEvent.setup();
    renderGame();

    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));

    expect(screen.getByText("Almost!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Show me/i }));
    expect(screen.getByText(/Let's read the clock/)).toBeInTheDocument();
  });

  it("navigates back to map", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "🗺️" }));
    expect(onBackToMap).toHaveBeenCalled();
  });

  it("handles keyboard digit entry and navigation", () => {
    const { container } = renderGame();
    fireEvent.keyDown(document, { key: "1" });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    fireEvent.keyDown(document, { key: "5" });
    const boxes = container.querySelectorAll(".timebox");
    expect(boxes[0]).toHaveTextContent("1");
    expect(boxes[1]).toHaveTextContent("5");
    fireEvent.keyDown(document, { key: "Backspace" });
    expect(boxes[1]).toHaveTextContent("--");
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(boxes[0]).toHaveClass("active");
  });

  it("resets level after confirmation", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));
    await user.click(screen.getByRole("button", { name: "↺" }));
    expect(onProgressChange).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 0, wrong: 0, score: 0 }),
    );
  });

  it("continues after wrong answer feedback", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(screen.queryByText("Almost!")).not.toBeInTheDocument();
  });

  it("clears level history after confirmation", async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onHistoryChange).toHaveBeenCalledWith([]);
  });

  it("skips reset when confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));
    const callsBeforeReset = onProgressChange.mock.calls.length;
    await user.click(screen.getByRole("button", { name: "↺" }));
    expect(onProgressChange.mock.calls.length).toBe(callsBeforeReset);
  });

  it("closes review overlay with escape", () => {
    renderGame();
    fireEvent.keyDown(document, { key: "2" });
    fireEvent.keyDown(document, { key: "0" });
    fireEvent.click(screen.getByRole("button", { name: /Go/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show me/i }));
    expect(screen.getByText(/Let's read the clock/)).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText(/Let's read the clock/)).not.toBeInTheDocument();
  });
});
