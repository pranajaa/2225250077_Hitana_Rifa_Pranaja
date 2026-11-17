# 12 — Panduan Menjalankan RELAFUN di Laptop (Lokal)

Untuk pemilik proyek, guru, atau dosen yang ingin mencoba atau mendemonstrasikan RELAFUN di laptop sendiri.
Semua gratis: tanpa Cloudflare, tanpa hosting atau layanan berbayar.

## 1. Dua cara menjalankan

| Cara | Alamat | Fitur AI (Tutor AI, Pembahas Soal) | Kapan dipakai |
|---|---|---|---|
| **A. Dengan AI** — server Node.js | http://localhost:3000 | Aktif (butuh internet + API key) | Demo lengkap, praktik |
| **B. Tanpa AI** — server Python | http://localhost:8000 | Tampil "hanya tersedia di server lokal" | Uji unit, uji coba penelitian tanpa AI |

Menu lain (Beranda, Progres, dan fitur belajar lain) berjalan sama di kedua cara. Progres disimpan di browser,
jadi progres di alamat :3000 dan :8000 terpisah.

## 2. Persiapan (sekali saja)

> Di laptop pemilik, langkah 1–5 **sudah selesai** (17 Nov 2026). Ikuti bagian ini hanya untuk laptop lain.

1. **Node.js LTS** — unduh dari nodejs.org (atau `winget install OpenJS.NodeJS.LTS`).
   Pilih folder `D:\nodejs`; hilangkan centang *Tools for Native Modules* (memasang alat besar ke Drive C:).
   Setelah memasang, **tutup lalu buka ulang VS Code** agar perintah `node` dikenali.
2. **npm di Drive D:** (disarankan) — di terminal:
   ```
   npm.cmd config set cache "D:\npm-cache"
   npm.cmd config set prefix "D:\npm-global"
   ```
   Perintah ini menulis satu file kecil `C:\Users\<nama>\.npmrc`; npm hanya membaca pengaturan dari sana.
3. **Paket server** — di folder `server`: `npm.cmd install` (membuat `server\node_modules`, ±20 MB).
4. **API key Gemini** — buka https://aistudio.google.com/ → *Get API key* → buat key.
   **Jangan aktifkan billing.** Jangan tempel key di chat, dokumen, atau kode.
5. **File `server\.env`** — salin `server\.env.example` menjadi `server\.env`, lalu isi:
   - `GEMINI_API_KEY=` key dari langkah 4
   - `GEMINI_MODEL=gemini-3.5-flash-lite` dan `GEMINI_MODEL_FALLBACK=gemini-3.5-flash`
     (cek ulang dengan `npm.cmd run models` bila model berubah — lihat §5)

## 3. Menjalankan setiap hari

**Paling mudah:** buka folder `server` di File Explorer → klik dua kali **`mulai-relafun.cmd`**.
Jendela hitam terbuka, server menyala, dan browser otomatis membuka http://localhost:3000.

**Lewat VS Code:**
1. *File → Open Folder* → pilih folder `RelaFun - p3r try`.
2. *Terminal → New Terminal*, lalu ketik:
   ```
   cd server
   npm.cmd start
   ```
3. Terminal menampilkan `RELAFUN berjalan di http://127.0.0.1:3000` dan `AI aktif · model …`.
4. Buka http://localhost:3000 di Chrome/Edge → isi nama panggilan → pilih **Tutor AI** atau **Pembahas Soal**.

**Berhenti:** tekan `Ctrl+C` di terminal (atau tutup jendela hitam).

> Mengapa `npm.cmd`, bukan `npm`? Di Windows, terminal PowerShell sering menolak `npm` dengan pesan
> *"npm.ps1 cannot be loaded because running scripts is disabled"*. `npm.cmd` berjalan tanpa mengubah
> pengaturan keamanan Windows. (Alternatif: pilih terminal *Command Prompt* di VS Code, lalu `npm start` biasa.)

**Cara B (tanpa AI)** — dari folder `RelaFun - p3r try`:
```
analysis\.venv\Scripts\python -m http.server 8000
```
Buka http://localhost:8000. Uji unit aplikasi: http://localhost:8000/tools/test.html (harus "N/N lulus").

## 4. Demo di HP (Wi-Fi yang sama)
1. Di `server\.env` ubah `HOST=0.0.0.0`, lalu jalankan ulang server.
2. Bila Windows bertanya soal firewall untuk Node.js, izinkan untuk **jaringan pribadi** saja.
3. Cari IP laptop: `ipconfig` → *IPv4 Address* (mis. 192.168.1.5). Di HP buka `http://192.168.1.5:3000`.
4. Aplikasi dan AI berjalan, tetapi tombol "Pasang aplikasi"/offline tidak muncul (butuh HTTPS).
5. Selesai demo: kembalikan `HOST=127.0.0.1`.

