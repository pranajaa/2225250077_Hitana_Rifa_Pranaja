// Menghitung penguasaan per konsep & skor literasi per indikator dari data attempts.
// Aturan: docs/02-DESAIN-PEMBELAJARAN.md §7 dan docs/08-LITERASI-MATEMATIKA.md §7.
// Ini statistik deskriptif sederhana untuk siswa (JavaScript). Uji statistik → analysis/ (Python).

export const MASTERY_WINDOW = 10;
export const MASTERY_MIN_ATTEMPTS = 5;
export const MASTERY_THRESHOLD = 0.7;

export const LITERACY_INDICATORS = [
  { code: 'LR', name: 'Bernalar', full: 'Mathematical Reasoning' },
  { code: 'LF', name: 'Memodelkan', full: 'Formulating Situations Mathematically' },
  { code: 'LE', name: 'Menghitung', full: 'Employing Concepts, Facts, and Procedures' },
  { code: 'LI', name: 'Menafsirkan', full: 'Interpreting, Applying, and Evaluating' },
];

/**
 * Status penguasaan dari daftar hasil benar/salah (urut lama → baru).
 * @param {boolean[]} results
 */
export function masteryStatus(results) {
  if (results.length === 0) return { status: 'belum', accuracy: null, count: 0 };
  const recent = results.slice(-MASTERY_WINDOW);
  const accuracy = recent.filter(Boolean).length / recent.length;
  const mastered = accuracy >= MASTERY_THRESHOLD && results.length >= MASTERY_MIN_ATTEMPTS;
  return { status: mastered ? 'kuasai' : 'sedang', accuracy, count: results.length };
}

/** Penguasaan per tag konsep: { 'syarat-fungsi': { status, accuracy, count } } */
export function masteryByConcept(attempts) {
  const byConcept = new Map();
  for (const a of sortByTime(attempts)) {
    for (const concept of a.concepts ?? []) {
      if (!byConcept.has(concept)) byConcept.set(concept, []);
      byConcept.get(concept).push(Boolean(a.correct));
    }
  }
  return Object.fromEntries([...byConcept].map(([c, results]) => [c, masteryStatus(results)]));
}

/**
 * Skor literasi per indikator = Σ skor / Σ skor maksimum (skor parsial ikut dihitung).
 * @returns {{ LR: {score, max, ratio}, ... }}
 */
export function literacyByIndicator(attempts) {
  const out = Object.fromEntries(
    LITERACY_INDICATORS.map(({ code }) => [code, { score: 0, max: 0, ratio: null }]),
  );
  for (const a of attempts) {
    const slot = out[a.indicator];
    if (!slot || typeof a.score !== 'number' || typeof a.maxScore !== 'number') continue;
    slot.score += a.score;
    slot.max += a.maxScore;
  }
  for (const slot of Object.values(out)) {
    slot.ratio = slot.max > 0 ? slot.score / slot.max : null;
  }
  return out;
}

/** Frekuensi miskonsepsi, urut dari yang paling sering: [['M01', 4], ...] */
export function misconceptionCounts(attempts) {
  const counts = new Map();
  for (const a of attempts) {
    if (!a.misconception) continue;
    counts.set(a.misconception, (counts.get(a.misconception) ?? 0) + 1);
  }
  return [...counts].sort((x, y) => y[1] - x[1]);
}

/** Konsep yang perlu diulang: status 'sedang', akurasi terendah dulu. */
export function weakConcepts(attempts, limit = 3) {
  return Object.entries(masteryByConcept(attempts))
    .filter(([, m]) => m.status === 'sedang')
    .sort((x, y) => x[1].accuracy - y[1].accuracy)
    .slice(0, limit)
    .map(([concept, m]) => ({ concept, ...m }));
}

function sortByTime(attempts) {
  return [...attempts].sort((a, b) => String(a.ts ?? '').localeCompare(String(b.ts ?? '')));
}
