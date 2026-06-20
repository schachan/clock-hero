import { describe, expect, it, vi } from "vitest";
import { confettiBurst } from "./confetti";

describe("confettiBurst", () => {
  it("creates and animates confetti elements", () => {
    const animate = vi
      .spyOn(HTMLElement.prototype, "animate")
      .mockReturnValue({ onfinish: null } as Animation);

    const container = document.createElement("div");
    const appendChild = vi.spyOn(container, "appendChild");

    confettiBurst(container, 3);

    expect(appendChild).toHaveBeenCalledTimes(3);
    expect(animate).toHaveBeenCalledTimes(3);
  });

  it("removes confetti when animation finishes", () => {
    const animation = { onfinish: null as (() => void) | null };
    vi.spyOn(HTMLElement.prototype, "animate").mockReturnValue(
      animation as unknown as Animation,
    );

    const container = document.createElement("div");
    confettiBurst(container, 1);
    animation.onfinish?.();
    expect(container.childNodes).toHaveLength(0);
  });
});
