// Uji server lokal dengan Gemini TIRUAN (tidak memakai kuota, tidak butuh internet).
// Jalankan dari folder server/:  npm test
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, describe, test } from 'node:test';
import { AiError, createGemini, mapGeminiError, readResponse } from '../gemini.js';
import { PUBLIC_DAILY_DEFAULT, createApp, readOptions } from '../server.js';
import { DEFINITIONS, LIMITS, shapeAnalysis } from '../rules.js';

/** Gemini tiruan: `behave(request)` mengembalikan teks atau melempar error. */
function fakeGemini(behave) {
  const calls = [];
  return {
    calls,
    async generate(request) {
      calls.push(request);
      return behave(request);
    },
  };
}

async function startApp(deps) {
  const app = createApp({ log: () => {}, ...deps });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}

const post = (base, path, body, raw) => fetch(`${base}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: raw ?? JSON.stringify(body),
});

const tutorBody = (content = 'Apa itu fungsi?') => ({ messages: [{ role: 'user', content }] });

const PEMBAHASAN_JSON = JSON.stringify({
  diLuarTopik: false,
  diketahui: ['A = {1, 2, 3}', 'B = {a, b}'],
  ditanya: 'Banyak pemetaan dari A ke B',
  infoKurang: [],
  konsep: 'Banyak pemetaan',
  alasan: 'Soal menanyakan banyak fungsi dari A ke B.',
  langkah: ['n(A) = 3, n(B) = 2', 'n(B)^n(A) = 2^3 = 8'],
  kesimpulan: 'Banyak pemetaan ada 8 dan **pasti benar**.',
});

describe('definisi resmi', () => {
  test('DEFINITIONS memuat setiap aturan docs/02 §5', async () => {
    const doc = await readFile(new URL('../../docs/02-DESAIN-PEMBELAJARAN.md', import.meta.url), 'utf8');
    const section = doc.split('## 5.')[1].split('## 6.')[0];
    // Frasa kunci yang sama di docs/02 §5 dan DEFINITIONS (kata demi kata).
    const phrases = [
      'aturan yang memasangkan anggota-anggota',
      'relasi khusus yang memasangkan',
      'tepat satu',
      'daerah asal',
      'daerah kawan',
      'n(A) = n(B)',
      'n(B)^n(A)',
      'garis vertikal',
    ];
    for (const p of phrases) {
      assert.ok(section.includes(p), `docs/02 §5 tidak lagi memuat "${p}" — samakan DEFINITIONS`);
      assert.ok(DEFINITIONS.includes(p), `DEFINITIONS tidak memuat "${p}"`);
    }
    assert.ok(section.includes('adalah n!') && DEFINITIONS.includes('n adalah n!'), 'banyak korespondensi = n!');
  });
});

describe('server dengan AI siap', () => {
  let app;
  const gemini = fakeGemini((req) => (req.schema ? PEMBAHASAN_JSON : '**Fungsi** adalah relasi khusus.'));
  before(async () => { app = await startApp({ gemini, ready: true }); });
  after(() => app.close());

  test('GET /api/status → siap', async () => {
    const r = await fetch(`${app.base}/api/status`);
    assert.deepEqual(await r.json(), { ready: true });
    assert.equal(r.headers.get('cache-control'), 'no-store');
  });

  test('POST /api/tutor → jawaban tanpa Markdown, peran assistant → model', async () => {
    const r = await post(app.base, '/api/tutor', {
      messages: [
        { role: 'user', content: 'Apa itu relasi?' },
        { role: 'assistant', content: 'Relasi adalah aturan.' },
        { role: 'user', content: 'Lalu fungsi?' },
      ],
    });
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { reply: 'Fungsi adalah relasi khusus.' });
    const last = gemini.calls.at(-1);
    assert.deepEqual(last.contents.map((c) => c.role), ['user', 'model', 'user']);
    assert.ok(last.system.includes('paling banyak 5 kalimat'));
  });

  test('POST /api/tutor mode lama "salah" & "bedah" tetap diterima', async () => {
    for (const mode of ['salah', 'bedah']) {
      const r = await post(app.base, '/api/tutor', { mode, ...tutorBody() });
      assert.equal(r.status, 200, mode);
    }
  });

  test('POST /api/analyze pembahasan → 5 bagian, klaim "pasti benar" dibuang', async () => {
    const r = await post(app.base, '/api/analyze', { mode: 'pembahasan', soal: 'A = {1,2,3}, B = {a,b}. Banyak pemetaan?' });
    assert.equal(r.status, 200);
    const { result } = await r.json();
    assert.equal(result.konsep, 'Banyak pemetaan');
    assert.equal(result.langkah.length, 2);
    assert.equal(result.kesimpulan, 'Banyak pemetaan ada 8 dan perlu diperiksa lagi.');
    assert.equal(gemini.calls.at(-1).schema.properties.kesimpulan.type, 'STRING');
  });

  test('POST /api/analyze petunjuk → TIDAK membawa konsep/kesimpulan walau AI menuliskannya', async () => {
    const r = await post(app.base, '/api/analyze', { mode: 'petunjuk', soal: 'A = {1,2,3}, B = {a,b}. Banyak pemetaan?' });
    const { result } = await r.json();
    for (const key of ['konsep', 'alasan', 'langkah', 'kesimpulan']) assert.equal(key in result, false, key);
    assert.ok(Array.isArray(result.pertanyaanPenuntun));
    assert.ok(gemini.calls.at(-1).system.includes('JANGAN memberi jawaban akhir'));
  });

  test('input kosong / terlalu pendek / terlalu panjang', async () => {
    const cases = [
      ['/api/tutor', tutorBody('   '), 400, 'tooShort'],
      ['/api/tutor', tutorBody('x'.repeat(LIMITS.questionMax + 1)), 413, 'tooLong'],
      ['/api/tutor', { messages: [] }, 400, 'invalid'],
      ['/api/tutor', { mode: 'hack', ...tutorBody() }, 400, 'invalid'],
      ['/api/analyze', { mode: 'pembahasan', soal: '' }, 400, 'tooShort'],
      ['/api/analyze', { mode: 'pembahasan', soal: 'x'.repeat(LIMITS.soalMax + 1) }, 413, 'tooLong'],
      ['/api/analyze', { mode: 'jawab', soal: 'Apakah relasi ini fungsi?' }, 400, 'invalid'],
    ];
    for (const [path, body, status, error] of cases) {
      const r = await post(app.base, path, body);
      assert.equal(r.status, status, `${path} ${error}`);
      assert.deepEqual(await r.json(), { error });
    }
  });

  test('body bukan JSON / terlalu besar', async () => {
    let r = await post(app.base, '/api/tutor', null, '{rusak');
    assert.deepEqual(await r.json(), { error: 'invalid' });
    r = await post(app.base, '/api/tutor', null, JSON.stringify({ x: 'y'.repeat(LIMITS.bodyBytes) }));
    assert.equal(r.status, 413);
  });

  test('file aplikasi tersaji; server/.env & folder lain tidak', async () => {
    assert.equal((await fetch(`${app.base}/`)).status, 200);
    assert.equal((await fetch(`${app.base}/js/ai.js`)).status, 200);
    assert.equal((await fetch(`${app.base}/data/ai.json`)).status, 200);
    for (const p of ['/server/server.js', '/server/.env', '/.env', '/analysis/README.md', '/docs/PRD.md', '/js/../server/rules.js']) {
      assert.equal((await fetch(`${app.base}${p}`)).status, 404, p);
    }
  });
});

describe('server tanpa API key', () => {
  let app;
  before(async () => { app = await startApp({ gemini: null, ready: false }); });
  after(() => app.close());

  test('status → belum siap; endpoint → nokey; aplikasi tetap tersaji', async () => {
    assert.deepEqual(await (await fetch(`${app.base}/api/status`)).json(), { ready: false, reason: 'nokey' });
    const r = await post(app.base, '/api/tutor', tutorBody());
    assert.equal(r.status, 503);
    assert.deepEqual(await r.json(), { error: 'nokey' });
    assert.equal((await fetch(`${app.base}/index.html`)).status, 200);
  });
});

describe('error dari Gemini', () => {
  for (const code of ['quota', 'busy', 'upstream', 'badkey', 'blocked', 'server']) {
    test(`Gemini melempar ${code} → { error: "${code}" }`, async () => {
      const app = await startApp({ gemini: fakeGemini(() => { throw new AiError(code); }), ready: true });
      try {
        const r = await post(app.base, '/api/tutor', tutorBody());
        assert.deepEqual(await r.json(), { error: code });
        const r2 = await post(app.base, '/api/analyze', { mode: 'petunjuk', soal: 'Apakah relasi ini fungsi?' });
        assert.deepEqual(await r2.json(), { error: code });
      } finally {
        await app.close();
      }
    });
  }

  test('JSON tidak sesuai skema → server', async () => {
    const app = await startApp({ gemini: fakeGemini(() => 'bukan json'), ready: true });
    try {
      const r = await post(app.base, '/api/analyze', { mode: 'pembahasan', soal: 'Apakah relasi ini fungsi?' });
      assert.deepEqual(await r.json(), { error: 'server' });
    } finally {
      await app.close();
    }
  });

  test('batas harian server', async () => {
    const app = await startApp({ gemini: fakeGemini(() => 'ok jawab'), ready: true, dailyLimit: 2 });
    try {
      const statuses = [];
      for (let i = 0; i < 3; i += 1) statuses.push((await post(app.base, '/api/tutor', tutorBody())).status);
      assert.deepEqual(statuses, [200, 200, 429]);
      assert.deepEqual(await (await post(app.base, '/api/tutor', tutorBody())).json(), { error: 'quota' });
    } finally {
      await app.close();
    }
  });
});

describe('gemini.js', () => {
  test('mapGeminiError', () => {
    assert.equal(mapGeminiError({ status: 429, message: 'RESOURCE_EXHAUSTED' }).code, 'quota');
    assert.equal(mapGeminiError({ status: 400, message: 'API key not valid. Please pass a valid API key.' }).code, 'badkey');
    assert.equal(mapGeminiError({ status: 403, message: 'PERMISSION_DENIED' }).code, 'badkey');
    assert.equal(mapGeminiError({ status: 503, message: 'overloaded' }).code, 'busy');
    assert.equal(mapGeminiError({ status: 404, message: 'model not found' }).code, 'server');
    assert.equal(mapGeminiError(Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } })).code, 'upstream');
    assert.equal(mapGeminiError(Object.assign(new Error('x'), { name: 'TimeoutError' })).code, 'busy');
  });

  test('readResponse: diblokir & kosong', () => {
    assert.throws(() => readResponse({ promptFeedback: { blockReason: 'SAFETY' } }), { code: 'blocked' });
    assert.throws(() => readResponse({ candidates: [{ finishReason: 'SAFETY' }], text: '' }), { code: 'blocked' });
    assert.throws(() => readResponse({ candidates: [{ finishReason: 'MAX_TOKENS' }], text: '' }), { code: 'server' });
    assert.equal(readResponse({ text: 'halo' }), 'halo');
  });

  test('createGemini: model cadangan saat kuota habis; simulasi; config dikirim', async () => {
    const seen = [];
    const sdk = {
      models: {
        async generateContent({ model, config }) {
          seen.push({ model, config });
          if (model === 'utama') throw { status: 429, message: 'RESOURCE_EXHAUSTED' };
          return { text: 'dari cadangan' };
        },
      },
    };
    const g = await createGemini({ apiKey: 'x', model: 'utama', fallbackModel: 'cadangan', sdk, thinkingBudget: 0 });
    const text = await g.generate({ system: 'S', contents: [], maxTokens: 10, schema: { type: 'OBJECT' } });
    assert.equal(text, 'dari cadangan');
    assert.deepEqual(seen.map((s) => s.model), ['utama', 'cadangan']);
    assert.equal(seen[0].config.systemInstruction, 'S');
    assert.equal(seen[0].config.responseMimeType, 'application/json');
    assert.deepEqual(seen[0].config.thinkingConfig, { thinkingBudget: 0 });

    const sim = await createGemini({ apiKey: 'x', model: 'm', sdk, simulate: 'quota' });
    await assert.rejects(sim.generate({ system: '', contents: [], maxTokens: 1 }), { code: 'quota' });
  });

  test('shapeAnalysis: di luar topik & bentuk tidak sah', () => {
    assert.deepEqual(shapeAnalysis('pembahasan', '{"diLuarTopik":true}'), { mode: 'pembahasan', diLuarTopik: true });
    assert.equal(shapeAnalysis('petunjuk', '[]'), null);
    const r = shapeAnalysis('pembahasan', { ...JSON.parse(PEMBAHASAN_JSON), konsep: 'Fungsi injektif' });
    assert.equal(r.konsep, 'Belum dapat ditentukan', 'konsep di luar daftar resmi ditolak');
  });
});

// ---------- Mode hosting: backend terpisah dari GitHub Pages (docs/11 §9) ----------
const SITE = 'https://pranajaa.github.io';

describe('readOptions (variabel lingkungan)', () => {
  test('mode lokal: sama seperti semula', () => {
    const o = readOptions({});
    assert.deepEqual([o.isPublic, o.dailyLimit, o.trustProxy, o.serveApp, o.host, o.port], [false, 0, false, true, '127.0.0.1', 3000]);
  });
  test('mode hosting: batas harian wajib & pengaturan proxy', () => {
    const o = readOptions({ ALLOWED_ORIGINS: `${SITE}/, http://localhost:3000`, TRUST_PROXY: '1', SERVE_APP: 'false', HOST: '0.0.0.0', PORT: '10000', AI_PER_10MIN: '60' });
    assert.deepEqual(o.allowedOrigins, [SITE, 'http://localhost:3000'], 'garis miring akhir dibuang');
    assert.equal(o.dailyLimit, PUBLIC_DAILY_DEFAULT, 'AI_DAILY_LIMIT kosong → bawaan');
    assert.deepEqual([o.trustProxy, o.serveApp, o.host, o.port, o.perWindow], [1, false, '0.0.0.0', 10000, 60]);
    assert.equal(readOptions({ ALLOWED_ORIGINS: SITE, AI_DAILY_LIMIT: '40' }).dailyLimit, 40);
  });
});

