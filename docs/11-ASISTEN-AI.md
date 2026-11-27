# 11 — Asisten AI (Google Gemini lewat Server Lokal)

Status: **dibangun & diuji (17 Nov 2026)**; mode hosting disiapkan 27 Nov 2026 (§9). Fitur ini adalah **F14**
di [PRD](PRD.md).

> **Perubahan arah (17 Nov 2026, keputusan pemilik):** rancangan lama DeepSeek + Cloudflare Worker **dibatalkan**.
> Sekarang: Google Gemini API (Free Tier) lewat server **Node.js + Express**. Tanpa Cloudflare, tanpa layanan berbayar.
>
> **Tambahan (27 Nov 2026, keputusan pemilik):** server yang sama boleh dijalankan di **hosting gratis terpisah**
> (bukan Cloudflare) agar fitur AI juga bisa dipakai dari versi GitHub Pages. Mode lokal tetap berjalan seperti semula.

## 1. Tujuan dan Fitur
Membantu siswa yang kesulitan **menentukan konsep yang tepat** (relasi / fungsi / korespondensi satu-satu).

| Fitur | Rute / endpoint | Isi | Status |
|---|---|---|---|
| **Tutor AI** | `#/asisten` → `POST /api/tutor` (mode `tanya`) | Tanya-jawab, contoh tambahan, pertanyaan lanjutan | ✔ dibangun |
| **AI Pembahas Soal** | `#/pembahas` → `POST /api/analyze` | Mengurai soal ketikan siswa: identifikasi → konsep → alasan → langkah → kesimpulan | ✔ dibangun |
| Penjelasan setelah jawaban kurang tepat | `POST /api/tutor` mode `salah` | Kunci dari aplikasi dikirim sebagai konteks; AI dilarang membantah | server siap; tombol dipasang bersama `quiz-engine.js` (Fase 4) |
| Petunjuk di tahap Bedah Soal | `POST /api/tutor` mode `bedah` | Satu petunjuk per tahap, tanpa jawaban akhir | server siap; tombol dipasang bersama view Bedah Soal (Fase 4) |

**Dua mode Pembahas Soal**
- **Mode Petunjuk:** identifikasi soal, pertanyaan penuntun dari *Daftar Periksa Ciri-ciri* (docs/02 §5), dan arah
  langkah. **Tanpa** nama konsep, tanpa hitungan akhir, tanpa kesimpulan. Skema JSON mode ini tidak memuat isian itu,
  dan server tetap membuangnya bila AI menuliskannya (`shapeAnalysis`).
- **Mode Pembahasan:** kelima langkah lengkap, termasuk jawaban akhir. Selalu tampil peringatan
  *"Jawaban AI bisa keliru. Periksa lagi dengan Materi atau tanyakan gurumu."*

## 2. Prinsip (tidak boleh dilanggar)
1. **API key tidak pernah ada di aplikasi atau repo.** Key hanya di `server/.env` (masuk `.gitignore`).
2. **AI tidak menilai soal bank.** Kunci tetap dari data soal yang konsisten dengan `js/math.js`. Jawaban akhir AI
   hanya untuk soal ketikan siswa di Mode Pembahasan (disetujui pemilik, 17 Nov 2026), selalu dengan peringatan.
3. **Definisi resmi.** Setiap permintaan dibekali `DEFINITIONS` dan *Daftar Periksa Ciri-ciri* dari
   [02 §5](02-DESAIN-PEMBELAJARAN.md) (`server/rules.js`). Uji `server/test` gagal bila keduanya berbeda.
4. **Batas materi.** Tidak ada definisi baru. Istilah fungsi satu-satu (injektif), fungsi pada, bijektif, dan
   banyak-ke-satu belum termasuk materi: AI wajib mengatakannya terus terang, tidak mengarang definisi, dan
   **tidak menyamakan** fungsi satu-satu dengan korespondensi satu-satu.
