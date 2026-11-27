// Klien asisten AI: mengirim permintaan ke server RELAFUN (server/server.js), BUKAN langsung ke Gemini.
// Tidak ada API key di sini. Nama/kode siswa tidak pernah dikirim. Lihat docs/11-ASISTEN-AI.md.
//
// Tutor AI      → POST {base}/tutor    mode 'tanya' | 'salah' | 'bedah'
// Pembahas Soal → POST {base}/analyze  mode 'petunjuk' | 'pembahasan'
// Alamat dicoba berurutan (data/ai.json): endpoint ("./api", server lokal) → endpointOnline (backend di hosting).
// Yang pertama menjawab /status dipakai selama halaman terbuka. Tidak ada yang menjawab → "belum tersedia".
// AI tidak pernah menilai soal bank — kunci dari data soal/math.js.

export const QUESTION_MIN = 3;
export const QUESTION_MAX = 500;    // = LIMITS.questionMax di server/rules.js
export const SOAL_MIN = 10;
export const SOAL_MAX = 1500;       // = LIMITS.soalMax
export const HISTORY_MAX = 6;       // pesan terakhir yang ikut dikirim (konteks percakapan)
export const MESSAGE_MAX = 600;     // = LIMITS.messageChars
// Server menunggu ≤ 25 detik per model (utama + cadangan) → aplikasi menunggu 60 detik.
// Status: alamat lokal cepat (5 detik); backend online gratis bisa sedang tidur → tunggu sampai 60 detik.
const TIMEOUT_MS = { tutor: 60000, analyze: 60000, status: 5000, statusOnline: 60000, slowNotice: 4000 };
const KNOWN_ERRORS = ['limit', 'quota', 'busy', 'invalid', 'server', 'nokey', 'badkey', 'upstream', 'blocked',
  'tooShort', 'tooLong', 'forbidden'];

let configPromise = null;

/** Memuat data/ai.json (alamat API + teks antarmuka). */
export function loadAiConfig() {
  configPromise ??= fetch('./data/ai.json').then((r) => {
    if (!r.ok) throw new Error(`Gagal memuat ai.json (${r.status})`);
    return r.json();
  });
  configPromise.catch(() => { configPromise = null; });
  return configPromise;
}

/**
 * Alamat API sah: relatif ('./api'), https, atau http ke localhost/127.0.0.1.
 * Mengembalikan alamat tanpa garis miring akhir, atau null.
 */
export function normalizeBase(value) {
  const raw = typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  if (!raw) return null;
  if (/^\.{0,2}\//.test(raw)) return raw;
  if (/^https:\/\//.test(raw)) return raw;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(raw)) return raw;
  return null;
}

/** Daftar alamat yang dicoba berurutan: endpoint (lokal) lalu endpointOnline (hosting). */
export function apiBases(config) {
  return [...new Set([config?.endpoint, config?.endpointOnline].map(normalizeBase).filter(Boolean))];
}

export const apiBase = (config) => apiBases(config)[0] ?? null;
export const isConfigured = (config) => apiBases(config).length > 0;
const isRemote = (base) => /^https?:\/\//.test(base);

/** Alamat yang sudah terbukti menjawab /status (dipakai selama halaman terbuka). */
let activeBase = null;
export const isOnline = () => navigator.onLine !== false;

/** Memeriksa pertanyaan Tutor. Mengembalikan null bila boleh dikirim, atau kode pesan (tooShort/tooLong). */
export function validateQuestion(text) {
  const t = String(text ?? '').trim();
  if (t.length < QUESTION_MIN) return 'tooShort';
  if (t.length > QUESTION_MAX) return 'tooLong';
  return null;
}

/** Memeriksa soal untuk Pembahas Soal. Kode: soalShort / soalLong / null. */
export function validateSoal(text) {
  const t = String(text ?? '').trim();
  if (t.length < SOAL_MIN) return 'soalShort';
  if (t.length > SOAL_MAX) return 'soalLong';
  return null;
}

/** Menyusun isi permintaan Tutor: riwayat dipangkas, tiap pesan dipotong, konteks hanya string. */
export function buildPayload(mode, history, context = {}) {
  const messages = history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-HISTORY_MAX)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MESSAGE_MAX) }));
  const cleanContext = Object.fromEntries(
    Object.entries(context ?? {}).filter(([, v]) => typeof v === 'string' && v.trim()),
  );
  return { mode, messages, context: cleanContext };
}

