export type SoundType =
  | 'placeLetter'
  | 'removeLetter'
  | 'submitCorrect'
  | 'submitWrong'
  | 'countdownTick'
  | 'success'
  | 'failed';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;

    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch {
        return null;
      }
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    attack: number = 0.01,
    release: number = 0.1
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(0, now + duration + release);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + release);
  }

  private playFrequencySequence(
    frequencies: number[],
    noteDuration: number = 0.12,
    gap: number = 0.02,
    type: OscillatorType = 'sine',
    volume: number = 0.25
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    let startTime = ctx.currentTime;

    frequencies.forEach((freq) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration + 0.05);

      startTime += noteDuration + gap;
    });
  }

  play(type: SoundType): void {
    if (!this.enabled) return;

    switch (type) {
      case 'placeLetter':
        this.playTone(660, 0.06, 'sine', 0.2, 0.005, 0.04);
        break;

      case 'removeLetter':
        this.playTone(440, 0.06, 'triangle', 0.18, 0.005, 0.04);
        break;

      case 'submitCorrect':
        this.playFrequencySequence(
          [523.25, 659.25, 783.99, 1046.5],
          0.1,
          0.02,
          'sine',
          0.28
        );
        break;

      case 'submitWrong':
        this.playFrequencySequence(
          [311.13, 261.63, 220],
          0.12,
          0.02,
          'sawtooth',
          0.18
        );
        break;

      case 'countdownTick':
        this.playTone(880, 0.04, 'square', 0.12, 0.002, 0.02);
        break;

      case 'success': {
        const ctx = this.ensureContext();
        if (!ctx) return;

        const chordFrequencies = [523.25, 659.25, 783.99, 1046.5];
        chordFrequencies.forEach((freq, i) => {
          setTimeout(() => {
            this.playTone(freq, 0.4, 'sine', 0.22, 0.02, 0.3);
          }, i * 80);
        });

        setTimeout(() => {
          this.playFrequencySequence(
            [1046.5, 1318.51, 1567.98],
            0.15,
            0.03,
            'sine',
            0.2
          );
        }, 400);
        break;
      }

      case 'failed': {
        const ctx = this.ensureContext();
        if (!ctx) return;

        this.playTone(392, 0.2, 'sawtooth', 0.2, 0.01, 0.15);
        setTimeout(() => {
          this.playTone(349.23, 0.2, 'sawtooth', 0.18, 0.01, 0.15);
        }, 150);
        setTimeout(() => {
          this.playTone(293.66, 0.35, 'sawtooth', 0.2, 0.01, 0.3);
        }, 300);
        break;
      }
    }
  }
}

export const soundManager = new SoundManager();
