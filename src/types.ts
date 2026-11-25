export type GameMode = 'sentence' | 'spelling';

export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type SemesterNumber = 1 | 2;

export type UnitNumber = 1 | 2 | 3 | 4;

export interface VocabFolder {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isStarter?: boolean;
}

export interface GameItem {
  id: string;
  folderId: string;
  text: string;
  mode: GameMode;
  category: string;
  imageUrl?: string;
  imageName?: string;
  hint?: string;
  isCustom?: boolean;
  // Legacy optional fields kept solely for backward compatibility with older backups
  grade?: GradeLevel;
  semester?: SemesterNumber;
  unit?: UnitNumber;
}

export interface DotNode {
  id: string;
  text: string;
  targetIndex: number;
  x: number; // Percentage (10 - 90)
  y: number; // Percentage (15 - 85)
  colorIndex: number;
}

export type PlayerMode = 'single' | 'two';

export type InteractionMode = 'move_tap' | 'swap_line';

export type TwoPlayerVocabMode = 'same' | 'random';

export interface TwoPlayerConfig {
  vocabMode: TwoPlayerVocabMode;
  targetScore: number;
}

export interface ModeConfig {
  grade?: GradeLevel;
  semester?: SemesterNumber;
  unit?: UnitNumber;
  targetWordCount?: number;
  showNumberHints: boolean;
}

export interface GitHubSyncConfig {
  repo: string;
  branch: string;
  filePath: string;
  autoLoadOnStart: boolean;
  autoSaveOnline: boolean;
}

export interface GameSettings {
  gameMode: GameMode;
  playerMode: PlayerMode;
  interactionMode: InteractionMode;
  selectedFolderId: string;
  showNumberHints: boolean;
  twoPlayerConfig: TwoPlayerConfig;
  sentenceConfig: ModeConfig;
  wordsConfig: ModeConfig;
  musicEnabled: boolean;
  musicTrackId: number;
  musicVolume: number; // 0 to 1
  sfxEnabled: boolean;
  sfxVolume: number; // 0 to 1
  voiceEnabled: boolean;
  voiceName: string; // Preferred SpeechSynthesisVoice name or 'auto'
  voicePitch: number; // 0.7 to 1.5
  voiceRate: number; // 0.6 to 1.2
  githubSync: GitHubSyncConfig;
}

export interface IllustrationPreset {
  id: string;
  label: string;
  category: string;
  keywords: string[];
  imageUrl: string;
}

export type SongSectionName =
  | 'Intro'
  | '1st Stanza'
  | 'Refrain'
  | 'Chorus'
  | '2nd Stanza'
  | 'Bridge'
  | '2nd Chorus'
  | 'Outro';

export interface MusicSectionTiming {
  name: SongSectionName;
  startSec: number;
  endSec: number;
}

export interface MusicTrack {
  id: number;
  name: string;
  mood: string;
  tempo: number; // BPM
  instrument: string;
  durationSeconds: number;
  audioUrl: string;
  sections: SongSectionName[];
  sectionTimeline: MusicSectionTiming[];
}
