# 13 — Rancangan Konten RELAFUN dengan Model Rigorous Mathematical Thinking (RMT)

**Status: rancangan DISETUJUI pemilik (17 Nov 2026) dengan keputusan: RMT = model pembelajaran, CLT = prinsip desain
media; Misi Literasi hanya menilai relasi/fungsi/domain/kodomain/range; LM-002 memakai 3 pilihan diagram + alasan;
alasan tertulis (teks bebas) dinilai guru; `hint_count` ditambahkan ke CSV.** Konten lengkap **dipasang di `data/`**
(17 Nov 2026; ringkasan di [03 §7](03-KONTEN-DAN-BANK-SOAL.md)) dan lolos `tools/validate.html` (0 galat).
Tampilan halaman Materi/Kenali/Bedah/Latihan/Misi belum dibangun (roadmap Fase 2–4). Setelah disetujui, konten dimasukkan ke `data/` sesuai skema [03](03-KONTEN-DAN-BANK-SOAL.md)
dan [08](08-LITERASI-MATEMATIKA.md), lalu divalidasi dengan `js/math.js`.

## 0. Sumber Acuan

| Sumber | Dipakai untuk | Catatan |
|---|---|---|
| Definisi resmi [02 §5](02-DESAIN-PEMBELAJARAN.md) | Semua definisi & aturan konsep | Dokumen materi terpisah (buku/LKS) **belum dilampirkan** — lihat §10 |
| *Tabel Kisi-kisi soal* (Hitana Rifa Pranaja, 3A) | Indikator LR/LF/LE/LI, konteks, tahapan & skor | Soal LM-001–LM-004 dipakai **apa adanya** (aturan 13 CLAUDE.md) |
| Ringkasan *Rigorous Mathematical Thinking* (Kinard & Kozulin), Bab 1–6 | Model pembelajaran: alur aktivitas, mediasi, variasi soal | §1 |
| [03](03-KONTEN-DAN-BANK-SOAL.md), [08](08-LITERASI-MATEMATIKA.md), `data/misconceptions.json` | Skema JSON, kuota soal, bank konteks, miskonsepsi M01–M10 | Tidak diubah |

Semua kunci contoh di dokumen ini sudah dicek dengan `js/math.js` (25/25 cocok, §9).

## 1. Model RMT di RELAFUN

RMT dipakai sebagai **model pembelajaran** (alur aktivitas siswa). Prinsip *Cognitive Load Theory* di docs/02 §3
tetap dipakai sebagai **prinsip desain tampilan** (segmentasi, sinyal, fading, tanpa dekorasi). Keduanya saling
melengkapi: RMT menentukan *apa yang dipikirkan siswa*, CLT menjaga *beban tampilan tetap rendah*.

| Unsur RMT (ringkasan bab) | Wujud di RELAFUN |
|---|---|
| Konsep sehari-hari → konsep ilmiah (Bab 3, 5) | Setiap unit Materi dimulai dari situasi sehari-hari, lalu dibawa ke definisi resmi |
| Alat psikologis spesifik matematika: simbol, organizer grafis (tabel, bidang koordinat), rumus, bahasa matematika (Bab 1 §5) | Empat representasi yang selalu dihubungkan: **tabel → diagram panah → pasangan berurutan → diagram Cartesius**; notasi {…}, (x, y), n(A), f(x); **Daftar Periksa Ciri-ciri** dipakai sebagai alat berpikir |
| Siklus **Representasi → Manipulasi → Validasi** (Bab 6) | Alur layar Materi: menyajikan data → membandingkan contoh & non-contoh → cek pemahaman |
| Pengalaman Belajar Ter-mediasi (MLE): intensionalitas & resiprositas, transendensi, makna (Bab 4) | **Tujuan** singkat di awal (intensionalitas) · pertanyaan yang menuntut respons siswa (resiprositas) · "Di mana lagi aturan ini berlaku?" (transendensi) · "Mengapa ini penting?" (makna) |
| Fungsi kognitif **Input → Elaborasi → Output** (Bab 4) | Bedah Soal & Misi: Input = mengumpulkan data dengan tepat; Elaborasi = membandingkan dengan ciri & memilih konsep; Output = jawaban jelas dengan bahasa/simbol tepat, tanpa coba-coba |
| *Learning Activity*: analisis tugas, perencanaan tindakan, refleksi (Bab 3) | 5 langkah Bedah Soal: Diketahui/Ditanya (analisis) → Konsep + Alasan (perencanaan) → Penyelesaian → Kesimpulan + Refleksi |
| Asesmen dinamis "cake": petunjuk bertahap saat mengerjakan (Bab 3, LPAD Bab 4) | Hint 2–3 tingkat (dari umum ke khusus); hint 1 tidak pernah menyebut jawaban |
| Peta Kognitif: konten, modalitas, **operasi mental**, kompleksitas, abstraksi (Bab 4) | Dasar variasi soal (§3): setiap soal diberi label operasi mental & representasi, sehingga variasi melatih kemampuan berbeda, bukan hanya mengganti angka/nama |
| Metakognisi & regulasi diri (Bab 5) | Satu pertanyaan **refleksi** singkat (tidak dinilai) di akhir unit, Bedah Soal, dan Misi |

