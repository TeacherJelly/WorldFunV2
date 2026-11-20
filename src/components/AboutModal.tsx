import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { MascotLogo } from './MascotLogo';
import { sound } from '../utils/audio';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center p-4 bg-slate-900/45 overflow-y-auto touch-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center space-y-5 animate-pop-in my-auto shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          aria-label="Close About"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <MascotLogo className="w-28 h-28 sm:w-32 sm:h-32" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-display font-bold text-base sm:text-lg text-amber-600">
              Word Fun!
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-xl">
              Version 1.0
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
            Connect the Dots Word Game
          </h2>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-sky-50 border-2 border-amber-200 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>About This Game</span>
          </div>
          <p className="font-display font-bold text-2xl text-slate-900">
            Created by: Jellrey
          </p>
          <p className="text-xs font-semibold text-slate-600">
            Interactive Sentence Building &amp; Spelling Adventure for Grade 1 to Grade 6
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-display font-bold text-base shadow-lg border-b-4 border-blue-800 hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          Back to Title
        </button>
      </div>
    </div>
  );
};
