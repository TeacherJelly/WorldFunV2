import { MusicTrack, SongSectionName } from '../types';
import mascotHelloEnDataUri from '../assets/audio/mascot-hello-en.wav?inline';
import mascotNihaoZhDataUri from '../assets/audio/mascot-nihao-zh.wav?inline';

const MASCOT_VOICE_DATA_URIS: Record<'en' | 'zh', string> = {
  en: mascotHelloEnDataUri,
  zh: mascotNihaoZhDataUri,
};

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

type InstrumentId =
  | 'celesta'
  | 'flute'
  | 'marimba'
  | 'musicbox'
  | 'piano'
  | 'harp'
  | 'glockenspiel'
  | 'kalimba';

interface TrackBlueprint {
  id: number;
  name: string;
  mood: string;
  tempo: number;
  instrument: InstrumentId;
  instrumentLabel: string;
  rootMidi: number;
  scaleIntervals: number[];
  stanza1Degrees: number[];
  stanza2Degrees: number[];
  refrainDegrees: number[];
  chorusDegrees: number[];
  bridgeDegrees: number[];
  chorus2Degrees: number[];
  bassProgression: number[];
}

interface CompiledStep {
  note: number;
  harmony: number;
  bass: number;
  pad: number;
  section: SongSectionName;
}

interface CompiledTrack {
  meta: MusicTrack;
  instrument: InstrumentId;
  timeline: CompiledStep[];
}

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

const SCALE_MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];
const SCALE_PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
const SCALE_LYDIAN = [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19];
const SCALE_MIXOLYDIAN = [0, 2, 4, 5, 7, 9, 10, 12, 14, 16, 17, 19];
const SCALE_DORIAN = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19];

function degreeToMidi(root: number, scale: number[], deg: number): number {
  if (deg < 0) return 0; // rest
  const octave = Math.floor(deg / scale.length);
  const idx = ((deg % scale.length) + scale.length) % scale.length;
  return root + scale[idx] + octave * 12;
}

/**
 * Compiles a complete ~2-minute (120 seconds) instrumental soundtrack arrangement
 * with Intro, 1st Stanza, Refrain, Chorus, 2nd Stanza, Bridge, 2nd Chorus, and Outro.
 */
function compileTrack(bp: TrackBlueprint): CompiledTrack {
  // Eighth-note steps per second = (tempo / 60) * 2
  const stepsPerSecond = (bp.tempo / 60) * 2;
  const targetTotalSteps = Math.round(120 * stepsPerSecond); // ~2:00 exact target

  // Base 8-part structural plan in 16-step (2-bar) blocks
  const blocks: { section: SongSectionName; degrees: number[]; harmonyOffset: number; energy: number }[] = [
    // Intro (gentle arpeggiated opening)
    { section: 'Intro', degrees: [0, -1, 2, -1, 4, -1, 7, -1, 4, -1, 2, -1, 4, -1, 0, -1], harmonyOffset: 0, energy: 0 },
    // 1st Stanza (A - B)
    { section: '1st Stanza', degrees: bp.stanza1Degrees, harmonyOffset: 0, energy: 1 },
    { section: '1st Stanza', degrees: bp.stanza1Degrees.map((d, i) => (d < 0 ? -1 : i >= 12 ? d + 1 : d)), harmonyOffset: 2, energy: 1 },
    // Refrain (pre-chorus lift)
    { section: 'Refrain', degrees: bp.refrainDegrees, harmonyOffset: 2, energy: 2 },
    // Chorus 1
    { section: 'Chorus', degrees: bp.chorusDegrees, harmonyOffset: 2, energy: 3 },
    { section: 'Chorus', degrees: bp.chorusDegrees.map((d, i) => (d < 0 ? -1 : i % 4 === 3 ? d + 1 : d)), harmonyOffset: 4, energy: 3 },
    // 2nd Stanza (richer rhythmic variation)
    { section: '2nd Stanza', degrees: bp.stanza2Degrees, harmonyOffset: 2, energy: 2 },
    { section: '2nd Stanza', degrees: bp.stanza2Degrees.map((d, i) => (d < 0 ? -1 : i >= 10 ? d + 2 : d)), harmonyOffset: 2, energy: 2 },
    // Refrain 2
    { section: 'Refrain', degrees: bp.refrainDegrees, harmonyOffset: 4, energy: 2 },
    // Bridge (harmonic contrast)
    { section: 'Bridge', degrees: bp.bridgeDegrees, harmonyOffset: 3, energy: 2 },
    { section: 'Bridge', degrees: bp.bridgeDegrees.map((d, i) => (d < 0 ? -1 : i >= 12 ? d + 1 : d)), harmonyOffset: 4, energy: 3 },
    // 2nd Chorus (uplifted climactic repeat)
    { section: '2nd Chorus', degrees: bp.chorus2Degrees, harmonyOffset: 2, energy: 4 },
    { section: '2nd Chorus', degrees: bp.chorus2Degrees.map(d => (d < 0 ? -1 : d + 2)), harmonyOffset: 4, energy: 4 },
    // Outro (warm resolving cadence)
    { section: 'Outro', degrees: [4, -1, 2, -1, 1, -1, 0, -1, 2, -1, 4, -1, 7, -1, 0, -1], harmonyOffset: 0, energy: 0 },
  ];

  // Expand or pad musical phrases evenly across sections so total length hits ~120 seconds (2:00)
  const baseSteps = blocks.length * 16;
  const repeatFactor = Math.max(1, Math.round(targetTotalSteps / baseSteps));

  const expandedBlocks: typeof blocks = [];
  for (const blk of blocks) {
    // Intro & Outro stay 1x or 2x cleanly; Stanzas, Chorus, Bridge expand harmoniously
    const reps =
      blk.section === 'Intro' || blk.section === 'Outro'
        ? Math.min(2, repeatFactor)
        : repeatFactor;
    for (let r = 0; r < reps; r++) {
      const varied =
        r % 2 === 1
          ? blk.degrees.map((d, idx) => (d < 0 ? -1 : idx % 8 === 7 ? d + 1 : d))
          : blk.degrees;
      expandedBlocks.push({ ...blk, degrees: varied });
    }
  }

  // Trim or pad final Outro steps so duration is right at ~120s
  const timeline: CompiledStep[] = [];
  for (const blk of expandedBlocks) {
    for (let i = 0; i < 16; i++) {
      const deg = blk.degrees[i % blk.degrees.length];
      const note = degreeToMidi(bp.rootMidi, bp.scaleIntervals, deg);
      const harmony =
        blk.energy >= 2 && deg >= 0 && i % 2 === 0
          ? degreeToMidi(bp.rootMidi, bp.scaleIntervals, deg + blk.harmonyOffset)
          : 0;
      const barChordIdx = Math.floor(timeline.length / 4) % bp.bassProgression.length;
      const bassDeg = bp.bassProgression[barChordIdx];
      const bass =
        i % 2 === 0
          ? degreeToMidi(bp.rootMidi - 24, bp.scaleIntervals, bassDeg)
          : 0;
      const pad =
        blk.energy >= 2 && i % 4 === 0
          ? degreeToMidi(bp.rootMidi - 12, bp.scaleIntervals, bassDeg + 2)
          : 0;

      timeline.push({
        note,
        harmony,
        bass,
        pad,
        section: blk.section,
      });
    }
  }

  // Fine-tune length toward targetTotalSteps without cutting abruptly mid-phrase
  while (timeline.length < targetTotalSteps - 8) {
    // Repeat final Chorus + Outro tail phrase cleanly
    const finalTail = timeline.slice(-16);
    for (const s of finalTail) {
      timeline.push({ ...s, section: 'Outro' });
    }
  }
  if (timeline.length > targetTotalSteps + 16) {
    timeline.length = targetTotalSteps;
    // Resolve final 4 steps gently on root
    for (let k = Math.max(0, timeline.length - 4); k < timeline.length; k++) {
      timeline[k] = {
        note: k === timeline.length - 4 ? bp.rootMidi + 12 : 0,
        harmony: k === timeline.length - 4 ? bp.rootMidi + 16 : 0,
        bass: k === timeline.length - 4 ? bp.rootMidi - 12 : 0,
        pad: 0,
        section: 'Outro',
      };
    }
  }

  const durationSeconds = Math.round(timeline.length / stepsPerSecond);

  return {
    meta: {
      id: bp.id,
      name: bp.name,
      mood: `${bp.mood} · ${bp.instrumentLabel}`,
      tempo: bp.tempo,
      instrument: bp.instrumentLabel,
      durationSeconds,
      sections: SONG_SECTIONS,
    },
    instrument: bp.instrument,
    timeline,
  };
}

