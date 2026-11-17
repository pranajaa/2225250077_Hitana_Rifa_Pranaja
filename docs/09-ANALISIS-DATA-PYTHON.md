# 09 — Pembagian JavaScript & Python, dan Analisis Data Statistik

## 1. Aturan Pembagian Bahasa

| Jenis data / tugas | Bahasa | Contoh |
|---|---|---|
| **Data umum** — semua yang terjadi di dalam aplikasi | **JavaScript** | Menampilkan materi & soal, memeriksa jawaban, skor per tahap misi, menyimpan progres, persentase akurasi, grafik progres sederhana, validasi bank soal |
| **Data statistik** — data penelitian/evaluasi yang diolah dengan uji statistik | **Python** | Pre-test/post-test, N-gain, uji normalitas, uji t / Wilcoxon, validitas & reliabilitas butir, tingkat kesukaran, daya beda, skor SUS, angket beban kognitif, skor literasi per indikator, frekuensi miskonsepsi |

**Batasnya:** jika hasilnya hanya ditampilkan ke siswa di aplikasi (hitung, jumlah, persen) →
JavaScript. Jika data dikumpulkan dari banyak siswa lalu diuji statistik untuk laporan/penelitian
→ Python.

### Mengapa Python tidak dijalankan di dalam aplikasi
- Aplikasi adalah PWA statis tanpa server; menjalankan Python di browser (Pyodide) menambah
  unduhan ±10 MB — terlalu berat untuk HP siswa (NF-02).
- Analisis statistik dibutuhkan oleh **peneliti/guru**, bukan siswa.

Maka Python dipakai sebagai **skrip analisis terpisah** di laptop peneliti, membaca data yang
diekspor aplikasi.

## 2. Alur Data

```
[HP/laptop siswa]                [Laptop peneliti]
 RELAFUN (JavaScript)
   │ Ekspor hasil (CSV/JSON)  ─►  analysis/data/raw/
   │                               │
 Angket (Google Form → CSV)   ─►  analysis/data/raw/
                                   │
                                   ▼
                     Python: bersihkan → hitung → uji statistik
                                   │
                                   ▼
                     analysis/output/  (tabel .csv/.xlsx, grafik .png, laporan .md)
```

### Format ekspor dari aplikasi (dibuat oleh JavaScript)
Satu baris = satu jawaban per tahap, agar mudah diolah pandas.

`relafun_hasil_<kodeSiswa>_<tanggal>.csv`
```
kode_siswa,sesi,qid,fitur,indikator,tahap,skor,skor_maks,benar,miskonsepsi,hint,waktu_ms,timestamp,hint_count,jawaban_teks
S01,latihan,LM-004,misi-literasi,LI,5,0,1,0,M01,1,21000,2026-12-01T08:10:00,2,
S01,latihan,LM-004,misi-literasi,LI,6,1,1,1,,0,48000,2026-12-01T08:11:00,0,"Fungsi, karena setiap siswa punya tepat satu kode rak."
```
- `kode_siswa` diisi kode anonim (S01, S02 …) — **bukan nama**.
- `sesi` ∈ {pretest, posttest, latihan}.
- Peneliti menggabungkan file semua siswa di `analysis/data/raw/`.

| Kolom | Arti |
|---|---|
| `hint` | `1` jika siswa membuka minimal satu hint pada tahap itu, `0` jika tidak |
| `hint_count` | Jumlah hint yang benar-benar dibuka (data asesmen dinamis RMT). Wajib konsisten: `hint_count = 0` ⇔ `hint = 0`; `hint_count > 0` ⇔ `hint = 1` |
| `jawaban_teks` | Alasan tertulis siswa (teks bebas) untuk tahap yang dinilai guru; kosong untuk tahap lain |

**Perubahan kontrak — 17 Nov 2026** (keputusan pemilik):
- `hint_count` dan `jawaban_teks` **ditambahkan di akhir**; 13 kolom lama tidak diubah urutan maupun namanya.
- Arti `hint` ditetapkan (sebelumnya belum didefinisikan; data contoh selalu 0).
- **CSV lama (13 kolom) tetap bisa dibaca**: `hint_count` diisi kosong (tidak tercatat — bukan 0), `jawaban_teks` diisi
  teks kosong, nilai `hint` lama tidak diubah. Aturan konsistensi hanya diperiksa bila kolom `hint_count` ada.
- Tahap alasan tertulis dinilai guru; `skor` di CSV adalah skor dari guru. `load.py` tetap menolak skor kosong.
  Cara mencatat tahap yang **belum** dinilai guru belum ditetapkan (menunggu keputusan pemilik).
- Penulisan teks mengikuti RFC 4180: sel berisi koma, tanda kutip, atau baris baru diapit `"…"`, dan tanda kutip di
  dalam teks ditulis `""`. Hanya sel kosong yang dianggap kosong (teks "NA" tetap teks).
- **Privasi:** `jawaban_teks` tidak boleh menjadi tempat data identitas wajib. Aplikasi menampilkan pengingat agar
  siswa tidak menulis nama; peneliti memeriksa dan menyamarkan nama yang tertulis sebelum analisis/publikasi.
- Kontrak ditegakkan oleh `analysis/relafun_stats/config.py` (`ANSWER_COLUMNS` wajib, `OPTIONAL_COLUMNS`,
  `EXPORT_COLUMNS`) dan `load.py`, diuji di `analysis/tests/test_stats.py`. `js/export.js` (belum dibuat, Fase 5b)
  wajib menulis `EXPORT_COLUMNS` dengan urutan di atas.

## 3. Struktur Folder Python

