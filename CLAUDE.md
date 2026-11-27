# CLAUDE.md — Panduan untuk Asisten AI di Proyek RELAFUN

## Ringkasan Proyek
RELAFUN adalah aplikasi web (PWA) pembelajaran **Relasi dan Fungsi** untuk siswa SMP kelas VIII.
Masalah inti dari wawancara: siswa sulit **menentukan konsep yang tepat** (relasi / fungsi /
korespondensi satu-satu) terutama pada soal cerita yang tersirat. Model pembelajaran:
**Rigorous Mathematical Thinking (RMT)**; prinsip desain media: **Cognitive Load Theory** (IL/EL/GL)
(keputusan pemilik 17 Nov 2026, docs/02 §1). Tujuan: menumbuhkembangkan **literasi matematika**
dengan 4 indikator: Reasoning (LR), Formulating (LF), Employing (LE), Interpreting (LI).

Baca sebelum mengerjakan fitur:
- Kebutuhan & alasan: [docs/PRD.md](docs/PRD.md), [docs/01-ANALISIS-KEBUTUHAN.md](docs/01-ANALISIS-KEBUTUHAN.md)
- Aturan konsep matematika & pedagogi: [docs/02-DESAIN-PEMBELAJARAN.md](docs/02-DESAIN-PEMBELAJARAN.md)
- Skema konten/soal: [docs/03-KONTEN-DAN-BANK-SOAL.md](docs/03-KONTEN-DAN-BANK-SOAL.md)
- Struktur kode: [docs/04-ARSITEKTUR-TEKNIS.md](docs/04-ARSITEKTUR-TEKNIS.md)
- Tampilan: [docs/05-DESAIN-UI-UX.md](docs/05-DESAIN-UI-UX.md)
- Pengujian: [docs/06-RENCANA-PENGUJIAN.md](docs/06-RENCANA-PENGUJIAN.md)
- Urutan kerja: [docs/07-ROADMAP.md](docs/07-ROADMAP.md)
- Literasi matematika: [docs/08-LITERASI-MATEMATIKA.md](docs/08-LITERASI-MATEMATIKA.md)
- Analisis statistik Python: [docs/09-ANALISIS-DATA-PYTHON.md](docs/09-ANALISIS-DATA-PYTHON.md)
- Browser, pemasangan di HP, rilis: [docs/10-INSTALASI-DAN-RILIS.md](docs/10-INSTALASI-DAN-RILIS.md)
- Asisten AI (Google Gemini lewat server lokal Express): [docs/11-ASISTEN-AI.md](docs/11-ASISTEN-AI.md)
- Panduan menjalankan di laptop (pengguna/guru): [docs/12-MENJALANKAN-LOKAL.md](docs/12-MENJALANKAN-LOKAL.md)
- Rancangan konten dengan model RMT: [docs/13-RANCANGAN-KONTEN-RMT.md](docs/13-RANCANGAN-KONTEN-RMT.md)

## Folder Utama & Rilis
- **Folder ini (`RelaFun - p3r try`) adalah folder UTAMA proyek** (diputuskan pemilik, 17 Nov 2026).
  Folder `../RelaFun (dupe)` hanya duplikat lama — jangan dikerjakan, jangan disinkronkan.
- **Repo utama (keputusan pemilik, 27 Nov 2026):** `pranajaa/2225250077_Hitana_Rifa_Pranaja` (publik), dua branch:
  - `main` = **HANYA hasil `dist/`** + `.nojekyll` + `README.md`, ditayangkan GitHub Pages
    ("Deploy from branch: main / root") di https://pranajaa.github.io/2225250077_Hitana_Rifa_Pranaja/.
    Jangan pernah push kode sumber ke `main` — `server/`, `docs/`, `tools/` akan ikut tayang.
  - `sumber` = **kode sumber** (isi folder ini di akar branch).
- Repo git lokal ada di folder induk `alpro`. Remote `pages` = repo utama; `relafun` = repo lama `pranajaa/RelaFun`
  (tidak diperbarui lagi, dibiarkan apa adanya); `origin` = repo `alpro` yang tidak ada (jangan dipakai).
  `alpro/.gitignore` memakai daftar-putih: hanya folder ini dan `task 1.py` yang bisa dilacak — dokumen siswa,
  tugas, dan 13 repo `pertemuan-*` diabaikan. Jangan mengubahnya tanpa izin pemilik.
- **Kirim kode sumber** (commit seperti biasa di `alpro`, lalu dari folder `alpro`):
  `git subtree push --prefix="RelaFun - p3r try" pages sumber`
