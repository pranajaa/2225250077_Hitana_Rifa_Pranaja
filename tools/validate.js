// Validator bank soal & konten RELAFUN — dijalankan di browser lewat tools/validate.html.
// Memeriksa kunci jawaban dengan js/math.js (aturan 4 CLAUDE.md) dan aturan konten (aturan 3, 6, 13; docs/03, docs/08).
// Modul ini tanpa impor Node, sehingga juga bisa dipakai uji (tools/tests.js).
import * as M from '../js/math.js';

// Kuota & sebaran docs/03 §5 (Kenali Konsep: panah 30%, pasangan 20%, Cartesius/tabel 20%, cerita 30%).
export const KUOTA = {
  kenali: { total: 30, level: { mudah: 10, sedang: 10, sulit: 10 }, representasi: { arrow: 9, pairs: 6, story: 9 }, cartesianTable: 6 },
  bedah: { total: 10, level: { mudah: 3, sedang: 4, sulit: 3 } },
  latihan: { total: 45, level: { mudah: 15, sedang: 15, sulit: 15 } },
  misi: { total: 12, indikator: { LR: 3, LF: 3, LE: 3, LI: 3 } },
  materi: { unit: 8, soal: 24, level: { mudah: 16, sedang: 8 } },
};
const SUMBER = new Set(['docs02', 'kisi-kisi', 'perlu-verifikasi']);
const TAHAP_RMT = ['konsep-sehari-hari', 'representasi', 'konsep-ilmiah', 'manipulasi', 'validasi', 'transendensi'];
const LANGKAH_BS = ['identifikasi', 'konsep', 'alasan', 'penyelesaian', 'kesimpulan'];
// BS-008 membandingkan dua rencana: langkah konsep (dua kali) sekaligus menjadi penyelesaian.
const BS_TANPA_PENYELESAIAN = new Set(['BS-008']);
const CAKUPAN_MISI = new Set(['relasi', 'fungsi']); // indikator kisi-kisi (keputusan pemilik 17 Nov 2026)
const MVALID = new Set(Array.from({ length: 10 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`));

const KONSEP = { relasi: 'relasi', fungsi: 'fungsi', 'korespondensi-satu-satu': 'kss', 'bukan-relasi': 'bukan-relasi' };
const klas = (m) => KONSEP[M.classifyRelation(m.A, m.B, m.pairs)];
const allA1 = (m) => [...M.outDegrees(m.A, m.pairs).values()].every((c) => c === 1);
const allA = (m) => [...M.outDegrees(m.A, m.pairs).values()].every((c) => c >= 1);
const allB1 = (m) => [...M.inDegrees(m.B, m.pairs).values()].every((c) => c === 1);
const pelanggaran = (m) => { const v = M.functionViolations(m.A, m.pairs); return [...v.noPair, ...v.manyPairs]; };
const rule = (koef) => (x) => M.evaluatePolynomial(koef, x);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sameSet = (a, b) => eq([...a].map(String).sort(), [...b].map(String).sort());
const hitung = (arr, key) => arr.reduce((o, x) => ({ ...o, [x[key]]: (o[x[key]] ?? 0) + 1 }), {});

/** Kalimat dipisah pada . ? ! yang diikuti spasi dan huruf kapital/angka/kutip/kurung. */
export function sentenceLengths(text) {
  if (typeof text !== 'string') return [];
  return text.split(/(?<=[.?!])\s+(?=[A-Z0-9"(])/).map((k) => ({ text: k, words: k.trim().split(/\s+/).filter(Boolean).length }));
}

/**
 * Memeriksa seluruh konten. Tidak melempar; mengembalikan laporan.
 * @param {{ kenali, bedah, latihan, misi, units: object[], unitIds: string[], glossary }} data
 * @returns {{ errors: string[], warnings: string[], stats: object, counts: object }}
 */
export function validateContent(data) {
  const errors = [];
  const warnings = [];
  const stats = { soal: 0, kunciOtomatis: 0, kunciManual: 0, pengecoh: 0, pengecohTanpaTag: 0, perluVerifikasi: [] };
  const ids = new Set();
  const err = (id, msg) => errors.push(`${id}: ${msg}`);

  const cekM = (id, m) => { if (m != null && !MVALID.has(m)) err(id, `tag miskonsepsi tidak dikenal: ${m}`); };
  const cekKalimat = (id, teks, label) => {
    for (const k of sentenceLengths(teks)) if (k.words > 25) warnings.push(`${id}: ${label} ${k.words} kata — "${k.text.slice(0, 60)}…"`);
  };
  const daftarId = (id) => { if (ids.has(id)) err(id, 'ID ganda'); ids.add(id); };
  const cekSumber = (id, sumber) => {
    if (!SUMBER.has(sumber)) err(id, `label sumber tidak sah: ${sumber}`);
    if (sumber === 'perlu-verifikasi') stats.perluVerifikasi.push(id);
  };
  const cekHints = (id, it) => {
    if (!Array.isArray(it.hints) || it.hints.length < 2 || it.hints.length > 3) err(id, `hint harus 2–3, ada ${it.hints?.length ?? 0}`);
    if (!it.explanation && !it.modelAnswer) err(id, 'pembahasan kosong');
    for (const h of it.hints ?? []) cekKalimat(id, h, 'hint');
    cekKalimat(id, it.explanation, 'pembahasan');
  };
  const cekOpsi = (id, options, answer) => {
    const benar = Array.isArray(answer) ? answer : [answer];
    options.forEach((o, i) => {
      cekKalimat(id, o.text, 'opsi');
      if (benar.includes(i)) { if (o.m) err(id, `opsi kunci ${i} diberi tag ${o.m}`); return; }
      stats.pengecoh += 1;
      if (!o.m) { stats.pengecohTanpaTag += 1; if (!o.feedback) err(id, `pengecoh ${i} tanpa tag dan tanpa feedback`); }
      cekM(id, o.m);
    });
  };

  function cekKunci(id, it) {
    const c = it.cek;
    if (!c) { err(id, 'tidak ada spesifikasi cek'); return; }
    const a = it.answer;
    let ok = true;
    switch (c.kind) {
      case 'manual': if (!c.dasar) err(id, 'kunci manual tanpa dasar'); stats.kunciManual += 1; return;
      case 'banyakAnggota': ok = a === new Set(c.set).size; break;
      case 'pasangan':
        if (!it.visual) { stats.kunciManual += 1; return; }
        ok = sameSet(it.visual.pairs.map(String), c.pairs.map(String)); break;
      case 'domain': ok = sameSet(a, c.model.A); break;
      case 'daerahHasil': ok = M.isFunction(c.model.A, c.model.B, c.model.pairs) && sameSet(a, M.rangeOf(c.model.pairs, c.model.B)); break;
      case 'tfFungsi': { const f = M.isFunction(c.model.A, c.model.B, c.model.pairs); ok = a === (c.pernyataanBenarJika === 'bukan fungsi' ? !f : f); break; }
      case 'nilaiFungsi':
        ok = a === M.evaluatePolynomial(c.koef, c.x) && !Object.keys(it.salahUmum ?? {}).some((w) => Number(w) === a); break;
      case 'banyakPemetaan': {
        const v = M.countMappings(c.nA, c.nB);
        ok = it.type === 'mcq' ? v === c.opsiJawaban && Number(it.options[a].text) === v : a === v; break;
      }
      case 'banyakKss': ok = a === M.countOneToOneCorrespondences(c.n); break;
      case 'pemetaanBukanKss': ok = a === M.countMappings(c.n, c.n) - M.factorial(c.n); break;
      case 'cariX': ok = M.evaluatePolynomial(c.koef, a) === c.y; break;
      case 'pilihFungsi': ok = c.opsiPairs.every((p, i) => M.isFunction(c.A, c.B, p) === (i === a)); break;
      case 'pilihBukanFungsi': ok = c.opsiPairs.every((p, i) => !M.isFunction(c.A, c.B, p) === (i === a)); break;
      case 'pilihKss': ok = c.opsiPairs.every((p, i) => M.isOneToOneCorrespondence(c.A, c.B, p) === (i === a)); break;
      case 'pilihBukanRelasi': ok = c.opsiPairs.every((p, i) => !M.isRelation(c.A, c.B, p) === (i === a)); break;
      case 'multiFungsi':
        ok = sameSet(a, c.models.map((m, i) => (M.isFunction(m.A, m.B, m.pairs) ? i : null)).filter((x) => x !== null)); break;
      case 'tambahPasangan': ok = c.opsiTambahan.every((p, i) => M.isFunction(c.model.A, c.model.B, [...c.model.pairs, p]) === (i === a)); break;
      case 'klasifikasi': ok = klas(c.model) === c.jawaban; break;
      case 'daerahHasilAturan': {
        const pairs = M.pairsFromRule(c.A, rule(c.koef));
        ok = M.isFunction(c.A, c.B, pairs) && sameSet(a, M.rangeOf(pairs, c.B)); break;
      }
      case 'pasanganAturan': {
        const f = { faktor: (x, y) => y % x === 0, kurangDari: (x, y) => x < y }[c.aturan];
        const pairs = c.A.flatMap((x) => c.B.filter((y) => f(x, y)).map((y) => [x, y]));
        ok = sameSet(pairs.map(String), c.pairs.map(String)); break;
      }
      case 'pernyataan': {
        const m = c.model;
        const nilai = { fungsi: M.isFunction(m.A, m.B, m.pairs), kss: M.isOneToOneCorrespondence(m.A, m.B, m.pairs) };
        const truth = c.klaim.map((k) => {
          if (k in nilai) return nilai[k];
          const [nama, isi] = k.split('=');
          return nama === 'daerahHasil' ? sameSet(isi.split(','), M.rangeOf(m.pairs, m.B)) : sameSet(isi.split(','), m.B);
        });
        ok = sameSet(a, truth.map((t, i) => (t ? i : null)).filter((x) => x !== null)); break;
      }
      case 'domainKodomain': ok = a === 0 && c.model.A.length > 0 && M.isRelation(c.model.A, c.model.B, c.model.pairs); break;
      case 'domainKodomainDaerahHasil':
        ok = M.isFunction(c.model.A, c.model.B, c.model.pairs) && sameSet(c.daerahHasil, M.rangeOf(c.model.pairs, c.model.B)); break;
      case 'lengkapiKss': ok = c.opsi.every((b, i) => M.isOneToOneCorrespondence(c.A, c.B, [...c.pairs, [c.A[c.pairs.length], b]]) === (i === a)); break;
      default: err(id, `jenis cek tidak dikenal: ${c.kind}`); return;
    }
    stats.kunciOtomatis += 1;
    if (!ok) err(id, `KUNCI TIDAK COCOK dengan math.js (cek ${c.kind})`);
  }

  function cekSoalBiasa(it, sumberUnit) {
    const id = it.id;
    daftarId(id); stats.soal += 1;
    if (!['mudah', 'sedang', 'sulit'].includes(it.level)) err(id, 'level tidak sah');
    cekSumber(id, it.sumber ?? sumberUnit);
    cekKalimat(id, it.stem, 'stem');
    cekHints(id, it);
    if (it.options) cekOpsi(id, it.options, it.answer);
    if (it.type === 'tf') { stats.pengecoh += 1; if (!it.salahM) err(id, 'benar/salah tanpa tag untuk jawaban keliru'); cekM(id, it.salahM); }
    for (const m of Object.values(it.salahUmum ?? {})) cekM(id, m);
    for (const m of Object.values(it.m ?? {})) cekM(id, m);
    cekKunci(id, it);
  }

  // ---------- Kenali Konsep ----------
  const OPSI = data.kenali.opsiKonsep.map((o) => o.id);
  for (const it of data.kenali.items) {
    const id = it.id; daftarId(id); stats.soal += 1; cekSumber(id, it.sumber);
    const model = it.model ?? it.visual;
    stats.kunciOtomatis += 1;
    const hasil = klas(model);
    if (hasil !== it.answer) err(id, `KUNCI TIDAK COCOK: math.js=${hasil}, kunci=${it.answer}`);
    if (it.visual && it.model && it.visual.kind !== 'table' && !eq(it.visual.pairs, it.model.pairs)) err(id, 'visual ≠ model');
    if (!eq(Object.keys(it.pengecoh).sort(), OPSI.filter((o) => o !== it.answer).sort())) err(id, 'pengecoh tidak lengkap');
    for (const p of Object.values(it.pengecoh)) { stats.pengecoh += 1; if (!p.m) stats.pengecohTanpaTag += 1; cekM(id, p.m); cekKalimat(id, p.feedback, 'feedback'); }
    if (it.reasons.filter((r) => r.correct).length !== 1) err(id, 'alasan benar harus tepat 1');
    for (const r of it.reasons.filter((x) => !x.correct)) { stats.pengecoh += 1; if (!r.m) { stats.pengecohTanpaTag += 1; err(id, 'alasan keliru tanpa tag'); } cekM(id, r.m); }
    if (it.representation === 'story' && !it.stemSimple) err(id, 'soal cerita tanpa stemSimple');
    for (const p of it.highlights ?? []) if (!it.stem.includes(p)) err(id, `frasa sorotan "${p}" tidak ada di teks soal`);
    cekKalimat(id, it.stem, 'stem');
    cekHints(id, it);
  }

  // ---------- Bedah Soal ----------
  for (const it of data.bedah.items) {
    const id = it.id; daftarId(id); stats.soal += 1; cekSumber(id, it.sumber);
    cekKalimat(id, it.stem, 'stem'); cekHints(id, it);
    if (!it.stemSimple) err(id, 'tanpa stemSimple');
    const urut = it.steps.map((s) => s.step);
    for (const w of LANGKAH_BS) if (!urut.includes(w) && !(w === 'penyelesaian' && BS_TANPA_PENYELESAIAN.has(id))) err(id, `langkah ${w} tidak ada`);
    const alasan = it.steps.find((s) => s.step === 'alasan');
    if (alasan && !(alasan.freeText && alasan.penilaian === 'guru' && alasan.rubrikGuru)) err(id, 'langkah alasan harus teks bebas dinilai guru + rubrik');
    for (const s of it.steps) {
      if (s.type === 'highlight') {
        for (const p of [...s.answer, ...(s.pengecoh ?? [])]) if (!it.stem.includes(p)) err(id, `frasa "${p}" tidak ada di teks soal (tidak bisa ditandai)`);
      }
      for (const m of Object.values(s.m ?? {})) { stats.pengecoh += 1; cekM(id, m); }
      for (const o of s.options ?? []) if (typeof o === 'object' && !o.correct) { stats.pengecoh += 1; if (!o.m) stats.pengecohTanpaTag += 1; cekM(id, o.m); }
      if (typeof s.cek !== 'string') continue;
      const [kind, target] = s.cek.split('@');
      const models = target === 'semua' ? Object.values(it.models) : [target ? it.models[target] : it.model];
      stats.kunciOtomatis += 1;
      let ok = true;
      for (const m of models) {
        switch (kind) {
          case 'setiapA-tepatSatu': ok &&= allA1(m) === s.answer; break;
          case 'setiapA-punyaPasangan': ok &&= allA(m) === s.answer; break;
          case 'setiapB-tepatSatu': ok &&= allB1(m) === s.answer; break;
          case 'klasifikasi': ok &&= klas(m) === s.answer; break;
          case 'daerahHasil': ok &&= M.isFunction(m.A, m.B, m.pairs) && sameSet(s.answer, M.rangeOf(m.pairs, m.B)); break;
          case 'banyakDaerahHasil': ok &&= s.answer === M.rangeOf(m.pairs, m.B).length; break;
          case 'pelanggaran': ok &&= sameSet(s.answer, pelanggaran(m)); break;
          case 'domain-kodomain-daerahHasil':
            ok &&= sameSet(s.answer.domain, m.A) && sameSet(s.answer.kodomain, m.B) && sameSet(s.answer.daerahHasil, M.rangeOf(m.pairs, m.B)); break;
          case 'klasifikasi-dibalik':
            ok &&= ['fungsi', 'kss'].includes(klas({ A: m.B, B: m.A, pairs: m.pairs.map(([x, y]) => [y, x]) })) === (s.answer === 0); break;
          case 'hipotesis-tambahPasangan': {
            const kosong = M.functionViolations(m.A, m.pairs).noPair;
            ok &&= kosong.length === 1 && M.isFunction(m.A, m.B, [...m.pairs, [kosong[0], m.B[0]]]) && s.answer === 0; break;
          }
          case 'hipotesis-kss': {
            const kosong = M.functionViolations(m.A, m.pairs).noPair[0];
            ok &&= !M.isOneToOneCorrespondence(m.A, m.B, [...m.pairs, [kosong, m.B[m.B.length - 1]]]) && s.answer === 0; break;
          }
          default: err(id, `cek langkah tidak dikenal: ${kind}`);
        }
      }
      if (!ok) err(id, `KUNCI LANGKAH TIDAK COCOK (${s.cek})`);
    }
  }

  // ---------- Latihan ----------
  for (const it of data.latihan.items) cekSoalBiasa(it);

  // ---------- Materi ----------
  const mt = [];
  if (!eq(data.units.map((u) => u.id), data.unitIds)) err('materi', `unit tidak sesuai concepts.json: ${data.units.map((u) => u.id)}`);
  for (const u of data.units) {
    cekSumber(u.id, u.sumber);
    const tahap = u.layar.map((l) => l.tahap);
    for (const w of TAHAP_RMT) if (!tahap.includes(w)) err(u.id, `tahap RMT ${w} tidak ada`);
    if (u.layar.length > 6) warnings.push(`${u.id}: ${u.layar.length} layar (> 6)`);
    const ilmiah = u.layar.find((l) => l.tahap === 'konsep-ilmiah');
    if (ilmiah?.definisi && ilmiah.sumberDefinisi !== 'docs/02 §5') err(u.id, 'definisi tanpa sumber docs/02 §5');
    if (u.sumber === 'perlu-verifikasi' && ilmiah?.definisi) err(u.id, 'unit perlu-verifikasi tidak boleh memuat definisi');
    for (const l of u.layar) for (const t of l.teks ?? []) cekKalimat(u.id, t, 'teks layar');
    for (const l of u.layar) for (const c of l.contoh ?? []) {
      if (!c.visual || u.id === 'U1') continue;
      const v = c.visual;
      const benar = u.id === 'U7' ? M.isOneToOneCorrespondence(v.A, v.B, v.pairs) : M.isFunction(v.A, v.B, v.pairs);
      stats.kunciOtomatis += 1;
      if (benar !== c.benar) err(u.id, `contoh "${c.teks.slice(0, 40)}…" tidak cocok math.js`);
    }
    for (const it of u.cekPemahaman) { cekSoalBiasa(it, u.sumber); mt.push(it); }
  }

  // ---------- Misi Literasi ----------
  for (const it of data.misi.items) {
    const id = it.id; daftarId(id); stats.soal += 1; cekSumber(id, it.sumber);
    if (!['LR', 'LF', 'LE', 'LI'].includes(it.indicator)) err(id, 'indikator tidak sah');
    const total = it.stages.reduce((s, x) => s + x.score, 0);
    if (total !== it.maxScore || it.maxScore !== 6) err(id, `jumlah skor ${total}, maxScore ${it.maxScore} (harus 6)`);
    if (!it.hints || it.hints.length < 2) err(id, 'hint < 2');
    if (!it.modelAnswer) err(id, 'tanpa jawaban model');
    if (it.sumber !== 'kisi-kisi') cekKalimat(id, it.stem, 'stem');
    cekKalimat(id, it.stemSimple, 'stemSimple');
    if (!it.stages.some((s) => s.freeText && s.penilaian === 'guru' && s.rubrikGuru)) err(id, 'tidak ada alasan tertulis dinilai guru');
    for (const s of it.stages) {
      for (const m of Object.values(s.m ?? {})) { stats.pengecoh += 1; cekM(id, m); }
      for (const d of s.diagrams ?? []) if (d.m) { stats.pengecoh += 1; cekM(id, d.m); }
      for (const r of s.reasons ?? []) if (!r.correct) { stats.pengecoh += 1; if (!r.m) stats.pengecohTanpaTag += 1; cekM(id, r.m); }
      const m = it.model;
      let dicek = true;
      let ok = true;
      if (s.type === 'set-pair' && m) ok = sameSet(s.answer.domain, m.A) && sameSet(s.answer.kodomain, m.B);
      else if (s.type === 'set-pair') ok = Object.values(it.models).every((x) => sameSet(s.answer.domain, x.A) && sameSet(s.answer.kodomain, x.B));
      else if (s.type === 'pairs' && s.answer === 'model.pairs') {
        ok = M.isRelation(m.A, m.B, m.pairs);
        if (m.aturan) {
          const p = M.pairsFromRule(m.A.map(Number), rule(m.aturan.koef))
            .filter(([, y]) => m.B.includes(String(y))).map(([x, y]) => [String(x), String(y)]);
          ok &&= sameSet(p.map(String), m.pairs.map(String));
        }
      } else if (s.type === 'set-triple') {
        ok = sameSet(s.answer.domain, m.A) && sameSet(s.answer.kodomain, m.B);
        if (s.answer.daerahHasil) ok &&= M.isFunction(m.A, m.B, m.pairs) && sameSet(s.answer.daerahHasil, M.rangeOf(m.pairs, m.B));
        if (s.answer.tanpaPasangan) ok &&= sameSet(s.answer.tanpaPasangan, M.functionViolations(m.A, m.pairs).noPair);
      } else if (s.type === 'diagram-choice') {
        ok = s.diagrams.every((d, i) => (sameSet(d.pairs.map(String), m.pairs.map(String)) && sameSet(d.A, m.A) && sameSet(d.B, m.B)) === (i === s.answer));
        if (!s.reasons?.some((r) => r.correct)) err(id, 'pilihan diagram tanpa alasan pemilihan');
      } else if (s.type === 'set' && s.cek === 'daerahHasil') ok = M.isFunction(m.A, m.B, m.pairs) && sameSet(s.answer, M.rangeOf(m.pairs, m.B));
      else if (s.cek === 'setiapA-tepatSatu' && m) ok = allA1(m) === (s.type === 'tf' ? s.answer : s.answer === 0);
      else if (s.type === 'tf-multi') ok = Object.entries(s.answer).every(([k, v]) => allA1(it.models[k]) === v);
      else if (s.cek?.hipotesis) {
        const h = it.hipotesis[s.cek.hipotesis];
        const key = (p) => JSON.stringify(p);
        const pairs = [...m.pairs.filter((p) => !h.hapus.some((q) => key(q) === key(p))), ...h.tambah];
        ok = klas({ A: m.A, B: [...m.B, ...(h.tambahB ?? [])], pairs }) === s.cek.klasifikasi;
      } else if (s.cek?.klasifikasiAwal) ok = klas(m) === s.cek.klasifikasiAwal;
      else if (s.cek?.klasifikasi) ok = klas(m) === s.cek.klasifikasi;
      else if (s.cek && typeof s.cek === 'object' && it.models) ok = Object.entries(s.cek).every(([k, v]) => klas(it.models[k]) === v);
      else dicek = false;
      if (s.cek?.klasifikasi && !CAKUPAN_MISI.has(s.cek.klasifikasi)) err(id, `tahap ${s.n} di luar cakupan kisi-kisi: ${s.cek.klasifikasi}`);
      if (dicek) { stats.kunciOtomatis += 1; if (!ok) err(id, `KUNCI TAHAP ${s.n} TIDAK COCOK`); } else stats.kunciManual += 1;
    }
  }

  // ---------- Kuota & sebaran ----------
  const kk = data.kenali.items;
  const rep = hitung(kk, 'representation');
  const counts = {
    kenali: { total: kk.length, level: hitung(kk, 'level'), representasi: rep, jawaban: hitung(kk, 'answer') },
    bedah: { total: data.bedah.items.length, level: hitung(data.bedah.items, 'level') },
    latihan: { total: data.latihan.items.length, level: hitung(data.latihan.items, 'level'), unit: hitung(data.latihan.items, 'unit') },
    misi: { total: data.misi.items.length, indikator: hitung(data.misi.items, 'indicator'), sumber: hitung(data.misi.items, 'sumber') },
    materi: { unit: data.units.length, soal: mt.length, level: hitung(mt, 'level') },
  };
  const cekKuota = (nama, aktual, harap) => { if (!eq(aktual, harap)) err('kuota', `${nama}: ${JSON.stringify(aktual)} ≠ ${JSON.stringify(harap)}`); };
  cekKuota('Kenali Konsep total', counts.kenali.total, KUOTA.kenali.total);
  cekKuota('Kenali Konsep level', sortObj(counts.kenali.level), sortObj(KUOTA.kenali.level));
  for (const [r, n] of Object.entries(KUOTA.kenali.representasi)) cekKuota(`Kenali Konsep ${r}`, rep[r] ?? 0, n);
  cekKuota('Kenali Konsep cartesian+table', (rep.cartesian ?? 0) + (rep.table ?? 0), KUOTA.kenali.cartesianTable);
  cekKuota('Bedah Soal', [counts.bedah.total, sortObj(counts.bedah.level)], [KUOTA.bedah.total, sortObj(KUOTA.bedah.level)]);
  cekKuota('Latihan', [counts.latihan.total, sortObj(counts.latihan.level)], [KUOTA.latihan.total, sortObj(KUOTA.latihan.level)]);
  cekKuota('Misi Literasi', [counts.misi.total, sortObj(counts.misi.indikator)], [KUOTA.misi.total, sortObj(KUOTA.misi.indikator)]);
  cekKuota('Materi', [counts.materi.unit, counts.materi.soal, sortObj(counts.materi.level)], [KUOTA.materi.unit, KUOTA.materi.soal, sortObj(KUOTA.materi.level)]);
  if (data.glossary && !Array.isArray(data.glossary.terverifikasiDocs02)) err('glossary', 'bagian terverifikasiDocs02 tidak ada');

  return { errors, warnings, stats, counts };
}

function sortObj(o) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
}

/** Memuat seluruh konten dari folder data/ (relatif terhadap dokumen pemanggil). */
export async function loadContent(base = '../data/') {
  const get = async (name) => {
    const r = await fetch(`${base}${name}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Gagal memuat ${name} (${r.status})`);
    return r.json();
  };
  const concepts = await get('concepts.json');
  const unitIds = concepts.units.map((u) => u.id);
  const [kenali, bedah, latihan, misi, glossary, ...units] = await Promise.all([
    get('kenali-konsep.json'), get('bedah-soal.json'), get('latihan.json'), get('misi-literasi.json'), get('glossary.json'),
    ...unitIds.map((id) => get(`materi/${id}.json`)),
  ]);
  return { kenali, bedah, latihan, misi, glossary, units, unitIds };
}

// ---------- Tampilan di tools/validate.html ----------
async function runPage() {
  const root = document.getElementById('validate-root');
  const summary = document.getElementById('summary');
  try {
    const report = validateContent(await loadContent());
    const { errors, warnings, stats, counts } = report;
    summary.textContent = errors.length === 0 ? '0 galat' : `${errors.length} galat`;
    summary.dataset.status = errors.length === 0 ? 'pass' : 'fail';
    const add = (tag, text, cls) => { const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; root.append(el); return el; };
    add('h2', 'Ringkasan');
    add('p', `Soal/misi: ${stats.soal} · kunci dicek math.js: ${stats.kunciOtomatis} · kunci prinsip (manual): ${stats.kunciManual} · pengecoh: ${stats.pengecoh} (tanpa tag: ${stats.pengecohTanpaTag})`);
    add('p', `Label perlu-verifikasi (${stats.perluVerifikasi.length}): ${stats.perluVerifikasi.join(', ')}`);
    add('pre', JSON.stringify(counts, null, 1));
    add('h2', `Galat (${errors.length})`);
    for (const e of errors) add('p', `✘ ${e}`, 'fail');
    add('h2', `Peringatan kalimat > 25 kata (${warnings.length})`);
    for (const w of warnings) add('p', `! ${w}`, 'warn');
  } catch (e) {
    summary.textContent = 'gagal memuat';
    summary.dataset.status = 'fail';
    root.textContent = e.message;
  }
}

if (typeof document !== 'undefined' && document.getElementById('validate-root')) runPage();
