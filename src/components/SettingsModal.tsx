import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  Type,
  Music,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  Volume2,
  Mic,
  Copy,
  RotateCcw,
  Search,
  Wand2,
  FileText,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import { GameItem, GameMode, GameSettings, GradeLevel, ModeConfig, SemesterNumber, UnitNumber } from '../types';
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SENTENCE_CONFIG,
  DEFAULT_SETTINGS,
  DEFAULT_WORDS_CONFIG,
  downloadJsonFile,
  exportFullBackupToJson,
  parseAndValidateFullImport,
} from '../utils/storage';
import { DEFAULT_SENTENCE_ITEMS, DEFAULT_SPELLING_ITEMS } from '../utils/defaultData';
import { autoCategorize, findMatchingIllustration, searchIllustrations } from '../utils/illustrations';
import { GRADES, GRADE_META, SEMESTERS, SEMESTER_META, UNITS } from '../utils/gameUtils';
import { MUSIC_TRACKS, STUDIO_VOICES, isAndroidDevice, sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  items: GameItem[];
  onUpdateItems: (newItems: GameItem[]) => void;
  onSelectPlayItem: (item: GameItem) => void;
}

type SettingsTab = 'sentence' | 'words' | 'audio' | 'backup';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  items,
  onUpdateItems,
  onSelectPlayItem,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    settings.gameMode === 'spelling' ? 'words' : 'sentence'
  );

  // Sync initial tab and Grade/Semester/Unit defaults when opened
  useEffect(() => {
    if (isOpen) {
      const mode = settings.gameMode;
      const cfg = mode === 'spelling' ? settings.wordsConfig : settings.sentenceConfig;
      setActiveTab(mode === 'spelling' ? 'words' : 'sentence');
      setFormGrade(cfg.grade);
      setFormSemester(cfg.semester);
      setFormUnit(cfg.unit);
    }
  }, [isOpen, settings.gameMode, settings.sentenceConfig, settings.wordsConfig]);

  // Available voices list
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const loadVoices = () => setVoices(sound.getAvailableVoices());
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, []);

  const TEST_VOICE_PHRASE = 'Hello! Let us build fun sentences and spell words together!';

  useEffect(() => {
    if (isOpen && activeTab === 'audio' && settings.voiceEnabled) {
      sound.prefetchSpeech(TEST_VOICE_PHRASE);
    }
  }, [isOpen, activeTab, settings.voiceEnabled, settings.voiceName]);

  // Editor state (shared for Sentence tab & Words tab)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formGrade, setFormGrade] = useState<GradeLevel>(settings.sentenceConfig.grade);
  const [formSemester, setFormSemester] = useState<SemesterNumber>(settings.sentenceConfig.semester);
  const [formUnit, setFormUnit] = useState<UnitNumber>(settings.sentenceConfig.unit);
  const [libraryScope, setLibraryScope] = useState<'unit' | 'semester' | 'grade' | 'all'>('unit');
  const [formHint, setFormHint] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [formImageName, setFormImageName] = useState<string | null>(null);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Illustration search drawer inside editor
  const [showIllusSearch, setShowIllusSearch] = useState(false);
  const [illusQuery, setIllusQuery] = useState('');

  // Drag-and-drop image upload state
  const [isDraggingOverImage, setIsDraggingOverImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Import/Export state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Clear form when switching between tabs (unless editing)
  const switchTab = (tab: SettingsTab) => {
    sound.playClick();
    setActiveTab(tab);
    const nextCfg = tab === 'words' ? settings.wordsConfig : settings.sentenceConfig;
    setEditingId(null);
    setFormText('');
    setFormCategory('');
    setFormGrade(nextCfg.grade);
    setFormSemester(nextCfg.semester);
    setFormUnit(nextCfg.unit);
    setFormHint('');
    setFormImageUrl(null);
    setFormImageName(null);
    setHasCustomImage(false);
    setFormError(null);
    setFormSuccess(null);
    setShowIllusSearch(false);
  };

  if (!isOpen) return null;

  const editorMode: GameMode = activeTab === 'words' ? 'spelling' : 'sentence';
  const currentModeConfig: ModeConfig =
    editorMode === 'sentence' ? settings.sentenceConfig : settings.wordsConfig;

  const updateModeConfig = (patch: Partial<ModeConfig>) => {
    if (editorMode === 'sentence') {
      onUpdateSettings({
        ...settings,
        sentenceConfig: { ...settings.sentenceConfig, ...patch },
      });
    } else {
      onUpdateSettings({
        ...settings,
        wordsConfig: { ...settings.wordsConfig, ...patch },
      });
    }
  };

  // Auto-categorize topic category & illustration as user types
  const handleFormTextChange = (val: string) => {
    setFormText(val);
    const trimmed = val.trim();

    if (!trimmed) {
      if (!editingId) setFormCategory('');
      return;
    }

    if (!editingId) {
      setFormCategory(autoCategorize(trimmed));
    }
    if (!hasCustomImage) {
      const match = findMatchingIllustration(trimmed);
      setFormImageUrl(match.imageUrl);
      setFormImageName(match.preset ? `Auto-matched: ${match.preset.label}` : 'Auto-generated letter badge');
    }
  };

  const handleAutoFindPicture = () => {
    sound.playClick();
    const match = findMatchingIllustration(formText || formCategory || 'star');
    setFormImageUrl(match.imageUrl);
    setFormImageName(match.preset ? `Matched: ${match.preset.label}` : 'Auto-generated illustration');
    setHasCustomImage(false);
    if (!formCategory.trim()) {
      setFormCategory(match.category);
    }
  };

  const processImageFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !/\.(png|jpe?g)$/i.test(file.name)) {
      setFormError('Please choose a PNG, JPEG, or JPG image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setFormError('Image must be smaller than 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setFormImageUrl(ev.target?.result as string);
      setFormImageName(file.name);
      setHasCustomImage(true);
      setFormError(null);
    };
    reader.onerror = () => setFormError('Could not read image file.');
    reader.readAsDataURL(file);
  };

  const handleSaveVocabularyItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = formText.trim();
    if (!cleanText) {
      setFormError(editorMode === 'sentence' ? 'Please type a sentence first.' : 'Please type a word first.');
      return;
    }

    if (editorMode === 'sentence') {
      const words = cleanText.split(/\s+/).filter(Boolean);
      if (words.length < 3) {
        setFormError('Sentences must have at least 3 words.');
        return;
      }
    } else {
      const letters = cleanText.replace(/[^A-Za-z0-9]/g, '');
      if (letters.length < 2) {
        setFormError('Spelling words must have at least 2 letters.');
        return;
      }
    }

    const finalMatch = findMatchingIllustration(cleanText);
    const finalImage = formImageUrl || finalMatch.imageUrl;
    const finalCategory = formCategory.trim() || finalMatch.category || autoCategorize(cleanText);
    const unitLabel = `Grade ${formGrade} · ${SEMESTER_META[formSemester].shortLabel} · Unit ${formUnit}`;

    if (editingId) {
      const updated = items.map(it =>
        it.id === editingId
          ? {
              ...it,
              text: editorMode === 'spelling' ? cleanText.toUpperCase() : cleanText,
              mode: editorMode,
              grade: formGrade,
              semester: formSemester,
              unit: formUnit,
              category: finalCategory,
              hint: formHint.trim() || undefined,
              imageUrl: finalImage,
              imageName: formImageName || undefined,
            }
          : it
      );
      onUpdateItems(updated);
      setFormSuccess(
        `Updated "${editorMode === 'spelling' ? cleanText.toUpperCase() : cleanText}" in ${unitLabel}!`
      );
    } else {
      const newItem: GameItem = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: editorMode === 'spelling' ? cleanText.toUpperCase() : cleanText,
        mode: editorMode,
        grade: formGrade,
        semester: formSemester,
        unit: formUnit,
        category: finalCategory,
        hint: formHint.trim() || undefined,
        imageUrl: finalImage,
        imageName: formImageName || undefined,
        isCustom: true,
      };
      onUpdateItems([newItem, ...items]);
      setFormSuccess(`Saved "${newItem.text}" inside ${unitLabel}!`);
    }

    sound.playRewardChime();
    setEditingId(null);
    setFormText('');
    setFormCategory('');
    setFormGrade(currentModeConfig.grade);
    setFormSemester(currentModeConfig.semester);
    setFormUnit(currentModeConfig.unit);
    setFormHint('');
    setFormImageUrl(null);
    setFormImageName(null);
    setHasCustomImage(false);
    setFormError(null);
    setTimeout(() => setFormSuccess(null), 3500);
  };

  const startEditingItem = (item: GameItem) => {
    sound.playClick();
    setEditingId(item.id);
    setFormText(item.text);
    setFormCategory(item.category || '');
    setFormGrade(item.grade);
    setFormSemester(item.semester);
    setFormUnit(item.unit);
    setFormHint(item.hint || '');
    setFormImageUrl(item.imageUrl || null);
    setFormImageName(item.imageName || null);
    setHasCustomImage(Boolean(item.imageUrl));
    setFormError(null);
  };

  const handleDeleteItem = (id: string) => {
    const modePool = items.filter(it => it.mode === editorMode);
    if (modePool.length <= 1) {
      setFormError(`Keep at least 1 item in ${editorMode === 'sentence' ? 'Sentences' : 'Words'}.`);
      return;
    }
    sound.playClick();
    onUpdateItems(items.filter(it => it.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormText('');
      setFormGrade(currentModeConfig.grade);
      setFormSemester(currentModeConfig.semester);
      setFormUnit(currentModeConfig.unit);
    }
  };

  const handleImportJson = (replaceAll: boolean) => {
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste JSON backup data or choose a file first.' });
      return;
    }
    const res = parseAndValidateFullImport(importText);
    if (!res.success) {
      setImportStatus({ type: 'error', message: res.error || 'Import failed.' });
      return;
    }

    if (res.items) {
      if (replaceAll) {
        onUpdateItems(res.items);
      } else {
        const existingTexts = new Set(items.map(i => `${i.mode}:${i.text.toLowerCase()}`));
        const additions = res.items.filter(i => !existingTexts.has(`${i.mode}:${i.text.toLowerCase()}`));
        onUpdateItems([...additions, ...items]);
      }
    }
    if (res.settings) {
      onUpdateSettings(res.settings);
    }

    sound.playRewardChime();
    setImportStatus({
      type: 'success',
      message: `Loaded ${res.items?.length ?? 0} vocabulary items${res.settings ? ' and saved settings' : ''}!`,
    });
    setImportText('');
  };

  const modeItems = items.filter(it => it.mode === editorMode);
  const gradeItems = modeItems.filter(it => it.grade === currentModeConfig.grade);
  const semesterItems = gradeItems.filter(it => it.semester === currentModeConfig.semester);
  const unitItems = semesterItems.filter(it => it.unit === currentModeConfig.unit);
  const filteredModeItems =
    libraryScope === 'unit'
      ? unitItems
      : libraryScope === 'semester'
      ? semesterItems
      : libraryScope === 'grade'
      ? gradeItems
      : modeItems;
  const searchedIllustrations = searchIllustrations(illusQuery);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-2 sm:p-5 bg-slate-900/65 overflow-y-auto touch-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-sky-200 w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden animate-pop-in my-auto shrink-0">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl leading-tight">
                Options & Vocabulary Studio
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Configure Sentence Mode, Spelling Words, 20 Music Tracks, Voice & Backups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Dedicated Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 pt-2.5 gap-1.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => switchTab('sentence')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'sentence'
                ? 'bg-white text-sky-700 border-t-2 border-x-2 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sentence</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('words')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'words'
                ? 'bg-white text-violet-700 border-t-2 border-x-2 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-violet-700'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Words</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'audio'
                ? 'bg-white text-emerald-700 border-t-2 border-x-2 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Music, SFX & Voice</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'backup'
                ? 'bg-white text-amber-700 border-t-2 border-x-2 border-slate-200 -mb-px'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Import & Export</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* SENTENCE TAB OR WORDS TAB */}
          {(activeTab === 'sentence' || activeTab === 'words') && (
            <div className="space-y-6">
              
              {/* Mode-Specific Configuration Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {editorMode === 'sentence' ? 'Sentence Mode Configuration' : 'Words / Spelling Configuration'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Choose Grade 1–6, select 1st or 2nd Semester, and pick from 4 Units inside that semester
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      const defaults =
                        editorMode === 'sentence' ? DEFAULT_SENTENCE_CONFIG : DEFAULT_WORDS_CONFIG;
                      updateModeConfig(defaults);
                      if (!editingId) {
                        setFormGrade(defaults.grade);
                        setFormSemester(defaults.semester);
                        setFormUnit(defaults.unit);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset {editorMode === 'sentence' ? 'Sentence' : 'Words'} Defaults</span>
                  </button>
                </div>

                {/* Grade 1 to Grade 6 Selector */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Select Grade (1–6)
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {GRADES.map(grade => {
                      const active = currentModeConfig.grade === grade;
                      const countInGrade = modeItems.filter(it => it.grade === grade).length;
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            const meta = GRADE_META[grade];
                            updateModeConfig({
                              grade,
                              targetWordCount:
                                editorMode === 'sentence'
                                  ? meta.suggestedTargetSentence
                                  : meta.suggestedTargetWords,
                            });
                            if (!editingId) setFormGrade(grade);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? editorMode === 'sentence'
                                ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                                : 'bg-violet-500 text-white border-violet-600 shadow-md'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">Grade {grade}</div>
                          <div className={`text-[10px] font-semibold ${active ? 'text-white/90' : 'text-slate-400'}`}>
                            {countInGrade} items
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2 Semesters inside Selected Grade */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Select Semester in Grade {currentModeConfig.grade} (2 Semesters)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SEMESTERS.map(sem => {
                      const active = currentModeConfig.semester === sem;
                      const countInSem = gradeItems.filter(it => it.semester === sem).length;
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            updateModeConfig({ semester: sem, unit: 1 });
                            if (!editingId) {
                              setFormSemester(sem);
                              setFormUnit(1);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            active
                              ? 'bg-indigo-500 text-white border-indigo-600 shadow-md'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">{SEMESTER_META[sem].label}</div>
                            <div className={`text-[11px] ${active ? 'text-white/90' : 'text-slate-500'}`}>
                              4 Units inside
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold tabular-nums ${active ? 'text-white/90' : 'text-slate-400'}`}>
                            {countInSem} items
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Units inside Selected Semester */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Select Unit in Grade {currentModeConfig.grade} · {SEMESTER_META[currentModeConfig.semester].label}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {UNITS.map(unit => {
                      const active = currentModeConfig.unit === unit;
                      return (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            updateModeConfig({ unit });
                            if (!editingId) setFormUnit(unit);
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? editorMode === 'sentence'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                                : 'bg-fuchsia-500 text-white border-fuchsia-600 shadow-md'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          Unit {unit}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Word/Letter Count (min 3) + Optional Hints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Target {editorMode === 'sentence' ? 'Words' : 'Letters'}
                      </div>
                      <div className="text-[11px] text-slate-500">Minimum 3</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentModeConfig.targetWordCount <= 3}
                        onClick={() =>
                          updateModeConfig({
                            targetWordCount: Math.max(3, currentModeConfig.targetWordCount - 1),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold tabular-nums text-slate-900">
                        {currentModeConfig.targetWordCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateModeConfig({
                            targetWordCount: Math.min(14, currentModeConfig.targetWordCount + 1),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Show Order Numbers</div>
                      <div className="text-[11px] text-slate-500">Optional 1, 2, 3 helper badges</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentModeConfig.showNumberHints}
                      onChange={e => updateModeConfig({ showNumberHints: e.target.checked })}
                      className="w-5 h-5 accent-sky-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Player System, Play Style & Two-Player Tug of War Rules */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ ...settings, playerMode: 'single' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          settings.playerMode === 'single'
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Single Player
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ ...settings, playerMode: 'two' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          settings.playerMode === 'two'
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Two Players (Tug of War)
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ ...settings, interactionMode: 'move_tap' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          settings.interactionMode === 'move_tap'
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Move &amp; Tap
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ ...settings, interactionMode: 'swap_line' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          settings.interactionMode === 'swap_line'
                            ? 'bg-violet-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Swap Line
                      </button>
                    </div>
                  </div>

                  {settings.playerMode === 'two' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({
                              ...settings,
                              twoPlayerConfig: { ...settings.twoPlayerConfig, vocabMode: 'same' },
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            settings.twoPlayerConfig.vocabMode === 'same'
                              ? 'bg-sky-100 text-sky-800'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Same Vocab
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            onUpdateSettings({
                              ...settings,
                              twoPlayerConfig: { ...settings.twoPlayerConfig, vocabMode: 'random' },
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            settings.twoPlayerConfig.vocabMode === 'random'
                              ? 'bg-violet-100 text-violet-800'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Random Vocab
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">Target Score:</span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={settings.twoPlayerConfig.targetScore}
                          onChange={e =>
                            onUpdateSettings({
                              ...settings,
                              twoPlayerConfig: {
                                ...settings.twoPlayerConfig,
                                targetScore: Math.max(1, Math.min(30, Math.round(Number(e.target.value)) || 1)),
                              },
                            })
                          }
                          className="w-12 text-center py-0.5 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs tabular-nums"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Create / Edit Vocabulary Item Form */}
              <form
                onSubmit={handleSaveVocabularyItem}
                className="p-4 sm:p-5 rounded-3xl bg-sky-50/70 border-2 border-sky-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    {editingId ? <Edit2 className="w-4 h-4 text-sky-600" /> : <Plus className="w-5 h-5 text-sky-600" />}
                    <span>
                      {editingId
                        ? `Edit ${editorMode === 'sentence' ? 'Sentence' : 'Word'}`
                        : `Create New ${editorMode === 'sentence' ? 'Sentence' : 'Spelling Word'}`}
                    </span>
                  </h3>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => switchTab(activeTab)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Main Input + Save to Grade & Unit */}
                {(() => {
                  const trimmed = formText.trim();
                  const liveCount =
                    editorMode === 'sentence'
                      ? trimmed
                        ? trimmed.split(/\s+/).filter(Boolean).length
                        : 0
                      : trimmed.replace(/[^A-Za-z0-9]/g, '').length;
                  const unitLabel = editorMode === 'sentence' ? 'words' : 'letters';

                  return (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            {editorMode === 'sentence'
                              ? 'Sentence (at least 3 words):'
                              : 'Word to Spell:'}
                          </label>
                          <span className="text-[11px] font-extrabold tabular-nums text-sky-700">
                            {liveCount} {unitLabel}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formText}
                          onChange={e => handleFormTextChange(e.target.value)}
                          placeholder={
                            editorMode === 'sentence'
                              ? 'e.g. The playful monkey eats yellow bananas'
                              : 'e.g. BUTTERFLY'
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-sky-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Save to Grade:
                          </label>
                          <select
                            value={formGrade}
                            onChange={e => setFormGrade(Number(e.target.value) as GradeLevel)}
                            className="w-full px-3 py-2 rounded-xl bg-white border-2 border-sky-200 text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            {GRADES.map(g => (
                              <option key={g} value={g}>
                                Grade {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Save to Semester:
                          </label>
                          <select
                            value={formSemester}
                            onChange={e => setFormSemester(Number(e.target.value) as SemesterNumber)}
                            className="w-full px-3 py-2 rounded-xl bg-white border-2 border-sky-200 text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            {SEMESTERS.map(sem => (
                              <option key={sem} value={sem}>
                                {SEMESTER_META[sem].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Save to Unit:
                          </label>
                          <select
                            value={formUnit}
                            onChange={e => setFormUnit(Number(e.target.value) as UnitNumber)}
                            className="w-full px-3 py-2 rounded-xl bg-white border-2 border-sky-200 text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            {UNITS.map(u => (
                              <option key={u} value={u}>
                                Unit {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Category & Hint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category (Auto-detected):
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      placeholder="Auto-categorized on typing..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Friendly Clue / Hint (Optional):
                    </label>
                    <input
                      type="text"
                      value={formHint}
                      onChange={e => setFormHint(e.target.value)}
                      placeholder="e.g. A fun clue for kids!"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Auto-Match Illustration Preview + Search + Drag-and-Drop Custom File */}
                <div className="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Illustration Picture (Auto-Matched, Searchable, or Custom Upload)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFindPicture}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Auto-Match</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowIllusSearch(prev => !prev)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{showIllusSearch ? 'Hide Library' : 'Find Picture'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview + Drag-Drop Zone */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      {formImageUrl ? (
                        <img src={formImageUrl} alt="Illustration preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 text-center">No Image</span>
                      )}
                    </div>

                    <div
                      onDragOver={e => {
                        e.preventDefault();
                        setIsDraggingOverImage(true);
                      }}
                      onDragLeave={() => setIsDraggingOverImage(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setIsDraggingOverImage(false);
                        if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]);
                      }}
                      onClick={() => imageInputRef.current?.click()}
                      className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                        isDraggingOverImage
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'
                      }`}
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && processImageFile(e.target.files[0])}
                      />
                      <div className="text-xs font-bold text-slate-700">
                        {formImageName || 'Drag & drop PNG / JPEG / JPG here or click to browse computer'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Supports local PNG, JPG, JPEG files or automatic subject matching
                      </div>
                    </div>
                  </div>

                  {/* Searchable Built-In Illustration Picker */}
                  {showIllusSearch && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <input
                        type="text"
                        value={illusQuery}
                        onChange={e => setIllusQuery(e.target.value)}
                        placeholder="Search pictures (e.g. dog, apple, rocket, flower, star)..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-sky-400"
                      />
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                        {searchedIllustrations.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setFormImageUrl(preset.imageUrl);
                              setFormImageName(preset.label);
                              setHasCustomImage(true);
                              if (!formCategory.trim()) setFormCategory(preset.category);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 flex flex-col items-center gap-1 cursor-pointer transition-all"
                          >
                            <img src={preset.imageUrl} alt={preset.label} className="w-10 h-10 object-contain" />
                            <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingId ? 'Save Changes' : `Save ${editorMode === 'sentence' ? 'Sentence' : 'Word'}`}</span>
                  </button>
                </div>
              </form>

              {/* Existing Vocabulary Library */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    {editorMode === 'sentence' ? 'Saved Sentences' : 'Saved Spelling Words'} ({filteredModeItems.length})
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLibraryScope('unit')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        libraryScope === 'unit'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      G{currentModeConfig.grade} · Sem {currentModeConfig.semester} · Unit {currentModeConfig.unit} ({unitItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibraryScope('semester')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        libraryScope === 'semester'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {SEMESTER_META[currentModeConfig.semester].label} ({semesterItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibraryScope('grade')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        libraryScope === 'grade'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Grade {currentModeConfig.grade} ({gradeItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibraryScope('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        libraryScope === 'all'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({modeItems.length})
                    </button>
                  </div>
                </div>

                {filteredModeItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-500">
                    No {editorMode === 'sentence' ? 'sentences' : 'words'} saved in Grade {currentModeConfig.grade} · {SEMESTER_META[currentModeConfig.semester].label} · Unit {currentModeConfig.unit} yet. Use the form above to save one here!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {filteredModeItems.map(item => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 flex items-center justify-between gap-2 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPlayItem(item);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-slate-100 flex items-center justify-center p-1 shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-sm">{item.mode === 'sentence' ? '📝' : '🔤'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {item.text}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              Grade {item.grade} · Sem {item.semester} · Unit {item.unit} · {item.category}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingItem(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MUSIC (20 TRACKS), SOUND EFFECTS & NATURAL VOICE */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              
              {/* 1. Background Music (20 tracks) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-violet-50/70 border border-violet-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Music className="w-5 h-5 text-violet-600" />
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Background Music (20 Full 2:00 Soundtracks)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Instrumental compositions with Intro, 1st &amp; 2nd Stanza, Refrain, Chorus, Bridge &amp; 2nd Chorus
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-violet-200">
                      <input
                        type="checkbox"
                        checked={settings.musicEnabled}
                        onChange={e => {
                          sound.unlock();
                          onUpdateSettings({ ...settings, musicEnabled: e.target.checked });
                        }}
                        className="accent-violet-600 w-4 h-4"
                      />
                      <span>Music On</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({
                          ...settings,
                          musicEnabled: DEFAULT_AUDIO_SETTINGS.musicEnabled,
                          musicTrackId: DEFAULT_AUDIO_SETTINGS.musicTrackId,
                          musicVolume: DEFAULT_AUDIO_SETTINGS.musicVolume,
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Music Volume */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-violet-100">
                  <span className="text-xs font-bold text-slate-700 w-28">Music Volume</span>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={e =>
                      onUpdateSettings({ ...settings, musicVolume: Number(e.target.value) })
                    }
                    className="flex-1 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold tabular-nums text-violet-700 w-10 text-right">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>

                {/* 20 Music Tracks Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
                  {MUSIC_TRACKS.map(track => {
                    const selected = settings.musicTrackId === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          sound.unlock();
                          onUpdateSettings({
                            ...settings,
                            musicEnabled: true,
                            musicTrackId: track.id,
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-1.5 ${
                          selected
                            ? 'bg-violet-600 text-white border-violet-700 shadow-md'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {track.id}. {track.name}
                          </div>
                          <div className={`text-[10px] truncate ${selected ? 'text-violet-100' : 'text-slate-400'}`}>
                            {track.mood} · {Math.floor(track.durationSeconds / 60)}:{String(track.durationSeconds % 60).padStart(2, '0')}
                          </div>
                        </div>
                        <Play className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selected ? 'fill-white' : 'text-violet-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sound Effects */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Dynamic Sound Effects
                      </h3>
                      <p className="text-xs text-slate-500">
                        Playful chimes for dragging, connecting, and winning
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                      <input
                        type="checkbox"
                        checked={settings.sfxEnabled}
                        onChange={e => {
                          sound.unlock();
                          onUpdateSettings({ ...settings, sfxEnabled: e.target.checked });
                        }}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>SFX On</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        sound.playSuccessFanfare();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Test SFX
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({
                          ...settings,
                          sfxEnabled: DEFAULT_AUDIO_SETTINGS.sfxEnabled,
                          sfxVolume: DEFAULT_AUDIO_SETTINGS.sfxVolume,
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-slate-700 w-28">SFX Volume</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={e =>
                      onUpdateSettings({ ...settings, sfxVolume: Number(e.target.value) })
                    }
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold tabular-nums text-emerald-700 w-10 text-right">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* 3. Speaking Voice */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-5 h-5 text-sky-600" />
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Speaking Voice (Natural Female Prioritized)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Built-in Clear Voices work on Android, iOS &amp; PC even if no device voices are installed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-sky-200">
                      <input
                        type="checkbox"
                        checked={settings.voiceEnabled}
                        onChange={e =>
                          onUpdateSettings({ ...settings, voiceEnabled: e.target.checked })
                        }
                        className="accent-sky-600 w-4 h-4"
                      />
                      <span>Voice On</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlock(true);
                        sound.voiceEnabled = true;
                        sound.voiceName = settings.voiceName;
                        sound.speak(TEST_VOICE_PHRASE);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Test Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({
                          ...settings,
                          voiceEnabled: DEFAULT_AUDIO_SETTINGS.voiceEnabled,
                          voiceName: DEFAULT_AUDIO_SETTINGS.voiceName,
                          voicePitch: DEFAULT_AUDIO_SETTINGS.voicePitch,
                          voiceRate: DEFAULT_AUDIO_SETTINGS.voiceRate,
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-sky-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Speaking Voice:
                    </label>
                    <select
                      value={settings.voiceName}
                      onChange={e => {
                        const nextVoice = e.target.value;
                        sound.voiceName = nextVoice;
                        onUpdateSettings({ ...settings, voiceName: nextVoice });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                    >
                      <option value="auto">
                        {isAndroidDevice()
                          ? 'Auto-Select Best Voice (Built-in Clear Voice Ready)'
                          : 'Auto-Select Best Natural Voice'}
                      </option>
                      <optgroup label="Built-in Clear Voices (Ready on Android, iOS &amp; PC)">
                        {STUDIO_VOICES.map(sv => (
                          <option key={sv.id} value={sv.id}>
                            {sv.label}
                          </option>
                        ))}
                      </optgroup>
                      {voices.length > 0 && (
                        <optgroup label="Device System Voices">
                          {voices.map(v => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {(isAndroidDevice() || voices.length === 0) && (
                      <p className="mt-1.5 text-[11px] font-semibold text-sky-700">
                        Built-in Clear Game Voices are active and ready to speak words &amp; sentences on Android phones and tablets.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 w-16">Pitch</span>
                      <input
                        type="range"
                        min="0.7"
                        max="1.4"
                        step="0.05"
                        value={settings.voicePitch}
                        onChange={e =>
                          onUpdateSettings({ ...settings, voicePitch: Number(e.target.value) })
                        }
                        className="flex-1 accent-sky-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold tabular-nums w-8 text-right">
                        {settings.voicePitch.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 w-16">Speed</span>
                      <input
                        type="range"
                        min="0.65"
                        max="1.15"
                        step="0.05"
                        value={settings.voiceRate}
                        onChange={e =>
                          onUpdateSettings({ ...settings, voiceRate: Number(e.target.value) })
                        }
                        className="flex-1 accent-sky-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold tabular-nums w-8 text-right">
                        {settings.voiceRate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPORT & EXPORT ALL WORKS AND SETTINGS */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Export All */}
              <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-600" />
                    <span>Export All Words, Sentences & Settings</span>
                  </h3>
                  <span className="text-xs font-bold text-amber-800">
                    {items.length} items · Full Config
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Save all custom sentences, spelling words, illustrations, Grade &amp; Unit settings, music track, and voice preferences into one JSON file.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      downloadJsonFile(
                        `wordfun-full-backup-${new Date().toISOString().slice(0, 10)}.json`,
                        exportFullBackupToJson(items, settings)
                      );
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Complete Backup (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(exportFullBackupToJson(items, settings));
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 2500);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 cursor-pointer"
                  >
                    {copiedExport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedExport ? 'Copied!' : 'Copy Backup JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Import All */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-600" />
                  <span>Import Saved Works & Settings</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Load a previously exported `.json` backup file to restore your words, sentences, images, and settings.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    ref={jsonInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setImportText(ev.target?.result as string);
                        setImportStatus({
                          type: 'success',
                          message: `Loaded "${f.name}". Choose "Import & Merge" or "Restore Full Backup" below.`,
                        });
                      };
                      reader.readAsText(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => jsonInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Choose Backup File</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Or paste exported JSON data here..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:outline-none focus:border-sky-500"
                />

                {importStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold ${
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
                    onClick={() => handleImportJson(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Import & Merge Items</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImportJson(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Restore Full Backup (Replace All)</span>
                  </button>
                </div>
              </div>

              {/* Reset Settings & Vocabulary Area */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Reset Settings &amp; Vocabulary</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings(DEFAULT_SETTINGS);
                      setImportStatus({ type: 'success', message: 'All settings restored to defaults!' });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
                  >
                    Reset Settings Only
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateItems([...DEFAULT_SENTENCE_ITEMS, ...DEFAULT_SPELLING_ITEMS]);
                      onUpdateSettings(DEFAULT_SETTINGS);
                      setImportStatus({ type: 'success', message: 'Everything reset to fresh defaults!' });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">All edits & settings auto-save locally</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
