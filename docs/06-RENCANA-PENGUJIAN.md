# 06 — Rencana Pengujian dan Evaluasi

## 1. Tahapan

| Tahap | Pelaku | Tujuan | Instrumen |
|---|---|---|---|
| 1. Uji fungsional | Pengembang | Semua fitur berjalan, tanpa error | Checklist §2 |
| 2. Validasi bank soal | Skrip + pengembang | Kunci & skema benar | `tools/test.html` & `tools/validate.html` (browser) |
| 3. Validasi ahli materi | Dosen/guru matematika | Kebenaran & kesesuaian konsep | Lembar validasi materi |
| 4. Validasi ahli media | Dosen TIK/media | Tampilan, navigasi, kepraktisan | Lembar validasi media |
| 5. Uji perorangan (one-to-one) | 2–3 siswa (termasuk S01 bila bersedia) | Keterbacaan, kebingungan | Think-aloud + wawancara singkat |
| 6. Uji kelompok kecil | 6–10 siswa kelas VIII | Kepraktisan & beban kognitif | SUS, angket respons, angket beban kognitif |
| 7. Uji lapangan (opsional) | 1 kelas | Efektivitas | Pre-test, post-test, N-gain |

Revisi dilakukan setelah tahap 3–6.

## 2. Checklist Uji Fungsional

### Umum
- [ ] Berjalan di Chrome Android (lebar 360 px dan 412 px) dan desktop (Chrome, Edge, Firefox).
- [ ] Tidak ada scroll horizontal di semua halaman.
- [ ] Tidak ada error di Console.
- [ ] Tombol kembali (browser/Android) bekerja sesuai rute.
- [ ] Dapat dipasang sebagai aplikasi (ikon muncul di layar utama).
- [ ] Mode pesawat: setelah dibuka sekali, semua halaman & soal tetap bisa dibuka.

### Masuk (F13)
- [x] Belum masuk → semua rute dialihkan ke `#/masuk`; navigasi tersembunyi.
- [x] Nama kosong / berisi angka ditolak dengan pesan jelas; spasi berlebih dirapikan.
- [x] Nama valid → Beranda menyapa dengan nama; tetap masuk setelah dimuat ulang.
- [x] Ubah nama dari Progres; Keluar (dengan konfirmasi) menghapus nama & progres lalu kembali ke Masuk.
- [ ] Uji di HP asli: keyboard tidak menutupi tombol Masuk.

### Materi
- [ ] Semua unit U0–U7 tampil; tombol Lanjut/Kembali berfungsi; posisi terakhir tersimpan.
- [ ] Toggle representasi menampilkan relasi yang sama di 3 bentuk.
- [ ] Cek pemahaman memberi umpan balik dan tersimpan ke progres.

### Kenali Konsep
- [ ] Kategori & alasan dinilai terpisah; kombinasi benar/salah memberi pesan sesuai §6 desain pembelajaran.
- [ ] Pengecoh bertag menampilkan pesan miskonsepsi yang tepat.
- [ ] Daftar periksa "Ciri-ciri" dapat dibuka/tutup.

### Bedah Soal
- [ ] Langkah terkunci sampai langkah sebelumnya selesai/dilihat pembahasannya.
- [ ] Penandaan frasa bekerja dengan sentuhan dan klik.
- [ ] "Sederhanakan kalimat" menukar teks soal.

### Latihan
- [ ] Sesi berisi 5 soal acak dari level terpilih, tanpa duplikat dalam satu sesi.
- [ ] Hint muncul bertahap dan tercatat; pembahasan muncul setelah hint habis/jawaban dikirim.
- [ ] Hasil sesi menampilkan skor, soal salah, dan rekomendasi.

### Misi Literasi
- [ ] Skor per tahap dan total (maks. 6) sesuai rubrik; skor parsial bekerja.
- [ ] Rubrik dan contoh jawaban ideal tampil di akhir misi.
- [ ] Skor per indikator (LR/LF/LE/LI) tampil di Progres.

