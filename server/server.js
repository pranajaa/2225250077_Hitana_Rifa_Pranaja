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
  nokey: 503, config: 503, busy: 503, badkey: 502, upstream: 502, server: 502,
};

const TOKENS = { tutor: 1024, analyze: 2048 };
/** Batas harian bawaan bila backend dibuka untuk situs lain (mode hosting) tetapi AI_DAILY_LIMIT kosong. */
export const PUBLIC_DAILY_DEFAULT = 100;

/**
 * Membaca pengaturan dari variabel lingkungan (server/.env di laptop, atau dasbor hosting).
 * Tanpa ALLOWED_ORIGINS server berjalan seperti mode lokal semula (satu alamat, tanpa CORS).
 */
/** Naikkan setiap mengubah perilaku server, agar versi yang tayang di hosting bisa dicek dari header. */
const API_REVISION = '3-pengaman';

/** Variabel yang diisi sendiri oleh platform hosting (bukan oleh pemilik). */
const HOSTING_ENV_VARS = ['VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_REGION', 'RENDER',
  'AWS_LAMBDA_FUNCTION_NAME', 'LAMBDA_TASK_ROOT'];
/** Header yang ditambahkan proxy Vercel ke setiap permintaan (lapis kedua bila variabel di atas tidak terlihat). */
const HOSTING_HEADERS = ['x-vercel-id', 'x-vercel-deployment-url'];

