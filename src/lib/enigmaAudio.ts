/**
 * Diegetic Web Audio Procedural Synthesizer for NOCTURNE.
 * Off by default; respects browser autoplay rules; zero external .mp3 dependencies.
 */

class EnigmaAudioEngine {
  private ctx: AudioContext | null = null
  private windNode: AudioNode | null = null
  private windGain: GainNode | null = null
  private enabled = false

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx()
      } catch {
        return null
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  setEnabled(next: boolean): void {
    this.enabled = next
    if (!next) {
      this.stopAtmosphere()
      return
    }
    this.startAtmosphere()
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private startAtmosphere(): void {
    const ctx = this.ensureContext()
    if (!ctx || this.windNode) return

    try {
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
      }

      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 180

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 1.2)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start()

      this.windNode = noise
      this.windGain = gain
    } catch {
      // Ignore audio restrictions in headless environments
    }
  }

  private stopAtmosphere(): void {
    if (this.windGain && this.ctx) {
      try {
        this.windGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15)
      } catch {
        // ignore
      }
    }
    if (this.windNode) {
      try {
        ;(this.windNode as AudioBufferSourceNode).stop()
        this.windNode.disconnect()
      } catch {
        // ignore
      }
      this.windNode = null
      this.windGain = null
    }
  }

  /** Mechanical pocket-watch escapement tick on active auction hover */
  playWatchTick(): void {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1950, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.028)

      gain.gain.setValueAtTime(0.045, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.032)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.035)
    } catch {
      // ignore
    }
  }

  /** Low resonant bronze gavel chime on bid confirmation or initiation unlock */
  playGavelChime(): void {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const partials = [110, 220, 329.63, 440]
      partials.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = idx === 0 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        const amp = 0.09 / (idx + 1)
        gain.gain.setValueAtTime(amp, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 - idx * 0.18)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 1.45)
      })
    } catch {
      // ignore
    }
  }
}

export const enigmaAudio = new EnigmaAudioEngine()
