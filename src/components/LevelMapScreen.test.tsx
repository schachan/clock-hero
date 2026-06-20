import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { defaultLevelProgress } from "../utils/storage";
import { LevelMapScreen } from "./LevelMapScreen";

describe("LevelMapScreen", () => {
  const levelProgress = defaultLevelProgress();
  levelProgress[0] = { ...levelProgress[0], unlocked: true, completed: true };
  levelProgress[1] = { ...levelProgress[1], unlocked: true };

  it("renders levels and age picker", () => {
    render(
      <MemoryRouter>
        <LevelMapScreen
          playerName="Casey"
          registeredAge={8}
          challengeAge={8}
          maxUnlockedAge={9}
          levelProgress={levelProgress}
          onSelectChallengeAge={vi.fn()}
          onSelectLevel={vi.fn()}
          onReset={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Hi Casey/)).toBeInTheDocument();
    expect(screen.getByText(/O'clock · Dotty/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Age 9" })).toBeInTheDocument();
    expect(screen.getByTitle(/Complete all levels at Age 9 to unlock/)).toBeInTheDocument();
  });

  it("selects age and level", async () => {
    const user = userEvent.setup();
    const onSelectChallengeAge = vi.fn();
    const onSelectLevel = vi.fn();
    render(
      <MemoryRouter>
        <LevelMapScreen
          playerName=""
          registeredAge={8}
          challengeAge={8}
          maxUnlockedAge={8}
          levelProgress={levelProgress}
          onSelectChallengeAge={onSelectChallengeAge}
          onSelectLevel={onSelectLevel}
          onReset={vi.fn()}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("tab", { name: "Age 8" }));
    expect(onSelectChallengeAge).toHaveBeenCalledWith(8);

    const playButtons = screen.getAllByRole("button", { name: /Play/i });
    await user.click(playButtons[1]!);
    expect(onSelectLevel).toHaveBeenCalledWith(1);
  });
});
