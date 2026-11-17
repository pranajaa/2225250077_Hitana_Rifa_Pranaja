# 01 — Analisis Kebutuhan (dari Hasil Wawancara)

Dokumen ini menerjemahkan temuan wawancara menjadi kebutuhan aplikasi. Setiap kebutuhan
diberi ID (`KB-xx`) dan dirujuk di PRD, sehingga setiap fitur bisa ditelusuri balik ke data.

## 1. Ringkasan Wawancara

| Item | Isi |
|---|---|
| Responden | S01, kelas IX (mempelajari materi di kelas VIII semester 2) |
| Tanggal | 9 November 2026, durasi 60 menit |
| Materi | Himpunan — Relasi dan Fungsi |
| Artefak | Buku catatan siswa, contoh soal, hasil latihan |
| Kerangka analisis | Cognitive Load Theory (Sweller): IL = *intrinsic load*, EL = *extraneous load*, GL = *germane load*, K = konteks, DS = kebutuhan desain |

> Catatan metodologis: data berasal dari **satu responden**. Kebutuhan di bawah bersifat
> hipotesis awal dan perlu dikonfirmasi pada uji coba (lihat [06-RENCANA-PENGUJIAN.md](06-RENCANA-PENGUJIAN.md)).

## 2. Temuan per Kategori Beban Kognitif

### 2.1 Konteks Belajar (K)
| Kode | Temuan | Implikasi |
|---|---|---|
| K01 | Materi dipelajari di kelas VIII semester 2 | Sasaran utama kelas VIII; juga berguna untuk remedial/review kelas IX |
| K02 | Belajar dari penjelasan guru di papan tulis lalu menyalin | Siswa terbiasa belajar pasif; aplikasi perlu mendorong interaksi aktif |
| K03 | Ragu menentukan relasi atau fungsi bila soal tidak menyebutkannya langsung | **Masalah inti** — mengenali konsep dari soal yang implisit |

### 2.2 Intrinsic Load (IL) — kompleksitas materi itu sendiri
| Kode | Temuan | Implikasi |
|---|---|---|
| IL01 | Sulit membedakan relasi vs fungsi, terutama soal cerita yang perintahnya tersirat | Latihan klasifikasi bertahap dari soal eksplisit → tersirat |
| IL02 | Perlu mengecek ulang angka-angka yang dipakai | Langkah "identifikasi informasi" eksplisit; highlight data penting |
| IL03 | Harus benar-benar paham perbedaan relasi dan fungsi | Contoh **dan non-contoh** berdampingan; aturan inti yang konsisten |
| IL04 | Paling sulit bila ada konsep baru | Segmentasi materi; satu konsep baru per unit; prasyarat jelas |
| IL05 | Sulit menerapkan konsep pada soal yang berbeda dari contoh | Variasi konteks soal; latihan transfer; *fading* bantuan |

### 2.3 Extraneous Load (EL) — beban akibat cara penyajian
| Kode | Temuan | Implikasi |
|---|---|---|
| EL01 | Bahasa/penjelasan soal membingungkan walau konsep sudah paham | Bahasa soal sederhana, kalimat pendek, istilah konsisten |
| EL02 | Penjelasan guru kurang, harus cari dari buku paket/internet | Aplikasi menjadi sumber mandiri yang lengkap |
| EL03 | Papan tulis tidak membingungkan karena tidak ada gambar "aneh" | **Visual harus fungsional**, bukan dekoratif; hindari ornamen berlebih |
| EL04 | Sering miskonsepsi karena penjelasan tidak mendalam (waktu singkat) | Penjelasan mendalam yang bisa diakses ulang kapan saja; penanganan miskonsepsi |
| EL05 | Soal cerita: bentuk konsep dan bahasanya kadang kurang jelas | Fitur **Bedah Soal** — memecah soal cerita jadi bagian-bagian |

### 2.4 Germane Load (GL) — upaya membangun skema
| Kode | Temuan | Implikasi |
|---|---|---|
| GL02 | Mengecek jawaban lewat diskusi atau AI, mencocokkan jawaban dan cara | Umpan balik **langkah demi langkah**, bukan hanya kunci jawaban |
| GL04 | Menjelaskan ke teman membuat lebih paham, tergantung lawan bicara | Prompt **penjelasan diri** (*self-explanation*): "Kenapa ini fungsi?" |
| GL05 | Terbantu bila ada contoh soal yang mirip | **Worked example** berpasangan dengan soal latihan yang serupa |

### 2.5 Kebutuhan Desain (DS) — harapan siswa
| Kode | Temuan | Implikasi |
|---|---|---|
| DS01 | Ingin ada contoh gambar, petunjuk, latihan soal, penjelasan mendalam | Fitur materi visual + petunjuk bertingkat + latihan + pembahasan |
| DS02 | Tekankan pemahaman konsep | Fokus pada "mengapa", bukan hafalan prosedur |
| DS03 | Tampilan simpel dan menarik agar tidak malas membuka | UI minimalis, sesi singkat, rasa kemajuan yang terlihat |

## 3. Daftar Kebutuhan (Requirements)

