# 03 — Konten Materi dan Spesifikasi Bank Soal

## 1. Daftar Unit Materi

| Unit | Judul | Isi pokok | TP | Prasyarat |
|---|---|---|---|---|
| U0 | Pemanasan: Himpunan & Pasangan Berurutan | Anggota himpunan, n(A), notasi {…}, pasangan berurutan (x, y) dan urutannya penting | — | — |
| U1 | Apa itu Relasi? | Pengertian relasi; contoh: "hobi", "faktor dari", "ibu kota dari" | TP1 | U0 |
| U2 | Tiga Cara Menyajikan Relasi | Diagram panah, himpunan pasangan berurutan, diagram Cartesius — satu relasi yang sama dalam 3 bentuk | TP1 | U1 |
| U3 | Fungsi: Relasi yang Istimewa | Syarat fungsi; domain, kodomain, range; peta & prapeta | TP2, TP4 | U2 |
| U4 | Fungsi atau Bukan? | Contoh & non-contoh di 3 bentuk penyajian; uji garis vertikal; miskonsepsi M01–M04 | TP3 | U3 |
| U5 | Notasi dan Nilai Fungsi | f : x → 2x + 1, f(x) = 2x + 1, menghitung f(a), tabel fungsi, mencari x bila f(x) diketahui | TP4, TP5 | U3 |
| U6 | Banyak Pemetaan | Pola dari kasus kecil (n(A)=1,2 …) → n(B)^n(A) | TP6 | U3 |
| U7 | Korespondensi Satu-satu | Syarat; n(A) = n(B); contoh negara–ibu kota, siswa–NIS; banyaknya n! | TP7 | U4 |

### Contoh rancangan isi U4 "Fungsi atau Bukan?"
- **Pemantik:** "Setiap siswa di kelasmu punya satu nomor absen. Apakah setiap siswa punya satu
  makanan favorit saja?"
- **Ingat!:** *Fungsi: setiap anggota A punya tepat satu pasangan di B.*
- **Contoh vs non-contoh** (A = {1, 2, 3}, B = {a, b, c}):
  - Fungsi ✔: {(1, a), (2, a), (3, b)} — dua anggota menuju `a` itu **boleh** (M01).
  - Bukan fungsi ✘: {(1, a), (1, b), (2, c), (3, c)} — 1 punya dua pasangan.
  - Bukan fungsi ✘: {(1, a), (2, b)} — 3 tidak punya pasangan (M04).
- **Cek pemahaman:** 3 diagram panah, siswa memilih mana yang fungsi + alasannya.

## 2. Tipe Soal