5. **Bahasa sederhana.** Tutor ≤ ±5 kalimat (mode `salah`/`bedah` ≤ 3), ≤ 25 kata per kalimat, istilah baku,
   tanpa Markdown, tanpa kata "Salah!"/"Gagal". AI tidak boleh mengklaim jawabannya pasti benar
   (frasa "pasti benar" juga dibuang server).
6. **Privasi.** Yang dikirim hanya teks pertanyaan/soal, riwayat singkat, dan konteks soal. **Tidak** ada nama,
   kode siswa, atau progres. Riwayat hanya di memori halaman. Server tidak mencatat isi pertanyaan di log.
   Pada Free Tier, Google dapat memakai isi prompt untuk mengembangkan layanannya (cek ketentuan terbaru) —
   karena itu catatan privasi selalu tampil di layar.
7. **Tetap bisa belajar tanpa AI.** Server mati, key kosong, kuota habis, atau offline → pesan ramah di halaman AI
   saja; menu lain tidak terpengaruh. Versi GitHub Pages berjalan tanpa backend (fitur AI "belum tersedia").

## 3. Arsitektur

```
Laptop guru/siswa — http://localhost:3000 (satu server, satu alamat → tanpa CORS)
  Browser: js/views/asisten.js, pembahas.js ─► js/ai.js ──► server/server.js (Express)
                                                              ├ GET  /api/status   (tanpa memanggil Gemini)
                                                              ├ POST /api/tutor
                                                              ├ POST /api/analyze  (JSON terstruktur)
                                                              ├ server/rules.js   definisi, aturan, validasi, batas
                                                              └ server/gemini.js  @google/genai ──► Gemini API
  File aplikasi (index.html, css/, js/, data/, assets/, tools/) disajikan oleh server yang sama.

GitHub Pages (dist/, tanpa server/) ─► ./api/status = 404 ─► "Fitur AI hanya tersedia di server lokal"
```

- **Satu backend saja.** `server/ai-proxy.js` (Worker DeepSeek) digantikan oleh `server/rules.js` + `server/gemini.js`
  + `server/server.js`. Mode lama `tanya`/`salah`/`bedah` tetap ada.
- Alamat API di aplikasi: `data/ai.json → endpoint = "./api"` (relatif, bukan rahasia).
- Server **hanya** menyajikan file aplikasi; `server/`, `.env`, `analysis/`, `docs/` tidak bisa dibuka lewat browser.
- Service worker tidak menyentuh `/api/` (`EXCLUDED` di `sw.js`), jadi status dan jawaban AI tidak pernah di-cache.

**Kontrak**

| Endpoint | Permintaan | Jawaban sukses |
|---|---|---|
| `GET /api/status` | — | `{ ready: true }` atau `{ ready: false, reason: 'nokey' }` |
| `POST /api/tutor` | `{ mode?: 'tanya'\|'salah'\|'bedah', messages: [{role:'user'\|'assistant', content}], context? }` | `{ reply }` |
| `POST /api/analyze` | `{ soal, mode: 'petunjuk'\|'pembahasan' }` | `{ result }` (lihat di bawah) |

`result` Mode Pembahasan: `{ mode, diLuarTopik, diketahui[], ditanya, infoKurang[], konsep, alasan, langkah[], kesimpulan }`.
`konsep` hanya salah satu dari `CONCEPT_CHOICES` (Relasi, Fungsi (pemetaan), Korespondensi satu-satu, Domain/kodomain/
daerah hasil, Nilai fungsi, Banyak pemetaan, Banyak korespondensi satu-satu, Belum dapat ditentukan).
`result` Mode Petunjuk: `{ mode, diLuarTopik, diketahui[], ditanya, infoKurang[], pertanyaanPenuntun[], arahLangkah[] }`.

**Kode error** → pesan ramah di `data/ai.json → messages`

