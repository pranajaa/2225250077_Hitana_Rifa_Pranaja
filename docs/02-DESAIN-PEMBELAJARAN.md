# 02 — Desain Pembelajaran

## 1. Landasan

- **Kurikulum:** Kurikulum Merdeka, Fase D (SMP), elemen Aljabar — relasi dan fungsi
  (kelas VIII). Rumusan Capaian Pembelajaran resmi perlu dikutip dari dokumen BSKAP terbaru
  saat menyusun laporan; di sini dipakai tujuan pembelajaran turunan.
- **Model pembelajaran:** *Rigorous Mathematical Thinking* (RMT; Kinard & Kozulin) — integrasi alat psikologis
  sosiokultural (Vygotsky) dan Pengalaman Belajar Ter-mediasi/MLE (Feuerstein). RMT menentukan **alur aktivitas siswa**:
  konsep sehari-hari → alat psikologis (representasi) → konsep ilmiah → manipulasi → validasi → transendensi & refleksi;
  fungsi kognitif Input → Elaborasi → Output; petunjuk bertahap sebagai asesmen dinamis. Rincian penerapan:
  [13-RANCANGAN-KONTEN-RMT](13-RANCANGAN-KONTEN-RMT.md) §1.
- **Prinsip desain media:** Cognitive Load Theory (Sweller, 1988; Sweller, van Merriënboer & Paas, 2019)
  dan prinsip multimedia (Mayer, 2009/2021) — menentukan **cara penyajian** (segmentasi, sinyal, kontiguitas,
  fading, tanpa dekorasi). Keputusan pemilik 17 Nov 2026: RMT = model pembelajaran, CLT = prinsip desain media;
  keduanya harus tampak nyata pada aktivitas dan penyajian.
- **Model pengembangan (saran):** ADDIE atau 4D (Thiagarajan). Dokumen ini adalah keluaran
  tahap *Analysis/Define* dan *Design*.

## 2. Tujuan Pembelajaran (TP)

