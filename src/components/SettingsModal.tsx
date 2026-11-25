import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  Cloud,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Folder,
  FolderOpen,
  FolderPlus,
  Gamepad2,
  Grid,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  List,
  Mic,
  MicOff,
  Music,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  Wrench,
  X,
} from 'lucide-react';
import {
  GameItem,
  GameMode,
  GameSettings,
  SongSectionName,
  VocabFolder,
} from '../types';
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_GITHUB_SYNC,
  DEFAULT_SETTINGS,
  downloadTextFile,
  ensureFoldersForItems,
  exportDatabaseToNotepadTxt,
  normalizeGitHubRepoInput,
  parseDatabaseImport,
  saveNotepadCache,
} from '../utils/storage';
import {
  DEFAULT_FOLDER_ID,
  DEFAULT_FOLDERS,
  DEFAULT_SENTENCE_ITEMS,
  DEFAULT_SPELLING_ITEMS,
} from '../utils/defaultData';
import {
  ILLUSTRATION_CATEGORIES,
  ILLUSTRATION_LIBRARY,
  autoCategorize,
  autoGenerateHint,
  findMatchingIllustration,
  searchIllustrations,
} from '../utils/illustrations';
import {
  MUSIC_TRACKS,
  STUDIO_VOICES,
  formatDurationSeconds,
  sound,
} from '../utils/audio';
import {
  GitHubDiagnosticCheck,
  GitHubRequirementsReport,
  GitHubServerStatus,
  buildAutoConnectUrl,
  disconnectGitHubOAuth,
  evaluateGitHubRequirements,
  fetchGitHubOAuthUrl,
  normalizeTxtFilePath,
  publishAutoConnectConfigToRepo,
  runGitHubConnectionDiagnostics,
} from '../utils/githubSync';
import { FullscreenButton } from './FullscreenButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  folders: VocabFolder[];
  onUpdateFolders: (newFolders: VocabFolder[]) => void;
  items: GameItem[];
  onUpdateItems: (newItems: GameItem[]) => void;
  onSelectPlayItem: (item: GameItem) => void;
  githubStatus: GitHubServerStatus | null;
  isGitHubOnline: boolean;
  githubConnectionDetail: string;
  lastGitHubSyncError?: string | null;
  lastGitHubSyncedAt: string | null;
  autoSaveFixAttempted?: boolean;
  isSyncingOnline: boolean;
  onRefreshGitHubStatus: () => Promise<GitHubServerStatus | null>;
  onSaveOnlineToGitHub: () => Promise<{
    success: boolean;
    skipped?: boolean;
    message: string;
    commitUrl?: string | null;
  }>;
  onLoadOnlineFromGitHub: () => Promise<{
    success: boolean;
    applied?: boolean;
    message: string;
  }>;
  onFixAutoSaveConnection: () => Promise<{
    success: boolean;
    needsOAuth: boolean;
    message: string;
    requirements: GitHubRequirementsReport;
  }>;
}

type SettingsTab = 'config' | 'library' | 'backup';
type SortOption = 'latest' | 'oldest' | 'asc' | 'desc';
type LibraryViewMode = 'details' | 'tiles' | 'large_icons';

interface VocabEditorProps {
  folderId: string;
  folderName: string;
  items: GameItem[];
  editingItem: GameItem | null;
  onSaveItem: (draft: Omit<GameItem, 'id'>, editingId?: string) => void;
  onCancelEdit: () => void;
}