| Kode | HTTP | Kapan |
|---|---|---|
| `unavailable` | — | Tidak ada server (GitHub Pages, `python -m http.server`) |
| `nokey` | 503 | `GEMINI_API_KEY` atau `GEMINI_MODEL` kosong |
| `badkey` | 502 | Key ditolak Google |
| `quota` | 429 | Kuota Gemini habis, atau batas harian server (`AI_DAILY_LIMIT`) tercapai |
| `limit` | 429 | > 20 permintaan per 10 menit dari satu perangkat |
| `busy` | 503 | Gemini sibuk (5xx) atau batas waktu 25 detik per model habis (aplikasi menunggu maks. 60 detik) |
| `upstream` | 502 | Laptop server tidak bisa menghubungi Google (internet putus) |
| `network` / `offline` | — | Server RELAFUN mati / perangkat siswa offline |
| `blocked` | 422 | Ditahan filter keamanan Gemini |
| `tooShort` / `tooLong` / `invalid` | 400/413 | Input kosong, terlalu pendek/panjang, atau tidak sah |
| `server` | 502 | Galat lain (detail hanya di terminal server) |

**Batas** (`LIMITS` di `server/rules.js`; klien `js/ai.js` memakai angka yang sama): pertanyaan Tutor 3–500 huruf,
soal 10–1.500 huruf, 6 pesan riwayat dikirim (server menerima maks. 8, masing-masing dipotong 600 huruf),
body ≤ 12 KB, 20 permintaan/10 menit/perangkat, batas harian opsional. Token jawaban: Tutor 1.024, Pembahas 2.048.

## 4. Model dan Kuota (Free Tier)
- Nama model **tidak** ditulis di kode. Isi `GEMINI_MODEL` di `server/.env` setelah memeriksa model yang tersedia
  untuk key kamu: `npm run models` (daftar model yang mendukung `generateContent`; pilih model **Flash**).
- `GEMINI_MODEL_FALLBACK` (opsional, mis. model Flash-Lite) dicoba sekali bila model utama kena kuota/sibuk.
- **Kuota gratis terbatas dan bisa berubah.** Google tidak menjamin angka Free Tier; laporan pengembang menyebut
  model Flash terbaru bisa hanya ±20 permintaan/hari. Lihat angka untuk project kamu di AI Studio, lalu isi
  `AI_DAILY_LIMIT` sedikit di bawahnya agar siswa mendapat pesan ramah lebih dulu.
- Jangan mengaktifkan *billing* di project Google Cloud key ini — tanpa billing, pemakaian tidak bisa ditagih.

## 5. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| AI keliru konsep/hitungan | Definisi resmi + daftar periksa di instruksi sistem; konsep dibatasi daftar resmi; suhu 0,2–0,3; peringatan di layar; uji §7 sebelum dipakai siswa |
| AI memberi jawaban di Mode Petunjuk | Skema tanpa isian jawaban + server membuang `konsep/alasan/langkah/kesimpulan` (diuji) |
| Istilah di luar materi (injektif, dll.) | Aturan batas materi; AI wajib jujur dan tidak mengarang |
| Key bocor | Key hanya di `server/.env` (di `.gitignore`); server hanya membuka file aplikasi; bawaan hanya menerima koneksi dari laptop itu (`127.0.0.1`) |
| Kuota habis saat kelas | `AI_DAILY_LIMIT`, model cadangan, pesan "Kuota AI gratis sedang habis" |
| Data anak (UU PDP No. 27/2022) | Tanpa identitas; catatan privasi; cantumkan pemakaian AI di surat izin/persetujuan orang tua |
| Variabel baru pada penelitian CLT | Konsultasikan dengan dosen; matikan AI saat uji coba penelitian (kosongkan key atau pakai `python -m http.server`) |

## 6. Panduan Menjalankan (lokal)
Langkah lengkap — persiapan, menjalankan (`server/mulai-relafun.cmd` atau `npm.cmd start`), demo di HP, pengaturan
`.env`, dan solusi masalah — ada di **[12-MENJALANKAN-LOKAL](12-MENJALANKAN-LOKAL.md)**.

