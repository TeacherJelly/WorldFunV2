import {
  GameItem,
  GameSettings,
  GitHubSyncConfig,
  GradeLevel,
  InteractionMode,
  ModeConfig,
  PlayerMode,
  SemesterNumber,
  TwoPlayerConfig,
  TwoPlayerVocabMode,
  UnitNumber,
  VocabFolder,
} from '../types';
import {
  DEFAULT_FOLDER_ID,
  DEFAULT_FOLDERS,
  DEFAULT_SENTENCE_ITEMS,
  DEFAULT_SPELLING_ITEMS,
  categoryToStarterFolderId,
} from './defaultData';
import {
  ILLUSTRATION_LIBRARY,
  autoCategorize,
  findMatchingIllustration,
} from './illustrations';

const STORAGE_KEY_ITEMS = 'wordfun_items_v4';
const STORAGE_KEY_FOLDERS = 'wordfun_folders_v1';
const STORAGE_KEY_SETTINGS = 'wordfun_settings_v4';
const STORAGE_KEY_UPDATED_AT = 'wordfun_updated_at_v1';
const STORAGE_KEY_CONTENT_UPDATED_AT = 'wordfun_content_updated_at_v1';
const STORAGE_KEY_LAST_GITHUB_SAVED_AT = 'wordfun_gh_saved_at_v1';
const STORAGE_KEY_NOTEPAD_DB = 'wordfun_notepad_db_v1';

const LEGACY_KEYS_ITEMS = ['wordfun_items_v3', 'worddot_items_v2'];
export const MIGRATED_CUSTOM_FOLDER_ID = 'folder-custom-migrated';

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

export const DEFAULT_GITHUB_SYNC: GitHubSyncConfig = {
  repo: '',
  branch: 'main',
  filePath: 'wordfun-database.txt',
  autoLoadOnStart: true,
  autoSaveOnline: true,
};

export const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'sentence',
  playerMode: 'single',
  interactionMode: 'move_tap',
  selectedFolderId: DEFAULT_FOLDER_ID,
  showNumberHints: false,
  twoPlayerConfig: { ...DEFAULT_TWO_PLAYER_CONFIG },
  sentenceConfig: { ...DEFAULT_SENTENCE_CONFIG },
  wordsConfig: { ...DEFAULT_WORDS_CONFIG },
  ...DEFAULT_AUDIO_SETTINGS,
  githubSync: { ...DEFAULT_GITHUB_SYNC },
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

