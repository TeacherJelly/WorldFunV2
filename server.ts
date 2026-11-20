import 'dotenv/config';
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

async function startServer() {
  const app = express();
  app.use(express.json());

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
