import React from 'react';
import { Flag, Sparkles } from 'lucide-react';
import { TwoPlayerVocabMode } from '../types';
import { Live2DTugOfWarScene, TeamAnimMood } from './Live2DTugOfWarScene';

interface TugOfWarArenaProps {
  team1Score: number;
  team2Score: number;
  targetScore: number;
  team1Progress: number; // 0 to 1 for current word/sentence
  team2Progress: number; // 0 to 1 for current word/sentence
  lastScorer: 1 | 2 | null;
  vocabMode: TwoPlayerVocabMode;
  isActivePlay?: boolean;
  winnerTeam?: 1 | 2 | null;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  team1Score,
  team2Score,
  targetScore,
  team1Progress,
  team2Progress,
  lastScorer,
  vocabMode,
  isActivePlay = false,
  winnerTeam = null,
}) => {
  // Negative shiftPx pulls LEFT toward Team 1; positive pulls RIGHT toward Team 2
  let shiftPx = 0;
  if (winnerTeam === 1 || team1Score >= targetScore) {
    shiftPx = -96;
  } else if (winnerTeam === 2 || team2Score >= targetScore) {
    shiftPx = 96;
  } else {
    const scorePull = ((team2Score - team1Score) / Math.max(1, targetScore)) * 84;
    const liveProgressPull = (team2Progress - team1Progress) * 18;
    const burstPull = lastScorer === 1 ? -12 : lastScorer === 2 ? 12 : 0;
    shiftPx = Math.max(-92, Math.min(92, scorePull + liveProgressPull + burstPull));
  }

  let team1Mood: TeamAnimMood = 'idle';
  let team2Mood: TeamAnimMood = 'idle';

  if (winnerTeam === 1) {
    team1Mood = 'won';
    team2Mood = 'lost';
  } else if (winnerTeam === 2) {
    team1Mood = 'lost';
    team2Mood = 'won';
  } else if (isActivePlay || lastScorer !== null) {
    const lead =
      (team1Score - team2Score) +
      (team1Progress - team2Progress) * 0.45 +
      (lastScorer === 1 ? 0.65 : lastScorer === 2 ? -0.65 : 0);

    if (lead > 0.04) {
      team1Mood = 'winning_pull';
      team2Mood = 'losing_pull';
    } else if (lead < -0.04) {
      team1Mood = 'losing_pull';
      team2Mood = 'winning_pull';
    } else {
      team1Mood = 'active_even';
      team2Mood = 'active_even';
    }
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto px-0.5 sm:px-1">
      <div className="bg-white/95 rounded-3xl px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-xl border-2 border-white grid grid-cols-[88px_1fr_88px] sm:grid-cols-[148px_1fr_148px] lg:grid-cols-[180px_1fr_180px] items-center gap-1.5 sm:gap-4">
        {/* Left: Team 1 Score Box */}
        <div
          className={`rounded-2xl px-3 py-2 border-2 transition-transform duration-200 flex flex-col justify-center ${
            lastScorer === 1 || winnerTeam === 1
              ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-300 scale-105 shadow-lg'
              : 'bg-sky-50 text-sky-950 border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="font-display font-bold text-xs sm:text-sm truncate">
              Team 1
            </span>
            {lastScorer === 1 && (
              <span className="text-[10px] font-black bg-amber-300 text-amber-950 px-1.5 py-0.5 rounded-md animate-pop-in">
                +1!
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5 tabular-nums">
            <span className="font-display font-bold text-2xl sm:text-3xl leading-none">
              {team1Score}
            </span>
            <span
              className={`text-xs font-extrabold ${
                lastScorer === 1 || winnerTeam === 1 ? 'text-sky-100' : 'text-sky-600'
              }`}
            >
              / {targetScore}
            </span>
          </div>
        </div>

        {/* Center: Live2D Tug-of-War Illustration & Expressions */}
        <div className="relative flex flex-col items-center">
          {/* Clean Unboxed Match Info Strip */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-extrabold text-slate-600 mb-1 whitespace-nowrap">
            <span>{vocabMode === 'same' ? 'Same Words' : 'Random Words'}</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-amber-700 flex items-center gap-1">
              <Flag className="w-3 h-3 inline text-amber-500" /> First to {targetScore} wins
            </span>
          </div>

          <div className="relative w-full h-[110px] sm:h-[140px] lg:h-[164px] overflow-visible bg-transparent">
            <Live2DTugOfWarScene
              shiftPx={shiftPx}
              team1Mood={team1Mood}
              team2Mood={team2Mood}
              isActivePlay={isActivePlay || lastScorer !== null}
              lastScorer={lastScorer}
              team1Score={team1Score}
              team2Score={team2Score}
            />

            {lastScorer && !winnerTeam && (
              <div
                className={`absolute top-1.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-display font-bold shadow-md flex items-center gap-1 animate-pop-in whitespace-nowrap ${
                  lastScorer === 1
                    ? 'bg-sky-600 text-white'
                    : 'bg-orange-600 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Team {lastScorer} Scores +1!</span>
              </div>
            )}

            {winnerTeam && (
              <div
                className={`absolute top-1.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-xs sm:text-sm font-display font-bold shadow-md flex items-center gap-1 animate-pop-in whitespace-nowrap ${
                  winnerTeam === 1
                    ? 'bg-sky-600 text-white'
                    : 'bg-orange-600 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Team {winnerTeam} Wins!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Team 2 Score Box */}
        <div
          className={`rounded-2xl px-3 py-2 border-2 transition-transform duration-200 flex flex-col justify-center text-right ${
            lastScorer === 2 || winnerTeam === 2
              ? 'bg-gradient-to-br from-orange-500 to-rose-600 text-white border-orange-300 scale-105 shadow-lg'
              : 'bg-orange-50 text-orange-950 border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            {lastScorer === 2 ? (
              <span className="text-[10px] font-black bg-amber-300 text-amber-950 px-1.5 py-0.5 rounded-md animate-pop-in">
                +1!
              </span>
            ) : (
              <span />
            )}
            <span className="font-display font-bold text-xs sm:text-sm truncate">
              Team 2
            </span>
          </div>
          <div className="flex items-baseline justify-end gap-1 mt-0.5 tabular-nums">
            <span className="font-display font-bold text-2xl sm:text-3xl leading-none">
              {team2Score}
            </span>
            <span
              className={`text-xs font-extrabold ${
                lastScorer === 2 || winnerTeam === 2 ? 'text-orange-100' : 'text-orange-600'
              }`}
            >
              / {targetScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