export function normalizeGitHubRepoInput(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let s = raw.trim();
  if (!s) return '';
  const urlMatch = s.match(/^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i);
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2]}`;
  }
  s = s.replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  const slugMatch = s.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  return slugMatch ? `${slugMatch[1]}/${slugMatch[2]}` : s;
}

export function normalizeGitHubSyncConfig(raw: unknown): GitHubSyncConfig {
  const r = raw && typeof raw === 'object' ? (raw as Partial<GitHubSyncConfig>) : {};
  const repo = normalizeGitHubRepoInput(r.repo);
  const branch =
    typeof r.branch === 'string' && r.branch.trim()
      ? r.branch.trim()
      : DEFAULT_GITHUB_SYNC.branch;
  const rawPath =
    typeof r.filePath === 'string' && r.filePath.trim()
      ? r.filePath.trim().replace(/^\/+/, '')
      : DEFAULT_GITHUB_SYNC.filePath;
  const basePath = rawPath.replace(/\.(txt|json)$/i, '') || 'wordfun-database';
  const filePath = `${basePath}.txt`;
  return {
    repo,
    branch,
    filePath,
    autoLoadOnStart: typeof r.autoLoadOnStart === 'boolean' ? r.autoLoadOnStart : true,
    autoSaveOnline: typeof r.autoSaveOnline === 'boolean' ? r.autoSaveOnline : true,
  };
}

export function normalizeMusicTrackId(val: unknown): number {
  const n = Math.round(Number(val));
  if (!Number.isFinite(n) || n < 1) return 1;
  return ((n - 1) % 3) + 1;
}

function normalizeLoadedSettings(raw: unknown): GameSettings {
  const s = raw && typeof raw === 'object' ? (raw as Partial<GameSettings>) : {};
  const resolvedShowHints =
    typeof s.showNumberHints === 'boolean'
      ? s.showNumberHints
      : Boolean(s.sentenceConfig?.showNumberHints || s.wordsConfig?.showNumberHints);

  return {
    ...DEFAULT_SETTINGS,
    ...s,
    gameMode: s.gameMode === 'spelling' ? 'spelling' : 'sentence',
    playerMode: normalizePlayerMode(s.playerMode),
    interactionMode: normalizeInteractionMode(s.interactionMode),
    selectedFolderId:
      typeof s.selectedFolderId === 'string' && s.selectedFolderId.trim()
        ? s.selectedFolderId.trim()
        : DEFAULT_FOLDER_ID,
    showNumberHints: resolvedShowHints,
    musicTrackId: normalizeMusicTrackId(s.musicTrackId),
    twoPlayerConfig: {
      vocabMode: normalizeVocabMode(s.twoPlayerConfig?.vocabMode),
      targetScore: normalizeTargetScore(s.twoPlayerConfig?.targetScore),
    },
    sentenceConfig: {
      ...DEFAULT_SENTENCE_CONFIG,
      ...(s.sentenceConfig || {}),
      showNumberHints: resolvedShowHints,
    },
    wordsConfig: {
      ...DEFAULT_WORDS_CONFIG,
      ...(s.wordsConfig || {}),
      showNumberHints: resolvedShowHints,
    },
    githubSync: normalizeGitHubSyncConfig(s.githubSync),
  };
}

function normalizeLoadedFolder(raw: Partial<VocabFolder>, idx: number): VocabFolder {
  const nowIso = new Date().toISOString();
  const created =
    typeof raw.createdAt === 'string' && !Number.isNaN(Date.parse(raw.createdAt))
      ? raw.createdAt
      : nowIso;
  const updated =
    typeof raw.updatedAt === 'string' && !Number.isNaN(Date.parse(raw.updatedAt))
      ? raw.updatedAt
      : created;
  return {
    id: (raw.id && raw.id.trim()) || `folder-${idx}-${Date.now()}`,
    name: (raw.name && raw.name.trim()) || `Untitled Folder ${idx + 1}`,
    description: typeof raw.description === 'string' ? raw.description.trim() : '',
    createdAt: created,
    updatedAt: updated,
    isStarter: Boolean(raw.isStarter),
  };
}

function normalizeLoadedItem(
  it: Partial<GameItem> & { difficulty?: string; imagePreset?: string },
  idx: number
): GameItem {
  const text = (it.text || '').trim();
  const mode = it.mode === 'spelling' ? 'spelling' : 'sentence';
  const resolvedCategory = it.category || autoCategorize(text);
  let resolvedImageUrl = it.imageUrl;
  if (!resolvedImageUrl && it.imagePreset) {
    const preset = ILLUSTRATION_LIBRARY.find(
      p => p.id.toLowerCase() === String(it.imagePreset).trim().toLowerCase()
    );
    if (preset) {
      resolvedImageUrl = preset.imageUrl;
    }
  }
  const resolvedFolderId =
    typeof it.folderId === 'string' && it.folderId.trim()
      ? it.folderId.trim()
      : it.isCustom
      ? MIGRATED_CUSTOM_FOLDER_ID
      : categoryToStarterFolderId(resolvedCategory);

  return {
    id: it.id || `item-${idx}`,
    folderId: resolvedFolderId,
    text,
    mode,
    grade: it.grade !== undefined ? normalizeGrade(it.grade) : undefined,
    semester: it.semester !== undefined ? normalizeSemester(it.semester) : undefined,
    unit: it.unit !== undefined ? normalizeUnit(it.unit) : undefined,
    category: resolvedCategory,
    imageUrl: resolvedImageUrl || findMatchingIllustration(text).imageUrl,
    imageName: it.imageName,
    hint: it.hint,
    isCustom: it.isCustom,
  };
}

export function ensureFoldersForItems(
  baseFolders: VocabFolder[],
  items: GameItem[]
): VocabFolder[] {
  const map = new Map<string, VocabFolder>();
  for (const f of baseFolders) {
    map.set(f.id, f);
  }
  for (const item of items) {
    if (!map.has(item.folderId)) {
      const now = new Date().toISOString();
      if (item.folderId === MIGRATED_CUSTOM_FOLDER_ID) {
        map.set(item.folderId, {
          id: MIGRATED_CUSTOM_FOLDER_ID,
          name: 'My Custom Words',
          description: 'Custom words and sentences saved from earlier sessions.',
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const starterMatch = DEFAULT_FOLDERS.find(df => df.id === item.folderId);
        if (starterMatch) {
          map.set(starterMatch.id, starterMatch);
        } else {
          map.set(item.folderId, {
            id: item.folderId,
            name: item.category || 'Custom Folder',
            description: '',
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  }
  return Array.from(map.values());
}

export function getLastLocalUpdatedAt(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_UPDATED_AT);
  } catch {
    return null;
  }
}

export function setLastLocalUpdatedAt(isoTimestamp?: string): string {
  const iso = isoTimestamp || new Date().toISOString();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, iso);
    } catch {
      // Ignore storage errors
    }
  }
  return iso;
}

export function getLastContentUpdatedAt(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_CONTENT_UPDATED_AT);
  } catch {
    return null;
  }
}

export function setLastContentUpdatedAt(isoTimestamp?: string): string {
  const iso = isoTimestamp || new Date().toISOString();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT_UPDATED_AT, iso);
    } catch {
      // Ignore storage errors
    }
  }
  return iso;
}

export function getLastGitHubSavedAt(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_GITHUB_SAVED_AT);
  } catch {
    return null;
  }
}

export function setLastGitHubSavedAt(isoTimestamp?: string): string {
  const iso = isoTimestamp || new Date().toISOString();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_GITHUB_SAVED_AT, iso);
    } catch {
      // Ignore storage errors
    }
  }
  return iso;
}

export function hasLocalUserChanges(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY_CONTENT_UPDATED_AT));
  } catch {
    return false;
  }
}

export function saveNotepadCache(notepadText: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTEPAD_DB, notepadText);
  } catch {
    // Ignore quota errors if very large custom images exist
  }
}

export function loadFolders(itemsForMigration?: GameItem[]): VocabFolder[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FOLDERS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (!raw) {
      const seed = itemsForMigration
        ? ensureFoldersForItems(DEFAULT_FOLDERS, itemsForMigration)
        : DEFAULT_FOLDERS;
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = parsed.map((f: Partial<VocabFolder>, idx: number) =>
        normalizeLoadedFolder(f, idx)
      );
      return itemsForMigration ? ensureFoldersForItems(normalized, itemsForMigration) : normalized;
    }
  } catch (err) {
    console.warn('Failed to load folders:', err);
  }
  return DEFAULT_FOLDERS;
}

export function saveFolders(folders: VocabFolder[], updatedAtIso?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    if (updatedAtIso !== undefined) {
      setLastLocalUpdatedAt(updatedAtIso);
      setLastContentUpdatedAt(updatedAtIso);
    }
  } catch (err) {
    console.error('Failed to save folders:', err);
  }
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
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(initial));
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

export function saveItems(items: GameItem[], updatedAtIso?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    setLastLocalUpdatedAt(updatedAtIso);
    setLastContentUpdatedAt(updatedAtIso);
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
    return normalizeLoadedSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings, updatedAtIso?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = normalizeLoadedSettings(settings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(sanitized));
    if (updatedAtIso !== undefined) {
      setLastLocalUpdatedAt(updatedAtIso);
    }
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

let cachedImageUrlToPresetId: Map<string, string> | null = null;
function getImageUrlToPresetIdMap(): Map<string, string> {
  if (!cachedImageUrlToPresetId) {
    cachedImageUrlToPresetId = new Map<string, string>();
    for (const preset of ILLUSTRATION_LIBRARY) {
      if (!cachedImageUrlToPresetId.has(preset.imageUrl)) {
        cachedImageUrlToPresetId.set(preset.imageUrl, preset.id);
      }
    }
  }
  return cachedImageUrlToPresetId;
}

function sanitizeLineValue(val: string): string {
  return val.replace(/[\r\n]+/g, ' ').trim();
}

export function exportDatabaseToNotepadTxt(
  items: GameItem[],
  settings: GameSettings,
  savedAtIso?: string,
  folders?: VocabFolder[]
): string {
  const savedAt = savedAtIso || new Date().toISOString();
  const normalizedSettings = normalizeLoadedSettings(settings);
  const effectiveFolders = ensureFoldersForItems(folders || DEFAULT_FOLDERS, items);
  const presetMap = getImageUrlToPresetIdMap();
  const lines: string[] = [
    '# ====================================================================',
    '# Word Fun! - Notepad Database (.txt)',
    '# Save this file offline or upload/sync it in your GitHub repository.',
    '# You can open and edit folders, words, or sentences directly in Notepad.',
    '# ====================================================================',
    '@VERSION: 5.0',
    '@APP: Word Fun!: Kiddy Vocabulary Connect',
    `@SAVED_AT: ${savedAt}`,
    `@FOLDER_COUNT: ${effectiveFolders.length}`,
    `@ITEM_COUNT: ${items.length}`,
    '',
    '[SETTINGS]',
    `gameMode = ${normalizedSettings.gameMode}`,
    `playerMode = ${normalizedSettings.playerMode}`,
    `interactionMode = ${normalizedSettings.interactionMode}`,
    `selectedFolderId = ${sanitizeLineValue(normalizedSettings.selectedFolderId)}`,
    `showNumberHints = ${normalizedSettings.showNumberHints}`,
    `musicEnabled = ${normalizedSettings.musicEnabled}`,
    `musicTrackId = ${normalizedSettings.musicTrackId}`,
    `musicVolume = ${normalizedSettings.musicVolume}`,
    `sfxEnabled = ${normalizedSettings.sfxEnabled}`,
    `sfxVolume = ${normalizedSettings.sfxVolume}`,
    `voiceEnabled = ${normalizedSettings.voiceEnabled}`,
    `voiceName = ${sanitizeLineValue(normalizedSettings.voiceName)}`,
    `voicePitch = ${normalizedSettings.voicePitch}`,
    `voiceRate = ${normalizedSettings.voiceRate}`,
    `twoPlayerConfig = ${JSON.stringify(normalizedSettings.twoPlayerConfig)}`,
    `githubSync = ${JSON.stringify(normalizedSettings.githubSync)}`,
    '',
    '[FOLDERS]',
    '# Each [FOLDER] block stores a vocabulary folder.',
    '',
  ];

  for (const folder of effectiveFolders) {
    lines.push('[FOLDER]');
    lines.push(`id = ${sanitizeLineValue(folder.id)}`);
    lines.push(`name = ${sanitizeLineValue(folder.name)}`);
    if (folder.description) {
      lines.push(`description = ${sanitizeLineValue(folder.description)}`);
    }
    lines.push(`createdAt = ${sanitizeLineValue(folder.createdAt)}`);
    lines.push(`updatedAt = ${sanitizeLineValue(folder.updatedAt)}`);
    if (folder.isStarter) {
      lines.push('isStarter = true');
    }
    lines.push('');
  }

  lines.push('[VOCABULARY]');
  lines.push('# Each [ITEM] block represents one sentence or spelling word.');
  lines.push('');

  for (const item of items) {
    lines.push('[ITEM]');
    lines.push(`id = ${sanitizeLineValue(item.id)}`);
    lines.push(`folderId = ${sanitizeLineValue(item.folderId)}`);
    lines.push(`mode = ${item.mode}`);
    lines.push(`category = ${sanitizeLineValue(item.category || 'General')}`);
    lines.push(`text = ${sanitizeLineValue(item.text)}`);
    if (item.hint && item.hint.trim()) {
      lines.push(`hint = ${sanitizeLineValue(item.hint)}`);
    }
    if (item.isCustom) {
      lines.push('isCustom = true');
    }
    if (item.imageName && item.imageName.trim()) {
      lines.push(`imageName = ${sanitizeLineValue(item.imageName)}`);
    }
    if (item.imageUrl) {
      const presetId = presetMap.get(item.imageUrl);
      if (presetId) {
        lines.push(`imagePreset = ${presetId}`);
      } else {
        lines.push(`imageUrl = ${sanitizeLineValue(item.imageUrl)}`);
      }
    }
    lines.push('');
  }

  return lines.join('\r\n');
}

export function downloadTextFile(filename: string, textContent: string): void {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ParsedDatabaseResult {
  success: boolean;
  folders?: VocabFolder[];
  items?: GameItem[];
  settings?: GameSettings;
  savedAt?: string;
  format?: 'notepad' | 'json';
  error?: string;
}

function parseBool(val: string, fallback: boolean): boolean {
  const v = val.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function parseNotepadTxtDatabase(rawText: string): ParsedDatabaseResult {
  const clean = rawText.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/);

  let savedAt: string | undefined;
  let section: 'header' | 'settings' | 'folders' | 'vocabulary' = 'header';
  const settingsMap: Record<string, string> = {};
  const rawFolders: Array<Partial<VocabFolder>> = [];
  let currentFolder: Partial<VocabFolder> | null = null;
  const rawItems: Array<Partial<GameItem> & { imagePreset?: string }> = [];
  let currentItem: (Partial<GameItem> & { imagePreset?: string }) | null = null;

  const flushCurrentFolder = () => {
    if (currentFolder && currentFolder.name && currentFolder.name.trim()) {
      rawFolders.push(currentFolder);
    }
    currentFolder = null;
  };

  const flushCurrentItem = () => {
    if (currentItem && currentItem.text && currentItem.text.trim().length >= 2) {
      rawItems.push(currentItem);
    }
    currentItem = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      continue;
    }

    if (trimmed.startsWith('@SAVED_AT:')) {
      savedAt = trimmed.slice('@SAVED_AT:'.length).trim();
      continue;
    }
    if (trimmed.startsWith('@')) {
      continue;
    }

    const upper = trimmed.toUpperCase();
    if (upper === '[SETTINGS]') {
      flushCurrentFolder();
      flushCurrentItem();
      section = 'settings';
      continue;
    }
    if (upper === '[FOLDERS]') {
      flushCurrentFolder();
      flushCurrentItem();
      section = 'folders';
      continue;
    }
    if (upper === '[FOLDER]') {
      flushCurrentFolder();
      flushCurrentItem();
      section = 'folders';
      currentFolder = {};
      continue;
    }
    if (upper === '[VOCABULARY]' || upper === '[ITEMS]') {
      flushCurrentFolder();
      flushCurrentItem();
      section = 'vocabulary';
      continue;
    }
    if (upper === '[ITEM]') {
      flushCurrentFolder();
      flushCurrentItem();
      section = 'vocabulary';
      currentItem = {};
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    const colonIdx = trimmed.indexOf(':');
    const sepIdx =
      eqIdx !== -1 && (colonIdx === -1 || eqIdx <= colonIdx) ? eqIdx : colonIdx;

    if (sepIdx === -1) {
      continue;
    }

    const key = trimmed.slice(0, sepIdx).trim();
    const val = trimmed.slice(sepIdx + 1).trim();

    if (section === 'settings') {
      settingsMap[key] = val;
    } else if (section === 'folders') {
      if (!currentFolder) {
        currentFolder = {};
      }
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'id') currentFolder.id = val;
      else if (lowerKey === 'name') currentFolder.name = val;
      else if (lowerKey === 'description') currentFolder.description = val;
      else if (lowerKey === 'createdat') currentFolder.createdAt = val;
      else if (lowerKey === 'updatedat') currentFolder.updatedAt = val;
      else if (lowerKey === 'isstarter') currentFolder.isStarter = parseBool(val, false);
    } else if (section === 'vocabulary') {
      if (!currentItem) {
        currentItem = {};
      }
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'id') currentItem.id = val;
      else if (lowerKey === 'folderid') currentItem.folderId = val;
      else if (lowerKey === 'mode') {
        currentItem.mode = val.toLowerCase() === 'spelling' || val.toLowerCase() === 'word' ? 'spelling' : 'sentence';
      } else if (lowerKey === 'grade') currentItem.grade = normalizeGrade(val);
      else if (lowerKey === 'semester') currentItem.semester = normalizeSemester(val);
      else if (lowerKey === 'unit') currentItem.unit = normalizeUnit(val);
      else if (lowerKey === 'category') currentItem.category = val;
      else if (lowerKey === 'text') currentItem.text = val;
      else if (lowerKey === 'hint') currentItem.hint = val;
      else if (lowerKey === 'iscustom') currentItem.isCustom = parseBool(val, false);
      else if (lowerKey === 'imagename') currentItem.imageName = val;
      else if (lowerKey === 'imagepreset') currentItem.imagePreset = val;
      else if (lowerKey === 'imageurl') currentItem.imageUrl = val;
    }
  }
  flushCurrentFolder();
  flushCurrentItem();

  let parsedSettings: GameSettings | undefined;
  if (Object.keys(settingsMap).length > 0) {
    const draft: Record<string, unknown> = {};
    if (settingsMap.gameMode) draft.gameMode = settingsMap.gameMode;
    if (settingsMap.playerMode) draft.playerMode = settingsMap.playerMode;
    if (settingsMap.interactionMode) draft.interactionMode = settingsMap.interactionMode;
    if (settingsMap.selectedFolderId) draft.selectedFolderId = settingsMap.selectedFolderId;
    if (settingsMap.showNumberHints !== undefined)
      draft.showNumberHints = parseBool(settingsMap.showNumberHints, DEFAULT_SETTINGS.showNumberHints);
    if (settingsMap.musicEnabled !== undefined)
      draft.musicEnabled = parseBool(settingsMap.musicEnabled, DEFAULT_SETTINGS.musicEnabled);
    if (settingsMap.musicTrackId !== undefined)
      draft.musicTrackId = Number(settingsMap.musicTrackId) || DEFAULT_SETTINGS.musicTrackId;
    if (settingsMap.musicVolume !== undefined) {
      const n = Number(settingsMap.musicVolume);
      if (Number.isFinite(n)) draft.musicVolume = n;
    }
    if (settingsMap.sfxEnabled !== undefined)
      draft.sfxEnabled = parseBool(settingsMap.sfxEnabled, DEFAULT_SETTINGS.sfxEnabled);
    if (settingsMap.sfxVolume !== undefined) {
      const n = Number(settingsMap.sfxVolume);
      if (Number.isFinite(n)) draft.sfxVolume = n;
    }
    if (settingsMap.voiceEnabled !== undefined)
      draft.voiceEnabled = parseBool(settingsMap.voiceEnabled, DEFAULT_SETTINGS.voiceEnabled);
    if (settingsMap.voiceName !== undefined) draft.voiceName = settingsMap.voiceName;
    if (settingsMap.voicePitch !== undefined) {
      const n = Number(settingsMap.voicePitch);
      if (Number.isFinite(n)) draft.voicePitch = n;
    }
    if (settingsMap.voiceRate !== undefined) {
      const n = Number(settingsMap.voiceRate);
      if (Number.isFinite(n)) draft.voiceRate = n;
    }
    for (const jsonKey of ['twoPlayerConfig', 'sentenceConfig', 'wordsConfig', 'githubSync'] as const) {
      if (settingsMap[jsonKey]) {
        try {
          draft[jsonKey] = JSON.parse(settingsMap[jsonKey]);
        } catch {
          // Ignore malformed nested JSON line in hand-edited Notepad file
        }
      }
    }
    parsedSettings = normalizeLoadedSettings(draft);
  }

  const validItems = rawItems
    .map((raw, idx) => normalizeLoadedItem(raw, idx))
    .filter(item => item.text.length >= 2);

  const normalizedFolders =
    rawFolders.length > 0
      ? ensureFoldersForItems(
          rawFolders.map((f, idx) => normalizeLoadedFolder(f, idx)),
          validItems
        )
      : validItems.length > 0
      ? ensureFoldersForItems(DEFAULT_FOLDERS, validItems)
      : undefined;

  if (validItems.length === 0 && !parsedSettings && (!normalizedFolders || normalizedFolders.length === 0)) {
    return {
      success: false,
      error: 'Could not read Notepad (.txt) database. Make sure it contains [ITEM] blocks.',
    };
  }

  if (validItems.length === 0 && (!normalizedFolders || normalizedFolders.length === 0)) {
    return {
      success: false,
      error: 'No valid words or sentences were found in the Notepad (.txt) database file.',
    };
  }

  return {
    success: true,
    folders: normalizedFolders,
    items: validItems,
    settings: parsedSettings,
    savedAt,
    format: 'notepad',
  };
}

export function parseDatabaseImport(rawInput: string): ParsedDatabaseResult {
  const clean = rawInput.replace(/^\uFEFF/, '').trim();
  if (!clean) {
    return { success: false, error: 'The database file or text is empty.' };
  }

  return parseNotepadTxtDatabase(clean);
}

export function parseAndValidateFullImport(inputString: string): ParsedDatabaseResult {
  return parseDatabaseImport(inputString);
}