export function readOptions(env) {
  const list = (v) => String(v ?? '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);
  const allowedOrigins = list(env.ALLOWED_ORIGINS);
  const isPublic = allowedOrigins.length > 0;
  const rawDaily = Number(env.AI_DAILY_LIMIT);
  const trust = String(env.TRUST_PROXY ?? '').trim();
  // Terdeteksi berjalan di hosting (variabel bawaan Vercel/Render/AWS Lambda; HOSTED=true untuk hosting lain).
  const hosted = HOSTING_ENV_VARS.some((k) => String(env[k] ?? '').trim() !== '')
    || String(env.HOSTED ?? '').trim().toLowerCase() === 'true';
  const serveAppRaw = String(env.SERVE_APP ?? '').trim().toLowerCase();
  return {
    allowedOrigins,
    isPublic,
    hosted,
    // PENGAMAN: di hosting tanpa ALLOWED_ORIGINS, API menutup diri (tidak terbuka untuk umum / kuota tidak bocor).
    misconfigured: hosted && !isPublic,
    // Mode hosting WAJIB punya batas harian agar kuota gratis tidak habis oleh pemakai lain.
    dailyLimit: rawDaily > 0 ? rawDaily : isPublic ? PUBLIC_DAILY_DEFAULT : 0,
    perWindow: Number(env.AI_PER_10MIN) > 0 ? Number(env.AI_PER_10MIN) : LIMITS.perWindow,
    // TRUST_PROXY: kosong = false; angka = jumlah proxy di depan server (mis. 1); "true" = percaya semua.
    trustProxy: trust === '' || trust === 'false' ? false : trust === 'true' ? true : Number(trust) || trust,
    // SERVE_APP=false: hanya melayani /api. Bawaan: true di laptop, false di hosting (aplikasi tetap di GitHub Pages).
    serveApp: serveAppRaw === '' ? !hosted : serveAppRaw !== 'false',
    host: String(env.HOST ?? '').trim() || '127.0.0.1',
    port: Number(env.PORT) || 3000,
  };
}

/**
 * Membuat aplikasi Express. Diekspor agar bisa diuji dengan Gemini tiruan.
 * @param {{ gemini: { generate: Function } | null, ready: boolean, dailyLimit?: number, log?: Function,
 *           allowedOrigins?: string[], perWindow?: number, trustProxy?: boolean|number|string, serveApp?: boolean }} deps
 */
export function createApp({
  gemini, ready, dailyLimit = 0, log = console.warn,
  allowedOrigins = [], perWindow = LIMITS.perWindow, trustProxy = false, serveApp = true, misconfigured = false,
}) {
  // Pengaman: pengaturan hosting tidak lengkap → AI tidak pernah dipanggil.
  if (misconfigured) ready = false; // eslint-disable-line no-param-reassign
  const app = express();
  const daily = createDailyCounter(dailyLimit);
  const perDevice = createRateLimiter(perWindow);
  const origins = new Set(allowedOrigins);
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.use((req, res, next) => {
    res.set('X-Relafun-Api', API_REVISION); // penanda versi kode yang sedang berjalan (untuk cek deploy)
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });

  // PENGAMAN lapis kedua: permintaan lewat proxy hosting padahal ALLOWED_ORIGINS kosong → tutup semuanya
  // (API tidak memanggil Gemini, aplikasi tidak disajikan). Di laptop header ini tidak ada.
  if (origins.size === 0) {
    app.use((req, res, next) => {
      if (!misconfigured && !HOSTING_HEADERS.some((h) => req.get(h))) return next();
      res.set('Cache-Control', 'no-store');
      if (req.path === '/api/status') return res.json({ ready: false, reason: 'config' });
      if (req.path.startsWith('/api/')) return res.status(STATUS.config).json({ error: 'config' });
      return res.status(404).type('text/plain').send('Tidak ditemukan');
    });
  }

  // ---------- API ----------
  const api = express.Router();
  // CORS — hanya bila ALLOWED_ORIGINS diisi (mode hosting). Situs lain ditolak; permintaan POST wajib membawa
  // Origin yang diizinkan. Catatan: CORS hanya membatasi browser — batas per perangkat & harian tetap pelindung utama.
  if (origins.size > 0) {
    api.use((req, res, next) => {
      const origin = req.get('Origin');
      if (origin && origins.has(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '86400');
        res.set('Vary', 'Origin');
      } else if (origin || req.method === 'POST') {
        return res.status(403).set('Cache-Control', 'no-store').json({ error: 'forbidden' });
      }
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    });
  }
  api.use(express.json({ limit: LIMITS.bodyBytes }));
  api.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  const sendError = (res, code) => res.status(STATUS[code] ?? 502).json({ error: code });

  /** Batas per perangkat + batas harian server. Mengembalikan kode error atau null. */
  function checkLimits(req) {
    if (misconfigured) return 'config';
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
    const mode = origins.size > 0 ? { mode: 'hosting' } : {};
    if (misconfigured) return res.json({ ready: false, reason: 'config' });
    return res.json(ready ? { ready: true, ...mode } : { ready: false, reason: 'nokey', ...mode });
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

  if (!serveApp) {
    // Mode hosting: hanya API. Aplikasi tetap disajikan GitHub Pages.
    app.get('/', (req, res) => res.json({ name: 'RELAFUN AI API', status: '/api/status' }));
    app.use((req, res) => res.status(404).type('text/plain').send('Tidak ditemukan'));
    return app;
  }

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

/**
 * Menyusun aplikasi dari variabel lingkungan. Dipakai `npm start` (laptop) dan hosting serverless (Vercel).
 * Klien Gemini dibuat saat permintaan pertama, sehingga memuat modul ini tidak memanggil layanan apa pun.
 */
export function buildApp(env = process.env) {
  const apiKey = (env.GEMINI_API_KEY ?? '').trim();
  const model = (env.GEMINI_MODEL ?? '').trim();
  const simulate = (env.AI_SIMULATE ?? '').trim();
  const thinking = env.GEMINI_THINKING_BUDGET?.trim();
  const options = readOptions(env);
  const ready = Boolean(apiKey && model) && simulate !== 'nokey';
  if (options.misconfigured) {
    // Tampil di log hosting (mis. Vercel → Logs). Hanya NAMA variabel, tidak pernah nilainya.
    const known = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'ALLOWED_ORIGINS', 'AI_DAILY_LIMIT', 'AI_PER_10MIN', 'TRUST_PROXY', 'SERVE_APP']
      .filter((k) => String(env[k] ?? '').trim() !== '');
    console.warn('[RELAFUN AI] PENGAMAN AKTIF: berjalan di hosting tetapi ALLOWED_ORIGINS kosong → API ditutup.'
      + ` Variabel yang terbaca: ${known.join(', ') || '(tidak ada)'}. Isi ALLOWED_ORIGINS untuk Production lalu Redeploy.`);
  }
  let client = null;
  const gemini = ready
    ? {
      async generate(request) {
        client ??= createGemini({
          apiKey,
          model,
          fallbackModel: (env.GEMINI_MODEL_FALLBACK ?? '').trim(),
          thinkingBudget: thinking ? Number(thinking) : null,
          simulate,
        });
        return (await client).generate(request);
      },
    }
    : null;
  return { app: createApp({ gemini, ready, log: console.warn, ...options }), options, apiKey, model, simulate };
}

async function main() {
  const hasEnv = loadEnv();
  const env = process.env;
  const { app, options, apiKey, model, simulate } = buildApp(env);
  const { port, host } = options;
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
    if (options.isPublic) {
      console.log(`  Mode hosting · situs yang diizinkan: ${options.allowedOrigins.join(', ')}`);
      console.log(`  Batas: ${options.perWindow} permintaan/10 menit/perangkat · ${options.dailyLimit} permintaan/hari`
        + `${Number(env.AI_DAILY_LIMIT) > 0 ? '' : ' (bawaan — isi AI_DAILY_LIMIT)'} · trust proxy: ${options.trustProxy}`
        + ` · ${options.serveApp ? 'menyajikan aplikasi' : 'hanya API'}`);
    } else if (!hasEnv) {
      console.log('  ⚠ server/.env belum ada — salin server/.env.example menjadi server/.env');
    }
    if (!apiKey) console.log('  ⚠ GEMINI_API_KEY kosong — Tutor AI & Pembahas Soal tampil "belum disiapkan".');
    else if (!model) console.log('  ⚠ GEMINI_MODEL kosong — jalankan "npm run models" lalu isi di server/.env.');
    else console.log(`  AI aktif · model ${model}${env.GEMINI_MODEL_FALLBACK ? ` (cadangan ${env.GEMINI_MODEL_FALLBACK})` : ''}`);
    if (simulate) console.log(`  ⚠ AI_SIMULATE=${simulate} (mode uji error)`);
    console.log('  Tekan Ctrl+C untuk berhenti.');
  });
}

const runDirectly = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (runDirectly) {
  main().catch((err) => {
    console.error('Server gagal berjalan:', err.message);
    process.exit(1);
  });
}

// Hosting serverless (Vercel, docs/11 §9): aplikasi Express diekspor sebagai default; hosting yang memanggilnya,
// bukan app.listen. Variabel lingkungan diisi di dasbor hosting (tidak ada server/.env di sana).
// Saat dijalankan langsung (npm start) atau diimpor uji, ini hanya objek yang tidak dipakai.
export default runDirectly ? null : buildApp(process.env).app;
