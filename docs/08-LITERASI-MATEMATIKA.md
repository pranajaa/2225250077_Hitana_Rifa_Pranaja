# 08 — Literasi Matematika di RELAFUN

## 1. Mengapa Literasi Matematika

Masalah utama dari wawancara — siswa sulit menentukan konsep pada soal cerita yang tersirat
(K03, IL01, EL05) — adalah masalah **literasi matematika**: kemampuan menerjemahkan situasi
nyata ke model matematika, menyelesaikannya, lalu menafsirkan hasilnya kembali ke konteks.
Karena itu literasi tidak dijadikan fitur tempelan, tetapi **benang merah** seluruh aplikasi.

Rujukan: kerangka PISA 2022 (OECD) — *mathematical reasoning* sebagai inti, ditambah tiga proses
*formulate*, *employ*, *interpret & evaluate*; serta kisi-kisi Mathematical Literacy yang dipakai
penyusun (file `Kisi-Kisi Soal Mathematical Literacy.docx` dan `Tabel Kisi-kisi soal.docx`).

## 2. Empat Indikator Literasi (sesuai kisi-kisi penyusun)

| Kode | Indikator | Deskripsi | Wujud pada relasi & fungsi |
|---|---|---|---|
| **LR** | Mathematical Reasoning | Mengidentifikasi hubungan matematis, membandingkan alternatif, memberi alasan, mengambil keputusan yang dapat dipertanggungjawabkan | Membandingkan dua kondisi pemasangan, memutuskan mana yang fungsi beserta alasannya |
| **LF** | Formulating Situations Mathematically | Mengidentifikasi informasi relevan, menentukan besaran, menerjemahkan situasi nyata menjadi model matematika | Dari data/cerita → menyusun himpunan A dan B, pasangan berurutan, diagram panah |
| **LE** | Employing Concepts, Facts, and Procedures | Memilih dan menggunakan konsep, operasi, prosedur untuk memperoleh solusi | Menerapkan aturan (mis. y = 2x) → pasangan, domain, kodomain, range |
| **LI** | Interpreting, Applying, and Evaluating Outcomes | Menafsirkan hasil dalam konteks, menilai kewajaran, mengambil keputusan | Menilai klaim orang lain ("bukan fungsi karena ada yang sama") dan menyimpulkan |

Struktur konstruk: **LR → LF → LE → LI**. Skor dianalisis sebagai total *dan* per indikator.

### Konteks soal (variasi menurut PISA)
| Konteks | Contoh pada relasi & fungsi |
|---|---|
| Pribadi | Hobi, ekstrakurikuler, jajanan favorit, nomor HP |
| Pekerjaan/sekolah | Nomor kursi, kode rak perpustakaan, jadwal piket, NIS |
| Sosial/masyarakat | Kota–provinsi, tarif parkir per jam, harga per kilogram |
| Ilmiah | Suhu terhadap waktu, tinggi tanaman per minggu, konversi °C → °F |

## 3. Bagaimana Aplikasi Menumbuhkan Literasi

| Komponen | Kontribusi ke literasi | Indikator |
|---|---|---|
| **Bedah Soal** (F3) | 5 langkahnya dipetakan langsung: Diketahui = LF, Karakteristik & Konsep = LR, Penyelesaian = LE, Kesimpulan = LI | LF, LR, LE, LI |
| **Kenali Konsep** (F2) | Memilih konsep + alasan = penalaran | LR |
| **Misi Literasi** (F11, baru) | Soal kontekstual multi-tahap dengan penskoran per tahapan | Semua |
| **Baca Data** (bagian F11) | Data disajikan sebagai tabel/daftar/grafik lalu siswa membentuk relasi | LF, LI |
| **Cek Klaim** (bagian F11) | Menilai benar/tidaknya pernyataan orang lain disertai alasan | LI, LR |
| Latihan Sulit (F4) | Soal cerita dengan konteks baru (transfer) | LF, LE |

### F11. Misi Literasi — rincian
- Setiap misi = 1 situasi kontekstual + 4–6 tahap, mengikuti tahapan kisi-kisi.
- Setiap tahap punya skor (mis. 1 atau 2) → total maksimum **6 per soal**, sama dengan kisi-kisi.
- **Skor parsial**: tahap yang benar tetap mendapat skor walau tahap berikutnya salah
  (sesuai pedoman umum penskoran — mengukur proses, bukan hanya jawaban akhir).
- Bentuk tahap dibuat **terstruktur** agar dapat dinilai otomatis oleh JavaScript:
  memilih anggota himpunan, menyusun pasangan berurutan, menarik panah, isian angka,
  memilih kesimpulan dan alasan.
