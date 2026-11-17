// Mesin penilaian soal RELAFUN — fungsi murni (tanpa DOM), diuji di tools/tests.js.
// Kunci selalu dari data soal (data/*.json) yang sudah divalidasi dengan js/math.js (tools/validate.js).
// Setiap fungsi mengembalikan { correct, misconception?, feedback? }.

const norm = (v) => String(v).trim();
export const sameSet = (a, b) => {
  const x = [...new Set(a.map(norm))].sort();
  const y = [...new Set(b.map(norm))].sort();
  return x.length === y.length && x.every((v, i) => v === y[i]);
};
const pairKey = ([x, y]) => `${norm(x)}→${norm(y)}`;
export const samePairs = (a, b) => sameSet(a.map(pairKey), b.map(pairKey));

/** Pilihan ganda: item.options[i].m = tag miskonsepsi pengecoh. */
export function gradeChoice(item, index) {
  const correct = index === item.answer;
  const opt = item.options?.[index];
  return { correct, misconception: correct ? null : opt?.m ?? null, feedback: correct ? null : opt?.feedback ?? null };
}

/** Benar/salah: item.salahM = tag bila jawaban keliru. */
export function gradeTrueFalse(item, value) {
  const correct = value === item.answer;
  return { correct, misconception: correct ? null : item.salahM ?? null };
}

/** Pilih semua yang benar. Tag dari opsi keliru yang dipilih, atau dari opsi benar yang terlewat. */
export function gradeMulti(item, indices) {
  const answer = item.answer;
  const correct = sameSet(indices.map(String), answer.map(String));
  if (correct) return { correct, misconception: null };
  const wrongPick = indices.find((i) => !answer.includes(i));
  if (wrongPick != null) return { correct, misconception: item.options[wrongPick]?.m ?? null, feedback: item.options[wrongPick]?.feedback ?? null };
  const missed = answer.find((i) => !indices.includes(i));
  return { correct, misconception: item.mJikaTidakDipilih?.[missed] ?? null };
}

/** Isian angka. item.salahUmum = { "9": "M08" }. */
export function gradeNumeric(item, raw) {
  const value = Number(String(raw).replace(',', '.').trim());
  if (String(raw).trim() === '' || !Number.isFinite(value)) return { correct: false, misconception: null, empty: true };
  const correct = value === item.answer;
  return { correct, misconception: correct ? null : item.salahUmum?.[String(value)] ?? null };
}

/** Isian himpunan (memilih anggota). item.m = { anggotaKeliru: tag }. */
export function gradeSet(item, chosen) {
  const correct = sameSet(chosen, item.answer);
  if (correct) return { correct, misconception: null };
  const extra = chosen.find((c) => !item.answer.map(norm).includes(norm(c)));
  return { correct, misconception: (extra != null && item.m?.[extra]) || null };
}

/** Penilaian umum untuk soal Latihan & cek pemahaman Materi. */
export function gradeItem(item, response) {
  switch (item.type) {
    case 'mcq': return gradeChoice(item, response);
    case 'tf': return gradeTrueFalse(item, response);
    case 'multi': return gradeMulti(item, response);
    case 'numeric': return gradeNumeric(item, response);
    case 'set': return gradeSet(item, response);
    default: throw new Error(`Tipe soal tidak dikenal: ${item.type}`);
  }
}

/**
 * Kenali Konsep: konsep + alasan dinilai terpisah (docs/02 §6).
 * @returns {{ correct, conceptCorrect, reasonCorrect, misconception, feedback, case: 'benar'|'alasan'|'konsep' }}
 */
export function gradeKenali(item, conceptId, reasonIndex) {
  const conceptCorrect = conceptId === item.answer;
  const reason = item.reasons[reasonIndex];
  const reasonCorrect = Boolean(reason?.correct);
  if (!conceptCorrect) {
    const p = item.pengecoh[conceptId] ?? {};
    return { correct: false, conceptCorrect, reasonCorrect, misconception: p.m ?? null, feedback: p.feedback ?? null, case: 'konsep' };
  }
  if (!reasonCorrect) {
    return { correct: false, conceptCorrect, reasonCorrect, misconception: reason?.m ?? null, feedback: null, case: 'alasan' };
  }
  return { correct: true, conceptCorrect, reasonCorrect, misconception: null, feedback: null, case: 'benar' };
}

/** Langkah "tandai informasi": semua frasa kunci dipilih dan tidak ada frasa pengecoh. */
export function gradeHighlight(step, chosen) {
  const missing = step.answer.filter((p) => !chosen.includes(p));
  const wrong = (step.pengecoh ?? []).filter((p) => chosen.includes(p));
  return { correct: missing.length === 0 && wrong.length === 0, missing, wrong, misconception: null };
}

/**
 * Langkah Bedah Soal. Tipe: highlight, mcq, tf, konsep, set, numeric, set-triple, reason.
 * Langkah reason (teks bebas) dinilai guru: dikembalikan { correct: null, pending: true }.
 */
export function gradeStep(step, response) {
  switch (step.type) {
    case 'highlight': return gradeHighlight(step, response);
    case 'mcq': {
      const correct = response === step.answer;
      return { correct, misconception: correct ? null : step.m?.[String(response)] ?? null };
    }
    case 'tf': return { correct: response === step.answer, misconception: null };
    case 'konsep': {
      const correct = response === step.answer;
      return { correct, misconception: correct ? null : step.m?.[response] ?? null };
    }
    case 'set': return gradeSet(step, response);
    case 'numeric': return gradeNumeric({ answer: step.answer, salahUmum: step.salahUmum }, response);
    case 'set-triple': {
      const keys = Object.keys(step.answer);
      const results = Object.fromEntries(keys.map((k) => [k, sameSet(response[k] ?? [], step.answer[k])]));
      return { correct: keys.every((k) => results[k]), parts: results, misconception: null };
    }
    case 'reason': return { correct: null, pending: true, misconception: null };
    default: throw new Error(`Tipe langkah tidak dikenal: ${step.type}`);
  }
}
