# 07 — Roadmap dan Daftar Tugas

Estimasi untuk 1 pengembang paruh waktu. Sesuaikan dengan jadwal kuliah.

## Fase 0 — Perencanaan (selesai dengan dokumen ini)
- [x] Wawancara & analisis kebutuhan
- [x] PRD, desain pembelajaran, konten, arsitektur, UI/UX, pengujian
- [ ] Konsultasi dokumen dengan dosen pembimbing/pengampu

## Fase 1 — Fondasi (Minggu 1) — selesai 13 Nov 2026
- [x] Struktur folder sesuai [04-ARSITEKTUR-TEKNIS](04-ARSITEKTUR-TEKNIS.md)
- [x] `index.html`, `tokens.css`, `base.css`, `components.css`, navigasi bawah (HP) / kiri (desktop), mode gelap
- [x] `router.js` (hash) + Beranda & Progres berfungsi; halaman lain sementara ("sedang dibangun")
- [x] `storage.js` + `progress.js` (skema `relafun:v1`, penguasaan konsep, skor literasi per indikator)
- [x] `math.js` + uji unit di `tools/test.html` (21 uji lulus, termasuk soal LM-001, LM-003, LM-004)
- [x] `data/concepts.json`, `data/misconceptions.json` (M01–M10)
- [x] Layar **Masuk** dengan nama panggilan (F13) + Ubah nama & Keluar di Progres — 13 Nov 2026

## Fase 2 — Komponen Visual (Minggu 2)
- [ ] `diagram.js`: ArrowDiagram (statis → interaktif → mode sorot)
- [ ] CartesianDiagram + garis vertikal yang bisa digeser
- [ ] PairsView + RepresentationToggle
- [ ] Komponen kuis: ChoiceList, HintButton, FeedbackSheet, ProgressBar

## Fase 3 — Konten & Materi (Minggu 3–4)
- [x] `misconceptions.json` (M01–M10)
- [x] `glossary.json` — 17 Nov 2026 (terverifikasi docs/02 · perlu verifikasi · tidak dipakai)
- [x] Materi U0–U7 → `data/materi/U0–U7.json` (6 layar RMT + 24 soal cek; dipecah per unit, bukan `units.json`) — 17 Nov 2026
- [x] View Materi + cek pemahaman (`js/views/materi.js`, 6 layar RMT, status unit tersimpan) — 17 Nov 2026
- [x] `tools/validate.html` + `validate.js` (validasi seluruh konten dengan math.js; 0 galat) — 17 Nov 2026
- [ ] Cocokkan konten dengan buku siswa/LKS; ubah label `perlu-verifikasi` (U0, U2, U5, 11 soal Latihan)

## Fase 4 — Fitur Inti (Minggu 4–5)
- [x] `quiz-engine.js` (penilaian, alasan, deteksi miskonsepsi) + `quiz-ui.js` (ChoiceList, HintButton mencatat
      `hintsUsed`, FeedbackSheet, input himpunan/pasangan/alasan) — 17 Nov 2026
- [x] `diagram.js`: diagram panah, Cartesius + garis vertikal yang bisa digeser, pasangan, tabel, tab representasi — 17 Nov 2026
- [x] Kenali Konsep + 30 soal (konsep & alasan dinilai terpisah, tombol Ciri-ciri) — 17 Nov 2026
- [x] Bedah Soal (HighlightText, StepProgress, fading per level, alasan teks bebas) + 10 soal — 17 Nov 2026
- [x] Latihan Bertingkat + 45 soal — 17 Nov 2026 *(worked example terpisah belum ada; pembahasan tampil setelah menjawab)*
- [ ] Penilaian guru untuk alasan tertulis (tampilan guru + cara mencatat di CSV) — menunggu keputusan pemilik

