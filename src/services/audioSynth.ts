/**
 * High-quality procedural Lo-Fi Chill Synthesizer & Custom Audio Player
 * Generates warm, peaceful, study-friendly ambient chords with subtle vinyl warmth.
 */

class LoFiAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isCustomAudio: boolean = false;
  private customAudio: HTMLAudioElement | null = null;
  private volume: number = 0.35;
  private timerId: any = null;
  private masterGain: GainNode | null = null;
  private customAudioSource: MediaElementAudioSourceNode | null = null;
  public trackTitle: string = 'Lofi Chill Học Tập (Nhẹ Nhàng & Tập Trung)';

  private listeners: ((playing: boolean, title: string, volume: number) => void)[] = [];

  constructor() {
    // Lazy init on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(fn: (playing: boolean, title: string, volume: number) => void) {
    this.listeners.push(fn);
    fn(this.isPlaying, this.trackTitle, this.volume);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying, this.trackTitle, this.volume));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play a single soft chord voice (Rhodes-like warm mellow tone)
  private playMellowTone(freq: number, startTime: number, duration: number, velocity: number = 0.2) {
    if (!this.ctx || !this.masterGain) return;

    // Dual oscillator: sine + triangle through warm lowpass filter
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime); // subtle detune for warmth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, startTime);
    filter.frequency.exponentialRampToValueAtTime(320, startTime + duration);

    // ADSR Envelope
    const attack = 0.08;
    const release = duration * 0.4;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.25, startTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + release);
    osc2.stop(startTime + duration + release);
  }

  // Gentle Lo-Fi Chord progressions: Dmaj9 -> Bm9 -> Gmaj7 -> A7sus4
  private readonly chordProgressions = [
    [146.83, 220.0, 277.18, 329.63, 440.0], // Dmaj9
    [123.47, 185.0, 246.94, 293.66, 369.99], // Bm9
    [98.0, 146.83, 196.0, 246.94, 293.66],  // Gmaj7
    [110.0, 164.81, 220.0, 293.66, 329.63], // A7sus4
  ];

  private currentChordIndex = 0;

  private scheduleNextProgression() {
    if (!this.isPlaying || this.isCustomAudio || !this.ctx) return;

    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;

    const now = this.ctx.currentTime;
    const chordDuration = 3.8;

    // Stagger note arpeggiation slightly for natural human touch
    chord.forEach((freq, idx) => {
      const delay = idx * 0.04;
      this.playMellowTone(freq, now + delay, chordDuration - delay, 0.18);
    });

    // Random soothing high bell/kalimba accent
    if (Math.random() > 0.3) {
      const kalimbaFreqs = [587.33, 659.25, 739.99, 880.0, 987.77];
      const randomNote = kalimbaFreqs[Math.floor(Math.random() * kalimbaFreqs.length)];
      this.playMellowTone(randomNote, now + 1.2 + Math.random() * 1.5, 1.8, 0.12);
    }

    this.timerId = setTimeout(() => {
      this.scheduleNextProgression();
    }, (chordDuration - 0.4) * 1000);
  }

  public play() {
    this.initContext();

    if (this.isCustomAudio && this.customAudio) {
      this.customAudio.play().catch(e => console.warn('Audio play failed:', e));
      this.isPlaying = true;
      this.notify();
      return;
    }

    this.isPlaying = true;
    this.scheduleNextProgression();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public loadUserFile(file: File) {
    this.initContext();
    this.pause();

    const url = URL.createObjectURL(file);
    if (!this.customAudio) {
      this.customAudio = new Audio();
      this.customAudio.loop = true;
    }

    this.customAudio.src = url;
    this.customAudio.volume = this.volume;
    this.isCustomAudio = true;
    this.trackTitle = file.name.replace(/\.[^/.]+$/, ''); // clean filename
    this.play();
  }

  public resetToBuiltinLofi() {
    this.pause();
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    this.isCustomAudio = false;
    this.trackTitle = 'Lofi Chill Học Tập (Nhẹ Nhàng & Tập Trung)';
    this.play();
  }
}

export const audioService = new LoFiAudioEngine();