## 2. Struktur File Konten (dipisah per kategori)

```
data/
├── materi/U0.json … U7.json   # satu file per unit (layar, contoh, ilustrasi, cek pemahaman MT-xxx)
├── kenali-konsep.json          # KK-xxx
├── bedah-soal.json             # BS-xxx
├── latihan.json                # LT-xxx (level mudah/sedang/sulit)
├── misi-literasi.json          # LM-xxx (LM-001–LM-004 dari kisi-kisi + misi baru)
├── glossary.json               # istilah baku
├── misconceptions.json         # M01–M10 (sudah ada, tidak diubah)
└── concepts.json               # (sudah ada)
```
Perbedaan dari docs/04: materi dipecah per unit (`materi/U3.json`), bukan satu `units.json`, agar satu unit bisa
direvisi tanpa menyentuh unit lain. Skema soal docs/03 tetap; usulan **tambahan opsional** per soal:

```json
"rmt": { "fase": "elaborasi", "operasi": "membandingkan", "transendensi": "Kota → provinsi juga fungsi." },
"refleksi": "Ciri mana yang kamu periksa lebih dulu?"
```
`fase` ∈ input | elaborasi | output · `operasi` ∈ §3. Tambahan ini tidak memengaruhi penilaian atau format CSV (docs/09).

## 3. Cara Membuat Variasi (bukan ganti angka/nama)

Setiap soal baru dipilih dari kombinasi **operasi mental × konsep × representasi × konteks**:

| Operasi mental (Peta Kognitif) | Contoh tugas | Fase |
|---|---|---|
| Mengidentifikasi | Menandai data penting; menentukan domain/kodomain | Input |
| Mengurutkan/menyandi | Menulis pasangan berurutan dengan arah benar (M06) | Input |
| Merepresentasikan ulang | Tabel → diagram panah → pasangan → Cartesius | Elaborasi |
| Membandingkan | Dua kondisi/aturan, mana yang fungsi (pola LM-001) | Elaborasi |
| Mengklasifikasi | Relasi / fungsi / korespondensi satu-satu + alasan | Elaborasi |
| Menerapkan aturan | y = 2x, f(x) = 3x + 2 → pasangan, daerah hasil (pola LM-003) | Elaborasi |
| Penalaran hipotetis | "Jika data X ditambah, apakah masih fungsi?" | Elaborasi |
| Memilah informasi | Mengabaikan data pengecoh; menyebut data yang kurang | Input/Output |
| Mengevaluasi klaim | Setuju/tidak dengan pernyataan orang lain (pola LM-004) | Output |
| Menilai kewajaran | "Apakah hasilnya masuk akal dalam cerita?" | Output |

**Tingkat kesulitan bertahap** (berlaku untuk Latihan, Kenali Konsep, Bedah Soal):

| Level | Ciri | Fase RMT dominan |
|---|---|---|
| Mudah | 1 operasi, 1 representasi, data langsung, konteks sangat dekat | Input |
| Sedang | 2 operasi atau berpindah representasi; membandingkan beberapa relasi | Elaborasi |
| Sulit | Konteks baru, data pengecoh/kurang, mengevaluasi klaim, banyak langkah | Output (transfer) |

Kuota mengikuti docs/03 §5 (cek unit 24, Kenali Konsep 30, Bedah Soal 10, Latihan 45, Misi Literasi 12).

## 4. Contoh A — Materi (Unit U3 "Fungsi: Relasi yang Istimewa")

**Tujuan (intensionalitas):** Kamu bisa memeriksa apakah suatu relasi merupakan fungsi.

