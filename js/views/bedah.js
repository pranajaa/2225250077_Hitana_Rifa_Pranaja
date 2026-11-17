// Bedah Soal (F3): soal cerita diurai langkah demi langkah (RMT: Input → Elaborasi → Output → refleksi).
// Langkah boleh dicoba ulang; setelah 2× belum tepat, jawaban ditunjukkan (docs/02 §6). Alasan = teks bebas dinilai guru.
// Fading (docs/03): mudah semua langkah dipandu, sedang langkah identifikasi & karakteristik, sulit hanya konsep.
import { loadData } from '../data.js';
import { gradeStep } from '../quiz-engine.js';
import {
  choiceList, feedbackPanel, hintBox, numericInput, reasonInput, recordAttempt, setPicker, stemBlock,
} from '../quiz-ui.js';
import { h, mathText, pageHeader } from '../ui.js';

const LANGKAH = [
  { nama: 'Diketahui', steps: ['identifikasi'] },
  { nama: 'Ciri', steps: ['karakteristik'] },
  { nama: 'Konsep', steps: ['konsep', 'alasan'] },
  { nama: 'Jawab', steps: ['penyelesaian'] },
  { nama: 'Simpulkan', steps: ['kesimpulan'] },
];
const DIPANDU = {
  mudah: new Set(['identifikasi', 'karakteristik', 'konsep', 'alasan', 'penyelesaian', 'kesimpulan']),
  sedang: new Set(['identifikasi', 'karakteristik']),
  sulit: new Set(['konsep']),
};
const LEVEL_NAME = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };
const SET_LABEL = { domain: 'Domain', kodomain: 'Kodomain', daerahHasil: 'Daerah hasil' };

function stepProgress(current) {
  return h('ol', { class: 'steps', 'aria-label': 'Langkah Bedah Soal' }, LANGKAH.map((l, i) => h('li', {
    class: `steps__item${i < current ? ' is-done' : ''}${i === current ? ' is-current' : ''}`,
    'aria-current': i === current ? 'step' : null,
  }, h('span', { class: 'steps__num' }, i < current ? '✔' : String(i + 1)), h('span', { class: 'steps__name' }, l.nama))));
}

/** Teks soal dengan frasa yang bisa diketuk untuk ditandai (HighlightText). */
function highlightText(stem, phrases) {
  const chosen = new Set();
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  const parts = [];
  let rest = stem;
  while (rest.length) {
    let best = null;
    for (const p of sorted) {
      const at = rest.indexOf(p);
      if (at >= 0 && (best === null || at < best.at)) best = { at, p };
    }
    if (!best) { parts.push(rest); break; }
    if (best.at > 0) parts.push(rest.slice(0, best.at));
    const phrase = best.p;
    parts.push(h('button', {
      type: 'button', class: 'hl', 'aria-pressed': 'false',
      onClick: (e) => {
        if (chosen.has(phrase)) chosen.delete(phrase); else chosen.add(phrase);
        e.currentTarget.setAttribute('aria-pressed', String(chosen.has(phrase)));
      },
    }, phrase));
    rest = rest.slice(best.at + phrase.length);
  }
  return { el: h('p', { class: 'hl-text' }, parts), value: () => [...chosen] };
}

function setPool(item, step) {
  const m = item.model ?? Object.values(item.models ?? {})[0];
  if (step.cek === 'pelanggaran') return m.A;
  if (step.cek === 'daerahHasil') return m.B;
  return [...new Set([...m.A, ...m.B])];
}

