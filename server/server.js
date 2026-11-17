// Server lokal RELAFUN (Node.js + Express): menyajikan aplikasi + API asisten AI (Google Gemini).
// Jalankan dari folder server/:  npm start   →  http://localhost:3000
// API key hanya di server/.env (tidak di-commit). Lihat docs/11-ASISTEN-AI.md.
//
//   GET  /api/status   → { ready, reason? }   (tanpa memanggil Gemini)
//   POST /api/tutor    → Tutor AI       { mode?, messages, context? } → { reply }
//   POST /api/analyze  → Pembahas Soal  { soal, mode }               → { result }
//   Gagal → { error: kode }  (kode dipetakan ke pesan ramah di data/ai.json)

import express from 'express';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AiError, createGemini } from './gemini.js';
import {
  ANALYZE_SCHEMAS, LIMITS, buildAnalyzePrompt, buildSystemPrompt, cleanReply, createDailyCounter, createRateLimiter,
  shapeAnalysis, softenCertainty, toGeminiContents, validateAnalyzeRequest, validateRequest,
} from './rules.js';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SERVER_DIR, '..');

// Hanya file aplikasi yang disajikan. server/, .env, analysis/, docs/ tidak bisa dibuka lewat browser.
const STATIC_FOLDERS = ['css', 'js', 'data', 'assets', 'tools'];
const STATIC_FILES = ['index.html', 'manifest.webmanifest', 'sw.js'];

const STATUS = {
  invalid: 400, tooShort: 400, tooLong: 413, limit: 429, quota: 429, blocked: 422,
  nokey: 503, busy: 503, badkey: 502, upstream: 502, server: 502,
};

const TOKENS = { tutor: 1024, analyze: 2048 };

/**
 * Membuat aplikasi Express. Diekspor agar bisa diuji dengan Gemini tiruan.
 * @param {{ gemini: { generate: Function } | null, ready: boolean, dailyLimit?: number, log?: Function }} deps
 */
export function createApp({ gemini, ready, dailyLimit = 0, log = console.warn }) {
  const app = express();
  const daily = createDailyCounter(dailyLimit);
  const perDevice = createRateLimiter();
  app.disable('x-powered-by');
  app.set('trust proxy', false);

  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });

  // ---------- API ----------
  const api = express.Router();
  api.use(express.json({ limit: LIMITS.bodyBytes }));
  api.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  const sendError = (res, code) => res.status(STATUS[code] ?? 502).json({ error: code });

  /** Batas per perangkat + batas harian server. Mengembalikan kode error atau null. */
  function checkLimits(req) {
    if (!ready) return 'nokey';
    if (!perDevice(req.ip ?? 'anon')) return 'limit';
    if (!daily.take()) return 'quota'; // batas harian = jatah kuota gratis hari ini
    return null;
  }

  async function run(res, label, task) {
    try {
      await task();
    } catch (err) {
      const code = err instanceof AiError ? err.code : 'server';
      log(`[RELAFUN AI] ${label}: ${code} — ${err.message}`); // tanpa isi pertanyaan siswa (privasi)
      sendError(res, code);
    }
  }

  api.get('/status', (req, res) => {
    res.json(ready ? { ready: true } : { ready: false, reason: 'nokey' });
  });

  api.post('/tutor', (req, res) => {
    const checked = validateRequest(req.body);
    if (!checked.ok) return sendError(res, checked.error);
    const limited = checkLimits(req);
    if (limited) return sendError(res, limited);
    const { mode, messages, context } = checked.value;
    return run(res, 'tutor', async () => {
      const text = await gemini.generate({
        system: buildSystemPrompt(mode, context),
        contents: toGeminiContents(messages),
        maxTokens: TOKENS.tutor,
      });
      const reply = softenCertainty(cleanReply(text));
      if (!reply) throw new AiError('server', 'jawaban kosong setelah dirapikan');
      res.json({ reply });
    });
  });

  api.post('/analyze', (req, res) => {
    const checked = validateAnalyzeRequest(req.body);
    if (!checked.ok) return sendError(res, checked.error);
    const limited = checkLimits(req);
    if (limited) return sendError(res, limited);
    const { mode, soal } = checked.value;
    return run(res, `analyze/${mode}`, async () => {
      const text = await gemini.generate({
        system: buildAnalyzePrompt(mode),
        contents: [{ role: 'user', parts: [{ text: `Soal:\n${soal}` }] }],
        maxTokens: TOKENS.analyze,
        schema: ANALYZE_SCHEMAS[mode],
        temperature: 0.2,
      });
      const result = shapeAnalysis(mode, text);
      if (!result) throw new AiError('server', 'JSON dari Gemini tidak sesuai skema');
      res.json({ result });
    });
  });

  api.use((req, res) => sendError(res, 'invalid'));
  // Galat dari express.json: body bukan JSON (400) atau terlalu besar (413).
  // eslint-disable-next-line no-unused-vars
  api.use((err, req, res, next) => sendError(res, err?.type === 'entity.too.large' ? 'tooLong' : 'invalid'));
  app.use('/api', api);

  // ---------- File aplikasi ----------
  for (const folder of STATIC_FOLDERS) {
    app.use(`/${folder}`, express.static(path.join(ROOT, folder), { dotfiles: 'ignore', index: ['index.html'] }));
  }
  for (const file of STATIC_FILES) {
    app.get(`/${file}`, (req, res) => {
      if (file === 'sw.js') res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(ROOT, file));
    });
  }
  app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
  app.use((req, res) => res.status(404).type('text/plain').send('Tidak ditemukan'));
  return app;
}

