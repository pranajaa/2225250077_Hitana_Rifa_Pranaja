# RELAFUN — Relasi dan Fungsi

Aplikasi pembelajaran interaktif berbasis web (PWA) untuk siswa SMP kelas VIII yang membantu
**mengenali konsep** relasi, fungsi, dan korespondensi satu-satu sebelum menyelesaikan soal.
Dapat dibuka di browser laptop maupun dipasang di smartphone Android.

> Status: **Fase 1 (fondasi) selesai**, **PWA siap** (bisa dibuka di browser, dipasang tanpa Play Store/App Store,
> dan berjalan offline), **analisis Python siap**. Fitur belajar (materi, soal) dibangun mulai Fase 2.

**Memasang di HP:** buka alamat RELAFUN → Android: ketuk "Pasang aplikasi"; iPhone (Safari): Bagikan →
"Tambahkan ke Layar Utama". Panduan lengkap & cara rilis: [docs/10-INSTALASI-DAN-RILIS.md](docs/10-INSTALASI-DAN-RILIS.md).

## Fitur Utama
1. **Materi Interaktif** — unit kecil dengan diagram panah, pasangan berurutan, dan diagram Cartesius.
2. **Kenali Konsep** — menentukan konsep dari soal + memilih alasan.
3. **Bedah Soal** — memecah soal cerita: Diketahui → Karakteristik → Konsep → Penyelesaian.
4. **Latihan Bertingkat** — Mudah, Sedang, Sulit dengan hint bertahap dan pembahasan.
5. **Evaluasi & Progres** — akurasi per konsep, skor literasi per indikator, dan rekomendasi materi.
6. **Misi Literasi** — soal kontekstual bertahap untuk menumbuhkan literasi matematika
   (Bernalar, Memodelkan, Menghitung, Menafsirkan) dengan skor per tahapan.
7. **Tutor AI & AI Pembahas Soal** — tanya-jawab dan penguraian soal dengan Google Gemini (Free Tier) lewat
   server lokal. Hanya berjalan saat dijalankan dengan `npm start`; versi online tetap jalan tanpa AI.
   Detail: [docs/11-ASISTEN-AI.md](docs/11-ASISTEN-AI.md).

## Teknologi
| Bagian | Bahasa | Kegunaan |
|---|---|---|
| Aplikasi (web + Android/PWA) | JavaScript, HTML, CSS | Semua data umum: materi, soal, penilaian, progres, ekspor CSV |
| Server lokal AI (`server/`) | JavaScript (Node.js + Express) | Menyajikan aplikasi + API Gemini; API key di `server/.env` (tidak di-commit) |
| Analisis data (`analysis/`) | Python | Data statistik: pre/post-test, N-gain, uji t/Wilcoxon, validitas & reliabilitas, SUS, angket beban kognitif, literasi per indikator |

## Dokumen Perencanaan
| Dokumen | Isi |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Kebutuhan produk, fitur, prioritas, metrik |
| [docs/01-ANALISIS-KEBUTUHAN.md](docs/01-ANALISIS-KEBUTUHAN.md) | Temuan wawancara → kebutuhan, miskonsepsi, persona |
| [docs/02-DESAIN-PEMBELAJARAN.md](docs/02-DESAIN-PEMBELAJARAN.md) | Tujuan pembelajaran, prinsip beban kognitif, aturan konsep |
| [docs/03-KONTEN-DAN-BANK-SOAL.md](docs/03-KONTEN-DAN-BANK-SOAL.md) | Unit materi, tipe soal, skema JSON, kuota soal |
| [docs/04-ARSITEKTUR-TEKNIS.md](docs/04-ARSITEKTUR-TEKNIS.md) | Teknologi, struktur folder, data, PWA |
| [docs/05-DESAIN-UI-UX.md](docs/05-DESAIN-UI-UX.md) | Prinsip tampilan, warna, wireframe, komponen |
| [docs/06-RENCANA-PENGUJIAN.md](docs/06-RENCANA-PENGUJIAN.md) | Uji fungsional, validasi ahli, uji coba siswa |
| [docs/07-ROADMAP.md](docs/07-ROADMAP.md) | Fase pengerjaan dan milestone |
| [docs/08-LITERASI-MATEMATIKA.md](docs/08-LITERASI-MATEMATIKA.md) | 4 indikator literasi, Misi Literasi, penskoran per tahapan |
| [docs/09-ANALISIS-DATA-PYTHON.md](docs/09-ANALISIS-DATA-PYTHON.md) | Pembagian JavaScript/Python, format ekspor, analisis statistik |
| [docs/10-INSTALASI-DAN-RILIS.md](docs/10-INSTALASI-DAN-RILIS.md) | Membuka di browser, memasang di HP tanpa Play Store, merilis ke hosting |
| [docs/11-ASISTEN-AI.md](docs/11-ASISTEN-AI.md) | Tutor AI & Pembahas Soal: Gemini lewat server lokal, keamanan, uji |
| [docs/12-MENJALANKAN-LOKAL.md](docs/12-MENJALANKAN-LOKAL.md) | **Panduan menjalankan di laptop**: persiapan, demo, masalah umum |
| [CLAUDE.md](CLAUDE.md) | Aturan untuk asisten AI saat membangun aplikasi |

## Menjalankan
Panduan langkah demi langkah: [docs/12-MENJALANKAN-LOKAL.md](docs/12-MENJALANKAN-LOKAL.md).
Cara tercepat: klik dua kali `server\mulai-relafun.cmd` → browser membuka http://localhost:3000.
```bash
# Aplikasi + Tutor AI & Pembahas Soal (Node.js LTS) — dari folder server/
#   sekali: salin .env.example → .env, isi GEMINI_API_KEY; npm.cmd install; npm.cmd run models → isi GEMINI_MODEL
npm.cmd start
# buka http://localhost:3000      ·  uji server: npm.cmd test

# Aplikasi saja, tanpa AI (JavaScript) — dari folder RelaFun
python -m http.server 8000
# buka http://localhost:8000
# uji unit JS:     http://localhost:8000/tools/test.html
# data demo:       http://localhost:8000/tools/seed-demo.html

# Analisis statistik (Python) — lihat analysis/README.md
cd analysis
.venv\Scripts\activate
python -m pytest
python scripts/06_laporan.py
```

## Penyusun
Hitana Rifa Pranaja — S1 Pendidikan Matematika, kelas 3A.