### Ekspor Data (JavaScript → Python)
- [ ] CSV ekspor memiliki kolom persis sesuai [09 §2](09-ANALISIS-DATA-PYTHON.md#2-alur-data).
- [ ] CSV dapat dibaca `analysis/relafun_stats/load.py` tanpa error.
- [ ] Tidak ada nama asli siswa dalam file ekspor.

### Progres
- [ ] Akurasi per konsep sesuai data `attempts`.
- [ ] Data tetap ada setelah aplikasi ditutup dan dibuka lagi.
- [x] Tombol "Keluar" (menghapus progres) meminta konfirmasi.

### Aksesibilitas
- [ ] Lighthouse Accessibility ≥ 90, PWA installable, Performance ≥ 85 (mobile).
- [ ] Navigasi keyboard penuh di desktop.
- [ ] Diagram memiliki `aria-label` deskriptif.

## 3. Validasi Bank Soal (otomatis)

`tools/validate.html` (dibuka di browser) memeriksa:
- `id` unik dan format benar; `level`, `type`, `representation` dari daftar yang diizinkan.
- `answer` ada di `options`; minimal 2 `hints`; `explanation` tidak kosong.
- Setiap opsi salah punya `misconception` atau `feedback`.
- Untuk soal ber-`visual` diagram: kunci sesuai hasil `math.js`
  (mis. jawaban "fungsi" ⇔ `isFunction` true dan `isOneToOneCorrespondence` false).
- `stemSimple` ada untuk soal cerita.

## 3b. Pengujian Skrip Python

- `pytest` di folder `analysis/` harus lolos.
- Setiap fungsi statistik diuji dengan data kecil yang hasilnya sudah dihitung manual atau di
  Excel (mis. Cronbach's alpha, N-gain, skor SUS, daya beda).
- Hasil uji t/Wilcoxon dibandingkan dengan perangkat lain (SPSS/JASP/Excel) pada satu set data
  contoh, untuk memastikan skrip benar sebelum dipakai di laporan.

## 4. Instrumen Evaluasi Pengguna

### 4.1 Angket Beban Kognitif (adaptasi Leppink dkk., 2013; skala 0–10)
- **IL:** "Materi relasi dan fungsi pada aplikasi ini sangat kompleks."
- **EL:** "Penjelasan dan petunjuk pada aplikasi ini tidak jelas." / "Bahasa soal sulit dipahami."
- **GL:** "Aplikasi ini membantu saya memahami perbedaan relasi dan fungsi."

Target: EL rendah (≤ 3), GL tinggi (≥ 7).

### 4.2 System Usability Scale (SUS)
10 butir standar, diterjemahkan ke Bahasa Indonesia. Target skor ≥ 68.

### 4.3 Pre-test / Post-test
- 15–18 butir sesuai kisi-kisi TP1–TP8, minimal 40% butir soal cerita tersirat.
- Analisis: N-gain = (post − pre) / (100 − pre). Kategori: ≥ 0,7 tinggi; 0,3–0,7 sedang; < 0,3 rendah.
- Analisis tambahan: frekuensi miskonsepsi M01–M10 sebelum vs sesudah.
- **Literasi matematika:** 4 butir (LR, LF, LE, LI) dengan penskoran per tahapan (maks. 24);
  N-gain total dan per indikator; analisis tahap yang paling sering gagal.
- Semua perhitungan dilakukan dengan skrip Python ([09](09-ANALISIS-DATA-PYTHON.md)).

### 4.4 Wawancara Lanjutan
Pertanyaan diselaraskan dengan kode wawancara awal (IL/EL/GL/DS) agar bisa dibandingkan:
- "Setelah memakai aplikasi, apakah kamu lebih mudah menentukan soal meminta relasi atau fungsi?" (K03/IL01)
- "Bagian mana yang membuatmu bingung?" (EL)
- "Apakah fitur Bedah Soal membantu memahami soal cerita?" (EL05)
- "Apakah umpan balik menjelaskan kesalahanmu dengan jelas?" (GL02)
- "Apakah tampilannya cukup sederhana?" (DS03)

## 5. Kriteria Lolos Rilis MVP

- 100% checklist §2 tercentang.
- Skrip validasi bank soal tanpa error.
- Validasi ahli materi & media minimal kategori "valid/layak dengan revisi kecil".
