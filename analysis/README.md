# Analisis Data Statistik RELAFUN (Python)

Folder ini mengolah **data statistik** penelitian: pre-test/post-test, analisis butir, literasi
matematika per indikator, miskonsepsi, SUS, dan angket beban kognitif.
Aplikasinya sendiri ditulis dalam JavaScript; penghubungnya adalah file **CSV ekspor**.
Penjelasan lengkap: [docs/09-ANALISIS-DATA-PYTHON.md](../docs/09-ANALISIS-DATA-PYTHON.md).

## 1. Persiapan (sekali saja)

Buka terminal di folder `analysis/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Setelah `activate`, perintah di bawah cukup ditulis `python ...`.
Tanpa `activate`, tulis `.venv\Scripts\python ...`.

## 2. Mencoba dengan data contoh

```bash
python scripts/00_buat_data_contoh.py   # 30 siswa SINTETIS → data/raw/contoh_*.csv
python scripts/01_bersihkan_data.py
python scripts/06_laporan.py            # → output/laporan.md + tabel CSV + grafik PNG
```

Laporan dari data contoh diberi tanda **PERHATIAN: DATA CONTOH**. Angkanya bukan hasil penelitian.

## 3. Memakai data asli

1. Hapus semua file `data/raw/contoh_*`.
2. Salin ke `data/raw/`:
   - file ekspor aplikasi: `relafun_hasil_<kode>_<tanggal>.csv` (satu atau banyak file)
   - `angket_sus.csv` — kolom: `kode_siswa, s1 … s10` (jawaban 1–5)
   - `angket_beban_kognitif.csv` — kolom: `kode_siswa, il1…, el1…, gl1…` (0–10)
3. Jalankan `01_bersihkan_data.py` lalu `06_laporan.py`.

Skrip per bagian bila hanya butuh satu analisis:

| Skrip | Isi |
|---|---|
| `02_analisis_butir.py` | Validitas (r hitung vs r tabel), reliabilitas Cronbach's alpha, tingkat kesukaran, daya beda |
| `03_efektivitas.py` | Deskriptif, N-gain (Hake), Shapiro–Wilk, paired t-test atau Wilcoxon, ukuran efek |
| `04_literasi.py` | Skor literasi per indikator LR/LF/LE/LI, N-gain per indikator, tahap tersulit, miskonsepsi |
| `05_angket.py` | Skor SUS, rata-rata IL/EL/GL |

## 4. Format CSV ekspor aplikasi

```
kode_siswa,sesi,qid,fitur,indikator,tahap,skor,skor_maks,benar,miskonsepsi,hint,waktu_ms,timestamp
```

- Satu baris = satu tahap jawaban. Soal biasa: `tahap = 1`, `skor_maks = 1`.
- `sesi`: `pretest`, `posttest`, atau `latihan`.
- `indikator`: `LR`/`LF`/`LE`/`LI` untuk butir literasi; kosong untuk butir konsep.
- Kontrak kolom ada di `relafun_stats/config.py`. Jika diubah, ubah juga `js/export.js`.

## 5. Pengujian

```bash
python -m pytest
```

Uji memakai data kecil yang hasilnya dihitung manual (mis. Cronbach's alpha = 18/19,
r tabel n = 30 = 0,361, SUS, N-gain), dan membandingkan uji t dengan hasil scipy.
Sebelum dipakai di laporan penelitian, sebaiknya cocokkan satu set data dengan SPSS/JASP/Excel.

## 6. Privasi

`data/raw`, `data/processed`, dan `output` tidak di-commit ke git (lihat `.gitignore`).
Gunakan kode siswa (S01, S02, …), bukan nama.