## Fase 4b — Literasi Matematika (Minggu 5–6) — JavaScript
- [x] `literacy-scorer.js` (skor per tahap, skor parsial, tahap dinilai guru → "menunggu guru") — 17 Nov 2026
- [x] Komponen tahap: `pairs`, `set-pair`, `set-triple`, `tf-multi`, `reason` (teks bebas), `diagram-choice`, tabel data — 17 Nov 2026
- [x] View Misi Literasi + rubrik akhir + contoh jawaban ideal — 17 Nov 2026
- [ ] Tiga tingkat bantuan (Dipandu penuh → Petunjuk saja → Mandiri) di Misi Literasi — belum (saat ini: petunjuk bertahap)
- [x] `misi-literasi.json`: LM-001–LM-004 dari Tabel Kisi-kisi (teks asli) + 8 misi baru (total 12) — 17 Nov 2026
- [x] Langkah "Kesimpulan" ada di setiap soal `data/bedah-soal.json` (tampilan menyusul) — 17 Nov 2026
- [x] Kontrak CSV: `hint` (0/1), `hint_count`, `jawaban_teks` di akhir; CSV lama tetap terbaca (docs/09 §2) — 17 Nov 2026

## Fase 4c — Asisten AI Google Gemini lewat server lokal (F14) — lihat [11-ASISTEN-AI](11-ASISTEN-AI.md)
Riwayat (rancangan DeepSeek + Cloudflare — **dibatalkan 17 Nov 2026**, keputusan pemilik):
- [x] ~~Analisis kelayakan server perantara (Cloudflare Worker)~~ — 17 Nov 2026
- [x] ~~`server/ai-proxy.js` (Worker DeepSeek)~~ → isinya dipindah ke `server/rules.js` + `server/gemini.js`
- [x] `js/ai.js` + view Tanya Asisten (`#/asisten`) + `data/ai.json`; uji unit 35/35 lulus

Gemini + Express lokal (tanpa Cloudflare, tanpa layanan berbayar):
- [x] Audit & rancangan final; PRD F14, CLAUDE.md aturan 11, docs/04, 05, 10, 11, README — 17 Nov 2026
- [x] `server/` Express: `/api/status`, `/api/tutor`, `/api/analyze`; key di `.env` (di `.gitignore`);
      batas 20/10 menit/perangkat + batas harian; pemetaan error kuota/jaringan/key — 17 Nov 2026
- [x] **Tutor AI** (`#/asisten`, ±5 kalimat) & **AI Pembahas Soal** (`#/pembahas`, Mode Petunjuk/Pembahasan)
- [x] Uji browser `tools/test.html` 42/42; tampilan 360 px & desktop dengan API tiruan (sukses, kuota, internet putus)
- [x] Node.js 26.13.1 LTS di `D:\nodejs`; npm cache `D:\npm-cache`, prefix `D:\npm-global`; `npm install`;
      `npm test` 22/22 lulus; server tanpa key: aplikasi tersaji, AI "belum disiapkan" — 17 Nov 2026
- [x] API key AI Studio; `npm run models`; `GEMINI_MODEL=gemini-3.5-flash-lite`, cadangan `gemini-3.5-flash`
- [x] Uji isi jawaban dengan key asli (docs/11 §8): Tutor 9A, Pembahas 6 jenis soal, M01/M02/M08, di luar topik,
      key salah; instruksi disempurnakan — 17 Nov 2026
- [x] Panduan menjalankan lokal [12-MENJALANKAN-LOKAL](12-MENJALANKAN-LOKAL.md) + peluncur `server/mulai-relafun.cmd`;
      perbaikan pesan "port sudah dipakai" — 17 Nov 2026
- [x] Mode hosting backend (CORS `ALLOWED_ORIGINS`, `TRUST_PROXY`, `SERVE_APP=false`, batas harian wajib) +
      klien `endpointOnline` dengan pesan "server dibangunkan"; uji lintas-situs dengan Gemini asli — 27 Nov 2026
