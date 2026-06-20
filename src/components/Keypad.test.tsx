import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Keypad } from "./Keypad";

describe("Keypad", () => {
  it("renders digit buttons and check disabled when not ready", () => {
    render(
      <Keypad ready={false} onDigit={vi.fn()} onBackspace={vi.fn()} onCheck={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go/i })).toBeDisabled();
  });

  it("fires callbacks for digit, backspace, and check", async () => {
    const user = userEvent.setup();
    const onDigit = vi.fn();
    const onBackspace = vi.fn();
    const onCheck = vi.fn();
    render(
      <Keypad ready onDigit={onDigit} onBackspace={onBackspace} onCheck={onCheck} />,
    );

    await user.click(screen.getByRole("button", { name: "7" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "⌫" }));
    await user.click(screen.getByRole("button", { name: /Go/i }));

    expect(onDigit).toHaveBeenCalledWith("7");
    expect(onDigit).toHaveBeenCalledWith("0");
    expect(onBackspace).toHaveBeenCalled();
    expect(onCheck).toHaveBeenCalled();
  });
});