const BLUEPRINTS: TrackBlueprint[] = [
  {
    id: 1, name: 'Sunny Meadow', mood: 'Cheerful & Bright', tempo: 112, instrument: 'celesta', instrumentLabel: 'Celesta & Strings',
    rootMidi: 60, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 2, 4, 2, 5, 4, 2, 0, 1, 3, 5, 4, 2, 1, 0, -1],
    stanza2Degrees: [2, 4, 5, 4, 7, 5, 4, 2, 3, 5, 6, 5, 4, 2, 0, -1],
    refrainDegrees: [3, 4, 5, 7, 6, 5, 4, 2, 3, 5, 7, 8, 7, 5, 4, -1],
    chorusDegrees:  [7, 5, 4, 7, 8, 7, 5, 4, 5, 7, 8, 9, 7, 5, 7, -1],
    bridgeDegrees:  [5, 3, 1, 3, 5, 6, 4, 2, 4, 6, 8, 7, 5, 4, 2, -1],
    chorus2Degrees: [7, 7, 9, 7, 8, 9, 11, 9, 7, 8, 9, 7, 5, 4, 7, -1],
    bassProgression: [0, 4, 3, 4, 5, 3, 4, 0],
  },
  {
    id: 2, name: 'Music Box Lullaby', mood: 'Sweet & Gentle', tempo: 92, instrument: 'musicbox', instrumentLabel: 'Music Box',
    rootMidi: 65, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 4, 2, 4, 5, 4, 2, -1, 1, 3, 4, 3, 2, 1, 0, -1],
    stanza2Degrees: [4, 7, 5, 4, 5, 7, 4, -1, 3, 5, 4, 2, 1, 2, 0, -1],
    refrainDegrees: [2, 3, 4, 5, 4, 2, 1, -1, 2, 4, 5, 7, 5, 4, 2, -1],
    chorusDegrees:  [7, 5, 4, 2, 5, 4, 2, 0, 3, 5, 7, 5, 4, 2, 0, -1],
    bridgeDegrees:  [5, 4, 3, 1, 2, 3, 4, -1, 6, 5, 4, 3, 2, 4, 5, -1],
    chorus2Degrees: [7, 8, 7, 5, 4, 5, 7, -1, 8, 7, 5, 4, 2, 4, 7, -1],
    bassProgression: [0, 3, 4, 0, 5, 2, 4, 0],
  },
  {
    id: 3, name: 'Bouncy Xylophone', mood: 'Playful Hop', tempo: 124, instrument: 'glockenspiel', instrumentLabel: 'Xylophone',
    rootMidi: 62, scaleIntervals: SCALE_PENTATONIC,
    stanza1Degrees: [0, 2, 3, 2, 4, 3, 2, 0, 1, 2, 4, 3, 2, 1, 0, -1],
    stanza2Degrees: [2, 3, 4, 5, 4, 3, 2, 1, 3, 4, 5, 4, 3, 2, 0, -1],
    refrainDegrees: [3, 4, 5, 6, 5, 4, 3, 2, 4, 5, 6, 7, 5, 4, 3, -1],
    chorusDegrees:  [5, 6, 7, 5, 6, 5, 4, 2, 3, 4, 5, 6, 5, 4, 5, -1],
    bridgeDegrees:  [2, 4, 2, 0, 1, 3, 1, 0, 3, 5, 4, 2, 4, 5, 6, -1],
    chorus2Degrees: [5, 7, 8, 7, 6, 5, 4, 2, 5, 6, 7, 8, 7, 5, 5, -1],
    bassProgression: [0, 3, 2, 4, 0, 2, 3, 0],
  },
  {
    id: 4, name: 'Toy Train Adventure', mood: 'Upbeat Rhythm', tempo: 130, instrument: 'marimba', instrumentLabel: 'Marimba & Bells',
    rootMidi: 64, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 0, 2, 4, 4, 2, 1, 0, 2, 2, 4, 5, 4, 2, 1, -1],
    stanza2Degrees: [0, 2, 4, 5, 7, 5, 4, 2, 3, 4, 5, 7, 5, 4, 2, -1],
    refrainDegrees: [4, 5, 6, 7, 6, 5, 4, 2, 4, 5, 7, 8, 7, 5, 4, -1],
    chorusDegrees:  [7, 7, 5, 4, 8, 8, 7, 5, 4, 5, 7, 8, 7, 5, 4, -1],
    bridgeDegrees:  [5, 5, 3, 1, 4, 4, 2, 0, 5, 6, 7, 8, 7, 5, 4, -1],
    chorus2Degrees: [7, 9, 8, 7, 8, 9, 7, 5, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [0, 4, 0, 4, 3, 4, 5, 0],
  },
  {
    id: 5, name: 'Starlight Waltz', mood: 'Dreamy & Smooth', tempo: 98, instrument: 'harp', instrumentLabel: 'Concert Harp',
    rootMidi: 60, scaleIntervals: SCALE_LYDIAN,
    stanza1Degrees: [0, 2, 4, 7, 6, 4, 2, -1, 1, 3, 4, 6, 4, 2, 0, -1],
    stanza2Degrees: [2, 4, 6, 7, 8, 7, 6, -1, 4, 6, 7, 6, 4, 2, 0, -1],
    refrainDegrees: [3, 4, 6, 7, 6, 4, 3, -1, 4, 6, 7, 9, 7, 6, 4, -1],
    chorusDegrees:  [7, 6, 4, 7, 9, 7, 6, 4, 6, 7, 9, 7, 6, 4, 7, -1],
    bridgeDegrees:  [5, 4, 2, 0, 2, 4, 6, -1, 3, 4, 6, 7, 6, 4, 2, -1],
    chorus2Degrees: [7, 9, 11, 9, 7, 6, 4, -1, 7, 9, 11, 10, 9, 7, 7, -1],
    bassProgression: [0, 1, 4, 0, 5, 3, 4, 0],
  },
  {
    id: 6, name: 'Rainbow Hop', mood: 'Vibrant Pop', tempo: 120, instrument: 'piano', instrumentLabel: 'Bright Piano',
    rootMidi: 67, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [2, 4, 7, 4, 5, 4, 2, 0, 1, 2, 4, 5, 4, 2, 1, -1],
    stanza2Degrees: [4, 5, 7, 5, 8, 7, 5, 4, 2, 4, 5, 7, 5, 4, 2, -1],
    refrainDegrees: [5, 6, 7, 8, 7, 5, 4, 2, 5, 7, 8, 9, 8, 7, 5, -1],
    chorusDegrees:  [7, 8, 9, 7, 5, 7, 8, 5, 4, 5, 7, 8, 7, 5, 7, -1],
    bridgeDegrees:  [5, 3, 2, 0, 1, 3, 5, 4, 2, 4, 6, 7, 5, 4, 2, -1],
    chorus2Degrees: [7, 9, 11, 9, 8, 9, 7, 5, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [0, 5, 3, 4, 0, 3, 4, 0],
  },
  {
    id: 7, name: 'Gentle Forest', mood: 'Calm Nature', tempo: 96, instrument: 'flute', instrumentLabel: 'Woodland Flute',
    rootMidi: 65, scaleIntervals: SCALE_PENTATONIC,
    stanza1Degrees: [0, 1, 2, 4, 3, 2, 1, -1, 2, 3, 4, 5, 4, 2, 0, -1],
    stanza2Degrees: [1, 2, 4, 5, 4, 3, 2, -1, 3, 4, 5, 6, 5, 3, 1, -1],
    refrainDegrees: [2, 4, 5, 6, 5, 4, 2, -1, 3, 5, 6, 7, 5, 4, 2, -1],
    chorusDegrees:  [5, 6, 7, 5, 4, 5, 6, 4, 2, 4, 5, 6, 5, 4, 5, -1],
    bridgeDegrees:  [3, 2, 1, 0, 1, 2, 3, -1, 4, 3, 2, 1, 2, 4, 5, -1],
    chorus2Degrees: [5, 7, 8, 7, 6, 5, 4, -1, 5, 6, 7, 8, 7, 5, 5, -1],
    bassProgression: [0, 2, 3, 0, 1, 3, 4, 0],
  },
  {
    id: 8, name: 'Circus Parade', mood: 'Silly & Fun', tempo: 128, instrument: 'kalimba', instrumentLabel: 'Toy Band',
    rootMidi: 60, scaleIntervals: SCALE_MIXOLYDIAN,
    stanza1Degrees: [0, 2, 4, 5, 4, 2, 1, 0, 2, 4, 6, 5, 4, 2, 0, -1],
    stanza2Degrees: [4, 2, 4, 6, 7, 6, 4, 2, 3, 5, 6, 5, 4, 2, 1, -1],
    refrainDegrees: [3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 7, 6, 4, -1],
    chorusDegrees:  [7, 6, 5, 4, 6, 5, 4, 2, 4, 6, 7, 8, 7, 5, 4, -1],
    bridgeDegrees:  [5, 4, 3, 1, 2, 4, 6, 5, 4, 6, 7, 6, 5, 4, 2, -1],
    chorus2Degrees: [7, 8, 9, 8, 7, 6, 5, 4, 7, 8, 9, 10, 9, 7, 7, -1],
    bassProgression: [0, 6, 3, 4, 0, 6, 4, 0],
  },
  {
    id: 9, name: 'Cloud Nine', mood: 'Airy & Soft', tempo: 90, instrument: 'celesta', instrumentLabel: 'Soft Celesta',
    rootMidi: 62, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 2, 4, 7, 5, 4, 2, -1, 0, 3, 5, 4, 2, 1, 0, -1],
    stanza2Degrees: [2, 4, 5, 7, 8, 7, 5, -1, 3, 5, 7, 5, 4, 2, 0, -1],
    refrainDegrees: [3, 5, 7, 8, 7, 5, 4, -1, 4, 6, 7, 9, 7, 5, 4, -1],
    chorusDegrees:  [7, 5, 7, 9, 8, 7, 5, -1, 5, 7, 8, 9, 7, 5, 4, -1],
    bridgeDegrees:  [5, 4, 3, 1, 2, 4, 5, -1, 6, 5, 4, 2, 4, 5, 7, -1],
    chorus2Degrees: [7, 9, 11, 9, 8, 7, 5, -1, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [0, 3, 5, 4, 0, 3, 4, 0],
  },
  {
    id: 10, name: 'Puppy Playtime', mood: 'Happy Bounce', tempo: 126, instrument: 'marimba', instrumentLabel: 'Playful Marimba',
    rootMidi: 67, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [4, 4, 7, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0, -1],
    stanza2Degrees: [2, 4, 5, 4, 7, 5, 4, 2, 3, 4, 5, 7, 5, 4, 2, -1],
    refrainDegrees: [3, 4, 5, 7, 6, 5, 4, 2, 3, 5, 7, 8, 7, 5, 4, -1],
    chorusDegrees:  [7, 7, 9, 7, 5, 5, 4, 2, 4, 5, 7, 9, 8, 7, 7, -1],
    bridgeDegrees:  [5, 3, 1, 3, 5, 4, 2, 0, 4, 5, 7, 8, 7, 5, 4, -1],
    chorus2Degrees: [7, 9, 11, 9, 7, 5, 4, 2, 7, 9, 11, 12, 11, 9, 7, -1],
    bassProgression: [0, 4, 3, 0, 5, 3, 4, 0],
  },
  {
    id: 11, name: 'Ocean Bubbles', mood: 'Sparkly Water', tempo: 104, instrument: 'harp', instrumentLabel: 'Water Harp',
    rootMidi: 60, scaleIntervals: SCALE_LYDIAN,
    stanza1Degrees: [0, 4, 7, 9, 7, 4, 2, 0, 1, 4, 6, 8, 6, 4, 2, -1],
    stanza2Degrees: [2, 4, 7, 9, 11, 9, 7, 4, 3, 6, 7, 9, 7, 6, 4, -1],
    refrainDegrees: [3, 6, 7, 9, 7, 6, 4, -1, 4, 6, 7, 11, 9, 7, 6, -1],
    chorusDegrees:  [7, 9, 11, 9, 7, 6, 4, 2, 6, 7, 9, 11, 9, 7, 7, -1],
    bridgeDegrees:  [5, 3, 1, 3, 5, 7, 6, 4, 2, 4, 6, 7, 6, 4, 2, -1],
    chorus2Degrees: [9, 11, 12, 11, 9, 7, 6, 4, 7, 9, 11, 12, 11, 9, 7, -1],
    bassProgression: [0, 4, 1, 4, 5, 3, 4, 0],
  },
  {
    id: 12, name: 'Space Explorer', mood: 'Cosmic Wonder', tempo: 100, instrument: 'piano', instrumentLabel: 'Cosmic Keys',
    rootMidi: 57, scaleIntervals: SCALE_DORIAN,
    stanza1Degrees: [0, 4, 7, 6, 4, 2, 0, -1, 2, 4, 6, 7, 6, 4, 2, -1],
    stanza2Degrees: [4, 6, 7, 9, 7, 6, 4, 2, 3, 5, 7, 6, 4, 2, 0, -1],
    refrainDegrees: [2, 3, 5, 7, 6, 5, 3, -1, 4, 6, 7, 9, 7, 6, 4, -1],
    chorusDegrees:  [7, 9, 10, 9, 7, 6, 4, 2, 5, 7, 9, 7, 6, 4, 7, -1],
    bridgeDegrees:  [3, 5, 7, 5, 3, 1, 2, -1, 4, 6, 7, 9, 7, 6, 4, -1],
    chorus2Degrees: [7, 9, 11, 10, 9, 7, 6, 4, 7, 9, 10, 9, 7, 6, 7, -1],
    bassProgression: [0, 3, 6, 4, 0, 2, 3, 0],
  },
  {
    id: 13, name: 'Butterfly Garden', mood: 'Light Flutter', tempo: 116, instrument: 'flute', instrumentLabel: 'Breeze Flute',
    rootMidi: 65, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [4, 5, 7, 5, 4, 2, 0, 2, 4, 7, 9, 7, 5, 4, 2, -1],
    stanza2Degrees: [2, 4, 5, 7, 5, 4, 2, 1, 3, 5, 7, 8, 7, 5, 4, -1],
    refrainDegrees: [3, 4, 5, 7, 8, 7, 5, 4, 5, 6, 7, 9, 8, 7, 5, -1],
    chorusDegrees:  [7, 9, 8, 7, 5, 7, 8, 5, 4, 5, 7, 9, 7, 5, 7, -1],
    bridgeDegrees:  [5, 3, 2, 0, 1, 2, 4, 2, 3, 5, 7, 5, 4, 2, 4, -1],
    chorus2Degrees: [7, 9, 11, 9, 8, 9, 7, 5, 7, 9, 11, 12, 9, 7, 7, -1],
    bassProgression: [0, 4, 5, 3, 0, 3, 4, 0],
  },
  {
    id: 14, name: 'Happy Marimba', mood: 'Island Groove', tempo: 122, instrument: 'marimba', instrumentLabel: 'Island Marimba',
    rootMidi: 62, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [2, 4, 2, 0, 5, 7, 5, 3, 4, 6, 4, 1, 2, 4, 7, -1],
    stanza2Degrees: [4, 5, 4, 2, 7, 8, 7, 5, 6, 7, 6, 4, 5, 7, 4, -1],
    refrainDegrees: [3, 5, 7, 5, 4, 6, 7, 4, 5, 7, 8, 7, 5, 4, 2, -1],
    chorusDegrees:  [7, 5, 4, 7, 9, 7, 5, 4, 5, 7, 8, 9, 7, 5, 7, -1],
    bridgeDegrees:  [5, 4, 3, 1, 2, 3, 4, 2, 4, 6, 7, 6, 5, 4, 2, -1],
    chorus2Degrees: [7, 9, 11, 9, 7, 5, 4, 2, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [0, 0, 3, 3, 4, 4, 0, 0],
  },
  {
    id: 15, name: 'Cozy Campfire', mood: 'Warm Folk', tempo: 96, instrument: 'kalimba', instrumentLabel: 'Warm Kalimba',
    rootMidi: 60, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 1, 2, 4, 5, 4, 2, 1, 0, 2, 4, 3, 2, 1, 0, -1],
    stanza2Degrees: [2, 3, 4, 5, 7, 5, 4, 2, 3, 4, 5, 4, 2, 1, 0, -1],
    refrainDegrees: [3, 4, 5, 7, 5, 4, 2, -1, 4, 5, 6, 7, 5, 4, 2, -1],
    chorusDegrees:  [4, 5, 7, 8, 7, 5, 4, 2, 3, 4, 5, 7, 5, 4, 0, -1],
    bridgeDegrees:  [5, 4, 3, 1, 2, 3, 4, -1, 2, 4, 5, 7, 5, 4, 2, -1],
    chorus2Degrees: [7, 8, 9, 8, 7, 5, 4, 2, 5, 7, 8, 9, 7, 5, 7, -1],
    bassProgression: [0, 4, 5, 3, 0, 3, 4, 0],
  },
  {
    id: 16, name: 'Morning Dew', mood: 'Fresh Sunrise', tempo: 102, instrument: 'piano', instrumentLabel: 'Soft Piano',
    rootMidi: 64, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [2, 4, 7, 9, 8, 7, 5, 4, 2, 4, 5, 7, 5, 4, 2, -1],
    stanza2Degrees: [4, 5, 7, 9, 11, 9, 7, 5, 4, 5, 7, 8, 7, 5, 4, -1],
    refrainDegrees: [3, 5, 7, 8, 7, 5, 4, -1, 4, 6, 7, 9, 8, 7, 5, -1],
    chorusDegrees:  [7, 9, 11, 9, 8, 7, 5, 4, 5, 7, 9, 8, 7, 5, 7, -1],
    bridgeDegrees:  [5, 3, 2, 0, 1, 3, 5, 4, 3, 5, 7, 8, 7, 5, 4, -1],
    chorus2Degrees: [9, 11, 12, 11, 9, 8, 7, 5, 7, 9, 11, 12, 9, 7, 7, -1],
    bassProgression: [5, 3, 0, 4, 5, 3, 4, 0],
  },
  {
    id: 17, name: 'Candy Shop', mood: 'Sweet & Peppy', tempo: 128, instrument: 'glockenspiel', instrumentLabel: 'Glockenspiel',
    rootMidi: 65, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [4, 4, 5, 7, 4, 7, 5, -1, 3, 3, 4, 5, 3, 5, 4, -1],
    stanza2Degrees: [2, 4, 5, 7, 8, 7, 5, 4, 3, 5, 6, 7, 5, 4, 2, -1],
    refrainDegrees: [3, 4, 5, 7, 6, 5, 4, 2, 4, 5, 7, 8, 7, 5, 4, -1],
    chorusDegrees:  [7, 7, 8, 9, 7, 9, 8, 7, 5, 7, 8, 9, 7, 5, 7, -1],
    bridgeDegrees:  [5, 3, 2, 0, 1, 3, 5, 4, 2, 4, 6, 7, 5, 4, 2, -1],
    chorus2Degrees: [7, 9, 11, 9, 8, 9, 7, 5, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [0, 4, 0, 4, 3, 4, 5, 0],
  },
  {
    id: 18, name: 'Magic Castle', mood: 'Storybook Harp', tempo: 106, instrument: 'harp', instrumentLabel: 'Royal Harp',
    rootMidi: 62, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [0, 4, 7, 11, 9, 7, 4, 2, 3, 6, 7, 10, 9, 7, 6, 4],
    stanza2Degrees: [2, 4, 7, 9, 11, 9, 7, 4, 5, 7, 9, 11, 9, 7, 5, -1],
    refrainDegrees: [3, 4, 6, 7, 9, 7, 6, 4, 5, 7, 8, 9, 7, 6, 4, -1],
    chorusDegrees:  [7, 9, 11, 9, 7, 6, 4, 2, 4, 6, 7, 9, 7, 5, 7, -1],
    bridgeDegrees:  [5, 4, 2, 0, 1, 3, 5, 4, 3, 5, 6, 7, 6, 4, 2, -1],
    chorus2Degrees: [9, 11, 12, 11, 9, 7, 6, 4, 7, 9, 11, 12, 11, 9, 7, -1],
    bassProgression: [0, 4, 3, 4, 0, 3, 4, 0],
  },
  {
    id: 19, name: 'Spring Breeze', mood: 'Easy & Happy', tempo: 108, instrument: 'flute', instrumentLabel: 'Flute & Harp',
    rootMidi: 60, scaleIntervals: SCALE_MAJOR,
    stanza1Degrees: [3, 5, 7, 10, 9, 7, 5, 3, 4, 6, 8, 7, 5, 4, 3, -1],
    stanza2Degrees: [2, 4, 5, 7, 8, 7, 5, 4, 3, 5, 7, 8, 7, 5, 3, -1],
    refrainDegrees: [3, 4, 5, 7, 6, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, -1],
    chorusDegrees:  [7, 5, 4, 7, 8, 7, 5, 3, 4, 5, 7, 8, 7, 5, 7, -1],
    bridgeDegrees:  [5, 4, 2, 0, 1, 2, 4, 2, 3, 4, 6, 7, 5, 4, 2, -1],
    chorus2Degrees: [7, 9, 11, 9, 8, 7, 5, 4, 7, 8, 9, 11, 9, 7, 7, -1],
    bassProgression: [3, 0, 1, 4, 3, 2, 4, 0],
  },
  {
    id: 20, name: 'Bedtime Chimes', mood: 'Peaceful Bells', tempo: 84, instrument: 'musicbox', instrumentLabel: 'Gentle Chimes',
    rootMidi: 67, scaleIntervals: SCALE_PENTATONIC,
    stanza1Degrees: [4, 2, 3, 0, -1, 0, 3, 4, 2, -1, 4, 2, 3, 0, 2, -1],
    stanza2Degrees: [5, 4, 3, 2, -1, 1, 2, 3, 4, -1, 5, 4, 3, 2, 0, -1],
    refrainDegrees: [2, 3, 4, 5, 4, 3, 2, -1, 3, 4, 5, 6, 5, 4, 2, -1],
    chorusDegrees:  [5, 4, 3, 2, 4, 3, 2, 0, 2, 3, 4, 5, 4, 3, 2, -1],
    bridgeDegrees:  [3, 2, 1, 0, -1, 0, 1, 2, 3, -1, 4, 3, 2, 1, 0, -1],
    chorus2Degrees: [5, 6, 7, 5, 4, 3, 2, -1, 5, 6, 7, 8, 7, 5, 5, -1],
    bassProgression: [0, 3, 2, 3, 0, 3, 2, 0],
  },
];

const COMPILED_TRACKS: CompiledTrack[] = BLUEPRINTS.map(compileTrack);
export const MUSIC_TRACKS: MusicTrack[] = COMPILED_TRACKS.map(t => t.meta);

const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

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
  { id: 'studio:kore', preset: 'kore', label: 'Ms. Kore — Warm Teacher (Female)' },
  { id: 'studio:aoede', preset: 'aoede', label: 'Ms. Aoede — Bright Cheerful Teacher (Female)' },
  { id: 'studio:zephyr', preset: 'zephyr', label: 'Ms. Zephyr — Gentle Storyteller (Female)' },
  { id: 'studio:puck', preset: 'puck', label: 'Fox Mascot — Playful Kid Voice' },
];

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent || '');
}