- **Rilis ke Pages:** `tools/siapkan_rilis.py` → klon branch `main` repo utama → ganti isinya dengan `dist/`
  (pertahankan `.nojekyll` dan `README.md`) → commit → push ke `main`. GitHub CLI tidak terpasang; git login lewat
  Git Credential Manager. Versi GitHub Pages **tanpa backend**: Tutor AI & Pembahas Soal tampil "hanya tersedia di
  server lokal".
- **Penyimpanan di Drive D:** project, `server/node_modules`, npm cache (`D:\npm-cache`), dan npm global prefix
  (`D:\npm-global`) ada di D:. Jangan membuat salinan project di C:. Jika suatu langkah harus memakai C:,
  jelaskan alasannya dulu. Minta izin sebelum memindahkan, menghapus, atau mengubah konfigurasi sistem.
- Gaya tampilan "bawah laut" (palet biru terang, panel miring, maskot orisinal per menu, animasi tenggelam,
  perosotan, gerombolan ikan) adalah keputusan pemilik. Ini **pengecualian yang disetujui** terhadap aturan 5
  (tanpa animasi dekoratif); semua animasi wajib mati saat `prefers-reduced-motion`. Maskot & latar dibuat oleh
  `tools/buat_maskot.py` (SVG) — tokoh orisinal, jangan diganti dengan karakter dari game/anime mana pun.

## Teknologi — Aturan Dua Bahasa
| Data / tugas | Bahasa | Lokasi |
|---|---|---|
| **Data umum**: seluruh aplikasi, materi, soal, penilaian jawaban, skor misi literasi, progres, persentase & grafik di aplikasi, ekspor CSV, validasi bank soal | **JavaScript** | `index.html`, `js/`, `data/`, `tools/` |
| **Data statistik**: pre/post-test, N-gain, uji normalitas, uji t/Wilcoxon, validitas/reliabilitas butir, kesukaran, daya beda, SUS, angket beban kognitif, skor literasi per indikator untuk penelitian | **Python** | `analysis/` |

| **Alat pengembang** (bukan bagian aplikasi): membuat ikon, menyiapkan folder rilis `dist/` | **Python** | `tools/*.py` |
| **Server lokal asisten AI** (Node.js + Express; menyajikan aplikasi + API Gemini, menyimpan API key di `.env`, membatasi pemakaian) | **JavaScript (Node.js)** | `server/` (tidak ikut `dist/`) |

- Jangan menulis perhitungan statistik inferensial di JavaScript; jangan menulis logika aplikasi di Python.
- **PWA:** aplikasi dibuka di browser dan dipasang tanpa Play Store/App Store (docs/10). Setiap file baru di
  `js/`, `css/`, `data/`, `assets/` otomatis masuk cache rilis lewat `tools/siapkan_rilis.py`; jika file itu
  dibutuhkan saat pengembangan offline, tambahkan juga ke daftar `PRECACHE` di `sw.js`.
  Jangan mengubah penanda `// __PRECACHE_START__`/`END` dan baris `const VERSION = 'dev';`.
- Aplikasi: HTML + CSS + **vanilla JavaScript (ES Modules)**. Tanpa framework, tanpa build step, tanpa dependensi npm di runtime.
  npm **hanya** dipakai di `server/` (Express + `@google/genai`); jangan menambah paket npm ke aplikasi browser.
- PWA: `manifest.webmanifest` + `sw.js`. Data di `localStorage` lewat `js/storage.js` saja.
- Diagram digambar sebagai **SVG** dari data oleh `js/diagram.js`.
- Python ≥ 3.11 dengan pandas, numpy, scipy, matplotlib, openpyxl, pytest. Python **tidak** dijalankan di browser
  (tidak memakai Pyodide); `analysis/` tidak ikut di-deploy dan tidak di-cache service worker.
- Penghubung kedua bahasa = **file CSV ekspor**. Format kolom di docs/09 §2 adalah kontrak:
  jika `js/export.js` diubah, `analysis/relafun_stats/load.py` dan tesnya ikut diubah.

## Perintah
Node.js LTS dipakai **hanya** untuk server lokal di `server/`. Alat uji aplikasi tetap berjalan di browser.
- **Aplikasi + AI** (dari folder `server/`): `npm install` (sekali) → `npm start` → buka http://localhost:3000.
  Di PowerShell VS Code pakai `npm.cmd` (kebijakan skrip Windows menolak `npm.ps1`). Peluncur: `server/mulai-relafun.cmd`.
  Isi `server/.env` dari `server/.env.example`. `npm run models` = daftar model Gemini untuk key itu.
  `npm test` = uji server dengan Gemini tiruan (tanpa kuota, tanpa internet).
