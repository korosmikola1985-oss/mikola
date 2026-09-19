/**
 * Web Audio Engine for sound effects and background ambient tracks with auto-ducking.
 * Generates real sound waves directly in-browser for zero external asset latency.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgGainNode: GainNode | null = null;
  private bgSourceNode: AudioBufferSourceNode | null = null;
  private isPlayingBg = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Play synthesized SFX
  playSfx(type: 'whoosh' | 'ding' | 'boom' | 'pop' | 'cash', volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.6, now);
      gain.connect(ctx.destination);

      if (type === 'whoosh') {
        // Filtered white noise swoosh
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        noise.start(now);
      } else if (type === 'ding') {
        // High crystalline chime
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.05);
        osc.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'boom') {
        // Deep sub-bass punch
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);
        osc.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        osc.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {
      console.warn('Audio sfx error:', e);
    }
  }

  // 2. Generate and loop procedural background track
  startBackgroundMusic(style: string = 'lofi', targetVolume = 0.25) {
    try {
      this.stopBackgroundMusic();
      const ctx = this.getContext();
      const loopDuration = 8; // 8 seconds seamless loop
      const sampleRate = ctx.sampleRate;
      const buffer = ctx.createBuffer(2, sampleRate * loopDuration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      // Harmonious chords progression depending on style
      const chords =
        style === 'phonk'
          ? [110, 130.8, 146.8, 164.8] // dark minor
          : style === 'epic'
          ? [130.8, 164.8, 196, 220] // cinematic
          : [174.6, 220, 261.6, 329.6]; // lofi pleasant

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor((t / loopDuration) * chords.length) % chords.length;
        const freq = chords[chordIdx];
        
        // Gentle warm pad
        const pad = Math.sin(2 * Math.PI * freq * t) * 0.15 + Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.08;
        // Subtle rhythm pulse
        const beat = (Math.sin(2 * Math.PI * 2 * t) > 0.8 ? 0.1 : 0) * (style === 'phonk' ? 0.3 : 0.05);

        const sample = (pad + beat) * 0.5;
        left[i] = sample;
        right[i] = sample * 0.95;
      }

      this.bgSourceNode = ctx.createBufferSource();
      this.bgSourceNode.buffer = buffer;
      this.bgSourceNode.loop = true;

      this.bgGainNode = ctx.createGain();
      this.bgGainNode.gain.setValueAtTime(targetVolume, ctx.currentTime);

      this.bgSourceNode.connect(this.bgGainNode);
      this.bgGainNode.connect(ctx.destination);
      this.bgSourceNode.start();
      this.isPlayingBg = true;
    } catch (e) {
      console.warn('Background audio error:', e);
    }
  }

  // 3. Audio Ducking (temporarily lower music volume during speech)
  duckMusic(isSpeaking: boolean, baseVolume = 0.25) {
    if (!this.bgGainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    const target = isSpeaking ? baseVolume * 0.3 : baseVolume;
    this.bgGainNode.gain.cancelScheduledValues(now);
    this.bgGainNode.gain.linearRampToValueAtTime(target, now + 0.2);
  }

  stopBackgroundMusic() {
    if (this.bgSourceNode) {
      try {
        this.bgSourceNode.stop();
        this.bgSourceNode.disconnect();
      } catch {}
      this.bgSourceNode = null;
    }
    this.isPlayingBg = false;
  }
}

export const audioEngine = new AudioEngine();