| Layar | Tahap RMT | Isi |
|---|---|---|
| 1 | Konsep sehari-hari · makna | Bu Dewi, petugas UKS, mencatat golongan darah empat siswa. Setiap orang hanya punya satu golongan darah. **Bolehkah dua siswa punya golongan darah yang sama?** (Ya/Tidak — tanpa skor, untuk memancing respons) |
| 2 | Representasi (alat psikologis) | Satu data, tiga bentuk. **Tabel:** Rani–A, Bayu–O, Sari–A, Tono–B. **Diagram panah:** P = {Rani, Bayu, Sari, Tono} (biru) ke G = {A, B, AB, O} (oranye). **Pasangan berurutan:** {(Rani, A), (Bayu, O), (Sari, A), (Tono, B)} |
| 3 | Konsep ilmiah | Definisi resmi fungsi (docs/02 §5). **Ingat!** Setiap anggota P punya tepat satu pasangan di G. Domain = P, kodomain = G, daerah hasil = {A, B, O}. AB ada di kodomain, tetapi bukan daerah hasil |
| 4 | Manipulasi (contoh vs non-contoh) | ✔ Data lengkap di atas → **fungsi** (Rani dan Sari sama-sama A itu boleh). ✘ Tono belum diperiksa → Tono tanpa pasangan → **bukan fungsi** (M04). ✘ Catatan **hobi**: Rani suka menari *dan* menyanyi → Rani punya dua pasangan → **relasi, bukan fungsi** |
| 5 | Validasi | Cek pemahaman MT-301 dan MT-302 (di bawah) |
| 6 | Transendensi · refleksi | Hubungan lain yang juga fungsi: siswa → tanggal lahir, kota → provinsi. **Refleksi:** "Saat memeriksa fungsi, anggota himpunan mana yang kamu periksa satu per satu?" (domain) |

**Ilustrasi:** diagram panah digambar oleh `js/diagram.js` dari data; label nama langsung di samping titik;
pada layar 4 panah yang melanggar (Rani → dua hobi) disorot, dan Tono diberi tanda "tanpa panah".

**Cek pemahaman**
- **MT-301** (benar/salah, mudah): "Golongan darah AB tidak punya pasangan, jadi relasi ini bukan fungsi."
  Kunci: **Salah** · pengecoh "Benar" = M02 · Pembahasan: syarat fungsi hanya untuk setiap anggota domain P;
  anggota kodomain boleh tidak punya pasangan.
- **MT-302** (isian himpunan, mudah): "Tentukan daerah hasilnya." Kunci: **{A, B, O}** · memilih {A, B, AB, O} = M05 ·
  Pembahasan: daerah hasil hanya anggota G yang mendapat panah.
- Hint MT-302: (1) "Lihat ujung panahnya." (2) "Golongan darah mana yang tidak menerima panah?"

**Kesalahan konsep yang dibahas di unit ini:** M01 (dua siswa sama-sama A), M02 (AB tanpa pasangan), M03 (catatan
hobi tetap relasi, tetapi bukan fungsi), M04 (Tono tanpa pasangan), M05 (kodomain ≠ daerah hasil).

**Rencana pemantik unit lain** (konteks sehari-hari → konsep): U0 daftar anggota kelompok piket · U1 "teman
sebangku dari" · U2 jadwal ekstrakurikuler dalam 3 bentuk · U4 nomor absen vs makanan favorit · U5 biaya cetak
foto (aturan f(x)) · U6 memilih seragam lomba · U7 siswa ↔ NIS.

## 5. Contoh B — Kenali Konsep

**KK-a "Urutan Lari Estafet"** · level sedang · cerita · fase Input→Elaborasi · operasi: mengklasifikasi
> Tim estafet kelas 8B punya empat pelari: Ayu, Beni, Cika, dan Dodi. Pelatih memberi setiap pelari tepat satu
> urutan lari: Ayu ke-3, Beni ke-1, Cika ke-4, dan Dodi ke-2. Tidak ada urutan yang dipakai dua kali.

1. **Identifikasi informasi** (tandai): "setiap pelari", "tepat satu urutan", "tidak ada urutan yang dipakai dua kali", 4 pelari, urutan 1–4.
2. **Pilih konsep:** relasi saja / fungsi, bukan korespondensi satu-satu / **korespondensi satu-satu** ✔
3. **Pilih alasan:**
   - ✔ Setiap pelari punya tepat satu urutan, dan setiap urutan dimiliki tepat satu pelari.
   - ✘ "Karena banyak pelari = banyak urutan." → M07 (n(A) = n(B) hanya syarat perlu, belum cukup).
   - ✘ "Karena setiap pelari punya urutan." → baru membuktikan setiap pelari punya pasangan, belum memeriksa kodomain.
