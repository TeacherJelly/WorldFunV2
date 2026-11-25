import React, { useEffect, useMemo, useRef } from 'react';
import {
  Play,
  SlidersHorizontal,
  Music,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ArrowLeft,
  FolderOpen,
  Folder,
  User,
  Users,
  Flag,
  Info,
  Check,
  Shuffle,
  Layers,
} from 'lucide-react';
import {
  GameItem,
  GameSettings,
  TwoPlayerVocabMode,
  VocabFolder,
} from '../types';
import { sound } from '../utils/audio';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { MascotLogo } from './MascotLogo';
import { GameTitleLogo } from './GameTitleLogo';
import { FullscreenButton } from './FullscreenButton';

export type TitleMenuStep = 'home' | 'single_folder' | 'two_folder';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  menuStep: TitleMenuStep;
  onChangeMenuStep: (step: TitleMenuStep) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  folders: VocabFolder[];
  items: GameItem[];
}

const TITLE_WORDS = [
  {
    word: 'Word',
    letters: [
      { char: 'W', color: 'text-rose-500', hex: '#F43F5E', note: 0 },
      { char: 'o', color: 'text-amber-500', hex: '#F59E0B', note: 1 },
      { char: 'r', color: 'text-emerald-500', hex: '#10B981', note: 2 },
      { char: 'd', color: 'text-sky-500', hex: '#0EA5E9', note: 3 },
    ],
  },
  {
    word: 'Fun!',
    letters: [
      { char: 'F', color: 'text-violet-500', hex: '#8B5CF6', note: 4 },
      { char: 'u', color: 'text-pink-500', hex: '#EC4899', note: 5 },
      { char: 'n', color: 'text-amber-500', hex: '#F59E0B', note: 6 },
      { char: '!', color: 'text-rose-500', hex: '#F43F5E', note: 7 },
    ],
  },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenAbout,
  menuStep,
  onChangeMenuStep,
  settings,
  onUpdateSettings,
  folders,
  items,
}) => {
  const mascotGreetingLangRef = useRef<'en' | 'zh'>('en');

  useEffect(() => {
    sound.preloadMascotVoice('en').catch(() => {});
    sound.preloadMascotVoice('zh').catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }
      if (e.code === 'Escape') {
        if (menuStep !== 'home') {
          onChangeMenuStep('home');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuStep, onChangeMenuStep]);

  const folderMeta = useMemo(() => {
    const map = new Map<string, { count: number; previewUrl?: string }>();
    for (const f of folders) {
      map.set(f.id, { count: 0 });
    }
    for (const it of items) {
      const entry = map.get(it.folderId) || { count: 0 };
      entry.count += 1;
      if (!entry.previewUrl && it.imageUrl) {
        entry.previewUrl = it.imageUrl;
      }
      map.set(it.folderId, entry);
    }
    return map;
  }, [folders, items]);

  const activeFolder =
    folders.find(f => f.id === settings.selectedFolderId) || folders[0];
  const activeFolderItemCount = activeFolder
    ? (folderMeta.get(activeFolder.id)?.count ?? 0)
    : 0;

  const triggerSmallBurst = (e: React.MouseEvent<HTMLElement>, color: string, count = 8) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerBackdropBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, color, count);
  };

  const handleMascotClick = () => {
    sound.unlock();
    const lang = mascotGreetingLangRef.current;
    mascotGreetingLangRef.current = lang === 'en' ? 'zh' : 'en';
    sound.playMascotVoice(lang);
  };

  const handleTitleLetterClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    noteIdx: number,
    hexColor: string
  ) => {
    sound.unlock();
    sound.playConnect(noteIdx);
    triggerSmallBurst(e, hexColor, 6);
  };

  const handleSelectFolder = (folderId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#38BDF8', 8);
    onUpdateSettings({
      ...settings,
      selectedFolderId: folderId,
    });
  };

  const handleSelectVocabMode = (vocabMode: TwoPlayerVocabMode, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#10B981', 8);
    onUpdateSettings({
      ...settings,
      twoPlayerConfig: { ...settings.twoPlayerConfig, vocabMode },
    });
  };

  const updateTargetScore = (nextScore: number) => {
    const clamped = Math.max(1, Math.min(30, Math.round(nextScore) || 1));
    onUpdateSettings({
      ...settings,
      twoPlayerConfig: { ...settings.twoPlayerConfig, targetScore: clamped },
    });
  };

  const toggleMusic = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    const next = !settings.musicEnabled;
    sound.playClick();
    if (next) triggerSmallBurst(e, '#A78BFA', 8);
    onUpdateSettings({ ...settings, musicEnabled: next });
  };

  const toggleSfx = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    const next = !settings.sfxEnabled;
    if (next) {
      sound.sfxEnabled = true;
      sound.playClick();
      triggerSmallBurst(e, '#34D399', 8);
    }
    onUpdateSettings({ ...settings, sfxEnabled: next });
  };

  const toggleVoice = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !settings.voiceEnabled;
    sound.unlock(next);
    sound.playClick();
    if (next) {
      sound.voiceEnabled = true;
      sound.speak('Voice is on!');
      triggerSmallBurst(e, '#38BDF8', 8);
    }
    onUpdateSettings({ ...settings, voiceEnabled: next });
  };

  const renderFolderPanel = (isTwoPlayers: boolean) => (
    <div
      className={`w-full max-w-4xl lg:max-w-5xl max-h-[90dvh] my-auto shrink-0 bg-white/98 rounded-[2rem] shadow-2xl border-2 flex flex-col overflow-hidden animate-pop-in ${
        isTwoPlayers ? 'border-orange-200' : 'border-sky-200'
      }`}
    >
      {/* Top Modal Header */}
      <div
        className={`px-5 sm:px-7 py-4 sm:py-5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isTwoPlayers
            ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-rose-50 border-orange-100'
            : 'bg-gradient-to-r from-sky-50 via-cyan-50/70 to-indigo-50 border-sky-100'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onChangeMenuStep('home');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-extrabold whitespace-nowrap ${
                  isTwoPlayers
                    ? 'bg-orange-500 text-white'
                    : 'bg-sky-600 text-white'
                }`}
              >
                {isTwoPlayers ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span>{isTwoPlayers ? 'Two Players' : 'Single Player'}</span>
              </span>
              <h2 className="font-display font-bold text-lg sm:text-2xl text-slate-900 truncate">
                Select a Folder
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 truncate mt-0.5">
              Pick a vocabulary folder to start {isTwoPlayers ? 'your Tug of War match' : 'playing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <FolderOpen className="w-4 h-4 text-sky-600" />
            <span>Manage Folders</span>
          </button>
          <FullscreenButton variant="panel" />
        </div>
      </div>

      {/* Spacious Scrollable Body */}
      <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 bg-white">
        {/* Folder Selection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5 gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className={`w-4 h-4 ${isTwoPlayers ? 'text-orange-500' : 'text-sky-600'}`} />
              <span>Available Folders ({folders.length})</span>
            </span>
            {activeFolder && (
              <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                Selected: <strong className="text-slate-900">{activeFolder.name}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-h-[44dvh] overflow-y-auto p-0.5 pr-1.5">
            {folders.map(folder => {
              const meta = folderMeta.get(folder.id) || { count: 0 };
              const isSelected = activeFolder?.id === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={e => handleSelectFolder(folder.id, e)}
                  className={`group relative p-4 sm:p-5 rounded-2xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 min-h-[128px] border-2 ${
                    isSelected
                      ? isTwoPlayers
                        ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-200 shadow-md -translate-y-0.5'
                        : 'bg-sky-50/85 border-sky-500 ring-2 ring-sky-200 shadow-md -translate-y-0.5'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/70 hover:-translate-y-0.5 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden p-1.5 transition-colors ${
                          isSelected
                            ? isTwoPlayers
                              ? 'bg-orange-100 border-orange-200 text-orange-600'
                              : 'bg-sky-100 border-sky-200 text-sky-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500'
                        }`}
                      >
                        {meta.previewUrl ? (
                          <img
                            src={meta.previewUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Folder className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">
                          {folder.name}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? isTwoPlayers
                            ? 'bg-orange-500 text-white shadow-xs scale-105'
                            : 'bg-sky-600 text-white shadow-xs scale-105'
                          : 'border-2 border-slate-200 bg-white text-transparent group-hover:border-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {folder.description && (
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {folder.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums ${
                        meta.count > 0 ? 'text-slate-700' : 'text-amber-600'
                      }`}
                    >
                      {meta.count} {meta.count === 1 ? 'item' : 'items'}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected
                          ? isTwoPlayers
                            ? 'text-orange-600'
                            : 'text-sky-700'
                          : meta.count > 0
                            ? 'text-slate-400'
                            : 'text-amber-600'
                      }`}
                    >
                      {isSelected ? 'Selected' : meta.count > 0 ? 'Ready' : 'Empty'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacious Two-Player Rules (Same/Random + Target Score) */}
        {isTwoPlayers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
              <button
                type="button"
                onClick={e => handleSelectVocabMode('same', e)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                  settings.twoPlayerConfig.vocabMode === 'same'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Same Words</span>
              </button>
              <button
                type="button"
                onClick={e => handleSelectVocabMode('random', e)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                  settings.twoPlayerConfig.vocabMode === 'random'
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                <span>Random Words</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
              <label
                htmlFor="title-target-score"
                className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2 whitespace-nowrap"
              >
                <Flag className="w-4 h-4 text-amber-600" />
                <span>Target Score to Win:</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={settings.twoPlayerConfig.targetScore <= 1}
                  onClick={() => {
                    sound.playClick();
                    updateTargetScore(settings.twoPlayerConfig.targetScore - 1);
                  }}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 text-slate-800 font-black text-base border border-amber-200 disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease target score"
                >
                  -
                </button>
                <input
                  id="title-target-score"
                  type="number"
                  min={1}
                  max={30}
                  value={settings.twoPlayerConfig.targetScore}
                  onChange={e => updateTargetScore(Number(e.target.value))}
                  className="w-14 text-center py-1.5 rounded-xl bg-white border border-amber-300 font-display font-bold text-base text-slate-900 tabular-nums focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={settings.twoPlayerConfig.targetScore >= 30}
                  onClick={() => {
                    sound.playClick();
                    updateTargetScore(settings.twoPlayerConfig.targetScore + 1);
                  }}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 text-slate-800 font-black text-base border border-amber-200 disabled:opacity-40 cursor-pointer"
                  aria-label="Increase target score"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {activeFolderItemCount === 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-semibold text-amber-900 text-center">
            "{activeFolder?.name}" has no items yet. Pick another folder above or click Manage Folders to add words and sentences.
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left min-w-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Active Selection
          </div>
          <div className="text-sm sm:text-base font-display font-bold text-slate-900 truncate">
            {activeFolder ? `${activeFolder.name} (${activeFolderItemCount} ${activeFolderItemCount === 1 ? 'item' : 'items'})` : 'No folder selected'}
          </div>
        </div>

        <button
          type="button"
          disabled={activeFolderItemCount === 0}
          onClick={(e) => {
            sound.unlock();
            sound.playClick();
            triggerSmallBurst(e, '#34D399', 14);
            onStartGame();
          }}
          className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-12 sm:px-14 py-3.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold text-2xl shadow-xl border-2 border-emerald-300/60 border-b-[6px] border-b-emerald-700 hover:-translate-y-1 hover:shadow-2xl active:translate-y-1 active:border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <Play className="w-7 h-7 fill-white transition-transform duration-200 group-hover:scale-110" />
          <span>PLAY!</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-dvh flex flex-col justify-between p-4 sm:p-6 lg:px-10 lg:py-6 overflow-x-clip touch-auto select-none z-10">
      {/* Top Bar: Audio Quick Controls */}
      <header className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-end gap-2 z-20">
        <button
          type="button"
          onClick={toggleMusic}
          className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
            settings.musicEnabled
              ? 'bg-violet-500 text-white hover:bg-violet-600 border-b-[3px] border-violet-700'
              : 'bg-white/95 text-slate-700 hover:bg-white border-b-[3px] border-slate-200'
          }`}
          title="Toggle Background Music"
        >
          <Music className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12" />
          <span>Music {settings.musicEnabled ? 'On' : 'Off'}</span>
        </button>

        <button
          type="button"
          onClick={toggleSfx}
          className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
            settings.sfxEnabled
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-b-[3px] border-emerald-700'
              : 'bg-white/95 text-slate-700 hover:bg-white border-b-[3px] border-slate-200'
          }`}
          title="Toggle Sound Effects"
        >
          {settings.sfxEnabled ? (
            <Volume2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <VolumeX className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span>SFX {settings.sfxEnabled ? 'On' : 'Off'}</span>
        </button>

        <button
          type="button"
          onClick={toggleVoice}
          className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
            settings.voiceEnabled
              ? 'bg-sky-500 text-white hover:bg-sky-600 border-b-[3px] border-sky-700'
              : 'bg-white/95 text-slate-700 hover:bg-white border-b-[3px] border-slate-200'
          }`}
          title="Toggle Speaking Voice"
        >
          {settings.voiceEnabled ? (
            <Mic className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
          ) : (
            <MicOff className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span>Voice {settings.voiceEnabled ? 'On' : 'Off'}</span>
        </button>

        <FullscreenButton variant="titleHeader" />
      </header>

      {/* Main Stage: Centered Stack on Mobile, Left Corner Menu + Right Corner Giant Mascot on Tablet/Desktop/TV */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-4 sm:gap-6 md:gap-8 py-2">
        {/* Title, Subtitle & Menu Column (Centered on Mobile, Balanced Center-Left on Tablet+) */}
        <div
          className="relative order-2 md:order-1 w-full md:w-auto md:max-w-[540px] lg:max-w-[580px] flex flex-col items-center text-center gap-4 sm:gap-5 self-center md:self-start md:pt-2 z-20 md:pointer-events-none md:ml-[5%] lg:ml-[9%] xl:ml-[13%] 2xl:ml-[14%]"
        >
          <div className="flex flex-col items-center text-center md:pointer-events-auto">
            {/* Brand Name Lockup: Word Fun! (interactive musical rainbow letters) */}
            <div
              aria-label="Word Fun! brand"
              style={{
                WebkitTextStroke: '3px #FFFFFF',
                paintOrder: 'stroke fill',
                textShadow: '0 4px 0 rgba(15, 23, 42, 0.16)',
              }}
              className="font-display font-bold tracking-tight leading-none text-2xl sm:text-3xl lg:text-[2rem] flex flex-wrap items-center justify-center gap-x-2.5"
            >
              {TITLE_WORDS.map(group => (
                <span key={group.word} className="inline-flex items-baseline">
                  {group.letters.map((item, idx) => (
                    <button
                      key={`${group.word}-${idx}`}
                      type="button"
                      onClick={(e) => handleTitleLetterClick(e, item.note, item.hex)}
                      title="Tap letter for music!"
                      className={`${item.color} inline-block transition-transform duration-150 ease-out hover:-translate-y-1.5 hover:scale-110 hover:-rotate-3 active:scale-95 cursor-pointer bg-transparent border-0 p-0 focus:outline-none`}
                    >
                      {item.char}
                    </button>
                  ))}
                </span>
              ))}
            </div>

            {/* Main Game Title: Connect the Dots Word Game (Static sticker title with hover shine reflection) */}
            <h1 className="mt-1 sm:mt-1.5 leading-none">
              <GameTitleLogo className="w-[270px] sm:w-[360px] md:w-[375px] lg:w-[415px] xl:w-[445px] 2xl:w-[485px] max-w-full" />
            </h1>
          </div>

          {/* Home Menu: Single Player -> Two Players -> Options -> About */}
          <div className="w-full max-w-[300px] sm:max-w-[320px] flex flex-col gap-2.5 sm:gap-3 animate-pop-in md:pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                sound.unlock();
                sound.playClick();
                triggerSmallBurst(e, '#0EA5E9', 12);
                onUpdateSettings({ ...settings, playerMode: 'single' });
                onChangeMenuStep('single_folder');
              }}
              className="group relative overflow-hidden flex items-center justify-start gap-3.5 px-6 py-3.5 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-display font-bold text-xl sm:text-2xl shadow-xl border-2 border-sky-300/60 border-b-[6px] border-b-blue-800 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>Single Player</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                sound.unlock();
                sound.playClick();
                triggerSmallBurst(e, '#F97316', 12);
                onUpdateSettings({ ...settings, playerMode: 'two' });
                onChangeMenuStep('two_folder');
              }}
              className="group relative overflow-hidden flex items-center justify-start gap-3.5 px-6 py-3.5 rounded-3xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-display font-bold text-xl sm:text-2xl shadow-xl border-2 border-orange-300/60 border-b-[6px] border-b-rose-800 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Users className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>Two Players</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                sound.unlock();
                sound.playClick();
                triggerSmallBurst(e, '#F59E0B', 10);
                onOpenSettings();
              }}
              className="group flex items-center justify-start gap-3.5 px-6 py-3 rounded-3xl bg-white/95 hover:bg-amber-50 text-slate-800 font-display font-bold text-lg sm:text-xl shadow-lg border-2 border-amber-200 border-b-[5px] border-b-amber-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-6 h-6 shrink-0 text-amber-500 transition-transform duration-300 group-hover:rotate-90" />
              <span>Options</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                sound.unlock();
                sound.playClick();
                triggerSmallBurst(e, '#8B5CF6', 10);
                onOpenAbout();
              }}
              className="group flex items-center justify-start gap-3.5 px-6 py-3 rounded-3xl bg-white/95 hover:bg-violet-50 text-slate-800 font-display font-bold text-lg sm:text-xl shadow-lg border-2 border-violet-200 border-b-[5px] border-b-violet-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Info className="w-6 h-6 shrink-0 text-violet-500 transition-transform duration-200 group-hover:scale-110" />
              <span>About</span>
            </button>
          </div>
        </div>

        {/* Mascot Logo (Flows inside stage on mobile/short horizontal views; Ground-pinned near treehouse on tall tablet & PC) */}
        <div className="order-1 md:order-2 w-full md:w-auto mascot-ground-pin flex items-center justify-center self-center md:z-20">
          <MascotLogo
            onClick={handleMascotClick}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-[220px] md:h-[220px] lg:w-[245px] lg:h-[245px] xl:w-[250px] xl:h-[250px] 2xl:w-[290px] 2xl:h-[290px] max-h-[48dvh] md:max-h-[42dvh] lg:max-h-[34dvh] xl:max-h-[32dvh] max-w-full aspect-square shrink-0"
          />
        </div>
      </main>

      {/* Centered Wide Folder Selection Screen for Single Player & Two Players */}
      {(menuStep === 'single_folder' || menuStep === 'two_folder') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            menuStep === 'two_folder'
              ? 'Two Players Folder Selection'
              : 'Single Player Folder Selection'
          }
          onClick={e => {
            if (e.target === e.currentTarget) {
              sound.playClick();
              onChangeMenuStep('home');
            }
          }}
          className="fixed inset-0 z-40 flex flex-col items-center p-3 sm:p-6 lg:p-8 bg-slate-900/45 backdrop-blur-[2px] overflow-y-auto touch-auto"
        >
          {renderFolderPanel(menuStep === 'two_folder')}
        </div>
      )}
    </div>
  );
};
