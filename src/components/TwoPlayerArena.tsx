import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Home,
  Music,
  RotateCcw,
  Settings as SettingsIcon,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DotNode, GameItem, GameSettings, InteractionMode, ModeConfig } from '../types';
import { CANDY_COLORS, extractTokens, generateDotNodes } from '../utils/gameUtils';
import { sound } from '../utils/audio';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { GameBoard } from './GameBoard';
import { SentenceTray, SlotAuditStatus } from './SentenceTray';
import { TugOfWarArena } from './TugOfWarArena';
import { TwoPlayerVictoryModal } from './TwoPlayerVictoryModal';
import { FullscreenButton } from './FullscreenButton';

interface TeamPuzzleState {
  item: GameItem;
  tokens: string[];
  nodes: DotNode[];
  selectedNodeIds: string[];
  auditResults: SlotAuditStatus[] | null;
}

interface TwoPlayerArenaProps {
  settings: GameSettings;
  activeModeConfig: ModeConfig;
  selectedFolderName: string;
  filteredItems: GameItem[];
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenSettings: () => void;
  onGoToTitleScreen: () => void;
}

function createTeamState(item: GameItem): TeamPuzzleState {
  const tokens = extractTokens(item);
  return {
    item,
    tokens,
    nodes: generateDotNodes(tokens),
    selectedNodeIds: [],
    auditResults: null,
  };
}

