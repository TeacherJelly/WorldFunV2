import React from 'react';
import { Volume2, RotateCcw, CheckCircle2, AlertCircle, Hand, Route } from 'lucide-react';
import { DotNode, GameItem, InteractionMode } from '../types';
import { CANDY_COLORS } from '../utils/gameUtils';
import { sound } from '../utils/audio';

export type SlotAuditStatus = 'idle' | 'correct' | 'wrong';

interface SentenceTrayProps {
  item: GameItem;
  tokens: string[];
  selectedNodeIds: string[];
  nodes: DotNode[];
  auditResults: SlotAuditStatus[] | null;
  interactionMode?: InteractionMode;
  onChangeInteractionMode?: (mode: InteractionMode) => void;
  onRemoveAtSlot: (slotIndex: number) => void;
  onCheckAnswer: () => void;
  onReset: () => void;
  compact?: boolean;
  teamLabel?: string;
  teamAccent?: 'blue' | 'coral';
  statusBanner?: { tone: 'won' | 'finish' | 'done'; text: string } | null;
  disabled?: boolean;
}

export const SentenceTray: React.FC<SentenceTrayProps> = ({
  item,
  tokens,
  selectedNodeIds,
  nodes,
  auditResults,
  interactionMode = 'move_tap',
  onChangeInteractionMode,
  onRemoveAtSlot,
  onCheckAnswer,
  onReset,
  compact = false,
  teamLabel,
  teamAccent,
  statusBanner = null,
  disabled = false,
}) => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const isAllPlaced = selectedNodeIds.length === tokens.length;

  const wrongCount = auditResults ? auditResults.filter(s => s === 'wrong').length : 0;
  const allCorrect = auditResults ? wrongCount === 0 && auditResults.length === tokens.length : false;

  const handleSpeak = () => {
    sound.unlock(true);
    sound.speak(item.text);
  };

  const borderClass =
    teamAccent === 'blue'
      ? 'border-sky-300'
      : teamAccent === 'coral'
      ? 'border-orange-300'
      : 'border-white';

  const slotBgClass =
    teamAccent === 'blue'
      ? 'bg-sky-50/75 border-sky-100'
      : teamAccent === 'coral'
      ? 'bg-orange-50/75 border-orange-100'
      : 'bg-sky-50/70 border-sky-100';

  return (
    <div className={compact ? 'w-full z-30' : 'w-full max-w-[1680px] mx-auto px-1 sm:px-2 z-30'}>
      <div
        className={`bg-white/95 rounded-3xl shadow-xl border-2 ${borderClass} ${
          compact
            ? 'p-2 sm:p-3 flex flex-col gap-2'
            : 'p-2.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3'
        }`}
      >
        {/* Slots */}
        <div className="flex-1 min-w-0 w-full xl:w-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 gap-2">
            <span className="truncate">
              {teamLabel ? (
                <span
                  className={`font-display font-bold text-sm ${
                    teamAccent === 'coral' ? 'text-orange-700' : 'text-sky-700'
                  }`}
                >
                  {teamLabel} · {item.mode === 'sentence' ? 'Build Sentence' : 'Spell Word'}
                </span>
              ) : (
                <>
                  {item.mode === 'sentence' ? 'Construct the Sentence' : 'Spell the Word'} ·{' '}
                  <span className="hidden sm:inline">
                    {interactionMode === 'swap_line'
                      ? item.mode === 'sentence'
                        ? 'Drag a line across words to connect them'
                        : 'Drag a line across letters to connect them'
                      : 'Tap tokens to connect or drag them around'}
                  </span>
                </>
              )}
            </span>
            <span
              className={`tabular-nums font-extrabold shrink-0 ${
                teamAccent === 'coral' ? 'text-orange-700' : 'text-sky-700'
              }`}
            >
              {selectedNodeIds.length} / {tokens.length} placed
            </span>
          </div>

          <div
            className={`flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-2xl border ${slotBgClass} ${
              compact ? 'min-h-[46px] p-1.5' : 'min-h-[58px] p-2 sm:gap-2.5'
            }`}
          >
            {tokens.map((_, slotIdx) => {
              const nodeId = selectedNodeIds[slotIdx];
              const node = nodeId ? nodeMap.get(nodeId) : undefined;
              const status: SlotAuditStatus = auditResults ? auditResults[slotIdx] || 'idle' : 'idle';
              const color = node ? CANDY_COLORS[node.colorIndex] : CANDY_COLORS[slotIdx % CANDY_COLORS.length];

              return (
                <button
                  key={slotIdx}
                  type="button"
                  disabled={!node || disabled}
                  onClick={() => node && !disabled && onRemoveAtSlot(slotIdx)}
                  title={node ? 'Click to remove this piece' : `Slot ${slotIdx + 1}`}
                  className={`relative flex items-center justify-center font-display font-bold transition-all duration-200 select-none ${
                    item.mode === 'sentence'
                      ? compact
                        ? 'px-2.5 py-1 text-sm sm:text-base rounded-xl min-w-[46px] min-h-[36px]'
                        : 'px-4 py-2 text-lg sm:text-2xl rounded-2xl min-w-[64px] min-h-[48px]'
                      : compact
                      ? 'w-9 h-9 sm:w-11 sm:h-11 text-lg sm:text-xl rounded-xl'
                      : 'w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl rounded-2xl'
                  } ${
                    !node
                      ? 'border-2 border-dashed border-sky-300 bg-white/80 text-sky-300 cursor-default'
                      : status === 'correct'
                      ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-md ring-2 ring-emerald-200 cursor-pointer hover:brightness-105'
                      : status === 'wrong'
                      ? 'bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-md ring-2 ring-rose-200 animate-shake cursor-pointer hover:brightness-105'
                      : `bg-gradient-to-b ${color.bg} text-white shadow-md cursor-pointer hover:scale-105 active:scale-95`
                  }`}
                >
                  {node ? (
                    <>
                      <span>{node.text}</span>
                      {status === 'correct' && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-emerald-600 text-[11px] font-black flex items-center justify-center shadow">
                          ✓
                        </span>
                      )}
                      {status === 'wrong' && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-rose-600 text-[11px] font-black flex items-center justify-center shadow">
                          ✕
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={compact ? 'text-xs font-bold opacity-50' : 'text-sm font-bold opacity-50'}>
                      {slotIdx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Audit feedback message */}
          {auditResults && !allCorrect && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Almost there! {wrongCount} {wrongCount === 1 ? 'piece needs' : 'pieces need'} to be moved. Tap red pieces to remove them!
              </span>
            </div>
          )}

          {/* Two-Player Round Waiting / Finish Prompt */}
          {statusBanner && (
            <div
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-xl border animate-pop-in ${
                statusBanner.tone === 'won'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusBanner.tone === 'done'
                  ? 'bg-sky-50 border-sky-200 text-sky-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
          )}
        </div>

        {/* Bottom Controls: Listen, Clear, Mode Switch & CHECK ANSWER */}
        <div
          className={`flex flex-wrap items-center gap-2 max-w-full ${
            compact
              ? 'w-full justify-between'
              : 'w-full xl:w-auto justify-between xl:justify-end'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5 max-w-full">
            <button
              type="button"
              onClick={handleSpeak}
              className={`group flex items-center gap-1.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer whitespace-nowrap touch-manipulation ${
                compact ? 'px-3 py-2 text-xs sm:text-sm' : 'px-4 py-2.5 text-sm'
              }`}
              title="Hear the target word or sentence"
            >
              <Volume2 className="w-4 h-4 text-sky-600 transition-transform duration-150 group-hover:scale-110" />
              <span>Listen</span>
            </button>

            {selectedNodeIds.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                onClick={onReset}
                className={`group flex items-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer whitespace-nowrap touch-manipulation ${
                  compact ? 'px-3 py-2 text-xs sm:text-sm' : 'px-4 py-2.5 text-sm'
                }`}
                title="Clear all placed pieces"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-200 group-hover:-rotate-45" />
                <span>Clear</span>
              </button>
            )}

            {onChangeInteractionMode && (
              <div
                role="group"
                aria-label={`${teamLabel || 'Player'} Play Control Style`}
                className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-2xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.playClick();
                    onChangeInteractionMode('move_tap');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
                    interactionMode === 'move_tap'
                      ? teamAccent === 'coral'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                  title="Classic Move & Tap Mode"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Move &amp; Tap</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.playClick();
                    onChangeInteractionMode('swap_line');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
                    interactionMode === 'swap_line'
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                  title="Drag a line to connect words or letters"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Swap Line</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!isAllPlaced || disabled}
            onClick={onCheckAnswer}
            className={`group relative overflow-hidden flex items-center gap-1.5 rounded-2xl font-display font-bold shadow-lg transition-all duration-150 whitespace-nowrap touch-manipulation ${
              compact ? 'px-4 py-2 text-sm sm:text-base' : 'px-5 py-2.5 text-base gap-2'
            } ${
              isAllPlaced && !disabled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white cursor-pointer border-b-4 border-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:ring-4 hover:ring-emerald-300/40 active:translate-y-0.5 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className={compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 transition-transform duration-150 group-hover:scale-110'} />
            <span>Check Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
