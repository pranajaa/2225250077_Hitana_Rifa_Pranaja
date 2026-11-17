// Aturan asisten AI RELAFUN: definisi resmi, instruksi sistem, validasi input, batas pemakaian,
// dan perapian jawaban. Fungsi murni TANPA impor Node, sehingga bisa diuji di browser
// (tools/test.html) maupun di Node (server/test). Dipakai oleh server/server.js.
// Lihat docs/11-ASISTEN-AI.md.

export const TUTOR_MODES = ['tanya', 'salah', 'bedah'];
export const ANALYZE_MODES = ['petunjuk', 'pembahasan'];

export const LIMITS = {
  bodyBytes: 12000,          // ukuran permintaan maksimal
  messages: 8,               // riwayat percakapan maksimal yang diteruskan
  messageChars: 600,         // panjang satu pesan riwayat (dipotong)
  questionMin: 3,            // pertanyaan terakhir siswa
  questionMax: 500,
  soalMin: 10,               // soal di Pembahas Soal
  soalMax: 1500,
  contextChars: 1200,        // panjang satu isian konteks (soal, pembahasan, …)
  perWindow: 20,             // permintaan per perangkat …
  windowMs: 10 * 60 * 1000,  // … per 10 menit
  itemChars: 400,            // panjang satu isian jawaban Pembahas
  listItems: 8,              // isi daftar maksimal (diketahui, langkah, …)
};

// Definisi resmi — HARUS sama dengan docs/02-DESAIN-PEMBELAJARAN.md §5 (diuji di server/test).
export const DEFINITIONS = `Definisi resmi (wajib dipakai persis):
- Relasi dari himpunan A ke himpunan B adalah aturan yang memasangkan anggota-anggota himpunan A dengan anggota-anggota himpunan B.
- Fungsi (pemetaan) dari A ke B adalah relasi khusus yang memasangkan setiap anggota A dengan tepat satu anggota B.
- A = domain (daerah asal), B = kodomain (daerah kawan), himpunan semua peta = daerah hasil (range), dan daerah hasil adalah himpunan bagian dari kodomain.
- Pada fungsi BOLEH dua anggota A berpasangan dengan anggota B yang sama, dan BOLEH ada anggota B yang tidak punya pasangan.
- Pada fungsi TIDAK BOLEH ada anggota A tanpa pasangan, atau satu anggota A punya lebih dari satu pasangan.
- Korespondensi satu-satu antara A dan B adalah fungsi yang memasangkan setiap anggota A dengan tepat satu anggota B dan setiap anggota B dengan tepat satu anggota A. Syarat perlu: n(A) = n(B).
- Banyak pemetaan dari A ke B = n(B)^n(A).
- Banyak korespondensi satu-satu antara A dan B dengan n(A) = n(B) = n adalah n!.
- Uji garis vertikal: relasi adalah fungsi jika setiap garis vertikal di x anggota A memotong grafik tepat satu kali.`;

// Daftar Periksa "Ciri-ciri" — docs/02 §5.
export const CHECKLIST = `Daftar Periksa Ciri-ciri:
1. Apakah ada aturan yang memasangkan anggota A dengan anggota B? Jika ya: relasi.
2. Apakah setiap anggota A punya pasangan?
3. Apakah setiap anggota A punya tepat satu pasangan? Jika (2) dan (3) ya: fungsi.
4. Apakah setiap anggota B juga dipasangkan tepat satu kali? Jika ya: korespondensi satu-satu.`;

// Batas materi: BUKAN definisi baru. Mencegah AI mengarang atau mencampur istilah (keputusan pemilik, 17 Nov 2026).
export const SCOPE_RULES = `Batas materi:
- Istilah fungsi satu-satu (injektif), fungsi pada (surjektif), fungsi bijektif, dan fungsi banyak-ke-satu belum termasuk materi RELAFUN. Tidak ada definisi resminya di sini.
- Jika siswa menanyakan istilah itu, katakan terus terang bahwa istilah itu belum dibahas di RELAFUN. Jangan membuat definisinya.
- Jangan menyamakan fungsi satu-satu dengan korespondensi satu-satu. Jelaskan korespondensi satu-satu hanya dengan definisi resmi.
- Boleh menjelaskan hal yang langsung mengikuti definisi resmi, misalnya pada fungsi dua anggota domain boleh berpasangan dengan anggota kodomain yang sama.`;

