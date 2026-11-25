/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { DotNode, GameItem, GameSettings, VocabFolder } from './types';
import {
  ensureFoldersForItems,
  exportDatabaseToNotepadTxt,
  getLastContentUpdatedAt,
  getLastGitHubSavedAt,
  loadFolders,
  loadItems,
  loadSettings,
  parseDatabaseImport,
  saveFolders,
  saveItems,
  saveNotepadCache,
  saveSettings,
  setLastContentUpdatedAt,
  setLastGitHubSavedAt,
  setLastLocalUpdatedAt,
} from './utils/storage';
import {
  GitHubRequirementsReport,
  GitHubServerStatus,
  evaluateGitHubRequirements,
  fetchGitHubStatus,
  inferGitHubRepoFromLocation,
  loadDatabaseFromGitHub,
  normalizeRepoSlug,
  normalizeTxtFilePath,
  saveDatabaseToGitHub,
  setStoredOAuthSessionId,
} from './utils/githubSync';
import {
  CANDY_COLORS,
  extractTokens,
  filterItemsByFolder,
  generateDotNodes,
  getNextPlayableFolder,
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
import { FullscreenButton } from './components/FullscreenButton';

export default function App() {
  const [items, setItems] = useState<GameItem[]>(() => loadItems());
  const [folders, setFolders] = useState<VocabFolder[]>(() => loadFolders(items));
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

  // Victory Modal & Folder Stage Tracking State
  const [completedStagesInLevel, setCompletedStagesInLevel] = useState<string[]>([]);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  const [githubStatus, setGithubStatus] = useState<GitHubServerStatus | null>(null);
  const [isSyncingOnline, setIsSyncingOnline] = useState(false);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastGitHubSyncError, setLastGitHubSyncError] = useState<string | null>(null);
  const [lastGitHubSyncedAt, setLastGitHubSyncedAt] = useState<string | null>(null);
  const [autoSaveFixAttempted, setAutoSaveFixAttempted] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const foldersRef = useRef(folders);
  foldersRef.current = folders;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const githubStatusRef = useRef<GitHubServerStatus | null>(null);
  githubStatusRef.current = githubStatus;
  const autoSaveTimerRef = useRef<number | null>(null);
  const pushInFlightRef = useRef(false);
  const queuedPushRef = useRef(false);
  const startupSyncedRef = useRef(false);

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

  // Stop music & timers cleanly on unmount
  useEffect(() => {
    return () => {
      sound.stopMusic();
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const refreshGitHubStatus = useCallback(async () => {
    try {
      const status = await fetchGitHubStatus();
      setGithubStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  const resolveEffectiveGitHubConfig = useCallback(
    (s: GameSettings, status: GitHubServerStatus | null) => ({
      repo: normalizeRepoSlug(s.githubSync.repo) || status?.defaultRepo || '',
      branch: s.githubSync.branch.trim() || status?.defaultBranch || 'main',
      filePath: normalizeTxtFilePath(s.githubSync.filePath || status?.defaultPath || 'wordfun-database.txt'),
      autoLoadOnStart: s.githubSync.autoLoadOnStart,
      autoSaveOnline: s.githubSync.autoSaveOnline,
    }),
    []
  );

  const autoRepairSyncConfig = useCallback(
    async (
      targetSettings: GameSettings,
      overrideStatus?: GitHubServerStatus | null,
      forceEnableAutoSave = false
    ): Promise<{ repairedSettings: GameSettings; status: GitHubServerStatus | null }> => {
      let status = overrideStatus ?? githubStatusRef.current;
      if (!status || !status.backendAvailable || (!status.serverTokenConfigured && !status.oauthConnected)) {
        const fresh = await refreshGitHubStatus();
        if (fresh) status = fresh;
      }

      const loc = inferGitHubRepoFromLocation();
      const normalizedRepo =
        normalizeRepoSlug(targetSettings.githubSync.repo) ||
        status?.defaultRepo ||
        loc?.repo ||
        '';
      const normalizedBranch =
        targetSettings.githubSync.branch.trim() ||
        status?.defaultBranch ||
        loc?.branch ||
        'main';
      const normalizedPath = normalizeTxtFilePath(
        targetSettings.githubSync.filePath ||
          status?.defaultPath ||
          loc?.filePath ||
          'wordfun-database.txt'
      );

      const needsSettingsPatch =
        normalizedRepo !== targetSettings.githubSync.repo ||
        normalizedBranch !== targetSettings.githubSync.branch ||
        normalizedPath !== targetSettings.githubSync.filePath ||
        (forceEnableAutoSave && !targetSettings.githubSync.autoSaveOnline);

      if (!needsSettingsPatch) {
        return { repairedSettings: targetSettings, status };
      }

      const repairedSettings: GameSettings = {
        ...targetSettings,
        githubSync: {
          ...targetSettings.githubSync,
          repo: normalizedRepo,
          branch: normalizedBranch,
          filePath: normalizedPath,
          autoSaveOnline: forceEnableAutoSave ? true : targetSettings.githubSync.autoSaveOnline,
        },
      };
      settingsRef.current = repairedSettings;
      setSettings(repairedSettings);
      saveSettings(repairedSettings);
      return { repairedSettings, status };
    },
    [refreshGitHubStatus]
  );

  const pushDatabaseToGitHub = useCallback(
    async (
      targetItems: GameItem[],
      targetSettings: GameSettings,
      overrideStatus?: GitHubServerStatus | null,
      targetFolders?: VocabFolder[]
    ): Promise<{ success: boolean; skipped?: boolean; message: string; commitUrl?: string | null }> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return {
          success: false,
          skipped: true,
          message: 'Device is offline. Data is saved locally on this device.',
        };
      }

      // Auto-fix step 1: ensure live server status & valid .txt target config are resolved before saving
      const { repairedSettings, status } = await autoRepairSyncConfig(
        targetSettings,
        overrideStatus,
        false
      );
      const cfg = resolveEffectiveGitHubConfig(repairedSettings, status);

      if (!cfg.repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cfg.repo)) {
        const msg = 'No valid GitHub repository (owner/repo) configured yet.';
        setLastGitHubSyncError(msg);
        setAutoSaveFixAttempted(true);
        return {
          success: false,
          skipped: true,
          message: msg,
        };
      }
      const canWrite = Boolean(status?.serverTokenConfigured || status?.oauthConnected);
      if (!canWrite) {
        const msg = status && !status.backendAvailable
          ? 'Static/browser-only host detected: direct GitHub auto-saving requires running the Node server (node server.ts) with GITHUB_TOKEN or OAuth.'
          : 'GitHub write access is not connected yet (set GITHUB_TOKEN in server environment or connect GitHub Account).';
        setLastGitHubSyncError(msg);
        setAutoSaveFixAttempted(true);
        return {
          success: false,
          skipped: true,
          message: msg,
        };
      }

      if (pushInFlightRef.current) {
        queuedPushRef.current = true;
        return {
          success: true,
          skipped: true,
          message: 'Queued latest update for automatic GitHub save.',
        };
      }

      pushInFlightRef.current = true;
      setIsSyncingOnline(true);
      try {
        const nowIso = setLastLocalUpdatedAt();
        const activeFolders = targetFolders ?? foldersRef.current;
        const notepadTxt = exportDatabaseToNotepadTxt(
          targetItems,
          repairedSettings,
          nowIso,
          activeFolders
        );
        saveNotepadCache(notepadTxt);

        try {
          const res = await saveDatabaseToGitHub(
            notepadTxt,
            cfg,
            `Save Word Fun! Notepad database (${targetItems.length} items)`
          );
          setLastGitHubSavedAt(nowIso);
          setLastGitHubSyncError(null);
          setAutoSaveFixAttempted(false);
          setLastGitHubSyncedAt(new Date().toISOString());
          return {
            success: true,
            message: `Synced to GitHub (${res.repo}/${res.filePath}).`,
            commitUrl: res.commitUrl,
          };
        } catch (firstErr) {
          // Auto-fix step 2: re-sync status & retry once automatically if a transient error occurred
          const freshStatus = await refreshGitHubStatus();
          const retryCfg = resolveEffectiveGitHubConfig(repairedSettings, freshStatus);
          if (freshStatus && (freshStatus.serverTokenConfigured || freshStatus.oauthConnected)) {
            try {
              const retryRes = await saveDatabaseToGitHub(
                notepadTxt,
                retryCfg,
                `Save Word Fun! Notepad database (${targetItems.length} items)`
              );
              setLastGitHubSavedAt(nowIso);
              setLastGitHubSyncError(null);
              setAutoSaveFixAttempted(false);
              setLastGitHubSyncedAt(new Date().toISOString());
              return {
                success: true,
                message: `Auto-fixed and synced to GitHub (${retryRes.repo}/${retryRes.filePath}).`,
                commitUrl: retryRes.commitUrl,
              };
            } catch (retryErr) {
              throw retryErr;
            }
          }
          throw firstErr;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'GitHub online save failed.';
        setLastGitHubSyncError(msg);
        setAutoSaveFixAttempted(true);
        return { success: false, message: msg };
      } finally {
        pushInFlightRef.current = false;
        setIsSyncingOnline(false);
        if (queuedPushRef.current) {
          queuedPushRef.current = false;
          window.setTimeout(() => {
            void pushDatabaseToGitHub(
              itemsRef.current,
              settingsRef.current,
              githubStatusRef.current,
              foldersRef.current
            );
          }, 250);
        }
      }
    },
    [autoRepairSyncConfig, refreshGitHubStatus, resolveEffectiveGitHubConfig]
  );

  const loadFromGitHubNow = useCallback(
    async (
      forceApply = true,
      overrideStatus?: GitHubServerStatus | null,
      overrideConfig?: { repo?: string; branch?: string; filePath?: string }
    ): Promise<{ success: boolean; applied?: boolean; message: string }> => {
      const currentSettings = settingsRef.current;
      const status = overrideStatus ?? githubStatusRef.current;
      const baseCfg = resolveEffectiveGitHubConfig(currentSettings, status);
      const cfg = {
        ...baseCfg,
        repo: overrideConfig?.repo?.trim() || baseCfg.repo,
        branch: overrideConfig?.branch?.trim() || baseCfg.branch,
        filePath: overrideConfig?.filePath?.trim() || baseCfg.filePath,
      };

      setIsSyncingOnline(true);
      try {
        const remote = await loadDatabaseFromGitHub(cfg, forceApply);
        setLastGitHubSyncError(null);
        if (!remote.exists || !remote.content) {
          if (!cfg.repo) {
            return {
              success: false,
              message: 'Please enter a GitHub repository (owner/repo) or open via an Auto-Connect link first.',
            };
          }
          return {
            success: false,
            message: `No .txt database file (${normalizeTxtFilePath(remote.filePath || cfg.filePath)}) found in ${remote.repo || cfg.repo} on branch "${remote.branch}".`,
          };
        }

        const parsed = parseDatabaseImport(remote.content);
        if (!parsed.success || !parsed.items) {
          return {
            success: false,
            message: parsed.error || 'Could not parse remote .txt database file.',
          };
        }

        const contentUpdatedAt = getLastContentUpdatedAt();
        const lastGhSavedAt = getLastGitHubSavedAt();
        const remoteMs = parsed.savedAt ? Date.parse(parsed.savedAt) : NaN;
        const contentMs = contentUpdatedAt ? Date.parse(contentUpdatedAt) : NaN;
        const lastGhMs = lastGhSavedAt ? Date.parse(lastGhSavedAt) : NaN;

        const hasNewerRemoteSinceLastSync =
          Number.isFinite(remoteMs) && (!Number.isFinite(lastGhMs) || remoteMs > lastGhMs);

        if (
          !forceApply &&
          contentUpdatedAt &&
          Number.isFinite(remoteMs) &&
          Number.isFinite(contentMs) &&
          remoteMs <= contentMs &&
          !hasNewerRemoteSinceLastSync
        ) {
          setLastGitHubSyncedAt(new Date().toISOString());
          return {
            success: true,
            applied: false,
            message: 'Local saved data is already up to date with GitHub.',
          };
        }

        const stamp = parsed.savedAt || new Date().toISOString();
        const nextFolders = ensureFoldersForItems(
          parsed.folders && parsed.folders.length > 0 ? parsed.folders : foldersRef.current,
          parsed.items
        );
        const resolvedRepo = remote.repo || cfg.repo;
        const resolvedBranch = remote.branch || cfg.branch;
        const primaryTxtPath = normalizeTxtFilePath(remote.filePath || cfg.filePath);

        const baseSettings: GameSettings = parsed.settings
          ? {
              ...parsed.settings,
              githubSync: {
                ...parsed.settings.githubSync,
                repo: resolvedRepo || parsed.settings.githubSync.repo,
                branch: resolvedBranch || parsed.settings.githubSync.branch,
                filePath: normalizeTxtFilePath(parsed.settings.githubSync.filePath || primaryTxtPath),
              },
            }
          : {
              ...currentSettings,
              githubSync: {
                ...currentSettings.githubSync,
                repo: resolvedRepo || currentSettings.githubSync.repo,
                branch: resolvedBranch || currentSettings.githubSync.branch,
                filePath: normalizeTxtFilePath(currentSettings.githubSync.filePath || primaryTxtPath),
              },
            };

        const validFolderExists = nextFolders.some(f => f.id === baseSettings.selectedFolderId);
        const mergedSettings: GameSettings = validFolderExists
          ? baseSettings
          : {
              ...baseSettings,
              selectedFolderId: nextFolders[0]?.id || currentSettings.selectedFolderId,
            };

        foldersRef.current = nextFolders;
        itemsRef.current = parsed.items;
        settingsRef.current = mergedSettings;
        setFolders(nextFolders);
        setItems(parsed.items);
        setSettings(mergedSettings);
        saveFolders(nextFolders, stamp);
        saveItems(parsed.items, stamp);
        saveSettings(mergedSettings, stamp);
        setLastGitHubSavedAt(stamp);
        saveNotepadCache(remote.content);
        setLastGitHubSyncedAt(new Date().toISOString());

        return {
          success: true,
          applied: true,
          message: `Loaded ${parsed.items.length} items from ${remote.repo || 'static'}/${primaryTxtPath} (.txt)!`,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not reach GitHub database.';
        setLastGitHubSyncError(msg);
        return { success: false, message: msg };
      } finally {
        setIsSyncingOnline(false);
      }
    },
    [resolveEffectiveGitHubConfig]
  );

  // Startup: auto-discover GitHub repo (Env / URL Param / public manifest / GitHub Pages) & auto-load .txt database
  useEffect(() => {
    if (startupSyncedRef.current) return;
    startupSyncedRef.current = true;

    (async () => {
      const locationHint = inferGitHubRepoFromLocation();
      const hasUrlParamOverride = locationHint?.source === 'url-param' && Boolean(locationHint.repo);

      const status = await refreshGitHubStatus();
      const current = settingsRef.current;

      const discoveredRepo = hasUrlParamOverride
        ? locationHint!.repo
        : current.githubSync.repo.trim() || status?.defaultRepo || locationHint?.repo || '';
      const discoveredBranch = hasUrlParamOverride
        ? locationHint?.branch || 'main'
        : current.githubSync.branch.trim() || status?.defaultBranch || 'main';
      const discoveredPath = hasUrlParamOverride
        ? locationHint?.filePath || 'wordfun-database.txt'
        : current.githubSync.filePath.trim() || status?.defaultPath || 'wordfun-database.txt';

      if (
        discoveredRepo &&
        (hasUrlParamOverride || !current.githubSync.repo.trim())
      ) {
        const seeded: GameSettings = {
          ...current,
          githubSync: {
            ...current.githubSync,
            repo: discoveredRepo,
            branch: discoveredBranch,
            filePath: discoveredPath,
          },
        };
        settingsRef.current = seeded;
        setSettings(seeded);
        saveSettings(seeded);
      }

      const effective = resolveEffectiveGitHubConfig(settingsRef.current, status);
      if (effective.autoLoadOnStart && (effective.repo || !status?.backendAvailable)) {
        await loadFromGitHubNow(hasUrlParamOverride, status);
      }
    })();
  }, [refreshGitHubStatus, resolveEffectiveGitHubConfig, loadFromGitHubNow]);

  // Refresh GitHub status whenever Options opens
  useEffect(() => {
    if (isSettingsOpen) {
      refreshGitHubStatus();
    }
  }, [isSettingsOpen, refreshGitHubStatus]);

  // Listen for GitHub 3P OAuth popup completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (
        origin !== window.location.origin &&
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost')
      ) {
        return;
      }
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        if (typeof event.data.sessionId === 'string' && event.data.sessionId) {
          setStoredOAuthSessionId(event.data.sessionId);
        }
        setLastGitHubSyncError(null);
        refreshGitHubStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshGitHubStatus]);

  // Track live browser online/offline state & auto-sync on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      setLastGitHubSyncError(null);
      refreshGitHubStatus().then(status => {
        const cfg = resolveEffectiveGitHubConfig(settingsRef.current, status);
        const canWrite = Boolean(status?.serverTokenConfigured || status?.oauthConnected);
        if (cfg.autoSaveOnline && cfg.repo && canWrite) {
          pushDatabaseToGitHub(itemsRef.current, settingsRef.current, status, foldersRef.current);
        }
      });
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshGitHubStatus, resolveEffectiveGitHubConfig, pushDatabaseToGitHub]);

  const scheduleAutoSaveOnline = useCallback(
    (_nextItems: GameItem[], nextSettings: GameSettings, _nextFolders?: VocabFolder[]) => {
      if (!nextSettings.githubSync.autoSaveOnline) return;

      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = window.setTimeout(() => {
        autoSaveTimerRef.current = null;
        void pushDatabaseToGitHub(
          itemsRef.current,
          settingsRef.current,
          githubStatusRef.current,
          foldersRef.current
        );
      }, 1500);
    },
    [pushDatabaseToGitHub]
  );

  const handleFixAutoSaveConnection = useCallback(async (): Promise<{
    success: boolean;
    needsOAuth: boolean;
    message: string;
    requirements: GitHubRequirementsReport;
  }> => {
    setAutoSaveFixAttempted(true);
    setLastGitHubSyncError(null);

    const { repairedSettings, status } = await autoRepairSyncConfig(
      settingsRef.current,
      null,
      true
    );

    const online = typeof navigator === 'undefined' ? true : navigator.onLine;
    const canWrite = Boolean(status?.serverTokenConfigured || status?.oauthConnected);

    if (online && canWrite) {
      const saveRes = await pushDatabaseToGitHub(
        itemsRef.current,
        repairedSettings,
        status,
        foldersRef.current
      );
      const reqs = evaluateGitHubRequirements(
        repairedSettings.githubSync,
        status,
        online,
        saveRes.success ? null : saveRes.message
      );
      return {
        success: saveRes.success,
        needsOAuth: false,
        message: saveRes.success
          ? `Auto-Save repaired! ${saveRes.message}`
          : saveRes.message,
        requirements: reqs,
      };
    }

    const reqs = evaluateGitHubRequirements(
      repairedSettings.githubSync,
      status,
      online,
      lastGitHubSyncError
    );
    const needsOAuth = Boolean(status?.backendAvailable && status?.oauthEnabled && !canWrite);
    setLastGitHubSyncError(reqs.headline);

    return {
      success: false,
      needsOAuth,
      message: reqs.headline,
      requirements: reqs,
    };
  }, [autoRepairSyncConfig, lastGitHubSyncError, pushDatabaseToGitHub]);

  const effectiveGitHubRepo = useMemo(() => {
    return settings.githubSync.repo.trim() || githubStatus?.defaultRepo || '';
  }, [settings.githubSync.repo, githubStatus?.defaultRepo]);

  const hasValidGitHubRepo = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(effectiveGitHubRepo);
  const canWriteGitHub = Boolean(githubStatus?.serverTokenConfigured || githubStatus?.oauthConnected);
  const isGitHubOnline =
    isBrowserOnline && hasValidGitHubRepo && canWriteGitHub && !lastGitHubSyncError;

  const githubConnectionDetail = useMemo(() => {
    if (!isBrowserOnline) {
      return 'Offline — No internet connection (all edits saved locally on this device).';
    }
    if (!hasValidGitHubRepo) {
      return 'Offline — No valid GitHub repository (owner/repo) configured yet. Click Fix Auto-Save or enter owner/repo below.';
    }
    if (!canWriteGitHub) {
      if (githubStatus && !githubStatus.backendAvailable) {
        return `Static / Read-Only Mode — Auto-loading from ${effectiveGitHubRepo} (.txt) works on all devices, while online auto-saving requires running the Node server with GITHUB_TOKEN or OAuth.`;
      }
      return `Read-Only Mode — Auto-loading from ${effectiveGitHubRepo} (.txt) is ready; set GITHUB_TOKEN in Secrets or connect GitHub Account to enable automatic saving.`;
    }
    if (lastGitHubSyncError) {
      return `Offline — ${lastGitHubSyncError}`;
    }
    if (!settings.githubSync.autoSaveOnline) {
      return `Online in GitHub — Connected to ${effectiveGitHubRepo} (auto-save paused; manual Save enabled).`;
    }
    return `Online in GitHub — Connected to ${effectiveGitHubRepo} (automatic .txt saving & loading active).`;
  }, [
    isBrowserOnline,
    hasValidGitHubRepo,
    canWriteGitHub,
    githubStatus,
    lastGitHubSyncError,
    effectiveGitHubRepo,
    settings.githubSync.autoSaveOnline,
  ]);

  const handleUpdateSettings = useCallback(
    (newSettings: GameSettings) => {
      const prevSync = settingsRef.current.githubSync;
      if (
        prevSync.repo !== newSettings.githubSync.repo ||
        prevSync.branch !== newSettings.githubSync.branch ||
        prevSync.filePath !== newSettings.githubSync.filePath ||
        prevSync.autoSaveOnline !== newSettings.githubSync.autoSaveOnline
      ) {
        setLastGitHubSyncError(null);
      }

      const nowIso = setLastLocalUpdatedAt();
      settingsRef.current = newSettings;
      setSettings(newSettings);
      saveSettings(newSettings, nowIso);
      saveNotepadCache(
        exportDatabaseToNotepadTxt(itemsRef.current, newSettings, nowIso, foldersRef.current)
      );
      scheduleAutoSaveOnline(itemsRef.current, newSettings, foldersRef.current);
    },
    [scheduleAutoSaveOnline]
  );

  const handleUpdateItems = useCallback(
    (newItems: GameItem[]) => {
      const nowIso = setLastLocalUpdatedAt();
      itemsRef.current = newItems;
      setItems(newItems);
      saveItems(newItems, nowIso);
      saveNotepadCache(
        exportDatabaseToNotepadTxt(newItems, settingsRef.current, nowIso, foldersRef.current)
      );
      scheduleAutoSaveOnline(newItems, settingsRef.current, foldersRef.current);
    },
    [scheduleAutoSaveOnline]
  );

  const handleUpdateFolders = useCallback(
    (newFolders: VocabFolder[]) => {
      const nowIso = setLastLocalUpdatedAt();
      foldersRef.current = newFolders;
      setFolders(newFolders);
      saveFolders(newFolders, nowIso);
      saveNotepadCache(
        exportDatabaseToNotepadTxt(itemsRef.current, settingsRef.current, nowIso, newFolders)
      );
      scheduleAutoSaveOnline(itemsRef.current, settingsRef.current, newFolders);
    },
    [scheduleAutoSaveOnline]
  );

  const activeFolder = useMemo(() => {
    return folders.find(f => f.id === settings.selectedFolderId) || folders[0] || null;
  }, [folders, settings.selectedFolderId]);

  const activeFolderId = activeFolder?.id || settings.selectedFolderId;

  const activeModeConfig = useMemo(() => {
    return {
      showNumberHints: settings.showNumberHints,
    };
  }, [settings.showNumberHints]);

  const filteredItems = useMemo(() => {
    return filterItemsByFolder(items, activeFolderId);
  }, [items, activeFolderId]);

  const nextPlayableFolder = useMemo(() => {
    return getNextPlayableFolder(folders, items, activeFolderId);
  }, [folders, items, activeFolderId]);

  // Reset stage progress when selected folder changes
  useEffect(() => {
    setCompletedStagesInLevel([]);
    setCurrentIndex(0);
  }, [activeFolderId]);

  useEffect(() => {
    if (currentIndex >= filteredItems.length) {
      setCurrentIndex(0);
    }
  }, [filteredItems.length, currentIndex]);

  const currentItem = filteredItems[currentIndex] || filteredItems[0] || null;

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
  const handlePlayAnotherCurrentFolder = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    if (isLevelComplete) {
      // Restart all stages in this folder from stage 1
      setCompletedStagesInLevel([]);
      setCurrentIndex(0);
      return;
    }
    // Find next uncompleted stage in this folder
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

  const handleGoToNextFolder = () => {
    sound.playClick();
    setIsVictoryOpen(false);
    setCompletedStagesInLevel([]);
    if (nextPlayableFolder) {
      handleUpdateSettings({
        ...settings,
        selectedFolderId: nextPlayableFolder.id,
      });
    }
    setCurrentIndex(0);
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
    const nextSettings: GameSettings = {
      ...settings,
      selectedFolderId: item.folderId,
    };
    handleUpdateSettings(nextSettings);

    const newList = filterItemsByFolder(items, item.folderId);
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
        mode={currentItem?.mode || 'sentence'}
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
          folders={folders}
          items={items}
        />
      ) : settings.playerMode === 'two' ? (
        <TwoPlayerArena
          settings={settings}
          activeModeConfig={activeModeConfig}
          selectedFolderName={activeFolder?.name || 'Vocabulary'}
          filteredItems={filteredItems}
          onUpdateSettings={handleUpdateSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGoToTitleScreen={handleGoToTitleScreen}
        />
      ) : (
        <div className="relative z-10 w-full min-h-dvh gameplay-fit-tall flex flex-col justify-between p-2 sm:p-4 gap-2 sm:gap-3">
          
          {/* Top Game HUD */}
          <header className="w-full max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-2 px-1 z-30">
            
            {/* Left: Home & Mode/Folder Status */}
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
                <span className="text-sky-700 truncate max-w-[200px] sm:max-w-[340px]">
                  {activeFolder?.name || 'Vocabulary'}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="tabular-nums text-slate-600">
                  {filteredItems.length > 0 ? `${currentIndex + 1}/${filteredItems.length}` : '0/0'}
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

              <FullscreenButton variant="hud" />
            </div>
          </header>

          {/* Top Answer Display Panel: Build Sentence / Spell Word (clearly visible to class & teacher) */}
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
              section="slots"
            />
          )}

          {/* Main Interactive Drag & Connect Playfield */}
          <main className="w-full max-w-[1680px] mx-auto flex-1 min-h-0 flex flex-col">
            {currentItem ? (
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
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white/95 rounded-3xl shadow-xl border-2 border-white p-6 sm:p-8 max-w-md w-full text-center space-y-4">
                  <h2 className="text-xl font-black text-slate-900">
                    No Items in "{activeFolder?.name || 'this folder'}"
                  </h2>
                  <p className="text-sm font-semibold text-slate-600">
                    Open Options to add words or sentences to this folder or select another folder.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow cursor-pointer"
                    >
                      Open Options
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToTitleScreen}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
                    >
                      Title Screen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Bottom Player Controls: Listen, Clear, Move & Tap, Swap Line & Check Answer */}
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
              section="controls"
            />
          )}
        </div>
      )}

      {/* Victory Modal with Folder Continuation */}
      {currentItem && (
        <VictoryModal
          isOpen={isVictoryOpen}
          item={currentItem}
          folderName={activeFolder?.name || 'Vocabulary'}
          nextFolder={nextPlayableFolder}
          completedStagesCount={completedStagesCount}
          totalStagesInFolder={filteredItems.length}
          isFolderComplete={isLevelComplete}
          onPlayAnotherCurrentFolder={handlePlayAnotherCurrentFolder}
          onGoToNextFolder={handleGoToNextFolder}
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
        folders={folders}
        onUpdateFolders={handleUpdateFolders}
        items={items}
        onUpdateItems={handleUpdateItems}
        onSelectPlayItem={handleSelectPlayItem}
        githubStatus={githubStatus}
        isGitHubOnline={isGitHubOnline}
        githubConnectionDetail={githubConnectionDetail}
        lastGitHubSyncError={lastGitHubSyncError}
        lastGitHubSyncedAt={lastGitHubSyncedAt}
        autoSaveFixAttempted={autoSaveFixAttempted}
        isSyncingOnline={isSyncingOnline}
        onRefreshGitHubStatus={refreshGitHubStatus}
        onSaveOnlineToGitHub={() => pushDatabaseToGitHub(itemsRef.current, settingsRef.current, undefined, foldersRef.current)}
        onLoadOnlineFromGitHub={() => loadFromGitHubNow(true)}
        onFixAutoSaveConnection={handleFixAutoSaveConnection}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