- Tahap kesimpulan berupa **teks bebas opsional** disimpan untuk dinilai guru/peneliti
  (diekspor ke CSV, dianalisis dengan Python — lihat [09-ANALISIS-DATA-PYTHON](09-ANALISIS-DATA-PYTHON.md)).
- Setelah selesai, siswa melihat **rubrik**: tahap mana yang sudah tepat dan contoh jawaban ideal.
- Tiga tingkat bantuan (*fading*): Dipandu penuh → Petunjuk saja → Mandiri.

### Kebiasaan literasi yang dilatih berulang
1. **"Apa yang ditanyakan?"** — selalu diminta sebelum menghitung.
2. **"Data mana yang penting?"** — ada data pengecoh yang tidak relevan pada level sulit.
3. **"Apakah hasilnya masuk akal?"** — pertanyaan kewajaran di akhir.
4. **"Jelaskan ke teman"** — memilih/menyusun alasan (GL04).

## 4. Bank Soal Awal (dari Tabel Kisi-kisi Soal penyusun)

Empat soal yang sudah disusun penyusun dijadikan misi pertama (`LM-001` s.d. `LM-004`):

| ID | Indikator | Judul | Tahap & skor | Konsep |
|---|---|---|---|---|
| LM-001 | LR | Pilihan Ekstrakurikuler (Kondisi A vs B) | 1-2-1-1-1 = 6 | Fungsi vs relasi; satu anggota domain dua pasangan |
| LM-002 | LF | Peminjaman Buku Perpustakaan (Rina 2, Sinta 3, Dika 2, Fajar 4) | 1-1-1-1-1-1 = 6 | Menyusun himpunan, pasangan, diagram panah; M01 |
| LM-003 | LE | Aturan "dua kali nilai" A={1,2,3,4}, B={2,4,6,8,10} | 1-2-2-1 = 6 | Domain, kodomain, range; M05 |
| LM-004 | LI | Kode Rak Buku (Arman R1, Bella R2, Candra R1, Dinda R3) | 1-1-1-1-1-1 = 6 | Mengevaluasi klaim keliru; M01 |

Kuota MVP: **12 misi** (3 per indikator), lalu ditambah bertahap. 4 misi tambahan dapat
dijadikan butir pre-test/post-test literasi (total skor maksimum 24, seperti kisi-kisi).

**Terpasang 17 Nov 2026** di `data/misi-literasi.json` (12 misi). LM-001–LM-004 memakai **teks asli kisi-kisi**
(`sumber: "kisi-kisi"`); versi ringkas hanya di `stemSimple`. Misi baru:

| ID | Indikator | Judul | Kemampuan yang berbeda dari soal kisi-kisi |
|---|---|---|---|
| LM-005 | LF | Bus Jemputan Sekolah | Memilah data pengecoh (jam tiba); kodomain dari konteks (Bus 3 tanpa pasangan) |
| LM-006 | LF | Grafik Pengunjung Perpustakaan | Membaca diagram Cartesius → pasangan → uji garis vertikal |
| LM-007 | LR | Tiga Aturan Pembagian Loker | Membandingkan tiga alternatif; dua jenis pelanggaran syarat fungsi |
| LM-008 | LR | Perubahan Jadwal Piket | Penalaran hipotetis atas tiga perubahan |
| LM-009 | LE | Kupon Antrean Kantin | Menerapkan aturan y = x + 2 lalu mengecek hasil terhadap kodomain (4 tanpa pasangan → bukan fungsi) |
| LM-010 | LE | Suhu Pagi di Halaman Sekolah | Dari data tabel → domain, kodomain, range; range ≠ kodomain |
| LM-011 | LI | Pesanan Makan Siang | Mengevaluasi klaim keliru M02 (menu tidak dipesan) |
| LM-012 | LI | Memeriksa Pekerjaan Teman | Mengevaluasi pekerjaan yang menyamakan daerah hasil dengan kodomain (M05) |

**Keputusan pemilik (17 Nov 2026):**
- **Cakupan penilaian** Misi Literasi hanya indikator kisi-kisi: relasi, fungsi, domain, kodomain, range.
  Banyak pemetaan, korespondensi satu-satu, dan nilai fungsi hanya materi penunjang (tidak dinilai di misi).
- **Alasan tertulis** = teks bebas yang **dinilai guru** dengan `rubrikGuru`; daftar alasan (`bantuan`) hanya bantuan,
  tidak menggantikan jawaban bebas. Teks diekspor di kolom `jawaban_teks` (docs/09 §2).
