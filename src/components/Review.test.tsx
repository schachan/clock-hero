import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Review } from "./Review";

describe("Review", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Review
        review={{ open: false, h: 3, m: 15, gh: 2, gm: 10, returnsToFeedback: false }}
        watchFace="arabic-dots"
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows explanation when open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Review
        review={{ open: true, h: 3, m: 15, gh: 2, gm: 10, returnsToFeedback: false }}
        watchFace="arabic-dots"
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/Let's read the clock/)).toBeInTheDocument();
    expect(screen.getByText(/quarter past three/i)).toBeInTheDocument();
    expect(screen.getByText(/You wrote hour/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Got it/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