const BASE_RULES = `Kamu adalah Tutor RELAFUN, tutor matematika untuk siswa SMP kelas VIII pada materi Relasi dan Fungsi.
Aturan menjawab:
- Langsung jawab. Jangan membuka dengan salam atau pujian, misalnya "Halo!" atau "Pertanyaan yang bagus".
- Pakai Bahasa Indonesia yang sederhana, ramah, dan mudah dipahami siswa SMP.
- Setiap kalimat paling banyak 25 kata.
- Pakai istilah baku: domain, kodomain, daerah hasil, korespondensi satu-satu.
- Jangan pernah memakai kata "Salah!" atau "Gagal". Jelaskan mengapa, dengan nada mendukung.
- Hanya bahas himpunan, pasangan berurutan, relasi, dan fungsi. Untuk topik lain, tolak dengan sopan dan ajak kembali ke materi.
- Jangan meminta atau menyebut data pribadi (nama lengkap, alamat, nomor HP, sekolah).
- Jangan memakai format Markdown (tanpa **, #, tabel, atau daftar bertingkat).
- Tulis notasi sebagai teks biasa: f(x), n(A), A → B, {1, 2, 3}, (1, a). Tulis pangkat dengan tanda ^, misalnya 3^2 atau n(B)^n(A). Jangan memakai LaTeX.
- Jangan mengarang definisi. Pakai hanya definisi resmi di bawah. Jika tidak yakin, katakan terus terang dan sarankan membuka menu Materi.
- Jangan pernah mengatakan jawabanmu pasti benar.

${DEFINITIONS}

${SCOPE_RULES}`;

const MODE_RULES = {
  tanya: `Mode: tanya-jawab tentang relasi dan fungsi.
- Jawab paling banyak 5 kalimat, termasuk kalimat penutup atau pertanyaan balik.
- Bila membantu, beri satu contoh kecil dengan himpunan sederhana.
- Untuk pertanyaan lanjutan, pakai isi percakapan sebelumnya.`,
  salah: `Mode: penjelasan setelah siswa memilih jawaban yang kurang tepat.
- Jawab paling banyak 3 kalimat.
- Kunci jawaban dari aplikasi SELALU benar. Jangan membantah atau mengubah kunci.
- Jelaskan mengapa pilihan siswa kurang tepat, kaitkan dengan miskonsepsi yang disebut, lalu arahkan ke kunci.`,
  bedah: `Mode: membantu mengurai soal cerita di Bedah Soal (tahap Diketahui, Karakteristik, Konsep, Penyelesaian, Kesimpulan).
- Jawab paling banyak 3 kalimat.
- JANGAN memberi jawaban akhir.
- Beri satu petunjuk atau satu pertanyaan penuntun yang sesuai tahap yang sedang dikerjakan siswa.`,
};

const CONTEXT_LABELS = {
  soal: 'Soal', tahap: 'Tahap Bedah Soal', pilihanSiswa: 'Pilihan siswa', kunci: 'Kunci jawaban',
  miskonsepsi: 'Miskonsepsi terkait', pembahasan: 'Pembahasan resmi',
};

// Pilihan konsep untuk Mode Pembahasan — hanya konsep yang punya definisi resmi.
export const CONCEPT_CHOICES = [
  'Relasi',
  'Fungsi (pemetaan)',
  'Korespondensi satu-satu',
  'Domain, kodomain, dan daerah hasil',
  'Nilai fungsi',
  'Banyak pemetaan',
  'Banyak korespondensi satu-satu',
  'Belum dapat ditentukan',
];

const ANALYZE_BASE = `Tugas: AI Pembahas Soal. Siswa mengetik sebuah soal. Analisis soal itu secara sistematis.
Keluaran WAJIB berupa JSON sesuai skema. Setiap isian berupa kalimat pendek, tanpa Markdown.
- Jika soal bukan tentang himpunan, pasangan berurutan, relasi, atau fungsi, isi diLuarTopik = true dan biarkan isian lain kosong.
- diketahui: daftar informasi yang tertulis di soal. Jangan menambah data yang tidak ada di soal.
- ditanya: apa yang diminta soal.
- infoKurang: daftar informasi yang dibutuhkan tetapi tidak ada di soal. Kosongkan bila soal sudah lengkap. Jangan menebak data yang hilang.
- Soal bisa berupa diagram panah yang ditulis sebagai teks (misalnya a → 1), himpunan pasangan berurutan, atau soal cerita.
- Pakai nama himpunan yang tertulis di soal (misalnya P dan Q). Definisi resmi memakai A dan B hanya sebagai contoh.
- Jangan menambah salam, harapan, atau keraguan (misalnya "semoga membantu" atau "sepertinya"). Aplikasi sudah menampilkan peringatan bahwa jawaban AI bisa keliru.

${CHECKLIST}`;

