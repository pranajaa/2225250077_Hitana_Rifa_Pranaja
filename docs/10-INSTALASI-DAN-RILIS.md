# 10 — Membuka di Browser, Memasang di HP, dan Merilis

RELAFUN adalah **PWA (Progressive Web App)**: satu kode yang
- dibuka di **browser** (laptop/HP) seperti website biasa, dan
- dapat **dipasang** ke layar utama HP **tanpa Play Store / App Store**, lalu berjalan
  seperti aplikasi (layar penuh, ikon sendiri, bisa dipakai **tanpa internet**).

| Bagian | Bahasa | File |
|---|---|---|
| Aplikasi, pemasangan, offline | JavaScript | `index.html`, `manifest.webmanifest`, `sw.js`, `js/pwa.js` |
| Alat pengembang (ikon, folder rilis) | Python | `tools/buat_ikon.py`, `tools/siapkan_rilis.py` |
| Analisis data statistik | Python | `analysis/` |

## 1. Cara Kerja Singkat

```
Siswa membuka https://…/relafun  (browser HP)
        │
        ├─ manifest.webmanifest → nama, ikon, warna, mode layar penuh  → browser menawarkan "Pasang"
        └─ sw.js (service worker) → menyimpan semua file aplikasi di HP → bisa dibuka tanpa internet
```

Syarat agar bisa dipasang: dibuka lewat **HTTPS** (atau `localhost` saat pengembangan).
Membuka lewat alamat IP Wi-Fi seperti `http://192.168.1.5:8000` di HP **tidak** bisa dipasang
karena bukan HTTPS — gunakan hosting (bagian 4).

## 2. Memasang di HP (petunjuk untuk siswa)

**Android (Chrome / Edge / Samsung Internet)**
1. Buka alamat RELAFUN di browser.
2. Ketuk tombol **"⬇ Pasang aplikasi"** di Beranda, atau menu **⋮ → "Instal aplikasi" / "Tambahkan ke layar utama"**.
3. Ikon RELAFUN muncul di layar utama. Buka sekali saat online; setelah itu bisa dipakai offline.

**iPhone / iPad (wajib Safari)**
1. Buka alamat RELAFUN di **Safari**.
2. Ketuk tombol **Bagikan ⬆** → **"Tambahkan ke Layar Utama"** → **Tambah**.

Aplikasi menampilkan petunjuk yang sesuai perangkat secara otomatis di Beranda.

## 3. Pengembangan di Laptop

```bash
cd RelaFun
python -m http.server 8000
# buka http://localhost:8000          → aplikasi (bisa juga "dipasang" di Chrome/Edge laptop)
# buka http://localhost:8000/tools/pwa-check.html → cek manifest, ikon, service worker, cache
```

Saat pengembangan `sw.js` memakai versi `dev` (ambil dari jaringan dulu), jadi perubahan kode
langsung terlihat setelah *refresh*.

Membuat ulang ikon (jika desain diubah):
```bash
analysis\.venv\Scripts\python tools/buat_ikon.py
```

## 4. Merilis (agar bisa dibuka & dipasang siswa)

### Langkah 1 — Siapkan folder rilis
```bash
analysis\.venv\Scripts\python tools/siapkan_rilis.py
```
Hasilnya folder `dist/` (±170 KB) yang hanya berisi file aplikasi. `sw.js` di dalamnya otomatis
diberi nomor versi dan daftar semua file, sehingga:
- aplikasi berfungsi **penuh tanpa internet**, dan
- saat ada rilis baru, siswa melihat notifikasi **"Versi baru tersedia → Muat ulang"**.

> Jalankan langkah ini **setiap kali** akan merilis perubahan.

### Langkah 2 — Unggah ke hosting gratis (pilih salah satu)

| Pilihan | Cara | Kelebihan |
|---|---|---|
| **Netlify Drop** (paling mudah) | Buka app.netlify.com/drop → seret folder `dist` | Tanpa git, langsung dapat alamat HTTPS |
| **GitHub Pages** | Buat repositori baru → unggah **isi** folder `dist` → Settings → Pages → *Deploy from branch* | Alamat tetap, riwayat versi |
| **Vercel** | Impor folder/repositori | Cepat, HTTPS otomatis |

Semua pilihan di atas memberi HTTPS otomatis. Alamat yang didapat dibagikan ke siswa
(bisa dijadikan **kode QR** untuk brosur/kelas).

### Langkah 3 — Periksa di HP
1. Buka alamat rilis di HP → pastikan muncul tombol/opsi **Pasang**.
2. Pasang, buka sekali, lalu nyalakan **mode pesawat** → aplikasi harus tetap terbuka.

## 5. Hal yang Perlu Diketahui

| Hal | Penjelasan |
|---|---|
| Penyimpanan progres | Progres disimpan di HP masing-masing (`localStorage`). Menghapus data browser/aplikasi menghapus progres. Setelah dipasang, aplikasi meminta penyimpanan permanen. |
| iPhone | Pemasangan hanya lewat Safari. Jika aplikasi tidak dibuka berminggu-minggu sebelum dipasang, iOS dapat menghapus data situs — sarankan siswa **memasang** aplikasinya. |
| Ingin file APK? | Opsional (P2): bungkus folder `dist` dengan Capacitor (docs/04 §7). Tidak diperlukan untuk memasang. |
| Alamat berubah | Aplikasi terpasang terikat pada alamatnya. Jika pindah hosting, siswa perlu memasang ulang. |
| Fitur AI (Tutor AI, Pembahas Soal) | Hanya berjalan dari server lokal (`npm start` di `server/`, docs/11 §6). Folder `server/` tidak ikut `dist/`, jadi versi hosting menampilkan "Fitur AI hanya tersedia saat RELAFUN dijalankan dari server lokal"; menu lain tetap jalan. Jangan memakai Cloudflare atau hosting berbayar untuk server AI. |

## 6. Hasil Pengujian (13 November 2026)

| Pengujian | Hasil |
|---|---|
| `tools/pwa-check.html` (manifest, 5 ikon, service worker, cache) | Semua lulus |
| Rilis `dist/`: service worker aktif, 25 file di cache | Lulus |
| Server dimatikan + jaringan diputus → Beranda & Progres tetap terbuka, banner offline tampil | Lulus |
| Emulasi HP Android 360 px: tanpa scroll horizontal, tombol "Pasang aplikasi" muncul | Lulus |
| Uji pada HP Android & iPhone asli | **Belum** — dilakukan setelah rilis ke hosting |
