// Web Audio API Sound Synthesizer & Custom Sound Player
// Provides zero-latency, asset-free sounds matching the desktop app, plus custom audio playback.

class AudioService {
  private ctx: AudioContext | null = null;
  private customSounds: Map<string, string> = new Map(); // id -> base64/blob URL

  constructor() {
    this.loadCustomSoundsFromStorage();
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private loadCustomSoundsFromStorage() {
    try {
      const saved = localStorage.getItem('pomodoro_custom_sounds');
      if (saved) {
        const parsed = JSON.parse(saved);
        for (const [key, val] of Object.entries(parsed)) {
          this.customSounds.set(key, val as string);
        }
      }
    } catch {
      // ignore
    }
  }

  public saveCustomSound(name: string, dataUrl: string) {
    this.customSounds.set(name, dataUrl);
    try {
      const obj: Record<string, string> = {};
      this.customSounds.forEach((val, key) => { obj[key] = val; });
      localStorage.setItem('pomodoro_custom_sounds', JSON.stringify(obj));
    } catch (e) {
      console.warn('Could not save custom sound to localStorage', e);
    }
  }

  public getCustomSoundsList(): string[] {
    return Array.from(this.customSounds.keys());
  }

  public play(soundName: string) {
    // Check if it's a custom uploaded sound first
    if (this.customSounds.has(soundName)) {
      const url = this.customSounds.get(soundName)!;
      const audio = new Audio(url);
      audio.play().catch(e => console.warn('Audio play failed:', e));
      return;
    }

    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (soundName) {
      case 'warning.mp3':
      case 'Acil Durum Alarmı': {
        // Emergency siren tone
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const startTime = now + i * 0.28;
          osc.frequency.setValueAtTime(440, startTime);
          osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.14);
          osc.frequency.exponentialRampToValueAtTime(440, startTime + 0.26);

          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.27);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.28);
        }
        break;
      }

      case 'bipbip.mp3':
      case 'Bip Sesi': {
        // High crisp double beep
        [0, 0.15].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
        break;
      }

      case 'dog.mp3':
      case 'Köpek Sesi': {
        // Playful double chirp/bark simulation
        [0, 0.2].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now + offset);
          osc.frequency.linearRampToValueAtTime(480, now + offset + 0.08);
          osc.frequency.linearRampToValueAtTime(260, now + offset + 0.16);

          gain.gain.setValueAtTime(0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.18);
        });
        break;
      }

      case 'tibetan_bell':
      case 'Zil':
      default: {
        // Gentle meditative bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
        break;
      }
    }
  }
}

export const soundManager = new AudioService();
