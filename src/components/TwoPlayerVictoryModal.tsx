import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Home, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';
import { FullscreenButton } from './FullscreenButton';

interface TwoPlayerVictoryModalProps {
  winnerTeam: 1 | 2 | null;
  team1Score: number;
  team2Score: number;
  targetScore: number;
  onPlayAgain: () => void;
  onGoToTitleScreen: () => void;
}

export const TwoPlayerVictoryModal: React.FC<TwoPlayerVictoryModalProps> = ({
  winnerTeam,
  team1Score,
  team2Score,
  targetScore,
  onPlayAgain,
  onGoToTitleScreen,
}) => {
  const [trophyError, setTrophyError] = useState(false);

  useEffect(() => {
    if (!winnerTeam) return;
    sound.playWinningFanfare();

    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.55 },
        colors:
          winnerTeam === 1
            ? ['#0EA5E9', '#38BDF8', '#FACC15', '#FFFFFF']
            : ['#F97316', '#FB7185', '#FACC15', '#FFFFFF'],
      });
    } catch {
      // Ignore confetti fallback
    }

    const speakTimer = setTimeout(() => {
      sound.speak(`Congratulations! Team ${winnerTeam} wins the tug of war!`);
    }, 1600);

    return () => {
      clearTimeout(speakTimer);
    };
  }, [winnerTeam]);

  if (!winnerTeam) return null;

  const isTeam1 = winnerTeam === 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-4 bg-slate-900/65 overflow-y-auto touch-auto">
      <div
        className={`relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 text-center space-y-5 animate-pop-in my-auto shrink-0 ${
          isTeam1 ? 'border-sky-300' : 'border-orange-300'
        }`}
      >
        <div className="absolute top-3.5 right-3.5 z-10">
          <FullscreenButton variant="modalCorner" />
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <div
            className={`relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg flex items-center justify-center ${
              isTeam1 ? 'bg-sky-50 border-sky-300' : 'bg-orange-50 border-orange-300'
            }`}
          >
            {!trophyError ? (
              <img
                src="/src/assets/images/reward_trophy_badge_1794674397774.jpg"
                alt="Championship Trophy"
                referrerPolicy="no-referrer"
                onError={() => setTrophyError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Trophy
                className={`w-12 h-12 ${isTeam1 ? 'text-sky-500' : 'text-orange-500'}`}
              />
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
              isTeam1 ? 'bg-sky-100 text-sky-800' : 'bg-orange-100 text-orange-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tug of War Champion</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Team {winnerTeam} Wins!
          </h2>
          <p className="text-sm font-bold text-slate-600">
            Reached the target score of {targetScore} first!
          </p>
        </div>

        {/* Final Scoreboard */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div
            className={`p-3 rounded-2xl border-2 ${
              isTeam1
                ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                : 'bg-sky-50 text-sky-900 border-sky-200'
            }`}
          >
            <div className="text-xs font-extrabold">Team 1</div>
            <div className="font-display font-bold text-3xl tabular-nums mt-0.5">
              {team1Score}
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border-2 ${
              !isTeam1
                ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                : 'bg-orange-50 text-orange-900 border-orange-200'
            }`}
          >
            <div className="text-xs font-extrabold">Team 2</div>
            <div className="font-display font-bold text-3xl tabular-nums mt-0.5">
              {team2Score}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-bold text-base shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onGoToTitleScreen}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-display font-bold text-base hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Home className="w-5 h-5" />
            <span>Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