const ANALYZE_MODE_RULES = {
  petunjuk: `Mode Petunjuk: bantu siswa menemukan konsep sendiri.
- JANGAN memberi jawaban akhir. JANGAN menyebut nama konsep yang tepat. JANGAN menghitung hasil akhir.
- JANGAN menuliskan rumus. Boleh menyarankan siswa mengingat rumus yang sesuai di menu Materi.
- pertanyaanPenuntun: 2 sampai 4 pertanyaan dari Daftar Periksa Ciri-ciri, disesuaikan dengan isi soal.
- arahLangkah: 2 sampai 4 petunjuk langkah yang harus dikerjakan siswa sendiri.`,
  pembahasan: `Mode Pembahasan: beri analisis dan penyelesaian lengkap.
- konsep: pilih satu dari daftar pilihan. Jika relasi bukan fungsi, pilih "Relasi" dan jelaskan syarat fungsi yang tidak terpenuhi.
- alasan: 2 sampai 4 kalimat. Jelaskan mengapa konsep itu sesuai dengan memeriksa ciri-ciri pada soal.
- langkah: 2 sampai 6 langkah penyelesaian berurutan. Setiap langkah memeriksa data nyata dari soal, bukan hanya perintah umum. Tunjukkan perhitungan, misalnya 3^4 = 81.
- kesimpulan: jawaban akhir beserta penjelasan singkat. Jangan mengatakan jawaban pasti benar.
- Jika infoKurang tidak kosong, tulis kesimpulan bersyarat atau katakan jawaban belum bisa ditentukan.`,
};

const STR = { type: 'STRING' };
const LIST = { type: 'ARRAY', items: STR };

/** Skema JSON (format responseSchema Gemini) untuk setiap mode Pembahas Soal. */
export const ANALYZE_SCHEMAS = {
  petunjuk: {
    type: 'OBJECT',
    properties: {
      diLuarTopik: { type: 'BOOLEAN' },
      diketahui: LIST,
      ditanya: STR,
      infoKurang: LIST,
      pertanyaanPenuntun: LIST,
      arahLangkah: LIST,
    },
    required: ['diLuarTopik', 'diketahui', 'ditanya', 'infoKurang', 'pertanyaanPenuntun', 'arahLangkah'],
    propertyOrdering: ['diLuarTopik', 'diketahui', 'ditanya', 'infoKurang', 'pertanyaanPenuntun', 'arahLangkah'],
  },
  pembahasan: {
    type: 'OBJECT',
    properties: {
      diLuarTopik: { type: 'BOOLEAN' },
      diketahui: LIST,
      ditanya: STR,
      infoKurang: LIST,
      konsep: { type: 'STRING', enum: CONCEPT_CHOICES },
      alasan: STR,
      langkah: LIST,
      kesimpulan: STR,
    },
    required: ['diLuarTopik', 'diketahui', 'ditanya', 'infoKurang', 'konsep', 'alasan', 'langkah', 'kesimpulan'],
    propertyOrdering: ['diLuarTopik', 'diketahui', 'ditanya', 'infoKurang', 'konsep', 'alasan', 'langkah', 'kesimpulan'],
  },
};

// Isian yang boleh dikirim ke aplikasi per mode. Mode Petunjuk TIDAK PERNAH membawa konsep/kesimpulan.
const ANALYZE_FIELDS = {
  petunjuk: { text: ['ditanya'], list: ['diketahui', 'infoKurang', 'pertanyaanPenuntun', 'arahLangkah'] },
  pembahasan: { text: ['ditanya', 'konsep', 'alasan', 'kesimpulan'], list: ['diketahui', 'infoKurang', 'langkah'] },
};

const clip = (text, max) => String(text ?? '').trim().slice(0, max);
const fail = (error) => ({ ok: false, error });

/**
 * Memeriksa permintaan Tutor AI: { mode?, messages, context? }.
 * Mengembalikan { ok:true, value } atau { ok:false, error } (error: invalid | tooShort | tooLong).
 */
export function validateRequest(body) {
  if (!body || typeof body !== 'object') return fail('invalid');
  const mode = body.mode == null ? 'tanya' : body.mode;
  if (!TUTOR_MODES.includes(mode)) return fail('invalid');
  if (!Array.isArray(body.messages) || body.messages.length === 0) return fail('invalid');

  const recent = body.messages
    .slice(-LIMITS.messages)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
  const last = recent[recent.length - 1];
  if (!last || last.role !== 'user') return fail('invalid');
  const question = last.content.trim();
  if (question.length < LIMITS.questionMin) return fail('tooShort');
  if (question.length > LIMITS.questionMax) return fail('tooLong');

  const messages = recent
    .map((m) => ({ role: m.role, content: clip(m.content, LIMITS.messageChars) }))
    .filter((m) => m.content.length > 0);

  const context = {};
  if (body.context && typeof body.context === 'object') {
    for (const key of Object.keys(CONTEXT_LABELS)) {
      if (typeof body.context[key] === 'string' && body.context[key].trim()) {
        context[key] = clip(body.context[key], LIMITS.contextChars);
      }
    }
  }
  return { ok: true, value: { mode, messages, context } };
}

