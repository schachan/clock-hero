let actx: AudioContext | null = null;

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  when = 0,
  gain = 0.25,
): void {
  if (!actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(actx.destination);
  const t = actx.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function initAudio(): AudioContext | null {
  try {
    actx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (actx.state === "suspended") {
      void actx.resume();
    }
  } catch {
    actx = null;
  }
  return actx;
}

export function soundGood(): void {
  tone(660, 0.12, "triangle", 0);
  tone(880, 0.16, "triangle", 0.1);
  tone(1320, 0.2, "triangle", 0.2);
}

export function soundWin(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", i * 0.13, 0.3));
}

export function soundBad(): void {
  tone(300, 0.18, "sine", 0, 0.18);
  tone(200, 0.22, "sine", 0.12, 0.18);
}

export function soundTick(): void {
  tone(900, 0.04, "square", 0, 0.06);
}
