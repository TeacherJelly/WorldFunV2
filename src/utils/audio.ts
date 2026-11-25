import { MusicSectionTiming, MusicTrack, SongSectionName } from '../types';
import mascotHelloEnDataUri from '../assets/audio/mascot-hello-en.wav?inline';
import mascotNihaoZhDataUri from '../assets/audio/mascot-nihao-zh.wav?inline';

const MASCOT_VOICE_DATA_URIS: Record<'en' | 'zh', string> = {
  en: mascotHelloEnDataUri,
  zh: mascotNihaoZhDataUri,
};

export const VICTORY_FANFARE_MP3_URL = '/audio/victory-ff8.mp3';
export const SHORT_WIN_MP3_URL = '/audio/short-win.mp3';

const SONG_SECTIONS: SongSectionName[] = [
  'Intro',
  '1st Stanza',
  'Refrain',
  'Chorus',
  '2nd Stanza',
  'Bridge',
  '2nd Chorus',
  'Outro',
];

function buildTimings(
  bpm: number,
  beatsPerBar: number,
  specs: { name: SongSectionName; bars: number }[],
  actualDurationSec: number
): MusicSectionTiming[] {
  const barSec = (60 / bpm) * beatsPerBar;
  let cursor = 0;
  return specs.map((s, idx) => {
    const startSec = cursor;
    const rawEnd = cursor + s.bars * barSec;
    const endSec = idx === specs.length - 1 ? actualDurationSec : rawEnd;
    cursor = rawEnd;
    return { name: s.name, startSec, endSec };
  });
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 1,
    name: 'Sunny Meadow',
    mood: 'Cheerful & Bright · Celesta, Strings & Flute',
    tempo: 112,
    instrument: 'Celesta, Strings & Flute',
    durationSeconds: 131,
    audioUrl: '/audio/bgm-1-sunny-meadow.mp3',
    sections: SONG_SECTIONS,
    sectionTimeline: buildTimings(
      112,
      4,
      [
        { name: 'Intro', bars: 4 },
        { name: '1st Stanza', bars: 12 },
        { name: 'Refrain', bars: 6 },
        { name: 'Chorus', bars: 8 },
        { name: '2nd Stanza', bars: 10 },
        { name: 'Bridge', bars: 8 },
        { name: '2nd Chorus', bars: 8 },
        { name: 'Outro', bars: 4 },
      ],
      130.82
    ),
  },
  {
    id: 2,
    name: 'Starlight Dreams',
    mood: 'Sweet & Flowing Waltz · Concert Harp & Flute',
    tempo: 96,
    instrument: 'Concert Harp & Woodland Flute',
    durationSeconds: 137,
    audioUrl: '/audio/bgm-2-starlight-waltz.mp3',
    sections: SONG_SECTIONS,
    sectionTimeline: buildTimings(
      96,
      3,
      [
        { name: 'Intro', bars: 4 },
        { name: '1st Stanza', bars: 16 },
        { name: 'Refrain', bars: 8 },
        { name: 'Chorus', bars: 12 },
        { name: '2nd Stanza', bars: 12 },
        { name: 'Bridge', bars: 8 },
        { name: '2nd Chorus', bars: 8 },
        { name: 'Outro', bars: 4 },
      ],
      137.25
    ),
  },
  {
    id: 3,
    name: "Hero's Playground",
    mood: 'Upbeat Adventure · Marimba, Piano & Strings',
    tempo: 120,
    instrument: 'Marimba, Bright Piano & Strings',
    durationSeconds: 130,
    audioUrl: '/audio/bgm-3-heros-playground.mp3',
    sections: SONG_SECTIONS,
    sectionTimeline: buildTimings(
      120,
      4,
      [
        { name: 'Intro', bars: 4 },
        { name: '1st Stanza', bars: 12 },
        { name: 'Refrain', bars: 6 },
        { name: 'Chorus', bars: 10 },
        { name: '2nd Stanza', bars: 10 },
        { name: 'Bridge', bars: 8 },
        { name: '2nd Chorus', bars: 10 },
        { name: 'Outro', bars: 4 },
      ],
      130.25
    ),
  },
];