function pickRandomItem(pool: GameItem[], excludeIds: string[]): GameItem {
  if (pool.length <= 1) return pool[0];
  const candidates = pool.filter(it => !excludeIds.includes(it.id));
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export const TwoPlayerArena: React.FC<TwoPlayerArenaProps> = ({
  settings,
  activeModeConfig,
  selectedFolderName,
  filteredItems,
  onUpdateSettings,
  onOpenSettings,
  onGoToTitleScreen,
}) => {
  const { vocabMode, targetScore } = settings.twoPlayerConfig;

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Step, setTeam1Step] = useState(0);
  const [team2Step, setTeam2Step] = useState(0);
  const [team1Advancing, setTeam1Advancing] = useState(false);
  const [team2Advancing, setTeam2Advancing] = useState(false);
  const [team1InteractionMode, setTeam1InteractionMode] = useState<InteractionMode>(
    settings.interactionMode
  );
  const [team2InteractionMode, setTeam2InteractionMode] = useState<InteractionMode>(
    settings.interactionMode
  );
  const [lastScorer, setLastScorer] = useState<1 | 2 | null>(null);
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);
  const [isActivePlay, setIsActivePlay] = useState(false);

  // Sync default control style if changed in Options
  useEffect(() => {
    setTeam1InteractionMode(settings.interactionMode);
    setTeam2InteractionMode(settings.interactionMode);
  }, [settings.interactionMode]);

  const [team1State, setTeam1State] = useState<TeamPuzzleState | null>(() => {
    if (filteredItems.length === 0) return null;
    return createTeamState(filteredItems[0]);
  });

  const [team2State, setTeam2State] = useState<TeamPuzzleState | null>(() => {
    if (filteredItems.length === 0) return null;
    if (vocabMode === 'same') {
      return createTeamState(filteredItems[0]);
    }
    const second = pickRandomItem(filteredItems, [filteredItems[0].id]);
    return createTeamState(second);
  });

  // Independent per-team timer & latest-value refs (prevents stale state or cross-team timer cancellation)
  const team1TimerRef = useRef<number | null>(null);
  const team2TimerRef = useRef<number | null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const scorerTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const team1ScoreRef = useRef(0);
  const team2ScoreRef = useRef(0);
  const team1StepRef = useRef(0);
  const team2StepRef = useRef(0);
  const team1AdvancingRef = useRef(false);
  const team2AdvancingRef = useRef(false);
  const matchWinnerRef = useRef<1 | 2 | null>(null);
  const prevItemsRef = useRef<{ t1?: string; t2?: string }>({});

  const clearAllTimers = useCallback(() => {
    if (team1TimerRef.current !== null) {
      clearTimeout(team1TimerRef.current);
      team1TimerRef.current = null;
    }
    if (team2TimerRef.current !== null) {
      clearTimeout(team2TimerRef.current);
      team2TimerRef.current = null;
    }
    if (matchTimerRef.current !== null) {
      clearTimeout(matchTimerRef.current);
      matchTimerRef.current = null;
    }
    if (scorerTimerRef.current !== null) {
      clearTimeout(scorerTimerRef.current);
      scorerTimerRef.current = null;
    }
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const markActivity = useCallback(() => {
    setIsActivePlay(true);
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsActivePlay(false);
      idleTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const dealFreshMatch = useCallback(() => {
    if (filteredItems.length === 0) {
      team1ScoreRef.current = 0;
      team2ScoreRef.current = 0;
      team1StepRef.current = 0;
      team2StepRef.current = 0;
      team1AdvancingRef.current = false;
      team2AdvancingRef.current = false;
      matchWinnerRef.current = null;
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Step(0);
      setTeam2Step(0);
      setTeam1Advancing(false);
      setTeam2Advancing(false);
      setLastScorer(null);
      setMatchWinner(null);
      setIsActivePlay(false);
      setTeam1State(null);
      setTeam2State(null);
      return;
    }

    let item1: GameItem;
    let item2: GameItem;

    if (vocabMode === 'same') {
      item1 = filteredItems[0];
      item2 = filteredItems[0];
    } else {
      item1 = pickRandomItem(filteredItems, []);
      item2 = pickRandomItem(filteredItems, [item1.id]);
    }

    prevItemsRef.current = { t1: item1.id, t2: item2.id };
    team1ScoreRef.current = 0;
    team2ScoreRef.current = 0;
    team1StepRef.current = 0;
    team2StepRef.current = 0;
    team1AdvancingRef.current = false;
    team2AdvancingRef.current = false;
    matchWinnerRef.current = null;

    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1Step(0);
    setTeam2Step(0);
    setTeam1Advancing(false);
    setTeam2Advancing(false);
    setLastScorer(null);
    setMatchWinner(null);
    setIsActivePlay(false);
    setTeam1State(createTeamState(item1));
    setTeam2State(createTeamState(item2));
  }, [filteredItems, vocabMode]);

  const dealNextForTeam = useCallback(
    (team: 1 | 2) => {
      if (filteredItems.length === 0) return;

      if (team === 1) {
        const nextStep = team1StepRef.current + 1;
        team1StepRef.current = nextStep;
        setTeam1Step(nextStep);

        const nextItem =
          vocabMode === 'same'
            ? filteredItems[nextStep % filteredItems.length]
            : pickRandomItem(
                filteredItems,
                prevItemsRef.current.t1 ? [prevItemsRef.current.t1] : []
              );

        prevItemsRef.current.t1 = nextItem.id;
        team1AdvancingRef.current = false;
        setTeam1Advancing(false);
        setTeam1State(createTeamState(nextItem));
      } else {
        const nextStep = team2StepRef.current + 1;
        team2StepRef.current = nextStep;
        setTeam2Step(nextStep);

        const nextItem =
          vocabMode === 'same'
            ? filteredItems[nextStep % filteredItems.length]
            : pickRandomItem(
                filteredItems,
                prevItemsRef.current.t2 ? [prevItemsRef.current.t2] : []
              );

        prevItemsRef.current.t2 = nextItem.id;
        team2AdvancingRef.current = false;
        setTeam2Advancing(false);
        setTeam2State(createTeamState(nextItem));
      }
    },
    [filteredItems, vocabMode]
  );

  // Reset match cleanly when folder or vocab mode changes
  useEffect(() => {
    clearAllTimers();
    dealFreshMatch();
  }, [
    settings.selectedFolderId,
    vocabMode,
    clearAllTimers,
    dealFreshMatch,
  ]);

  // Pre-warm Team 1 & Team 2 puzzle speech for instant Android & Studio Voice playback
  useEffect(() => {
    if (!settings.voiceEnabled) return;
    if (team1State?.item.text) sound.prefetchSpeech(team1State.item.text);
    if (team2State?.item.text) sound.prefetchSpeech(team2State.item.text);
  }, [settings.voiceEnabled, settings.voiceName, team1State?.item.text, team2State?.item.text]);

  const handleRestartMatch = useCallback(() => {
    clearAllTimers();
    sound.playClick();
    dealFreshMatch();
  }, [clearAllTimers, dealFreshMatch]);

  const handleSkipBoth = () => {
    if (matchWinnerRef.current !== null) return;
    clearAllTimers();
    sound.playClick();
    dealNextForTeam(1);
    dealNextForTeam(2);
  };

  const makeTeamHandlers = (team: 1 | 2) => {
    const state = team === 1 ? team1State : team2State;
    const setState = team === 1 ? setTeam1State : setTeam2State;
    const isTeamAdvancing = team === 1 ? team1Advancing : team2Advancing;
    const isLocked = isTeamAdvancing || matchWinner !== null;

    const onToggleNode = (nodeId: string, clientX: number, clientY: number) => {
      if (isLocked) return;
      markActivity();
      setState(prev => {
        if (!prev) return prev;
        const existingIdx = prev.selectedNodeIds.indexOf(nodeId);
        if (existingIdx !== -1) {
          sound.playDisconnect();
          return {
            ...prev,
            auditResults: null,
            selectedNodeIds: prev.selectedNodeIds.filter(id => id !== nodeId),
          };
        }
        if (prev.selectedNodeIds.length >= prev.tokens.length) {
          return prev;
        }
        const node = prev.nodes.find(n => n.id === nodeId);
        const color = node ? CANDY_COLORS[node.colorIndex].hex : '#FBBF24';
        sound.playConnect(prev.selectedNodeIds.length);
        triggerBackdropBurst(clientX, clientY, color, 10);
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: [...prev.selectedNodeIds, nodeId],
        };
      });
    };

    const onConnectNode = (nodeId: string, clientX: number, clientY: number) => {
      if (isLocked) return;
      markActivity();
      setState(prev => {
        if (!prev) return prev;
        if (prev.selectedNodeIds.includes(nodeId) || prev.selectedNodeIds.length >= prev.tokens.length) {
          return prev;
        }
        const node = prev.nodes.find(n => n.id === nodeId);
        const color = node ? CANDY_COLORS[node.colorIndex].hex : '#FBBF24';
        sound.playConnect(prev.selectedNodeIds.length);
        triggerBackdropBurst(clientX, clientY, color, 10);
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: [...prev.selectedNodeIds, nodeId],
        };
      });
    };

    const onDisconnectLast = () => {
      if (isLocked) return;
      markActivity();
      sound.playDisconnect();
      setState(prev => {
        if (!prev || prev.selectedNodeIds.length === 0) return prev;
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: prev.selectedNodeIds.slice(0, -1),
        };
      });
    };

    const onMoveNode = (nodeId: string, xPct: number, yPct: number) => {
      if (!isLocked) {
        markActivity();
      }
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(n => (n.id === nodeId ? { ...n, x: xPct, y: yPct } : n)),
        };
      });
    };

    const onRemoveAtSlot = (slotIndex: number) => {
      if (isLocked) return;
      markActivity();
      sound.playDisconnect();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: prev.selectedNodeIds.filter((_, idx) => idx !== slotIndex),
        };
      });
    };

    const onReset = () => {
      if (isLocked) return;
      markActivity();
      sound.playClick();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: [],
        };
      });
    };

    const onCheckAnswer = () => {
      const alreadyAdvancing =
        team === 1 ? team1AdvancingRef.current : team2AdvancingRef.current;
      if (
        matchWinnerRef.current !== null ||
        alreadyAdvancing ||
        !state ||
        state.selectedNodeIds.length < state.tokens.length
      ) {
        return;
      }
      markActivity();
      sound.unlock(true);

      const nodeMap = new Map(state.nodes.map(n => [n.id, n]));
      const slotStatuses: SlotAuditStatus[] = state.selectedNodeIds.map((id, idx) => {
        const node = nodeMap.get(id);
        if (!node) return 'wrong';
        return node.text === state.tokens[idx] ? 'correct' : 'wrong';
      });

      const isAllCorrect = slotStatuses.every(s => s === 'correct');
      setState(prev => (prev ? { ...prev, auditResults: slotStatuses } : prev));

      if (!isAllCorrect) {
        sound.playTryAgain();
        return;
      }

      // This team solved their task! Score +1 immediately and advance ONLY this team to the next set of words
      sound.playAuditCheck();

      if (team === 1) {
        team1AdvancingRef.current = true;
        setTeam1Advancing(true);
      } else {
        team2AdvancingRef.current = true;
        setTeam2Advancing(true);
      }

      const nextScore =
        team === 1 ? team1ScoreRef.current + 1 : team2ScoreRef.current + 1;
      if (team === 1) {
        team1ScoreRef.current = nextScore;
        setTeam1Score(nextScore);
      } else {
        team2ScoreRef.current = nextScore;
        setTeam2Score(nextScore);
      }

      // Flash "+1!" highlight on the Tug-of-War scoreboard
      setLastScorer(team);
      if (scorerTimerRef.current !== null) {
        clearTimeout(scorerTimerRef.current);
      }
      scorerTimerRef.current = window.setTimeout(() => {
        setLastScorer(null);
      }, 1050);

      // First team to reach targetScore wins the match!
      if (nextScore >= targetScore) {
        matchWinnerRef.current = team;
        clearAllTimers();
        sound.prefetchSpeech(`Congratulations! Team ${team} wins the tug of war!`);
        matchTimerRef.current = window.setTimeout(() => {
          setMatchWinner(team);
        }, 620);
        return;
      }

      // Advance ONLY the winning team to their next set of words; the other side keeps their current words untouched!
      if (team === 1) {
        if (team1TimerRef.current !== null) clearTimeout(team1TimerRef.current);
        team1TimerRef.current = window.setTimeout(() => {
          dealNextForTeam(1);
        }, 650);
      } else {
        if (team2TimerRef.current !== null) clearTimeout(team2TimerRef.current);
        team2TimerRef.current = window.setTimeout(() => {
          dealNextForTeam(2);
        }, 650);
      }
    };

    return {
      onToggleNode,
      onConnectNode,
      onDisconnectLast,
      onMoveNode,
      onRemoveAtSlot,
      onReset,
      onCheckAnswer,
    };
  };

  const t1Handlers = makeTeamHandlers(1);
  const t2Handlers = makeTeamHandlers(2);

  const t1Progress =
    team1State && team1State.tokens.length > 0
      ? team1State.selectedNodeIds.length / team1State.tokens.length
      : 0;
  const t2Progress =
    team2State && team2State.tokens.length > 0
      ? team2State.selectedNodeIds.length / team2State.tokens.length
      : 0;

  return (
    <div className="relative z-10 w-full min-h-dvh gameplay-fit-tall flex flex-col justify-between p-2 sm:p-3 gap-2">
      {/* Top Two-Player HUD */}
      <header className="w-full max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-2 px-1 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToTitleScreen}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-sky-50 text-slate-800 shadow-md border-2 border-white hover:border-sky-200 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap"
            title="Go to Title Screen"
          >
            <Home className="w-4 h-4 text-sky-600 transition-transform duration-150 group-hover:scale-110" />
            <span className="hidden sm:inline">Title</span>
          </button>

          <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-md border border-white text-xs font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
            <span className="text-sky-700 truncate max-w-[200px] sm:max-w-[340px]">
              {selectedFolderName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleSkipBoth}
            disabled={matchWinner !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-700 font-bold text-xs shadow-md border border-white hover:border-amber-200 transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
            title="Deal New Words to Both Teams"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Skip Both</span>
          </button>

          <button
            type="button"
            onClick={handleRestartMatch}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 hover:bg-rose-50 text-slate-700 font-bold text-xs shadow-md border border-white hover:border-rose-200 transition-all cursor-pointer whitespace-nowrap"
            title="Restart Two Players Match (0-0)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Reset Score</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.playClick();
              onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
            }}
            className={`group p-2 rounded-2xl shadow-md border border-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer ${
              settings.musicEnabled
                ? 'bg-violet-500 hover:bg-violet-600 text-white'
                : 'bg-white/95 hover:bg-white text-slate-400'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              const next = !settings.sfxEnabled;
              if (next) {
                sound.sfxEnabled = true;
                sound.playClick();
              }
              onUpdateSettings({ ...settings, sfxEnabled: next });
            }}
            className="group p-2 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 shadow-md border border-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            title="Toggle Sound Effects"
          >
            {settings.sfxEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md border border-white hover:border-amber-200 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap"
            title="Options & Settings"
          >
            <SettingsIcon className="w-4 h-4 text-sky-600 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden sm:inline">Options</span>
          </button>

          <FullscreenButton variant="hud" />
        </div>
      </header>

      {/* Tug-of-War Live2D Animated Classroom Illustration & Scoreboard */}
      <TugOfWarArena
        team1Score={team1Score}
        team2Score={team2Score}
        targetScore={targetScore}
        team1Progress={t1Progress}
        team2Progress={t2Progress}
        lastScorer={lastScorer}
        vocabMode={vocabMode}
        isActivePlay={isActivePlay}
        winnerTeam={matchWinner}
      />

      {/* Split-Screen Arena: Team 1 (Left) vs Team 2 (Right) */}
      {filteredItems.length === 0 ? (
        <main className="w-full max-w-[1720px] mx-auto flex-1 flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-3xl shadow-xl border-2 border-white p-6 sm:p-8 max-w-md w-full text-center space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              No Items in "{selectedFolderName}"
            </h2>
            <p className="text-sm font-semibold text-slate-600">
              Open Options to add words or sentences to this folder or pick another folder.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow cursor-pointer"
              >
                Open Options
              </button>
              <button
                type="button"
                onClick={onGoToTitleScreen}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
              >
                Title Screen
              </button>
            </div>
          </div>
        </main>
      ) : (
      <main className="w-full max-w-[1720px] mx-auto flex-1 tall-min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 relative">
        {/* Team 1 Half */}
        <section
          aria-label="Team 1 Play Area"
          className="flex flex-col gap-2 min-h-[340px] tall-min-h-0 h-full"
        >
          {team1State && (
            <>
              <SentenceTray
                item={team1State.item}
                tokens={team1State.tokens}
                selectedNodeIds={team1State.selectedNodeIds}
                nodes={team1State.nodes}
                auditResults={team1State.auditResults}
                interactionMode={team1InteractionMode}
                onChangeInteractionMode={setTeam1InteractionMode}
                onRemoveAtSlot={t1Handlers.onRemoveAtSlot}
                onCheckAnswer={t1Handlers.onCheckAnswer}
                onReset={t1Handlers.onReset}
                compact
                section="slots"
                teamLabel={`Team 1 · #${team1Step + 1}`}
                teamAccent="blue"
                statusBanner={
                  team1Advancing
                    ? { tone: 'won', text: 'Correct! +1 Point · Next words coming up...' }
                    : null
                }
                disabled={team1Advancing || matchWinner !== null}
              />
              <GameBoard
                item={team1State.item}
                nodes={team1State.nodes}
                selectedNodeIds={team1State.selectedNodeIds}
                auditResults={team1State.auditResults}
                modeConfig={activeModeConfig}
                interactionMode={team1InteractionMode}
                onToggleNode={t1Handlers.onToggleNode}
                onConnectNode={t1Handlers.onConnectNode}
                onDisconnectLast={t1Handlers.onDisconnectLast}
                onMoveNode={t1Handlers.onMoveNode}
                compact
                teamAccent="blue"
                disabled={team1Advancing || matchWinner !== null}
              />
              <SentenceTray
                item={team1State.item}
                tokens={team1State.tokens}
                selectedNodeIds={team1State.selectedNodeIds}
                nodes={team1State.nodes}
                auditResults={team1State.auditResults}
                interactionMode={team1InteractionMode}
                onChangeInteractionMode={setTeam1InteractionMode}
                onRemoveAtSlot={t1Handlers.onRemoveAtSlot}
                onCheckAnswer={t1Handlers.onCheckAnswer}
                onReset={t1Handlers.onReset}
                compact
                section="controls"
                teamLabel={`Team 1 · #${team1Step + 1}`}
                teamAccent="blue"
                disabled={team1Advancing || matchWinner !== null}
              />
            </>
          )}
        </section>

        {/* Team 2 Half */}
        <section
          aria-label="Team 2 Play Area"
          className="flex flex-col gap-2 min-h-[340px] tall-min-h-0 h-full"
        >
          {team2State && (
            <>
              <SentenceTray
                item={team2State.item}
                tokens={team2State.tokens}
                selectedNodeIds={team2State.selectedNodeIds}
                nodes={team2State.nodes}
                auditResults={team2State.auditResults}
                interactionMode={team2InteractionMode}
                onChangeInteractionMode={setTeam2InteractionMode}
                onRemoveAtSlot={t2Handlers.onRemoveAtSlot}
                onCheckAnswer={t2Handlers.onCheckAnswer}
                onReset={t2Handlers.onReset}
                compact
                section="slots"
                teamLabel={`Team 2 · #${team2Step + 1}`}
                teamAccent="coral"
                statusBanner={
                  team2Advancing
                    ? { tone: 'won', text: 'Correct! +1 Point · Next words coming up...' }
                    : null
                }
                disabled={team2Advancing || matchWinner !== null}
              />
              <GameBoard
                item={team2State.item}
                nodes={team2State.nodes}
                selectedNodeIds={team2State.selectedNodeIds}
                auditResults={team2State.auditResults}
                modeConfig={activeModeConfig}
                interactionMode={team2InteractionMode}
                onToggleNode={t2Handlers.onToggleNode}
                onConnectNode={t2Handlers.onConnectNode}
                onDisconnectLast={t2Handlers.onDisconnectLast}
                onMoveNode={t2Handlers.onMoveNode}
                compact
                teamAccent="coral"
                disabled={team2Advancing || matchWinner !== null}
              />
              <SentenceTray
                item={team2State.item}
                tokens={team2State.tokens}
                selectedNodeIds={team2State.selectedNodeIds}
                nodes={team2State.nodes}
                auditResults={team2State.auditResults}
                interactionMode={team2InteractionMode}
                onChangeInteractionMode={setTeam2InteractionMode}
                onRemoveAtSlot={t2Handlers.onRemoveAtSlot}
                onCheckAnswer={t2Handlers.onCheckAnswer}
                onReset={t2Handlers.onReset}
                compact
                section="controls"
                teamLabel={`Team 2 · #${team2Step + 1}`}
                teamAccent="coral"
                disabled={team2Advancing || matchWinner !== null}
              />
            </>
          )}
        </section>
      </main>
      )}

      {/* Match Winner Celebration Modal */}
      <TwoPlayerVictoryModal
        winnerTeam={matchWinner}
        team1Score={team1Score}
        team2Score={team2Score}
        targetScore={targetScore}
        onPlayAgain={handleRestartMatch}
        onGoToTitleScreen={onGoToTitleScreen}
      />
    </div>
  );
};
