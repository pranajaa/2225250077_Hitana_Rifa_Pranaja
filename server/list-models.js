// Menampilkan model Gemini yang bisa dipakai dengan API key di server/.env.
// Jalankan dari folder server/:  npm run models
// Pilih model "flash" untuk GEMINI_MODEL (dan bila perlu "flash-lite" untuk GEMINI_MODEL_FALLBACK).
// Kuota gratis tiap model berbeda — lihat angka untuk project kamu di https://aistudio.google.com/

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(SERVER_DIR, '.env'));
} catch (err) {
  if (err?.code !== 'ENOENT') throw err;
}

const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
if (!apiKey) {
  console.error('GEMINI_API_KEY belum diisi di server/.env');
  process.exit(1);
}

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey });
const rows = [];
try {
  const pager = await ai.models.list({ config: { pageSize: 100 } });
  for await (const m of pager) {
    const actions = m.supportedActions ?? m.supportedGenerationMethods ?? [];
    if (!actions.includes('generateContent')) continue;
    rows.push(String(m.name ?? '').replace(/^models\//, ''));
  }
} catch (err) {
  console.error(`Gagal mengambil daftar model (${err?.status ?? '-'}): ${err?.message ?? err}`);
  process.exit(1);
}

const flash = rows.filter((name) => /flash/i.test(name));
console.log(`Model yang mendukung generateContent: ${rows.length}`);
console.log('\nModel Flash (disarankan untuk RELAFUN):');
for (const name of flash) console.log(`  ${name}`);
console.log('\nModel lain:');
for (const name of rows.filter((n) => !flash.includes(n))) console.log(`  ${name}`);