**Mematikan AI kapan saja:** kosongkan `GEMINI_API_KEY`, atau jalankan aplikasi dengan `python -m http.server 8000`.

## 7. Uji Sebelum Dipakai Siswa
- **Otomatis, tanpa kuota:** `npm test` di `server/` (Gemini tiruan: semua kode error, input kosong/terlalu panjang,
  key kosong, Mode Petunjuk tanpa jawaban, definisi = docs/02 §5) dan `tools/test.html` (aturan & klien).
  `tools/test.html` dibuka lewat `python -m http.server 8000`, karena server Express sengaja tidak membuka folder
  `server/` (tempat `rules.js` yang diuji).
- **Tampilan error:** `AI_SIMULATE=quota|busy|upstream|badkey|blocked|server|nokey` di `.env`, lalu buka halaman AI.
- **Isi jawaban (manual, dengan key asli — catat hasilnya):**
  - Tutor: pengertian relasi; pengertian fungsi; domain, kodomain, daerah hasil; "fungsi satu-satu dan banyak-ke-satu"
    (harus: jujur di luar materi, tidak disamakan dengan korespondensi satu-satu); pertanyaan lanjutan.
  - Miskonsepsi, mis. "Kalau dua anggota A punya pasangan yang sama, masih fungsi?" (harus: masih fungsi),
    "Ada anggota B tanpa pasangan, masih fungsi?" (harus: masih fungsi), "n(A)=2, n(B)=3, banyak pemetaan?" (3^2 = 9).
  - Pembahas: soal fungsi, bukan fungsi, diagram panah (teks), pasangan berurutan, soal cerita, soal kurang lengkap
    (harus mengisi `infoKurang` dan tidak menebak); setiap soal di kedua mode.
  - Di luar topik ("Siapa presiden…?") → menolak dengan sopan / `diLuarTopik`.
- Jawaban yang menyimpang dari definisi → perbaiki instruksi di `server/rules.js`, lalu uji ulang.

## 8. Hasil Uji (17 Nov 2026)

**Model** (dicek dengan `npm run models` + satu permintaan kecil per model): `gemini-3.5-flash-lite` (utama, ±2–5 detik)
dan `gemini-3.5-flash` (cadangan). Saat diuji, `gemini-3.8-flash` dan `3.7-flash` membalas 503 (ramai),
`3.5-flash` lambat/503, dan `gemini-2.5-flash(-lite)` sudah tidak tersedia untuk pengguna baru (404).

| Uji | Hasil |
|---|---|
| `npm test` (Gemini tiruan: semua kode error, input kosong/panjang, tanpa key, Mode Petunjuk, definisi) | 22/22 lulus |
| `tools/test.html` | 42/42 lulus (diulang setelah penyempurnaan instruksi) |
| Ujung-ke-ujung di browser (Edge, lebar 360 px, Gemini asli): Pembahas Mode Pembahasan soal cerita & Tutor | Pembahas 7,2 detik — 5 langkah, peringatan tampil, 3^4 = 81; Tutor 4,6 detik — 3^2 = 9; pangkat tampil sebagai superskrip; tanpa scroll horizontal |
| Tutor 9A: relasi, fungsi, domain/kodomain/daerah hasil, M01, M02, M08 (3^2 = 9) | Benar, sesuai definisi resmi |
| Tutor: fungsi satu-satu & banyak-ke-satu | Jujur "belum termasuk materi", tidak mengarang, tidak disamakan dengan korespondensi satu-satu |
| Tutor: percakapan lanjutan 3 putaran; pertanyaan di luar topik | Konteks tersambung; di luar topik ditolak dengan sopan |
| Pembahas 9B: fungsi, bukan fungsi, diagram panah, pasangan berurutan (korespondensi satu-satu), soal cerita (3^4 = 81), soal kurang lengkap | Konsep & kesimpulan benar semua; soal kurang lengkap → `infoKurang`, tidak menebak |
| Mode Petunjuk (3 soal) | Tanpa konsep & kesimpulan |
| API key salah (Google asli) | `badkey` → "Asisten AI belum bisa dipakai…" |
| API key kosong | Aplikasi tetap tersaji; `nokey` → "Asisten AI belum disiapkan…" |
| Gemini sibuk (terjadi sungguhan) | Model utama + cadangan habis waktu → `busy` dalam ±28 detik |
| Kuota habis, internet putus | Disimulasikan (`npm test`, API tiruan di browser) — belum terjadi sungguhan |