/** Membaca server/.env bila ada (fitur bawaan Node, tanpa paket tambahan). */
function loadEnv() {
  try {
    process.loadEnvFile(path.join(SERVER_DIR, '.env'));
    return true;
  } catch (err) {
    if (err?.code === 'ENOENT') return false;
    throw err;
  }
}

async function main() {
  const hasEnv = loadEnv();
  const env = process.env;
  const apiKey = (env.GEMINI_API_KEY ?? '').trim();
  const model = (env.GEMINI_MODEL ?? '').trim();
  const simulate = (env.AI_SIMULATE ?? '').trim();
  const port = Number(env.PORT) || 3000;
  const host = (env.HOST ?? '').trim() || '127.0.0.1';
  const thinking = env.GEMINI_THINKING_BUDGET?.trim();

  const ready = Boolean(apiKey && model) && simulate !== 'nokey';
  const gemini = ready
    ? await createGemini({
      apiKey,
      model,
      fallbackModel: (env.GEMINI_MODEL_FALLBACK ?? '').trim(),
      thinkingBudget: thinking ? Number(thinking) : null,
      simulate,
    })
    : null;

  const app = createApp({ gemini, ready, dailyLimit: Number(env.AI_DAILY_LIMIT) || 0 });
  // Express 5 meneruskan galat listen (mis. port sudah dipakai) ke callback ini.
  app.listen(port, host, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} sudah dipakai. Mungkin RELAFUN sudah berjalan di jendela lain —`
          + ` buka http://localhost:${port}, atau ganti PORT di server/.env.`);
      } else {
        console.error(`Server gagal berjalan: ${err.message}`);
      }
      process.exit(1);
    }
    const shown = host === '0.0.0.0' ? 'localhost' : host;
    console.log(`RELAFUN berjalan di http://${shown}:${port}`);
    if (!hasEnv) console.log('  ⚠ server/.env belum ada — salin server/.env.example menjadi server/.env');
    if (!apiKey) console.log('  ⚠ GEMINI_API_KEY kosong — Tutor AI & Pembahas Soal tampil "belum disiapkan".');
    else if (!model) console.log('  ⚠ GEMINI_MODEL kosong — jalankan "npm run models" lalu isi di server/.env.');
    else console.log(`  AI aktif · model ${model}${env.GEMINI_MODEL_FALLBACK ? ` (cadangan ${env.GEMINI_MODEL_FALLBACK})` : ''}`);
    if (simulate) console.log(`  ⚠ AI_SIMULATE=${simulate} (mode uji error)`);
    console.log('  Tekan Ctrl+C untuk berhenti.');
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Server gagal berjalan:', err.message);
    process.exit(1);
  });
}
