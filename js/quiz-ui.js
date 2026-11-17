// Komponen kuis bersama (docs/05 §5): ChoiceList, HintButton, FeedbackSheet, input himpunan/pasangan/alasan,
// dan penampil satu soal (Latihan & cek pemahaman Materi). Penilaian di js/quiz-engine.js (fungsi murni).
import { loadData, loadMisconceptions } from './data.js';
import { renderVisual } from './diagram.js';
import { gradeItem } from './quiz-engine.js';
import { addAttempt } from './storage.js';
import { h, mathText } from './ui.js';

let nameSeq = 0;

/** Konsep (concepts.json) untuk satu unit — dipakai untuk penguasaan per konsep di Progres. */
export async function conceptsForUnit(unit) {
  const data = await loadData('concepts');
  return data.concepts.filter((c) => c.unit === unit).map((c) => c.id);
}

/** Mencatat jawaban ke localStorage lewat storage.js (tanpa nama siswa). */
export async function recordAttempt({ qid, feature, unit, correct, misconception, hintsUsed, timeMs, ...extra }) {
  addAttempt({
    qid, feature, correct: Boolean(correct), concepts: unit ? await conceptsForUnit(unit) : [],
    misconception: misconception ?? undefined, hintsUsed: hintsUsed ?? 0, timeMs, ...extra,
  });
}

/** Teks soal + tombol "Sederhanakan kalimat" bila ada stemSimple (EL05). */
export function stemBlock(stem, stemSimple) {
  const p = h('p', { class: 'q-stem' }, mathText(stem));
  if (!stemSimple) return p;
  let simple = false;
  const btn = h('button', {
    type: 'button', class: 'chip q-simplify', 'aria-pressed': 'false',
    onClick: () => {
      simple = !simple;
      p.replaceChildren(mathText(simple ? stemSimple : stem));
      btn.setAttribute('aria-pressed', String(simple));
      btn.textContent = simple ? 'Aa Kalimat lengkap' : 'Aa Sederhanakan kalimat';
    },
  }, 'Aa Sederhanakan kalimat');
  return h('div', { class: 'q-stem-wrap' }, p, btn);
}

/**
 * Daftar pilihan besar (radio/checkbox).
 * @returns {{ el, value(): number|number[]|null, disable(), mark(correct: number[], chosen) }}
 */
export function choiceList(options, { multi = false, label = 'Pilihan jawaban', onChange } = {}) {
  const name = `opt${(nameSeq += 1)}`;
  const inputs = [];
  const items = options.map((text, i) => {
    const input = h('input', { type: multi ? 'checkbox' : 'radio', name, value: i, id: `${name}-${i}`, class: 'visually-hidden', onChange: () => onChange?.() });
    inputs.push(input);
    return h('div', { class: 'opt' }, input, h('label', { for: `${name}-${i}`, class: 'opt__label' }, mathText(text)));
  });
  const el = h('fieldset', { class: 'opts' }, h('legend', { class: 'visually-hidden' }, label), items);
  return {
    el,
    value() {
      const chosen = inputs.filter((x) => x.checked).map((x) => Number(x.value));
      return multi ? chosen : chosen[0] ?? null;
    },
    disable() { inputs.forEach((x) => { x.disabled = true; }); },
    mark(correct) {
      items.forEach((it, i) => {
        if (correct.includes(i)) it.classList.add('is-correct');
        else if (inputs[i].checked) it.classList.add('is-wrong');
      });
    },
  };
}

/** Tombol petunjuk bertahap; mencatat banyak hint yang dibuka (hintsUsed / hint_count). */
export function hintBox(hints = []) {
  let opened = 0;
  const list = h('ol', { class: 'hint__list' });
  const btn = h('button', { type: 'button', class: 'btn hint__btn' }, '💡 Petunjuk');
  const refresh = () => {
    btn.hidden = opened >= hints.length;
    btn.textContent = opened === 0 ? '💡 Petunjuk' : `💡 Petunjuk berikutnya (${opened + 1} dari ${hints.length})`;
  };
  btn.addEventListener('click', () => {
    if (opened >= hints.length) return;
    list.append(h('li', { class: 'note hint__item' }, h('strong', {}, `Petunjuk ${opened + 1} dari ${hints.length}: `), mathText(hints[opened])));
    opened += 1;
    refresh();
  });
  refresh();
  const el = h('div', { class: 'hint' }, list, hints.length ? btn : null);
  return { el, count: () => opened, hide() { btn.hidden = true; } };
}

