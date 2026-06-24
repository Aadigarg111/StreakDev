type FeedbackKind = "tap" | "correct" | "wrong" | "complete" | "streak";

const vibrationPatterns: Record<FeedbackKind, number | number[]> = {
  tap: 8,
  correct: 15,
  wrong: [30, 50, 30],
  complete: [35, 45, 60],
  streak: [20, 35, 55],
};

function vibrate(kind: FeedbackKind) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(vibrationPatterns[kind]);
}

function playTone(frequencies: number[], duration = 0.08) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContext =
    window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0.04;
  gain.connect(context.destination);

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * duration);
    oscillator.stop(context.currentTime + (index + 1) * duration);
  });

  window.setTimeout(() => void context.close(), frequencies.length * duration * 1000 + 120);
}

export function playFeedback(kind: FeedbackKind) {
  vibrate(kind);

  if (kind === "tap") {
    playTone([420], 0.035);
  }

  if (kind === "correct") {
    playTone([520, 740, 920], 0.055);
  }

  if (kind === "wrong") {
    playTone([160, 120], 0.09);
  }

  if (kind === "complete") {
    playTone([420, 560, 720, 960], 0.075);
  }

  if (kind === "streak") {
    playTone([300, 620], 0.1);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