export function formatDurationSeconds(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem.toString().padStart(2, '0')}`;
}

function decodeDataUriToArrayBuffer(dataUri: string): ArrayBuffer | null {
  try {
    const commaIdx = dataUri.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = dataUri.slice(commaIdx + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
}

// Cross-browser safe AudioContext.decodeAudioData (handles older iOS/WebKit callback signature too)
function decodeAudioSafe(ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
  const copy = buffer.slice(0);
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = ctx.decodeAudioData(
        copy,
        decoded => resolve(decoded),
        err => reject(err ?? new Error('Audio decode failed'))
      );
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve, reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

const FEMALE_VOICE_HINTS = [
  'natural',
  'female',
  'samantha',
  'siri',
  'nicky',
  'victoria',
  'aria',
  'jenny',
  'emma',
  'zira',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'serena',
  'susan',
  'allison',
  'ava',
  'hazel',
  'libby',
  'sonia',
  'clara',
  'kate',
  'martha',
  'stephanie',
  'zoe',
  'google uk english female',
  'google us english',
];

export interface StudioVoiceOption {
  id: 'studio:kore' | 'studio:aoede' | 'studio:zephyr' | 'studio:puck';
  preset: 'kore' | 'aoede' | 'zephyr' | 'puck';
  label: string;
}

export const STUDIO_VOICES: StudioVoiceOption[] = [
  { id: 'studio:kore', preset: 'kore', label: 'Ms. Kore — Warm Teacher (Natural Voice)' },
  { id: 'studio:aoede', preset: 'aoede', label: 'Ms. Aoede — Bright & Cheerful (Natural Voice)' },
  { id: 'studio:zephyr', preset: 'zephyr', label: 'Ms. Zephyr — Gentle Storyteller (Natural Voice)' },
  { id: 'studio:puck', preset: 'puck', label: 'Fox Mascot — Playful Kid Voice' },
];

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return true;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform && /android/i.test(uaData.platform)) return true;
  return false;
}

function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/android|iphone|ipad|ipod/i.test(ua)) return true;
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  if (/linux/i.test(ua) && !/cros/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } }
  ).userAgentData;
  if (uaData?.mobile || (uaData?.platform && /android/i.test(uaData.platform))) return true;
  return false;
}

class SoundController {
  private ctx: AudioContext | null = null;
  private ctxBufferUnlocked = false;
  private gestureUnlockBound = false;

  public sfxEnabled = true;
  public sfxVolume = 0.75;

  public musicEnabled = false;
  public musicTrackId = 1;
  public musicVolume = 0.25;

  public voiceEnabled = true;
  public voiceName = 'auto';
  public voicePitch = 1.08;
  public voiceRate = 0.88;

  // MP3 BGM Engine (Web Audio API + HTMLAudio Fallback)
  private bgmBufferCache = new Map<number, AudioBuffer>();
  private bgmInFlight = new Map<number, Promise<AudioBuffer | null>>();
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmFallbackAudio: HTMLAudioElement | null = null;
  private bgmRequestId = 0;
  private bgmStartedAtCtx = 0;
  private bgmActiveTrackId: number | null = null;

  // FFVIII-inspired Victory Fanfare MP3 Engine
  private victoryBuffer: AudioBuffer | null = null;
  private victoryFetchPromise: Promise<AudioBuffer | null> | null = null;
  private activeVictorySource: AudioBufferSourceNode | null = null;
  private activeVictoryAudio: HTMLAudioElement | null = null;

  // Short 2-Second Item Win MP3 Engine
  private shortWinBuffer: AudioBuffer | null = null;
  private shortWinFetchPromise: Promise<AudioBuffer | null> | null = null;
  private activeShortWinSource: AudioBufferSourceNode | null = null;
  private activeShortWinAudio: HTMLAudioElement | null = null;

  // Mascot Voice Cache
  private mascotBufferCache: Partial<Record<'en' | 'zh', AudioBuffer>> = {};
  private mascotDecodePending: Partial<Record<'en' | 'zh', Promise<AudioBuffer | null>>> = {};
  private currentMascotSource: AudioBufferSourceNode | null = null;
  private currentMascotAudio: HTMLAudioElement | null = null;

  // Cross-Device Speaking Voice Engine
  private speechUnlocked = false;
  private nativeSpeechBroken = false;
  private speakRequestId = 0;
  private lastSpeakText = '';
  private lastSpeakAt = 0;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private speakDelayTimer: number | null = null;
  private speakWatchdogTimer: number | null = null;
  private ttsBufferCache = new Map<string, AudioBuffer>();
  private ttsInFlight = new Map<string, Promise<AudioBuffer | null>>();
  private currentTtsSource: AudioBufferSourceNode | null = null;
  private currentTtsAudio: HTMLAudioElement | null = null;

  constructor() {
    this.bindGlobalAudioUnlock();
  }

  private bindGlobalAudioUnlock() {
    if (typeof window === 'undefined' || this.gestureUnlockBound) return;
    this.gestureUnlockBound = true;

    const onFirstGesture = () => {
      const ctx = this.ensureContext(true);
      if (ctx) {
        void this.preloadVictoryFanfare();
        void this.preloadShortWinSound();
        if (this.musicEnabled && !this.bgmSource && !this.bgmFallbackAudio) {
          void this.startMusic();
        }
      }
    };

    window.addEventListener('pointerdown', onFirstGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', onFirstGesture, { passive: true, capture: true });
    window.addEventListener('keydown', onFirstGesture, { passive: true, capture: true });
  }

  private primeContextSilentBuffer(ctx: AudioContext) {
    if (this.ctxBufferUnlocked) return;
    try {
      const silent = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
      this.ctxBufferUnlocked = true;
    } catch {
      // Ignore silent prime error
    }
  }

  private ensureContext(allowResume = true): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (allowResume && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          if (this.ctx) this.primeContextSilentBuffer(this.ctx);
        }).catch(() => {});
      }
      this.primeContextSilentBuffer(this.ctx);
    }
    return this.ctx;
  }

  private unlockSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        synth.resume();
      }
      synth.getVoices();

      if (isAndroidDevice()) {
        this.speechUnlocked = true;
        return;
      }

      if (!this.speechUnlocked && !synth.speaking && !synth.pending) {
        const primer = new SpeechSynthesisUtterance(' ');
        primer.lang = 'en-US';
        primer.volume = 0;
        primer.rate = 10;
        this.activeUtterance = primer;
        primer.onend = () => {
          if (this.activeUtterance === primer) this.activeUtterance = null;
        };
        primer.onerror = () => {
          if (this.activeUtterance === primer) this.activeUtterance = null;
        };
        synth.speak(primer);
        this.speechUnlocked = true;
      } else {
        this.speechUnlocked = true;
      }
    } catch {
      // Ignore speech unlock failure
    }
  }

  public unlock(skipSpeechPrimer = false) {
    this.ensureContext(true);
    void this.preloadVictoryFanfare();
    void this.preloadShortWinSound();
    if (!skipSpeechPrimer) {
      this.unlockSpeech();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.getVoices();
        this.speechUnlocked = true;
      } catch {
        // Ignore
      }
    }
    if (this.musicEnabled && !this.bgmSource && !this.bgmFallbackAudio) {
      void this.startMusic();
    }
  }

  public resetNativeSpeechHealth() {
    this.nativeSpeechBroken = false;
  }

  private getTrackById(trackId: number): MusicTrack {
    const normalized =
      Number.isFinite(trackId) && trackId >= 1 ? ((Math.round(trackId) - 1) % MUSIC_TRACKS.length) + 1 : 1;
    return MUSIC_TRACKS.find(t => t.id === normalized) || MUSIC_TRACKS[0];
  }

  private async loadBgmBuffer(track: MusicTrack): Promise<AudioBuffer | null> {
    const cached = this.bgmBufferCache.get(track.id);
    if (cached) return cached;

    const inflight = this.bgmInFlight.get(track.id);
    if (inflight) return inflight;

    const task = (async (): Promise<AudioBuffer | null> => {
      try {
        const res = await fetch(track.audioUrl);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        const ctx = this.ensureContext(false);
        if (!ctx) return null;
        const decoded = await decodeAudioSafe(ctx, arr);
        this.bgmBufferCache.set(track.id, decoded);
        return decoded;
      } catch {
        return null;
      }
    })();

    this.bgmInFlight.set(track.id, task);
    try {
      return await task;
    } finally {
      this.bgmInFlight.delete(track.id);
    }
  }

  public async startMusic(): Promise<void> {
    this.stopMusic();
    if (!this.musicEnabled || typeof window === 'undefined') return;

    const track = this.getTrackById(this.musicTrackId);
    const reqId = ++this.bgmRequestId;
    const ctx = this.ensureContext(true);

    if (ctx) {
      const buffer = await this.loadBgmBuffer(track);
      if (!this.musicEnabled || reqId !== this.bgmRequestId) return;

      if (buffer) {
        const startWithBuffer = () => {
          if (!this.musicEnabled || reqId !== this.bgmRequestId) return;
          try {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(Math.max(0, Math.min(1, this.musicVolume)) * 0.65, ctx.currentTime);

            source.connect(gain);
            gain.connect(ctx.destination);

            this.bgmSource = source;
            this.bgmGain = gain;
            this.bgmStartedAtCtx = ctx.currentTime;
            this.bgmActiveTrackId = track.id;

            source.start(0);
          } catch {
            this.startBgmHtmlFallback(track, reqId);
          }
        };

        if (ctx.state === 'suspended') {
          void ctx.resume().then(startWithBuffer, () => this.startBgmHtmlFallback(track, reqId));
        } else {
          startWithBuffer();
        }
        return;
      }
    }

    this.startBgmHtmlFallback(track, reqId);
  }

  private startBgmHtmlFallback(track: MusicTrack, reqId: number) {
    if (!this.musicEnabled || reqId !== this.bgmRequestId) return;
    try {
      const audio = new Audio(track.audioUrl);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, this.musicVolume * 0.65));
      this.bgmFallbackAudio = audio;
      this.bgmActiveTrackId = track.id;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {
      // Autoplay will resume on next gesture
    }
  }

  public stopMusic() {
    this.bgmRequestId++;
    this.bgmActiveTrackId = null;

    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.bgmSource.disconnect();
      this.bgmSource = null;
    }
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
    if (this.bgmFallbackAudio) {
      this.bgmFallbackAudio.pause();
      this.bgmFallbackAudio.currentTime = 0;
      this.bgmFallbackAudio = null;
    }
  }

  public syncMusicSettings(enabled: boolean, trackId: number, volume: number) {
    const normalizedTrack = this.getTrackById(trackId).id;
    const trackChanged = this.musicTrackId !== normalizedTrack;
    const enabledChanged = this.musicEnabled !== enabled;
    const clampedVol = Math.max(0, Math.min(1, volume));

    this.musicEnabled = enabled;
    this.musicTrackId = normalizedTrack;
    this.musicVolume = clampedVol;

    // Live-update gain smoothly without restarting the track when dragging slider
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(clampedVol * 0.65, this.ctx.currentTime, 0.02);
    }
    if (this.bgmFallbackAudio) {
      this.bgmFallbackAudio.volume = Math.max(0, Math.min(1, clampedVol * 0.65));
    }

    if (!enabled) {
      this.stopMusic();
    } else if (enabledChanged || trackChanged || (!this.bgmSource && !this.bgmFallbackAudio)) {
      void this.startMusic();
    }
  }

  public getMusicPlaybackInfo(): {
    isPlaying: boolean;
    trackId: number;
    elapsedSec: number;
    durationSec: number;
    currentSection: SongSectionName | null;
  } {
    const track = this.getTrackById(this.musicTrackId);
    if (!this.musicEnabled || this.bgmActiveTrackId !== track.id) {
      return {
        isPlaying: false,
        trackId: track.id,
        elapsedSec: 0,
        durationSec: track.durationSeconds,
        currentSection: null,
      };
    }

    let elapsed = 0;
    if (this.bgmSource && this.ctx && this.bgmSource.buffer) {
      const raw = Math.max(0, this.ctx.currentTime - this.bgmStartedAtCtx);
      elapsed = raw % this.bgmSource.buffer.duration;
    } else if (this.bgmFallbackAudio) {
      elapsed = this.bgmFallbackAudio.currentTime || 0;
    }

    const activeSection =
      track.sectionTimeline.find(sec => elapsed >= sec.startSec && elapsed < sec.endSec)?.name ||
      track.sectionTimeline[0]?.name ||
      null;

    return {
      isPlaying: Boolean(this.bgmSource || (this.bgmFallbackAudio && !this.bgmFallbackAudio.paused)),
      trackId: track.id,
      elapsedSec: elapsed,
      durationSec: track.durationSeconds,
      currentSection: activeSection,
    };
  }

  // Preload FFVIII-inspired Victory Fanfare MP3
  public async preloadVictoryFanfare(): Promise<AudioBuffer | null> {
    if (this.victoryBuffer) return this.victoryBuffer;
    if (this.victoryFetchPromise) return this.victoryFetchPromise;

    this.victoryFetchPromise = (async () => {
      try {
        const res = await fetch(VICTORY_FANFARE_MP3_URL);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        const ctx = this.ensureContext(false);
        if (!ctx) return null;
        const decoded = await decodeAudioSafe(ctx, arr);
        this.victoryBuffer = decoded;
        return decoded;
      } catch {
        return null;
      } finally {
        this.victoryFetchPromise = null;
      }
    })();

    return this.victoryFetchPromise;
  }

  public stopWinningFanfare() {
    if (this.activeVictorySource) {
      try {
        this.activeVictorySource.stop();
      } catch {
        // Ignore already stopped
      }
      this.activeVictorySource.disconnect();
      this.activeVictorySource = null;
    }
    if (this.activeVictoryAudio) {
      this.activeVictoryAudio.pause();
      this.activeVictoryAudio.currentTime = 0;
      this.activeVictoryAudio = null;
    }
  }

  public playWinningFanfare() {
    if (!this.sfxEnabled || typeof window === 'undefined') return;
    this.stopShortWinSound();
    this.stopWinningFanfare();

    const ctx = this.ensureContext(true);
    const vol = Math.max(0.02, Math.min(1, this.sfxVolume * 0.9));

    const playDecoded = (buf: AudioBuffer) => {
      if (!ctx || !this.sfxEnabled) return;
      const startNode = () => {
        try {
          this.stopWinningFanfare();
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          src.connect(gain);
          gain.connect(ctx.destination);
          src.onended = () => {
            if (this.activeVictorySource === src) {
              this.activeVictorySource = null;
            }
          };
          this.activeVictorySource = src;
          src.start(0);
        } catch {
          this.playWinningHtmlFallback(vol);
        }
      };

      if (ctx.state === 'suspended') {
        void ctx.resume().then(startNode, () => this.playWinningHtmlFallback(vol));
      } else {
        startNode();
      }
    };

    if (ctx && this.victoryBuffer) {
      playDecoded(this.victoryBuffer);
      return;
    }

    if (ctx) {
      void this.preloadVictoryFanfare().then(buf => {
        if (buf) {
          playDecoded(buf);
        } else {
          this.playWinningHtmlFallback(vol);
        }
      });
      return;
    }

    this.playWinningHtmlFallback(vol);
  }

  private playWinningHtmlFallback(vol: number) {
    try {
      const audio = new Audio(VICTORY_FANFARE_MP3_URL);
      audio.volume = vol;
      this.activeVictoryAudio = audio;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.playFallbackWinningChord();
        });
      }
    } catch {
      this.playFallbackWinningChord();
    }
  }

  private playFallbackWinningChord() {
    const chord = [587.33, 739.99, 880.0, 1174.66];
    chord.forEach((f, idx) => {
      this.playTone(f, idx === chord.length - 1 ? 0.7 : 0.24, 'triangle', 0.24, idx * 0.08);
    });
  }

  // Preload Short 2-Second Item Win MP3
  public async preloadShortWinSound(): Promise<AudioBuffer | null> {
    if (this.shortWinBuffer) return this.shortWinBuffer;
    if (this.shortWinFetchPromise) return this.shortWinFetchPromise;

    this.shortWinFetchPromise = (async () => {
      try {
        const res = await fetch(SHORT_WIN_MP3_URL);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        const ctx = this.ensureContext(false);
        if (!ctx) return null;
        const decoded = await decodeAudioSafe(ctx, arr);
        this.shortWinBuffer = decoded;
        return decoded;
      } catch {
        return null;
      } finally {
        this.shortWinFetchPromise = null;
      }
    })();

    return this.shortWinFetchPromise;
  }

  public stopShortWinSound() {
    if (this.activeShortWinSource) {
      try {
        this.activeShortWinSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.activeShortWinSource.disconnect();
      this.activeShortWinSource = null;
    }
    if (this.activeShortWinAudio) {
      this.activeShortWinAudio.pause();
      this.activeShortWinAudio.currentTime = 0;
      this.activeShortWinAudio = null;
    }
  }

  public playShortWinSound() {
    if (!this.sfxEnabled || typeof window === 'undefined') return;
    this.stopWinningFanfare();
    this.stopShortWinSound();

    const ctx = this.ensureContext(true);
    const vol = Math.max(0.02, Math.min(1, this.sfxVolume * 0.9));

    const playDecoded = (buf: AudioBuffer) => {
      if (!ctx || !this.sfxEnabled) return;
      const startNode = () => {
        try {
          this.stopShortWinSound();
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          src.connect(gain);
          gain.connect(ctx.destination);
          src.onended = () => {
            if (this.activeShortWinSource === src) {
              this.activeShortWinSource = null;
            }
          };
          this.activeShortWinSource = src;
          src.start(0);
        } catch {
          this.playShortWinHtmlFallback(vol);
        }
      };

      if (ctx.state === 'suspended') {
        void ctx.resume().then(startNode, () => this.playShortWinHtmlFallback(vol));
      } else {
        startNode();
      }
    };

    if (ctx && this.shortWinBuffer) {
      playDecoded(this.shortWinBuffer);
      return;
    }

    if (ctx) {
      void this.preloadShortWinSound().then(buf => {
        if (buf) {
          playDecoded(buf);
        } else {
          this.playShortWinHtmlFallback(vol);
        }
      });
      return;
    }

    this.playShortWinHtmlFallback(vol);
  }

  private playShortWinHtmlFallback(vol: number) {
    try {
      const audio = new Audio(SHORT_WIN_MP3_URL);
      audio.volume = vol;
      this.activeShortWinAudio = audio;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.playRewardChime();
        });
      }
    } catch {
      this.playRewardChime();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.25,
    delay = 0,
    slideTo?: number
  ) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      }

      const finalVol = Math.max(0.005, gainLevel * this.sfxVolume);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(finalVol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {
      // Ignore audio restricted before gesture
    }
  }

  public playClick() {
    this.playTone(540, 0.07, 'sine', 0.18, 0, 720);
  }

  public playPickup() {
    this.playTone(380, 0.09, 'triangle', 0.2, 0, 590);
  }

  public playDrop() {
    this.playTone(460, 0.08, 'sine', 0.16, 0, 320);
  }

  public playConnect(index: number) {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[index % scale.length];
    this.playTone(freq, 0.35, 'sine', 0.28, 0);
    this.playTone(freq * 2, 0.25, 'triangle', 0.1, 0.02);
  }

  public playDisconnect() {
    this.playTone(390, 0.14, 'triangle', 0.18, 0, 260);
  }

  public playAuditCheck() {
    this.playTone(440, 0.09, 'triangle', 0.2, 0);
    this.playTone(554.37, 0.09, 'triangle', 0.2, 0.08);
    this.playTone(659.25, 0.14, 'triangle', 0.22, 0.16);
  }

  public playTryAgain() {
    this.playTone(260, 0.16, 'triangle', 0.22, 0, 210);
    this.playTone(210, 0.22, 'triangle', 0.22, 0.14, 175);
  }

  public playSuccessFanfare() {
    this.playWinningFanfare();
  }

  public playRewardChime() {
    this.playTone(880, 0.18, 'sine', 0.22, 0);
    this.playTone(1174.66, 0.25, 'sine', 0.22, 0.09);
    this.playTone(1567.98, 0.45, 'sine', 0.25, 0.18);
  }

  // Natural Speaking Voice System (Universal Cross-Platform: PC, Android, iOS & All Browsers)
  public onVoicesChanged(callback: () => void): () => void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return () => {};
    }
    const synth = window.speechSynthesis;
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', callback);
      return () => synth.removeEventListener('voiceschanged', callback);
    }
    const prev = synth.onvoiceschanged;
    synth.onvoiceschanged = callback;
    return () => {
      if (synth.onvoiceschanged === callback) {
        synth.onvoiceschanged = prev || null;
      }
    };
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    return [...pool].sort((a, b) => {
      const aScore = this.scoreVoice(a);
      const bScore = this.scoreVoice(b);
      return bScore - aScore;
    });
  }

  private scoreVoice(v: SpeechSynthesisVoice): number {
    const name = v.name.toLowerCase();
    const isMobile = isMobileOrTabletDevice();
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    let score = 0;

    if (v.localService) {
      score += isMobile || isOffline ? 45 : 10;
    } else if (isMobile || isOffline) {
      score -= 40;
    }

    if (name.includes('natural')) score += 40;
    if (name.includes('online') && !isMobile && !isOffline) score += 20;
    if (name.includes('google')) score += 15;
    if (FEMALE_VOICE_HINTS.some(h => name.includes(h))) score += 30;
    if (name.includes('male') && !name.includes('female')) score -= 25;
    if (v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb') score += 8;
    return score;
  }

  public pickBestFemaleVoice(): SpeechSynthesisVoice | undefined {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return undefined;
    if (this.voiceName && this.voiceName !== 'auto' && !this.voiceName.startsWith('studio:')) {
      const exact = voices.find(v => v.name === this.voiceName);
      if (exact) return exact;
    }
    return voices[0];
  }

  private getActiveStudioPreset(): 'kore' | 'aoede' | 'zephyr' | 'puck' {
    if (this.voiceName.startsWith('studio:')) {
      const preset = this.voiceName.slice('studio:'.length);
      if (preset === 'kore' || preset === 'aoede' || preset === 'zephyr' || preset === 'puck') {
        return preset;
      }
    }
    return 'kore';
  }

  private shouldPreferStudioVoiceDirectly(): boolean {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    // Always prefer Natural Studio Voice on 'auto' or explicit studio:* across PC, Android, iOS & all browsers
    if (this.voiceName === 'auto' || this.voiceName.startsWith('studio:')) return true;
    if (this.nativeSpeechBroken) return true;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return true;
    if (this.getAvailableVoices().length === 0 && isMobileOrTabletDevice()) return true;
    return false;
  }

  private stopActiveTtsFallback() {
    if (this.currentTtsSource) {
      this.currentTtsSource.onended = null;
      try {
        this.currentTtsSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.currentTtsSource.disconnect();
      this.currentTtsSource = null;
    }
    if (this.currentTtsAudio) {
      this.currentTtsAudio.onended = null;
      this.currentTtsAudio.onerror = null;
      this.currentTtsAudio.pause();
      this.currentTtsAudio.currentTime = 0;
      this.currentTtsAudio = null;
    }
  }

  private async fetchAndDecodeTts(
    cleanText: string,
    preset: 'kore' | 'aoede' | 'zephyr' | 'puck'
  ): Promise<AudioBuffer | null> {
    const cacheKey = `${preset}::${cleanText}`;
    const existingBuf = this.ttsBufferCache.get(cacheKey);
    if (existingBuf) return existingBuf;

    const inflight = this.ttsInFlight.get(cacheKey);
    if (inflight) return inflight;

    const task = (async (): Promise<AudioBuffer | null> => {
      try {
        const url = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(preset)}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuf = await response.arrayBuffer();
        const ctx = this.ensureContext(false);
        if (!ctx) return null;
        const decoded = await decodeAudioSafe(ctx, arrayBuf);
        if (this.ttsBufferCache.size >= 80) {
          const firstKey = this.ttsBufferCache.keys().next().value;
          if (firstKey !== undefined) this.ttsBufferCache.delete(firstKey);
        }
        this.ttsBufferCache.set(cacheKey, decoded);
        return decoded;
      } catch {
        return null;
      }
    })();

    this.ttsInFlight.set(cacheKey, task);
    try {
      return await task;
    } finally {
      this.ttsInFlight.delete(cacheKey);
    }
  }

  public prefetchSpeech(text: string): void {
    if (!this.voiceEnabled || typeof window === 'undefined') return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 240) return;

    if (this.shouldPreferStudioVoiceDirectly() || this.getAvailableVoices().length === 0) {
      const preset = this.getActiveStudioPreset();
      void this.fetchAndDecodeTts(cleanText, preset);
    }
  }

  private async playServerTtsFallback(
    text: string,
    requestId: number,
    onEnd?: () => void,
    onFailure?: () => void,
    canStartPlayback: () => boolean = () => true
  ) {
    let settled = false;
    const finishSuccess = () => {
      if (settled) return;
      settled = true;
      if (requestId === this.speakRequestId && onEnd) onEnd();
    };
    const finishFailure = () => {
      if (settled) return;
      settled = true;
      if (requestId !== this.speakRequestId) return;
      if (onFailure) {
        onFailure();
      } else if (onEnd) {
        onEnd();
      }
    };

    const cleanText = text.trim();
    if (!cleanText || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      finishFailure();
      return;
    }

    const preset = this.getActiveStudioPreset();
    const ctx = this.ensureContext(true);
    const playbackRate = Math.max(0.72, Math.min(1.3, this.voiceRate / 0.88));

    const playBuffer = (buffer: AudioBuffer) => {
      if (requestId !== this.speakRequestId || !canStartPlayback()) return;
      if (!ctx) {
        finishFailure();
        return;
      }
      const start = () => {
        if (requestId !== this.speakRequestId || !canStartPlayback()) return;
        try {
          this.stopActiveTtsFallback();
          if (
            'speechSynthesis' in window &&
            (window.speechSynthesis.speaking || window.speechSynthesis.pending)
          ) {
            try {
              window.speechSynthesis.cancel();
            } catch {
              // Ignore
            }
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = playbackRate;
          const gain = ctx.createGain();
          gain.gain.value = 1;
          source.connect(gain);
          gain.connect(ctx.destination);
          source.onended = () => {
            if (this.currentTtsSource === source) {
              this.currentTtsSource = null;
            }
            finishSuccess();
          };
          this.currentTtsSource = source;
          source.start(0);
        } catch {
          finishFailure();
        }
      };

      if (ctx.state === 'suspended') {
        void ctx.resume().then(start, finishFailure);
      } else {
        start();
      }
    };

    const cached = this.ttsBufferCache.get(`${preset}::${cleanText}`);
    if (cached && ctx) {
      playBuffer(cached);
      return;
    }

    try {
      const decoded = await this.fetchAndDecodeTts(cleanText, preset);
      if (requestId !== this.speakRequestId || !canStartPlayback()) return;

      if (decoded && ctx) {
        playBuffer(decoded);
        return;
      }

      // Direct HTMLAudio fallback if AudioContext wasn't available
      this.stopActiveTtsFallback();
      const url = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(preset)}`;
      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      this.currentTtsAudio = audio;
      audio.onended = () => {
        if (this.currentTtsAudio === audio) this.currentTtsAudio = null;
        finishSuccess();
      };
      audio.onerror = () => {
        if (this.currentTtsAudio === audio) this.currentTtsAudio = null;
        finishFailure();
      };
      await audio.play();
    } catch {
      finishFailure();
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.voiceEnabled || typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (cleanText === this.lastSpeakText && now - this.lastSpeakAt < 110) {
      return;
    }
    this.lastSpeakText = cleanText;
    this.lastSpeakAt = now;

    const requestId = ++this.speakRequestId;
    let claimedBy: 'none' | 'native' | 'studio' = 'none';
    let endNotified = false;
    const notifyEndOnce = () => {
      if (endNotified) return;
      endNotified = true;
      if (onEnd) onEnd();
    };

    if (this.speakDelayTimer !== null) {
      clearTimeout(this.speakDelayTimer);
      this.speakDelayTimer = null;
    }
    if (this.speakWatchdogTimer !== null) {
      clearTimeout(this.speakWatchdogTimer);
      this.speakWatchdogTimer = null;
    }
    this.activeUtterance = null;
    this.stopActiveTtsFallback();
    this.ensureContext(true);

    const startStudioSpeech = (allowNativeFallback: boolean) => {
      if (requestId !== this.speakRequestId) return;
      if (claimedBy === 'native') return;
      claimedBy = 'studio';

      if (
        'speechSynthesis' in window &&
        (window.speechSynthesis.speaking || window.speechSynthesis.pending)
      ) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }

      void this.playServerTtsFallback(
        cleanText,
        requestId,
        notifyEndOnce,
        () => {
          if (requestId !== this.speakRequestId) return;
          if (allowNativeFallback) {
            claimedBy = 'none';
            speakWithNative(false);
          } else {
            notifyEndOnce();
          }
        },
        () => claimedBy === 'studio'
      );
    };

    const speakWithNative = (allowStudioFallback: boolean) => {
      if (requestId !== this.speakRequestId) return;
      if (claimedBy === 'studio') return;

      if (!('speechSynthesis' in window)) {
        if (allowStudioFallback) {
          startStudioSpeech(false);
        } else {
          notifyEndOnce();
        }
        return;
      }

      const synth = window.speechSynthesis;
      const clampedPitch = Math.max(0.5, Math.min(2.0, this.voicePitch));
      const clampedRate = Math.max(0.5, Math.min(2.0, this.voiceRate));

      const dispatchUtterance = (useSelectedVoice: boolean) => {
        if (requestId !== this.speakRequestId || claimedBy === 'studio') return;
        try {
          if (synth.paused) {
            synth.resume();
          }

          const utterance = new SpeechSynthesisUtterance(cleanText);
          const selectedVoice = useSelectedVoice ? this.pickBestFemaleVoice() : undefined;
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.lang = selectedVoice?.lang || 'en-US';
          utterance.pitch = clampedPitch;
          utterance.rate = clampedRate;
          utterance.volume = 1;

          let started = false;
          let finished = false;
          this.activeUtterance = utterance;

          const clearWatchdog = () => {
            if (this.speakWatchdogTimer !== null) {
              clearTimeout(this.speakWatchdogTimer);
              this.speakWatchdogTimer = null;
            }
          };

          utterance.onstart = () => {
            clearWatchdog();
            if (requestId !== this.speakRequestId || claimedBy === 'studio') {
              if (this.activeUtterance === utterance) {
                this.activeUtterance = null;
              }
              try {
                synth.cancel();
              } catch {
                // Ignore
              }
              return;
            }
            claimedBy = 'native';
            started = true;
            this.speechUnlocked = true;
            this.stopActiveTtsFallback();
          };

          utterance.onend = () => {
            finished = true;
            clearWatchdog();
            if (this.activeUtterance === utterance) {
              this.activeUtterance = null;
            }
            if (requestId === this.speakRequestId && claimedBy !== 'studio') {
              notifyEndOnce();
            }
          };

          utterance.onerror = () => {
            clearWatchdog();
            if (
              this.activeUtterance !== utterance ||
              requestId !== this.speakRequestId ||
              claimedBy === 'studio'
            ) {
              return;
            }
            this.activeUtterance = null;

            if (useSelectedVoice && selectedVoice) {
              dispatchUtterance(false);
              return;
            }

            finished = true;
            if (allowStudioFallback && claimedBy === 'none') {
              this.nativeSpeechBroken = true;
              startStudioSpeech(false);
            } else {
              notifyEndOnce();
            }
          };

          if (allowStudioFallback) {
            const isOnlineVoice = Boolean(
              selectedVoice && (!selectedVoice.localService || /online/i.test(selectedVoice.name))
            );
            const watchdogMs = isOnlineVoice ? 2600 : isMobileOrTabletDevice() ? 900 : 1400;

            this.speakWatchdogTimer = window.setTimeout(() => {
              if (
                !started &&
                !finished &&
                claimedBy === 'none' &&
                this.activeUtterance === utterance &&
                requestId === this.speakRequestId &&
                typeof navigator !== 'undefined' &&
                navigator.onLine !== false
              ) {
                this.activeUtterance = null;
                this.nativeSpeechBroken = true;
                try {
                  synth.cancel();
                } catch {
                  // Ignore
                }
                startStudioSpeech(false);
              }
            }, watchdogMs);
          }

          synth.speak(utterance);
        } catch {
          if (allowStudioFallback && claimedBy === 'none') {
            startStudioSpeech(false);
          } else {
            notifyEndOnce();
          }
        }
      };

      if (synth.speaking || synth.pending) {
        try {
          synth.cancel();
        } catch {
          // Ignore
        }
        this.speakDelayTimer = window.setTimeout(() => {
          this.speakDelayTimer = null;
          dispatchUtterance(true);
        }, 65);
      } else {
        dispatchUtterance(true);
      }
    };

    // Prefer Built-in Natural Studio Voice on 'auto' or explicit studio:* across all platforms,
    // with automatic fallback to local OS/browser SpeechSynthesis if offline or unavailable.
    if (this.shouldPreferStudioVoiceDirectly()) {
      startStudioSpeech(true);
      return;
    }

    speakWithNative(true);
  }

  private speakMascotFallback(lang: 'en' | 'zh', volume: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lang === 'en' ? 'Hello!' : '你好！');
      utterance.lang = lang === 'en' ? 'en-US' : 'zh-CN';
      utterance.pitch = 1.45;
      utterance.rate = 0.95;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speechSynthesis unavailable
    }
  }

  public async preloadMascotVoice(lang: 'en' | 'zh'): Promise<void> {
    const existingBuf = this.mascotBufferCache[lang];
    if (existingBuf) return;

    const pending = this.mascotDecodePending[lang];
    if (pending) {
      await pending;
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    const task = (async (): Promise<AudioBuffer | null> => {
      try {
        const dataUri = MASCOT_VOICE_DATA_URIS[lang];
        let arrayBuf = decodeDataUriToArrayBuffer(dataUri);
        if (!arrayBuf) {
          const resp = await fetch(dataUri);
          arrayBuf = await resp.arrayBuffer();
        }
        const decoded = await decodeAudioSafe(ctx, arrayBuf);
        this.mascotBufferCache[lang] = decoded;
        return decoded;
      } catch {
        return null;
      }
    })();

    this.mascotDecodePending[lang] = task;
    try {
      await task;
    } finally {
      delete this.mascotDecodePending[lang];
    }
  }

  public playMascotVoice(lang: 'en' | 'zh'): void {
    if (typeof window === 'undefined') return;

    if (this.currentMascotSource) {
      try {
        this.currentMascotSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.currentMascotSource.disconnect();
      this.currentMascotSource = null;
    }

    if (this.currentMascotAudio) {
      this.currentMascotAudio.pause();
      this.currentMascotAudio.currentTime = 0;
      this.currentMascotAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const mascotVolume = 0.2;
    const ctx = this.ensureContext();
    const cachedBuffer = this.mascotBufferCache[lang];

    if (ctx && cachedBuffer) {
      const startPlayback = () => {
        try {
          const source = ctx.createBufferSource();
          source.buffer = cachedBuffer;
          const gain = ctx.createGain();
          gain.gain.value = mascotVolume;
          source.connect(gain);
          gain.connect(ctx.destination);
          source.onended = () => {
            if (this.currentMascotSource === source) {
              this.currentMascotSource = null;
            }
          };
          this.currentMascotSource = source;
          source.start(0);
        } catch {
          this.playMascotHtmlAudio(lang, mascotVolume);
        }
      };

      if (ctx.state === 'suspended') {
        void ctx.resume().then(startPlayback, () => this.playMascotHtmlAudio(lang, mascotVolume));
      } else {
        startPlayback();
      }
      return;
    }

    this.playMascotHtmlAudio(lang, mascotVolume);
    void this.preloadMascotVoice(lang);
  }

  private playMascotHtmlAudio(lang: 'en' | 'zh', volume: number) {
    try {
      const audio = new Audio(MASCOT_VOICE_DATA_URIS[lang]);
      audio.volume = volume;
      this.currentMascotAudio = audio;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          this.speakMascotFallback(lang, volume);
        });
      }
    } catch {
      this.speakMascotFallback(lang, volume);
    }
  }
}

export const sound = new SoundController();
