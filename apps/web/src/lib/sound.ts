// ===================================================================
// LUCID Central Audio Engine
// Procedural Web Audio Synthesizer providing zero-dependency, zero-latency
// sound design for spacecraft cockpit, flight, footsteps, creatures & environment.
// ===================================================================

class CentralAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private atmoNoiseNode: AudioNode | null = null;
  private atmoGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private lastFootstepTime: number = 0;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initEngineAudio();
      this.initAtmosphericAudio();
      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  public ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.ensureContext();
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.8, now + 0.2);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // -------------------------------------------------------------
  // COCKPIT & FLIGHT ENGINE SOUNDS
  // -------------------------------------------------------------
  private initEngineAudio() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Low hum sub-oscillator
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(48, this.ctx.currentTime);

      // Filter to shape into heavy spacecraft engine
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Second harmonic oscillator
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'sine';
      this.engineOsc2.frequency.setValueAtTime(96, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      this.engineOsc2.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.engineOsc2.start();
    } catch {}
  }

  public setEngineThrust(thrustNormalized: number, isBoost: boolean = false) {
    if (!this.ctx || !this.engineGain || !this.engineOsc || !this.engineOsc2) return;
    const now = this.ctx.currentTime;
    const targetFreq = 48 + thrustNormalized * 40 + (isBoost ? 35 : 0);
    const targetGain = Math.max(0.001, (0.05 + thrustNormalized * 0.25 + (isBoost ? 0.15 : 0)));

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.15);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 1.5, now, 0.15);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.15);
  }

  public stopEngine() {
    if (!this.ctx || !this.engineGain) return;
    this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
  }

  private initAtmosphericAudio() {
    if (!this.ctx || !this.masterGain) return;
    try {
      // Procedural white noise buffer for atmospheric wind / entry rumble
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.atmoGain = this.ctx.createGain();
      this.atmoGain.gain.setValueAtTime(0, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.atmoGain);
      this.atmoGain.connect(this.masterGain);

      whiteNoise.start();
      this.atmoNoiseNode = whiteNoise;
    } catch {}
  }

  public setAtmosphericRumble(intensity: number) {
    if (!this.ctx || !this.atmoGain) return;
    const targetGain = Math.max(0, Math.min(0.45, intensity * 0.45));
    this.atmoGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  public playCockpitAwaken() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Power relay startup thuds
    [0.1, 0.4, 0.7].forEach((delay, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75 + idx * 40, now + delay);
      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });

    // Electronics power spool sweep
    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'triangle';
    sweep.frequency.setValueAtTime(180, now + 0.7);
    sweep.frequency.exponentialRampToValueAtTime(880, now + 1.8);
    sweepGain.gain.setValueAtTime(0.001, now + 0.7);
    sweepGain.gain.linearRampToValueAtTime(0.14, now + 1.3);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    sweep.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweep.start(now + 0.7);
    sweep.stop(now + 2.2);
  }

  public playRadarScan() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playTargetLocked() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    [0, 0.12].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now + delay);
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  public playScannerPulse() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Resonant radar sonar ping
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1480, now);
    ping.frequency.exponentialRampToValueAtTime(320, now + 0.65);
    pingGain.gain.setValueAtTime(0.25, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    ping.connect(pingGain);
    pingGain.connect(this.sfxGain);
    ping.start(now);
    ping.stop(now + 0.9);

    // Deep sub-pulse wave
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(45, now + 0.5);
    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  public playProximityWarning() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High urgency double-beep
    [0, 0.09].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, now + delay);
      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  }

  public playGearToggle(deployed: boolean) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Pneumatic air hiss
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(deployed ? 140 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(deployed ? 60 : 120, now + 0.4);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);

    // Mechanical latch clank
    const latch = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    latch.type = 'triangle';
    latch.frequency.setValueAtTime(420, now + 0.28);
    latchGain.gain.setValueAtTime(0.16, now + 0.28);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    latch.connect(latchGain);
    latchGain.connect(this.sfxGain);
    latch.start(now + 0.28);
    latch.stop(now + 0.38);
  }

  public playTakeoffLiftoff() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Low frequency rocket roar spool up
    const roar = this.ctx.createOscillator();
    const roarGain = this.ctx.createGain();
    roar.type = 'sawtooth';
    roar.frequency.setValueAtTime(55, now);
    roar.frequency.exponentialRampToValueAtTime(160, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    roarGain.gain.setValueAtTime(0.05, now);
    roarGain.gain.linearRampToValueAtTime(0.35, now + 0.8);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    roar.connect(filter);
    filter.connect(roarGain);
    roarGain.connect(this.sfxGain);
    roar.start(now);
    roar.stop(now + 1.9);
  }

  public playShieldImpact() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Hard impact thud + shield deflection tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playLandingGear() {
    this.playGearToggle(true);
  }

  public playTouchdown() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heavy low-end impact thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // -------------------------------------------------------------
  // FIRST-PERSON ON-FOOT SOUNDS
  // -------------------------------------------------------------
  public playFootstep(isSprinting: boolean = false) {
    const nowMs = performance.now();
    const minInterval = isSprinting ? 280 : 420;
    if (nowMs - this.lastFootstepTime < minInterval) return;
    this.lastFootstepTime = nowMs;

    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Soft powdery sand crunch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + Math.random() * 25, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);

    gain.gain.setValueAtTime(isSprinting ? 0.12 : 0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playJump() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playLandingThud() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // -------------------------------------------------------------
  // LIVING WORLD & DISCOVERY SOUNDS
  // -------------------------------------------------------------
  public playCreatureChirp() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Friendly whimsical chirping harmonic
    [520, 680, 840].forEach((baseFreq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now + i * 0.07);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + i * 0.07 + 0.09);
      gain.gain.setValueAtTime(0.09, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.11);
    });
  }

  public playPlantHarmonic() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playDiscoveryChime() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.14, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.75);
    });
  }

  public playUIBeep(pitch: 'low' | 'mid' | 'high' = 'mid') {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = pitch === 'low' ? 380 : pitch === 'mid' ? 620 : 980;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Planet ambient chord generator (preserves backward compatibility)
  public playPlanetChord(notes: string[]) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const noteFreqs: Record<string, number> = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25, E5: 659.25, G5: 783.99,
    };

    notes.slice(0, 3).forEach((n) => {
      const freq = noteFreqs[n] || 220;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 4.2);
    });
  }

  public playChime(type: 'interact' | 'portal' | 'place' | 'delete') {
    if (type === 'interact') this.playUIBeep('mid');
    else if (type === 'portal') this.playDiscoveryChime();
    else if (type === 'place') this.playUIBeep('high');
    else if (type === 'delete') this.playUIBeep('low');
  }
}

export const soundEngine = new CentralAudioManager();
