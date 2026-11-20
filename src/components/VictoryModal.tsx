import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  RotateCcw,
  Volume2,
  Sparkles,
  Layers,
  Home,
} from 'lucide-react';
import { GameItem, GradeLevel, SemesterNumber, UnitNumber } from '../types';
import { sound } from '../utils/audio';
import { getNextUnitOrGrade, SEMESTER_META } from '../utils/gameUtils';

interface VictoryModalProps {
  isOpen: boolean;
  item: GameItem;
  grade: GradeLevel;
  semester: SemesterNumber;
  unit: UnitNumber;
  completedStagesCount: number;
  totalStagesInUnit: number;
  isUnitComplete: boolean;
  onPlayAnotherCurrentUnit: () => void;
  onGoToNextUnit: () => void;
  onReplay: () => void;
  onGoToTitleScreen: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  item,
  grade,
  semester,
  unit,
  completedStagesCount,
  totalStagesInUnit,
  isUnitComplete,
  onPlayAnotherCurrentUnit,
  onGoToNextUnit,
  onReplay,
  onGoToTitleScreen,
}) => {
  const [trophyError, setTrophyError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    sound.playSuccessFanfare();
    if (isUnitComplete) {
      setTimeout(() => sound.playRewardChime(), 450);
    }

    try {
      confetti({
        particleCount: isUnitComplete ? 140 : 90,
        spread: isUnitComplete ? 95 : 75,
        origin: { y: 0.58 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // Ignore confetti fallback
    }

    const speakTimer = setTimeout(() => {
      sound.speak(item.text);
    }, 500);

    return () => clearTimeout(speakTimer);
  }, [isOpen, item, isUnitComplete]);

  if (!isOpen) return null;

  const semInfo = SEMESTER_META[semester];
  const nextDestination = getNextUnitOrGrade(grade, semester, unit);
  const currentLabel = `Grade ${grade} · ${semInfo.shortLabel} · Unit ${unit}`;
  const progressPct =
    totalStagesInUnit > 0
      ? Math.min(100, Math.round((completedStagesCount / totalStagesInUnit) * 100))
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-4 bg-slate-900/65 overflow-y-auto touch-auto">
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-300 text-center space-y-4 animate-pop-in overflow-hidden my-auto shrink-0">
        {/* Trophy & Title Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-amber-50 border-4 border-amber-300 shadow-lg flex items-center justify-center">
            {!trophyError ? (
              <img
                src="/src/assets/images/reward_trophy_badge_1794674397774.jpg"
                alt="Gold Star Trophy"
                referrerPolicy="no-referrer"
                onError={() => setTrophyError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-12 h-12 text-amber-500" />
            )}
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            {isUnitComplete ? `${currentLabel} Cleared!` : 'Amazing Job!'}
          </h2>
          <p className="text-sm font-bold text-slate-500">
            {isUnitComplete
              ? `You finished all ${totalStagesInUnit} stages in Unit ${unit}!`
              : item.mode === 'sentence'
              ? 'You built the sentence!'
              : 'You spelled the word!'}
          </p>
        </div>

        {/* Stage Progress Bar within Current Grade & Unit */}
        <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-sky-900">
            <span>{currentLabel}</span>
            <span className="tabular-nums">
              {completedStagesCount} / {totalStagesInUnit} completed
            </span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-sky-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnitComplete
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-r from-amber-400 to-sky-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Completed Sentence/Word + Illustration */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 border border-amber-200 space-y-2.5">
          {item.imageUrl && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl overflow-hidden bg-white shadow-sm border border-amber-100 p-1.5 flex items-center justify-center">
              <img
                src={item.imageUrl}
                alt={item.text}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="font-display font-bold text-xl sm:text-2xl text-slate-800 leading-snug">
            "{item.text}"
          </div>

          <button
            type="button"
            onClick={() => {
              sound.unlock(true);
              sound.speak(item.text);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-sky-600" />
            <span>Hear Again</span>
          </button>
        </div>

        {/* Continue Choices: "Go to Next Unit / Grade" ONLY appears when all stages in this Unit are finished */}
        <div className="pt-1 space-y-2.5">
          {isUnitComplete ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {nextDestination && (
                <button
                  type="button"
                  onClick={onGoToNextUnit}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-bold text-base shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer sm:col-span-2"
                >
                  <span>Go to {nextDestination.label}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={onPlayAnotherCurrentUnit}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-display font-bold text-sm sm:text-base shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  !nextDestination ? 'sm:col-span-2' : ''
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Play Unit {unit} Again</span>
              </button>

              <button
                type="button"
                onClick={onGoToTitleScreen}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-display font-bold text-sm sm:text-base shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  !nextDestination ? 'sm:col-span-2' : ''
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Go to Title Screen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onPlayAnotherCurrentUnit}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-display font-bold text-base shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer sm:col-span-2"
              >
                <span>Next Stage ({currentLabel})</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onReplay}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Stage</span>
              </button>

              <button
                type="button"
                onClick={onGoToTitleScreen}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Title Screen</span>
              </button>
            </div>
          )}

          {isUnitComplete && (
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay This Stage</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
