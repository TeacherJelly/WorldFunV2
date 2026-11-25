import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';
import { sound } from '../utils/audio';

type FullscreenButtonVariant = 'titleHeader' | 'hud' | 'panel' | 'modalHeader' | 'modalCorner';

interface FullscreenButtonProps {
  variant?: FullscreenButtonVariant;
  showLabel?: boolean;
  className?: string;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  variant = 'hud',
  showLabel = true,
  className = '',
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const label = isFullscreen ? 'Exit Full' : 'Full Screen';
  const title = isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen';

  const variantClasses: Record<FullscreenButtonVariant, string> = {
    titleHeader: isFullscreen
      ? 'flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap shrink-0 bg-sky-500 text-white hover:bg-sky-600 border-b-[3px] border-sky-700'
      : 'flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap shrink-0 bg-white/95 text-slate-700 hover:bg-white border-b-[3px] border-slate-200',
    hud: isFullscreen
      ? 'flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-md border border-sky-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap shrink-0'
      : 'flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 hover:bg-sky-50 text-slate-800 shadow-md border border-white hover:border-sky-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap shrink-0',
    panel: isFullscreen
      ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0'
      : 'inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0',
    modalHeader: isFullscreen
      ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm'
      : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0',
    modalCorner: isFullscreen
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm'
      : 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        sound.unlock();
        sound.playClick();
        void toggleFullscreen();
      }}
      aria-label={title}
      aria-pressed={isFullscreen}
      title={title}
      className={`group ${variantClasses[variant]} ${className}`}
    >
      {isFullscreen ? (
        <Minimize2 className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
      ) : (
        <Maximize2 className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
      )}
      {showLabel && (
        <span
          className={
            variant === 'titleHeader' || variant === 'modalHeader' ? 'inline' : 'hidden sm:inline'
          }
        >
          {label}
        </span>
      )}
    </button>
  );
};
