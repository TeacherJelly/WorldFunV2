import {
  GameItem,
  GameSettings,
  GradeLevel,
  InteractionMode,
  ModeConfig,
  PlayerMode,
  SemesterNumber,
  TwoPlayerConfig,
  TwoPlayerVocabMode,
  UnitNumber,
} from '../types';
import { DEFAULT_SENTENCE_ITEMS, DEFAULT_SPELLING_ITEMS } from './defaultData';
import { autoCategorize, findMatchingIllustration } from './illustrations';

const STORAGE_KEY_ITEMS = 'wordfun_items_v4';
const STORAGE_KEY_SETTINGS = 'wordfun_settings_v4';

const LEGACY_KEYS_ITEMS = ['wordfun_items_v3', 'worddot_items_v2'];

export const DEFAULT_SENTENCE_CONFIG: ModeConfig = {
  grade: 1,
  semester: 1,
  unit: 1,
  targetWordCount: 3,
  showNumberHints: false,
};

export const DEFAULT_WORDS_CONFIG: ModeConfig = {
  grade: 1,
  semester: 1,
  unit: 1,
  targetWordCount: 3,
  showNumberHints: false,
};

export const DEFAULT_AUDIO_SETTINGS = {
  musicEnabled: true,
  musicTrackId: 1,
  musicVolume: 0.25,
  sfxEnabled: true,
  sfxVolume: 0.75,
  voiceEnabled: true,
  voiceName: 'auto',
  voicePitch: 1.08,
  voiceRate: 0.88,
};

export const DEFAULT_TWO_PLAYER_CONFIG: TwoPlayerConfig = {
  vocabMode: 'same',
  targetScore: 5,
};

export const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'sentence',
  playerMode: 'single',
  interactionMode: 'move_tap',
  twoPlayerConfig: { ...DEFAULT_TWO_PLAYER_CONFIG },
  sentenceConfig: { ...DEFAULT_SENTENCE_CONFIG },
  wordsConfig: { ...DEFAULT_WORDS_CONFIG },
  ...DEFAULT_AUDIO_SETTINGS,
};

export function normalizePlayerMode(val: unknown): PlayerMode {
  return val === 'two' ? 'two' : 'single';
}

export function normalizeInteractionMode(val: unknown): InteractionMode {
  return val === 'swap_line' ? 'swap_line' : 'move_tap';
}

export function normalizeVocabMode(val: unknown): TwoPlayerVocabMode {
  return val === 'random' ? 'random' : 'same';
}

export function normalizeTargetScore(val: unknown): number {
  const n = Math.round(Number(val));
  if (!Number.isFinite(n) || n < 1) return DEFAULT_TWO_PLAYER_CONFIG.targetScore;
  return Math.min(30, n);
}

export function normalizeGrade(val: unknown): GradeLevel {
  const n = Number(val);
  if (n >= 1 && n <= 6) return Math.round(n) as GradeLevel;
  return 1;
}

export function normalizeSemester(val: unknown): SemesterNumber {
  return Number(val) === 2 ? 2 : 1;
}

export function normalizeUnit(val: unknown): UnitNumber {
  const n = Number(val);
  if (n >= 1 && n <= 4) return Math.round(n) as UnitNumber;
  return 1;
}

function legacyDifficultyToGrade(diff: unknown): GradeLevel {
  if (diff === 'very_easy') return 1;
  if (diff === 'easy') return 2;
  if (diff === 'normal') return 4;
  if (diff === 'hard') return 6;
  return 1;
}

function normalizeLoadedItem(
  it: Partial<GameItem> & { difficulty?: string },
  idx: number
): GameItem {
  const text = (it.text || '').trim();
  const mode = it.mode === 'spelling' ? 'spelling' : 'sentence';
  const grade = it.grade !== undefined ? normalizeGrade(it.grade) : legacyDifficultyToGrade(it.difficulty);
  const semester = normalizeSemester(it.semester);
  const unit = normalizeUnit(it.unit);
  return {
    id: it.id || `item-${idx}`,
    text,
    mode,
    grade,
    semester,
    unit,
    category: it.category || autoCategorize(text),
    imageUrl: it.imageUrl || findMatchingIllustration(text).imageUrl,
    imageName: it.imageName,
    hint: it.hint,
    isCustom: it.isCustom,
  };
}

export function loadItems(): GameItem[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_SENTENCE_ITEMS, ...DEFAULT_SPELLING_ITEMS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      let migratedCustom: GameItem[] = [];
      for (const legacyKey of LEGACY_KEYS_ITEMS) {
        try {
          const legacyRaw = localStorage.getItem(legacyKey);
          if (legacyRaw) {
            const legacyParsed = JSON.parse(legacyRaw);
            if (Array.isArray(legacyParsed)) {
              migratedCustom = legacyParsed
                .filter((it: Partial<GameItem>) => Boolean(it && it.isCustom && it.text))
                .map((it: Partial<GameItem>, idx: number) => normalizeLoadedItem(it, idx));
              if (migratedCustom.length > 0) break;
            }
          }
        } catch {
          // Ignore legacy migration error
        }
      }
      const initial = [...migratedCustom, ...DEFAULT_SENTENCE_ITEMS, ...DEFAULT_SPELLING_ITEMS];
      saveItems(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((it: Partial<GameItem>, idx: number) => normalizeLoadedItem(it, idx));
    }
  } catch (err) {
    console.warn('Failed to load items:', err);
  }
  return [...DEFAULT_SENTENCE_ITEMS, ...DEFAULT_SPELLING_ITEMS];
}

