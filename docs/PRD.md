# PRD — RELAFUN (Relasi dan Fungsi)

| Item | Isi |
|---|---|
| Versi dokumen | 0.1 (draft) |
| Tanggal | 13 November 2026 |
| Penyusun | Hitana Rifa Pranaja — S1 Pendidikan Matematika |
| Status | Perencanaan, belum ada kode |

Dokumen terkait:
[01-ANALISIS-KEBUTUHAN](01-ANALISIS-KEBUTUHAN.md) ·
[02-DESAIN-PEMBELAJARAN](02-DESAIN-PEMBELAJARAN.md) ·
[03-KONTEN-DAN-BANK-SOAL](03-KONTEN-DAN-BANK-SOAL.md) ·
[04-ARSITEKTUR-TEKNIS](04-ARSITEKTUR-TEKNIS.md) ·
[05-DESAIN-UI-UX](05-DESAIN-UI-UX.md) ·
[06-RENCANA-PENGUJIAN](06-RENCANA-PENGUJIAN.md) ·
[07-ROADMAP](07-ROADMAP.md) ·
[08-LITERASI-MATEMATIKA](08-LITERASI-MATEMATIKA.md) ·
[09-ANALISIS-DATA-PYTHON](09-ANALISIS-DATA-PYTHON.md)

---

## 1. Latar Belakang dan Masalah

Wawancara dengan siswa (S01) yang telah mempelajari relasi dan fungsi menunjukkan bahwa
kesulitan utama bukan pada menghitung, melainkan pada **menentukan konsep yang tepat** ketika
soal — terutama soal cerita — tidak menyebutkan secara langsung apakah yang diminta relasi atau
fungsi (K03, IL01). Kesulitan diperberat oleh bahasa soal yang kurang jelas (EL01, EL05) dan
penjelasan di kelas yang terbatas waktu sehingga memicu miskonsepsi (EL04).

**Pernyataan masalah:**
> Siswa SMP kelas VIII kesulitan mengenali karakteristik suatu permasalahan dan membedakan
> relasi dengan fungsi, sehingga tidak dapat memilih konsep dan langkah penyelesaian yang tepat.

## 2. Tujuan Produk

| No | Tujuan | Indikator keberhasilan (target uji coba) |
|---|---|---|
| T1 | Siswa memahami konsep dasar relasi dan fungsi | Skor post-test bagian konsep naik dibanding pre-test (N-gain ≥ 0,3 / kategori sedang) |
| T2 | Siswa mampu mengidentifikasi konsep pada suatu permasalahan | ≥ 70% siswa benar pada soal klasifikasi tersirat (level Sulit) |
| T3 | Siswa dapat membedakan relasi dan fungsi berdasarkan karakteristiknya | Frekuensi miskonsepsi M01–M04 menurun antara pre-test dan post-test |
| T4 | Latihan dilengkapi petunjuk dan pembahasan | 100% soal memiliki ≥ 2 hint dan pembahasan |
| T5 | Beban kognitif penyajian rendah | Skor *extraneous load* pada angket beban kognitif rendah; SUS ≥ 68 |
| T6 | Menumbuhkembangkan literasi matematika (LR, LF, LE, LI) | N-gain skor literasi ≥ 0,3 (total dan tiap indikator); dianalisis dengan Python |

## 3. Sasaran Pengguna

