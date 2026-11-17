# Konten Draf RELAFUN (model RMT)

**Status: SUDAH DIPASANG ke `data/` (17 Nov 2026)** dan lolos `tools/validate.html` (0 galat). Folder ini kini hanya
salinan sumber; **sumber yang berlaku adalah `data/`**. Folder ini tidak dibaca aplikasi dan tidak ikut rilis.
Menunggu persetujuan pemilik untuk dihapus. Perubahan setelah checkpoint `2926519`: KK-019 (cerita → diagram panah).
Rancangan: [docs/13-RANCANGAN-KONTEN-RMT.md](../docs/13-RANCANGAN-KONTEN-RMT.md).

## Isi

| File | Isi | Jumlah |
|---|---|---|
| `materi/U0.json` … `U7.json` | 6 layar per unit (konsep sehari-hari → representasi → konsep ilmiah → manipulasi → validasi → transendensi & refleksi) + cek pemahaman | 8 unit, 24 soal MT |
| `kenali-konsep.json` | Klasifikasi relasi / fungsi / korespondensi satu-satu + alasan | 30 (10/10/10) |
| `bedah-soal.json` | Soal cerita bertahap: identifikasi → karakteristik → konsep → alasan (teks bebas) → penyelesaian → kesimpulan → refleksi | 10 (3/4/3) |
| `latihan.json` | Latihan bertingkat U0–U7 | 45 (15/15/15) |
| `misi-literasi.json` | LM-001–LM-004 (kisi-kisi, teks asli) + LM-005–LM-012 | 12 (3 per LR/LF/LE/LI) |
| `glossary.json` | Istilah terverifikasi docs/02, istilah perlu verifikasi, istilah yang tidak dipakai | — |

## Label sumber (memisahkan yang sudah dan belum terverifikasi)

| Label | Arti | Jumlah |
|---|---|---|
| `kisi-kisi` | Soal & rubrik dari Tabel Kisi-kisi penyusun | 4 misi |
| `docs02` | Semua istilah & aturan ada di docs/02 §5; kunci dicek `js/math.js` | 82 soal/misi + U1, U3, U4, U6, U7 |
| `perlu-verifikasi` | Memakai istilah/notasi di luar docs/02 §5 (himpunan, n(A), pasangan berurutan, cara penyajian, notasi f(x)) | 11 soal Latihan + U0, U2, U5 (9 soal MT) |

Semua file: `bukuDicek: false` — **belum ada konten yang dicocokkan dengan buku siswa/LKS.** Unit `perlu-verifikasi`
tidak memuat definisi karangan (`definisi: null`) — hanya contoh pemakaian notasi.

Soal `perlu-verifikasi`: LT-001, LT-002, LT-004, LT-011, LT-012, LT-016, LT-021, LT-022, LT-023, LT-035, LT-039,
MT-001–MT-003, MT-201–MT-203, MT-501–MT-503.

## Hasil validasi (17 Nov 2026)

Validator (Node, memakai `js/math.js`) memeriksa 121 soal/misi:
- **167 kunci dihitung ulang dengan `js/math.js` — semua cocok.** 35 kunci berupa pernyataan prinsip; dasarnya dicatat
  di field `cek.dasar` (docs/02 §5).
- 334 pengecoh — semuanya bertag miskonsepsi M01–M10.
- Hint 2–3 per soal, pembahasan ada, `stemSimple` untuk soal cerita, kalimat ≤ 25 kata (soal kisi-kisi dikecualikan
  karena teks asli penyusun), jumlah skor tahap misi = 6, Misi Literasi hanya menilai relasi/fungsi/domain/kodomain/range.
- Uji mutasi: 3 kunci sengaja disalahkan → ketiganya tertangkap.

## Konvensi
- `rmt.fase` ∈ input | elaborasi | output; `rmt.operasi` = operasi mental (docs/13 §3).
- Langkah/tahap alasan: `freeText: true`, `penilaian: "guru"`, `rubrikGuru`; pilihan alasan hanya bantuan.
- `cek` = cara validator memeriksa kunci; `kind: "manual"` disertai `dasar`.
- `refleksi` = pertanyaan metakognisi, tidak dinilai.