/**
 * Panel umpan balik (FeedbackSheet). Status selalu memakai ikon + teks (aturan 9), tanpa kata "Salah!" (aturan 7).
 * @param {{ correct: boolean|null, title?: string, text?: string, misconception?: string|null, explanation?: string, actions?: Node[] }} f
 */
export async function feedbackPanel({ correct, title, text, misconception, explanation, actions = [] }) {
  const all = misconception ? await loadMisconceptions() : {};
  const m = misconception ? all[misconception] : null;
  const head = correct === null ? '📝 Tersimpan' : correct ? '✔ Tepat!' : '✘ Belum tepat';
  return h('section', { class: `feedback feedback--${correct === null ? 'pending' : correct ? 'ok' : 'no'}`, role: 'status' },
    h('p', { class: 'feedback__title' }, title ?? head),
    text ? h('p', {}, mathText(text)) : null,
    m && !correct ? h('p', { class: 'feedback__m' }, mathText(m.feedback)) : null,
    explanation ? h('p', { class: 'feedback__exp' }, mathText(explanation)) : null,
    m && !correct ? h('a', { class: 'feedback__link', href: `#/materi/${m.unit}` }, `📘 Pelajari ${m.unit}`) : null,
    actions.length ? h('div', { class: 'feedback__actions' }, actions) : null);
}

/** Memilih anggota himpunan dari kumpulan pilihan (chip yang bisa ditekan). */
export function setPicker(pool, { label } = {}) {
  const chosen = new Set();
  const chips = pool.map((v) => h('button', {
    type: 'button', class: 'chip set-chip', 'aria-pressed': 'false',
    onClick: (e) => {
      const b = e.currentTarget;
      if (chosen.has(v)) chosen.delete(v); else chosen.add(v);
      b.setAttribute('aria-pressed', String(chosen.has(v)));
    },
  }, String(v)));
  return {
    el: h('div', { class: 'set-picker' }, label ? h('p', { class: 'set-picker__label' }, label) : null, h('div', { class: 'chips' }, chips)),
    value: () => pool.filter((v) => chosen.has(v)),
    disable() { chips.forEach((c) => { c.disabled = true; }); },
  };
}

/** Menyusun pasangan berurutan: setiap anggota A memilih pasangannya di B (boleh lebih dari satu, boleh kosong). */
export function pairsBuilder(A, B) {
  const rows = A.map((a) => ({ a, picker: setPicker(B) }));
  return {
    el: h('div', { class: 'pairs-builder' }, rows.map(({ a, picker }) => h('div', { class: 'pairs-builder__row' },
      h('span', { class: 'pairs-builder__a pv-a' }, `(${a}, …)`), picker.el))),
    value: () => rows.flatMap(({ a, picker }) => picker.value().map((b) => [a, b])),
    disable() { rows.forEach(({ picker }) => picker.disable()); },
  };
}

/** Isian alasan tertulis (teks bebas, dinilai guru). */
export function reasonInput({ placeholder = 'Tulis alasanmu dengan kalimatmu sendiri…', minLength = 10 } = {}) {
  const area = h('textarea', { class: 'input q-text', rows: 3, maxlength: 600, placeholder, 'aria-label': 'Alasan tertulis' });
  return {
    el: h('div', { class: 'q-reason' }, area, h('p', { class: 'muted q-reason__note' }, '🔒 Jangan menulis nama lengkap. Alasanmu dinilai oleh guru.')),
    value: () => area.value.trim(),
    valid: () => area.value.trim().length >= minLength,
    disable() { area.disabled = true; },
  };
}

/** Isian angka. */
export function numericInput() {
  const input = h('input', { type: 'text', inputmode: 'decimal', class: 'input q-num', 'aria-label': 'Jawaban angka', autocomplete: 'off' });
  return { el: input, value: () => input.value, disable() { input.disabled = true; } };
}

/** Membuat input sesuai tipe soal Latihan/MT. */
function inputFor(item) {
  switch (item.type) {
    case 'mcq': return choiceList(item.options.map((o) => o.text));
    case 'multi': return choiceList(item.options.map((o) => o.text), { multi: true });
    case 'tf': {
      const c = choiceList(['Benar', 'Salah']);
      return { ...c, value: () => (c.value() == null ? null : c.value() === 0) };
    }
    case 'numeric': return numericInput();
    case 'set': return setPicker(item.pilihan);
    default: throw new Error(`Tipe soal tidak dikenal: ${item.type}`);
  }
}

