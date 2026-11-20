/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Home,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Music,
  Shuffle,
} from 'lucide-react';
import { DotNode, GameItem, GameSettings } from './types';
import {
  loadItems,
  loadSettings,
  saveItems,
  saveSettings,
} from './utils/storage';
import {
  CANDY_COLORS,
  GRADE_META,
  extractTokens,
  filterItems,
  generateDotNodes,
  getNextUnitOrGrade,
} from './utils/gameUtils';
import { sound } from './utils/audio';
import { DynamicBackdrop, triggerBackdropBurst } from './components/DynamicBackdrop';
import { TitleMenuStep, TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { SentenceTray, SlotAuditStatus } from './components/SentenceTray';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { TwoPlayerArena } from './components/TwoPlayerArena';
import { AboutModal } from './components/AboutModal';

export default function App() {
  const [items, setItems] = useState<GameItem[]>(() => loadItems());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  const [gameStage, setGameStage] = useState<'title' | 'playing'>('title');
  const [titleMenuStep, setTitleMenuStep] = useState<TitleMenuStep>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Active Puzzle State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nodes, setNodes] = useState<DotNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [auditResults, setAuditResults] = useState<SlotAuditStatus[] | null>(null);

  // Victory Modal & Level Stage Tracking State
  const [completedStagesInLevel, setCompletedStagesInLevel] = useState<string[]>([]);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  // Sync audio controller with settings
  useEffect(() => {
    sound.sfxEnabled = settings.sfxEnabled;
    sound.sfxVolume = settings.sfxVolume;
    sound.voiceEnabled = settings.voiceEnabled;
    sound.voiceName = settings.voiceName;
    sound.voicePitch = settings.voicePitch;
    sound.voiceRate = settings.voiceRate;
    sound.syncMusicSettings(settings.musicEnabled, settings.musicTrackId, settings.musicVolume);
  }, [settings]);

  // Stop music cleanly on unmount
  useEffect(() => {
    return () => sound.stopMusic();
  }, []);

  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleUpdateItems = useCallback((newItems: GameItem[]) => {
    setItems(newItems);
    saveItems(newItems);
  }, []);

  const activeModeConfig =
    settings.gameMode === 'sentence' ? settings.sentenceConfig : settings.wordsConfig;

  const filteredItems = useMemo(() => {
    return filterItems(
      items,
      settings.gameMode,
      activeModeConfig.grade,
      activeModeConfig.semester,
      activeModeConfig.unit,
      activeModeConfig.targetWordCount
    );
  }, [
    items,
    settings.gameMode,
    activeModeConfig.grade,
    activeModeConfig.semester,
    activeModeConfig.unit,
    activeModeConfig.targetWordCount,
  ]);

  // Reset stage progress when mode, grade, semester, or unit changes
  useEffect(() => {
    setCompletedStagesInLevel([]);
    setCurrentIndex(0);
  }, [
    settings.gameMode,
    activeModeConfig.grade,
    activeModeConfig.semester,
    activeModeConfig.unit,
  ]);

  useEffect(() => {
    if (currentIndex >= filteredItems.length) {
      setCurrentIndex(0);
    }
  }, [filteredItems.length, currentIndex]);

  const currentItem = filteredItems[currentIndex] || filteredItems[0] || items[0];

  const completedStagesCount = useMemo(() => {
    return filteredItems.filter(it => completedStagesInLevel.includes(it.id)).length;
  }, [filteredItems, completedStagesInLevel]);

  const isLevelComplete =
    filteredItems.length > 0 && completedStagesCount >= filteredItems.length;

  const tokens = useMemo(() => {
    if (!currentItem) return [];
    return extractTokens(currentItem);
  }, [currentItem]);

  // Reset puzzle state whenever active item changes
  useEffect(() => {
    if (tokens.length > 0) {
      setNodes(generateDotNodes(tokens));
      setSelectedNodeIds([]);
      setAuditResults(null);
      setIsVictoryOpen(false);
    }
  }, [currentItem?.id, tokens]);

  // Pre-warm active puzzle pronunciation for instant playback on Android & Studio Voices
  useEffect(() => {
    if (gameStage === 'playing' && settings.voiceEnabled && currentItem?.text) {
      sound.prefetchSpeech(currentItem.text);
    }
  }, [gameStage, settings.voiceEnabled, settings.voiceName, currentItem?.text]);

  // Toggle node connection (NO auto-hinting of next dot!)
  const handleToggleNode = useCallback(
    (nodeId: string, clientX: number, clientY: number) => {
      if (isVictoryOpen) return;
      setAuditResults(null);

      setSelectedNodeIds(prev => {
        const existingIdx = prev.indexOf(nodeId);
        if (existingIdx !== -1) {
          sound.playDisconnect();
          return prev.filter(id => id !== nodeId);
        }
        if (prev.length >= tokens.length) {
          return prev;
        }
        const node = nodes.find(n => n.id === nodeId);
        const color = node ? CANDY_COLORS[node.colorIndex].hex : '#FBBF24';
        sound.playConnect(prev.length);
        triggerBackdropBurst(clientX, clientY, color, 12);
        return [...prev, nodeId];
      });
    },
    [isVictoryOpen, tokens.length, nodes]
  );

  // Connect node idempotently during Swap Line drag-to-connect
  const handleConnectNode = useCallback(
    (nodeId: string, clientX: number, clientY: number) => {
      if (isVictoryOpen) return;
      setAuditResults(null);

      setSelectedNodeIds(prev => {
        if (prev.includes(nodeId) || prev.length >= tokens.length) {
          return prev;
        }
        const node = nodes.find(n => n.id === nodeId);
        const color = node ? CANDY_COLORS[node.colorIndex].hex : '#FBBF24';
        sound.playConnect(prev.length);
        triggerBackdropBurst(clientX, clientY, color, 10);
        return [...prev, nodeId];
      });
    },
    [isVictoryOpen, tokens.length, nodes]
  );

  // Backtrack one node during Swap Line drag-to-connect
  const handleDisconnectLast = useCallback(() => {
    if (isVictoryOpen) return;
    sound.playDisconnect();
    setAuditResults(null);
    setSelectedNodeIds(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, [isVictoryOpen]);

  // Drag node freely around the board
  const handleMoveNode = useCallback((nodeId: string, xPct: number, yPct: number) => {
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, x: xPct, y: yPct } : n)));
  }, []);

  const handleRemoveAtSlot = useCallback((slotIndex: number) => {
    sound.playDisconnect();
    setAuditResults(null);
    setSelectedNodeIds(prev => prev.filter((_, idx) => idx !== slotIndex));
  }, []);

  const handleClearSelection = useCallback(() => {
    sound.playClick();
    setSelectedNodeIds([]);
    setAuditResults(null);
  }, []);

  const handleReshufflePositions = () => {
    sound.playClick();
    setNodes(generateDotNodes(tokens));
  };

  // Manual Audit & Check Answer Button Handler
  const handleCheckAnswer = () => {
    if (selectedNodeIds.length < tokens.length || !currentItem) return;
    sound.unlock(true);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const slotStatuses: SlotAuditStatus[] = selectedNodeIds.map((id, idx) => {
      const node = nodeMap.get(id);
      if (!node) return 'wrong';
      // Compare token text so duplicate letters/words (like P-P in PUPPY) work seamlessly!
      return node.text === tokens[idx] ? 'correct' : 'wrong';
    });

    const isAllCorrect = slotStatuses.every(s => s === 'correct');
    setAuditResults(slotStatuses);

    if (!isAllCorrect) {
      sound.playTryAgain();
      return;
    }

    // VICTORY!
    sound.playAuditCheck();
    setCompletedStagesInLevel(prev =>
      prev.includes(currentItem.id) ? prev : [...prev, currentItem.id]
    );

    setTimeout(() => {
      setIsVictoryOpen(true);
    }, 320);
  };

  // Post-Victory Navigation Choices
  const handlePlayAnotherCurrentUnit = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    if (isLevelComplete) {
      // Restart all stages in this unit from stage 1
      setCompletedStagesInLevel([]);
      setCurrentIndex(0);
      return;
    }
    // Find next uncompleted stage in this unit
    const len = filteredItems.length;
    for (let offset = 1; offset <= len; offset++) {
      const candidateIdx = (currentIndex + offset) % len;
      if (!completedStagesInLevel.includes(filteredItems[candidateIdx].id)) {
        setCurrentIndex(candidateIdx);
        return;
      }
    }
    setCurrentIndex(prev => (prev + 1) % Math.max(1, len));
  };

  const handleGoToNextUnit = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    const nextDest = getNextUnitOrGrade(
      activeModeConfig.grade,
      activeModeConfig.semester,
      activeModeConfig.unit
    );

    if (nextDest) {
      const nextMeta = GRADE_META[nextDest.grade];
      setCompletedStagesInLevel([]);
      if (settings.gameMode === 'sentence') {
        handleUpdateSettings({
          ...settings,
          sentenceConfig: {
            ...settings.sentenceConfig,
            grade: nextDest.grade,
            semester: nextDest.semester,
            unit: nextDest.unit,
            targetWordCount: nextMeta.suggestedTargetSentence,
          },
        });
      } else {
        handleUpdateSettings({
          ...settings,
          wordsConfig: {
            ...settings.wordsConfig,
            grade: nextDest.grade,
            semester: nextDest.semester,
            unit: nextDest.unit,
            targetWordCount: nextMeta.suggestedTargetWords,
          },
        });
      }
      setCurrentIndex(0);
    } else {
      setCompletedStagesInLevel([]);
      setCurrentIndex(0);
    }
  };

  const handleReplayPuzzle = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    setSelectedNodeIds([]);
    setAuditResults(null);
    setNodes(generateDotNodes(tokens));
  };

  const handleGoToTitleScreen = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    setTitleMenuStep('home');
    setGameStage('title');
  };

  const handleSelectPlayItem = (item: GameItem) => {
    const nextSettings = {
      ...settings,
      gameMode: item.mode,
      sentenceConfig:
        item.mode === 'sentence'
          ? {
              ...settings.sentenceConfig,
              grade: item.grade,
              semester: item.semester,
              unit: item.unit,
            }
          : settings.sentenceConfig,
      wordsConfig:
        item.mode === 'spelling'
          ? {
              ...settings.wordsConfig,
              grade: item.grade,
              semester: item.semester,
              unit: item.unit,
            }
          : settings.wordsConfig,
    };
    handleUpdateSettings(nextSettings);

    const newList = filterItems(
      items,
      item.mode,
      item.grade,
      item.semester,
      item.unit,
      item.mode === 'sentence'
        ? nextSettings.sentenceConfig.targetWordCount
        : nextSettings.wordsConfig.targetWordCount
    );
    const idx = newList.findIndex(it => it.id === item.id);
    setCurrentIndex(idx >= 0 ? idx : 0);
    setGameStage('playing');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (e.key === 'Escape') {
        if (isAboutOpen) {
          setIsAboutOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (gameStage === 'title' && titleMenuStep !== 'home') {
          return; // TitleScreen Escape handler navigates back to home menu
        }
        if (!isVictoryOpen) {
          setIsSettingsOpen(true);
        }
        return;
      }

      if (
        gameStage !== 'playing' ||
        settings.playerMode !== 'single' ||
        isSettingsOpen ||
        isAboutOpen ||
        isVictoryOpen ||
        !currentItem
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        sound.unlock(true);
        sound.speak(currentItem.text);
      } else if (e.key === 'ArrowLeft' && filteredItems.length > 1) {
        e.preventDefault();
        sound.playClick();
        setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'ArrowRight' && filteredItems.length > 1) {
        e.preventDefault();
        sound.playClick();
        setCurrentIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'Backspace' && selectedNodeIds.length > 0) {
        e.preventDefault();
        handleDisconnectLast();
      } else if (e.key === 'Enter' && selectedNodeIds.length === tokens.length) {
        e.preventDefault();
        handleCheckAnswer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const isTitleMenuFocused = titleMenuStep !== 'home' || isSettingsOpen || isAboutOpen;

  return (
    <div
      className={`relative w-full min-h-dvh overflow-x-clip touch-auto select-none ${
        gameStage === 'playing' ? 'viewport-fit-tall' : ''
      }`}
    >
      {/* Live Desktop Wallpaper -> Automatically engages DoF / Bokeh when a menu is focused */}
      <DynamicBackdrop
        variant={gameStage}
        mode={settings.gameMode}
        focusedMenu={isTitleMenuFocused}
      />

      {gameStage === 'title' ? (
        <TitleScreen
          onStartGame={() => {
            sound.unlock();
            setGameStage('playing');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          menuStep={titleMenuStep}
          onChangeMenuStep={setTitleMenuStep}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : settings.playerMode === 'two' ? (
        <TwoPlayerArena
          settings={settings}
          activeModeConfig={activeModeConfig}
          filteredItems={filteredItems}
          onUpdateSettings={handleUpdateSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGoToTitleScreen={handleGoToTitleScreen}
        />
      ) : (
        <div className="relative z-10 w-full min-h-dvh gameplay-fit-tall flex flex-col justify-between p-2 sm:p-4 gap-2 sm:gap-3">
          
          {/* Top Game HUD */}
          <header className="w-full max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-2 px-1 z-30">
            
            {/* Left: Home & Mode/Level Status */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToTitleScreen}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 hover:bg-sky-50 text-slate-800 shadow-md border-2 border-white hover:border-sky-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer"
                title="Go to Title Screen"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 transition-transform duration-150 group-hover:scale-110" />
                <span className="hidden sm:inline">Title</span>
              </button>

              <div className="bg-white/95 px-3 sm:px-3.5 py-2 rounded-2xl shadow-md border border-white text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                <span className="text-slate-900">
                  {settings.gameMode === 'sentence' ? 'Sentence' : 'Spelling'}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-sky-700">
                  Grade {activeModeConfig.grade} · Sem {activeModeConfig.semester} · Unit {activeModeConfig.unit}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="tabular-nums text-slate-600">
                  {currentIndex + 1}/{filteredItems.length}
                </span>
              </div>
            </div>

            {/* Center: Puzzle Stepper & Reshuffle */}
            <div className="flex items-center gap-1 bg-white/95 px-2 py-1 rounded-2xl shadow-md border border-white">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
                }}
                className="p-1.5 rounded-xl hover:bg-sky-100 text-slate-700 hover:text-sky-700 hover:-translate-x-0.5 transition-all duration-150 cursor-pointer active:scale-90"
                title="Previous Puzzle"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleReshufflePositions}
                className="group p-1.5 rounded-xl hover:bg-sky-100 text-sky-600 transition-all duration-150 cursor-pointer active:scale-90"
                title="Shuffle Tile Positions"
              >
                <Shuffle className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex(prev => (prev + 1) % filteredItems.length);
                }}
                className="p-1.5 rounded-xl hover:bg-sky-100 text-slate-700 hover:text-sky-700 hover:translate-x-0.5 transition-all duration-150 cursor-pointer active:scale-90"
                title="Next Puzzle"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Music, SFX & Options */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  sound.playClick();
                  handleUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
                }}
                className={`group p-2.5 rounded-2xl shadow-md border border-white hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 cursor-pointer ${
                  settings.musicEnabled ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'bg-white/95 hover:bg-white text-slate-400'
                }`}
                title="Toggle Music"
              >
                <Music className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 group-hover:scale-110 group-hover:-rotate-12" />
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
                  handleUpdateSettings({ ...settings, sfxEnabled: next });
                }}
                className="group p-2.5 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 shadow-md border border-white hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 cursor-pointer"
                title="Toggle Sound Effects"
              >
                {settings.sfxEnabled ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 transition-transform duration-150 group-hover:scale-110" />
                ) : (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform duration-150 group-hover:scale-110" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsSettingsOpen(true);
                }}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md border border-white hover:border-amber-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer"
                title="Options & Settings"
              >
                <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 transition-transform duration-300 group-hover:rotate-90" />
                <span className="hidden sm:inline">Options</span>
              </button>
            </div>
          </header>

          {/* Main Interactive Drag & Connect Playfield */}
          <main className="w-full max-w-[1680px] mx-auto flex-1 min-h-0 flex flex-col">
            {currentItem && (
              <GameBoard
                item={currentItem}
                nodes={nodes}
                selectedNodeIds={selectedNodeIds}
                auditResults={auditResults}
                modeConfig={activeModeConfig}
                interactionMode={settings.interactionMode}
                onToggleNode={handleToggleNode}
                onConnectNode={handleConnectNode}
                onDisconnectLast={handleDisconnectLast}
                onMoveNode={handleMoveNode}
              />
            )}
          </main>

          {/* Bottom Player Panel: Answer Construction Tray + Controls */}
          {currentItem && (
            <SentenceTray
              item={currentItem}
              tokens={tokens}
              selectedNodeIds={selectedNodeIds}
              nodes={nodes}
              auditResults={auditResults}
              interactionMode={settings.interactionMode}
              onChangeInteractionMode={(mode) =>
                handleUpdateSettings({ ...settings, interactionMode: mode })
              }
              onRemoveAtSlot={handleRemoveAtSlot}
              onCheckAnswer={handleCheckAnswer}
              onReset={handleClearSelection}
            />
          )}
        </div>
      )}

      {/* Victory Modal with Stage/Unit Continuation */}
      {currentItem && (
        <VictoryModal
          isOpen={isVictoryOpen}
          item={currentItem}
          grade={activeModeConfig.grade}
          semester={activeModeConfig.semester}
          unit={activeModeConfig.unit}
          completedStagesCount={completedStagesCount}
          totalStagesInUnit={filteredItems.length}
          isUnitComplete={isLevelComplete}
          onPlayAnotherCurrentUnit={handlePlayAnotherCurrentUnit}
          onGoToNextUnit={handleGoToNextUnit}
          onReplay={handleReplayPuzzle}
          onGoToTitleScreen={handleGoToTitleScreen}
        />
      )}

      {/* Settings / Options Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        items={items}
        onUpdateItems={handleUpdateItems}
        onSelectPlayItem={handleSelectPlayItem}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
