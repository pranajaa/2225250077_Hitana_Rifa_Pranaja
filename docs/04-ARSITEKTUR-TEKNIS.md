# 04 — Arsitektur Teknis

## 1. Keputusan Teknologi

| Aspek | Pilihan | Alasan |
|---|---|---|
| Bahasa | HTML5, CSS3, JavaScript (ES Modules) | Sesuai rekomendasi draft; mudah dipelajari; tanpa *build step* |
| Framework | **Tidak ada** (vanilla JS) | Ringan untuk HP spek rendah; mudah dipahami dan dijelaskan di laporan |
| Platform mobile | **PWA** (manifest + service worker) | Dapat "diinstal" di Android dan berjalan offline tanpa Play Store |
| APK (opsional) | Capacitor | Membungkus folder web menjadi APK bila dibutuhkan (P2) |
| Penyimpanan | `localStorage` (via modul `storage.js`) | Tanpa server; data progres tetap di perangkat |
| Visual matematika | SVG yang digambar dari data (modul `diagram.js`) | Tajam di semua layar, ringan, bisa interaktif |
| Hosting | GitHub Pages / Netlify (statis, HTTPS) | Gratis; HTTPS diperlukan oleh service worker |
| Pengujian | Uji unit di browser (`tools/test.html`) + validasi bank soal di browser (`tools/validate.html`) | Tanpa Node.js; tetap JavaScript |
| **Analisis statistik** | **Python 3.11+** (pandas, scipy, matplotlib) di folder `analysis/` | Data statistik penelitian diolah terpisah di laptop peneliti, bukan di HP siswa. Detail: [09](09-ANALISIS-DATA-PYTHON.md) |

**Aturan bahasa:** data umum & semua logika aplikasi → **JavaScript**; data statistik
(uji coba, pre/post-test, angket, analisis butir) → **Python**.
| Server lokal dev | `python -m http.server 8000` (atau ekstensi VS Code *Live Server*) | ES modules & service worker butuh `http://`, bukan `file://`; Python sudah terpasang |
| Server lokal + AI | Node.js LTS + Express (`server/`, `npm start` → `localhost:3000`) | Menyajikan aplikasi + API Gemini; API key di `server/.env`; hanya untuk praktik/demo lokal (docs/11) |

Tidak memakai library pihak ketiga pada MVP. Jika nanti dibutuhkan (mis. KaTeX), muat dari
CDN dengan versi tetap dan cache oleh service worker.

## 2. Struktur Folder