4. **Hint:** (1) Periksa pelari satu per satu. (2) Sekarang periksa urutan 1 sampai 4: berapa pelari di tiap urutan?
5. **Pembahasan:** Setiap pelari punya tepat satu urutan, jadi relasinya fungsi. Setiap urutan juga dimiliki tepat satu
   pelari, jadi fungsi ini korespondensi satu-satu.
- Transendensi: nomor kursi ujian dan NIS juga sering berupa korespondensi satu-satu.

**KK-b "Titik pada Diagram Cartesius"** · level sulit · Cartesius · operasi: mengklasifikasi (M09)
> Relasi dari A = {1, 2, 3} ke B = {2, 3, 4, 5} digambar sebagai titik (1, 2), (2, 3), (2, 5), dan (3, 4).

Kunci: **relasi, bukan fungsi**. Alasan ✔: "x = 2 punya dua pasangan, yaitu 3 dan 5." Pengecoh: "Fungsi, karena
setiap x punya titik" (M09) · "Bukan fungsi, karena y = 5 hanya punya satu titik" (alasan tidak relevan).
Hint: (1) Tarik garis tegak di setiap x. (2) Berapa titik yang dilalui garis di x = 2?

## 6. Contoh C — Bedah Soal

**BS-a "Harga di Koperasi Sekolah"** · level sedang · cerita dengan data pengecoh
> Koperasi sekolah menjual lima barang: pensil Rp2.000, penghapus Rp2.000, penggaris Rp3.000, buku tulis Rp5.000,
> dan pulpen Rp3.000. Harga barang di koperasi selalu salah satu dari Rp1.000, Rp2.000, Rp3.000, Rp4.000, atau
> Rp5.000. Koperasi buka pukul 07.00.
> Apakah relasi "harga dari" setiap barang ke daftar harga merupakan fungsi? Apakah korespondensi satu-satu?
> Tentukan daerah hasilnya.

| Langkah | RMT · Literasi | Tugas siswa | Kunci |
|---|---|---|---|
| 1. Identifikasi soal | Input · LF | Tandai data penting; tulis apa yang ditanya | 5 barang dan harganya; daftar 5 harga. Ditanya: fungsi? korespondensi satu-satu? daerah hasil? **"Buka pukul 07.00" tidak dipakai** |
| 2. Karakteristik | Elaborasi · LR | Setiap barang punya tepat satu harga? Setiap harga dipakai tepat satu kali? | Ya · Tidak (Rp2.000 dan Rp3.000 dipakai dua kali; Rp1.000 dan Rp4.000 tidak dipakai) |
| 3. Penentuan konsep | Elaborasi · LR | Pilih konsep | **Fungsi, bukan korespondensi satu-satu** |
| 4. Alasan | Elaborasi · LR | Pilih alasan | ✔ "Setiap barang tepat satu harga, tetapi ada harga yang dipakai dua barang." ✘ "n(A) = n(B) = 5, jadi pasti korespondensi satu-satu" (M07) ✘ "Bukan fungsi karena Rp1.000 tidak punya pasangan" (M02) |
| 5. Penyelesaian | Elaborasi · LE | Tentukan daerah hasil | **{Rp2.000, Rp3.000, Rp5.000}** (memilih semua 5 harga = M05) |
| 6. Kesimpulan & kewajaran | Output · LI | Apa arti Rp1.000 dan Rp4.000 tidak masuk daerah hasil? | Saat ini tidak ada barang dengan harga itu; relasinya tetap fungsi |
| Refleksi (tidak dinilai) | Metakognisi | "Data mana yang tadi kamu abaikan, dan mengapa?" | — |

**Pembahasan:** Setiap barang punya tepat satu harga, jadi relasinya fungsi. Banyak barang dan banyak harga sama-sama 5,
tetapi Rp2.000 dipasangkan dua kali dan Rp1.000 tidak punya pasangan. Jadi fungsi ini bukan korespondensi satu-satu.
Daerah hasilnya {Rp2.000, Rp3.000, Rp5.000}.
**Fading:** level mudah semua langkah dipandu · sedang langkah 1–2 dipandu · sulit hanya langkah 3 dipandu.

