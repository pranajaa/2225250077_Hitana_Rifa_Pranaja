// Satu-satunya modul yang mengakses localStorage. Skema: docs/04-ARSITEKTUR-TEKNIS.md §5
// Semua akses dibungkus try/catch: localStorage bisa tidak tersedia (mode privat, penyimpanan penuh).

export const STORAGE_KEY = 'relafun:v1';
export const SCHEMA_VERSION = 1;
export const MAX_ATTEMPTS = 500;
const PROTECTED_SESSIONS = new Set(['pretest', 'posttest']);

let state = null;

export function defaultState() {
  return {
    version: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    profile: { nickname: '', studentCode: '', signedInAt: null },
    units: {},      // { U3: { status: 'sedang'|'selesai', lastScreen: 2, completedAt } }
    attempts: [],   // lihat addAttempt()
    settings: { fontScale: 1, simpleLanguage: false, theme: 'auto', installHintDismissed: false },
  };
}

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Menyesuaikan data lama/rusak ke skema terbaru. */
export function migrate(data) {
  const base = defaultState();
  if (!data || typeof data !== 'object') return base;
  return {
    ...base,
    ...data,
    version: SCHEMA_VERSION,
    profile: { ...base.profile, ...(data.profile ?? {}) },
    settings: { ...base.settings, ...(data.settings ?? {}) },
    units: data.units && typeof data.units === 'object' ? data.units : {},
    attempts: Array.isArray(data.attempts) ? data.attempts : [],
  };
}

export function load() {
  if (state) return state;
  let parsed = null;
  try {
    const raw = readRaw();
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  state = migrate(parsed);
  return state;
}

/** @returns {boolean} true bila tersimpan */
export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(load()));
    return true;
  } catch {
    return false;
  }
}

/** Mengubah state lalu menyimpan. */
export function update(mutator) {
  const s = load();
  mutator(s);
  save();
  return s;
}

/**
 * Membatasi jumlah attempt; attempt pre-test/post-test tidak pernah dibuang.
 * Diekspor agar bisa diuji.
 */
export function trimAttempts(attempts, max = MAX_ATTEMPTS) {
  if (attempts.length <= max) return attempts;
  const keep = attempts.filter((a) => PROTECTED_SESSIONS.has(a.session));
  const rest = attempts.filter((a) => !PROTECTED_SESSIONS.has(a.session));
  const room = Math.max(0, max - keep.length);
  const kept = new Set([...keep, ...rest.slice(rest.length - room)]);
  return attempts.filter((a) => kept.has(a));
}

/**
 * Mencatat satu jawaban.
 * @param {object} attempt  { qid, feature, session, correct, concepts[], misconception?,
 *                            hintsUsed?, timeMs?, indicator?, stageScores?, score?, maxScore? }
 */
export function addAttempt(attempt) {
  return update((s) => {
    s.attempts.push({ ts: new Date().toISOString(), session: 'latihan', ...attempt });
    s.attempts = trimAttempts(s.attempts);
  });
}

export function setUnitStatus(unitId, patch) {
  return update((s) => {
    s.units[unitId] = { ...(s.units[unitId] ?? {}), ...patch };
  });
}

export function updateSettings(patch) {
  return update((s) => {
    s.settings = { ...s.settings, ...patch };
  });
}

export function updateProfile(patch) {
  return update((s) => {
    s.profile = { ...s.profile, ...patch };
  });
}

export function resetAll() {
  state = defaultState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* abaikan */
  }
  return state;
}

export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

/** @returns {boolean} true bila berhasil diimpor */
export function importJSON(text) {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !Array.isArray(data.attempts)) return false;
    state = migrate(data);
    return save();
  } catch {
    return false;
  }
}

/** Hanya untuk pengujian: memakai state di memori tanpa localStorage. */
export function _setStateForTest(s) {
  state = s;
}