```
RelaFun/
├── CLAUDE.md                  # Panduan untuk asisten AI (Claude Code)
├── README.md
├── docs/                      # Dokumen perencanaan
├── index.html                 # Shell aplikasi (SPA)
├── manifest.webmanifest       # Konfigurasi PWA
├── sw.js                      # Service worker (cache offline)
├── assets/
│   ├── icons/                 # Ikon PWA 192, 512, maskable
│   └── fonts/                 # (opsional) font lokal
├── css/
│   ├── tokens.css             # Variabel warna, ukuran, jarak (design tokens)
│   ├── base.css               # Reset & tipografi
│   ├── components.css         # Tombol, kartu, kuis, hint, umpan balik
│   └── diagram.css            # Gaya diagram panah & Cartesius
├── js/
│   ├── app.js                 # Titik masuk: inisialisasi, registrasi SW
│   ├── router.js              # Router berbasis hash (#/materi/U3)
│   ├── storage.js             # Baca/tulis progres (satu-satunya akses localStorage)
│   ├── progress.js            # Hitung penguasaan per konsep, rekomendasi
│   ├── quiz-engine.js         # Penilaian jawaban (fungsi murni, diuji di tools/tests.js)
│   ├── quiz-ui.js             # Komponen kuis: ChoiceList, HintButton, FeedbackSheet, input himpunan/pasangan/alasan
│   ├── diagram.js             # Render SVG: panah, Cartesius, pasangan berurutan
│   ├── math.js                # Fungsi murni: isFunction, isBijection, range, countMappings
│   ├── ui.js                  # Helper DOM kecil (h(), toast, modal)
│   ├── ai.js                  # Klien asisten AI → server lokal ./api (tanpa API key)
│   └── views/
│       ├── home.js
│       ├── materi.js          # #/materi, #/materi/U3 (6 layar RMT)
│       ├── kenali.js          # #/kenali/:level
│       ├── bedah.js           # #/bedah/:id
│       ├── latihan.js         # #/latihan/:level
│       ├── literasi.js        # #/literasi/:id (Misi Literasi)
│       ├── asisten.js         # Tutor AI (F14)
│       ├── pembahas.js        # AI Pembahas Soal (F14)
│       └── progres.js
│   ├── literacy-scorer.js     # Skor per tahap & per indikator (LR/LF/LE/LI)
│   └── export.js              # Ekspor hasil ke CSV/JSON untuk analisis Python
├── data/
│   ├── materi/U0.json … U7.json  # Isi materi per unit (6 layar RMT + cek pemahaman MT-xxx)
│   ├── kenali-konsep.json     # KK-001 … KK-030
│   ├── bedah-soal.json        # BS-001 … BS-010
│   ├── latihan.json           # LT-001 … LT-045
│   ├── misi-literasi.json     # LM-001 … LM-012 (Misi Literasi)
│   ├── misconceptions.json    # M01–M10: judul + pesan umpan balik
│   ├── ai.json                # Alamat API (./api) + teks layar Tutor AI & Pembahas Soal
│   └── glossary.json          # Istilah terverifikasi docs/02 / perlu verifikasi / tidak dipakai
├── tools/
│   ├── test.html + tests.js   # Uji unit JavaScript (buka di browser)
│   ├── seed-demo.html         # Mengisi progres contoh untuk demo
│   └── validate.html + validate.js  # Validasi seluruh konten data/ dengan math.js (harus "0 galat")
├── server/
│   ├── package.json           # Node.js: express + @google/genai (node_modules/ di sini, tidak di-commit)
│   ├── server.js              # Express: sajikan aplikasi + /api/status, /api/tutor, /api/analyze
│   ├── rules.js               # Definisi resmi, instruksi, validasi, batas (fungsi murni; diuji di browser & Node)
│   ├── gemini.js              # SDK @google/genai, pemetaan error, model cadangan
│   ├── list-models.js         # npm run models — daftar model Gemini untuk key
│   ├── .env.example           # Contoh pengaturan; .env asli berisi API key (di .gitignore)
│   └── test/server.test.js    # npm test — uji dengan Gemini tiruan
└── analysis/                  # PYTHON — analisis data statistik (tidak ikut di-deploy)
    ├── requirements.txt
    ├── relafun_stats/         # Fungsi statistik
    ├── scripts/               # 01_bersihkan_data.py … 06_laporan.py
    ├── data/raw/              # CSV ekspor (di .gitignore)
    └── output/
```

Folder `analysis/` dan `server/` dikecualikan dari service worker dan dari deploy GitHub Pages.

## 3. Arsitektur Aplikasi

```
index.html
   └─ app.js ── router.js ──► views/*.js  (render ke <main id="app">)
                    │              │
                    │              ├─ quiz-engine.js ── math.js
                    │              ├─ literacy-scorer.js
                    │              ├─ diagram.js
                    │              └─ progress.js ── storage.js ── localStorage
                    │                                     │
                    │                               export.js ──► file CSV ──► analysis/ (Python)
                    └─ data/*.json (fetch, di-cache oleh sw.js)

views/asisten.js, pembahas.js ── ai.js ──POST ./api──► server/server.js (Express, localhost) ──► Gemini API
                                     (API key di server/.env; batas pemakaian; definisi resmi docs/02 §5)
```

- **Asisten AI (F14):** satu-satunya komunikasi ke server. Detail kontrak, batas, dan pemasangan:
  [11-ASISTEN-AI](11-ASISTEN-AI.md). Service worker tidak meng-cache `/api/` (daftar `EXCLUDED` di `sw.js`).
  Di GitHub Pages tidak ada server, jadi fitur AI tampil "belum tersedia" dan fitur lain tetap jalan.

- **SPA dengan hash router**: rute `#/masuk`, `#/profil` (ubah nama), `#/`, `#/materi`, `#/materi/U3/2`, `#/kenali`, `#/kenali/KK-012`,
  `#/bedah`, `#/bedah/BS-003`, `#/latihan/sedang`, `#/progres`.
  Hash dipilih agar berjalan di GitHub Pages tanpa konfigurasi server.
- Setiap view mengekspor `render(container, params)` dan (opsional) `destroy()`.
- **Konten terpisah dari kode**: view tidak boleh berisi teks soal; semua dari `data/*.json`.

## 4. Logika Matematika (`math.js`)

Fungsi murni yang menjadi "kebenaran" untuk memeriksa soal berbasis diagram:

```js
// pairs: [[a, b], ...], A: domain, B: kodomain
isRelation(A, B, pairs)        // semua pasangan a∈A, b∈B
isFunction(A, B, pairs)        // setiap a∈A muncul tepat satu kali sebagai elemen pertama
isOneToOneCorrespondence(A, B, pairs) // isFunction && setiap b∈B muncul tepat sekali
rangeOf(pairs)                 // himpunan elemen kedua (unik)
countMappings(nA, nB)          // nB ** nA
countBijections(n)             // n!
evaluate(rule, x)              // untuk f(x) = ax + b (MVP: linear & kuadrat sederhana)
```

`tools/validate.html` memakai `math.js` untuk memastikan kunci soal bertipe diagram
konsisten dengan data `visual.pairs` (mencegah kunci salah).

## 5. Model Data Progres (`localStorage`)

Kunci tunggal: `relafun:v1`

```json
{
  "version": 1,
  "createdAt": "2026-11-13T08:00:00Z",
  "profile": { "nickname": "Nadia" },
  "units": { "U3": { "status": "selesai", "lastScreen": 4, "completedAt": "..." } },
  "attempts": [
    { "qid": "KK-012", "ts": "...", "correct": false, "reasonCorrect": true,
      "choice": "relasi", "misconception": "M01", "hintsUsed": 1, "timeMs": 42000 }
  ],
  "mastery": { "syarat-fungsi": { "recent": [1,0,1,1,1], "status": "sedang" } },
  "settings": { "fontScale": 1, "simpleLanguage": false, "theme": "auto" }
}
```

- `mastery` **tidak disimpan**; dihitung ulang dari `attempts` oleh `js/progress.js` (menghindari data ganda).
- Untuk misi literasi, `attempts` menyimpan juga `indicator` dan `stageScores` (mis. `[1,2,1,0,1]`).
- `profile.studentCode` (opsional, mis. "S01") dipakai hanya untuk ekspor penelitian.
- `attempts` dibatasi 500 entri terakhir (FIFO) agar ukuran kecil; hasil `pretest`/`posttest` tidak ikut terhapus.
- Ada field `version` untuk migrasi skema di masa depan.
- P1: tombol **Ekspor/Impor progres** (file JSON) dan **Ekspor hasil tes (CSV)** untuk penelitian.
  Format kolom CSV ditetapkan di [09-ANALISIS-DATA-PYTHON §2](09-ANALISIS-DATA-PYTHON.md#2-alur-data);
  `export.js` (JavaScript) dan `load.py` (Python) harus mengikuti format yang sama.
- **Masuk sederhana (F13):** `profile.nickname` wajib diisi di layar `#/masuk` (validasi di `js/profile.js`);
  router menolak semua rute lain sampai nama ada (`authGuard` di `js/app.js`). Tidak meminta nama lengkap,
  sekolah, kata sandi, atau data pribadi lain. **Keluar** = `resetAll()` (hapus nama + progres di perangkat).
- `profile.nickname` **tidak boleh** ikut ke file ekspor CSV; ekspor hanya memakai `profile.studentCode`.

## 6. PWA & Offline

- `manifest.webmanifest`: `name: "RELAFUN"`, `display: "standalone"`, `start_url: "./"`,
  `theme_color`, ikon 192 & 512 (+ maskable), `lang: "id"`.
- `sw.js`: strategi **cache-first** untuk aset statis (HTML/CSS/JS/ikon),
  **stale-while-revalidate** untuk `data/*.json`. Nama cache memakai versi (`relafun-v1`);
  naikkan versi setiap rilis agar cache lama dibersihkan.
- Semua path **relatif** (`./js/app.js`) agar berjalan di subfolder GitHub Pages.

## 7. Rencana APK (P2)

1. `npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android`
2. `npx cap init RELAFUN id.relafun.app --web-dir .` (atau salin aset ke `www/`)
3. `npx cap add android && npx cap open android` → build APK di Android Studio.

## 8. Standar Kode

- JavaScript modern (ES2020), `const`/`let`, modul ES, tanpa variabel global.
- Penamaan file `kebab-case.js`; fungsi `camelCase`; ID konten seperti di dokumen 03.
- Teks antarmuka dan konten dalam Bahasa Indonesia; nama variabel/fungsi boleh Bahasa Inggris.
- Tidak memakai `innerHTML` dengan data yang belum di-*escape*; gunakan helper `h()` / `textContent`.
- CSS: gunakan variabel dari `tokens.css`; *mobile-first* (`min-width` media query).
- Python: PEP 8, `snake_case`, fungsi statistik murni di `relafun_stats/` dengan docstring
  berisi rumus; skrip di `scripts/` hanya memanggil fungsi (tanpa logika rumus); diuji dengan `pytest`.
