// Penilai Misi Literasi — skor per tahap, skor parsial, tahap dinilai guru. Fungsi murni, diuji di tools/tests.js.
// Aturan: docs/08 (jumlah skor tahap = maxScore = 6; tahap yang benar tetap dapat skor walau tahap lain keliru).
import { gradeChoice, gradeMulti, sameSet, samePairs } from './quiz-engine.js';

/** Mengambil pasangan jawaban: "model.pairs" / "models.x.pairs" merujuk ke data misi. */
export function resolvePairs(mission, ref) {
  if (Array.isArray(ref)) return ref;
  const parts = String(ref).split('.');
  return parts.reduce((obj, key) => obj?.[key], mission);
}

const ratioScore = (correctParts, totalParts, max) => {
  if (correctParts === totalParts) return max;
  if (max === 2 && correctParts >= Math.ceil(totalParts / 2)) return 1;
  return 0;
};

/**
 * Menilai satu tahap.
 * @returns {{ score: number|null, max: number, correct: boolean|null, pending?: boolean, misconception?: string|null }}
 *   score null = menunggu penilaian guru.
 */
export function scoreStage(mission, stage, response) {
  const max = stage.score;
  const wrap = (score, misconception = null) => ({ score, max, correct: score === max, misconception });
  switch (stage.type) {
    case 'reason':
      return { score: null, max, correct: null, pending: true, misconception: null };
    case 'mcq': {
      const r = gradeChoice({ answer: stage.answer, options: (stage.options ?? []).map((t, i) => ({ text: t, m: stage.m?.[String(i)] })) }, response);
      return wrap(r.correct ? max : 0, r.misconception);
    }
    case 'multi': {
      const r = gradeMulti({ answer: stage.answer, options: stage.options.map((t, i) => ({ text: t, m: stage.m?.[String(i)] })) }, response ?? []);
      return wrap(r.correct ? max : 0, r.misconception);
    }
    case 'tf':
      return wrap(response === stage.answer ? max : 0);
    case 'tf-multi': {
      const keys = Object.keys(stage.answer);
      const ok = keys.filter((k) => response?.[k] === stage.answer[k]).length;
      return wrap(ratioScore(ok, keys.length, max));
    }
    case 'set':
      return wrap(sameSet(response ?? [], stage.answer) ? max : 0, sameSet(response ?? [], stage.answer) ? null
        : stage.m?.[(response ?? []).find((v) => !stage.answer.includes(v))] ?? null);
    case 'set-pair': {
      const ok = sameSet(response?.domain ?? [], stage.answer.domain) && sameSet(response?.kodomain ?? [], stage.answer.kodomain);
      const swapped = sameSet(response?.domain ?? [], stage.answer.kodomain);
      return wrap(ok ? max : 0, ok ? null : swapped ? 'M06' : stage.m?.tanpaBus3 ?? stage.m?.tanpaSoto ?? null);
    }
    case 'set-triple': {
      const keys = Object.keys(stage.answer);
      const ok = keys.filter((k) => sameSet(response?.[k] ?? [], stage.answer[k])).length;
      const rangeIsCodomain = response?.daerahHasil && sameSet(response.daerahHasil, stage.answer.kodomain ?? []);
      return wrap(ratioScore(ok, keys.length, max), ok === keys.length ? null : rangeIsCodomain ? 'M05' : null);
    }
    case 'pairs': {
      const answer = resolvePairs(mission, stage.answer);
      const chosen = response ?? [];
      if (samePairs(chosen, answer)) return wrap(max);
      const keys = new Set(answer.map(([x, y]) => `${x}→${y}`));
      const hits = chosen.filter(([x, y]) => keys.has(`${x}→${y}`)).length;
      const extra = chosen.length - hits;
      return wrap(extra === 0 ? ratioScore(hits, answer.length, max) : 0);
    }
    case 'pairs-multi': {
      const keys = Object.keys(stage.answer);
      const ok = keys.filter((k) => samePairs(response?.[k] ?? [], resolvePairs(mission, stage.answer[k]))).length;
      // Skor parsial LM-001: 1 per kondisi yang benar.
      return wrap(Math.round((ok / keys.length) * max));
    }
    case 'diagram-choice': {
      const diagramOk = response?.diagram === stage.answer;
      const reasonOk = Boolean(stage.reasons?.[response?.reason]?.correct);
      const m = !diagramOk ? stage.diagrams[response?.diagram]?.m ?? null : !reasonOk ? stage.reasons?.[response?.reason]?.m ?? null : null;
      // Skor hanya jika diagram DAN alasan benar (mencegah menebak).
      return wrap(diagramOk && reasonOk ? max : 0, m);
    }
    default:
      throw new Error(`Tipe tahap tidak dikenal: ${stage.type}`);
  }
}

/**
 * Ringkasan skor misi.
 * @param {{ score: number|null, max: number }[]} results
 * @returns {{ autoScore, autoMax, pendingMax, maxScore, pendingStages }}
 */
export function summarizeMission(results) {
  let autoScore = 0;
  let autoMax = 0;
  let pendingMax = 0;
  const pendingStages = [];
  results.forEach((r, i) => {
    if (r.score == null) { pendingMax += r.max; pendingStages.push(i + 1); return; }
    autoScore += r.score;
    autoMax += r.max;
  });
  return { autoScore, autoMax, pendingMax, maxScore: autoMax + pendingMax, pendingStages };
}
