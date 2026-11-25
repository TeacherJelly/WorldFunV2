import React, { useState } from 'react';
import { Volume2, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { GameItem } from '../types';
import { sound } from '../utils/audio';

interface IllustrationCardProps {
  item: GameItem;
  hintUsed: boolean;
  onUseHint: () => void;
  compact?: boolean;
}

export const IllustrationCard: React.FC<IllustrationCardProps> = ({
  item,
  hintUsed,
  onUseHint,
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.unlock(true);
    sound.speak(item.text);
  };

  return (
    <div
      className={`relative bg-white/95 rounded-3xl shadow-xl border-2 border-white transition-transform duration-200 hover:scale-[1.02] ${
        compact ? 'p-1.5 sm:p-2 w-[96px] sm:w-[132px]' : 'p-2.5 sm:p-3 w-[132px] sm:w-[180px] lg:w-[215px]'
      }`}
    >
      {/* Image box */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-amber-50 border border-slate-100 flex items-center justify-center">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.text}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-2 select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-sky-500">
            <ImageIcon className="w-10 h-10 mb-1 opacity-70" />
            <span className="text-xs font-bold text-slate-500">{item.category}</span>
          </div>
        )}

        {/* Voice pronunciation button */}
        <button
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={handleSpeak}
          title="Listen to pronunciation"
          aria-label="Listen to pronunciation"
          className={`absolute bottom-1.5 right-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-sky-700 touch-manipulation ${
            compact ? 'w-8 h-8' : 'w-10 h-10 bottom-2 right-2'
          }`}
        >
          <Volume2 className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>
      </div>

      {/* Clean unboxed metadata + Hint action */}
      <div className="mt-2 flex items-center justify-between gap-1.5 px-0.5">
        <span
          className={`font-bold text-slate-600 truncate ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {item.category || 'Vocabulary'}
        </span>

        <button
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            sound.unlock();
            sound.playClick();
            onUseHint();
          }}
          title="Show clue hint"
          className={`flex items-center gap-1 font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
            compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
          } ${
            hintUsed
              ? 'bg-amber-100 text-amber-900'
              : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
          }`}
        >
          <Lightbulb className={`w-3.5 h-3.5 ${hintUsed ? 'text-amber-600' : 'text-slate-500'}`} />
          <span>Clue</span>
        </button>
      </div>

      {hintUsed && (
        <div
          className={`mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 font-semibold text-amber-950 leading-snug animate-pop-in ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {item.hint || `Listen to the voice button for a clue!`}
        </div>
      )}
    </div>
  );
};
