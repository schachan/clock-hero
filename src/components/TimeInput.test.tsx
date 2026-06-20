import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimeInput } from "./TimeInput";

describe("TimeInput", () => {
  it("shows placeholders when empty", () => {
    render(
      <TimeInput
        answerH=""
        answerM=""
        activeBox="h"
        locked={false}
        onSelectBox={vi.fn()}
      />,
    );
    expect(screen.getAllByText("--")).toHaveLength(2);
  });

  it("shows entered values and active box", () => {
    const { container } = render(
      <TimeInput
        answerH="4"
        answerM="30"
        activeBox="m"
        locked={false}
        onSelectBox={vi.fn()}
      />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(container.querySelector(".timebox.active")).toHaveTextContent("30");
  });

  it("selects boxes when clicked", async () => {
    const user = userEvent.setup();
    const onSelectBox = vi.fn();
    render(
      <TimeInput
        answerH="1"
        answerM="5"
        activeBox="h"
        locked={false}
        onSelectBox={onSelectBox}
      />,
    );
    await user.click(screen.getByText("5"));
    expect(onSelectBox).toHaveBeenCalledWith("m");
  });

  it("selects hour box via keyboard", async () => {
    const user = userEvent.setup();
    const onSelectBox = vi.fn();
    render(
      <TimeInput
        answerH="1"
        answerM="5"
        activeBox="m"
        locked={false}
        onSelectBox={onSelectBox}
      />,
    );
    const hourBox = screen.getAllByRole("button")[0]!;
    hourBox.focus();
    await user.keyboard("{Enter}");
    expect(onSelectBox).toHaveBeenCalledWith("h");
  });

  it("selects minute box via space key", async () => {
    const user = userEvent.setup();
    const onSelectBox = vi.fn();
    render(
      <TimeInput
        answerH="1"
        answerM="5"
        activeBox="h"
        locked={false}
        onSelectBox={onSelectBox}
      />,
    );
    const minuteBox = screen.getAllByRole("button")[1]!;
    minuteBox.focus();
    await user.keyboard(" ");
    expect(onSelectBox).toHaveBeenCalledWith("m");
  });

  it("does not select when locked", async () => {
    const user = userEvent.setup();
    const onSelectBox = vi.fn();
    render(
      <TimeInput
        answerH="1"
        answerM="5"
        activeBox="h"
        locked
        onSelectBox={onSelectBox}
      />,
    );
    await user.click(screen.getByText("5"));
    expect(onSelectBox).not.toHaveBeenCalled();
  });
});