## 7. Contoh D — Latihan Bertingkat (tiga kemampuan berbeda)

| ID | Level · operasi | Soal | Kunci & pembahasan |
|---|---|---|---|
| LT-a | Mudah · mengurutkan (Input) | Relasi "lahir pada bulan" dari himpunan siswa ke himpunan bulan. Rina lahir bulan Maret. Pasangan berurutan yang benar adalah … (Rina, Maret) / (Maret, Rina) / {Rina, Maret} | **(Rina, Maret)**. Anggota domain ditulis di depan. (Maret, Rina) = M06. {Rina, Maret} adalah himpunan, bukan pasangan berurutan (urutannya tidak tercatat) |
| LT-b | Sedang · membandingkan 3 relasi (Elaborasi) | Pilih **semua** yang fungsi: (i) Bandung → Jawa Barat, Bogor → Jawa Barat, Semarang → Jawa Tengah, ke {Jawa Barat, Jawa Tengah, Jawa Timur}; (ii) Ika → Pramuka, Joni → PMR, Joni → Paskibra, Kiki → Pramuka; (iii) Senin → soto, Selasa → bakso, Rabu → nasi goreng | **(i) dan (iii)**. (i) fungsi walau Jawa Timur tanpa pasangan (jebakan M02) dan dua kota satu provinsi (M01). (ii) bukan fungsi: Joni dua pasangan. (iii) korespondensi satu-satu, dan **setiap korespondensi satu-satu juga fungsi** |
| LT-c | Sulit · memilah informasi + menerapkan rumus (Output) | Kelas 8A, 8B, dan 8C masing-masing harus memilih tepat satu lomba: futsal atau tarik tambang. Setiap kelas berisi 32 siswa. Berapa banyak kemungkinan susunan pilihan lomba ketiga kelas? | **8**. Domain = kelas, n(A) = 3; kodomain = lomba, n(B) = 2. Banyak pemetaan = n(B)^n(A) = 2^3 = 8. Pengecoh: 9 = 3^2 (M08), 6 = 3 × 2, 96 = 32 × 3 (memakai data pengecoh). **Validasi:** daftar 8 susunan bisa ditulis (F-F-F, F-F-T, …) |

Hint LT-c: (1) Siapa yang memilih, dan apa yang dipilih? (2) Setiap kelas punya berapa pilihan? (3) Kalikan pilihan setiap kelas.

## 8. Contoh E — Misi Literasi

**LM-005 "Bus Jemputan Sekolah"** · indikator **LF** · konteks sekolah · level sedang · skor maks. 6
> Sekolah punya tiga bus jemputan: Bus 1, Bus 2, dan Bus 3. Bu Wati mencatat data pagi ini:
>
> | Siswa | Bus | Jam tiba |
> |---|---|---|
> | Lala | Bus 2 | 06.15 |
> | Miko | Bus 1 | 06.20 |
> | Nana | Bus 2 | 06.15 |
> | Oki | Bus 1 | 06.20 |
>
> Bu Wati ingin memodelkan hubungan setiap siswa dengan bus yang dinaikinya. Susun model matematikanya,
> lalu tentukan apakah hubungan itu fungsi.

| Tahap | Skor | Tugas | Kunci | Miskonsepsi |
|---|---|---|---|---|
| 1 | 1 | Pilih informasi yang dibutuhkan | Nama siswa dan nomor bus (jam tiba tidak dipakai) | — |
| 2 | 1 | Tentukan himpunan A dan B | A = {Lala, Miko, Nana, Oki}; B = {Bus 1, Bus 2, Bus 3} — **Bus 3 tetap masuk** karena termasuk bus sekolah | M05 |
| 3 | 1 | Susun pasangan berurutan | {(Lala, Bus 2), (Miko, Bus 1), (Nana, Bus 2), (Oki, Bus 1)} | M06 (urutan terbalik) |
| 4 | 1 | Pilih diagram panah yang sesuai (3 pilihan) | Diagram dengan Bus 3 tanpa panah | — |
| 5 | 1 | Periksa: setiap siswa naik tepat satu bus? Apa arti Bus 3 tanpa panah? | Ya; Bus 3 tidak dinaiki siapa pun pagi ini | M02 |
| 6 | 1 | Kesimpulan + alasan (teks bebas opsional) | Fungsi, karena setiap siswa punya tepat satu bus, walaupun dua siswa satu bus dan Bus 3 kosong | M01, M02 |