| Kode | Tipe | Dipakai di | Contoh |
|---|---|---|---|
| `mcq` | Pilihan ganda (1 jawaban) | Semua | "Manakah yang merupakan fungsi?" |
| `tf` | Benar/Salah | Latihan Mudah, cek unit | "Pada fungsi, setiap anggota kodomain harus punya pasangan." (Salah) |
| `classify` | Klasifikasi konsep + alasan | Kenali Konsep | Pilih: relasi / fungsi / korespondensi satu-satu, lalu alasan |
| `multi` | Pilih semua yang benar | Latihan Sedang | "Pilih semua diagram yang merupakan fungsi" |
| `numeric` | Isian angka | Nilai fungsi, banyak pemetaan | "Jika f(x)=3x−2, f(4) = …" |
| `set` | Isian himpunan (pilih anggota) | Domain/range | "Tentukan daerah hasil" (centang anggota) |
| `arrow-build` | Membuat diagram panah | P1 | "Buat relasi yang merupakan fungsi" |
| `guided` | Soal cerita bertahap (5 langkah) | Bedah Soal | Lihat §4 |
| `literacy` | Misi multi-tahap dengan skor per tahap | Misi Literasi | Lihat [08-LITERASI-MATEMATIKA §5](08-LITERASI-MATEMATIKA.md#5-contoh-data-misi-lm-004) |
| `pairs` | Menyusun pasangan berurutan | Misi Literasi, Bedah Soal | "Susun pasangan berurutannya" |
| `reason` | Memilih kesimpulan + alasan (opsional teks bebas) | Misi Literasi | "Setuju atau tidak? Mengapa?" |

## 3. Skema Data Soal (JSON)

```json
{
  "id": "KK-012",
  "feature": "kenali-konsep",
  "unit": "U4",
  "level": "sedang",
  "type": "classify",
  "concepts": ["fungsi", "syarat-fungsi"],
  "representation": "arrow",
  "stem": "Perhatikan diagram panah berikut. Relasi dari A ke B ini termasuk apa?",
  "stemSimple": "Lihat panahnya. Ini relasi biasa, fungsi, atau korespondensi satu-satu?",
  "visual": {
    "kind": "arrow",
    "A": ["1", "2", "3"],
    "B": ["a", "b", "c"],
    "pairs": [["1","a"], ["2","a"], ["3","b"]],
    "labelA": "A", "labelB": "B"
  },
  "options": [
    { "id": "relasi",  "text": "Relasi, tetapi bukan fungsi", "misconception": "M01" },
    { "id": "fungsi",  "text": "Fungsi, tetapi bukan korespondensi satu-satu" },
    { "id": "kss",     "text": "Korespondensi satu-satu", "misconception": "M07" }
  ],
  "answer": "fungsi",
  "reasons": [
    { "id": "r1", "text": "Setiap anggota A punya tepat satu pasangan di B", "correct": true },
    { "id": "r2", "text": "Ada dua anggota A yang menuju ke anggota B yang sama", "correct": false, "misconception": "M01" },
    { "id": "r3", "text": "Ada anggota B yang tidak punya pasangan", "correct": false, "misconception": "M02" }
  ],
  "hints": [
    "Cek anggota A satu per satu: berapa panah yang keluar dari masing-masing?",
    "Dari 1, 2, dan 3 masing-masing keluar tepat satu panah.",
    "Dua panah menuju a itu tidak melanggar syarat fungsi."
  ],
  "feedback": {
    "M01": "Dua anggota A boleh punya pasangan yang sama. Yang dilarang adalah SATU anggota A punya DUA pasangan.",
    "M07": "Belum korespondensi satu-satu: c tidak punya pasangan dan a dipasangkan dua kali."
  },
  "explanation": "Setiap anggota A (1, 2, 3) memiliki tepat satu pasangan, jadi relasi ini fungsi. Karena a dipasangkan dua kali dan c tidak dipasangkan, fungsi ini bukan korespondensi satu-satu.",
  "relatedUnit": "U4"
}
```

Aturan skema:
- `id` unik, format `<FITUR>-<nomor 3 digit>`: `MT` (cek materi), `KK` (Kenali Konsep), `BS` (Bedah Soal), `LT` (Latihan), `PT` (pre/post-test), `LM` (Misi Literasi).
- `level`: `mudah` | `sedang` | `sulit`.
- `representation`: `arrow` | `pairs` | `cartesian` | `table` | `story` | `formula`.
- Setiap pengecoh **wajib** punya `misconception` (M01–M10) atau `feedback` umum.
- `hints` minimal 2, maksimal 3, dan tidak boleh langsung menyebut jawaban pada hint 1.
- `stemSimple` wajib untuk `representation: "story"`.

## 4. Skema Soal Bedah Soal (`guided`)

```json
{
  "id": "BS-003",
  "feature": "bedah-soal",
  "level": "sulit",
  "type": "guided",
  "stem": "Di kelas 8A, setiap siswa mendapat satu nomor kursi. Ada 30 siswa dan 32 kursi bernomor 1 sampai 32. Dua kursi tidak ditempati.",
  "stemSimple": "30 siswa. 32 kursi. Setiap siswa duduk di satu kursi. 2 kursi kosong.",
  "highlights": ["setiap siswa", "satu nomor kursi", "30 siswa", "32 kursi"],
  "steps": [
    { "step": "diketahui", "prompt": "Tandai informasi penting pada soal.", "type": "highlight", "answer": ["setiap siswa", "satu nomor kursi", "30 siswa", "32 kursi"] },
    { "step": "karakteristik", "prompt": "Apakah setiap siswa punya tepat satu kursi?", "type": "tf", "answer": true },
    { "step": "karakteristik", "prompt": "Apakah setiap kursi ditempati tepat satu siswa?", "type": "tf", "answer": false },
    { "step": "konsep", "prompt": "Relasi 'menempati kursi' dari himpunan siswa ke himpunan kursi adalah …", "type": "mcq",
      "options": ["Bukan fungsi", "Fungsi, bukan korespondensi satu-satu", "Korespondensi satu-satu"], "answer": 1 },
    { "step": "penyelesaian", "prompt": "Berapa banyak anggota daerah hasil (range)?", "type": "numeric", "answer": 30 },
    { "step": "kesimpulan", "prompt": "Apa arti 32 − 30 = 2 dalam soal ini?", "type": "mcq",
      "options": ["Ada 2 kursi yang tidak menjadi daerah hasil", "Ada 2 siswa yang tidak mendapat kursi"], "answer": 0 }
  ],
  "fadeLevel": 1,
  "explanation": "Setiap siswa punya tepat satu kursi → fungsi. Ada 2 kursi kosong dan n(siswa) ≠ n(kursi) → bukan korespondensi satu-satu. Range = kursi yang ditempati = 30."
}
```

## 5. Kuota Bank Soal MVP

| Fitur | Mudah | Sedang | Sulit | Total |
|---|---|---|---|---|
| Cek pemahaman unit (U0–U7) | 16 | 8 | — | 24 |
| Kenali Konsep | 10 | 10 | 10 | 30 |
| Bedah Soal | 3 | 4 | 3 | 10 |
| Latihan Bertingkat | 15 | 15 | 15 | 45 |
| Misi Literasi (3 per indikator LR/LF/LE/LI) | 4 | 4 | 4 | 12 |
| Pre-test/Post-test (P1) | 5 | 7 | 6 | 18 + 4 butir literasi |

Sebaran representasi untuk Kenali Konsep: diagram panah 30%, pasangan berurutan 20%,
Cartesius/tabel 20%, soal cerita 30%.

## 6. Bank Konteks Soal Cerita

Gunakan konteks dekat dengan kehidupan siswa SMP dan pastikan jawabannya tidak ambigu:

| Konteks | Konsep yang cocok | Catatan |
|---|---|---|
| Siswa → NIS | Korespondensi satu-satu | Setiap siswa satu NIS, setiap NIS milik satu siswa |
| Siswa → golongan darah | Fungsi (bukan KSS) | Banyak siswa bisa bergolongan darah sama |
| Siswa → hobi | Relasi (bukan fungsi) | Satu siswa bisa punya beberapa hobi — **nyatakan eksplisit di soal** |
| Kota → provinsi | Fungsi | Setiap kota tepat di satu provinsi |
| Negara → ibu kota | Korespondensi satu-satu | Hindari negara dengan >1 ibu kota |
| Barang → harga | Fungsi | Barang berbeda boleh harga sama |
| Bilangan → "faktor dari" | Relasi | Contoh A={2,3,4}, B={4,6,8,9} |
| Siswa → nomor kursi | Fungsi / KSS bergantung jumlah | Variasi bagus untuk transfer (IL05) |

> Hindari konteks yang jawabannya bergantung pada asumsi dunia nyata yang tidak disebut di soal.
> Jika ada asumsi, **tuliskan** di soal (EL05).

## 7. Panduan Gaya Penulisan Soal

- Satu kalimat ≤ 25 kata; satu gagasan per kalimat.
- Sebut himpunan dengan huruf kapital (A, B, P, Q) dan anggota dengan huruf kecil/angka.
- Gunakan istilah baku konsisten: *domain*, *kodomain*, *daerah hasil*, *korespondensi satu-satu*
  (jangan berganti-ganti "range"/"jangkauan" tanpa menjelaskan sinonimnya di glosarium).
- Hindari kalimat negatif ganda ("manakah yang tidak bukan…").
- Pilihan jawaban sama panjang kira-kira; tidak ada pola letak kunci.
- Setiap soal ditinjau ulang dengan checklist: kunci benar · pengecoh bertag · hint bertahap ·
  pembahasan lengkap · bahasa sederhana.
