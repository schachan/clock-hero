import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LevelCompleteScreen } from "./LevelCompleteScreen";

describe("LevelCompleteScreen", () => {
  it("shows completion stats and next level hint", async () => {
    const user = userEvent.setup();
    const onBackToMap = vi.fn();
    render(
      <LevelCompleteScreen
        playerName="Riley"
        levelIndex={0}
        correct={8}
        wrong={2}
        onBackToMap={onBackToMap}
      />,
    );

    expect(screen.getByText("Level Complete!")).toBeInTheDocument();
    expect(screen.getByText(/Great job, Riley/)).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText(/Next up/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Back to Levels/i }));
    expect(onBackToMap).toHaveBeenCalled();
  });
});