```
RelaFun/
└── analysis/
    ├── README.md                 # Cara instal & menjalankan
    ├── requirements.txt          # pandas, numpy, scipy, matplotlib, openpyxl, pytest
    ├── data/
    │   ├── raw/                  # CSV ekspor aplikasi & angket (JANGAN di-commit)
    │   └── processed/            # Data bersih hasil skrip (jawaban.csv)
    ├── output/                   # Tabel CSV, grafik PNG, laporan.md
    ├── relafun_stats/            # Paket fungsi (bisa diuji)
    │   ├── config.py             # Lokasi folder, α, kontrak kolom CSV
    │   ├── load.py               # Membaca, memvalidasi & menggabungkan CSV
    │   ├── item_analysis.py      # Validitas, reliabilitas, kesukaran, daya beda
    │   ├── effectiveness.py      # N-gain, normalitas, uji t/Wilcoxon, effect size
    │   ├── literacy.py           # Skor literasi total & per indikator, analisis tahapan
    │   ├── questionnaire.py      # SUS, angket beban kognitif, skala Likert
    │   ├── misconception.py      # Frekuensi M01–M10 pre vs post, uji McNemar
    │   ├── plots.py              # Grafik
    │   └── report.py             # Menyusun tabel + bagian laporan Markdown
    ├── scripts/
    │   ├── 00_buat_data_contoh.py  # Data SINTETIS untuk mencoba alur (awalan contoh_)
    │   ├── 01_bersihkan_data.py
    │   ├── 02_analisis_butir.py
    │   ├── 03_efektivitas.py
    │   ├── 04_literasi.py          # + miskonsepsi
    │   ├── 05_angket.py
    │   └── 06_laporan.py           # Menjalankan semua → output/laporan.md
    └── tests/
        └── test_stats.py         # Uji fungsi dengan data kecil yang hasilnya diketahui
```

Lingkungan: Python 3.15 (terpasang), virtual environment di `analysis/.venv`.

## 4. Daftar Analisis Statistik

### 4.1 Analisis Butir Soal (uji coba instrumen)
| Analisis | Rumus/metode | Kriteria |
|---|---|---|
| Validitas butir | Korelasi *product moment* Pearson skor butir vs skor total (butir uraian/politomus); point-biserial untuk butir 0/1 | r_hitung > r_tabel (α = 0,05) |
| Reliabilitas | Cronbach's alpha | ≥ 0,70 reliabel |
| Tingkat kesukaran | P = rata-rata skor butir / skor maksimum butir | < 0,30 sukar; 0,30–0,70 sedang; > 0,70 mudah |
| Daya beda | (rata-rata kelompok atas − kelompok bawah) / skor maks (27% atas/bawah) | ≥ 0,40 sangat baik; 0,30–0,39 baik; 0,20–0,29 cukup; < 0,20 jelek |

### 4.2 Efektivitas (pre-test vs post-test)
| Analisis | Metode |
|---|---|
| Statistik deskriptif | n, mean, median, SD, min, maks |
| N-gain | g = (post − pre) / (skor maks − pre); kategori Hake: ≥ 0,7 tinggi, 0,3–0,7 sedang, < 0,3 rendah |
| Uji normalitas | Shapiro–Wilk pada selisih (post − pre) |
| Uji beda | Normal → *paired t-test*; tidak normal → Wilcoxon signed-rank |
| Ukuran efek | Cohen's d (paired) atau r = Z/√N untuk Wilcoxon |

### 4.3 Literasi Matematika
- Skor total literasi (maks. 24 untuk 4 butir) dan **per indikator** LR, LF, LE, LI.
- N-gain per indikator → indikator mana yang paling berkembang.
- **Analisis tahapan:** persentase siswa yang benar di tiap tahap → menemukan tahap yang
  paling sering gagal (mis. tahap "menentukan range").
- Kategori kemampuan literasi (mis. persentase skor ≥ 80 sangat baik, 60–79 baik, 40–59 cukup, < 40 kurang — sesuaikan dengan rujukan yang dipakai di laporan).

### 4.4 Angket
| Angket | Pengolahan |
|---|---|
| SUS (10 butir, 1–5) | Butir ganjil: skor − 1; butir genap: 5 − skor; jumlah × 2,5 → 0–100. Interpretasi: ≥ 68 di atas rata-rata |
| Beban kognitif (IL, EL, GL; 0–10) | Rata-rata per dimensi; reliabilitas per dimensi; target EL rendah, GL tinggi |
| Respons siswa / validasi ahli (Likert) | Persentase skor = Σ skor / skor maks × 100%; kategori kelayakan |

### 4.5 Miskonsepsi
- Frekuensi dan persentase M01–M10 pada pre-test vs post-test, ditampilkan sebagai tabel
  dan grafik batang berdampingan; opsional uji McNemar per miskonsepsi.

## 5. Library

| Library | Kegunaan |
|---|---|
| pandas | Membaca CSV/Excel, mengolah tabel |
| numpy | Perhitungan numerik |
| scipy.stats | shapiro, ttest_rel, wilcoxon, pearsonr, pointbiserialr |
| matplotlib | Grafik (batang, boxplot pre–post, radar per indikator) |
| openpyxl | Ekspor tabel ke Excel untuk lampiran laporan |
| pytest | Menguji fungsi statistik |

Cronbach's alpha, N-gain, SUS, daya beda ditulis sendiri di `relafun_stats/` (rumus sederhana,
mudah dijelaskan di laporan) dan diuji di `tests/test_stats.py` dengan data contoh yang hasilnya
dihitung manual/Excel.

## 6. Cara Menjalankan

Lihat [analysis/README.md](../analysis/README.md).

## 7. Etika & Privasi Data
- Data mentah memakai kode siswa (S01 …), tidak menyimpan nama.
- `analysis/data/raw/` dan `analysis/data/processed/` masuk `.gitignore`.
- Persetujuan siswa/guru dicatat seperti pada wawancara awal.