export function saveItems(items: GameItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items:', err);
  }
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      playerMode: normalizePlayerMode(parsed.playerMode),
      interactionMode: normalizeInteractionMode(parsed.interactionMode),
      twoPlayerConfig: {
        vocabMode: normalizeVocabMode(parsed.twoPlayerConfig?.vocabMode),
        targetScore: normalizeTargetScore(parsed.twoPlayerConfig?.targetScore),
      },
      sentenceConfig: {
        ...DEFAULT_SENTENCE_CONFIG,
        ...(parsed.sentenceConfig || {}),
        grade: normalizeGrade(parsed.sentenceConfig?.grade),
        semester: normalizeSemester(parsed.sentenceConfig?.semester),
        unit: normalizeUnit(parsed.sentenceConfig?.unit),
        targetWordCount: Math.max(3, Number(parsed.sentenceConfig?.targetWordCount) || 3),
      },
      wordsConfig: {
        ...DEFAULT_WORDS_CONFIG,
        ...(parsed.wordsConfig || {}),
        grade: normalizeGrade(parsed.wordsConfig?.grade),
        semester: normalizeSemester(parsed.wordsConfig?.semester),
        unit: normalizeUnit(parsed.wordsConfig?.unit),
        targetWordCount: Math.max(3, Number(parsed.wordsConfig?.targetWordCount) || 3),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized: GameSettings = {
      ...settings,
      playerMode: normalizePlayerMode(settings.playerMode),
      interactionMode: normalizeInteractionMode(settings.interactionMode),
      twoPlayerConfig: {
        vocabMode: normalizeVocabMode(settings.twoPlayerConfig?.vocabMode),
        targetScore: normalizeTargetScore(settings.twoPlayerConfig?.targetScore),
      },
      sentenceConfig: {
        ...settings.sentenceConfig,
        grade: normalizeGrade(settings.sentenceConfig.grade),
        semester: normalizeSemester(settings.sentenceConfig.semester),
        unit: normalizeUnit(settings.sentenceConfig.unit),
        targetWordCount: Math.max(3, settings.sentenceConfig.targetWordCount || 3),
      },
      wordsConfig: {
        ...settings.wordsConfig,
        grade: normalizeGrade(settings.wordsConfig.grade),
        semester: normalizeSemester(settings.wordsConfig.semester),
        unit: normalizeUnit(settings.wordsConfig.unit),
        targetWordCount: Math.max(3, settings.wordsConfig.targetWordCount || 3),
      },
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportFullBackupToJson(
  items: GameItem[],
  settings: GameSettings
): string {
  const payload = {
    version: '4.0',
    exportDate: new Date().toISOString(),
    appName: 'Word Fun!: Kiddy Vocabulary Connect',
    itemCount: items.length,
    items,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJsonFile(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateFullImport(jsonString: string): {
  success: boolean;
  items?: GameItem[];
  settings?: GameSettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    let candidateItems: unknown[] = [];

    if (Array.isArray(parsed)) {
      candidateItems = parsed;
    } else if (parsed && Array.isArray(parsed.items)) {
      candidateItems = parsed.items;
    } else {
      return { success: false, error: 'Invalid backup format. Expected an array or { items: [...] }.' };
    }

    const validItems: GameItem[] = candidateItems
      .filter(
        (raw): raw is Partial<GameItem> =>
          Boolean(raw && typeof raw === 'object' && typeof (raw as GameItem).text === 'string')
      )
      .map((raw, idx) => normalizeLoadedItem(raw, idx))
      .filter(item => item.text.length >= 2);

    if (validItems.length === 0) {
      return { success: false, error: 'No valid words or sentences were found in the file.' };
    }

    let importedSettings: GameSettings | undefined;
    if (parsed && !Array.isArray(parsed) && parsed.settings && typeof parsed.settings === 'object') {
      const s = parsed.settings;
      importedSettings = {
        ...DEFAULT_SETTINGS,
        ...s,
        playerMode: normalizePlayerMode(s.playerMode),
        interactionMode: normalizeInteractionMode(s.interactionMode),
        twoPlayerConfig: {
          vocabMode: normalizeVocabMode(s.twoPlayerConfig?.vocabMode),
          targetScore: normalizeTargetScore(s.twoPlayerConfig?.targetScore),
        },
        sentenceConfig: {
          ...DEFAULT_SENTENCE_CONFIG,
          ...(s.sentenceConfig || {}),
          grade: normalizeGrade(s.sentenceConfig?.grade),
          semester: normalizeSemester(s.sentenceConfig?.semester),
          unit: normalizeUnit(s.sentenceConfig?.unit),
          targetWordCount: Math.max(3, Number(s.sentenceConfig?.targetWordCount) || 3),
        },
        wordsConfig: {
          ...DEFAULT_WORDS_CONFIG,
          ...(s.wordsConfig || {}),
          grade: normalizeGrade(s.wordsConfig?.grade),
          semester: normalizeSemester(s.wordsConfig?.semester),
          unit: normalizeUnit(s.wordsConfig?.unit),
          targetWordCount: Math.max(3, Number(s.wordsConfig?.targetWordCount) || 3),
        },
      };
    }

    return {
      success: true,
      items: validItems,
      settings: importedSettings,
    };
  } catch {
    return { success: false, error: 'Could not read JSON. Please check file formatting.' };
  }
}
