import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createMockAudioContext() {
  const gainNode = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };
  const oscillator = {
    type: "sine",
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
  };
}

describe("audio", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes audio context", async () => {
    const mockCtx = createMockAudioContext();
    class AudioContextMock {
      state = mockCtx.state;
      currentTime = mockCtx.currentTime;
      destination = mockCtx.destination;
      resume = mockCtx.resume;
      createOscillator = mockCtx.createOscillator;
      createGain = mockCtx.createGain;
    }
    vi.stubGlobal("AudioContext", AudioContextMock);

    const { initAudio, soundGood, soundWin, soundBad, soundTick } = await import("./audio");
    const ctx = initAudio();
    expect(ctx).toBeInstanceOf(AudioContextMock);
    soundGood();
    soundWin();
    soundBad();
    soundTick();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it("handles missing audio support", async () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("unsupported");
        }
      },
    );
    const { initAudio, soundGood } = await import("./audio");
    expect(initAudio()).toBeNull();
    expect(() => soundGood()).not.toThrow();
  });
});
