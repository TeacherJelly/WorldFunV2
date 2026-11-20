import React from 'react';
import { Flag, Sparkles } from 'lucide-react';
import { TwoPlayerVocabMode } from '../types';

interface TugOfWarArenaProps {
  team1Score: number;
  team2Score: number;
  targetScore: number;
  team1Progress: number; // 0 to 1 for current word/sentence
  team2Progress: number; // 0 to 1 for current word/sentence
  lastScorer: 1 | 2 | null;
  vocabMode: TwoPlayerVocabMode;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  team1Score,
  team2Score,
  targetScore,
  team1Progress,
  team2Progress,
  lastScorer,
  vocabMode,
}) => {
  // Negative shiftPx pulls LEFT toward Team 1; positive pulls RIGHT toward Team 2
  let shiftPx = 0;
  if (team1Score >= targetScore) {
    shiftPx = -132;
  } else if (team2Score >= targetScore) {
    shiftPx = 132;
  } else {
    const scorePull = ((team2Score - team1Score) / Math.max(1, targetScore)) * 116;
    const liveProgressPull = (team2Progress - team1Progress) * 20;
    const burstPull = lastScorer === 1 ? -14 : lastScorer === 2 ? 14 : 0;
    shiftPx = Math.max(-124, Math.min(124, scorePull + liveProgressPull + burstPull));
  }

  const team1PullingHard = lastScorer === 1 || team1Progress > team2Progress || team1Score > team2Score;
  const team2PullingHard = lastScorer === 2 || team2Progress > team1Progress || team2Score > team1Score;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-0.5 sm:px-1">
      <div className="bg-white/95 rounded-3xl px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-xl border-2 border-white grid grid-cols-[88px_1fr_88px] sm:grid-cols-[148px_1fr_148px] lg:grid-cols-[180px_1fr_180px] items-center gap-1.5 sm:gap-4">
        {/* Left: Team 1 Score Box */}
        <div
          className={`rounded-2xl px-3 py-2 border-2 transition-transform duration-200 flex flex-col justify-center ${
            lastScorer === 1
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
                lastScorer === 1 ? 'text-sky-100' : 'text-sky-600'
              }`}
            >
              / {targetScore}
            </span>
          </div>
        </div>

        {/* Center: Dynamic Cartoon Tug-of-War Illustration */}
        <div className="relative flex flex-col items-center">
          {/* Clean Unboxed Match Info Strip */}
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-600 mb-1 whitespace-nowrap">
            <span>{vocabMode === 'same' ? 'Same Words' : 'Random Words'}</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-amber-700 flex items-center gap-1">
              <Flag className="w-3 h-3 inline text-amber-500" /> First to {targetScore} wins
            </span>
          </div>

          <div className="relative w-full h-[68px] sm:h-[82px] rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100">
            <svg
              viewBox="0 0 640 110"
              preserveAspectRatio="xMidYMid meet"
              aria-label={`Tug of war progress: Team 1 has ${team1Score} points, Team 2 has ${team2Score} points`}
              className="w-full h-full block"
            >
              {/* Distant Soft Hills & Sun */}
              <circle cx="320" cy="24" r="16" fill="#FDE047" opacity="0.85" />
              <path
                d="M0 84 Q160 66 320 82 Q480 68 640 84 L640 110 L0 110 Z"
                fill="#86EFAC"
              />
              <rect x="0" y="84" width="640" height="26" fill="#4ADE80" />

              {/* Left Team 1 Goal Zone & Flag */}
              <rect x="0" y="84" width="110" height="26" fill="#38BDF8" opacity="0.28" />
              <line x1="110" y1="78" x2="110" y2="110" stroke="#0284C7" strokeWidth="3" strokeDasharray="4 3" />
              <g transform="translate(86, 46)">
                <rect x="0" y="0" width="4" height="44" rx="2" fill="#0369A1" />
                <path d="M4 2 L32 10 L4 20 Z" fill="#0EA5E9" />
              </g>

              {/* Center Chalk Line */}
              <line x1="320" y1="74" x2="320" y2="110" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="5 4" />
              <circle cx="320" cy="88" r="4" fill="#FFFFFF" />

              {/* Right Team 2 Goal Zone & Flag */}
              <rect x="530" y="84" width="110" height="26" fill="#FB923C" opacity="0.28" />
              <line x1="530" y1="78" x2="530" y2="110" stroke="#EA580C" strokeWidth="3" strokeDasharray="4 3" />
              <g transform="translate(550, 46)">
                <rect x="0" y="0" width="4" height="44" rx="2" fill="#9A3412" />
                <path d="M0 2 L-28 10 L0 20 Z" fill="#F97316" />
              </g>

              {/* Moving Rope + Teams Group (GPU-composited transform only) */}
              <g
                style={{
                  transform: `translate3d(${shiftPx}px, 0, 0)`,
                  transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {/* Braided Cartoon Tug Rope */}
                <line
                  x1="138"
                  y1="66"
                  x2="502"
                  y2="66"
                  stroke="#92400E"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1="140"
                  y1="66"
                  x2="500"
                  y2="66"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="7 6"
                  strokeLinecap="round"
                />

                {/* Center Red Ribbon Knot */}
                <g transform="translate(320, 66)">
                  <path d="M0 0 L-9 22 L0 17 L9 22 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="6" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
                </g>

                {/* TEAM 1 CARTOON CHARACTERS (Blue - Pulling Left) */}
                {/* Character 1A (Anchor on left) */}
                <g
                  style={{
                    transformOrigin: '176px 88px',
                    transform: team1PullingHard
                      ? lastScorer === 1
                        ? 'rotate(-13deg) translate3d(0, -4px, 0)'
                        : 'rotate(-10deg)'
                      : 'rotate(-4deg)',
                    transition: 'transform 260ms ease-out',
                  }}
                >
                  {/* Legs */}
                  <path d="M174 75 L162 90" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M180 75 L188 90" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                  {/* Shoes */}
                  <ellipse cx="160" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <ellipse cx="189" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  {/* Blue Jersey Torso */}
                  <rect x="166" y="48" width="22" height="28" rx="9" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
                  {/* Head */}
                  <circle cx="176" cy="34" r="13" fill="#FDE68A" stroke="#D97706" strokeWidth="1.8" />
                  {/* Blue Cap */}
                  <path d="M163 30 Q176 16 189 30 Z" fill="#0284C7" />
                  <path d="M158 30 L176 30" stroke="#0369A1" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Cheerful Eye & Smile */}
                  <circle cx="172" cy="34" r="1.8" fill="#1E293B" />
                  <path d="M170 39 Q174 42 178 39" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Arms gripping rope */}
                  <path d="M178 56 L196 65" stroke="#FDE68A" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="196" cy="66" r="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
                </g>

                {/* Character 1B (Front puller) */}
                <g
                  style={{
                    transformOrigin: '234px 88px',
                    transform: team1PullingHard
                      ? lastScorer === 1
                        ? 'rotate(-14deg) translate3d(0, -5px, 0)'
                        : 'rotate(-11deg)'
                      : 'rotate(-5deg)',
                    transition: 'transform 260ms ease-out',
                  }}
                >
                  <path d="M232 75 L220 90" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M238 75 L246 90" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                  <ellipse cx="218" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <ellipse cx="247" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <rect x="224" y="48" width="22" height="28" rx="9" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                  <circle cx="234" cy="34" r="13" fill="#FED7AA" stroke="#C2410C" strokeWidth="1.8" />
                  {/* Cartoon Hair */}
                  <path d="M222 29 Q234 16 246 29 Q240 23 234 25 Q227 23 222 29 Z" fill="#451A03" />
                  <circle cx="230" cy="34" r="1.8" fill="#1E293B" />
                  <path d="M228 39 Q232 42 236 39" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M238 56 L256 65" stroke="#FED7AA" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="256" cy="66" r="4" fill="#FED7AA" stroke="#C2410C" strokeWidth="1.2" />
                </g>

                {/* TEAM 2 CARTOON CHARACTERS (Coral/Orange - Pulling Right) */}
                {/* Character 2A (Front puller) */}
                <g
                  style={{
                    transformOrigin: '406px 88px',
                    transform: team2PullingHard
                      ? lastScorer === 2
                        ? 'rotate(14deg) translate3d(0, -5px, 0)'
                        : 'rotate(11deg)'
                      : 'rotate(5deg)',
                    transition: 'transform 260ms ease-out',
                  }}
                >
                  <path d="M402 75 L394 90" stroke="#7C2D12" strokeWidth="6" strokeLinecap="round" />
                  <path d="M408 75 L420 90" stroke="#7C2D12" strokeWidth="6" strokeLinecap="round" />
                  <ellipse cx="393" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
                  <ellipse cx="422" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
                  <rect x="394" y="48" width="22" height="28" rx="9" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
                  <circle cx="406" cy="34" r="13" fill="#FDE68A" stroke="#D97706" strokeWidth="1.8" />
                  <path d="M394 29 Q406 16 418 29 Q412 22 406 25 Q400 22 394 29 Z" fill="#78350F" />
                  <circle cx="410" cy="34" r="1.8" fill="#1E293B" />
                  <path d="M402 39 Q406 42 410 39" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M402 56 L384 65" stroke="#FDE68A" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="384" cy="66" r="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
                </g>

                {/* Character 2B (Anchor on right) */}
                <g
                  style={{
                    transformOrigin: '464px 88px',
                    transform: team2PullingHard
                      ? lastScorer === 2
                        ? 'rotate(13deg) translate3d(0, -4px, 0)'
                        : 'rotate(10deg)'
                      : 'rotate(4deg)',
                    transition: 'transform 260ms ease-out',
                  }}
                >
                  <path d="M460 75 L452 90" stroke="#7C2D12" strokeWidth="6" strokeLinecap="round" />
                  <path d="M466 75 L478 90" stroke="#7C2D12" strokeWidth="6" strokeLinecap="round" />
                  <ellipse cx="451" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
                  <ellipse cx="480" cy="91" rx="6" ry="3.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
                  <rect x="452" y="48" width="22" height="28" rx="9" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
                  <circle cx="464" cy="34" r="13" fill="#FED7AA" stroke="#C2410C" strokeWidth="1.8" />
                  {/* Coral Cap */}
                  <path d="M451 30 Q464 16 477 30 Z" fill="#EA580C" />
                  <path d="M464 30 L482 30" stroke="#C2410C" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="468" cy="34" r="1.8" fill="#1E293B" />
                  <path d="M460 39 Q464 42 468 39" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M460 56 L442 65" stroke="#FED7AA" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="442" cy="66" r="4" fill="#FED7AA" stroke="#C2410C" strokeWidth="1.2" />
                </g>

                {/* Celebration Stars on Point Score */}
                {lastScorer === 1 && (
                  <g fill="#FACC15" stroke="#D97706" strokeWidth="1.2">
                    <polygon points="154,18 157,24 163,25 158,29 159,35 154,32 149,35 150,29 145,25 151,24" />
                    <polygon points="254,14 256,19 261,20 257,23 258,28 254,25 250,28 251,23 247,20 252,19" />
                  </g>
                )}
                {lastScorer === 2 && (
                  <g fill="#FACC15" stroke="#D97706" strokeWidth="1.2">
                    <polygon points="388,14 390,19 395,20 391,23 392,28 388,25 384,28 385,23 381,20 386,19" />
                    <polygon points="486,18 489,24 495,25 490,29 491,35 486,32 481,35 482,29 477,25 483,24" />
                  </g>
                )}
              </g>
            </svg>

            {lastScorer && (
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
          </div>
        </div>

        {/* Right: Team 2 Score Box */}
        <div
          className={`rounded-2xl px-3 py-2 border-2 transition-transform duration-200 flex flex-col justify-center text-right ${
            lastScorer === 2
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
                lastScorer === 2 ? 'text-orange-100' : 'text-orange-600'
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
