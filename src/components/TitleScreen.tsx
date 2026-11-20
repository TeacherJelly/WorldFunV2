import React, { useEffect, useRef } from 'react';
import {
  Play,
  SlidersHorizontal,
  Music,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  SpellCheck,
  GraduationCap,
  User,
  Users,
  Flag,
  Info,
  Check,
  Shuffle,
  Layers,
} from 'lucide-react';
import {
  GameMode,
  GameSettings,
  GradeLevel,
  SemesterNumber,
  TwoPlayerVocabMode,
  UnitNumber,
} from '../types';
import { sound } from '../utils/audio';
import { GRADE_META, GRADES, SEMESTERS, SEMESTER_META, UNITS } from '../utils/gameUtils';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { MascotLogo } from './MascotLogo';
import { GameTitleLogo } from './GameTitleLogo';

export type TitleMenuStep =
  | 'home'
  | 'single_mode'
  | 'single_grade'
  | 'two_mode'
  | 'two_vocab'
  | 'two_grade';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  menuStep: TitleMenuStep;
  onChangeMenuStep: (step: TitleMenuStep) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
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

  const activeConfig =
    settings.gameMode === 'sentence' ? settings.sentenceConfig : settings.wordsConfig;
  const activeGrade = activeConfig.grade;
  const activeSemester = activeConfig.semester;
  const activeUnit = activeConfig.unit;
  const gradeInfo = GRADE_META[activeGrade];

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

  const handleSelectGrade = (grade: GradeLevel, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#F59E0B', 8);
    const meta = GRADE_META[grade];
    onUpdateSettings({
      ...settings,
      sentenceConfig: {
        ...settings.sentenceConfig,
        grade,
        semester: 1,
        unit: 1,
        targetWordCount: meta.suggestedTargetSentence,
      },
      wordsConfig: {
        ...settings.wordsConfig,
        grade,
        semester: 1,
        unit: 1,
        targetWordCount: meta.suggestedTargetWords,
      },
    });
  };

  const handleSelectSemester = (semester: SemesterNumber, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#8B5CF6', 8);
    onUpdateSettings({
      ...settings,
      sentenceConfig: { ...settings.sentenceConfig, semester, unit: 1 },
      wordsConfig: { ...settings.wordsConfig, semester, unit: 1 },
    });
  };

  const handleSelectUnit = (unit: UnitNumber, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#38BDF8', 8);
    onUpdateSettings({
      ...settings,
      sentenceConfig: { ...settings.sentenceConfig, unit },
      wordsConfig: { ...settings.wordsConfig, unit },
    });
  };

  const handlePickMode = (mode: GameMode, nextStep: TitleMenuStep, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, mode === 'sentence' ? '#38BDF8' : '#A78BFA', 10);
    onUpdateSettings({ ...settings, gameMode: mode });
    onChangeMenuStep(nextStep);
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

  const renderGradePanel = (backStep: TitleMenuStep, isTwoPlayers: boolean) => (
    <div className="w-full max-w-xl bg-white/95 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-amber-200 space-y-4 animate-pop-in">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onChangeMenuStep(backStep);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center min-w-0 px-1">
          <div className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">
            {isTwoPlayers ? 'Two Players' : 'Single Player'} ·{' '}
            {settings.gameMode === 'sentence' ? 'Sentence Mode' : 'Spelling Mode'}
          </div>
          <div className="text-xs font-bold text-amber-700 truncate">
            {gradeInfo.label} · {SEMESTER_META[activeSemester].label} · Unit {activeUnit}
          </div>
        </div>

        <div className="w-[74px] hidden sm:block" aria-hidden="true" />
      </div>

      {/* Grade 1 to Grade 6 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 gap-2">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>Select Grade</span>
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GRADES.map(g => {
            const isSelected = activeGrade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={(e) => handleSelectGrade(g, e)}
                className={`py-2.5 px-2 rounded-2xl font-display font-bold text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-md border-b-[3px] border-orange-700 ring-2 ring-amber-300/60'
                    : 'bg-amber-50 hover:bg-amber-100 text-slate-700 border-b-[3px] border-amber-200 hover:shadow-sm'
                }`}
              >
                Grade {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Semesters inside selected Grade */}
      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-amber-100">
        {SEMESTERS.map(sem => {
          const isSelected = activeSemester === sem;
          return (
            <button
              key={sem}
              type="button"
              onClick={(e) => handleSelectSemester(sem, e)}
              className={`py-2.5 px-3 rounded-2xl font-display font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-between gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md border-b-[3px] border-indigo-800 ring-2 ring-violet-300/50'
                  : 'bg-violet-50/80 hover:bg-violet-100 text-slate-700 border-b-[3px] border-violet-200 hover:shadow-sm'
              }`}
            >
              <span>{SEMESTER_META[sem].label}</span>
              <span
                className={`text-[11px] font-semibold ${
                  isSelected ? 'text-violet-100' : 'text-slate-500'
                }`}
              >
                4 Units
              </span>
            </button>
          );
        })}
      </div>

      {/* 4 Units inside selected Semester */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-amber-100">
        {UNITS.map(u => {
          const isSelected = activeUnit === u;
          return (
            <button
              key={u}
              type="button"
              onClick={(e) => handleSelectUnit(u, e)}
              className={`py-2.5 px-3 rounded-2xl text-center font-display font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md border-b-[3px] border-teal-800 ring-2 ring-emerald-300/50'
                  : 'bg-sky-50/80 hover:bg-sky-100 text-slate-800 border-b-[3px] border-sky-200 hover:shadow-sm'
              }`}
            >
              Unit {u}
            </button>
          );
        })}
      </div>

      {/* Play Button */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={(e) => {
            sound.unlock();
            sound.playClick();
            triggerSmallBurst(e, '#34D399', 14);
            onStartGame();
          }}
          className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-3.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-bold text-2xl shadow-xl border-2 border-emerald-300/60 border-b-[6px] border-b-emerald-700 hover:-translate-y-1 hover:shadow-2xl active:translate-y-1 active:border-b-2 transition-all duration-200 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-white transition-transform duration-200 group-hover:scale-110" />
          <span>PLAY!</span>
        </button>
      </div>
    </div>
  );

  const renderModePicker = (isTwoPlayers: boolean) => (
    <div className="w-full max-w-xl bg-white/95 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-sky-200 space-y-4 animate-pop-in">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onChangeMenuStep('home');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 text-center truncate">
          {isTwoPlayers ? 'Two Players · Choose Mode' : 'Single Player · Choose Mode'}
        </h2>

        <div className="w-[74px] hidden sm:block" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={(e) =>
            handlePickMode('sentence', isTwoPlayers ? 'two_vocab' : 'single_grade', e)
          }
          className={`group relative overflow-hidden p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer flex items-center gap-4 border-2 border-b-[5px] hover:-translate-y-1 hover:shadow-xl active:translate-y-0.5 ${
            settings.gameMode === 'sentence'
              ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-300 border-b-blue-800 shadow-lg'
              : 'bg-sky-50/70 text-slate-800 border-sky-200 border-b-sky-300 hover:border-sky-400 hover:bg-sky-50 shadow-md'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 ${
              settings.gameMode === 'sentence'
                ? 'bg-white/25 text-white'
                : 'bg-sky-100 text-sky-600'
            }`}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-xl leading-tight">
              Sentence Mode
            </div>
            <div
              className={`text-xs font-semibold mt-1 ${
                settings.gameMode === 'sentence' ? 'text-sky-100' : 'text-slate-600'
              }`}
            >
              Connect words to form sentences
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-extrabold ${
                settings.gameMode === 'sentence' ? 'text-amber-200' : 'text-sky-600'
              }`}
            >
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={(e) =>
            handlePickMode('spelling', isTwoPlayers ? 'two_vocab' : 'single_grade', e)
          }
          className={`group relative overflow-hidden p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer flex items-center gap-4 border-2 border-b-[5px] hover:-translate-y-1 hover:shadow-xl active:translate-y-0.5 ${
            settings.gameMode === 'spelling'
              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-violet-300 border-b-fuchsia-800 shadow-lg'
              : 'bg-violet-50/70 text-slate-800 border-violet-200 border-b-violet-300 hover:border-violet-400 hover:bg-violet-50 shadow-md'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${
              settings.gameMode === 'spelling'
                ? 'bg-white/25 text-white'
                : 'bg-violet-100 text-violet-600'
            }`}
          >
            <SpellCheck className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-xl leading-tight">
              Spelling Mode
            </div>
            <div
              className={`text-xs font-semibold mt-1 ${
                settings.gameMode === 'spelling' ? 'text-violet-100' : 'text-slate-600'
              }`}
            >
              Connect letters to spell words
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-extrabold ${
                settings.gameMode === 'spelling' ? 'text-amber-200' : 'text-violet-600'
              }`}
            >
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTwoPlayersVocabStep = () => (
    <div className="w-full max-w-xl bg-white/95 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-orange-200 space-y-4 animate-pop-in">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onChangeMenuStep('two_mode');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 text-center truncate">
          Two Players · Word Challenge
        </h2>

        <div className="w-[74px] hidden sm:block" aria-hidden="true" />
      </div>

      {/* Same Words vs Random Words */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={(e) => handleSelectVocabMode('same', e)}
          className={`p-4 rounded-3xl text-left transition-all duration-150 cursor-pointer flex items-center gap-3.5 border-2 border-b-[5px] hover:-translate-y-0.5 ${
            settings.twoPlayerConfig.vocabMode === 'same'
              ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-300 border-b-blue-800 shadow-lg'
              : 'bg-sky-50/70 text-slate-800 border-sky-200 border-b-sky-300 hover:bg-sky-50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              settings.twoPlayerConfig.vocabMode === 'same'
                ? 'bg-white/25 text-white'
                : 'bg-sky-100 text-sky-600'
            }`}
          >
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-lg flex items-center gap-1.5">
              <span>Same Words</span>
              {settings.twoPlayerConfig.vocabMode === 'same' && (
                <Check className="w-4 h-4 text-amber-200" />
              )}
            </div>
            <p
              className={`text-xs font-semibold mt-0.5 ${
                settings.twoPlayerConfig.vocabMode === 'same' ? 'text-sky-100' : 'text-slate-600'
              }`}
            >
              Both players compete on the exact same words
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => handleSelectVocabMode('random', e)}
          className={`p-4 rounded-3xl text-left transition-all duration-150 cursor-pointer flex items-center gap-3.5 border-2 border-b-[5px] hover:-translate-y-0.5 ${
            settings.twoPlayerConfig.vocabMode === 'random'
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-violet-300 border-b-purple-800 shadow-lg'
              : 'bg-violet-50/70 text-slate-800 border-violet-200 border-b-violet-300 hover:bg-violet-50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              settings.twoPlayerConfig.vocabMode === 'random'
                ? 'bg-white/25 text-white'
                : 'bg-violet-100 text-violet-600'
            }`}
          >
            <Shuffle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-lg flex items-center gap-1.5">
              <span>Random Words</span>
              {settings.twoPlayerConfig.vocabMode === 'random' && (
                <Check className="w-4 h-4 text-amber-200" />
              )}
            </div>
            <p
              className={`text-xs font-semibold mt-0.5 ${
                settings.twoPlayerConfig.vocabMode === 'random' ? 'text-violet-100' : 'text-slate-600'
              }`}
            >
              Each player gets different random words
            </p>
          </div>
        </button>
      </div>

      {/* Teacher Target Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl">
        <label
          htmlFor="title-target-score"
          className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2"
        >
          <Flag className="w-4 h-4 text-amber-600" />
          <span>Teacher Target Score to Win:</span>
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={settings.twoPlayerConfig.targetScore <= 1}
            onClick={() => {
              sound.playClick();
              updateTargetScore(settings.twoPlayerConfig.targetScore - 1);
            }}
            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100 text-slate-800 font-black text-base border border-amber-200 disabled:opacity-40 cursor-pointer"
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
            className="w-14 text-center py-1 rounded-xl bg-white border border-amber-300 font-display font-bold text-base text-slate-900 tabular-nums focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            disabled={settings.twoPlayerConfig.targetScore >= 30}
            onClick={() => {
              sound.playClick();
              updateTargetScore(settings.twoPlayerConfig.targetScore + 1);
            }}
            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100 text-slate-800 font-black text-base border border-amber-200 disabled:opacity-40 cursor-pointer"
            aria-label="Increase target score"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onChangeMenuStep('two_grade');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-display font-bold text-lg shadow-lg border-b-4 border-rose-800 hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Next: Select Grade</span>
          <ArrowRight className="w-5 h-5" />
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
      </header>

      {/* Main Stage: Centered Stack on Mobile, Left Corner Menu + Right Corner Giant Mascot on Tablet/Desktop/TV */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-4 sm:gap-6 md:gap-8 py-2">
        {/* Title, Subtitle & Menu Column (Centered on Mobile, Balanced Center-Left on Tablet+) */}
        <div
          className={`relative order-2 md:order-1 w-full md:w-auto md:max-w-[540px] lg:max-w-[580px] flex flex-col items-center text-center gap-4 sm:gap-5 self-center md:self-start md:pt-2 ${
            menuStep === 'home'
              ? 'z-20 md:pointer-events-none md:ml-[5%] lg:ml-[9%] xl:ml-[13%] 2xl:ml-[14%]'
              : 'z-30 md:ml-[3%] lg:ml-[6%]'
          }`}
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
          {menuStep === 'home' && (
            <div className="w-full max-w-[300px] sm:max-w-[320px] flex flex-col gap-2.5 sm:gap-3 animate-pop-in md:pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  sound.unlock();
                  sound.playClick();
                  triggerSmallBurst(e, '#0EA5E9', 12);
                  onUpdateSettings({ ...settings, playerMode: 'single' });
                  onChangeMenuStep('single_mode');
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
                  onChangeMenuStep('two_mode');
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
          )}

          {/* Single Player Submenus */}
          {menuStep === 'single_mode' && renderModePicker(false)}
          {menuStep === 'single_grade' && renderGradePanel('single_mode', false)}

          {/* Two Players Submenus */}
          {menuStep === 'two_mode' && renderModePicker(true)}
          {menuStep === 'two_vocab' && renderTwoPlayersVocabStep()}
          {menuStep === 'two_grade' && renderGradePanel('two_vocab', true)}
        </div>

        {/* Mascot Logo (Flows inside stage on mobile/short horizontal views; Ground-pinned near treehouse on tall tablet & PC) */}
        <div
          className={`order-1 md:order-2 w-full md:w-auto mascot-ground-pin flex items-center justify-center self-center ${
            menuStep === 'home' ? 'md:z-20' : 'md:z-10'
          }`}
        >
          <MascotLogo
            onClick={handleMascotClick}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-[220px] md:h-[220px] lg:w-[245px] lg:h-[245px] xl:w-[250px] xl:h-[250px] 2xl:w-[290px] 2xl:h-[290px] max-h-[48dvh] md:max-h-[42dvh] lg:max-h-[34dvh] xl:max-h-[32dvh] max-w-full aspect-square shrink-0"
          />
        </div>
      </main>
    </div>
  );
};