function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /android|iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}

class SoundController {
  private ctx: AudioContext | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private gestureUnlockBound = false;

  public sfxEnabled = true;
  public sfxVolume = 0.7;

  public musicEnabled = false;
  public musicTrackId = 1;
  public musicVolume = 0.28;

  public voiceEnabled = true;
  public voiceName = 'auto';
  public voicePitch = 1.08;
  public voiceRate = 0.88;

  private mascotBufferCache: Partial<Record<'en' | 'zh', AudioBuffer>> = {};
  private mascotDecodePending: Partial<Record<'en' | 'zh', Promise<AudioBuffer | null>>> = {};
  private currentMascotSource: AudioBufferSourceNode | null = null;
  private currentMascotAudio: HTMLAudioElement | null = null;

  private speechUnlocked = false;
  private nativeSpeechBroken = false;
  private speakRequestId = 0;
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
      this.ensureContext(true);
    };

    window.addEventListener('pointerdown', onFirstGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', onFirstGesture, { passive: true, capture: true });
    window.addEventListener('keydown', onFirstGesture, { passive: true, capture: true });
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
    if (allowResume && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.musicFilter) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2600;
      filter.Q.value = 0.7;
      filter.connect(this.ctx.destination);
      this.musicFilter = filter;
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
      // Trigger voice list load on iOS/Android
      synth.getVoices();

      // Speaking a silent ' ' primer followed by cancel/speak jams Android TTS binder; skip primer on Android
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
    if (this.musicEnabled && this.musicTimer === null) {
      this.startMusic();
    }
  }

  private playInstrumentVoice(
    ctx: AudioContext,
    dest: AudioNode,
    midi: number,
    vol: number,
    instrument: InstrumentId,
    now: number,
    durationSec: number
  ) {
    const freq = midiToFreq(midi);
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overGain = ctx.createGain();

    if (instrument === 'flute' || instrument === 'musicbox') {
      osc.type = 'sine';
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);
      overGain.gain.value = instrument === 'musicbox' ? 0.18 : 0.12;
    } else if (instrument === 'piano' || instrument === 'harp') {
      osc.type = 'triangle';
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);
      overGain.gain.value = 0.22;
    } else {
      osc.type = 'triangle';
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 3, now);
      overGain.gain.value = 0.08;
    }

    osc.frequency.setValueAtTime(freq, now);
    const attack = instrument === 'flute' ? 0.04 : 0.015;
    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + durationSec);

    osc.connect(gain);
    overtone.connect(overGain);
    overGain.connect(gain);
    gain.connect(dest);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + durationSec + 0.03);
    overtone.stop(now + durationSec + 0.03);
  }

  // Full 2-Minute Structured Instrumental Soundtrack Sequencer
  public startMusic() {
    this.stopMusic();
    if (!this.musicEnabled) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const compiled =
      COMPILED_TRACKS.find(t => t.meta.id === this.musicTrackId) || COMPILED_TRACKS[0];
    const stepMs = (60 / compiled.meta.tempo / 2) * 1000;
    this.musicStep = 0;

    const playStep = () => {
      if (!this.musicEnabled) return;
      const activeCtx = this.ensureContext();
      if (!activeCtx) return;

      const activeCompiled =
        COMPILED_TRACKS.find(t => t.meta.id === this.musicTrackId) || COMPILED_TRACKS[0];
      const dest = this.musicFilter || activeCtx.destination;
      const now = activeCtx.currentTime;
      const step = activeCompiled.timeline[this.musicStep % activeCompiled.timeline.length];
      const vol = Math.max(0.01, this.musicVolume * 0.22);

      // Lead instrumental melody
      if (step.note > 0) {
        const noteDur =
          activeCompiled.instrument === 'harp' || activeCompiled.instrument === 'piano'
            ? 0.46
            : 0.36;
        this.playInstrumentVoice(
          activeCtx,
          dest,
          step.note,
          vol,
          activeCompiled.instrument,
          now,
          noteDur
        );
      }

      // Harmony counter-melody (Refrain, Chorus, Bridge, 2nd Chorus)
      if (step.harmony > 0) {
        this.playInstrumentVoice(
          activeCtx,
          dest,
          step.harmony,
          vol * 0.42,
          activeCompiled.instrument === 'flute' || activeCompiled.instrument === 'musicbox'
            ? 'musicbox'
            : 'flute',
          now,
          0.32
        );
      }

      // Warm instrumental bass pulse
      if (step.bass > 0) {
        const bOsc = activeCtx.createOscillator();
        const bGain = activeCtx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(midiToFreq(step.bass), now);
        bGain.gain.setValueAtTime(0.0008, now);
        bGain.gain.linearRampToValueAtTime(vol * 0.62, now + 0.02);
        bGain.gain.exponentialRampToValueAtTime(0.0006, now + 0.48);
        bOsc.connect(bGain);
        bGain.connect(dest);
        bOsc.start(now);
        bOsc.stop(now + 0.5);
      }

      // Warm instrumental chord pad on Chorus / Bridge / 2nd Chorus
      if (step.pad > 0) {
        const pOsc = activeCtx.createOscillator();
        const pGain = activeCtx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(midiToFreq(step.pad), now);
        pGain.gain.setValueAtTime(0.0006, now);
        pGain.gain.linearRampToValueAtTime(vol * 0.28, now + 0.08);
        pGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.9);
        pOsc.connect(pGain);
        pGain.connect(dest);
        pOsc.start(now);
        pOsc.stop(now + 0.92);
      }

      this.musicStep++;
    };

    playStep();
    this.musicTimer = window.setInterval(playStep, stepMs);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public syncMusicSettings(enabled: boolean, trackId: number, volume: number) {
    const trackChanged = this.musicTrackId !== trackId;
    const enabledChanged = this.musicEnabled !== enabled;
    this.musicEnabled = enabled;
    this.musicTrackId = trackId;
    this.musicVolume = volume;

    if (!enabled) {
      this.stopMusic();
    } else if (enabledChanged || trackChanged || this.musicTimer === null) {
      this.startMusic();
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
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((f, idx) => {
      this.playTone(f, idx === chord.length - 1 ? 0.7 : 0.24, 'triangle', 0.24, idx * 0.08);
    });
  }

  public playRewardChime() {
    this.playTone(880, 0.18, 'sine', 0.22, 0);
    this.playTone(1174.66, 0.25, 'sine', 0.22, 0.09);
    this.playTone(1567.98, 0.45, 'sine', 0.25, 0.18);
  }

  // Natural Speaking Voice System (Cross-Platform: PC, Android, Apple iOS/iPadOS/macOS)
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
      // Cloud-only voices frequently fail silently on mobile browsers and offline devices
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
    if (this.voiceName.startsWith('studio:')) return true;
    if (this.nativeSpeechBroken) return true;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return true;

    // On Android devices, speechSynthesis voices are frequently missing, blocked in WebViews/iframes,
    // or stall silently; prefer the built-in Studio voice automatically when 'auto' is selected.
    if (this.voiceName === 'auto' && isAndroidDevice()) return true;

    if (this.voiceName === 'auto' && this.getAvailableVoices().length === 0 && isMobileOrTabletDevice()) {
      return true;
    }
    return false;
  }

  private stopActiveTtsFallback() {
    if (this.currentTtsSource) {
      try {
        this.currentTtsSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.currentTtsSource.disconnect();
      this.currentTtsSource = null;
    }
    if (this.currentTtsAudio) {
      this.currentTtsAudio.pause();
      this.currentTtsAudio.currentTime = 0;
      this.currentTtsAudio = null;
    }
  }

  private async fetchAndDecodeTts(cleanText: string, preset: 'kore' | 'aoede' | 'zephyr' | 'puck'): Promise<AudioBuffer | null> {
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
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
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

    // Warm up built-in TTS audio on Android, Studio voice selections, or devices with 0 native voices
    if (this.shouldPreferStudioVoiceDirectly() || this.getAvailableVoices().length === 0) {
      const preset = this.getActiveStudioPreset();
      void this.fetchAndDecodeTts(cleanText, preset);
    }
  }

  private async playServerTtsFallback(
    text: string,
    requestId: number,
    onEnd?: () => void,
    onFailure?: () => void
  ) {
    const cleanText = text.trim();
    if (!cleanText || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      if (onFailure) {
        onFailure();
      } else if (onEnd) {
        onEnd();
      }
      return;
    }

    const preset = this.getActiveStudioPreset();
    const ctx = this.ensureContext(true);
    const playbackRate = Math.max(0.75, Math.min(1.25, this.voiceRate / 0.88));

    const playBuffer = (buffer: AudioBuffer) => {
      if (requestId !== this.speakRequestId) return;
      if (!ctx) {
        if (onFailure) onFailure();
        else if (onEnd) onEnd();
        return;
      }
      const start = () => {
        if (requestId !== this.speakRequestId) return;
        try {
          this.stopActiveTtsFallback();
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
            if (onEnd) onEnd();
          };
          this.currentTtsSource = source;
          source.start(0);
        } catch {
          if (onFailure) onFailure();
          else if (onEnd) onEnd();
        }
      };

      if (ctx.state === 'suspended') {
        void ctx.resume().then(start, () => {
          if (onFailure) onFailure();
          else if (onEnd) onEnd();
        });
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
      if (requestId !== this.speakRequestId) return;

      if (decoded && ctx) {
        playBuffer(decoded);
        return;
      }

      // Direct HTMLAudio fallback if AudioContext wasn't available
      const url = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(preset)}`;
      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      this.currentTtsAudio = audio;
      audio.onended = () => {
        if (this.currentTtsAudio === audio) this.currentTtsAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        if (this.currentTtsAudio === audio) this.currentTtsAudio = null;
        if (onFailure) onFailure();
        else if (onEnd) onEnd();
      };
      await audio.play();
    } catch {
      if (requestId !== this.speakRequestId) return;
      if (onFailure) onFailure();
      else if (onEnd) onEnd();
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

    const requestId = ++this.speakRequestId;

    if (this.speakDelayTimer !== null) {
      clearTimeout(this.speakDelayTimer);
      this.speakDelayTimer = null;
    }
    if (this.speakWatchdogTimer !== null) {
      clearTimeout(this.speakWatchdogTimer);
      this.speakWatchdogTimer = null;
    }
    this.stopActiveTtsFallback();
    this.ensureContext(true);

    const speakWithNative = (allowStudioFallback: boolean) => {
      if (!('speechSynthesis' in window)) {
        if (allowStudioFallback) {
          void this.playServerTtsFallback(cleanText, requestId, onEnd);
        } else if (onEnd) {
          onEnd();
        }
        return;
      }

      const synth = window.speechSynthesis;
      const clampedPitch = Math.max(0.5, Math.min(2.0, this.voicePitch));
      const clampedRate = Math.max(0.5, Math.min(2.0, this.voiceRate));

      const dispatchUtterance = (useSelectedVoice: boolean) => {
        if (requestId !== this.speakRequestId) return;
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
            started = true;
            this.speechUnlocked = true;
            clearWatchdog();
          };

          utterance.onend = () => {
            finished = true;
            clearWatchdog();
            if (this.activeUtterance === utterance) {
              this.activeUtterance = null;
            }
            if (onEnd) onEnd();
          };

          utterance.onerror = () => {
            clearWatchdog();
            if (this.activeUtterance !== utterance || requestId !== this.speakRequestId) {
              return;
            }
            this.activeUtterance = null;

            // Retry once without explicit voice object (rescues strict OEM TTS engines)
            if (useSelectedVoice && selectedVoice) {
              dispatchUtterance(false);
              return;
            }

            finished = true;
            if (allowStudioFallback) {
              this.nativeSpeechBroken = true;
              void this.playServerTtsFallback(cleanText, requestId, onEnd);
            } else if (onEnd) {
              onEnd();
            }
          };

          // Note: do NOT gate on !synth.speaking — Android TTS engines frequently get stuck
          // with synth.speaking === true while never firing onstart or producing audio.
          if (allowStudioFallback) {
            this.speakWatchdogTimer = window.setTimeout(() => {
              if (
                !started &&
                !finished &&
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
                void this.playServerTtsFallback(cleanText, requestId, onEnd);
              }
            }, 550);
          }

          synth.speak(utterance);
        } catch {
          if (allowStudioFallback) {
            void this.playServerTtsFallback(cleanText, requestId, onEnd);
          } else if (onEnd) {
            onEnd();
          }
        }
      };

      // Only cancel when actually speaking/pending; calling cancel() + speak() in the same tick
      // triggers a well-known Android Chrome & iOS Safari bug that silently drops the new utterance.
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

    // On Android devices, Built-in Studio Voices (or explicit studio:* selections) play immediately
    // via Web Audio API, with automatic fallback to device speechSynthesis if offline or unreachable.
    if (this.shouldPreferStudioVoiceDirectly()) {
      if ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }
      void this.playServerTtsFallback(cleanText, requestId, onEnd, () => {
        speakWithNative(false);
      });
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
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
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

    // Play bundled data-URI audio synchronously inside user click gesture while warming AudioBuffer
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