- **Utama:** siswa SMP kelas VIII (13–14 tahun), belajar mandiri atau ditugaskan guru.
- **Sekunder:** siswa kelas IX untuk review/remedial; guru sebagai pemberi tugas.
- Perangkat: smartphone Android (layar 360–412 px, RAM 2–4 GB) dan laptop/PC browser.
- Persona lengkap: [01-ANALISIS-KEBUTUHAN §5](01-ANALISIS-KEBUTUHAN.md#5-profil-pengguna-persona).

## 4. Cakupan Materi

1. Pengantar: himpunan & pasangan berurutan (prasyarat singkat)
2. Relasi — pengertian dan penyajian (diagram panah, himpunan pasangan berurutan, diagram Cartesius)
3. Fungsi (pemetaan) — syarat, domain, kodomain, daerah hasil (range)
4. Membedakan relasi dan fungsi (contoh & non-contoh)
5. Notasi dan nilai fungsi: f : x → …, f(x) = …
6. Banyak pemetaan yang mungkin: n(B)^n(A)
7. Korespondensi satu-satu dan banyaknya: n!

Detail per unit: [03-KONTEN-DAN-BANK-SOAL](03-KONTEN-DAN-BANK-SOAL.md).

## 5. Fitur

Prioritas: **P0** = wajib MVP, **P1** = penting setelah MVP, **P2** = opsional.

### F1. Materi Interaktif — P0
Materi dalam unit kecil (≤ 5 layar per unit). Setiap unit: apersepsi konteks → konsep inti →
contoh & non-contoh berdampingan → cek pemahaman singkat.
- Diagram panah interaktif: siswa dapat menyentuh anggota domain untuk melihat pasangannya.
- Toggle penyajian: diagram panah ⇄ pasangan berurutan ⇄ diagram Cartesius untuk relasi yang sama.
- Kotak "Ingat!" berisi aturan inti (maks. 2 kalimat).
- **Kriteria terima:** setiap konsep punya ≥ 1 contoh dan ≥ 1 non-contoh; setiap unit diakhiri ≥ 2 soal cek.
- Kebutuhan: KB-02, KB-05, KB-12, KB-16.

### F2. Kenali Konsep — P0 (fitur utama)
Siswa diberi situasi/soal, lalu memilih kategori: **Relasi (bukan fungsi) /
Fungsi (bukan korespondensi satu-satu) / Korespondensi satu-satu**, kemudian memilih **alasan**
dari daftar ciri-ciri. (P1: tambahan soal yang menanyakan domain, range, atau banyak pemetaan
agar siswa mengenali *pertanyaan* apa yang diminta soal, bukan hanya jenis relasinya.)
- Alur: baca situasi → pilih kategori → pilih alasan (*self-explanation*) → umpan balik.
- Bertahap: (a) diagram panah eksplisit → (b) pasangan berurutan → (c) tabel/grafik → (d) soal cerita tersirat.
- Umpan balik spesifik miskonsepsi (lihat M01–M10), menunjuk bagian diagram/soal yang relevan.
- Tombol "Lihat ciri-ciri" membuka daftar periksa:
  1. Apakah setiap anggota A punya pasangan? 2. Apakah tepat satu? 3. Apakah setiap anggota B dipasangkan tepat satu kali?
- **Kriteria terima:** jawaban kategori dan alasan dinilai terpisah; minimal 30 butir soal pada MVP.
- Kebutuhan: KB-01, KB-07, KB-10.

### F3. Bedah Soal — P0 (fitur utama)
Soal cerita dikerjakan secara terpandu dalam 5 langkah (scaffolding):
1. **Diketahui** — siswa menandai/menyorot informasi penting (himpunan, anggota, aturan, angka).
2. **Karakteristik** — menjawab pertanyaan ciri (setiap anggota punya pasangan? tepat satu?).
3. **Konsep** — memilih konsep yang digunakan.
4. **Penyelesaian** — memilih/menyusun langkah dan menjawab.
5. **Kesimpulan** — menafsirkan hasil ke konteks soal dan menilai kewajarannya.
- Kelima langkah dipetakan ke indikator literasi: Diketahui = LF, Karakteristik & Konsep = LR,
  Penyelesaian = LE, Kesimpulan = LI (lihat [08-LITERASI-MATEMATIKA](08-LITERASI-MATEMATIKA.md)).
- Langkah berikutnya terbuka setelah langkah sebelumnya benar atau setelah melihat pembahasan.
- *Fading*: makin tinggi level, makin sedikit langkah yang dipandu.
- Mode bahasa: tombol "Sederhanakan kalimat" menampilkan versi kalimat soal yang lebih pendek (EL01).
- **Kriteria terima:** minimal 10 soal cerita terpandu pada MVP; setiap langkah punya umpan balik.
- Kebutuhan: KB-03, KB-04, KB-11.

### F4. Latihan Bertingkat — P0
- **Mudah:** definisi & karakteristik (pilihan ganda, benar/salah).
- **Sedang:** identifikasi konsep dari diagram/pasangan berurutan/grafik; nilai fungsi.
- **Sulit:** soal cerita kontekstual, soal transfer (konteks baru), banyak pemetaan/korespondensi.
- Satu sesi = 5 soal. Sebelum sesi, tampil 1 *worked example* sejenis (dapat dilewati).
- Hint bertingkat: Hint 1 (arah berpikir) → Hint 2 (langkah) → Hint 3 (hampir jawaban) → Pembahasan.
- Level berikut terbuka bila skor level sebelumnya ≥ 60% (bisa dibuka manual — tidak mengunci siswa).
- Kebutuhan: KB-06, KB-08, KB-09.

### F5. Evaluasi dan Progres — P0
- Ringkasan per sesi: skor, soal yang salah, miskonsepsi yang terdeteksi, saran unit untuk diulang.
- Halaman Progres: status tiap unit (belum/sedang/kuasai), akurasi per konsep, "konsep yang perlu dipelajari lagi".
- Data tersimpan lokal di perangkat (tanpa akun pada MVP).
- Kebutuhan: KB-14.

### F6. Kuis Akhir (Pre-test/Post-test) & Ekspor Data — P1
- Instrumen 15–20 soal konsep + 4 butir literasi (skor maks. 24, sesuai kisi-kisi).
- Siswa mengisi **kode siswa anonim** (mis. S01) sebelum tes.
- Hasil diekspor ke **CSV** (format di [09-ANALISIS-DATA-PYTHON §2](09-ANALISIS-DATA-PYTHON.md#2-alur-data))
  untuk diolah dengan skrip Python.

### F7. Glosarium — P1
Istilah: himpunan, anggota, pasangan berurutan, relasi, fungsi, domain, kodomain, range, peta, prapeta, korespondensi satu-satu.

### F8. Mode Instal / Offline (PWA) — P0 ✔ dibangun
Aplikasi dibuka di browser dan dapat dipasang ke layar utama **Android maupun iPhone tanpa
Play Store/App Store**, lalu dipakai tanpa internet setelah dibuka sekali.
- Tombol "Pasang aplikasi" (Android/desktop), petunjuk Safari untuk iPhone, notifikasi versi baru, banner offline.
- Detail & cara rilis: [10-INSTALASI-DAN-RILIS](10-INSTALASI-DAN-RILIS.md).
Kebutuhan: KB-15.

### F9. Ekspor ke APK (Capacitor) — P2
Membungkus PWA menjadi APK bila diperlukan distribusi lewat file/Play Store.

### F10. Gamifikasi ringan — P2
Lencana penyelesaian unit dan *streak*. Tidak boleh mengganggu fokus (tanpa animasi berlebihan, EL03).

### F11. Misi Literasi — P0
Soal kontekstual multi-tahap untuk menumbuhkembangkan literasi matematika, mengikuti 4 indikator
kisi-kisi penyusun: **Mathematical Reasoning (LR), Formulating (LF), Employing (LE),
Interpreting & Evaluating (LI)**.
- Setiap misi 4–6 tahap, skor per tahap, maksimum 6; **skor parsial** tetap diberikan untuk tahap yang benar.
- Variasi: **Baca Data** (data dalam tabel/daftar → bentuk relasi) dan **Cek Klaim** (menilai pernyataan orang lain).
- Konteks pribadi, sekolah, sosial, ilmiah.
- Setelah misi selesai, siswa melihat rubrik dan contoh jawaban ideal.
- Halaman Progres menampilkan skor per indikator literasi.
- **Kriteria terima:** 12 misi (3 per indikator) pada MVP, termasuk 4 soal dari Tabel Kisi-kisi penyusun (LM-001–LM-004).
- Detail: [08-LITERASI-MATEMATIKA](08-LITERASI-MATEMATIKA.md). Kebutuhan: KB-17–KB-19.

### F13. Masuk Sederhana (nama panggilan) — P0 ✔ dibangun
Saat pertama membuka aplikasi, siswa mengisi **nama panggilan** saja (tanpa kata sandi, email, atau server).
- Nama 2–30 huruf; boleh spasi, titik, tanda petik, tanda hubung; angka ditolak dengan pesan yang jelas.
- Nama dan progres hanya disimpan di perangkat itu (`localStorage`), tidak dikirim ke internet,
  dan **tidak** ikut diekspor ke CSV penelitian (ekspor memakai kode siswa anonim).
- Semua halaman terkunci sampai nama diisi; setelah masuk, Beranda menyapa dengan nama.
- Progres → kartu profil: **Ubah nama** dan **Keluar**. Keluar menghapus nama **dan** progres di perangkat
  itu (dengan konfirmasi) — cocok untuk HP/laptop sekolah yang dipakai bergantian.
- Pengembangan lanjutan (di luar MVP): akun dengan server agar progres tersinkron antarperangkat.

### F14. Asisten AI (Google Gemini lewat server lokal) — P1 ◐ dibangun, menunggu uji dengan key asli
Bantuan AI untuk siswa yang sulit menentukan konsep yang tepat. Detail: [11-ASISTEN-AI](11-ASISTEN-AI.md).
Rancangan lama DeepSeek + Cloudflare dibatalkan (keputusan pemilik, 17 Nov 2026).
- **Tutor AI** (`#/asisten`): tanya-jawab tentang relasi dan fungsi, bisa pertanyaan lanjutan. ✔ dibangun.
- **AI Pembahas Soal** (`#/pembahas`): siswa mengetik soal; AI mengurai identifikasi → konsep → alasan → langkah →
  kesimpulan. **Mode Petunjuk** tanpa konsep/jawaban akhir; **Mode Pembahasan** lengkap dengan peringatan
  "Jawaban AI bisa keliru". ✔ dibangun.
- **Penjelasan tambahan** setelah jawaban kurang tepat (Kenali Konsep, Latihan) — dipasang bersama `quiz-engine.js`.
- **Bantu mengurai soal** di setiap tahap Bedah Soal — dipasang bersama view Bedah Soal; AI hanya memberi petunjuk,
  tidak memberi jawaban akhir.
- AI **tidak menilai** soal bank; kunci tetap dari data soal (konsisten dengan `math.js`). Jawaban akhir AI hanya
  untuk soal ketikan siswa di Mode Pembahasan.
- API key Gemini hanya di `server/.env` (server Node.js + Express di localhost), tidak pernah di aplikasi/repo.
  Tanpa Cloudflare dan tanpa layanan berbayar; versi GitHub Pages berjalan tanpa AI.
- Tutor ≤ ±5 kalimat (mode `salah`/`bedah` ≤ 3), ≤ 25 kata per kalimat, istilah baku, tanpa kata "Salah!"/"Gagal".
- Tidak ada definisi baru: istilah di luar docs/02 §5 (mis. fungsi injektif) dijawab jujur sebagai di luar materi.
- Tanpa nama/kode siswa; riwayat percakapan hanya di memori. Offline/server sibuk → pesan ramah, fitur lain tetap jalan.
- **Kriteria terima:** `npm test` & `tools/test.html` lulus; uji isi jawaban (docs/11 §7) sesuai definisi resmi.

### F12. Analisis Data Statistik (Python, di luar aplikasi) — P1
Skrip Python untuk peneliti/guru yang mengolah CSV ekspor aplikasi dan angket: analisis butir,
N-gain, uji normalitas, uji t/Wilcoxon, SUS, angket beban kognitif, skor literasi per indikator.
Detail: [09-ANALISIS-DATA-PYTHON](09-ANALISIS-DATA-PYTHON.md).

## 6. Alur Pengguna Utama

```
Masuk (isi nama panggilan — hanya sekali per perangkat)
  ▼
Beranda
  ├─ Lanjutkan belajar (unit terakhir)
  ├─ Materi ─► Pilih unit ─► Layar materi 1..n ─► Cek pemahaman ─► Ringkasan unit
  ├─ Kenali Konsep ─► Pilih tahap ─► Soal ─► Kategori ─► Alasan ─► Umpan balik ─► (ulang)
  ├─ Bedah Soal ─► Pilih soal ─► Diketahui ─► Karakteristik ─► Konsep ─► Penyelesaian ─► Pembahasan
  ├─ Latihan ─► Pilih level ─► Contoh soal ─► 5 soal (hint) ─► Hasil sesi
  ├─ Misi Literasi ─► Pilih misi ─► Tahap 1..n (skor per tahap) ─► Rubrik & jawaban ideal
  ├─ Progres ─► Rekap per konsep & per indikator literasi ─► Rekomendasi unit
  ├─ Tutor AI ─► Tulis/pilih pertanyaan ─► Jawaban singkat AI (server lokal + internet)
  └─ Pembahas Soal ─► Ketik soal ─► Pilih Petunjuk/Pembahasan ─► 5 langkah analisis
```

Urutan belajar yang disarankan: Materi → Kenali Konsep → Bedah Soal → Latihan → Misi Literasi → Progres.
Navigasi tetap bebas (siswa boleh langsung ke latihan).

## 7. Kebutuhan Non-Fungsional

| ID | Kebutuhan |
|---|---|
| NF-01 | Responsif: berfungsi baik pada lebar 360 px s.d. desktop; tanpa scroll horizontal |
| NF-02 | Ringan: total unduhan awal < 1,5 MB; waktu muat pertama < 3 detik di 4G |
| NF-03 | Offline setelah kunjungan pertama (service worker) |
| NF-04 | Tanpa server untuk akun/progres; "masuk" hanya dengan nama panggilan lokal (F13); data hanya di `localStorage` perangkat. **Pengecualian:** server lokal asisten AI (F14) yang hanya meneruskan teks pertanyaan/soal tanpa identitas ke Gemini |
| NF-05 | Aksesibilitas: kontras WCAG AA, target sentuh ≥ 44 px, ukuran huruf dasar ≥ 16 px, tidak bergantung warna saja |
| NF-06 | Bahasa Indonesia baku yang sederhana; kalimat soal ≤ 25 kata per kalimat |
| NF-07 | Konten (materi & soal) terpisah dari kode (file data), agar mudah direvisi tanpa ubah logika |
| NF-08 | Browser: Chrome Android ≥ 100, Chrome/Edge/Firefox desktop versi terbaru |
| NF-09 | Privasi: tidak mengumpulkan data pribadi; tidak ada analytics pihak ketiga; ekspor memakai kode siswa anonim; pertanyaan ke asisten AI (F14) tidak membawa nama/kode siswa |
| NF-10 | Pembagian bahasa: **JavaScript** untuk seluruh aplikasi & data umum; **Python** khusus pengolahan data statistik (skrip terpisah di `analysis/`) |

## 8. Di Luar Cakupan (Out of Scope) MVP

- Akun pengguna berbasis server (kata sandi/email), sinkronisasi antar perangkat.
  (Yang ada di MVP hanya *masuk sederhana* dengan nama panggilan lokal — F13.)
- Dasbor guru dan kelas daring.
- ~~Chatbot/AI generatif di dalam aplikasi.~~ → dipindah ke **F14 Asisten AI** (keputusan pemilik, 17 Nov 2026).
- Materi selain relasi dan fungsi (mis. fungsi linear/gradien, persamaan garis).
- Aplikasi iOS native.

## 9. Asumsi dan Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Temuan dari 1 responden belum representatif | Fitur tidak sesuai kebutuhan mayoritas | Uji coba kelompok kecil + angket sebelum uji lapangan |
| Konten matematis salah/ambigu | Memunculkan miskonsepsi baru | Validasi ahli materi; setiap soal punya kunci + alasan |
| Siswa menebak tanpa berpikir | Data progres tidak valid | Penilaian alasan terpisah; hint tidak langsung memberi jawaban |
| Data `localStorage` terhapus | Progres hilang | Fitur ekspor/impor progres (P1) |
| Waktu pengembangan terbatas | MVP tidak selesai | Prioritas P0 ketat; konten MVP minimal, ditambah bertahap |

## 10. Metrik Keberhasilan

- **Efektivitas:** N-gain pre-test → post-test; penurunan frekuensi miskonsepsi.
- **Beban kognitif:** angket beban kognitif (IL/EL/GL) — target EL rendah, GL tinggi.
- **Kepraktisan:** System Usability Scale (SUS) ≥ 68; angket respons siswa ≥ kategori "baik".
- **Kevalidan:** validasi ahli materi dan ahli media ≥ kategori "valid".
- **Literasi matematika:** skor total dan per indikator (LR, LF, LE, LI) pre-test vs post-test.
- Semua metrik statistik dihitung dengan skrip Python ([09](09-ANALISIS-DATA-PYTHON.md)).

## 11. Definisi Selesai (Definition of Done) MVP

- [ ] F1–F5, F8, dan F11 berjalan di Chrome Android dan desktop.
- [ ] 8 unit materi (U0–U7), ≥ 30 soal Kenali Konsep, ≥ 10 soal Bedah Soal, ≥ 45 soal Latihan (15 per level), 12 Misi Literasi.
- [ ] Semua soal memiliki kunci, ≥ 2 hint, pembahasan, dan tag miskonsepsi pengecoh.
- [ ] Lolos daftar periksa uji fungsional & aksesibilitas di [06-RENCANA-PENGUJIAN](06-RENCANA-PENGUJIAN.md).
- [ ] Ter-deploy di hosting statis (mis. GitHub Pages) dan dapat dipasang sebagai PWA.
