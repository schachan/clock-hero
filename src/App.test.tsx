import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { paths } from "./routes/paths";
import {
  defaultLevelProgress,
  defaultPlayerProgress,
  savePlayerAge,
  savePlayerName,
  savePlayerProgress,
} from "./utils/storage";

vi.mock("./utils/audio", () => ({
  initAudio: vi.fn(),
  soundGood: vi.fn(),
  soundBad: vi.fn(),
  soundTick: vi.fn(),
  soundWin: vi.fn(),
}));

function seedProgress() {
  const progress = defaultPlayerProgress(8);
  const tier = defaultLevelProgress();
  tier[0] = { ...tier[0], unlocked: true };
  tier[1] = { ...tier[1], unlocked: true };
  progress.byAge[8] = tier;
  savePlayerName("Alex");
  savePlayerAge(8);
  savePlayerProgress("Alex", progress);
}

describe("App", () => {
  it("renders start screen by default", () => {
    render(
      <MemoryRouter initialEntries={[paths.start]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Clock/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Let's Go/i })).toBeInTheDocument();
  });

  it("navigates to level map after start", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[paths.start]}>
        <App />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("Enter your name"), "Test");
    await user.click(screen.getByRole("button", { name: /Let's Go/i }));

    expect(screen.getByText(/Pick a Level/)).toBeInTheDocument();
  });

  it("redirects invalid game route to levels", () => {
    seedProgress();
    render(
      <MemoryRouter initialEntries={["/game/999"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Pick a Level/)).toBeInTheDocument();
  });

  it("redirects unknown routes to start", () => {
    render(
      <MemoryRouter initialEntries={["/unknown-route"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Clock/)).toBeInTheDocument();
  });

  it("shows level complete screen with navigation state", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: paths.levelComplete,
            state: { correct: 8, wrong: 2, levelIndex: 0 },
          },
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Level Complete!")).toBeInTheDocument();
  });

  it("shows win screen with navigation state", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: paths.win,
            state: {
              accuracy: 95,
              avgSpeed: 3.2,
              totalQuestions: 20,
              unlockedNextAge: true,
              nextAge: 9,
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Time Master/)).toBeInTheDocument();
  });

  it("redirects level complete without state", () => {
    seedProgress();
    render(
      <MemoryRouter initialEntries={[paths.levelComplete]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Pick a Level/)).toBeInTheDocument();
  });

  it("opens game for unlocked level", async () => {
    seedProgress();
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[paths.levels]}>
        <App />
      </MemoryRouter>,
    );

    const playButtons = screen.getAllByRole("button", { name: /Play/i });
    await user.click(playButtons[0]!);
    expect(screen.getByText("O'clock · Dotty")).toBeInTheDocument();
  });

  it("resets progress from start screen", async () => {
    seedProgress();
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={[paths.start]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Reset saved progress/i }));
    expect(screen.getByText(/Ready to play/)).toBeInTheDocument();
  });

  it("cancels reset when confirmation is declined", async () => {
    seedProgress();
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={[paths.start]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue("Alex")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Reset saved progress/i }));
    expect(screen.getByDisplayValue("Alex")).toBeInTheDocument();
  });

  it("selects challenge age on level map", async () => {
    const progress = defaultPlayerProgress(8);
    progress.maxUnlockedAge = 9;
    const tier = defaultLevelProgress();
    progress.byAge[8] = tier;
    progress.byAge[9] = defaultLevelProgress();
    savePlayerName("AgeUser");
    savePlayerAge(8);
    savePlayerProgress("AgeUser", progress);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[paths.levels]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("tab", { name: "Age 9" }));
    expect(screen.getByText(/Age 9 challenge/)).toBeInTheDocument();
  });

  it("play again reloads progress from win screen", async () => {
    seedProgress();
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: paths.win,
            state: {
              accuracy: 90,
              avgSpeed: 4,
              totalQuestions: 10,
              unlockedNextAge: false,
              nextAge: 8,
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Play Again/i }));
    await waitFor(() => {
      expect(screen.getByText(/Pick a Level/)).toBeInTheDocument();
    });
  });
});
