/**
 * Web Audio API Sound Synthesizer Engine
 * 100% self-contained, high performance, zero external asset dependencies.
 */

import { AudioSettings, ObstacleType } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambienceOsc: OscillatorNode | null = null;
  private ambienceGain: GainNode | null = null;
  private isAmbiencePlaying = false;
  private ambienceTimer: number | null = null;

  private defaultSettings: AudioSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.9,
    ambienceEnabled: true,
    ambienceVolume: 0.4,
    jumpSound: 'boing',
    jumpPitch: 1.0,
    hitWoodSound: 'splinter',
    hitWoodPitch: 1.0,
    hitStoneSound: 'granite',
    hitStonePitch: 1.0,
    hitSpikeSound: 'clang',
    hitSpikePitch: 1.0,
    hitFireSound: 'flame_whoosh',
    hitFirePitch: 1.0,
  };

  private settings: AudioSettings = { ...this.defaultSettings };
  private customAudioCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.loadSettings();
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    if (this.isAmbiencePlaying) {
      if (!this.settings.ambienceEnabled) {
        this.stopAmbience();
      } else if (this.ambienceGain && this.ctx) {
        this.ambienceGain.gain.setValueAtTime(
          this.settings.masterVolume * this.settings.ambienceVolume * 0.15,
          this.ctx.currentTime
        );
      }
    }
  }

  public resetSettings() {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
  }

  private saveSettings() {
    try {
      localStorage.setItem('pasture_runner_audio_v1', JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('pasture_runner_audio_v1');
      if (saved) {
        this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  // --- Noise Buffer Generator ---
  private createNoiseBuffer(duration = 0.5): AudioBuffer | null {
    const ctx = this.initContext();
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- Custom Audio File Decoder ---
  private async loadCustomAudioBuffer(dataUrl: string): Promise<AudioBuffer | null> {
    if (this.customAudioCache.has(dataUrl)) {
      return this.customAudioCache.get(dataUrl)!;
    }
    const ctx = this.initContext();
    if (!ctx) return null;
    try {
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.customAudioCache.set(dataUrl, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  private playCustomBuffer(buffer: AudioBuffer, volumeMultiplier = 1.0) {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * volumeMultiplier;
    if (vol <= 0) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  // --- JUMP SOUNDS ---
  public playJump() {
    if (this.settings.customJumpAudio) {
      this.loadCustomAudioBuffer(this.settings.customJumpAudio).then((buf) => {
        if (buf) this.playCustomBuffer(buf, 0.7);
      });
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitch = this.settings.jumpPitch || 1.0;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.45;
    if (vol <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    const type = this.settings.jumpSound;

    if (type === 'pip8bit') {
      // Retro 8-bit square jump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(540 * pitch, now + 0.14);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'swoop') {
      // Wind swoop / whoosh
      const noise = this.createNoiseBuffer(0.2);
      if (!noise) return;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250 * pitch, now);
      filter.frequency.exponentialRampToValueAtTime(1400 * pitch, now + 0.16);
      filter.Q.value = 3;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      src.start(now);
      src.stop(now + 0.2);
    } else if (type === 'laser') {
      // High laser hop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(200 * pitch, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'spring') {
      // Wobbly spring
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * pitch, now);
      osc.frequency.linearRampToValueAtTime(440 * pitch, now + 0.08);
      osc.frequency.linearRampToValueAtTime(320 * pitch, now + 0.14);
      osc.frequency.linearRampToValueAtTime(400 * pitch, now + 0.2);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.23);
    } else {
      // Default: 'boing' - bouncy rubber sine
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.15);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  }

  // --- HIT OBSTACLE 1: WOOD / HAY (Wood crate, fence, hay bale) ---
  public playHitWood() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitch = this.settings.hitWoodPitch || 1.0;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.7;
    if (vol <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    const type = this.settings.hitWoodSound;

    if (type === 'hollow') {
      // Resonant hollow wood block
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(90 * pitch, now + 0.15);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'timber') {
      // Heavy timber crash with dual oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'square';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(140 * pitch, now);
      osc1.frequency.exponentialRampToValueAtTime(45 * pitch, now + 0.25);
      osc2.frequency.setValueAtTime(95 * pitch, now);
      osc2.frequency.exponentialRampToValueAtTime(30 * pitch, now + 0.3);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.33);
      osc2.stop(now + 0.33);
    } else if (type === 'bonk') {
      // Cartoon wood bonk
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(110 * pitch, now + 0.18);
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Default: 'splinter' - crunchy splintering wood crate
      const noise = this.createNoiseBuffer(0.28);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650 * pitch, now);
        filter.Q.value = 1.8;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.9, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.26);
      }
      // Low wooden thud underneath
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(50 * pitch, now + 0.2);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.23);
    }
  }

  // --- HIT OBSTACLE 2: STONE / ROCK (Granite boulder, ancient rock) ---
  public playHitStone() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitch = this.settings.hitStonePitch || 1.0;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.75;
    if (vol <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    const type = this.settings.hitStoneSound;

    if (type === 'seismic') {
      // Deep sub-bass seismic impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(25 * pitch, now + 0.45);
      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.52);
    } else if (type === 'shatter') {
      // Hard rock shatter
      const noise = this.createNoiseBuffer(0.35);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800 * pitch, now);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.8, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.35);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(60 * pitch, now + 0.25);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.27);
    } else {
      // Default: 'granite' - heavy boulder smash with low-pass crumble
      const noise = this.createNoiseBuffer(0.3);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 * pitch, now);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.75, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.3);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(35 * pitch, now + 0.35);
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.42);
    }
  }

  // --- HIT OBSTACLE 3: SPIKE / METAL (Iron barrier, spiked bramble) ---
  public playHitSpike() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitch = this.settings.hitSpikePitch || 1.0;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.7;
    if (vol <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    const type = this.settings.hitSpikeSound;

    if (type === 'razor_twang') {
      // Metallic spring/razor wire twang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.3);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'anvil') {
      // Heavy iron bell / anvil strike
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(580 * pitch, now);
      osc2.frequency.setValueAtTime(1160 * pitch, now);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.46);
      osc2.stop(now + 0.46);
    } else if (type === 'electric') {
      // Electric fence shock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180 * pitch, now);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Default: 'clang' - high metallic spike clang with sharp transient
      const frequencies = [820 * pitch, 1240 * pitch, 1780 * pitch];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.4 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    }
  }

  // --- HIT OBSTACLE: CAMPFIRE / FIREBALL ---
  public playHitFire() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitch = this.settings.hitFirePitch || 1.0;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.75;
    if (vol <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    const type = this.settings.hitFireSound;

    if (type === 'sizzle_burn') {
      // Hot sizzling sizzle
      const noise = this.createNoiseBuffer(0.35);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2400 * pitch, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.32);
      }
    } else if (type === 'fire_burst') {
      // Deep explosive flame burst
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(30 * pitch, now + 0.3);
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.36);

      const noise = this.createNoiseBuffer(0.4);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 * pitch, now);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.8, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.4);
      }
    } else {
      // Default: 'flame_whoosh' - swooshing fire whoosh with roaring crackle
      const noise = this.createNoiseBuffer(0.38);
      if (noise) {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450 * pitch, now);
        filter.frequency.exponentialRampToValueAtTime(1800 * pitch, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(300 * pitch, now + 0.35);
        filter.Q.value = 2.5;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.9, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        src.start(now);
        src.stop(now + 0.36);
      }

      // Low flame roar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(40 * pitch, now + 0.28);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  }

  // --- PLAY SPECIFIC OBSTACLE HIT ---
  public playObstacleHit(type: ObstacleType) {
    if (this.settings.customHitAudio) {
      this.loadCustomAudioBuffer(this.settings.customHitAudio).then((buf) => {
        if (buf) this.playCustomBuffer(buf, 0.85);
      });
      return;
    }

    if (type === 'camp_fire' || type === 'fire_ball') {
      this.playHitFire();
    } else if (type === 'wood_crate') {
      this.playHitWood();
    } else if (type === 'granite_rock') {
      this.playHitStone();
    } else {
      this.playHitSpike();
    }
  }

  // --- COLLECTIBLE / CLOVER PICKUP ---
  public playCloverPickup() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.4;
    if (vol <= 0) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.3, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.13);
    });
  }

  // --- AMBIENT COW / BUFFALO MOO & NATURE BREEZE ---
  public playMooSound(pitchFactor = 1.0) {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.35;
    if (vol <= 0) return;

    // A rich vocal tract formant synthesis for a gentle moo
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Gentle pitch sweep down
    osc.frequency.setValueAtTime(140 * pitchFactor, now);
    osc.frequency.linearRampToValueAtTime(170 * pitchFactor, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(110 * pitchFactor, now + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450 * pitchFactor, now);
    filter.frequency.linearRampToValueAtTime(600 * pitchFactor, now + 0.4);
    filter.frequency.linearRampToValueAtTime(380 * pitchFactor, now + 1.2);
    filter.Q.value = 4.0;

    // Envelope: soft attack, sustained moo, gentle tail
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.25);
    gain.gain.setValueAtTime(vol * 0.9, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.35);
  }

  public startAmbience() {
    if (this.isAmbiencePlaying || !this.settings.ambienceEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.isAmbiencePlaying = true;
      // Schedule occasional gentle cow/buffalo moos in the background
      const scheduleNextMoo = () => {
        if (!this.isAmbiencePlaying || !this.settings.ambienceEnabled) return;
        const delay = 7000 + Math.random() * 9000; // every 7 to 16 seconds
        this.ambienceTimer = window.setTimeout(() => {
          if (this.isAmbiencePlaying && this.settings.ambienceEnabled) {
            const pitch = Math.random() > 0.5 ? 0.85 : 1.05; // Buffalo lower / cow slightly higher
            this.playMooSound(pitch);
            scheduleNextMoo();
          }
        }, delay);
      };
      scheduleNextMoo();
    } catch {
      // ignore
    }
  }

  public stopAmbience() {
    this.isAmbiencePlaying = false;
    if (this.ambienceTimer) {
      clearTimeout(this.ambienceTimer);
      this.ambienceTimer = null;
    }
  }

  // Active music oscillators / sources to stop if restarted
  private activeMusicNodes: { stop?: (when?: number) => void }[] = [];

  public stopCrashMusic() {
    this.activeMusicNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
      } catch {
        // ignore
      }
    });
    this.activeMusicNodes = [];
  }

  // --- 5-SECOND CRASH FREEZE MUSIC (Plays during 5s impact freeze) ---
  public playCrashMusic() {
    this.stopCrashMusic();
    this.stopAmbience();

    if (this.settings.customGameOverAudio) {
      this.loadCustomAudioBuffer(this.settings.customGameOverAudio).then((buf) => {
        if (buf) this.playCustomBuffer(buf, 0.9);
      });
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.45;
    if (vol <= 0) return;

    // Master bus for crash music with gentle compression/limiter
    const musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(vol, now);
    musicGain.gain.setValueAtTime(vol, now + 4.5);
    musicGain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);
    musicGain.connect(ctx.destination);

    // 1. Warm Bass Chords (D minor -> Bb -> C -> Dsus4 -> D)
    const chords = [
      { t: 0.0, dur: 1.25, notes: [146.83, 174.61, 220.00] }, // D3, F3, A3
      { t: 1.25, dur: 1.25, notes: [116.54, 174.61, 233.08] }, // Bb2, F3, Bb3
      { t: 2.50, dur: 1.25, notes: [130.81, 196.00, 261.63] }, // C3, G3, C4
      { t: 3.75, dur: 1.25, notes: [146.83, 220.00, 293.66, 440.00] }, // D3, A3, D4, A4 (resolving finish)
    ];

    chords.forEach((chord) => {
      chord.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + chord.t);

        g.gain.setValueAtTime(0.001, now + chord.t);
        g.gain.linearRampToValueAtTime(0.22, now + chord.t + 0.1);
        g.gain.setValueAtTime(0.18, now + chord.t + chord.dur - 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + chord.t + chord.dur);

        osc.connect(g);
        g.connect(musicGain);
        osc.start(now + chord.t);
        osc.stop(now + chord.t + chord.dur);
        this.activeMusicNodes.push(osc);
      });
    });

    // 2. Lead Synthesizer Melody (5-second emotional arcade phrase)
    const melody = [
      { t: 0.00, dur: 0.50, freq: 440.00 }, // A4
      { t: 0.50, dur: 0.40, freq: 392.00 }, // G4
      { t: 0.90, dur: 0.35, freq: 349.23 }, // F4
      { t: 1.25, dur: 0.60, freq: 466.16 }, // Bb4
      { t: 1.85, dur: 0.50, freq: 440.00 }, // A4
      { t: 2.35, dur: 0.40, freq: 392.00 }, // G4
      { t: 2.75, dur: 0.50, freq: 523.25 }, // C5
      { t: 3.25, dur: 0.45, freq: 493.88 }, // B4
      { t: 3.70, dur: 0.60, freq: 440.00 }, // A4
      { t: 4.30, dur: 0.70, freq: 587.33 }, // D5 (final sweet bell resolve)
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.t);

      // Add gentle vibrato
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(5.5, now + note.t);
      vibratoGain.gain.setValueAtTime(4.0, now + note.t);
      vibrato.connect(osc.frequency);
      vibrato.start(now + note.t + 0.15);
      vibrato.stop(now + note.t + note.dur);
      this.activeMusicNodes.push(vibrato);

      g.gain.setValueAtTime(0.001, now + note.t);
      g.gain.linearRampToValueAtTime(0.35, now + note.t + 0.04);
      g.gain.setValueAtTime(0.28, now + note.t + note.dur - 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

      osc.connect(g);
      g.connect(musicGain);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.dur);
      this.activeMusicNodes.push(osc);
    });

    // 3. Sparkling Arpeggio Chimes in last 1.5 seconds leading up to button appearance
    const chimes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    chimes.forEach((freq, idx) => {
      const chimeTime = now + 4.0 + idx * 0.15;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, chimeTime);
      g.gain.setValueAtTime(0.2, chimeTime);
      g.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.5);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(chimeTime);
      osc.stop(chimeTime + 0.55);
      this.activeMusicNodes.push(osc);
    });
  }

  // --- GAME OVER JINGLE ---
  public playGameOver() {
    this.playCrashMusic();
  }
}

export const soundEngine = new SoundEngine();
