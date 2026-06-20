import { describe, expect, it } from "vitest";
import { paths } from "./paths";

describe("paths", () => {
  it("defines route paths", () => {
    expect(paths.start).toBe("/");
    expect(paths.levels).toBe("/levels");
    expect(paths.game(3)).toBe("/game/3");
    expect(paths.levelComplete).toBe("/level-complete");
    expect(paths.win).toBe("/win");
  });
});