/** Input untuk satu langkah. */
function stepInput(item, step, opsiKonsep) {
  switch (step.type) {
    case 'highlight': return highlightText(item.stem, [...step.answer, ...(step.pengecoh ?? [])]);
    case 'mcq': return choiceList(step.options.map((o) => (typeof o === 'string' ? o : o.text)));
    case 'tf': { const c = choiceList(['Ya', 'Tidak']); return { ...c, value: () => (c.value() == null ? null : c.value() === 0) }; }
    case 'konsep': { const c = choiceList(opsiKonsep.map((o) => o.text)); return { ...c, value: () => (c.value() == null ? null : opsiKonsep[c.value()].id) }; }
    case 'set': return setPicker(setPool(item, step));
    case 'numeric': return numericInput();
    case 'set-triple': {
      const pool = setPool(item, step);
      const pickers = Object.keys(step.answer).map((k) => [k, setPicker(pool, { label: SET_LABEL[k] ?? k })]);
      return {
        el: h('div', {}, pickers.map(([, p]) => p.el)),
        value: () => Object.fromEntries(pickers.map(([k, p]) => [k, p.value()])),
        disable: () => pickers.forEach(([, p]) => p.disable()),
      };
    }
    case 'reason': {
      const text = reasonInput();
      const helper = choiceList(step.options.map((o) => o.text), { label: 'Bantuan alasan' });
      return {
        el: h('div', {}, text.el, h('p', { class: 'muted q-sub' }, 'Bantuan (tidak wajib): alasan mana yang paling mirip dengan alasanmu?'), helper.el),
        value: () => ({ text: text.value(), helper: helper.value() }),
        valid: () => text.valid(),
        disable: () => { text.disable(); helper.disable(); },
      };
    }
    default: throw new Error(`Tipe langkah tidak dikenal: ${step.type}`);
  }
}

/** Teks jawaban benar untuk ditunjukkan setelah 2× belum tepat. */
function answerText(step, opsiKonsep) {
  const a = step.answer;
  switch (step.type) {
    case 'highlight': return `Informasi penting: ${a.join('; ')}.`;
    case 'mcq': return `Jawaban: ${typeof step.options[a] === 'string' ? step.options[a] : step.options[a].text}`;
    case 'tf': return `Jawaban: ${a ? 'Ya' : 'Tidak'}.`;
    case 'konsep': return `Jawaban: ${opsiKonsep.find((o) => o.id === a)?.text}.`;
    case 'set': return `Jawaban: {${a.join(', ')}}.`;
    case 'numeric': return `Jawaban: ${a}.`;
    case 'set-triple': return Object.entries(a).map(([k, v]) => `${SET_LABEL[k] ?? k} = {${v.join(', ')}}`).join('; ');
    default: return '';
  }
}

