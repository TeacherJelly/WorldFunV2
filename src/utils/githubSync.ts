import { GitHubSyncConfig } from '../types';

export interface GitHubServerStatus {
  backendAvailable: boolean;
  serverTokenConfigured: boolean;
  oauthEnabled: boolean;
  oauthConnected: boolean;
  oauthLogin: string | null;
  defaultRepo: string;
  defaultBranch: string;
  defaultPath: string;
  oauthCallbackUrl?: string;
}

export interface GitHubLoadResponse {
  exists: boolean;
  content?: string;
  sha?: string | null;
  repo: string;
  branch: string;
  filePath: string;
  source?: 'api' | 'raw' | 'raw-direct' | 'api-direct' | 'static-local';
}

export interface GitHubSaveResponse {
  success: boolean;
  repo: string;
  branch: string;
  filePath: string;
  sha?: string | null;
  commitUrl?: string | null;
}

export interface GitHubDiagnosticCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface GitHubRequirementItem {
  id: string;
  name: string;
  envVar?: string;
  status: 'met' | 'action_needed' | 'missing';
  valueSummary: string;
  instruction: string;
}

export interface GitHubRequirementsReport {
  canAutoLoad: boolean;
  canAutoSave: boolean;
  isStaticHost: boolean;
  resolvedRepo: string;
  resolvedBranch: string;
  resolvedPath: string;
  callbackUrl: string;
  githubEditUrl: string | null;
  envTemplate: string;
  headline: string;
  items: GitHubRequirementItem[];
}

const SESSION_STORAGE_KEY = 'wordfun_gh_oauth_sid';

export function getStoredOAuthSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredOAuthSessionId(sessionId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionId) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage error
  }
}

function authHeaders(): Record<string, string> {
  const sid = getStoredOAuthSessionId();
  return sid ? { 'x-github-session': sid } : {};
}