**Perbaikan setelah uji pertama:** salam pembuka membuat jawaban Tutor > 5 kalimat; kesimpulan Pembahas berisi
kalimat pengisi ("semoga membantu", "sepertinya begitu"); Mode Petunjuk menuliskan rumus n(B)^n(A); alasan memakai
"A" padahal soal memakai P dan Q. Instruksi diperbaiki dan diuji ulang — keempatnya hilang. Catatan: Mode Petunjuk
masih boleh menyarankan "buka Materi tentang banyak pemetaan" (menyebut topik, bukan rumus/jawaban).

## 9. Mode Hosting — Backend Terpisah dari GitHub Pages (27 Nov 2026)

```
HP siswa ── https://pranajaa.github.io/2225250077_Hitana_Rifa_Pranaja/   (GitHub Pages, hanya file statis)
   │  js/ai.js: coba ./api (404 di Pages) → endpointOnline
   └──► https://<nama-proyek>.vercel.app/api   (server/ yang sama, mode hosting) ──► Gemini API
```

**Yang sama dengan mode lokal:** kode `server/` tidak bercabang; semua aturan §2 tetap. Mode hosting hanya aktif lewat
variabel lingkungan:

| Variabel | Nilai di hosting | Fungsi |
|---|---|---|
| `GEMINI_API_KEY` | *(secret — diisi pemilik di dasbor hosting)* | Tidak pernah di repo, kode, atau chat |
| `GEMINI_MODEL` / `GEMINI_MODEL_FALLBACK` | `gemini-3.5-flash-lite` / `gemini-3.5-flash` | Cek ulang dengan `npm run models` bila model berubah |
| `ALLOWED_ORIGINS` | `https://pranajaa.github.io` | CORS: hanya situs RELAFUN; situs lain & POST tanpa `Origin` ditolak (403) |
| `AI_DAILY_LIMIT` | mis. `40` (di bawah kuota gratis di AI Studio) | **Wajib** di mode hosting; bila kosong dipakai 100 |
| `AI_PER_10MIN` | mis. `60` | Batas per perangkat; satu kelas di Wi-Fi sekolah sering berbagi satu IP |
| `TRUST_PROXY` | `1` | IP tiap siswa terbaca dari header proxy hosting (tanpa ini semua siswa = satu IP) |
| `SERVE_APP` | `false` | Hanya `/api`; aplikasi tetap di GitHub Pages |
| `HOST` | `0.0.0.0` | Hanya untuk hosting yang menjalankan `npm start` (mis. Render). **Tidak perlu di Vercel** |

**Vercel (serverless):** `server/server.js` mengekspor aplikasi Express sebagai *default export* (`buildApp(process.env)`);
Vercel memanggilnya tanpa `app.listen`. Klien Gemini dibuat pada permintaan pertama.

**Perilaku aplikasi:** `data/ai.json → endpointOnline` diisi URL backend (`https://…/api`). Di laptop (`npm start`)
`./api` tetap dipakai lebih dulu. Backend gratis bisa "tidur"; status ditunggu sampai 60 detik dan siswa melihat
pesan "Server asisten sedang dibangunkan…". Backend mati/kuota habis → pesan ramah; menu lain tetap jalan.
**Mematikan AI online:** kosongkan `endpointOnline` lalu rilis ulang, atau hentikan layanan di hosting.