- [ ] Pasang backend di Render (pemilik membuat akun & mengisi API key) → isi `endpointOnline` → rilis ulang → uji di HP
- [ ] Isi `AI_DAILY_LIMIT` sesuai kuota yang terlihat di AI Studio
- [ ] Uji isi jawaban miskonsepsi lainnya (M03–M07, M09, M10) & uji di HP lewat `HOST=0.0.0.0`
- [x] Hapus `server/ai-proxy.js` lama (dihapus pemilik) — 17 Nov 2026
- [x] Uji ujung-ke-ujung di browser dengan Gemini asli (360 px) + `tools/test.html` 42/42 — 17 Nov 2026
- [ ] Konsultasi dosen: AI sebagai variabel penelitian; cantumkan di surat izin/persetujuan orang tua
- [ ] Tombol "Jelaskan lagi" (mode `salah`) di FeedbackSheet — setelah `quiz-engine.js`
- [ ] Tombol "Minta petunjuk AI" (mode `bedah`) di setiap tahap Bedah Soal — setelah view Bedah Soal

## Fase 5 — Progres & PWA (Minggu 6)
- [ ] Halaman Progres + rekomendasi + skor per indikator literasi
- [ ] Ringkasan sesi
- [x] `manifest.webmanifest`, ikon (dibuat Python), `sw.js`, `js/pwa.js` (tombol pasang, petunjuk iPhone,
      notifikasi versi baru, banner offline) — dikerjakan lebih awal, 13 Nov 2026
- [x] `tools/siapkan_rilis.py` → `dist/` (172 KB); uji offline & emulasi HP 360 px lulus
- [ ] Rilis ke hosting HTTPS (Netlify Drop / GitHub Pages) — lihat docs/10
- [ ] Uji pasang & offline di HP Android dan iPhone asli

## Fase 5b — Analisis Data Statistik — Python (dikerjakan lebih awal, 13 Nov 2026)
- [x] Python 3.15 terpasang; `analysis/.venv` dibuat
- [x] `relafun_stats/`: load, item_analysis, effectiveness, literacy, questionnaire, misconception, plots, report
- [x] `tests/test_stats.py` (18 uji lulus) dengan data yang hasilnya dihitung manual
- [x] Skrip 00–06 → `output/laporan.md` + tabel + grafik (diuji dengan data contoh sintetis)
- [ ] `js/export.js` (JavaScript) menghasilkan CSV sesuai format; diuji dibaca `load.py`
- [ ] Cocokkan hasil uji t/Wilcoxon dengan SPSS/JASP pada satu set data

## Fase 6 — Validasi & Revisi (Minggu 7–9)
- [ ] Validasi ahli materi & media → revisi
- [ ] Uji perorangan (think-aloud) → revisi
- [ ] Uji kelompok kecil (SUS, angket beban kognitif) → revisi
- [ ] (P1) Pre/post-test (konsep + 4 butir literasi) + ekspor CSV
- [ ] Analisis hasil uji coba dengan skrip Python → bahan laporan

## Setelah MVP (P1–P2)
- [ ] Ekspor/impor progres
- [ ] Glosarium & pengaturan ukuran huruf
- [ ] `arrow-build` (siswa membuat diagram sendiri)
- [ ] APK via Capacitor
- [ ] Lencana & streak ringan

## Milestone

| Milestone | Isi | Bukti selesai |
|---|---|---|
| M1 | Kerangka jalan | Navigasi 6 halaman berfungsi di HP |
| M2 | Diagram siap | 3 representasi relasi tampil dari data JSON |
| M3 | MVP fitur | F1–F5 & F11 (Misi Literasi) jalan dengan konten minimal |
| M3b | Analisis siap | Skrip Python menghasilkan laporan dari CSV contoh; `pytest` lolos |
| M4 | Rilis MVP | PWA online, lolos checklist pengujian |
| M5 | Produk tervalidasi | Hasil validasi & uji coba terdokumentasi |