const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * Satu soal Latihan/cek pemahaman: soal → (petunjuk) → Periksa → umpan balik → Lanjut.
 * @param {object} item
 * @param {{ feature: string, unit?: string, onNext: (result) => void, nextLabel?: string }} ctx
 */
export function questionCard(item, ctx) {
  const started = Date.now();
  const input = inputFor(item);
  const hints = hintBox(item.hints);
  const status = h('p', { class: 'chat__status', role: 'status' });
  const feedbackSlot = h('div', {});
  const check = h('button', { type: 'button', class: 'btn btn--primary' }, 'Periksa');
  check.addEventListener('click', async () => {
    const response = input.value();
    if (isEmpty(response)) { status.textContent = 'Pilih atau isi jawabanmu dulu.'; return; }
    const result = gradeItem(item, response);
    if (result.empty) { status.textContent = 'Tulis jawaban berupa angka.'; return; }
    status.textContent = '';
    check.hidden = true;
    input.disable();
    hints.hide();
    if (item.type === 'mcq' || item.type === 'multi') input.mark?.(Array.isArray(item.answer) ? item.answer : [item.answer]);
    if (item.type === 'tf') input.mark?.([item.answer ? 0 : 1]);
    const outcome = { correct: result.correct, misconception: result.misconception, hintsUsed: hints.count(), timeMs: Date.now() - started };
    await recordAttempt({ qid: item.id, feature: ctx.feature, unit: item.unit ?? ctx.unit, ...outcome });
    const next = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => ctx.onNext(outcome) }, ctx.nextLabel ?? 'Lanjut ▶');
    feedbackSlot.replaceChildren(await feedbackPanel({
      correct: result.correct, text: result.feedback, misconception: result.misconception,
      explanation: item.explanation, actions: [next],
    }));
    next.focus();
  });
  return h('article', { class: 'card q-card' },
    stemBlock(item.stem, item.stemSimple),
    item.visual ? renderVisual(item.visual) : null,
    input.el,
    hints.el,
    status,
    h('div', { class: 'q-actions' }, check),
    feedbackSlot);
}

/** Ringkasan akhir sesi (docs/05 §7). */
export function sessionSummary({ correct, total, onAgain, backHref, backLabel }) {
  return h('section', { class: 'card q-summary' },
    h('h2', {}, 'Sesi selesai!'),
    h('p', {}, `Kamu benar ${correct} dari ${total} soal.`),
    h('div', { class: 'q-actions' },
      onAgain ? h('button', { type: 'button', class: 'btn', onClick: onAgain }, 'Ulangi') : null,
      h('a', { class: 'btn btn--primary', href: backHref }, backLabel ?? 'Selesai')));
}

/** Kepala sesi: "Soal 3/15" + bilah kemajuan. */
export function sessionHead(label, index, total) {
  const pct = total ? index / total : 0;
  return h('div', { class: 'q-head' },
    h('span', { class: 'q-head__count' }, `${label} ${Math.min(index + 1, total)}/${total}`),
    h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': index },
      h('div', { class: 'progress__bar', style: { width: `${Math.round(pct * 100)}%` } })));
}

/** Pilihan level (Mudah/Sedang/Sulit) sebagai daftar tautan. */
export function levelMenu(baseHref, counts) {
  const LEVELS = [
    { id: 'mudah', title: 'Mudah', desc: 'Kenali ciri dengan data langsung' },
    { id: 'sedang', title: 'Sedang', desc: 'Bandingkan dan pindah representasi' },
    { id: 'sulit', title: 'Sulit', desc: 'Konteks baru, data pengecoh, menilai klaim' },
  ];
  return h('ul', { class: 'menu-list' }, LEVELS.map((l) => h('li', {},
    h('a', { class: 'menu-item', href: `${baseHref}/${l.id}` },
      h('span', { class: 'menu-item__icon', 'aria-hidden': 'true' }, l.id === 'mudah' ? '🟢' : l.id === 'sedang' ? '🟡' : '🔴'),
      h('span', { class: 'menu-item__title' }, `${l.title} · ${counts[l.id] ?? 0} soal`),
      h('span', { class: 'menu-item__desc' }, l.desc)))));
}

export { renderVisual };