/** Memeriksa permintaan Pembahas Soal: { soal, mode }. */
export function validateAnalyzeRequest(body) {
  if (!body || typeof body !== 'object') return fail('invalid');
  if (!ANALYZE_MODES.includes(body.mode)) return fail('invalid');
  if (typeof body.soal !== 'string') return fail('invalid');
  const soal = body.soal.trim();
  if (soal.length < LIMITS.soalMin) return fail('tooShort');
  if (soal.length > LIMITS.soalMax) return fail('tooLong');
  return { ok: true, value: { mode: body.mode, soal } };
}

/** Instruksi sistem Tutor AI: aturan dasar + aturan mode + konteks soal (bila ada). */
export function buildSystemPrompt(mode, context = {}) {
  const lines = Object.entries(context).map(([key, value]) => `${CONTEXT_LABELS[key]}: ${value}`);
  const contextBlock = lines.length ? `\n\nKonteks dari aplikasi:\n${lines.join('\n')}` : '';
  return `${BASE_RULES}\n\n${MODE_RULES[mode]}${contextBlock}`;
}

/** Instruksi sistem Pembahas Soal. */
export function buildAnalyzePrompt(mode) {
  return `${BASE_RULES}\n\n${ANALYZE_BASE}\n\n${ANALYZE_MODE_RULES[mode]}`;
}

/** Riwayat aplikasi → format `contents` Gemini (peran assistant = model). */
export function toGeminiContents(messages) {
  return messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
}

/** Membersihkan sisa format Markdown dari jawaban AI. */
export function cleanReply(text) {
  return String(text ?? '')
    .replace(/\*\*|__|`/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Menghapus klaim kepastian ("pasti benar", "dijamin benar"); jawaban AI selalu perlu diperiksa. */
export function softenCertainty(text) {
  return String(text ?? '').replace(/\b(pasti|dijamin|100\s?%)\s+benar\b/gi, 'perlu diperiksa lagi');
}

const cleanItem = (value) => softenCertainty(cleanReply(clip(value, LIMITS.itemChars)));

/**
 * Merapikan JSON dari Gemini untuk Pembahas Soal: hanya isian yang diizinkan per mode,
 * teks dipotong, Markdown & klaim kepastian dibuang. Mengembalikan null bila bentuknya tidak sah.
 */
export function shapeAnalysis(mode, raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (data.diLuarTopik === true) return { mode, diLuarTopik: true };

  const fields = ANALYZE_FIELDS[mode];
  const out = { mode, diLuarTopik: false };
  for (const key of fields.text) out[key] = cleanItem(typeof data[key] === 'string' ? data[key] : '');
  for (const key of fields.list) {
    const list = Array.isArray(data[key]) ? data[key] : [];
    out[key] = list.filter((v) => typeof v === 'string').map(cleanItem).filter(Boolean).slice(0, LIMITS.listItems);
  }
  if (mode === 'pembahasan' && !CONCEPT_CHOICES.includes(out.konsep)) out.konsep = 'Belum dapat ditentukan';
  if (!out.ditanya && out.diketahui.length === 0) return null;
  return out;
}

/**
 * Batas pemakaian per perangkat di memori server (cukup untuk skala satu kelas).
 * Mengembalikan fungsi (key, now?) → true bila boleh, false bila batas jendela habis.
 */
export function createRateLimiter(perWindow = LIMITS.perWindow, windowMs = LIMITS.windowMs) {
  const hits = new Map();
  return function limit(key, now = Date.now()) {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= perWindow) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return true;
  };
}

/** Pembatas bawaan (dipakai uji lama di tools/tests.js). */
export const memoryLimit = createRateLimiter();

/**
 * Penghitung harian untuk seluruh server (menjaga kuota gratis Gemini).
 * limit ≤ 0 atau bukan angka → tanpa batas. take() mengembalikan false bila batas hari ini habis.
 */
export function createDailyCounter(limit) {
  const max = Number(limit);
  let day = '';
  let count = 0;
  return {
    take(now = new Date()) {
      if (!Number.isFinite(max) || max <= 0) return true;
      const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      if (today !== day) {
        day = today;
        count = 0;
      }
      if (count >= max) return false;
      count += 1;
      return true;
    },
  };
}