function bedahItem(container, item, opsiKonsep) {
  const started = Date.now();
  const guided = DIPANDU[item.level] ?? DIPANDU.mudah;
  const hints = hintBox(item.hints);
  const firstTry = [];
  const texts = {};
  let index = 0;
  const head = h('div', {});
  const body = h('div', {});
  container.append(pageHeader('Bedah Soal', { back: '#/bedah', sub: `${item.id} · ${LEVEL_NAME[item.level]}` }), head, body);

  const langkahOf = (step) => LANGKAH.findIndex((l) => l.steps.includes(step.step));

  function showStep() {
    if (index >= item.steps.length) { finish(); return; }
    const step = item.steps[index];
    head.replaceChildren(stepProgress(langkahOf(step)));
    const input = stepInput(item, step, opsiKonsep);
    const status = h('p', { class: 'chat__status', role: 'status' });
    const feedbackSlot = h('div', {});
    const check = h('button', { type: 'button', class: 'btn btn--primary' }, step.type === 'reason' ? 'Simpan alasan' : 'Periksa');
    let tries = 0;
    const next = () => { index += 1; showStep(); window.scrollTo(0, 0); };

    check.addEventListener('click', async () => {
      const response = input.value();
      if (step.type === 'reason') {
        if (!input.valid()) { status.textContent = 'Tulis alasanmu minimal 10 huruf.'; return; }
        texts[index + 1] = response.text;
        firstTry[index] = null;
        input.disable();
        check.hidden = true;
        const contoh = step.options.find((o) => o.correct)?.text;
        const lanjut = h('button', { type: 'button', class: 'btn btn--primary', onClick: next }, 'Lanjut ▶');
        feedbackSlot.replaceChildren(await feedbackPanel({ correct: null, title: '📝 Alasanmu tersimpan. Guru akan menilainya.', text: contoh ? `Bandingkan dengan contoh alasan: ${contoh}` : null, actions: [lanjut] }));
        return;
      }
      if (response == null || response === '' || (Array.isArray(response) && response.length === 0)) {
        status.textContent = 'Pilih atau isi jawabanmu dulu.';
        return;
      }
      const r = gradeStep(step, response);
      if (r.empty) { status.textContent = 'Tulis jawaban berupa angka.'; return; }
      status.textContent = '';
      tries += 1;
      if (tries === 1) firstTry[index] = r.correct;
      if (r.correct) {
        input.disable?.();
        check.hidden = true;
        const lanjut = h('button', { type: 'button', class: 'btn btn--primary', onClick: next }, 'Lanjut ▶');
        feedbackSlot.replaceChildren(await feedbackPanel({ correct: true, actions: [lanjut] }));
        lanjut.focus();
        return;
      }
      let text = null;
      if (step.type === 'highlight') {
        text = r.wrong.length ? `Ada data yang tidak dibutuhkan: ${r.wrong.join('; ')}.` : 'Masih ada informasi penting yang belum ditandai.';
      }
      if (tries >= 2) {
        input.disable?.();
        check.hidden = true;
        const lanjut = h('button', { type: 'button', class: 'btn btn--primary', onClick: next }, 'Lanjut ▶');
        feedbackSlot.replaceChildren(await feedbackPanel({ correct: false, text: answerText(step, opsiKonsep), misconception: r.misconception, actions: [lanjut] }));
      } else {
        feedbackSlot.replaceChildren(await feedbackPanel({ correct: false, text: text ?? 'Coba periksa lagi, lalu tekan Periksa.', misconception: r.misconception }));
      }
    });

    const showHint = guided.has(step.step);
    body.replaceChildren(h('article', { class: 'card q-card' },
      step.type === 'highlight' ? null : stemBlock(item.stem, item.stemSimple),
      step.type === 'highlight' ? null : h('p', { class: 'muted' }, mathText(item.pertanyaan)),
      h('h2', { class: 'q-sub' }, mathText(step.prompt)),
      input.el,
      showHint ? hints.el : null,
      status,
      h('div', { class: 'q-actions' }, check),
      feedbackSlot));
  }

  async function finish() {
    head.replaceChildren(stepProgress(LANGKAH.length));
    const auto = firstTry.filter((v) => v !== null && v !== undefined);
    const correct = auto.every(Boolean);
    await recordAttempt({
      qid: item.id, feature: 'bedah-soal', unit: item.unit, correct, hintsUsed: hints.count(),
      timeMs: Date.now() - started, stageScores: firstTry.map((v) => (v == null ? null : v ? 1 : 0)), jawabanTeks: texts,
    });
    const refleksi = h('textarea', { class: 'input q-text', rows: 2, 'aria-label': 'Refleksi', placeholder: 'Tulis jawabanmu (tidak dinilai)…' });
    body.replaceChildren(h('section', { class: 'card q-summary' },
      h('h2', {}, 'Soal selesai diurai!'),
      h('p', {}, `Langkah tepat pada percobaan pertama: ${auto.filter(Boolean).length} dari ${auto.length}.`),
      h('h3', {}, 'Pembahasan'),
      h('p', {}, mathText(item.explanation)),
      h('h3', {}, 'Refleksi'),
      h('p', {}, mathText(item.refleksi)),
      refleksi,
      h('div', { class: 'q-actions' }, h('a', { class: 'btn btn--primary', href: '#/bedah' }, 'Soal lain'))));
  }

  showStep();
}

export async function render(container, params = {}) {
  const [data, kk] = await Promise.all([loadData('bedah-soal'), loadData('kenali-konsep')]);
  const item = data.items.find((it) => it.id === params.id);
  if (item) { bedahItem(container, item, kk.opsiKonsep); return; }

  container.append(
    pageHeader('Bedah Soal', { back: '#/', sub: 'Diketahui → Ciri → Konsep → Jawab → Simpulkan' }),
    h('p', { class: 'card' }, 'Urai soal cerita langkah demi langkah. Tentukan konsepnya sebelum menghitung.'),
    ...['mudah', 'sedang', 'sulit'].map((lv) => h('section', {},
      h('h2', { class: 'q-group' }, LEVEL_NAME[lv]),
      h('ul', { class: 'menu-list' }, data.items.filter((it) => it.level === lv).map((it) => h('li', {},
        h('a', { class: 'menu-item', href: `#/bedah/${it.id}` },
          h('span', { class: 'menu-item__icon', 'aria-hidden': 'true' }, '🧩'),
          h('span', { class: 'menu-item__title' }, it.id),
          h('span', { class: 'menu-item__desc' }, it.stem.length > 70 ? `${it.stem.slice(0, 70)}…` : it.stem))))))));
}