- **LM-002 tahap 4:** pengganti menggambar diagram = memilih 1 dari 3 diagram panah (pengecoh: arah terbalik M06,
  panah Dika hilang M01) **ditambah alasan pemilihan**; skor hanya jika diagram dan alasan sama-sama benar.
  Pola yang sama dipakai LM-005.
- Jumlah hint yang dibuka dicatat sebagai `hint_count` (asesmen dinamis RMT).

## 5. Contoh Data Misi (LM-004)

```json
{
  "id": "LM-004",
  "feature": "misi-literasi",
  "indicator": "LI",
  "context": "sekolah",
  "level": "sedang",
  "title": "Kode Rak Buku",
  "stem": "Empat siswa mendapat kode rak buku: Arman R1, Bella R2, Candra R1, Dinda R3. Seorang siswa berkata hubungan nama siswa dan kode rak bukan fungsi karena ada dua siswa dengan kode rak sama. Apakah kamu setuju?",
  "stemSimple": "Arman R1, Bella R2, Candra R1, Dinda R3. Ada yang bilang ini bukan fungsi karena R1 dipakai dua kali. Setuju?",
  "data": { "kind": "table", "columns": ["Siswa", "Kode rak"],
            "rows": [["Arman","R1"],["Bella","R2"],["Candra","R1"],["Dinda","R3"]] },
  "stages": [
    { "n": 1, "score": 1, "prompt": "Tentukan domain dan kodomain.", "type": "set-pair",
      "answer": { "domain": ["Arman","Bella","Candra","Dinda"], "codomain": ["R1","R2","R3"] } },
    { "n": 2, "score": 1, "prompt": "Susun pasangan berurutannya.", "type": "pairs",
      "answer": [["Arman","R1"],["Bella","R2"],["Candra","R1"],["Dinda","R3"]] },
    { "n": 3, "score": 1, "prompt": "Berapa pasangan yang dimiliki setiap siswa?", "type": "mcq",
      "options": ["Tepat satu", "Ada yang dua", "Ada yang tidak punya"], "answer": 0 },
    { "n": 4, "score": 1, "prompt": "Apa yang terjadi pada R1?", "type": "mcq",
      "options": ["Dipasangkan oleh dua siswa berbeda", "Tidak punya pasangan"], "answer": 0 },
    { "n": 5, "score": 1, "prompt": "Apakah klaim siswa tersebut benar?", "type": "mcq",
      "options": ["Benar", "Tidak benar"], "answer": 1, "misconception": { "0": "M01" } },
    { "n": 6, "score": 1, "prompt": "Pilih kesimpulan dan alasannya.", "type": "reason",
      "options": [
        "Fungsi, karena setiap siswa punya tepat satu kode rak meskipun ada kode yang sama",
        "Bukan fungsi, karena R1 punya dua pasangan"
      ], "answer": 0, "freeText": true }
  ],
  "maxScore": 6,
  "modelAnswer": "Hubungan tersebut fungsi. Setiap anggota domain memiliki tepat satu pasangan; beberapa anggota domain boleh memiliki pasangan yang sama."
}
```

Aturan: jumlah `score` semua tahap = `maxScore`; `indicator` ∈ {LR, LF, LE, LI};
`context` ∈ {pribadi, sekolah, sosial, ilmiah}.

> Contoh di atas adalah rancangan awal. Versi terpasang (`data/misi-literasi.json`) mengubah tahap 6 menjadi
> `"type": "reason", "freeText": true, "penilaian": "guru"` dengan `rubrikGuru` dan `bantuan`, serta memakai
> teks soal asli kisi-kisi.

## 6. Tujuan Pembelajaran Literasi (tambahan)

| Kode | Tujuan |
|---|---|
| TP9 (LR) | Membandingkan dua atau lebih situasi pemasangan dan memutuskan mana yang fungsi disertai alasan matematis |
| TP10 (LF) | Menyusun model matematika (himpunan, pasangan berurutan, diagram panah) dari data atau situasi nyata |
| TP11 (LE) | Menerapkan aturan fungsi untuk menentukan pasangan, domain, kodomain, dan daerah hasil |
| TP12 (LI) | Menafsirkan dan mengevaluasi kesimpulan tentang relasi/fungsi dalam konteks nyata |

## 7. Pengukuran Perkembangan Literasi

- **Di aplikasi (JavaScript):** skor tiap misi, rata-rata skor per indikator (LR/LF/LE/LI)
  sebagai persentase sederhana dan grafik batang di halaman Progres.
- **Untuk penelitian (Python):** pre-test/post-test literasi, N-gain per indikator, uji beda,
  reliabilitas & validitas butir, analisis tahapan yang paling sering gagal.
  Lihat [09-ANALISIS-DATA-PYTHON](09-ANALISIS-DATA-PYTHON.md).
