import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Clock } from "./Clock";

describe("Clock", () => {
  it("renders an svg clock face", () => {
    const { container } = render(<Clock h={4} m={20} />);
    const svg = container.querySelector("svg.clock");
    expect(svg).toBeInTheDocument();
    expect(svg?.innerHTML).toContain("polygon");
  });

  it("supports annotation and custom face", () => {
    const { container } = render(
      <Clock h={6} m={30} annotate face="roman-classic" className="custom-clock" />,
    );
    const svg = container.querySelector("svg.custom-clock");
    expect(svg?.innerHTML).toContain("stroke-dasharray");
    expect(svg?.innerHTML).toContain("XII");
  });
});
