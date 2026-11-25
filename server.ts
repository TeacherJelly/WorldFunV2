import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type GreetingLang = 'en' | 'zh';

const VOICE_PROMPTS: Record<GreetingLang, { text: string; style: string; voiceName: string }> = {
  en: {
    text: 'Hello!',
    style:
      "Adorable, bubbly 6-year-old boy fox mascot greeting warmly and happily in a bright, real cute kid's voice",
    voiceName: 'Puck',
  },
  zh: {
    text: '你好！',
    style:
      "Adorable, bubbly 6-year-old Mandarin-speaking child fox mascot greeting warmly and happily in a bright, real cute kid's voice",
    voiceName: 'Puck',
  },
};

const voiceCache = new Map<GreetingLang, Buffer>();
const inFlightVoices = new Map<GreetingLang, Promise<Buffer>>();

const ttsCache = new Map<string, Buffer>();
const ttsInFlight = new Map<string, Promise<Buffer>>();
const MAX_TTS_CACHE_ENTRIES = 120;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set it in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateCuteKidVoice(lang: GreetingLang): Promise<Buffer> {
  const cached = voiceCache.get(lang);
  if (cached) return cached;

  const existing = inFlightVoices.get(lang);
  if (existing) return existing;

  const spec = VOICE_PROMPTS[lang];
  const task = (async () => {
    const ai = getGeminiClient();
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: spec.text,
                  speechMetadata: {
                    style: spec.style,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: spec.voiceName },
              },
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const audioPart = parts.find(p => p.inlineData?.data);
        const base64Audio = audioPart?.inlineData?.data;

        if (!base64Audio) {
          throw new Error('Speech model returned no audio data.');
        }

        const wavBuffer = Buffer.from(base64Audio, 'base64');
        voiceCache.set(lang, wavBuffer);
        return wavBuffer;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient =
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('500') ||
          msg.includes('ECONNRESET') ||
          msg.includes('ETIMEDOUT');
        if (!isTransient || attempt === 2) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 350 * Math.pow(2, attempt)));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to generate speech.');
  })();

  inFlightVoices.set(lang, task);
  try {
    return await task;
  } finally {
    inFlightVoices.delete(lang);
  }
}

type TtsVoicePreset = 'kore' | 'aoede' | 'zephyr' | 'puck';

const TTS_VOICE_SPECS: Record<TtsVoicePreset, { voiceName: string; style: string }> = {
  kore: {
    voiceName: 'Kore',
    style: 'Warm, clear, friendly elementary school teacher pronouncing clearly for kids',
  },
  aoede: {
    voiceName: 'Aoede',
    style: 'Bright, cheerful, encouraging elementary school teacher speaking clearly for kids',
  },
  zephyr: {
    voiceName: 'Zephyr',
    style: 'Gentle, calm, articulate female storyteller pronouncing words clearly for kids',
  },
  puck: {
    voiceName: 'Puck',
    style: 'Playful, friendly young child voice pronouncing words clearly and happily',
  },
};