/** Membersihkan sisa format Markdown agar tampil sebagai teks biasa. */
export function cleanReply(text) {
  return String(text ?? '')
    .replace(/\*\*|__|`/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** fetch dengan batas waktu + pembatalan dari pemanggil. */
async function fetchWithTimeout(url, init, timeoutMs, signal) {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), timeoutMs);
  const abortFromCaller = () => timeout.abort();
  signal?.addEventListener('abort', abortFromCaller);
  try {
    return await fetch(url, { ...init, signal: timeout.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

/**
 * Apakah server AI tersedia? Tidak memakai kuota Gemini. Mencoba setiap alamat berurutan.
 * @param {{ onSlow?: () => void }} [opts]  dipanggil sekali bila backend online lambat menjawab (sedang bangun)
 * @returns {Promise<{ ready: true } | { ready: false, code: 'unavailable'|'nokey' }>}
 */
export async function checkStatus({ onSlow } = {}) {
  const config = await loadAiConfig().catch(() => null);
  for (const base of apiBases(config)) {
    const remote = isRemote(base);
    const slow = remote && onSlow ? setTimeout(onSlow, TIMEOUT_MS.slowNotice) : null;
    try {
      const r = await fetchWithTimeout(`${base}/status`, { cache: 'no-store' }, remote ? TIMEOUT_MS.statusOnline : TIMEOUT_MS.status);
      const data = r.ok ? await r.json().catch(() => null) : null;
      if (typeof data?.ready === 'boolean') {
        activeBase = base;
        if (data.ready) return { ready: true };
        return { ready: false, code: data.reason === 'nokey' ? 'nokey' : 'unavailable' };
      }
      // Tidak ada server di alamat ini (mis. GitHub Pages: ./api/status = 404) → coba alamat berikutnya.
    } catch {
      // Gagal tersambung / waktu habis → coba alamat berikutnya.
    } finally {
      clearTimeout(slow);
    }
  }
  activeBase = null;
  return { ready: false, code: 'unavailable' };
}

/** Mengirim POST JSON. Selalu mengembalikan { ok:true, data } atau { ok:false, code }; tidak melempar. */
async function postJson(path, body, { signal, timeoutMs }) {
  if (!activeBase) await checkStatus();
  const base = activeBase;
  if (!base) return { ok: false, code: 'unavailable' };
  if (!isOnline()) return { ok: false, code: 'offline' };
  try {
    const response = await fetchWithTimeout(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, timeoutMs, signal);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      if (response.status === 404 && !data.error) return { ok: false, code: 'unavailable' };
      return { ok: false, code: KNOWN_ERRORS.includes(data.error) ? data.error : 'server' };
    }
    return { ok: true, data };
  } catch (err) {
    if (signal?.aborted) return { ok: false, code: 'aborted' };
    return { ok: false, code: err?.name === 'AbortError' ? 'busy' : 'network' };
  }
}

/**
 * Tutor AI. Mengembalikan { ok: true, reply } atau { ok: false, code } (code = kunci di ai.json → messages).
 * @param {{ mode?: string, history: {role:string, content:string}[], context?: object, signal?: AbortSignal }} req
 */
export async function askAi({ mode = 'tanya', history, context, signal }) {
  const result = await postJson('/tutor', buildPayload(mode, history, context), { signal, timeoutMs: TIMEOUT_MS.tutor });
  if (!result.ok) return result;
  const reply = cleanReply(result.data.reply);
  return reply ? { ok: true, reply } : { ok: false, code: 'server' };
}

/**
 * AI Pembahas Soal. Mengembalikan { ok: true, result } atau { ok: false, code }.
 * @param {{ soal: string, mode: 'petunjuk'|'pembahasan', signal?: AbortSignal }} req
 */
export async function analyzeProblem({ soal, mode, signal }) {
  const result = await postJson('/analyze', { soal: String(soal ?? '').trim(), mode },
    { signal, timeoutMs: TIMEOUT_MS.analyze });
  if (!result.ok) return result;
  const data = result.data.result;
  return data && typeof data === 'object' ? { ok: true, result: data } : { ok: false, code: 'server' };
}