## 5. Mengatur AI (`server\.env`)

| Isian | Fungsi |
|---|---|
| `GEMINI_API_KEY` | Kunci API. Kosong → fitur AI tampil "belum disiapkan", menu lain tetap jalan |
| `GEMINI_MODEL` / `GEMINI_MODEL_FALLBACK` | Model utama / cadangan (dicoba bila utama sibuk atau kuota habis) |
| `AI_DAILY_LIMIT` | Batas permintaan AI per hari untuk seluruh server. Isi sedikit di bawah kuota yang terlihat di AI Studio |
| `GEMINI_THINKING_BUDGET` | Opsional; kosongkan |
| `PORT`, `HOST` | Alamat server (bawaan 3000, hanya laptop ini) |
| `AI_SIMULATE` | Hanya untuk uji tampilan error: `quota`, `busy`, `upstream`, `badkey`, `blocked`, `server`, `nokey`. **Kosongkan saat dipakai siswa** |

- **Melihat model yang tersedia:** `npm.cmd run models` (di folder `server`). Model Free Tier bisa berubah;
  pilih yang namanya mengandung `flash`.
- **Mematikan AI** (mis. saat uji coba penelitian): kosongkan `GEMINI_API_KEY`, atau pakai Cara B.
- Setiap perubahan `.env` berlaku setelah server dijalankan ulang (`Ctrl+C`, lalu `npm.cmd start`).

## 6. Cek cepat sebelum kelas (±2 menit)
1. `npm.cmd test` di folder `server` → harus `pass 22`, `fail 0` (tanpa internet, tanpa kuota).
2. `npm.cmd start` → terminal menulis `AI aktif`.
3. Buka Tutor AI → klik satu contoh pertanyaan → jawaban muncul.
4. Buka Pembahas Soal → klik satu contoh soal → **Bahas soal** → muncul 5 langkah (Mode Pembahasan).

## 7. Masalah yang sering muncul

| Pesan / gejala | Penyebab | Solusi |
|---|---|---|
| `'node' is not recognized` / `node : The term … is not recognized` | VS Code dibuka sebelum Node terpasang | Tutup semua jendela VS Code, buka lagi |
| `npm.ps1 cannot be loaded … scripts is disabled` | Kebijakan PowerShell | Pakai `npm.cmd …` (lihat §3) |
| `Cannot find package 'express'` | Paket belum dipasang | `npm.cmd install` di folder `server` |
| `npm start` → *Could not read package.json* | Terminal di folder yang salah | `cd server` dulu |
| `Port 3000 sudah dipakai…` | Server sudah berjalan di jendela lain | Buka http://localhost:3000, atau tutup jendela lama |
| Layar AI: "Fitur AI hanya tersedia saat RELAFUN dijalankan dari server lokal" | Dibuka dari :8000 atau GitHub Pages | Pakai Cara A (:3000) |
| "Asisten AI belum disiapkan…" | `GEMINI_API_KEY` atau `GEMINI_MODEL` kosong | Isi `server\.env`, jalankan ulang |
| "Asisten AI belum bisa dipakai. Minta guru memeriksa API key…" | Key salah / dihapus | Buat key baru di AI Studio |
| "Kuota AI gratis sedang habis…" | Kuota harian Gemini atau `AI_DAILY_LIMIT` habis | Coba lagi besok; atau ganti model di `.env` |
| "Asisten sedang sibuk…" | Server Gemini ramai | Tunggu 1–2 menit, kirim lagi |
| "Server tidak tersambung ke internet…" | Internet laptop putus | Periksa Wi-Fi laptop |
| "Server RELAFUN tidak menjawab…" | Terminal server ditutup | Jalankan lagi `npm.cmd start` |
| "Kamu sudah banyak bertanya…" | > 20 pertanyaan / 10 menit dari satu perangkat | Tunggu 10 menit |
| Terminal: `model tidak ditemukan — periksa GEMINI_MODEL` | Nama model berubah | `npm.cmd run models`, perbarui `.env` |

## 8. Keamanan API key
- `server\.env` sudah masuk `.gitignore` — tidak ikut commit/unggah. Cek sebelum commit: `git status` tidak boleh
  menampilkan `.env`.
- Jangan membuka `.env` saat berbagi layar/presentasi.
- Bila key pernah terlihat orang lain: hapus key itu di AI Studio, buat key baru, ganti di `.env`.
- Versi online (GitHub Pages) **tidak** memuat folder `server/`, jadi key tidak pernah ikut terunggah ke sana.

Detail teknis fitur AI, batasan, dan hasil uji: [11-ASISTEN-AI](11-ASISTEN-AI.md).