- Aplikasi tanpa AI (dari root proyek): `python -m http.server 8000` → buka http://localhost:8000
  (server statis saja; fitur AI tampil "belum tersedia"). Jangan buka via `file://`.
- Uji unit JavaScript: buka http://localhost:8000/tools/test.html (harus "N/N lulus").
  Tanpa membuka browser manual:
  `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom http://localhost:8000/tools/test.html`
- Data progres contoh untuk demo: http://localhost:8000/tools/seed-demo.html
- Cek PWA (manifest, ikon, service worker, cache): http://localhost:8000/tools/pwa-check.html
  (Edge headless `--dump-dom` membekukan service worker; untuk uji otomatis pakai DevTools Protocol.)
- Ikon: `analysis\.venv\Scripts\python tools/buat_ikon.py` · Rilis: `analysis\.venv\Scripts\python tools/siapkan_rilis.py` → `dist/`
- Validasi konten: http://localhost:8000/tools/validate.html (harus "0 galat"); memakai `js/math.js`.
  Jalankan setiap kali `data/` berubah. Logika di `tools/validate.js` (juga diuji di `tools/tests.js`).
- Tidak ada langkah build. Deploy = unggah folder ke GitHub Pages (tanpa `analysis/` dan `tools/`).
- Python (dari folder `analysis/`, venv sudah dibuat): `.venv\Scripts\python -m pytest`
  dan `.venv\Scripts\python scripts/06_laporan.py`. Detail di `analysis/README.md`.
- Catatan uji tampilan: Edge headless punya lebar jendela minimum ±500 px; untuk mengecek lebar 360 px,
  muat aplikasi di dalam `<iframe style="width:360px">`.

## Aturan Wajib
1. **Kebenaran matematika nomor satu.** Gunakan definisi di `docs/02-DESAIN-PEMBELAJARAN.md §5` persis.
   Khususnya: pada fungsi, dua anggota domain BOLEH berpasangan dengan anggota kodomain yang sama,
   dan anggota kodomain BOLEH tidak berpasangan. Banyak pemetaan A→B = n(B)^n(A).
   Banyak korespondensi satu-satu = n!. Jangan mengarang definisi lain.
2. **Konten terpisah dari kode.** Teks materi/soal hanya di `data/*.json`, bukan di file `js/views/*`.
3. **Setiap soal** wajib: kunci, ≥ 2 hint bertahap, pembahasan, dan tag miskonsepsi (M01–M10) untuk
   setiap pengecoh. Jalankan `tools/validate.html` setelah mengubah data soal.
4. **Kunci soal berbasis diagram** harus konsisten dengan `js/math.js`; jangan menulis kunci manual yang bertentangan.
5. **Beban kognitif rendah (EL):** jangan menambah animasi, gambar dekoratif, suara, atau elemen
   yang tidak menjelaskan konsep. Satu tugas per layar. Label ditaruh langsung di diagram.
6. **Bahasa:** semua teks UI & konten dalam Bahasa Indonesia yang sederhana (kalimat ≤ 25 kata),
   istilah baku konsisten: domain, kodomain, daerah hasil, korespondensi satu-satu.
   Nama variabel/fungsi kode boleh Bahasa Inggris.
7. **Umpan balik** menjelaskan *mengapa*, nada suportif, tidak memakai kata "Salah!" atau "Gagal".
8. **Mobile-first**: uji di lebar 360 px; target sentuh ≥ 44 px; tidak ada scroll horizontal.
9. **Warna bermakna:** domain = biru (`--c-domain`), kodomain = oranye (`--c-codomain`);
   benar/salah selalu disertai ikon + teks.