const VocabItemEditor: React.FC<VocabEditorProps> = ({
  folderId,
  folderName,
  editingItem,
  onSaveItem,
  onCancelEdit,
}) => {
  const [text, setText] = useState(editingItem?.text || '');
  const [category, setCategory] = useState(editingItem?.category || '');
  const [hint, setHint] = useState(editingItem?.hint || '');
  const [hintManuallyEdited, setHintManuallyEdited] = useState(Boolean(editingItem?.hint));
  const [categoryManuallyEdited, setCategoryManuallyEdited] = useState(Boolean(editingItem?.category));
  const [imageUrl, setImageUrl] = useState<string | null>(editingItem?.imageUrl || null);
  const [imageName, setImageName] = useState<string | null>(editingItem?.imageName || null);
  const [hasCustomImage, setHasCustomImage] = useState(Boolean(editingItem?.imageName || editingItem?.imageUrl));
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showIllusSearch, setShowIllusSearch] = useState(false);
  const [illusQuery, setIllusQuery] = useState('');
  const [illusCategory, setIllusCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const inferModeFromText = (raw: string): GameMode => {
    const words = raw.trim().split(/\s+/).filter(Boolean);
    return words.length >= 2 ? 'sentence' : 'spelling';
  };

  useEffect(() => {
    if (editingItem) {
      setText(editingItem.text);
      setCategory(editingItem.category || '');
      setHint(editingItem.hint || '');
      setHintManuallyEdited(Boolean(editingItem.hint));
      setCategoryManuallyEdited(Boolean(editingItem.category));
      setImageUrl(editingItem.imageUrl || null);
      setImageName(editingItem.imageName || null);
      setHasCustomImage(Boolean(editingItem.imageUrl));
      setError(null);
    } else {
      setText('');
      setCategory('');
      setHint('');
      setHintManuallyEdited(false);
      setCategoryManuallyEdited(false);
      setImageUrl(null);
      setImageName(null);
      setHasCustomImage(false);
      setError(null);
    }
  }, [editingItem]);

  const handleTextChange = (val: string) => {
    setText(val);
    setError(null);
    const trimmed = val.trim();
    if (!trimmed) {
      if (!categoryManuallyEdited) setCategory('');
      if (!hintManuallyEdited) setHint('');
      if (!hasCustomImage) {
        setImageUrl(null);
        setImageName(null);
      }
      return;
    }

    const inferredMode = inferModeFromText(trimmed);
    const nextCat = categoryManuallyEdited && category.trim() ? category : autoCategorize(trimmed);
    if (!categoryManuallyEdited) {
      setCategory(nextCat);
    }
    if (!hintManuallyEdited) {
      setHint(autoGenerateHint(trimmed, inferredMode, nextCat));
    }
    if (!hasCustomImage) {
      const matched = findMatchingIllustration(trimmed);
      setImageUrl(matched.imageUrl);
      setImageName(matched.preset ? `Auto-matched: ${matched.preset.label}` : 'Auto-generated letter badge');
    }
  };

  const handleAutoHint = () => {
    sound.playClick();
    if (!text.trim()) {
      setError('Type a word or sentence first so a hint can be generated.');
      return;
    }
    const nextHint = autoGenerateHint(text.trim(), inferModeFromText(text), category);
    setHint(nextHint);
    setHintManuallyEdited(false);
  };

  const handleAutoMatchPicture = () => {
    sound.playClick();
    const match = findMatchingIllustration(text.trim() || category.trim() || 'star');
    setImageUrl(match.imageUrl);
    setImageName(match.preset ? `Auto-matched: ${match.preset.label}` : 'Auto-generated illustration');
    setHasCustomImage(false);
    if (!category.trim()) {
      setCategory(match.category);
    }
  };

  const processImageFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !/\.(png|jpe?g)$/i.test(file.name)) {
      setError('Please choose a PNG, JPEG, or JPG image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be smaller than 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setImageUrl(ev.target?.result as string);
      setImageName(file.name);
      setHasCustomImage(true);
      setError(null);
    };
    reader.onerror = () => setError('Could not read image file.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) {
      setError('Please enter a word or sentence first.');
      return;
    }

    const words = cleanText.split(/\s+/).filter(Boolean);
    const inferredMode: GameMode = words.length >= 2 ? 'sentence' : 'spelling';
    if (words.length === 1) {
      const letters = cleanText.replace(/[^A-Za-z0-9]/g, '');
      if (letters.length < 2) {
        setError('Single words must contain at least 2 letters.');
        return;
      }
    }

    const matched = findMatchingIllustration(cleanText);
    const resolvedCategory = category.trim() || matched.category || autoCategorize(cleanText);
    const resolvedHint = hint.trim() || autoGenerateHint(cleanText, inferredMode, resolvedCategory);
    const resolvedImage = imageUrl || matched.imageUrl;

    onSaveItem(
      {
        folderId,
        text: cleanText,
        mode: inferredMode,
        category: resolvedCategory,
        hint: resolvedHint,
        imageUrl: resolvedImage,
        imageName: imageName || undefined,
        isCustom: true,
      },
      editingItem?.id
    );

    sound.playRewardChime();
    setSuccess(
      editingItem
        ? `Updated "${cleanText}"`
        : `Added "${cleanText}" to ${folderName || 'folder'}`
    );
    setTimeout(() => setSuccess(null), 2600);

    if (!editingItem) {
      setText('');
      setCategory('');
      setHint('');
      setHintManuallyEdited(false);
      setCategoryManuallyEdited(false);
      setImageUrl(null);
      setImageName(null);
      setHasCustomImage(false);
      setError(null);
    }
  };

  const trimmed = text.trim();
  const wordParts = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const isMultiWord = wordParts.length >= 2;
  const tokenCount = isMultiWord
    ? wordParts.length
    : trimmed.replace(/[^A-Za-z0-9]/g, '').length;

  const searchedIllustrations = useMemo(
    () => searchIllustrations(illusQuery, illusCategory),
    [illusQuery, illusCategory]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
          {editingItem ? <Edit2 className="w-4 h-4 text-sky-600" /> : <Plus className="w-4 h-4 text-sky-600" />}
          <span>{editingItem ? 'Edit Item' : 'Add Word or Sentence'}</span>
        </div>

        {editingItem && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Text Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Word or Sentence (2+ letters for a word, or 2+ words for a sentence)
          </label>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {tokenCount} {isMultiWord ? 'words' : 'letters'}
          </span>
        </div>
        <input
          type="text"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder="e.g. BUTTERFLY or Happy puppies chase yellow balls"
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Auto Categorization & Auto Creating Hint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Category (Auto-categorized)
            </label>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!text.trim()) return;
                setCategory(autoCategorize(text.trim()));
                setCategoryManuallyEdited(false);
              }}
              className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              Auto-Categorize
            </button>
          </div>
          <input
            type="text"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setCategoryManuallyEdited(true);
            }}
            placeholder="Auto-filled as you type..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Clue / Hint (Auto-created)
            </label>
            <button
              type="button"
              onClick={handleAutoHint}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Create Hint</span>
            </button>
          </div>
          <input
            type="text"
            value={hint}
            onChange={e => {
              setHint(e.target.value);
              setHintManuallyEdited(true);
            }}
            placeholder="Auto-generated clue for kids..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Picture Auto-Match, Library Search, Drag & Drop + Click to Browse */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>Illustration (Auto-Match, Library, Drag &amp; Drop, or Browse)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoMatchPicture}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Auto-Match</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowIllusSearch(prev => !prev);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 text-sky-600" />
              <span>{showIllusSearch ? 'Hide Pictures' : `Browse Library (${ILLUSTRATION_LIBRARY.length})`}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Word illustration" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[11px] font-medium text-slate-400 text-center">Preview</span>
            )}
          </div>

          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDraggingOver(false);
              if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 w-full rounded-xl border-2 border-dashed p-3.5 text-center cursor-pointer transition-colors ${
              isDraggingOver
                ? 'border-sky-500 bg-sky-50/70'
                : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={e => {
                if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                e.target.value = '';
              }}
            />
            <div className="text-xs font-semibold text-slate-700">
              {imageName || 'Drag & drop an image here, or click to browse your computer'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Supports PNG, JPG, JPEG up to 3 MB
            </div>
          </div>
        </div>

        {showIllusSearch && (
          <div className="pt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                value={illusQuery}
                onChange={e => setIllusQuery(e.target.value)}
                placeholder="Search built-in illustrations (e.g. puppy, apple, rocket)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums whitespace-nowrap">
                {searchedIllustrations.length} / {ILLUSTRATION_LIBRARY.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {ILLUSTRATION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIllusCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    illusCategory === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-52 overflow-y-auto p-1">
              {searchedIllustrations.length > 0 ? (
                searchedIllustrations.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setImageUrl(preset.imageUrl);
                      setImageName(preset.label);
                      setHasCustomImage(true);
                      if (!category.trim()) setCategory(preset.category);
                    }}
                    className={`p-1.5 rounded-lg border text-center transition-colors cursor-pointer bg-white hover:border-sky-400 ${
                      imageUrl === preset.imageUrl ? 'border-sky-600 ring-2 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.label}
                      className="w-10 h-10 mx-auto object-contain"
                    />
                    <div className="text-[10px] font-medium text-slate-700 truncate mt-1">
                      {preset.label}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-5 text-center text-xs text-slate-500">
                  No pictures matched "{illusQuery}".
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          {editingItem ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{editingItem ? 'Save Changes' : 'Add Item'}</span>
        </button>
      </div>
    </form>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  folders,
  onUpdateFolders,
  items,
  onUpdateItems,
  onSelectPlayItem,
  githubStatus,
  isGitHubOnline,
  githubConnectionDetail,
  lastGitHubSyncError,
  lastGitHubSyncedAt,
  autoSaveFixAttempted,
  isSyncingOnline,
  onRefreshGitHubStatus,
  onSaveOnlineToGitHub,
  onLoadOnlineFromGitHub,
  onFixAutoSaveConnection,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('config');

  // Folder Library Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<LibraryViewMode>('details');
  const [selectedLibraryFolderId, setSelectedLibraryFolderId] = useState<string>(
    settings.selectedFolderId || DEFAULT_FOLDER_ID
  );
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderDesc, setEditFolderDesc] = useState('');
  const [libraryEditingItem, setLibraryEditingItem] = useState<GameItem | null>(null);
  const [libraryNotice, setLibraryNotice] = useState<string | null>(null);
  const [folderPendingDelete, setFolderPendingDelete] = useState<VocabFolder | null>(null);

  // Import & Export State
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saveDataStatus, setSaveDataStatus] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedAutoLink, setCopiedAutoLink] = useState(false);
  const [copiedEnvTemplate, setCopiedEnvTemplate] = useState(false);
  const [copiedCallbackUrl, setCopiedCallbackUrl] = useState(false);
  const [showRequirementsPanel, setShowRequirementsPanel] = useState(false);
  const [showAdvancedGitHub, setShowAdvancedGitHub] = useState(false);
  const [isFixingAutoSave, setIsFixingAutoSave] = useState(false);
  const [diagnosticChecks, setDiagnosticChecks] = useState<GitHubDiagnosticCheck[] | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const txtFileInputRef = useRef<HTMLInputElement>(null);
  const autoFixTriggeredOnBackupRef = useRef(false);

  // Audio / Voice live state for Game Configuration tab
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>(() =>
    sound.getAvailableVoices()
  );
  const [musicProgress, setMusicProgress] = useState<{
    isPlaying: boolean;
    trackId: number;
    elapsedSec: number;
    durationSec: number;
    currentSection: SongSectionName | null;
  }>(() => sound.getMusicPlaybackInfo());

  useEffect(() => {
    if (!isOpen) return;
    setAvailableVoices(sound.getAvailableVoices());
    const unsub = sound.onVoicesChanged(() => {
      setAvailableVoices(sound.getAvailableVoices());
    });
    return unsub;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'config') return;
    setMusicProgress(sound.getMusicPlaybackInfo());
    if (!settings.musicEnabled) return;
    const timer = window.setInterval(() => {
      setMusicProgress(sound.getMusicPlaybackInfo());
    }, 400);
    return () => window.clearInterval(timer);
  }, [isOpen, activeTab, settings.musicEnabled, settings.musicTrackId]);

  useEffect(() => {
    if (isOpen) {
      if (folders.length > 0 && !folders.some(f => f.id === selectedLibraryFolderId)) {
        setSelectedLibraryFolderId(folders[0].id);
      }
    }
  }, [isOpen, folders, selectedLibraryFolderId]);

  const selectedLibraryFolder =
    folders.find(f => f.id === selectedLibraryFolderId) || folders[0] || null;

  useEffect(() => {
    if (!isOpen || !selectedLibraryFolder) return;
    setEditFolderName(selectedLibraryFolder.name);
    setEditFolderDesc(selectedLibraryFolder.description);
    setLibraryEditingItem(null);
  }, [isOpen, selectedLibraryFolder?.id]);

  const liveRequirementsReport = useMemo(
    () =>
      evaluateGitHubRequirements(
        settings.githubSync || DEFAULT_GITHUB_SYNC,
        githubStatus,
        typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastGitHubSyncError
      ),
    [settings.githubSync, githubStatus, lastGitHubSyncError]
  );

  // Auto-fix first when Import & Export is opened while auto-save is offline or failing
  useEffect(() => {
    if (!isOpen || activeTab !== 'backup') {
      autoFixTriggeredOnBackupRef.current = false;
      return;
    }
    if (autoFixTriggeredOnBackupRef.current) return;
    if (!isGitHubOnline || lastGitHubSyncError) {
      autoFixTriggeredOnBackupRef.current = true;
      void (async () => {
        const res = await onFixAutoSaveConnection();
        if (!res.success) {
          setShowRequirementsPanel(true);
        }
      })();
    }
  }, [isOpen, activeTab, isGitHubOnline, lastGitHubSyncError, onFixAutoSaveConnection]);

  const folderStats = useMemo(() => {
    const map = new Map<string, { total: number; previewUrl?: string }>();
    for (const f of folders) {
      map.set(f.id, { total: 0 });
    }
    for (const it of items) {
      const entry = map.get(it.folderId) || { total: 0 };
      entry.total += 1;
      if (!entry.previewUrl && it.imageUrl) {
        entry.previewUrl = it.imageUrl;
      }
      map.set(it.folderId, entry);
    }
    return map;
  }, [folders, items]);

  const sortedAndFilteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = folders.filter(f => {
      if (!q) return true;
      if (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        return true;
      }
      return items.some(
        it =>
          it.folderId === f.id &&
          (it.text.toLowerCase().includes(q) || it.category.toLowerCase().includes(q))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === 'latest') {
        return Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt);
      }
      if (sortOption === 'oldest') {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      }
      if (sortOption === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });
  }, [folders, items, searchQuery, sortOption]);

  if (!isOpen) return null;

  const switchTab = (tab: SettingsTab) => {
    sound.playClick();
    setActiveTab(tab);
    setLibraryNotice(null);
  };

  // Create a new folder directly in the Folder Library list
  const handleCreateNewFolder = () => {
    sound.playClick();
    const now = new Date().toISOString();
    const existingNames = new Set(folders.map(f => f.name.trim().toLowerCase()));
    let folderName = 'New Folder';
    if (existingNames.has(folderName.toLowerCase())) {
      let n = 2;
      while (existingNames.has(`new folder ${n}`)) {
        n += 1;
      }
      folderName = `New Folder ${n}`;
    }

    const newFolder: VocabFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: folderName,
      description: '',
      createdAt: now,
      updatedAt: now,
    };

    onUpdateFolders([newFolder, ...folders]);
    setSearchQuery('');
    setSelectedLibraryFolderId(newFolder.id);
    setEditFolderName(newFolder.name);
    setEditFolderDesc('');
    setLibraryEditingItem(null);
    setLibraryNotice(`Created "${newFolder.name}".`);
    setActiveTab('library');
  };

  const handleSelectLibraryFolder = (folder: VocabFolder) => {
    sound.playClick();
    setSelectedLibraryFolderId(folder.id);
    setEditFolderName(folder.name);
    setEditFolderDesc(folder.description);
    setLibraryEditingItem(null);
    setLibraryNotice(null);
  };

  const handleSaveEditedFolderMeta = (folderId: string) => {
    const cleanName = editFolderName.trim();
    if (!cleanName) {
      setLibraryNotice('Folder name cannot be empty.');
      return;
    }
    sound.playClick();
    const now = new Date().toISOString();
    onUpdateFolders(
      folders.map(f =>
        f.id === folderId
          ? { ...f, name: cleanName, description: editFolderDesc.trim(), updatedAt: now }
          : f
      )
    );
    setLibraryNotice(`Renamed folder to "${cleanName}".`);
  };

  const handleSaveLibraryItem = (draft: Omit<GameItem, 'id'>, editingId?: string) => {
    const now = new Date().toISOString();
    onUpdateFolders(
      folders.map(f => (f.id === draft.folderId ? { ...f, updatedAt: now } : f))
    );
    if (editingId) {
      onUpdateItems(
        items.map(it => (it.id === editingId ? { ...it, ...draft, id: editingId } : it))
      );
      setLibraryEditingItem(null);
    } else {
      const newItem: GameItem = {
        ...draft,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      onUpdateItems([newItem, ...items]);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    sound.playClick();
    onUpdateItems(items.filter(it => it.id !== itemId));
    if (libraryEditingItem?.id === itemId) setLibraryEditingItem(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folders.length <= 1) {
      setLibraryNotice('Keep at least 1 folder in your library.');
      setFolderPendingDelete(null);
      return;
    }
    sound.playClick();
    const deletedName = folders.find(f => f.id === folderId)?.name || 'Folder';
    const remainingFolders = folders.filter(f => f.id !== folderId);
    const remainingItems = items.filter(it => it.folderId !== folderId);
    onUpdateFolders(remainingFolders);
    onUpdateItems(remainingItems);

    if (settings.selectedFolderId === folderId && remainingFolders[0]) {
      onUpdateSettings({ ...settings, selectedFolderId: remainingFolders[0].id });
    }
    if (selectedLibraryFolderId === folderId && remainingFolders[0]) {
      setSelectedLibraryFolderId(remainingFolders[0].id);
      setEditFolderName(remainingFolders[0].name);
      setEditFolderDesc(remainingFolders[0].description);
    }
    setFolderPendingDelete(null);
    setLibraryNotice(`Deleted folder "${deletedName}".`);
  };

  const handleSaveOfflineOnly = () => {
    sound.playClick();
    const notepadTxt = exportDatabaseToNotepadTxt(items, settings, undefined, folders);
    saveNotepadCache(notepadTxt);

    const baseName =
      (settings.githubSync?.filePath || DEFAULT_GITHUB_SYNC.filePath)
        .split('/')
        .pop()
        ?.replace(/\.txt$/i, '') || 'wordfun-database';
    downloadTextFile(`${baseName}.txt`, notepadTxt);
    sound.playRewardChime();
    setSaveDataStatus({
      type: 'success',
      message: `Offline Save complete! Downloaded "${baseName}.txt" and updated local device storage.`,
    });
  };

  const handleSaveOnlineOnly = async () => {
    sound.playClick();
    const notepadTxt = exportDatabaseToNotepadTxt(items, settings, undefined, folders);
    saveNotepadCache(notepadTxt);

    const onlineRes = await onSaveOnlineToGitHub();
    if (onlineRes.success) {
      sound.playRewardChime();
      setSaveDataStatus({
        type: 'success',
        message: `Online Save complete! ${onlineRes.message}`,
      });
      return;
    }

    // Friendly static-host fallback: copy .txt cleanly so the user can commit in 1 click
    try {
      await navigator.clipboard.writeText(notepadTxt);
    } catch {
      // Ignore clipboard permission denial
    }

    setShowAdvancedGitHub(true);
    setShowRequirementsPanel(true);
    setSaveDataStatus({
      type: onlineRes.skipped ? 'info' : 'error',
      message: liveRequirementsReport.isStaticHost
        ? 'Static GitHub Pages cannot push commits without a Node backend. Your latest wordfun-database.txt has been copied — click "Download .txt & Open GitHub Editor" below, or use your hosted App URL for 1-click Online Save.'
        : onlineRes.message,
    });
  };

  const handleConnectGitHub = async () => {
    sound.playClick();
    try {
      const authUrl = await fetchGitHubOAuthUrl();
      const popup = window.open(authUrl, 'github_oauth_popup', 'width=600,height=720');
      if (!popup) {
        setSaveDataStatus({
          type: 'error',
          message: 'Please allow popups in your browser to connect your GitHub account.',
        });
      }
    } catch (err) {
      setSaveDataStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not open GitHub sign-in.',
      });
    }
  };

  const handleDisconnectGitHub = async () => {
    sound.playClick();
    await disconnectGitHubOAuth();
    await onRefreshGitHubStatus();
    setSaveDataStatus({
      type: 'info',
      message: 'Disconnected GitHub account session.',
    });
  };

  const handleFixAutoSaveButton = async () => {
    sound.playClick();
    setIsFixingAutoSave(true);
    try {
      const fixRes = await onFixAutoSaveConnection();
      const diag = await runGitHubConnectionDiagnostics(
        settings.githubSync || DEFAULT_GITHUB_SYNC,
        fixRes.success ? null : fixRes.message
      );
      setDiagnosticChecks(diag.checks);

      if (fixRes.success) {
        sound.playRewardChime();
        setShowRequirementsPanel(false);
        setSaveDataStatus({
          type: 'success',
          message: fixRes.message,
        });
      } else {
        setShowRequirementsPanel(true);
        setSaveDataStatus({
          type: 'error',
          message: fixRes.needsOAuth
            ? 'Auto-fix prepared your settings! Connect your GitHub Account or review the requirements below to finish enabling auto-save.'
            : fixRes.message,
        });
      }
    } finally {
      setIsFixingAutoSave(false);
    }
  };

  const handleImportDatabase = (replaceAll: boolean) => {
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste Notepad (.txt) database text, or browse a .txt file first.' });
      return;
    }
    const res = parseDatabaseImport(importText);
    if (!res.success) {
      setImportStatus({ type: 'error', message: res.error || 'Import failed.' });
      return;
    }

    if (replaceAll) {
      const nextItems = res.items || [];
      const nextFolders = ensureFoldersForItems(res.folders || DEFAULT_FOLDERS, nextItems);
      onUpdateFolders(nextFolders);
      onUpdateItems(nextItems);
    } else {
      const existingTexts = new Set(items.map(i => `${i.folderId}:${i.mode}:${i.text.toLowerCase()}`));
      const additions = (res.items || []).filter(
        i => !existingTexts.has(`${i.folderId}:${i.mode}:${i.text.toLowerCase()}`)
      );
      const mergedItems = [...additions, ...items];
      const folderMap = new Map(folders.map(f => [f.id, f]));
      for (const f of res.folders || []) {
        if (!folderMap.has(f.id)) folderMap.set(f.id, f);
      }
      onUpdateFolders(ensureFoldersForItems(Array.from(folderMap.values()), mergedItems));
      onUpdateItems(mergedItems);
    }

    if (res.settings) {
      onUpdateSettings(res.settings);
    }

    sound.playRewardChime();
    setImportStatus({
      type: 'success',
      message: `Loaded ${res.items?.length ?? 0} vocabulary items${res.folders ? ` across ${res.folders.length} folders` : ''}!`,
    });
    setImportText('');
  };

  const selectedLibraryItems = selectedLibraryFolder
    ? items.filter(it => it.folderId === selectedLibraryFolder.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 overflow-y-auto touch-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92dvh] flex flex-col overflow-hidden animate-pop-in my-auto shrink-0">
        {/* Clean Minimal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-xl text-slate-900 leading-tight truncate">
                Options
              </h2>
              <p className="text-xs text-slate-500 truncate">
                Configure sound, music, natural voice, organize folders, and manage backups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <FullscreenButton variant="panel" />
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              aria-label="Close options"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Clean Tabs */}
        <nav
          aria-label="Options Sections"
          className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-2.5 gap-1.5 overflow-x-auto shrink-0"
        >
          <button
            type="button"
            onClick={() => switchTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'config'
                ? 'bg-white text-sky-700 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game Configuration</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('library')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'library'
                ? 'bg-white text-sky-700 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Folder Library</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'backup'
                ? 'bg-white text-sky-700 border-t border-x border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Import &amp; Export</span>
          </button>
        </nav>

        {/* Spacious Body Area */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* ================= TAB 1: GAME CONFIGURATION (Sound FX, BG Music, Sound Events, Voice) ================= */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Sound FX & Winning Sound Event */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Sound FX */}
                <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        {settings.sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Sound FX</h3>
                        <p className="text-xs text-slate-500">Clicks, dot connects &amp; sound events</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        const next = !settings.sfxEnabled;
                        if (next) {
                          sound.sfxEnabled = true;
                          sound.playClick();
                        }
                        onUpdateSettings({ ...settings, sfxEnabled: next });
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                        settings.sfxEnabled
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {settings.sfxEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <label htmlFor="cfg-sfx-volume">Sound FX Volume</label>
                      <span className="tabular-nums text-slate-900">
                        {Math.round(settings.sfxVolume * 100)}%
                      </span>
                    </div>
                    <input
                      id="cfg-sfx-volume"
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(settings.sfxVolume * 100)}
                      disabled={!settings.sfxEnabled}
                      onChange={e => {
                        const vol = Number(e.target.value) / 100;
                        sound.sfxVolume = vol;
                        onUpdateSettings({ ...settings, sfxVolume: vol });
                      }}
                      className="w-full accent-emerald-600 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!settings.sfxEnabled}
                      onClick={() => {
                        sound.unlock();
                        sound.playClick();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Test Sound FX</span>
                    </button>
                  </div>
                </section>

                {/* Sound Events: Winning Fanfare (FFVIII Inspired MP3) & Short Item Win (2s MP3) */}
                <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Sound Events · Winning</h3>
                        <p className="text-xs text-slate-500">
                          Folder Clear FFVIII fanfare (0:07) &amp; Single Item short win (0:02)
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-800 text-[11px] font-bold whitespace-nowrap">
                      MP3 Events
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 leading-relaxed space-y-1">
                    <div>
                      <strong className="text-slate-800">Folder Clear / 2P Win:</strong> Plays the Final Fantasy VIII-inspired victory fanfare when all items in a folder are completed or a Tug of War match is won.
                    </div>
                    <div>
                      <strong className="text-slate-800">Single Item Win:</strong> Plays a crisp 2-second celebratory MP3 chime when finishing an individual item.
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {settings.sfxEnabled ? 'Controlled by Sound FX volume' : 'Turn Sound FX On to hear sound events'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.unlock();
                          if (!settings.sfxEnabled) {
                            sound.sfxEnabled = true;
                            onUpdateSettings({ ...settings, sfxEnabled: true });
                          }
                          sound.playShortWinSound();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Short Win (2s)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.unlock();
                          if (!settings.sfxEnabled) {
                            sound.sfxEnabled = true;
                            onUpdateSettings({ ...settings, sfxEnabled: true });
                          }
                          sound.playWinningFanfare();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>FFVIII Fanfare</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Background Music (BG Music) + 3-Track MP3 Playlist */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Background Music</h3>
                      <p className="text-xs text-slate-500">
                        3 full-length MP3 tracks (2+ minutes each) with Intro, Stanzas, Refrain, Chorus, Bridge &amp; Outro
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      sound.playClick();
                      onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      settings.musicEnabled
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {settings.musicEnabled ? 'On' : 'Off'}
                  </button>
                </div>

                {/* BG Music Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="cfg-bgm-volume">BG Music Volume</label>
                    <span className="tabular-nums text-slate-900">
                      {Math.round(settings.musicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    id="cfg-bgm-volume"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(settings.musicVolume * 100)}
                    disabled={!settings.musicEnabled}
                    onChange={e => {
                      const vol = Number(e.target.value) / 100;
                      onUpdateSettings({ ...settings, musicVolume: vol });
                    }}
                    className="w-full accent-violet-600 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* BG Music Playlist (3 MP3 Tracks) */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>BG Music Playlist (3 MP3 Tracks)</span>
                    {settings.musicEnabled && musicProgress.isPlaying && musicProgress.currentSection && (
                      <span className="text-violet-700 font-semibold tabular-nums">
                        Now Playing: {musicProgress.currentSection} · {formatDurationSeconds(musicProgress.elapsedSec)} / {formatDurationSeconds(musicProgress.durationSec)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MUSIC_TRACKS.map(track => {
                      const isSelected = settings.musicTrackId === track.id;
                      const isPlayingThis =
                        settings.musicEnabled && isSelected && musicProgress.isPlaying;
                      return (
                        <div
                          key={track.id}
                          onClick={() => {
                            sound.unlock();
                            sound.playClick();
                            onUpdateSettings({
                              ...settings,
                              musicTrackId: track.id,
                              musicEnabled: true,
                            });
                          }}
                          className={`rounded-2xl border p-4 transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'border-violet-500 bg-white ring-1 ring-violet-200 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-violet-300'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                                  Track {track.id} · MP3
                                </div>
                                <div className="font-bold text-sm text-slate-900 truncate">
                                  {track.name}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  sound.unlock();
                                  sound.playClick();
                                  if (isSelected && settings.musicEnabled) {
                                    onUpdateSettings({ ...settings, musicEnabled: false });
                                  } else {
                                    onUpdateSettings({
                                      ...settings,
                                      musicTrackId: track.id,
                                      musicEnabled: true,
                                    });
                                  }
                                }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                  isPlayingThis
                                    ? 'bg-violet-600 text-white'
                                    : isSelected
                                      ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                                      : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700'
                                }`}
                                aria-label={isPlayingThis ? `Pause ${track.name}` : `Play ${track.name}`}
                              >
                                {isPlayingThis ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                )}
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-snug">
                              {track.mood}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {track.sections.map((sec, idx) => {
                                const isActiveSec =
                                  isPlayingThis && musicProgress.currentSection === sec;
                                return (
                                  <span
                                    key={`${track.id}-${sec}-${idx}`}
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                                      isActiveSec
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {sec}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-100 tabular-nums">
                              <span>{track.tempo} BPM</span>
                              <span>Duration {formatDurationSeconds(track.durationSeconds)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Natural Speaking Voice (Cross-Device & Cross-Browser) */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                      {settings.voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Natural Speaking Voice</h3>
                      <p className="text-xs text-slate-500">
                        Compatible across PC, Android, iOS, and all browsers with automatic offline device fallback
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !settings.voiceEnabled;
                      sound.unlock(next);
                      sound.playClick();
                      onUpdateSettings({ ...settings, voiceEnabled: next });
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      settings.voiceEnabled
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {settings.voiceEnabled ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-1.5">
                    <label htmlFor="cfg-voice-select" className="block text-xs font-semibold text-slate-700">
                      Speaking Voice
                    </label>
                    <select
                      id="cfg-voice-select"
                      value={settings.voiceName}
                      disabled={!settings.voiceEnabled}
                      onChange={e => {
                        sound.resetNativeSpeechHealth();
                        onUpdateSettings({ ...settings, voiceName: e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 disabled:opacity-40 cursor-pointer"
                    >
                      <option value="auto">Auto — Natural Cross-Device Voice (Recommended)</option>
                      <optgroup label="Natural Studio Voices (All Devices & Browsers)">
                        {STUDIO_VOICES.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </optgroup>
                      {availableVoices.length > 0 && (
                        <optgroup label="Device / Browser Voices">
                          {availableVoices.map(v => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <label htmlFor="cfg-voice-rate">Speaking Speed</label>
                      <span className="tabular-nums text-slate-900">{settings.voiceRate.toFixed(2)}x</span>
                    </div>
                    <input
                      id="cfg-voice-rate"
                      type="range"
                      min={60}
                      max={120}
                      value={Math.round(settings.voiceRate * 100)}
                      disabled={!settings.voiceEnabled}
                      onChange={e =>
                        onUpdateSettings({ ...settings, voiceRate: Number(e.target.value) / 100 })
                      }
                      className="w-full accent-sky-600 cursor-pointer disabled:opacity-40 mt-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <label htmlFor="cfg-voice-pitch">Voice Pitch</label>
                      <span className="tabular-nums text-slate-900">{settings.voicePitch.toFixed(2)}</span>
                    </div>
                    <input
                      id="cfg-voice-pitch"
                      type="range"
                      min={70}
                      max={130}
                      value={Math.round(settings.voicePitch * 100)}
                      disabled={!settings.voiceEnabled}
                      onChange={e =>
                        onUpdateSettings({ ...settings, voicePitch: Number(e.target.value) / 100 })
                      }
                      className="w-full accent-sky-600 cursor-pointer disabled:opacity-40 mt-2"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">
                    Uses unlocked Web Audio playback for consistent clarity on Windows, macOS, Android &amp; iOS Safari.
                  </span>
                  <button
                    type="button"
                    disabled={!settings.voiceEnabled}
                    onClick={() => {
                      sound.unlock(true);
                      sound.speak("Great job! Let's play Word Fun together!");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Test Voice</span>
                  </button>
                </div>
              </section>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    sound.resetNativeSpeechHealth();
                    onUpdateSettings({
                      ...settings,
                      ...DEFAULT_AUDIO_SETTINGS,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Audio &amp; Voice Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: FOLDER LIBRARY (Create, Edit & Organize) ================= */}
          {activeTab === 'library' && (
            <div className="space-y-5">
              {/* Search, Sort & View Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search folders by name, description, or word..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Sort Control */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600">Sort:</span>
                    <select
                      aria-label="Sort folders"
                      value={sortOption}
                      onChange={e => {
                        sound.playClick();
                        setSortOption(e.target.value as SortOption);
                      }}
                      className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="latest">Date: Latest</option>
                      <option value="oldest">Date: Oldest</option>
                      <option value="asc">Name: Ascending (A–Z)</option>
                      <option value="desc">Name: Descending (Z–A)</option>
                    </select>
                  </div>

                  {/* View Switcher: Details, Tiles, Large Icons */}
                  <div
                    role="group"
                    aria-label="Folder view mode"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setViewMode('details');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        viewMode === 'details' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setViewMode('tiles');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        viewMode === 'tiles' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Tiles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setViewMode('large_icons');
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        viewMode === 'large_icons' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Large Icons</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Folders List + Selected Folder Details & Inline Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Folder Browser */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Folders ({sortedAndFilteredFolders.length})</span>
                    <button
                      type="button"
                      onClick={handleCreateNewFolder}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ New Folder</span>
                    </button>
                  </div>

                  {sortedAndFilteredFolders.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      No folders matched "{searchQuery}".
                    </div>
                  ) : viewMode === 'details' ? (
                    <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white">
                      {sortedAndFilteredFolders.map(folder => {
                        const stats = folderStats.get(folder.id) || { total: 0 };
                        const isSelected = selectedLibraryFolder?.id === folder.id;
                        return (
                          <div
                            key={folder.id}
                            onClick={() => handleSelectLibraryFolder(folder)}
                            className={`p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                              isSelected ? 'bg-sky-50/80' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Folder
                                className={`w-4 h-4 shrink-0 ${
                                  isSelected ? 'text-sky-600' : 'text-slate-400'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate">
                                  {folder.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate tabular-nums">
                                  {stats.total} {stats.total === 1 ? 'item' : 'items'} ·{' '}
                                  {new Date(folder.updatedAt || folder.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : viewMode === 'tiles' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                      {sortedAndFilteredFolders.map(folder => {
                        const stats = folderStats.get(folder.id) || { total: 0 };
                        const isSelected = selectedLibraryFolder?.id === folder.id;
                        return (
                          <div
                            key={folder.id}
                            onClick={() => handleSelectLibraryFolder(folder)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors space-y-2 ${
                              isSelected
                                ? 'border-sky-500 bg-sky-50/70'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                  <Folder className="w-4 h-4 text-sky-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-slate-900 truncate">
                                    {folder.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 tabular-nums">
                                    {stats.total} {stats.total === 1 ? 'item' : 'items'} · {new Date(folder.updatedAt || folder.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {folder.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{folder.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {sortedAndFilteredFolders.map(folder => {
                        const stats = folderStats.get(folder.id) || { total: 0, previewUrl: undefined };
                        const isSelected = selectedLibraryFolder?.id === folder.id;
                        return (
                          <div
                            key={folder.id}
                            onClick={() => handleSelectLibraryFolder(folder)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-colors flex flex-col items-center text-center gap-2 ${
                              isSelected
                                ? 'border-sky-500 bg-sky-50/70'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
                              {stats.previewUrl ? (
                                <img
                                  src={stats.previewUrl}
                                  alt={folder.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Folder className="w-9 h-9 text-sky-500" />
                              )}
                            </div>
                            <div className="w-full min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {folder.name}
                              </div>
                              <div className="text-[11px] text-slate-500 tabular-nums">
                                {stats.total} {stats.total === 1 ? 'item' : 'items'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Folder Details, Rename, Add/Edit Items & Contents */}
                <div className="lg:col-span-7">
                  {selectedLibraryFolder ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                      {/* Folder Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-sky-600 shrink-0" />
                            <h4 className="font-bold text-lg text-slate-900 truncate">
                              {selectedLibraryFolder.name}
                            </h4>
                          </div>
                          {selectedLibraryFolder.description && (
                            <p className="text-xs text-slate-600 mt-1">
                              {selectedLibraryFolder.description}
                            </p>
                          )}
                          <div className="text-[11px] text-slate-500 mt-1.5 tabular-nums">
                            Created {new Date(selectedLibraryFolder.createdAt).toLocaleDateString()} · Updated{' '}
                            {new Date(selectedLibraryFolder.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onUpdateSettings({ ...settings, selectedFolderId: selectedLibraryFolder.id });
                              setLibraryNotice(`"${selectedLibraryFolder.name}" selected for game!`);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap ${
                              settings.selectedFolderId === selectedLibraryFolder.id
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {settings.selectedFolderId === selectedLibraryFolder.id
                                ? 'Active in Game'
                                : 'Select for Game'}
                            </span>
                          </button>

                          {folders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setFolderPendingDelete(selectedLibraryFolder);
                              }}
                              className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                              title="Delete folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Folder Name & Description Inline Editor */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Folder Name
                          </label>
                          <input
                            type="text"
                            value={editFolderName}
                            onChange={e => setEditFolderName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editFolderDesc}
                            onChange={e => setEditFolderDesc(e.target.value)}
                            placeholder="Optional description..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {libraryNotice ? (
                          <span className="text-xs font-semibold text-emerald-700">{libraryNotice}</span>
                        ) : (
                          <span className="text-xs text-slate-400">Edit name or description above</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSaveEditedFolderMeta(selectedLibraryFolder.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Rename Folder</span>
                        </button>
                      </div>

                      {/* Add / Edit Word or Sentence inside this Folder */}
                      <VocabItemEditor
                        folderId={selectedLibraryFolder.id}
                        folderName={editFolderName || selectedLibraryFolder.name}
                        items={items}
                        editingItem={libraryEditingItem}
                        onSaveItem={handleSaveLibraryItem}
                        onCancelEdit={() => setLibraryEditingItem(null)}
                      />

                      {/* Items inside Folder */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          Items in Folder ({selectedLibraryItems.length})
                        </span>
                      </div>

                      {selectedLibraryItems.length === 0 ? (
                        <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                          No items in this folder yet. Use the form above and click <strong>Add Item</strong> to add words or sentences.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                          {selectedLibraryItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                            >
                              <div className="w-11 h-11 rounded-lg border border-slate-200 bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.text}
                                    className="w-full h-full object-contain"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate">
                                  {item.text}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {item.category}
                                  {item.hint ? ` · ${item.hint}` : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    onSelectPlayItem(item);
                                    onClose();
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-sky-600 cursor-pointer"
                                  title="Play this puzzle now"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    setLibraryEditingItem(item);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                                  title="Edit item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      Select a folder to view its details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: IMPORT & EXPORT ================= */}
          {activeTab === 'backup' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* 2D Cartoon-Style GitHub Indicator Light */}
              <section
                aria-label="GitHub Sync Status Indicator"
                className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isGitHubOnline
                    ? 'bg-emerald-50/75 border-emerald-200'
                    : 'bg-rose-50/75 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Custom 2D Cartoon Beacon Lamp SVG */}
                  <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
                    <svg
                      viewBox="0 0 80 80"
                      className="w-16 h-16 drop-shadow-sm"
                      aria-hidden="true"
                    >
                      {/* Cartoon Light Rays */}
                      {isGitHubOnline ? (
                        <g stroke="#22C55E" strokeWidth="3.2" strokeLinecap="round">
                          <line x1="40" y1="4" x2="40" y2="11" />
                          <line x1="15" y1="14" x2="20" y2="19" />
                          <line x1="65" y1="14" x2="60" y2="19" />
                          <line x1="7" y1="34" x2="14" y2="34" />
                          <line x1="73" y1="34" x2="66" y2="34" />
                        </g>
                      ) : (
                        <g stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" opacity="0.65">
                          <line x1="16" y1="15" x2="21" y2="20" />
                          <line x1="64" y1="15" x2="59" y2="20" />
                        </g>
                      )}

                      {/* Soft Outer Aura */}
                      <circle
                        cx="40"
                        cy="36"
                        r="22"
                        fill={isGitHubOnline ? '#86EFAC' : '#FCA5A5'}
                        opacity="0.35"
                      />

                      {/* Glass Dome */}
                      <path
                        d="M22 47 C22 25, 29 17, 40 17 C51 17, 58 25, 58 47 Z"
                        fill={isGitHubOnline ? '#22C55E' : '#EF4444'}
                        stroke="#1E293B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />

                      {/* Brighter Inner Cel-Shaded Core */}
                      <path
                        d="M27 45 C27 29, 32 22, 40 22 C47 22, 52 29, 52 45 Z"
                        fill={isGitHubOnline ? '#4ADE80' : '#F87171'}
                      />

                      {/* Cute Bulb Filament / Core Glow */}
                      <path
                        d="M35 45 L35 35 C35 32, 45 32, 45 35 L45 45"
                        fill="none"
                        stroke={isGitHubOnline ? '#ECFDF5' : '#FEF2F2'}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />

                      {/* Glossy Cartoon Highlight Arc */}
                      <path
                        d="M28 33 C29 26, 33 23, 37 22"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                      <circle cx="27.5" cy="39" r="1.6" fill="#FFFFFF" opacity="0.9" />

                      {/* Metallic Collar */}
                      <rect
                        x="18"
                        y="46"
                        width="44"
                        height="9"
                        rx="4"
                        fill="#CBD5E1"
                        stroke="#1E293B"
                        strokeWidth="3"
                      />
                      <rect x="23" y="48.5" width="16" height="2.5" rx="1.25" fill="#F8FAFC" />

                      {/* Pedestal Base */}
                      <path
                        d="M14 55 L66 55 L69 65 C69 67.5, 67 69, 64 69 L16 69 C13 69, 11 67.5, 11 65 Z"
                        fill="#475569"
                        stroke="#1E293B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      {/* Screw Rivets on Base */}
                      <circle cx="21" cy="62" r="2" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.5" />
                      <circle cx="59" cy="62" r="2" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.5" />
                      <rect x="30" y="60.5" width="20" height="3" rx="1.5" fill="#334155" />
                    </svg>
                  </div>

                  {/* Status Title & Exact Reason */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-wide uppercase border ${
                          isGitHubOnline
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-rose-600 text-white border-rose-700'
                        }`}
                      >
                        {isGitHubOnline ? 'ONLINE IN GITHUB' : 'OFFLINE'}
                      </span>
                      {isSyncingOnline && (
                        <span className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Syncing...</span>
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug ${
                        isGitHubOnline ? 'text-emerald-950' : 'text-rose-950'
                      }`}
                    >
                      {githubConnectionDetail}
                    </p>
                    {lastGitHubSyncedAt && (
                      <p className="text-[11px] font-medium text-slate-500">
                        Last synced: {new Date(lastGitHubSyncedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                  {(!isGitHubOnline || Boolean(lastGitHubSyncError) || !settings.githubSync?.autoSaveOnline) && (
                    <button
                      type="button"
                      disabled={isFixingAutoSave || isSyncingOnline}
                      onClick={handleFixAutoSaveButton}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-xs shadow-sm cursor-pointer"
                      title="Attempt to repair GitHub auto-save and show missing connection requirements"
                    >
                      <Wrench className={`w-3.5 h-3.5 ${isFixingAutoSave ? 'animate-spin' : ''}`} />
                      <span>{isFixingAutoSave ? 'Fixing Auto-Save...' : 'Fix Auto-Save'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onRefreshGitHubStatus();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                    title="Check GitHub connection status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOnline ? 'animate-spin' : ''}`} />
                    <span>Check Status</span>
                  </button>
                </div>
              </section>

              {/* Two Simple Save Options: Offline Save & Online Save */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Offline Save */}
                <section className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <Download className="w-4 h-4 text-sky-600" />
                        <span>Offline Save (.txt)</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                        {folders.length} folders · {items.length} items
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Save all your folders, words, sentences, and settings directly to this device as a Notepad (<span className="font-mono">.txt</span>) file. Works anytime without internet.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveOfflineOnly}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Offline Save (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          exportDatabaseToNotepadTxt(items, settings, undefined, folders)
                        );
                        setCopiedExport(true);
                        setTimeout(() => setCopiedExport(false), 2500);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      {copiedExport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedExport ? 'Copied!' : 'Copy .txt'}</span>
                    </button>
                  </div>
                </section>

                {/* Option 2: Online Save (GitHub .txt) */}
                <section className="p-5 rounded-2xl border border-sky-200 bg-sky-50/40 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-sky-600" />
                        <span>Online Save (GitHub .txt)</span>
                      </h3>
                      {githubStatus?.oauthConnected && (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          @{githubStatus.oauthLogin}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Save &amp; load <span className="font-mono font-semibold text-slate-800">{liveRequirementsReport.resolvedPath}</span> in{' '}
                      <span className="font-mono font-semibold text-slate-800">{liveRequirementsReport.resolvedRepo || 'your repo'}</span> so every device stays updated automatically.
                    </p>

                    <div className="flex flex-col gap-2 pt-0.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.githubSync?.autoLoadOnStart ?? true}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              githubSync: {
                                ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                autoLoadOnStart: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                        />
                        <span>Auto-load .txt from GitHub when game starts</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.githubSync?.autoSaveOnline ?? true}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              githubSync: {
                                ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                autoSaveOnline: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                        />
                        <span>Auto-save every edit online to GitHub</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isSyncingOnline}
                      onClick={handleSaveOnlineOnly}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncingOnline ? 'Saving Online...' : 'Online Save (GitHub)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSyncingOnline}
                      onClick={async () => {
                        sound.playClick();
                        const res = await onLoadOnlineFromGitHub();
                        setSaveDataStatus({
                          type: res.success ? 'success' : 'error',
                          message: res.message,
                        });
                        if (res.success) sound.playRewardChime();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOnline ? 'animate-spin' : ''}`} />
                      <span>Load from GitHub</span>
                    </button>
                  </div>
                </section>
              </div>

              {saveDataStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    saveDataStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : saveDataStatus.type === 'info'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {saveDataStatus.message}
                </div>
              )}

              {/* Compact GitHub Target Summary & Collapsible Settings / Troubleshoot */}
              <section className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800">
                      GitHub Database Target
                    </div>
                    <div className="text-xs font-mono text-slate-600 truncate">
                      {liveRequirementsReport.resolvedRepo || 'No repo set'} · branch: {liveRequirementsReport.resolvedBranch} · {liveRequirementsReport.resolvedPath}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {liveRequirementsReport.isStaticHost && liveRequirementsReport.githubEditUrl && (
                      <a
                        href={liveRequirementsReport.githubEditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const notepadTxt = exportDatabaseToNotepadTxt(items, settings, undefined, folders);
                          saveNotepadCache(notepadTxt);
                          downloadTextFile(
                            liveRequirementsReport.resolvedPath.split('/').pop() || 'wordfun-database.txt',
                            notepadTxt
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Download .txt &amp; Open GitHub Editor</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setShowAdvancedGitHub(prev => !prev);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                      <span>{showAdvancedGitHub ? 'Hide Target & Help' : 'Edit Target & Help'}</span>
                    </button>
                  </div>
                </div>

                {(showAdvancedGitHub || showRequirementsPanel) && (
                  <div className="pt-3 border-t border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Repository (<span className="font-mono">owner/repo</span>)
                        </label>
                        <input
                          type="text"
                          value={settings.githubSync?.repo || ''}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              githubSync: {
                                ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                repo: e.target.value,
                              },
                            })
                          }
                          onBlur={e => {
                            const normalized = normalizeGitHubRepoInput(e.target.value);
                            if (normalized !== e.target.value) {
                              onUpdateSettings({
                                ...settings,
                                githubSync: {
                                  ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                  repo: normalized,
                                },
                              });
                            }
                          }}
                          placeholder="TeacherJelly/WorldFunV2"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Branch
                        </label>
                        <input
                          type="text"
                          value={settings.githubSync?.branch || 'main'}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              githubSync: {
                                ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                branch: e.target.value,
                              },
                            })
                          }
                          placeholder="main"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Database Path (<span className="font-mono">.txt</span>)
                        </label>
                        <input
                          type="text"
                          value={settings.githubSync?.filePath || 'wordfun-database.txt'}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              githubSync: {
                                ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                filePath: e.target.value,
                              },
                            })
                          }
                          onBlur={e => {
                            const normalized = normalizeTxtFilePath(e.target.value);
                            if (normalized !== e.target.value) {
                              onUpdateSettings({
                                ...settings,
                                githubSync: {
                                  ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                  filePath: normalized,
                                },
                              });
                            }
                          }}
                          placeholder="wordfun-database.txt"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isRunningDiagnostics || isSyncingOnline}
                        onClick={async () => {
                          sound.playClick();
                          setIsRunningDiagnostics(true);
                          try {
                            const diag = await runGitHubConnectionDiagnostics(
                              settings.githubSync || DEFAULT_GITHUB_SYNC,
                              lastGitHubSyncError
                            );
                            setDiagnosticChecks(diag.checks);
                            await onRefreshGitHubStatus();
                            if (diag.resolvedRepo && diag.resolvedRepo !== settings.githubSync?.repo) {
                              onUpdateSettings({
                                ...settings,
                                githubSync: {
                                  ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                                  repo: diag.resolvedRepo,
                                  branch: diag.resolvedBranch,
                                  filePath: diag.resolvedPath,
                                },
                              });
                            }
                            if (diag.txtReadable) {
                              const loadRes = await onLoadOnlineFromGitHub();
                              setSaveDataStatus({
                                type: loadRes.success ? 'success' : 'info',
                                message: loadRes.message,
                              });
                            } else if (!diag.requirements.canAutoSave) {
                              setShowRequirementsPanel(true);
                            }
                          } finally {
                            setIsRunningDiagnostics(false);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-700 font-semibold text-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isRunningDiagnostics ? 'Testing...' : 'Test & Repair Connection'}</span>
                      </button>

                      {(!isGitHubOnline || autoSaveFixAttempted) && (
                        <button
                          type="button"
                          disabled={isFixingAutoSave || isSyncingOnline}
                          onClick={handleFixAutoSaveButton}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-xs cursor-pointer"
                        >
                          <Wrench className={`w-3.5 h-3.5 ${isFixingAutoSave ? 'animate-spin' : ''}`} />
                          <span>{isFixingAutoSave ? 'Fixing...' : 'Fix Auto-Save'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={!(settings.githubSync?.repo || githubStatus?.defaultRepo)}
                        onClick={() => {
                          sound.playClick();
                          const effectiveCfg = {
                            ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                            repo: settings.githubSync?.repo?.trim() || githubStatus?.defaultRepo || '',
                            branch: settings.githubSync?.branch?.trim() || githubStatus?.defaultBranch || 'main',
                            filePath: settings.githubSync?.filePath?.trim() || githubStatus?.defaultPath || 'wordfun-database.txt',
                          };
                          const link = buildAutoConnectUrl(effectiveCfg);
                          if (link) {
                            navigator.clipboard.writeText(link);
                            setCopiedAutoLink(true);
                            setTimeout(() => setCopiedAutoLink(false), 2500);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-900 font-semibold text-xs cursor-pointer"
                      >
                        {copiedAutoLink ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        <span>{copiedAutoLink ? 'Copied Link!' : 'Copy Multi-Device Link'}</span>
                      </button>

                      {(githubStatus?.serverTokenConfigured || githubStatus?.oauthConnected) && (
                        <button
                          type="button"
                          disabled={isSyncingOnline || !(settings.githubSync?.repo || githubStatus?.defaultRepo)}
                          onClick={async () => {
                            sound.playClick();
                            const effectiveCfg = {
                              ...(settings.githubSync || DEFAULT_GITHUB_SYNC),
                              repo: settings.githubSync?.repo?.trim() || githubStatus?.defaultRepo || '',
                              branch: settings.githubSync?.branch?.trim() || githubStatus?.defaultBranch || 'main',
                              filePath: settings.githubSync?.filePath?.trim() || githubStatus?.defaultPath || 'wordfun-database.txt',
                            };
                            const res = await publishAutoConnectConfigToRepo(effectiveCfg);
                            setSaveDataStatus({
                              type: res.success ? 'success' : 'error',
                              message: res.message,
                            });
                            if (res.success) sound.playRewardChime();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Save Auto-Connect Config to Repo</span>
                        </button>
                      )}

                      {githubStatus?.oauthEnabled && !githubStatus.oauthConnected && (
                        <button
                          type="button"
                          onClick={handleConnectGitHub}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Connect GitHub Account</span>
                        </button>
                      )}

                      {githubStatus?.oauthConnected && (
                        <button
                          type="button"
                          onClick={handleDisconnectGitHub}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                        >
                          <span>Disconnect GitHub</span>
                        </button>
                      )}
                    </div>

                    {diagnosticChecks && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Connection Diagnostics (.txt Database)
                        </div>
                        <div className="space-y-1.5">
                          {diagnosticChecks.map(chk => (
                            <div key={chk.id} className="flex items-start gap-2 text-xs">
                              <span
                                className={`mt-0.5 inline-block w-2 h-2 rounded-full shrink-0 ${
                                  chk.ok ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-800">{chk.label}: </span>
                                <span className="text-slate-600">{chk.detail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!isGitHubOnline || showRequirementsPanel) && (
                      <div className="p-4 rounded-xl bg-amber-50/75 border-2 border-amber-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Connection Requirements</span>
                            </h4>
                            <p className="text-[11px] font-semibold text-amber-900 mt-0.5 leading-relaxed">
                              {liveRequirementsReport.headline}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(liveRequirementsReport.envTemplate);
                              setCopiedEnvTemplate(true);
                              setTimeout(() => setCopiedEnvTemplate(false), 2500);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-semibold text-xs cursor-pointer shrink-0"
                          >
                            {copiedEnvTemplate ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-amber-700" />
                            )}
                            <span>{copiedEnvTemplate ? 'Copied .env Requirements!' : 'Copy .env Requirements'}</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {liveRequirementsReport.items.map(req => (
                            <div
                              key={req.id}
                              className="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 flex items-start gap-2.5 text-xs"
                            >
                              <span
                                className={`mt-1 inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
                                  req.status === 'met'
                                    ? 'bg-emerald-500'
                                    : req.status === 'action_needed'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-bold text-slate-900">{req.name}</span>
                                  <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                      req.status === 'met'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : req.status === 'action_needed'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {req.status === 'met'
                                      ? 'Ready'
                                      : req.status === 'action_needed'
                                      ? 'Action Needed'
                                      : 'Missing'}
                                  </span>
                                </div>
                                <div className="font-mono text-[11px] text-slate-700 break-all">
                                  {req.valueSummary}
                                </div>
                                <div className="text-[11px] text-slate-600 leading-relaxed">
                                  {req.instruction}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(liveRequirementsReport.callbackUrl);
                              setCopiedCallbackUrl(true);
                              setTimeout(() => setCopiedCallbackUrl(false), 2500);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                          >
                            {copiedCallbackUrl ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copiedCallbackUrl ? 'Copied OAuth Callback URL!' : 'Copy OAuth Callback URL'}</span>
                          </button>

                          {liveRequirementsReport.githubEditUrl && (
                            <a
                              href={liveRequirementsReport.githubEditUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                const notepadTxt = exportDatabaseToNotepadTxt(items, settings, undefined, folders);
                                saveNotepadCache(notepadTxt);
                                downloadTextFile(
                                  liveRequirementsReport.resolvedPath.split('/').pop() || 'wordfun-database.txt',
                                  notepadTxt
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Download .txt &amp; Open GitHub Editor</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Import Database File */}
              <section className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Import Folders, Words &amp; Settings</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Browse a saved Notepad (<span className="font-mono">.txt</span>) database file to merge or restore your data.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    ref={txtFileInputRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setImportText(ev.target?.result as string);
                        setImportStatus({
                          type: 'success',
                          message: `Loaded "${f.name}". Choose Merge or Replace All below.`,
                        });
                      };
                      reader.readAsText(f);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => txtFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-sky-600" />
                    <span>Browse .txt File</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Or paste Notepad (.txt) database text here..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:outline-none focus:border-sky-500"
                />

                {importStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      importStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleImportDatabase(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Load &amp; Merge Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImportDatabase(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Restore Full Backup (Replace All)</span>
                  </button>
                </div>
              </section>

              {/* Reset Data */}
              <section className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-700">
                  Reset Folders, Vocabulary &amp; Settings
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings(DEFAULT_SETTINGS);
                      setImportStatus({ type: 'success', message: 'Game settings restored to defaults.' });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Reset Settings Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateFolders(DEFAULT_FOLDERS);
                      onUpdateItems([...DEFAULT_SENTENCE_ITEMS, ...DEFAULT_SPELLING_ITEMS]);
                      onUpdateSettings(DEFAULT_SETTINGS);
                      setImportStatus({ type: 'success', message: 'All folders, words, and settings reset to defaults.' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 text-xs">
          <span className="text-slate-500 font-medium">
            Changes are saved automatically
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Folder Confirmation Dialog */}
      {folderPendingDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-folder-title"
          onClick={() => setFolderPendingDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 space-y-4 animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 id="delete-folder-title" className="font-display font-bold text-lg text-slate-900">
                  Delete Folder?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-slate-900">"{folderPendingDelete.name}"</span>?
                  {(folderStats.get(folderPendingDelete.id)?.total ?? 0) > 0 && (
                    <>
                      {' '}
                      This will permanently remove{' '}
                      <span className="font-bold text-rose-700">
                        {folderStats.get(folderPendingDelete.id)?.total}{' '}
                        {(folderStats.get(folderPendingDelete.id)?.total ?? 0) === 1 ? 'item' : 'items'}
                      </span>{' '}
                      inside this folder.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFolderPendingDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFolder(folderPendingDelete.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Folder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