| ID | Kebutuhan | Sumber |
|---|---|---|
| KB-01 | Siswa dapat menentukan apakah suatu situasi merupakan relasi, fungsi, atau korespondensi satu-satu, termasuk saat soal tidak menyebutnya secara langsung | K03, IL01, IL03 |
| KB-02 | Setiap konsep disajikan dengan contoh **dan** non-contoh yang ditampilkan berdampingan | IL03, EL04 |
| KB-03 | Soal cerita dapat dipecah menjadi langkah: diketahui → karakteristik → konsep → penyelesaian | EL05, IL01, IL02 |
| KB-04 | Data penting dalam soal (himpunan, anggota, angka) dapat disorot/ditandai | IL02 |
| KB-05 | Materi dibagi menjadi unit-unit kecil, satu konsep baru per unit, dengan prasyarat yang jelas | IL04 |
| KB-06 | Latihan disusun bertingkat (mudah → sedang → sulit) dengan variasi konteks | IL05, GL05 |
| KB-07 | Umpan balik menjelaskan **mengapa** jawaban salah (berbasis miskonsepsi), bukan hanya benar/salah | GL02, EL04 |
| KB-08 | Tersedia petunjuk bertingkat (hint 1 → 2 → 3) sebelum pembahasan penuh | DS01, GL02 |
| KB-09 | Setiap tipe soal didahului contoh yang dikerjakan (*worked example*) yang mirip | GL05 |
| KB-10 | Siswa diminta memilih/menyusun alasan atas jawabannya (*self-explanation*) | GL04, DS02 |
| KB-11 | Bahasa sederhana, kalimat pendek, istilah konsisten di seluruh aplikasi | EL01, EL05 |
| KB-12 | Visual (diagram panah, Cartesius, pasangan berurutan) bersifat fungsional, tanpa dekorasi berlebih | EL03 |
| KB-13 | Tampilan sederhana, sesi belajar singkat (≤ 10 menit per unit) | DS03 |
| KB-14 | Progres belajar dan konsep yang masih lemah ditampilkan | DS03, tujuan 5 di draft |
| KB-15 | Dapat diakses di web dan smartphone Android, termasuk saat koneksi terbatas | Konteks platform |
| KB-16 | Siswa dapat belajar mandiri tanpa bergantung pada guru | EL02, EL04 |
| KB-17 | Siswa berlatih menerjemahkan situasi/data nyata menjadi model relasi atau fungsi, menyelesaikan, lalu menafsirkan hasilnya (literasi matematika: LR, LF, LE, LI) | K03, IL01, IL05, EL05; kisi-kisi Mathematical Literacy |
| KB-18 | Penilaian soal literasi per tahapan dengan skor parsial, agar proses berpikir terukur, bukan hanya jawaban akhir | GL02; pedoman penskoran kisi-kisi |
| KB-19 | Data hasil belajar dapat diekspor dan dianalisis secara statistik (Python) untuk mengukur perkembangan literasi dan efektivitas aplikasi | Kebutuhan penelitian |

## 4. Miskonsepsi yang Harus Ditangani

Daftar ini menjadi dasar pengecoh (*distractor*) soal dan pesan umpan balik.

| ID | Miskonsepsi | Contoh |
|---|---|---|
| M01 | "Fungsi tidak boleh ada dua anggota domain yang menuju anggota kodomain yang sama" | Mengira {(1,a),(2,a)} bukan fungsi |
| M02 | "Semua anggota kodomain harus punya pasangan" | Mengira fungsi tidak sah bila ada anggota kodomain yang tidak dipasangkan |
| M03 | "Relasi dan fungsi itu sama" / setiap relasi adalah fungsi | Menganggap relasi "faktor dari" otomatis fungsi |
| M04 | Mengabaikan anggota domain yang tidak punya pasangan | Menganggap fungsi walau ada anggota A tanpa panah |
| M05 | Tertukar kodomain dan daerah hasil (range) | Menuliskan seluruh B sebagai range |
| M06 | Tertukar arah relasi (A ke B vs B ke A) | Membaca pasangan (x, y) terbalik |
| M07 | Mengira korespondensi satu-satu sama dengan fungsi biasa | Tidak mengecek n(A) = n(B) dan setiap anggota B tepat satu pasangan |
| M08 | Salah menghitung banyak pemetaan (menggunakan a×b atau a^b terbalik) | Menulis n(A)^n(B) alih-alih n(B)^n(A) |
| M09 | Pada grafik Cartesius, tidak mengenali satu x dengan dua y sebagai bukan fungsi | Uji garis vertikal belum dipahami |
| M10 | Salah substitusi pada f(x) (tanda negatif, urutan operasi) | f(−2) untuk f(x)=2x−3 dihitung 1 |

## 5. Profil Pengguna (Persona)

**Persona utama — "Nadia", 13–14 tahun, kelas VIII**
- Belajar dari catatan papan tulis; punya HP Android (RAM terbatas, kuota terbatas).
- Paham definisi saat dijelaskan, tetapi bingung ketika soal cerita tidak menyebut "relasi" atau "fungsi".
- Mengecek jawaban dengan teman atau AI. Mudah bosan dengan tampilan penuh teks.
- **Kebutuhan:** cara cepat dan jelas mengenali konsep; umpan balik yang menjelaskan kesalahan.

**Persona sekunder — Guru matematika SMP**
- Ingin media yang bisa diberikan sebagai tugas mandiri / remedial.
- (Di luar cakupan MVP: dasbor guru. Lihat PRD bagian *Out of Scope*.)