10. **Path relatif** (`./js/...`) agar berjalan di subfolder GitHub Pages. Naikkan versi cache di `sw.js` saat rilis.
11. **Privasi:** jangan menambah analytics, akun server, atau pengiriman data ke server pada MVP.
    **Satu-satunya pengecualian:** asisten AI (F14, docs/11) — Google Gemini (Free Tier) lewat server lokal
    `server/` (Node.js + Express, localhost). Hanya teks pertanyaan/soal & konteks soal, **tanpa** nama/kode
    siswa/progres; riwayat tidak disimpan. Pada Free Tier, Google dapat memakai isi prompt untuk mengembangkan
    layanannya — catatan privasi di layar wajib tetap ada.
    - **API key** hanya di `server/.env` (masuk `.gitignore`); tidak boleh ada di frontend, kode, atau repo.
    - **Dilarang:** Cloudflare (Workers/Pages/Tunnel), DeepSeek, layanan AI/hosting berbayar.
    - AI tidak menilai soal bank (kunci dari data soal/`math.js`). `DEFINITIONS` di `server/rules.js` harus sama
      dengan docs/02 §5 (diuji `server/test`). Jangan menambah definisi baru (mis. fungsi injektif/banyak-ke-satu);
      AI wajib mengatakan istilah itu di luar materi dan tidak menyamakannya dengan korespondensi satu-satu.
    - **Tutor AI** (`#/asisten`): ≤ ±5 kalimat. Mode lama `salah`/`bedah` (≤ 3 kalimat) dipertahankan untuk Fase 4.
    - **Pembahas Soal** (`#/pembahas`): Mode Petunjuk **tanpa** konsep/jawaban akhir (server membuangnya);
      Mode Pembahasan boleh memberi jawaban akhir + peringatan "Jawaban AI bisa keliru"; AI tidak boleh
      mengklaim jawabannya pasti benar.
    - AI gagal/tidak tersedia tidak boleh merusak fitur lain.
    "Masuk" hanya nama panggilan lokal (`js/profile.js`, `js/views/masuk.js`); nama tidak boleh ikut ekspor CSV.
    Rute baru otomatis terkunci oleh `authGuard` di `js/app.js` sampai nama diisi.
12. **Keamanan DOM:** jangan memasukkan string data ke `innerHTML` tanpa escape; pakai `textContent`/helper `h()`.
13. **Literasi matematika:** setiap misi (`LM-xxx`) memiliki `indicator` (LR/LF/LE/LI), tahap dengan skor,
    jumlah skor tahap = `maxScore` (6), dan skor parsial. Ikuti kisi-kisi di docs/08; jangan mengubah
    soal LM-001–LM-004 (milik penyusun) tanpa izin — termasuk tidak meringkas teks soalnya (ringkasan hanya di
    `stemSimple`). Misi hanya **menilai** relasi, fungsi, domain, kodomain, range. Alasan tertulis = teks bebas
    dinilai guru (`penilaian: "guru"` + `rubrikGuru`); daftar alasan hanya bantuan.
14. **Status verifikasi konten:** setiap unit/soal berlabel `sumber` = `docs02` | `kisi-kisi` | `perlu-verifikasi`;
    `bukuDicek: false` sampai dicocokkan dengan buku siswa/LKS. Istilah di luar docs/02 §5 tidak boleh diberi
    definisi karangan (`definisi: null`). Setiap aktivitas mengikuti alur RMT (docs/02 §4, docs/13).
15. **Kontrak CSV ekspor** (docs/09 §2): 13 kolom lama + `hint_count`, `jawaban_teks` di akhir; `hint` = 0/1 dan
    konsisten dengan `hint_count`; CSV lama tanpa kolom baru harus tetap terbaca.
16. **Statistik di Python:** rumus ditulis sebagai fungsi murni di `analysis/relafun_stats/` dengan docstring
    rumus, diuji di `analysis/tests/` dengan data yang hasilnya diketahui. Data mentah (`analysis/data/raw`,
    `processed`) masuk `.gitignore` dan hanya memakai kode siswa anonim (S01, S02, …).

## Konvensi
- File `kebab-case.js`; fungsi `camelCase`; konstanta `UPPER_SNAKE_CASE`.
- Setiap view mengekspor `render(container, params)` dan opsional `destroy()`.
- ID konten: `MT-`, `KK-`, `BS-`, `LT-`, `PT-`, `LM-` + 3 digit; unit `U0`–`U7`; miskonsepsi `M01`–`M10`.
- CSS memakai variabel dari `css/tokens.css`; media query `min-width` (mobile-first).
- Kunci localStorage: `relafun:v1`. Ubah skema → tambah migrasi dan naikkan `version`.

## Cara Kerja yang Diharapkan
- Kerjakan sesuai urutan fase di `docs/07-ROADMAP.md`; centang tugas yang selesai.
- Sebelum menambah fitur baru, cek apakah fitur itu ada di PRD. Jika tidak, tanyakan dulu.
- Saat membuat/merevisi soal, sertakan alasan pedagogis singkat jika menyimpang dari skema.
- Setelah perubahan UI, periksa di viewport 360 px dan desktop; laporkan bila belum diuji.