### Pilihan hosting (dicek 27 Nov 2026 — ketentuan bisa berubah, cek lagi saat mendaftar)
| Hosting | Catatan | Kesesuaian |
|---|---|---|
| **Vercel** (Hobby) | Tanpa kartu kredit (cek saat mendaftar); dukungan resmi Express "tanpa konfigurasi"; gratis untuk pemakaian pribadi/non-komersial | **Dipilih** (27 Nov 2026) |
| Render (Free web service) | Saat pemilik mendaftar (27 Nov 2026) **meminta kartu kredit** | Tidak dipakai |
| Deno Deploy | Tanpa kartu, tetapi server Node/Express perlu disesuaikan | Cadangan |
| Koyeb, Google Cloud Run | Meminta kartu kredit | Tidak dipakai |

### Langkah memasang di Vercel (dikerjakan pemilik; ±15 menit)
0. **GitHub → repo `2225250077_Hitana_Rifa_Pranaja` → Settings → General → Default branch → ganti ke `sumber`.**
   Vercel membaca branch bawaan; `main` hanya berisi `dist/` (tanpa folder `server`). GitHub Pages **tidak**
   terpengaruh karena tetap menayangkan branch `main`.
1. Daftar di vercel.com dengan tombol *Continue with GitHub*, paket **Hobby**. **Jangan** memasukkan kartu kredit.
2. *Add New → Project* → *Import* repo `2225250077_Hitana_Rifa_Pranaja` (izinkan Vercel mengakses repo itu bila diminta).
3. *Configure Project*: **Root Directory → `server`** (klik *Edit*) · Framework Preset **Express** (bila terdeteksi;
   bila tidak, *Other*) · Build/Output/Install Command **biarkan bawaan**.
4. *Environment Variables*: isi tabel di atas **kecuali `HOST`** (`TRUST_PROXY=1`, `SERVE_APP=false`, dst.).
   `GEMINI_API_KEY` diketik langsung di dasbor.
5. *Deploy* → buka `https://<nama-proyek>.vercel.app/api/status` → harus `{"ready":true}`.
6. (Disarankan) *Settings → Git*: pastikan **Production Branch = `sumber`**. Rilis ke branch `main` (dist) dapat
   memicu *preview deployment* yang gagal karena tidak ada folder `server` — aman diabaikan.
7. Kirim URL proyek (bukan API key) ke pengembang: `endpointOnline` diisi `https://<nama-proyek>.vercel.app/api`,
   diuji, lalu dirilis ulang ke GitHub Pages.

### Risiko khusus mode hosting
- **Kuota bersama:** semua pengguna situs memakai satu API key. CORS hanya membatasi browser — batas harian & per
  perangkat adalah pelindung utama. Pantau pemakaian di AI Studio.
- **Batas pemakaian di serverless:** Vercel bisa menjalankan beberapa salinan server dan memulainya ulang, sehingga
  batas per perangkat & harian (disimpan di memori) dihitung **per salinan** dan bisa sedikit terlampaui. Pasang
  `AI_DAILY_LIMIT` lebih rendah dan pantau kuota di AI Studio.
- **Privasi:** pertanyaan siswa melewati hosting (Vercel) dan Google. Server tidak mencatat isi pertanyaan. Cantumkan
  pemakaian AI online di surat izin/persetujuan penelitian.
- **Penelitian:** bila AI tidak menjadi bagian perlakuan, kosongkan `endpointOnline` selama pengambilan data.

Diuji 27 Nov 2026: `npm test` 33/33 (termasuk CORS, preflight, situs lain ditolak, hanya-API, trust proxy per siswa,
default export untuk Vercel); `tools/test.html` 57/57 (klien beralih ke backend online); uji lintas-situs dengan
Gemini asli (aplikasi :8000 → backend mode hosting :3001) berhasil. Pemasangan di Vercel **belum** dilakukan.
