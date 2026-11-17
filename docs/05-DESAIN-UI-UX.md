# 05 — Desain UI/UX

## 1. Prinsip Desain

Diturunkan dari DS03 ("simpel biar tertarik") dan EL03 ("papan tulis tidak membingungkan karena
tidak ada gambar aneh"):

1. **Satu tugas per layar.** Tidak ada sidebar penuh menu di HP.
2. **Visual fungsional.** Setiap gambar menjelaskan konsep; tidak ada ilustrasi dekoratif.
3. **Warna bermakna dan konsisten.** Warna dipakai sebagai kode, selalu dibarengi label/ikon.
4. **Kemajuan terlihat.** Bilah progres di setiap unit/sesi.
5. **Sentuhan ramah jempol.** Tombol utama di bagian bawah layar, target ≥ 44 px.

## 2. Design Tokens

| Token | Nilai (saran) | Makna |
|---|---|---|
| `--c-primary` | `#2F6FEB` | Tombol utama, tautan |
| `--c-domain` | `#1E66F5` (biru) | Anggota domain / himpunan A |
| `--c-codomain` | `#E07A1F` (oranye) | Anggota kodomain / himpunan B |
| `--c-range` | `#E07A1F` isi penuh | Anggota daerah hasil (kodomain yang terkena panah) |
| `--c-correct` | `#1F9D55` + ikon ✔ | Jawaban benar |
| `--c-wrong` | `#D64545` + ikon ✘ | Jawaban salah |
| `--c-hint` | `#F2B705` + ikon 💡 | Petunjuk |
| `--c-bg` / `--c-surface` | `#F7F8FA` / `#FFFFFF` | Latar & kartu (mode gelap disediakan) |
| `--font-body` | system-ui, 16–18 px | Teks |
| `--font-math` | ui-monospace / serif italic untuk variabel | Notasi matematika |
| `--radius` | 12 px | Sudut kartu/tombol |
| `--space-*` | 4/8/12/16/24/32 px | Skala jarak |

Biru–oranye dipilih karena tetap bisa dibedakan oleh penderita buta warna merah-hijau.

## 3. Navigasi

- **HP:** bilah navigasi bawah 5 ikon + label: Beranda · Materi · Kenali · Bedah · Progres.
  (Latihan dan Misi Literasi diakses dari kartu di Beranda dan dari akhir unit.)
- **Desktop (≥ 900 px):** navigasi pindah ke kiri; konten maksimal 720 px di tengah.

## 4. Wireframe (teks)

### 4.0 Masuk (layar pertama)
```
┌──────────────────────────────┐
│          [ikon RELAFUN]      │
│   Selamat datang di RELAFUN  │
│ Belajar relasi dan fungsi …  │
│ ┌──────────────────────────┐ │
│ │ Nama panggilan           │ │
│ │ [ Contoh: Nadia        ] │ │
│ │ 🔒 Namamu hanya disimpan │ │
│ │ di perangkat ini.        │ │
│ │ [        Masuk ▶       ] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```
Tanpa navigasi bawah. Kesalahan ditampilkan di bawah kolom (bukan pop-up), mis. "Nama belum diisi."

### 4.1 Beranda
```
┌──────────────────────────────┐
│ RELAFUN           ⚙          │
│ Hai, Nadia 👋                 │
│ ┌──────────────────────────┐ │
│ │ Lanjutkan: U4 Fungsi atau│ │
│ │ Bukan?   ▓▓▓▓░░ 3/5      │ │
│ │           [ Lanjut ▶ ]   │ │
│ └──────────────────────────┘ │
│ ┌─────────┐ ┌─────────┐      │
│ │ 📘Materi│ │🔍Kenali │      │
│ └─────────┘ └─────────┘      │
│ ┌─────────┐ ┌─────────┐      │
│ │🧩 Bedah │ │📝Latihan│      │
│ └─────────┘ └─────────┘      │
│ Perlu diulang: Syarat fungsi │
├──────────────────────────────┤
│ 🏠  📘  🔍  🧩  📊            │
└──────────────────────────────┘
```

### 4.2 Kenali Konsep
```
┌──────────────────────────────┐
│ ← Kenali Konsep     4/10 ▓▓░ │
│ Relasi dari A ke B ini       │
│ termasuk apa?                │
│   A          B               │
│  (1)───────►(a)              │
│  (2)──────╯ (b)              │
│  (3)───────►(c)              │
│                              │
│ ○ Relasi, bukan fungsi       │
│ ● Fungsi, bukan kor. 1-1     │
│ ○ Korespondensi satu-satu    │
│                              │
│ Mengapa? (pilih alasan)      │
│ ☐ Setiap anggota A punya     │
│   tepat satu pasangan        │
│ ☐ Ada anggota B tanpa pasang │
│                              │
│ [💡 Ciri-ciri]   [ Periksa ] │
└──────────────────────────────┘
```

### 4.3 Bedah Soal
```
┌──────────────────────────────┐
│ ← Bedah Soal                 │
│ ①Diketahui ②Ciri ③Konsep ④Jawab
│ ●━━━━━━○━━━━━━○━━━━━━○       │
│ Di kelas 8A, [setiap siswa]  │
│ mendapat [satu nomor kursi]. │
│ Ada [30 siswa] dan [32 kursi]│
│ (ketuk untuk menandai)       │
│ [Aa Sederhanakan kalimat]    │
│                              │
│              [ Langkah 2 ▶ ] │
└──────────────────────────────┘
```

### 4.3b Misi Literasi
```
┌──────────────────────────────┐
│ ← Misi: Kode Rak Buku  [LI]  │
│ Tahap 3/6     Skor: 2/6      │
│ ┌──────────────────────────┐ │
│ │ Siswa   │ Kode rak       │ │
│ │ Arman   │ R1             │ │
│ │ Bella   │ R2             │ │
│ │ Candra  │ R1             │ │
│ │ Dinda   │ R3             │ │
│ └──────────────────────────┘ │
│ Berapa pasangan yang dimiliki│
│ setiap siswa?                │
│ ○ Tepat satu                 │
│ ○ Ada yang dua               │
│ ○ Ada yang tidak punya       │
│ [💡 Petunjuk]    [ Periksa ] │
└──────────────────────────────┘
```
Akhir misi: tabel rubrik (Tahap · Skor kamu · Skor maks.) + contoh jawaban ideal.
Label indikator ([LR]/[LF]/[LE]/[LI]) memakai nama ramah siswa:
LR = "Bernalar", LF = "Memodelkan", LE = "Menghitung", LI = "Menafsirkan".

### 4.4 Panel Umpan Balik (muncul dari bawah)
```
┌──────────────────────────────┐
│ ✘ Belum tepat                │
│ Dua anggota A BOLEH menuju   │
│ anggota B yang sama.         │
│ Yang dilarang: satu anggota  │
│ A punya dua pasangan.        │
│ [ Lihat di diagram ]         │
│ [ Pelajari U4 ]  [ Coba lagi]│
└──────────────────────────────┘
```

### 4.5 Progres
```
┌──────────────────────────────┐
│ Progres Belajarku            │
│ Unit selesai: 4/8            │
│ Konsep            Akurasi    │
│ Pengertian relasi ▓▓▓▓▓ 90% ✔│
│ Syarat fungsi     ▓▓▓░░ 60%  │
│ Domain & range    ▓▓░░░ 40% !│
│ Korespondensi 1-1 ░░░░░  —   │
│ Literasi   Bernalar    ▓▓▓▓░ │
│            Memodelkan  ▓▓▓░░ │
│            Menghitung  ▓▓▓▓▓ │
│            Menafsirkan ▓▓░░░ │
│ Kesalahan tersering:         │
│ "Kodomain dikira range" (M05)│
│ [ Ulangi U3 ▶ ]              │
└──────────────────────────────┘
```

### 4.6 AI Pembahas Soal (`#/pembahas`, F14 — docs/11)
Memakai kartu, chip, dan tombol yang sama dengan halaman lain. Satu tugas per layar: ketik soal → pilih mode → baca hasil.
```
┌──────────────────────────────┐
│ ← Pembahas Soal              │
│ 🔒 Jangan tulis nama/alamat… │
│ Soal [ kotak teks 5 baris ]  │
│ Contoh soal: [chip][chip]    │
│ Pilih cara belajar           │
│ [✔ Mode Petunjuk ][Pembahasan]│
│ [ Bahas soal ▶ ]             │
├──────────────────────────────┤
│ ⚠️ Jawaban AI bisa keliru…    │  ← hanya Mode Pembahasan
│ 1. Identifikasi soal         │
│    Diketahui • …  Ditanya …  │
│ 2. Konsep yang tepat         │  ← Petunjuk: "Temukan konsepnya" (pertanyaan penuntun)
│ 3. Alasan memilih konsep     │  ← Petunjuk: "Arah langkah"
│ 4. Langkah penyelesaian      │  ← tidak ada di Mode Petunjuk
│ 5. Kesimpulan                │  ← tidak ada di Mode Petunjuk
└──────────────────────────────┘
```
Notasi matematika ditulis dengan simbol Unicode (→, ∈, ⊆, n(A)); pangkat `3^2` tampil sebagai 3² (tanpa library).
Tutor AI (`#/asisten`) memakai gelembung percakapan yang sama sejak versi "Tanya Asisten".

## 5. Komponen Utama

| Komponen | Perilaku |
|---|---|
| `ArrowDiagram` | SVG dua oval (A biru, B oranye), panah dari data. Mode interaktif: ketuk anggota A → panahnya disorot. Mode highlight dari umpan balik |
| `CartesianDiagram` | Grid dengan titik; label sumbu = nama himpunan; opsi garis vertikal yang bisa digeser (uji garis vertikal) |
| `PairsView` | Menampilkan {(1, a), (2, a), …} dengan warna anggota sesuai himpunan |
| `RepresentationToggle` | Tab Panah / Pasangan / Cartesius untuk relasi yang sama |
| `ChoiceList` | Opsi radio/checkbox ukuran besar |
| `HintButton` | Membuka hint berikutnya; mencatat `hintsUsed` |
| `FeedbackSheet` | Panel bawah: status, pesan miskonsepsi, aksi |
| `StepProgress` | Indikator 5 langkah Bedah Soal (Diketahui · Ciri · Konsep · Jawab · Simpulkan) |
| `HighlightText` | Teks soal yang frasanya bisa diketuk untuk ditandai |
| `ProgressBar` | Bilah kemajuan unit/sesi |

## 6. Aksesibilitas

- Kontras minimal 4,5 : 1; status benar/salah memakai ikon + teks, bukan warna saja.
- Diagram SVG diberi `role="img"` dan `aria-label` berisi deskripsi teks pasangan
  (mis. "1 dipasangkan ke a, 2 ke a, 3 ke b").
- Semua kontrol dapat diakses keyboard di desktop; fokus terlihat jelas.
- Pengaturan ukuran huruf (100% / 115% / 130%).
- Hormati `prefers-reduced-motion`; animasi maksimal 200 ms.

## 7. Microcopy

| Situasi | Teks |
|---|---|
| Benar | "Tepat! Setiap siswa punya tepat satu NIS." |
| Salah | "Belum tepat. Coba cek lagi: …" (bukan "Salah!") |
| Hint | "Petunjuk 1 dari 3" |
| Selesai sesi | "Sesi selesai! Kamu benar 4 dari 5 soal." |
| Kosong progres | "Belum ada data. Yuk mulai dari Materi U0!" |