export function normalizeRepoSlug(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const urlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i
  );
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2]}`;
  }
  const clean = trimmed.replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(clean) ? clean : '';
}

export function sanitizeBranchName(raw?: string): string {
  const b = (raw || '').trim();
  return b && /^[A-Za-z0-9_.\-\/]+$/.test(b) && !b.includes('..') ? b : 'main';
}

/**
 * Strictly enforces a .txt Notepad database file path (no .json database paths).
 */
export function normalizeTxtFilePath(raw?: string): string {
  const p = (raw || '').trim().replace(/^\/+/, '');
  const clean = p && !p.includes('..') && /^[A-Za-z0-9_.\-\/]+$/.test(p) ? p : 'wordfun-database.txt';
  const base = clean.replace(/\.(txt|json)$/i, '') || 'wordfun-database';
  return `${base}.txt`;
}

function encodeGitHubPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

function decodeBase64Utf8(base64: string): string {
  const clean = base64.replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function looksLikeTxtDatabaseContent(text: string): boolean {
  const trimmed = text.replace(/^\uFEFF/, '').trim();
  if (!trimmed) return false;
  if (/^<!doctype\b/i.test(trimmed) || /^<html\b/i.test(trimmed)) return false;
  return /@(VERSION|SAVED_AT)|\[(SETTINGS|FOLDERS|FOLDER|VOCABULARY|ITEMS|ITEM)\]/i.test(trimmed);
}

export function inferGitHubRepoFromLocation(): {
  repo: string;
  branch?: string;
  filePath?: string;
  source?: 'url-param' | 'github-pages';
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const paramRepo = normalizeRepoSlug(params.get('gh') || params.get('repo') || '');
    if (paramRepo) {
      const paramBranch = params.get('branch');
      const paramPath = params.get('path');
      return {
        repo: paramRepo,
        ...(paramBranch ? { branch: sanitizeBranchName(paramBranch) } : {}),
        ...(paramPath ? { filePath: normalizeTxtFilePath(paramPath) } : {}),
        source: 'url-param',
      };
    }

    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('.github.io')) {
      const owner = host.slice(0, -'.github.io'.length);
      if (owner && /^[A-Za-z0-9_.-]+$/.test(owner)) {
        const seg = window.location.pathname.split('/').filter(Boolean)[0] || '';
        const repoName = seg && /^[A-Za-z0-9_.-]+$/.test(seg) ? seg : `${owner}.github.io`;
        return {
          repo: `${owner}/${repoName}`,
          branch: 'main',
          filePath: 'wordfun-database.txt',
          source: 'github-pages',
        };
      }
    }
  } catch {
    // Ignore URL parsing issues
  }

  return null;
}

export async function discoverPublicGitHubConfig(): Promise<{
  repo: string;
  branch: string;
  filePath: string;
  source: 'url-param' | 'build-env' | 'public-manifest' | 'github-pages' | 'none';
}> {
  const fromUrl = inferGitHubRepoFromLocation();
  if (fromUrl?.source === 'url-param' && fromUrl.repo) {
    return {
      repo: fromUrl.repo,
      branch: sanitizeBranchName(fromUrl.branch),
      filePath: normalizeTxtFilePath(fromUrl.filePath),
      source: 'url-param',
    };
  }

  const buildRepo =
    typeof __BUILD_GITHUB_REPO__ === 'string' ? normalizeRepoSlug(__BUILD_GITHUB_REPO__) : '';
  const buildBranch =
    typeof __BUILD_GITHUB_BRANCH__ === 'string' && __BUILD_GITHUB_BRANCH__.trim()
      ? sanitizeBranchName(__BUILD_GITHUB_BRANCH__)
      : 'main';
  const buildPath =
    typeof __BUILD_GITHUB_DB_PATH__ === 'string' && __BUILD_GITHUB_DB_PATH__.trim()
      ? normalizeTxtFilePath(__BUILD_GITHUB_DB_PATH__)
      : 'wordfun-database.txt';

  if (buildRepo) {
    return {
      repo: buildRepo,
      branch: buildBranch,
      filePath: buildPath,
      source: 'build-env',
    };
  }

  if (typeof window !== 'undefined') {
    try {
      const manifestRes = await fetch(`./github-sync.json?t=${Date.now()}`, { cache: 'no-store' });
      const contentType = manifestRes.headers.get('content-type') || '';
      if (manifestRes.ok && (contentType.includes('json') || contentType.includes('text/plain'))) {
        const manifest = (await manifestRes.json()) as {
          repo?: string;
          branch?: string;
          filePath?: string;
        };
        const manifestRepo = normalizeRepoSlug(manifest.repo || '');
        if (manifestRepo) {
          return {
            repo: manifestRepo,
            branch: sanitizeBranchName(manifest.branch),
            filePath: normalizeTxtFilePath(manifest.filePath),
            source: 'public-manifest',
          };
        }
      }
    } catch {
      // Ignore missing or unreadable public manifest
    }
  }

  if (fromUrl?.source === 'github-pages' && fromUrl.repo) {
    return {
      repo: fromUrl.repo,
      branch: 'main',
      filePath: 'wordfun-database.txt',
      source: 'github-pages',
    };
  }

  return {
    repo: '',
    branch: 'main',
    filePath: 'wordfun-database.txt',
    source: 'none',
  };
}

export async function fetchGitHubStatus(): Promise<GitHubServerStatus> {
  const discovered = await discoverPublicGitHubConfig();

  try {
    const res = await fetch('/api/github-db/status', {
      credentials: 'include',
      headers: {
        ...authHeaders(),
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = (await res.json()) as Partial<GitHubServerStatus>;
      return {
        backendAvailable: data.backendAvailable ?? true,
        serverTokenConfigured: Boolean(data.serverTokenConfigured),
        oauthEnabled: Boolean(data.oauthEnabled),
        oauthConnected: Boolean(data.oauthConnected),
        oauthLogin: data.oauthLogin || null,
        defaultRepo: data.defaultRepo || discovered.repo || '',
        defaultBranch: data.defaultBranch || discovered.branch || 'main',
        defaultPath: normalizeTxtFilePath(data.defaultPath || discovered.filePath),
        oauthCallbackUrl: data.oauthCallbackUrl,
      };
    }
  } catch {
    // Backend unavailable (static hosting / GitHub Pages / offline)
  }

  return {
    backendAvailable: false,
    serverTokenConfigured: false,
    oauthEnabled: false,
    oauthConnected: false,
    oauthLogin: null,
    defaultRepo: discovered.repo,
    defaultBranch: discovered.branch,
    defaultPath: discovered.filePath,
  };
}

export async function fetchGitHubOAuthUrl(): Promise<string> {
  const res = await fetch('/api/github/auth/url', {
    credentials: 'include',
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'GitHub OAuth requires running the Node server backend (node server.ts), not a static GitHub Pages host.'
    );
  }
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Could not start GitHub OAuth sign-in.');
  }
  return data.url;
}

export async function disconnectGitHubOAuth(): Promise<void> {
  await fetch('/api/github/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'WordFun',
      ...authHeaders(),
    },
  }).catch(() => {});
  setStoredOAuthSessionId(null);
}

async function fetchDirectTxtFromGitHub(
  slug: string,
  branch: string,
  txtFilePath: string,
  preferFreshApi = false
): Promise<GitHubLoadResponse | null> {
  const parts = slug.split('/');
  if (parts.length !== 2) return null;
  const [owner, repo] = parts;
  const cleanTxtPath = normalizeTxtFilePath(txtFilePath);
  const encodedPath = encodeGitHubPath(cleanTxtPath);

  const tryRaw = async (targetBranch: string): Promise<GitHubLoadResponse | null> => {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(targetBranch)}/${encodedPath}?t=${Date.now()}`;
      const rawRes = await fetch(rawUrl, { cache: 'no-store' });
      if (rawRes.ok) {
        const text = await rawRes.text();
        if (looksLikeTxtDatabaseContent(text)) {
          return {
            exists: true,
            content: text,
            sha: null,
            repo: slug,
            branch: targetBranch,
            filePath: cleanTxtPath,
            source: 'raw-direct',
          };
        }
      }
    } catch {
      // Ignore raw CDN error
    }
    return null;
  };

  const tryApi = async (targetBranch: string): Promise<GitHubLoadResponse | null> => {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(targetBranch)}&t=${Date.now()}`;
      const apiRes = await fetch(apiUrl, { cache: 'no-store' });
      if (apiRes.ok) {
        const data = (await apiRes.json()) as {
          content?: string;
          encoding?: string;
          sha?: string;
          download_url?: string;
        };
        let content = '';
        if (data.content && data.encoding === 'base64') {
          content = decodeBase64Utf8(data.content);
        } else if (data.download_url) {
          const dlRes = await fetch(data.download_url, { cache: 'no-store' });
          if (dlRes.ok) content = await dlRes.text();
        }
        if (looksLikeTxtDatabaseContent(content)) {
          return {
            exists: true,
            content,
            sha: data.sha || null,
            repo: slug,
            branch: targetBranch,
            filePath: cleanTxtPath,
            source: 'api-direct',
          };
        }
      }
    } catch {
      // Ignore API error
    }
    return null;
  };

  const tryBranch = async (targetBranch: string): Promise<GitHubLoadResponse | null> => {
    if (preferFreshApi) {
      return (await tryApi(targetBranch)) || (await tryRaw(targetBranch));
    }
    return (await tryRaw(targetBranch)) || (await tryApi(targetBranch));
  };

  const primaryAttempt = await tryBranch(branch);
  if (primaryAttempt) return primaryAttempt;

  // Auto-detect default branch (e.g., master vs main) if configured branch returned nothing
  if (branch === 'main') {
    try {
      const repoMetaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (repoMetaRes.ok) {
        const meta = (await repoMetaRes.json()) as { default_branch?: string };
        const actualBranch = meta.default_branch ? sanitizeBranchName(meta.default_branch) : '';
        if (actualBranch && actualBranch !== branch) {
          const branchAttempt = await tryBranch(actualBranch);
          if (branchAttempt) return branchAttempt;
        }
      }
    } catch {
      // Ignore repo metadata failure
    }
  }

  return null;
}

async function fetchStaticLocalTxtDatabase(
  txtFilePath: string,
  repo: string,
  branch: string
): Promise<GitHubLoadResponse | null> {
  if (typeof window === 'undefined') return null;

  const cleanRel = normalizeTxtFilePath(txtFilePath).replace(/^\/+/, '');
  try {
    const res = await fetch(`./${cleanRel}?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      if (looksLikeTxtDatabaseContent(text)) {
        return {
          exists: true,
          content: text,
          sha: null,
          repo,
          branch,
          filePath: cleanRel,
          source: 'static-local',
        };
      }
    }
  } catch {
    // Ignore local fetch miss
  }
  return null;
}