| Kode | Tujuan Pembelajaran | Unit |
|---|---|---|
| TP1 | Menyatakan relasi antara dua himpunan dengan diagram panah, himpunan pasangan berurutan, dan diagram Cartesius | U1, U2 |
| TP2 | Menjelaskan syarat suatu relasi merupakan fungsi | U3 |
| TP3 | Membedakan relasi yang merupakan fungsi dan yang bukan fungsi dalam berbagai bentuk penyajian | U4 |
| TP4 | Menentukan domain, kodomain, dan daerah hasil suatu fungsi | U3, U5 |
| TP5 | Menentukan nilai fungsi dari rumus fungsi | U5 |
| TP6 | Menentukan banyak pemetaan yang mungkin dari dua himpunan | U6 |
| TP7 | Mengidentifikasi korespondensi satu-satu dan menghitung banyaknya | U7 |
| TP8 | Mengidentifikasi konsep (relasi/fungsi/korespondensi satu-satu) yang tepat pada soal kontekstual dan menyelesaikannya | Kenali Konsep, Bedah Soal |
| TP9–TP12 | Tujuan literasi matematika (LR, LF, LE, LI) — rincian di [08-LITERASI-MATEMATIKA §6](08-LITERASI-MATEMATIKA.md#6-tujuan-pembelajaran-literasi-tambahan) | Misi Literasi, Bedah Soal |

## 3. Pemetaan Prinsip Beban Kognitif ke Fitur

| Prinsip | Mengatasi | Penerapan di RELAFUN |
|---|---|---|
| **Segmentasi** | IL04 | Unit kecil (≤ 5 layar), satu konsep baru per unit, tombol "Lanjut" dikendalikan siswa |
| **Pra-latihan (pre-training)** | IL04 | Unit U0 mengulang istilah himpunan & pasangan berurutan sebelum relasi |
| **Contoh & non-contoh** | IL01, IL03 | Diagram fungsi dan bukan-fungsi tampil berdampingan dengan perbedaan yang disorot |
| **Worked example** | GL05 | Contoh soal lengkap dengan langkah sebelum latihan sejenis |
| **Completion problem & fading** | IL05 | Bedah Soal: level Mudah semua langkah dipandu → Sulit hanya langkah konsep yang dipandu |
| **Signaling (penanda)** | IL02, EL05 | Sorot data penting pada soal; warna konsisten untuk domain (biru) & kodomain (oranye) |
| **Kontiguitas spasial** | EL (split-attention) | Label ditulis langsung di diagram; penjelasan tepat di samping/bawah diagram, bukan di halaman lain |
| **Koherensi** | EL03 | Tanpa gambar dekoratif, animasi, atau musik yang tidak relevan |
| **Bahasa sederhana** | EL01, EL05 | Kalimat pendek, istilah baku konsisten, opsi "Sederhanakan kalimat" |
| **Self-explanation** | GL04, DS02 | Setelah memilih jawaban, siswa memilih alasan dari daftar ciri |
| **Umpan balik elaboratif** | GL02, EL04 | Penjelasan kesalahan sesuai miskonsepsi + rujukan ke unit materi |
| **Variabilitas konteks** | IL05 | Konteks soal bervariasi (hobi, NIS siswa, kota-provinsi, harga barang, nomor kursi) |

## 4. Struktur Setiap Unit Materi (RMT × CLT)

Enam layar, satu tugas per layar (segmentasi CLT). Data: `data/materi/U0–U7.json`.

| Layar | Tahap RMT | Penerapan CLT |
|---|---|---|
| 1 | **Konsep sehari-hari** + tujuan & makna (MLE: intensionalitas, makna); pertanyaan respons tanpa skor (resiprositas) | Pemantik singkat, tanpa gambar dekoratif |
| 2 | **Representasi** — alat psikologis: tabel, diagram panah, pasangan berurutan, Cartesius | Label langsung di diagram; warna domain/kodomain |
| 3 | **Konsep ilmiah** — definisi resmi §5 + kotak "Ingat!" | Satu definisi per layar |
| 4 | **Manipulasi** — contoh vs non-contoh | Berdampingan, perbedaan disorot (sinyal) |
| 5 | **Validasi** — cek pemahaman (3 soal) | Umpan balik langsung + hint bertahap |
| 6 | **Transendensi & refleksi** — "di mana lagi berlaku?" + satu pertanyaan metakognisi (tidak dinilai) | Singkat |

Unit yang memakai istilah di luar §5 (U0, U2, U5) berlabel `perlu-verifikasi` dan tidak memuat definisi karangan
sampai ada kutipan buku siswa/LKS.

## 5. Aturan Inti Konsep (Wajib Konsisten di Seluruh Aplikasi)

Agar tidak menimbulkan miskonsepsi baru, gunakan rumusan berikut secara konsisten:

- **Relasi** dari himpunan A ke himpunan B adalah aturan yang memasangkan anggota-anggota
  himpunan A dengan anggota-anggota himpunan B.
- **Fungsi (pemetaan)** dari A ke B adalah relasi khusus yang memasangkan **setiap** anggota A
  dengan **tepat satu** anggota B.
  - A = **domain** (daerah asal), B = **kodomain** (daerah kawan),
    himpunan semua peta = **daerah hasil (range)**, dan range ⊆ kodomain.
  - Boleh: dua anggota A berpasangan dengan anggota B yang sama.
  - Boleh: ada anggota B yang tidak punya pasangan.
  - Tidak boleh: ada anggota A tanpa pasangan, atau satu anggota A punya lebih dari satu pasangan.
- **Korespondensi satu-satu** antara A dan B adalah fungsi yang memasangkan setiap anggota A
  dengan tepat satu anggota B **dan** setiap anggota B dengan tepat satu anggota A.
  Syarat perlu: n(A) = n(B).
- **Banyak pemetaan** dari A ke B = n(B)^n(A).
- **Banyak korespondensi satu-satu** antara A dan B dengan n(A) = n(B) = n adalah n! .
- **Uji garis vertikal** (pada diagram Cartesius): relasi dari A ke B adalah fungsi jika setiap
  garis vertikal di x anggota A memotong grafik **tepat satu** kali.

### Daftar Periksa "Ciri-ciri" (dipakai di Kenali Konsep & Bedah Soal)
1. Apakah ada aturan yang memasangkan anggota A dengan anggota B? → **relasi**
2. Apakah **setiap** anggota A punya pasangan?
3. Apakah setiap anggota A punya **tepat satu** pasangan? → jika (2) dan (3) ya: **fungsi**
4. Apakah setiap anggota B juga dipasangkan **tepat satu** kali? → jika ya: **korespondensi satu-satu**

## 6. Strategi Umpan Balik

| Situasi | Bentuk umpan balik |
|---|---|
| Benar + alasan benar | Konfirmasi singkat + satu kalimat penguat ("Benar, karena setiap siswa punya tepat satu NIS.") |
| Benar + alasan salah | "Jawabanmu benar, tetapi alasannya belum tepat." + penjelasan alasan yang benar |
| Salah (pengecoh bertag miskonsepsi) | Pesan khusus miskonsepsi + sorot bagian diagram yang relevan + tautan ke unit |
| Salah 2× pada soal sama | Tawarkan hint/pembahasan; jangan menghukum |
| Selesai sesi | Ringkasan: skor, miskonsepsi terbanyak, rekomendasi unit |

Nada umpan balik: suportif, tidak menyalahkan, tidak memakai kata "bodoh/gagal".

## 7. Penilaian Penguasaan (Mastery)

- Per konsep (tag): akurasi dihitung dari 10 jawaban terakhir.
- Status: **Belum dimulai** (0 jawaban) · **Sedang belajar** (< 70%) · **Kuasai** (≥ 70% dan ≥ 5 jawaban).
- Rekomendasi: konsep dengan akurasi terendah dan miskonsepsi paling sering.

## 8. Instrumen Penelitian (bila dipakai untuk skripsi/tugas)

- Lembar validasi ahli materi & ahli media (skala Likert 1–4/1–5).
- Pre-test & post-test (F6) — kisi-kisi mengikuti TP1–TP8, ditambah 4 butir literasi (LR, LF, LE, LI; maks. 24).
- Seluruh data instrumen diolah dengan Python ([09-ANALISIS-DATA-PYTHON](09-ANALISIS-DATA-PYTHON.md)).
- Angket beban kognitif (adaptasi Leppink dkk., 2013: IL, EL, GL).
- Angket respons siswa & System Usability Scale (SUS).
- Pedoman wawancara lanjutan (perbandingan dengan wawancara awal).
