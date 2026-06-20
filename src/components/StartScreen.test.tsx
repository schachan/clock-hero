import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StartScreen } from "./StartScreen";

describe("StartScreen", () => {
  it("renders greeting and features", () => {
    render(
      <StartScreen
        name="Alex"
        age={8}
        onNameChange={vi.fn()}
        onAgeChange={vi.fn()}
        onStart={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText("Ready, Alex?")).toBeInTheDocument();
    expect(screen.getByText(/18 levels/)).toBeInTheDocument();
  });

  it("handles name, age, start, and reset", async () => {
    const user = userEvent.setup();
    const onNameChange = vi.fn();
    const onAgeChange = vi.fn();
    const onStart = vi.fn();
    const onReset = vi.fn();

    render(
      <StartScreen
        name=""
        age={8}
        onNameChange={onNameChange}
        onAgeChange={onAgeChange}
        onStart={onStart}
        onReset={onReset}
      />,
    );

    await user.type(screen.getByPlaceholderText("Enter your name"), "Kim");
    expect(onNameChange).toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "10" }));
    expect(onAgeChange).toHaveBeenCalledWith(10);

    await user.click(screen.getByRole("button", { name: /Let's Go/i }));
    expect(onStart).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Reset saved progress/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