export async function loadDatabaseFromGitHub(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath'>,
  preferFreshApi = false
): Promise<GitHubLoadResponse> {
  const cleanRepo = normalizeRepoSlug(config.repo);
  const cleanBranch = sanitizeBranchName(config.branch);
  const cleanTxtPath = normalizeTxtFilePath(config.filePath);

  let backendError: string | null = null;

  // 1) Backend proxy API first (supports private repos via GITHUB_TOKEN or OAuth, strictly .txt)
  if (cleanRepo) {
    try {
      const params = new URLSearchParams({
        repo: cleanRepo,
        branch: cleanBranch,
        path: cleanTxtPath,
      });

      const res = await fetch(`/api/github-db?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          ...authHeaders(),
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = (await res.json()) as GitHubLoadResponse & { error?: string };
        if (res.ok && data.exists && data.content) {
          return data;
        }
        if (res.ok && !data.exists) {
          const staticFallback = await fetchStaticLocalTxtDatabase(cleanTxtPath, cleanRepo, cleanBranch);
          if (staticFallback) return staticFallback;
          return data;
        }
        backendError = data.error || `Server GitHub proxy error (${res.status})`;
      }
    } catch (err) {
      backendError = err instanceof Error ? err.message : 'Backend sync endpoint unreachable';
    }

    // 2) Direct client-side GitHub .txt fetch (works on GitHub Pages, mobile, PC without Node server)
    const directResult = await fetchDirectTxtFromGitHub(
      cleanRepo,
      cleanBranch,
      cleanTxtPath,
      preferFreshApi
    );
    if (directResult) {
      return directResult;
    }
  }

  // 3) Same-origin static .txt database fallback
  const staticResult = await fetchStaticLocalTxtDatabase(cleanTxtPath, cleanRepo, cleanBranch);
  if (staticResult) {
    return staticResult;
  }

  if (backendError && !cleanRepo) {
    throw new Error(backendError);
  }

  return {
    exists: false,
    repo: cleanRepo || config.repo.trim(),
    branch: cleanBranch,
    filePath: cleanTxtPath,
  };
}

export async function saveDatabaseToGitHub(
  content: string,
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath'>,
  message?: string
): Promise<GitHubSaveResponse> {
  const cleanTxtPath = normalizeTxtFilePath(config.filePath);
  const res = await fetch('/api/github-db', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'WordFun',
      ...authHeaders(),
    },
    body: JSON.stringify({
      content,
      repo: config.repo.trim(),
      branch: sanitizeBranchName(config.branch),
      path: cleanTxtPath,
      message,
    }),
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Static/browser-only host detected: direct GitHub auto-saving requires running the Node server (node server.ts) with GITHUB_TOKEN or OAuth.'
    );
  }
  const data = (await res.json()) as GitHubSaveResponse & { error?: string; code?: string };
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to save .txt database to GitHub.') as Error & {
      code?: string;
    };
    err.code = data.code;
    throw err;
  }
  return data;
}

export async function publishAutoConnectConfigToRepo(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath'>
): Promise<{ success: boolean; message: string; commitUrl?: string | null }> {
  const cleanTxtPath = normalizeTxtFilePath(config.filePath);
  const res = await fetch('/api/github-db/publish-config', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'WordFun',
      ...authHeaders(),
    },
    body: JSON.stringify({
      repo: config.repo.trim(),
      branch: sanitizeBranchName(config.branch),
      path: cleanTxtPath,
    }),
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      success: false,
      message:
        'Publishing config requires the Node backend server (node server.ts). public/github-sync.json is already configured in static files.',
    };
  }
  const data = (await res.json()) as {
    success?: boolean;
    error?: string;
    repo?: string;
    commitUrl?: string | null;
  };
  if (!res.ok || !data.success) {
    return {
      success: false,
      message: data.error || 'Could not publish public/github-sync.json to repository.',
    };
  }
  return {
    success: true,
    message: `Published public/github-sync.json to ${data.repo}. Every device opening this repo will now auto-connect!`,
    commitUrl: data.commitUrl || null,
  };
}

export function buildAutoConnectUrl(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath'>
): string {
  if (typeof window === 'undefined') return '';
  const cleanRepo = normalizeRepoSlug(config.repo);
  if (!cleanRepo) return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('gh', cleanRepo);
  url.searchParams.set('branch', sanitizeBranchName(config.branch));
  url.searchParams.set('path', normalizeTxtFilePath(config.filePath));
  return url.toString();
}

export function buildGitHubEditFileUrl(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath'>,
  fileExistsInRepo = true
): string | null {
  const cleanRepo = normalizeRepoSlug(config.repo);
  if (!cleanRepo) return null;
  const branch = sanitizeBranchName(config.branch);
  const cleanTxtPath = normalizeTxtFilePath(config.filePath);
  if (fileExistsInRepo) {
    return `https://github.com/${cleanRepo}/edit/${encodeURIComponent(branch)}/${encodeGitHubPath(cleanTxtPath)}`;
  }
  return `https://github.com/${cleanRepo}/upload/${encodeURIComponent(branch)}`;
}

export function evaluateGitHubRequirements(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath' | 'autoSaveOnline'>,
  status: GitHubServerStatus | null,
  online: boolean,
  lastSyncError?: string | null,
  txtExistsPublicly?: boolean
): GitHubRequirementsReport {
  const resolvedRepo = normalizeRepoSlug(config.repo) || status?.defaultRepo || '';
  const resolvedBranch = sanitizeBranchName(config.branch || status?.defaultBranch);
  const resolvedPath = normalizeTxtFilePath(config.filePath || status?.defaultPath);
  const isBackendRunning = Boolean(status?.backendAvailable);
  const isStaticHost = Boolean(status && !status.backendAvailable);
  const hasServerToken = Boolean(status?.serverTokenConfigured);
  const hasOAuthClientCreds = Boolean(status?.oauthEnabled);
  const isOAuthConnected = Boolean(status?.oauthConnected);
  const hasWriteCreds = hasServerToken || isOAuthConnected;
  const callbackUrl =
    status?.oauthCallbackUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/auth/github/callback`
      : 'https://<your-app-domain>/auth/github/callback');

  const items: GitHubRequirementItem[] = [
    {
      id: 'req-internet',
      name: '1. Internet Connection',
      status: online ? 'met' : 'missing',
      valueSummary: online ? 'Device is online' : 'Browser is offline',
      instruction: online
        ? 'Network connection is active.'
        : 'Reconnect this device to Wi-Fi or mobile data. Offline edits are safely queued locally.',
    },
    {
      id: 'req-repo',
      name: '2. GitHub Repository Target',
      envVar: 'GITHUB_REPO',
      status: resolvedRepo ? 'met' : 'missing',
      valueSummary: resolvedRepo || 'Not configured',
      instruction: resolvedRepo
        ? `Target repository is "${resolvedRepo}".`
        : 'Enter owner/repo (e.g. TeacherJelly/WorldFunV2) or set GITHUB_REPO in your server environment.',
    },
    {
      id: 'req-txt',
      name: '3. Branch & Single .txt Database File',
      envVar: 'GITHUB_BRANCH / GITHUB_DB_PATH',
      status: resolvedRepo ? 'met' : 'action_needed',
      valueSummary: `${resolvedBranch} → ${resolvedPath} (.txt only)`,
      instruction:
        'Only one readable Notepad file (.txt) is used for both saving and loading. No .json database file is needed.',
    },
    {
      id: 'req-server',
      name: '4. Node Sync Backend Server',
      status: isBackendRunning ? 'met' : 'missing',
      valueSummary: isBackendRunning
        ? 'Active (/api/github-db ready)'
        : 'Static host detected (e.g. GitHub Pages — no Node backend)',
      instruction: isBackendRunning
        ? 'Express + Node server is running and ready to push commits to GitHub.'
        : 'GitHub Pages hosts static HTML/JS only and strips private secrets. Keep Node server running (AI Studio, Cloud Run, Render, or Railway) for live auto-save, OR click Download & Edit on GitHub below.',
    },
    {
      id: 'req-token',
      name: '5. GitHub Write Access (Token or OAuth)',
      envVar: 'GITHUB_TOKEN / GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET',
      status: hasWriteCreds
        ? 'met'
        : isBackendRunning && hasOAuthClientCreds
        ? 'action_needed'
        : 'missing',
      valueSummary: hasServerToken
        ? 'Server GITHUB_TOKEN active (auto-saves without sign-in)'
        : isOAuthConnected
        ? `OAuth connected as @${status?.oauthLogin || 'user'}`
        : isBackendRunning && hasOAuthClientCreds
        ? 'OAuth ready — click Connect GitHub Account'
        : isStaticHost
        ? 'Private tokens cannot be stored on static GitHub Pages'
        : 'Missing GITHUB_TOKEN (and OAuth not connected)',
      instruction: hasWriteCreds
        ? 'Server write credentials are active.'
        : isBackendRunning && hasOAuthClientCreds
        ? 'Set GITHUB_TOKEN in server environment variables (with "repo" scope) for automatic headless saving, or sign in via Connect GitHub Account.'
        : 'Add GITHUB_TOKEN (classic PAT with "repo" scope, or fine-grained PAT with Contents: Read & Write) plus optional GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your Node server environment secrets.',
    },
    {
      id: 'req-callback',
      name: '6. GitHub OAuth Callback URL',
      envVar: 'GitHub OAuth App Setting',
      status: hasServerToken || isOAuthConnected ? 'met' : hasOAuthClientCreds ? 'action_needed' : 'missing',
      valueSummary: callbackUrl,
      instruction:
        'In GitHub Developer Settings → OAuth Apps, set Authorization callback URL to match your hosted app domain.',
    },
  ];

  const repoVal = resolvedRepo || 'TeacherJelly/WorldFunV2';
  const envTemplate = [
    `GITHUB_REPO=${repoVal}`,
    `GITHUB_BRANCH=${resolvedBranch}`,
    `GITHUB_DB_PATH=${resolvedPath}`,
    'GITHUB_TOKEN=<paste-github-pat-with-repo-contents-write-permission>',
    'GITHUB_CLIENT_ID=<optional-github-oauth-client-id>',
    'GITHUB_CLIENT_SECRET=<optional-github-oauth-client-secret>',
    `# GitHub OAuth Callback URL: ${callbackUrl}`,
  ].join('\n');

  const canAutoLoad = online && Boolean(resolvedRepo);
  const canAutoSave =
    online &&
    Boolean(resolvedRepo) &&
    isBackendRunning &&
    hasWriteCreds &&
    config.autoSaveOnline &&
    !lastSyncError;

  let headline = 'All requirements are met — automatic GitHub saving and .txt loading are active.';
  if (!online) {
    headline = 'Offline: Connect to the internet to resume automatic GitHub saving.';
  } else if (isStaticHost) {
    headline =
      'Static/Read-Only Host: Auto-loading .txt from GitHub works on every device! Direct auto-save cannot commit from GitHub Pages because GitHub rejects browser-exposed secrets — run your Node server URL for auto-save, or use the 1-click GitHub .txt upload button below.';
  } else if (!resolvedRepo) {
    headline = 'Requirement needed: Enter your GitHub owner/repo (e.g. TeacherJelly/WorldFunV2).';
  } else if (!hasWriteCreds) {
    headline = hasOAuthClientCreds
      ? 'Action needed: Connect your GitHub account or add GITHUB_TOKEN to your Node server secrets to enable auto-save.'
      : 'Requirement needed: Add GITHUB_TOKEN (repo contents write access) to your Node server environment.';
  } else if (!config.autoSaveOnline) {
    headline = 'Auto-save toggle is turned off — turn it on or click Fix Auto-Save to re-enable.';
  } else if (lastSyncError) {
    headline = `Auto-save error: ${lastSyncError}`;
  }

  return {
    canAutoLoad,
    canAutoSave,
    isStaticHost,
    resolvedRepo,
    resolvedBranch,
    resolvedPath,
    callbackUrl,
    githubEditUrl: buildGitHubEditFileUrl(
      { repo: resolvedRepo, branch: resolvedBranch, filePath: resolvedPath },
      txtExistsPublicly ?? true
    ),
    envTemplate,
    headline,
    items,
  };
}

export async function runGitHubConnectionDiagnostics(
  config: Pick<GitHubSyncConfig, 'repo' | 'branch' | 'filePath' | 'autoSaveOnline'>,
  lastSyncError?: string | null
): Promise<{
  checks: GitHubDiagnosticCheck[];
  resolvedRepo: string;
  resolvedBranch: string;
  resolvedPath: string;
  status: GitHubServerStatus;
  requirements: GitHubRequirementsReport;
  txtReadable: boolean;
}> {
  const checks: GitHubDiagnosticCheck[] = [];
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  checks.push({
    id: 'internet',
    label: 'Internet Connection',
    ok: online,
    detail: online ? 'Device is online.' : 'Browser reports offline.',
  });

  const status = await fetchGitHubStatus();
  checks.push({
    id: 'backend',
    label: 'Server Sync API (/api/github-db)',
    ok: status.backendAvailable,
    detail: status.backendAvailable
      ? `Running (${status.serverTokenConfigured ? 'GITHUB_TOKEN active' : status.oauthConnected ? `OAuth @${status.oauthLogin}` : 'OAuth ready'})`
      : 'Static/browser-only host detected — direct GitHub .txt CDN auto-load is active; auto-save requires the Node server (node server.ts).',
  });

  const resolvedRepo = normalizeRepoSlug(config.repo) || status.defaultRepo;
  const resolvedBranch = sanitizeBranchName(config.branch || status.defaultBranch);
  const resolvedPath = normalizeTxtFilePath(config.filePath || status.defaultPath);

  checks.push({
    id: 'target',
    label: 'Repository Target',
    ok: Boolean(resolvedRepo),
    detail: resolvedRepo
      ? `${resolvedRepo} (branch: ${resolvedBranch})`
      : 'No owner/repo set yet. Enter your GitHub repository above or open via an Auto-Connect link.',
  });

  let txtReadable = false;
  if (online && resolvedRepo) {
    const hit = await fetchDirectTxtFromGitHub(resolvedRepo, resolvedBranch, resolvedPath);
    txtReadable = Boolean(hit?.exists);
    if (!txtReadable && status.backendAvailable && (status.serverTokenConfigured || status.oauthConnected)) {
      const apiHit = await loadDatabaseFromGitHub({
        repo: resolvedRepo,
        branch: resolvedBranch,
        filePath: resolvedPath,
      }).catch(() => null);
      txtReadable = Boolean(apiHit?.exists);
      checks.push({
        id: 'primary-txt',
        label: `Database .txt (${resolvedPath})`,
        ok: txtReadable,
        detail: txtReadable
          ? `Found & readable on branch "${apiHit?.branch || resolvedBranch}" (${apiHit?.source || 'server-api'})`
          : 'Not found yet in repository (will be created automatically on first save).',
      });
    } else {
      checks.push({
        id: 'primary-txt',
        label: `Database .txt (${resolvedPath})`,
        ok: txtReadable,
        detail: txtReadable
          ? `Found & readable on branch "${hit?.branch || resolvedBranch}" (${hit?.source})`
          : 'Not found publicly yet (if repo is private, requires server GITHUB_TOKEN or OAuth; otherwise first save creates it).',
      });
    }
  }

  const requirements = evaluateGitHubRequirements(
    config,
    status,
    online,
    lastSyncError,
    txtReadable
  );

  return {
    checks,
    resolvedRepo,
    resolvedBranch,
    resolvedPath,
    status,
    requirements,
    txtReadable,
  };
}
