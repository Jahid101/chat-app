let ctx: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Call from a user-gesture handler once so browsers allow playback later.
export function unlockAudio() {
  ensureContext();
}

// Soft two-tone "ding" synthesized on the fly — no audio assets needed.
export function playMessageChime() {
  const audio = ensureContext();
  if (!audio || audio.state === "suspended") return;

  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.value = 0.14;
  master.connect(audio.destination);

  const notes: Array<[number, number]> = [
    [987.77, 0], // B5
    [1318.51, 0.13], // E6
  ];

  for (const [frequency, delay] of notes) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const start = now + delay;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(1, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + 0.5);
  }
}