async function synthesizeGeneralTts(text: string, preset: TtsVoicePreset = 'kore'): Promise<Buffer> {
  const key = text.trim();
  const spec = TTS_VOICE_SPECS[preset] || TTS_VOICE_SPECS.kore;
  const cacheKey = `${preset}::${key}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) return cached;

  const existing = ttsInFlight.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    const ai = getGeminiClient();
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: key,
                  speechMetadata: {
                    style: spec.style,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: spec.voiceName },
              },
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const audioPart = parts.find(p => p.inlineData?.data);
        const base64Audio = audioPart?.inlineData?.data;
        if (!base64Audio) {
          throw new Error('Speech model returned no audio data.');
        }

        const wavBuffer = Buffer.from(base64Audio, 'base64');
        if (ttsCache.size >= MAX_TTS_CACHE_ENTRIES) {
          const oldestKey = ttsCache.keys().next().value;
          if (oldestKey !== undefined) ttsCache.delete(oldestKey);
        }
        ttsCache.set(cacheKey, wavBuffer);
        return wavBuffer;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient =
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('500') ||
          msg.includes('ECONNRESET') ||
          msg.includes('ETIMEDOUT');
        if (!isTransient || attempt === 2) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 350 * Math.pow(2, attempt)));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to synthesize speech.');
  })();

  ttsInFlight.set(cacheKey, task);
  try {
    return await task;
  } finally {
    ttsInFlight.delete(cacheKey);
  }
}

interface GitHubSession {
  token: string;
  login: string;
}

const githubOAuthSessions = new Map<string, GitHubSession>();
const githubOAuthStates = new Map<string, number>();
const GITHUB_COOKIE_NAME = 'wf_gh_session';

function parseCookies(header?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function getActiveGitHubOAuthSession(req: express.Request): { sessionId: string; session: GitHubSession } | null {
  const cookies = parseCookies(req.headers.cookie);
  const headerId = typeof req.headers['x-github-session'] === 'string' ? req.headers['x-github-session'].trim() : '';
  const sessionId = cookies[GITHUB_COOKIE_NAME] || headerId;
  if (!sessionId) return null;
  const session = githubOAuthSessions.get(sessionId);
  return session ? { sessionId, session } : null;
}

function resolveGitHubWriteTokens(req: express.Request): string[] {
  const tokens: string[] = [];
  const oauth = getActiveGitHubOAuthSession(req);
  if (oauth?.session.token) tokens.push(oauth.session.token);
  const envToken = process.env.GITHUB_TOKEN?.trim();
  if (envToken && !tokens.includes(envToken)) tokens.push(envToken);
  return tokens;
}

function resolveGitHubWriteToken(req: express.Request): string | null {
  return resolveGitHubWriteTokens(req)[0] || null;
}

function isTrustedCookieWriteRequest(req: express.Request): boolean {
  if (req.headers['x-requested-with'] || req.headers['x-github-session']) {
    return true;
  }
  const origin = req.headers.origin;
  const host = ((req.headers['x-forwarded-host'] as string) || req.get('host') || '').split(',')[0].trim();
  if (origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return !req.headers.cookie;
}

function parseValidatedGitHubTarget(rawRepo?: string, rawBranch?: string, rawPath?: string) {
  const repoInput = (rawRepo || process.env.GITHUB_REPO || '').trim();
  let slug = repoInput;
  const urlMatch = repoInput.match(
    /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i
  );
  if (urlMatch) {
    slug = `${urlMatch[1]}/${urlMatch[2]}`;
  } else {
    slug = slug.replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  }

  const slugParts = slug.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!slugParts) {
    return null;
  }

  const owner = slugParts[1];
  const repo = slugParts[2];
  const branchRaw = (rawBranch || process.env.GITHUB_BRANCH || 'main').trim();
  const branch = /^[A-Za-z0-9_.\-\/]+$/.test(branchRaw) && !branchRaw.includes('..') ? branchRaw : 'main';

  const pathRaw = (rawPath || process.env.GITHUB_DB_PATH || 'wordfun-database.txt')
    .trim()
    .replace(/^\/+/, '');
  const safePath =
    pathRaw &&
    !pathRaw.includes('..') &&
    /^[A-Za-z0-9_.\-\/]+$/.test(pathRaw)
      ? normalizeTxtDatabasePath(pathRaw)
      : 'wordfun-database.txt';

  return {
    owner,
    repo,
    slug: `${owner}/${repo}`,
    branch,
    filePath: safePath,
  };
}

// Always enforce .txt database path (no .json database needed)
function normalizeTxtDatabasePath(filePath: string): string {
  const clean = filePath.trim().replace(/^\/+/, '') || 'wordfun-database.txt';
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

function getAppBaseUrl(req: express.Request): string {
  const rawProto = ((req.headers['x-forwarded-proto'] as string) || req.protocol || 'https')
    .split(',')[0]
    .trim()
    .toLowerCase();
  const proto = rawProto === 'http' || rawProto === 'https' ? rawProto : 'https';
  const rawHost = ((req.headers['x-forwarded-host'] as string) || req.get('host') || '')
    .split(',')[0]
    .trim();
  if (rawHost && /^[A-Za-z0-9.-]+(?::\d+)?$/.test(rawHost)) {
    return `${proto}://${rawHost}`;
  }
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && !envUrl.includes('MY_APP_URL')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