**Beda dengan LM-002** (bukan sekadar ganti nama): ada data pengecoh (jam tiba), kodomain harus disusun dari konteks
(Bus 3 tidak muncul di tabel), dan tahap 4 memakai pilihan diagram sehingga bisa dinilai otomatis.
**Jawaban model:** Hubungan siswa dengan bus merupakan fungsi. Setiap siswa naik tepat satu bus. Dua siswa boleh naik
bus yang sama, dan Bus 3 boleh tidak punya pasangan. Daerah hasilnya {Bus 1, Bus 2}.
**Refleksi:** "Bagaimana kamu tahu data jam tiba tidak dibutuhkan?"

**Rencana 8 misi baru** (12 misi bersama LM-001–LM-004; angka final diverifikasi saat disusun):

| ID | Indikator | Judul | Kemampuan yang berbeda dari soal kisi-kisi |
|---|---|---|---|
| LM-005 | LF | Bus Jemputan Sekolah | Memilah data pengecoh; kodomain dari konteks (contoh di atas) |
| LM-006 | LF | Tinggi Tanaman per Minggu (konteks ilmiah) | Membaca **diagram Cartesius** → pasangan berurutan → memeriksa fungsi (M09) |
| LM-007 | LR | Tiga Aturan Pembagian Loker | Membandingkan **tiga** aturan dan memilih yang memenuhi syarat "tiap siswa satu loker, tiap loker satu siswa" |
| LM-008 | LR | Jadwal Piket Kelas | **Penalaran hipotetis**: "Jika Dimas juga piket hari Jumat, apakah masih fungsi?" |
| LM-009 | LE | Biaya Cetak Foto | Menerapkan aturan **f(x) = 3x + 2** (ribu rupiah), menghitung daerah hasil, dan mencari x jika f(x) diketahui (M10) |
| LM-010 | LE | Data Suhu Pagi | Dari tabel → domain, kodomain, daerah hasil; menilai apakah daerah hasil = kodomain |
| LM-011 | LI | Klaim Nomor Undian | Menilai klaim "pasti korespondensi satu-satu karena jumlahnya sama" (M07) |
| LM-012 | LI | Pekerjaan Teman tentang Daerah Hasil | Menilai kewajaran jawaban teman yang menyamakan daerah hasil dengan kodomain (M05) |

Semua misi baru mengikuti pola kisi-kisi: 4–6 tahap, jumlah skor 6, skor parsial, tahap terakhir berupa kesimpulan + alasan.

## 9. Verifikasi Kunci

Skrip pemeriksa menjalankan `js/math.js` (`classifyRelation`, `functionViolations`, `rangeOf`, `countMappings`,
`isOneToOneCorrespondence`, `pairsFromRule`) untuk semua contoh di dokumen ini dan LM-001–LM-004:
**25 dari 25 kunci cocok.** Saat konten lengkap disusun, pemeriksaan yang sama dijalankan lewat `tools/validate.html`.

## 10. Hal yang Perlu Dikonfirmasi

1. **Dokumen materi resmi** (mis. buku siswa/LKS kelas VIII) belum dilampirkan. Sementara ini acuan definisi = docs/02 §5.
   Istilah yang perlu dicek dengan buku: *peta/prapeta*, *daerah kawan*, penulisan *range* vs *daerah hasil*.
2. **RMT dan CLT:** apakah RMT menjadi model pembelajaran, dan CLT tetap menjadi prinsip desain media? Bila ya,
   docs/02 §1 (Landasan) perlu diperbarui.
3. **Cakupan Misi Literasi:** kisi-kisi hanya mencakup relasi, fungsi, domain, kodomain, dan daerah hasil.
   Apakah banyak pemetaan, korespondensi satu-satu, dan nilai fungsi (LM-009) boleh dipakai di Misi Literasi,
   atau cukup di Materi & Latihan?
4. **Tahap "menggambar diagram panah"** (LM-002 tahap 4) butuh fitur `arrow-build` (P1, belum ada). Usulan sementara:
   siswa memilih diagram yang benar dari 3 pilihan. Apakah ini sesuai maksud kisi-kisi?
5. **Penilaian teks bebas** (alasan di tahap kesimpulan): tetap dinilai guru/peneliti (docs/08), atau cukup pilihan alasan?
6. **Pencatatan jumlah hint** (data asesmen dinamis RMT) mengubah format ekspor CSV (kontrak docs/09). Perlu persetujuan
   terpisah bila ingin dipakai dalam penelitian.