describe('server mode hosting (CORS, hanya API, trust proxy)', () => {
  let app;
  const gemini = fakeGemini(() => 'Fungsi adalah relasi khusus.');
  before(async () => {
    app = await startApp({ gemini, ready: true, allowedOrigins: [SITE], serveApp: false, trustProxy: 1, perWindow: 2, dailyLimit: 50 });
  });
  after(() => app.close());

  const tutor = (headers = {}) => fetch(`${app.base}/api/tutor`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(tutorBody()),
  });

  test('situs resmi diizinkan + header CORS', async () => {
    const r = await tutor({ Origin: SITE });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('access-control-allow-origin'), SITE);
    assert.equal(r.headers.get('vary'), 'Origin');
  });

  test('preflight OPTIONS dijawab 204', async () => {
    const r = await fetch(`${app.base}/api/tutor`, { method: 'OPTIONS', headers: { Origin: SITE, 'Access-Control-Request-Method': 'POST' } });
    assert.equal(r.status, 204);
    assert.match(r.headers.get('access-control-allow-methods'), /POST/);
  });

  test('situs lain & POST tanpa Origin ditolak (kuota tidak terpakai)', async () => {
    const before = gemini.calls.length;
    const lain = await tutor({ Origin: 'https://situs-lain.example' });
    assert.equal(lain.status, 403);
    assert.deepEqual(await lain.json(), { error: 'forbidden' });
    assert.equal(lain.headers.get('access-control-allow-origin'), null);
    assert.equal((await tutor()).status, 403, 'POST tanpa Origin');
    assert.equal(gemini.calls.length, before, 'Gemini tidak dipanggil');
  });

  test('status boleh dicek tanpa Origin (pemantauan hosting)', async () => {
    assert.deepEqual(await (await fetch(`${app.base}/api/status`)).json(), { ready: true });
  });

  test('hanya API: file aplikasi tidak disajikan', async () => {
    assert.equal((await fetch(`${app.base}/index.html`)).status, 404);
    assert.equal((await fetch(`${app.base}/js/ai.js`)).status, 404);
    assert.deepEqual(await (await fetch(`${app.base}/`)).json(), { name: 'RELAFUN AI API', status: '/api/status' });
  });

  test('trust proxy: setiap siswa (X-Forwarded-For) dihitung terpisah', async () => {
    const asIp = (ip) => tutor({ Origin: SITE, 'X-Forwarded-For': ip });
    const a = [];
    for (let i = 0; i < 3; i += 1) a.push((await asIp('10.0.0.1')).status);
    assert.deepEqual(a, [200, 200, 429], 'siswa A kena batas 2/10 menit');
    assert.equal((await asIp('10.0.0.2')).status, 200, 'siswa B tidak ikut terkena');
  });
});
