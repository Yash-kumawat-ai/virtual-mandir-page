let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** Synthesized brass temple bell chime (no audio files needed). */
export function playBellChime() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  // A bell is a mix of inharmonic partials with long decay
  const partials = [
    { freq: 523.25, gain: 0.5, decay: 2.6 },
    { freq: 1046.5, gain: 0.25, decay: 2.0 },
    { freq: 1568.0, gain: 0.12, decay: 1.4 },
    { freq: 661.0, gain: 0.18, decay: 2.2 },
  ]
  for (const p of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(p.freq, now)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(p.gain, now + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + p.decay + 0.1)
  }
}

/** Soft, warm tone when lighting the diya. */
export function playDiyaTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.8)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.1)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 1.3)
}

/** Gentle chime for flower offering. */
export function playFlowerTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const freqs = [783.99, 987.77]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, now + i * 0.12)
    g.gain.setValueAtTime(0.0001, now + i * 0.12)
    g.gain.exponentialRampToValueAtTime(0.08, now + i * 0.12 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.9)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 1)
  })
}