async function fetchFileFromGitHubSingle(
  owner: string,
  repo: string,
  branch: string,
  candidatePath: string,
  token: string | null
): Promise<{
  found: boolean;
  content?: string;
  sha?: string | null;
  source?: 'api' | 'raw';
  authRejected?: boolean;
}> {
  const encodedPath = encodeGitHubPath(candidatePath);

  if (token) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const ghRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'WordFun-App',
        'Cache-Control': 'no-cache',
      },
    });

    if (ghRes.ok) {
      const data = (await ghRes.json()) as {
        content?: string;
        encoding?: string;
        sha?: string;
        download_url?: string;
      };

      let content = '';
      if (data.content && data.encoding === 'base64') {
        content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      } else if (data.download_url) {
        const rawRes = await fetch(data.download_url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (rawRes.ok) {
          content = await rawRes.text();
        }
      }

      if (content.trim()) {
        return { found: true, content, sha: data.sha || null, source: 'api' };
      }
    } else if (ghRes.status !== 404 && ghRes.status !== 401 && ghRes.status !== 403) {
      const errBody = await ghRes.text().catch(() => '');
      throw new Error(`GitHub API error (${ghRes.status}): ${errBody.slice(0, 200)}`);
    }
  }

  // Fallback to public raw.githubusercontent.com (also recovers if token expired or lacks scope on a public repo)
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}?t=${Date.now()}`;
  const rawRes = await fetch(rawUrl, {
    headers: { 'Cache-Control': 'no-cache' },
  });

  if (rawRes.ok) {
    const content = await rawRes.text();
    if (content.trim()) {
      return { found: true, content, sha: null, source: 'raw' };
    }
  } else if (rawRes.status !== 404) {
    throw new Error(`GitHub raw fetch error (${rawRes.status})`);
  }

  return { found: false };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/mascot-voice', async (req, res) => {
    const rawLang = typeof req.query.lang === 'string' ? req.query.lang.toLowerCase() : 'en';
    if (rawLang !== 'en' && rawLang !== 'zh') {
      res.status(400).json({ error: 'Invalid lang parameter. Expected "en" or "zh".' });
      return;
    }

    try {
      const wavBuffer = await generateCuteKidVoice(rawLang);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(wavBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to synthesize mascot voice.';
      const status =
        message.includes('GEMINI_API_KEY') || message.includes('API_KEY_INVALID')
          ? 400
          : message.includes('PERMISSION_DENIED')
            ? 403
            : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
              ? 429
              : 500;
      res.status(status).json({ error: message });
    }
  });

  app.get('/api/tts', async (req, res) => {
    const rawText = typeof req.query.text === 'string' ? req.query.text.trim() : '';
    const rawVoice = typeof req.query.voice === 'string' ? req.query.voice.toLowerCase() : 'kore';
    const voicePreset: TtsVoicePreset =
      rawVoice in TTS_VOICE_SPECS ? (rawVoice as TtsVoicePreset) : 'kore';

    if (!rawText || rawText.length > 240) {
      res.status(400).json({ error: 'Invalid text parameter.' });
      return;
    }

    try {
      const wavBuffer = await synthesizeGeneralTts(rawText, voicePreset);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(wavBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to synthesize speech.';
      const status =
        message.includes('GEMINI_API_KEY') || message.includes('API_KEY_INVALID')
          ? 400
          : message.includes('PERMISSION_DENIED')
            ? 403
            : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
              ? 429
              : 500;
      res.status(status).json({ error: message });
    }
  });

  // --- GitHub Notepad Database Sync & Optional 3P OAuth ---
  app.get('/api/github-db/status', (req, res) => {
    const oauth = getActiveGitHubOAuthSession(req);
    const defaultTarget = parseValidatedGitHubTarget();
    res.json({
      backendAvailable: true,
      serverTokenConfigured: Boolean(process.env.GITHUB_TOKEN?.trim()),
      oauthEnabled: Boolean(process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim()),
      oauthConnected: Boolean(oauth),
      oauthLogin: oauth?.session.login || null,
      defaultRepo: defaultTarget?.slug || '',
      defaultBranch: (process.env.GITHUB_BRANCH || 'main').trim(),
      defaultPath: (process.env.GITHUB_DB_PATH || 'wordfun-database.txt').trim(),
      oauthCallbackUrl: `${getAppBaseUrl(req)}/auth/github/callback`,
    });
  });

  app.get('/api/github/auth/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      res.status(400).json({
        error: 'GitHub OAuth is not configured on the server (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET).',
      });
      return;
    }
    const now = Date.now();
    for (const [k, exp] of githubOAuthStates.entries()) {
      if (exp < now) githubOAuthStates.delete(k);
    }
    const state = crypto.randomBytes(16).toString('hex');
    githubOAuthStates.set(state, now + 10 * 60 * 1000);

    const redirectUri = `${getAppBaseUrl(req)}/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo',
      state,
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  const handleGitHubOAuthCallback = async (req: express.Request, res: express.Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    if (!code || !clientId || !clientSecret) {
      res.status(400).send('<p>Missing authorization code or GitHub OAuth configuration.</p>');
      return;
    }

    const stateExpiry = state ? githubOAuthStates.get(state) : undefined;
    if (!state || !stateExpiry || stateExpiry < Date.now()) {
      res.status(400).send('<p>Invalid or expired GitHub sign-in state. Please try connecting again.</p>');
      return;
    }
    githubOAuthStates.delete(state);

    try {
      const redirectUri = `${getAppBaseUrl(req)}/auth/github/callback`;
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string; error_description?: string };
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'GitHub token exchange failed.');
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'WordFun-App',
        },
      });
      const userData = (await userRes.json()) as { login?: string };
      const login = userData.login || 'GitHub User';

      const sessionId = crypto.randomBytes(24).toString('hex');
      githubOAuthSessions.set(sessionId, { token: tokenData.access_token, login });

      const appBase = getAppBaseUrl(req);
      const isHttps = appBase.startsWith('https://');
      const cookieAttrs = [
        `${GITHUB_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
        'Path=/',
        'HttpOnly',
        `Max-Age=${60 * 60 * 24 * 14}`,
        ...(isHttps ? ['Secure', 'SameSite=None', 'Partitioned'] : ['SameSite=Lax']),
      ];
      res.setHeader('Set-Cookie', cookieAttrs.join('; '));

      const safePayload = JSON.stringify({
        type: 'GITHUB_OAUTH_SUCCESS',
        login,
        sessionId,
      });

      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 32px;">
            <script>
              if (window.opener) {
                window.opener.postMessage(${safePayload}, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>GitHub connected! You may close this window.</p>
          </body>
        </html>
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'GitHub sign-in failed.';
      res.status(500).send(`<p>GitHub authentication error: ${msg.replace(/[<>&]/g, '')}</p>`);
    }
  };

  app.get(['/auth/github/callback', '/auth/github/callback/'], handleGitHubOAuthCallback);

  app.post('/api/github/auth/logout', (req, res) => {
    if (!isTrustedCookieWriteRequest(req)) {
      res.status(403).json({ error: 'Untrusted request origin.' });
      return;
    }
    const oauth = getActiveGitHubOAuthSession(req);
    if (oauth) {
      githubOAuthSessions.delete(oauth.sessionId);
    }
    const isHttps = getAppBaseUrl(req).startsWith('https://');
    res.setHeader(
      'Set-Cookie',
      [
        `${GITHUB_COOKIE_NAME}=`,
        'Path=/',
        'HttpOnly',
        'Max-Age=0',
        ...(isHttps ? ['Secure', 'SameSite=None', 'Partitioned'] : ['SameSite=Lax']),
      ].join('; ')
    );
    res.json({ success: true });
  });

  app.get('/api/github-db', async (req, res) => {
    const target = parseValidatedGitHubTarget(
      typeof req.query.repo === 'string' ? req.query.repo : undefined,
      typeof req.query.branch === 'string' ? req.query.branch : undefined,
      typeof req.query.path === 'string' ? req.query.path : undefined
    );

    if (!target) {
      res.status(400).json({ error: 'Valid GitHub repository (owner/repo) is required.' });
      return;
    }

    const tokens = resolveGitHubWriteTokens(req);
    const txtPath = normalizeTxtDatabasePath(target.filePath);

    try {
      for (const token of [...tokens, null]) {
        const attempt = await fetchFileFromGitHubSingle(
          target.owner,
          target.repo,
          target.branch,
          txtPath,
          token
        );
        if (attempt.found && attempt.content) {
          res.json({
            exists: true,
            content: attempt.content,
            sha: attempt.sha || null,
            repo: target.slug,
            branch: target.branch,
            filePath: txtPath,
            source: attempt.source || 'raw',
          });
          return;
        }
      }

      // If branch was default 'main' and returned 404, check repository's actual default_branch (e.g. 'master')
      if (target.branch === 'main') {
        const token = tokens[0] || null;
        const repoMetaRes = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: 'application/vnd.github+json',
            'User-Agent': 'WordFun-App',
          },
        }).catch(() => null);

        if (repoMetaRes && repoMetaRes.ok) {
          const meta = (await repoMetaRes.json()) as { default_branch?: string };
          const actualBranch = meta.default_branch?.trim();
          if (actualBranch && actualBranch !== target.branch && !actualBranch.includes('..')) {
            for (const tk of [...tokens, null]) {
              const attempt = await fetchFileFromGitHubSingle(
                target.owner,
                target.repo,
                actualBranch,
                txtPath,
                tk
              );
              if (attempt.found && attempt.content) {
                res.json({
                  exists: true,
                  content: attempt.content,
                  sha: attempt.sha || null,
                  repo: target.slug,
                  branch: actualBranch,
                  filePath: txtPath,
                  source: attempt.source || 'raw',
                });
                return;
              }
            }
          }
        }
      }

      res.json({
        exists: false,
        repo: target.slug,
        branch: target.branch,
        filePath: txtPath,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load .txt database from GitHub.';
      res.status(502).json({ error: msg });
    }
  });

  app.put('/api/github-db', async (req, res) => {
    if (!isTrustedCookieWriteRequest(req)) {
      res.status(403).json({ error: 'Untrusted request origin.' });
      return;
    }

    const body = (req.body || {}) as {
      content?: string;
      repo?: string;
      branch?: string;
      path?: string;
      message?: string;
    };

    if (typeof body.content !== 'string' || !body.content.trim()) {
      res.status(400).json({ error: 'Database content is required.' });
      return;
    }

    const target = parseValidatedGitHubTarget(body.repo, body.branch, body.path);
    if (!target) {
      res.status(400).json({ error: 'Please enter a valid GitHub repository (owner/repo).' });
      return;
    }

    const tokens = resolveGitHubWriteTokens(req);
    if (tokens.length === 0) {
      res.status(401).json({
        code: 'AUTH_REQUIRED',
        error: 'GitHub write access is not configured yet. Connect GitHub or set GITHUB_TOKEN in Secrets.',
      });
      return;
    }

    const txtPath = normalizeTxtDatabasePath(target.filePath);
    const encodedPath = encodeGitHubPath(txtPath);
    const contentsApiUrl = `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${encodedPath}`;
    const base64Content = Buffer.from(body.content, 'utf-8').toString('base64');
    const commitMessage =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim().slice(0, 120)
        : `Update ${txtPath} via Word Fun!`;

    const trySaveWithTokenAndBranch = async (token: string, branchName: string) => {
      const fetchExistingSha = async (): Promise<string | undefined> => {
        const lookupRes = await fetch(`${contentsApiUrl}?ref=${encodeURIComponent(branchName)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'WordFun-App',
          },
        });
        if (lookupRes.ok) {
          const meta = (await lookupRes.json()) as { sha?: string };
          return meta.sha;
        }
        return undefined;
      };

      for (let attempt = 0; attempt < 3; attempt++) {
        const currentSha = await fetchExistingSha();
        const putRes = await fetch(contentsApiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'WordFun-App',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: base64Content,
            branch: branchName,
            ...(currentSha ? { sha: currentSha } : {}),
          }),
        });

        if (putRes.status === 409 && attempt < 2) {
          continue;
        }

        if (putRes.ok) {
          const result = (await putRes.json()) as {
            content?: { sha?: string };
            commit?: { html_url?: string };
          };
          return {
            ok: true as const,
            status: putRes.status,
            branch: branchName,
            sha: result.content?.sha || null,
            commitUrl: result.commit?.html_url || null,
          };
        }

        const errJson = (await putRes.json().catch(() => ({}))) as { message?: string };
        return {
          ok: false as const,
          status: putRes.status,
          error: errJson.message || `GitHub save failed (${putRes.status})`,
        };
      }

      return { ok: false as const, status: 409, error: 'GitHub conflict persisted after retries.' };
    };

    try {
      let lastFailure: { status: number; error: string } = { status: 502, error: 'GitHub save failed.' };

      for (const token of tokens) {
        let saveAttempt = await trySaveWithTokenAndBranch(token, target.branch);
        if (saveAttempt.ok) {
          res.json({
            success: true,
            repo: target.slug,
            branch: saveAttempt.branch,
            filePath: txtPath,
            sha: saveAttempt.sha,
            commitUrl: saveAttempt.commitUrl,
          });
          return;
        }

        // Auto-fix branch mismatch (e.g. 'main' vs 'master')
        if ((saveAttempt.status === 404 || saveAttempt.status === 422) && target.branch === 'main') {
          const repoMetaRes = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'User-Agent': 'WordFun-App',
            },
          }).catch(() => null);
          if (repoMetaRes && repoMetaRes.ok) {
            const meta = (await repoMetaRes.json()) as { default_branch?: string };
            const actualBranch = meta.default_branch?.trim();
            if (actualBranch && actualBranch !== target.branch && !actualBranch.includes('..')) {
              saveAttempt = await trySaveWithTokenAndBranch(token, actualBranch);
              if (saveAttempt.ok) {
                res.json({
                  success: true,
                  repo: target.slug,
                  branch: saveAttempt.branch,
                  filePath: txtPath,
                  sha: saveAttempt.sha,
                  commitUrl: saveAttempt.commitUrl,
                });
                return;
              }
            }
          }
        }

        lastFailure = { status: saveAttempt.status, error: saveAttempt.error };
        if (saveAttempt.status !== 401 && saveAttempt.status !== 403 && saveAttempt.status !== 404) {
          break;
        }
      }

      const statusCode = lastFailure.status === 401 || lastFailure.status === 403 ? 401 : 502;
      res.status(statusCode).json({
        code: lastFailure.status === 401 || lastFailure.status === 403 ? 'AUTH_REQUIRED' : 'SAVE_FAILED',
        error: lastFailure.error,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save database to GitHub.';
      res.status(502).json({ error: msg });
    }
  });

  // Publish non-secret repository pointer (public/github-sync.json) into the GitHub repo
  // so any future static/multi-device deployment automatically knows where to load .txt data from.
  app.post('/api/github-db/publish-config', async (req, res) => {
    if (!isTrustedCookieWriteRequest(req)) {
      res.status(403).json({ error: 'Untrusted request origin.' });
      return;
    }

    const body = (req.body || {}) as {
      repo?: string;
      branch?: string;
      path?: string;
    };

    const target = parseValidatedGitHubTarget(body.repo, body.branch, body.path);
    if (!target) {
      res.status(400).json({ error: 'Please enter a valid GitHub repository (owner/repo).' });
      return;
    }

    const token = resolveGitHubWriteToken(req);
    if (!token) {
      res.status(401).json({
        code: 'AUTH_REQUIRED',
        error: 'GitHub write access is required to publish public/github-sync.json.',
      });
      return;
    }

    const manifestPayload = JSON.stringify(
      {
        repo: target.slug,
        branch: target.branch,
        filePath: target.filePath,
      },
      null,
      2
    );
    const configApiUrl = `https://api.github.com/repos/${target.owner}/${target.repo}/contents/public/github-sync.json`;

    try {
      let existingSha: string | undefined;
      const lookupRes = await fetch(`${configApiUrl}?ref=${encodeURIComponent(target.branch)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'WordFun-App',
        },
      });
      if (lookupRes.ok) {
        const meta = (await lookupRes.json()) as { sha?: string };
        existingSha = meta.sha;
      }

      const putRes = await fetch(configApiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'WordFun-App',
        },
        body: JSON.stringify({
          message: `Enable multi-device GitHub auto-load (${target.slug})`,
          content: Buffer.from(`${manifestPayload}\n`, 'utf-8').toString('base64'),
          branch: target.branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errJson = (await putRes.json().catch(() => ({}))) as { message?: string };
        throw new Error(errJson.message || `Failed to publish config (${putRes.status})`);
      }

      const result = (await putRes.json()) as { commit?: { html_url?: string } };
      res.json({
        success: true,
        repo: target.slug,
        branch: target.branch,
        filePath: target.filePath,
        commitUrl: result.commit?.html_url || null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish multi-device auto-connect config.';
      res.status(502).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
