import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WinScreen } from "./WinScreen";

describe("WinScreen", () => {
  it("shows win stats and unlock message", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(
      <WinScreen
        playerName="Jo"
        accuracy={92}
        avgSpeed={4.2}
        totalQuestions={25}
        unlockedNextAge
        nextAge={9}
        onPlayAgain={onPlayAgain}
      />,
    );

    expect(screen.getByText("Jo — Time Master!")).toBeInTheDocument();
    expect(screen.getByText(/unlocked Age 9/)).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Play Again/i }));
    expect(onPlayAgain).toHaveBeenCalled();
  });
});
