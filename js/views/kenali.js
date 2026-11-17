// Kenali Konsep (F2): menentukan konsep (relasi / fungsi / korespondensi satu-satu) + memilih alasan.
// Konsep dan alasan dinilai terpisah (docs/02 §6). Daftar Periksa Ciri-ciri diambil dari data/materi/U4.json.
import { loadData, loadMisconceptions } from '../data.js';
import { gradeKenali } from '../quiz-engine.js';
import {
  choiceList, feedbackPanel, hintBox, levelMenu, recordAttempt, renderVisual, sessionHead, sessionSummary, stemBlock,
} from '../quiz-ui.js';
import { h, mathText, pageHeader } from '../ui.js';

const LEVEL_NAME = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };

async function checklistBox() {
  const u4 = await loadData('materi/U4');
  const list = u4.layar.find((l) => l.daftarPeriksa)?.daftarPeriksa ?? [];
  const box = h('ol', { class: 'note checklist', hidden: true }, list.map((t) => h('li', {}, mathText(t))));
  const btn = h('button', {
    type: 'button', class: 'btn', 'aria-expanded': 'false',
    onClick: () => { box.hidden = !box.hidden; btn.setAttribute('aria-expanded', String(!box.hidden)); },
  }, '💡 Ciri-ciri');
  return { btn, box };
}

function kenaliCard(item, opsi, onNext) {
  const started = Date.now();
  const concept = choiceList(opsi.map((o) => o.text), { label: 'Konsep' });
  const reason = choiceList(item.reasons.map((r) => r.text), { label: 'Alasan' });
  const hints = hintBox(item.hints);
  const status = h('p', { class: 'chat__status', role: 'status' });
  const feedbackSlot = h('div', {});
  const check = h('button', { type: 'button', class: 'btn btn--primary' }, 'Periksa');
  const card = h('article', { class: 'card q-card' },
    stemBlock(item.stem, item.stemSimple),
    item.visual ? renderVisual(item.visual) : null,
    h('h2', { class: 'q-sub' }, 'Termasuk konsep apa?'),
    concept.el,
    h('h2', { class: 'q-sub' }, 'Mengapa? Pilih alasanmu'),
    reason.el);
  const ciri = checklistBox();

  check.addEventListener('click', async () => {
    const c = concept.value();
    const r = reason.value();
    if (c == null || r == null) { status.textContent = 'Pilih konsep dan alasannya dulu.'; return; }
    status.textContent = '';
    const result = gradeKenali(item, opsi[c].id, r);
    check.hidden = true;
    concept.disable();
    reason.disable();
    hints.hide();
    concept.mark([opsi.findIndex((o) => o.id === item.answer)]);
    reason.mark([item.reasons.findIndex((x) => x.correct)]);
    await recordAttempt({
      qid: item.id, feature: 'kenali-konsep', unit: item.unit, correct: result.conceptCorrect,
      reasonCorrect: result.reasonCorrect, misconception: result.misconception,
      hintsUsed: hints.count(), timeMs: Date.now() - started,
    });
    const title = { benar: '✔ Tepat! Konsep dan alasanmu sudah benar.', alasan: '◐ Konsepnya benar, tetapi alasannya belum tepat.', konsep: '✘ Belum tepat' }[result.case];
    const next = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => onNext(result) }, 'Lanjut ▶');
    feedbackSlot.replaceChildren(await feedbackPanel({
      correct: result.correct, title, text: result.feedback, misconception: result.misconception,
      explanation: item.explanation, actions: [next],
    }));
    next.focus();
  });

  ciri.then(({ btn, box }) => {
    card.append(hints.el, box, status, h('div', { class: 'q-actions' }, btn, check), feedbackSlot);
  });
  return card;
}

export async function render(container, params = {}) {
  const [data] = await Promise.all([loadData('kenali-konsep'), loadMisconceptions()]);
  const level = params.level;
  if (!LEVEL_NAME[level]) {
    const counts = data.items.reduce((o, it) => ({ ...o, [it.level]: (o[it.level] ?? 0) + 1 }), {});
    container.append(
      pageHeader('Kenali Konsep', { back: '#/', sub: 'Relasi, fungsi, atau korespondensi satu-satu?' }),
      h('p', { class: 'card' }, 'Tentukan konsepnya, lalu pilih alasannya. Gunakan tombol Ciri-ciri bila ragu.'),
      levelMenu('#/kenali', counts));
    return;
  }

  const items = data.items.filter((it) => it.level === level);
  const body = h('div', {});
  container.append(pageHeader(`Kenali Konsep ${LEVEL_NAME[level]}`, { back: '#/kenali' }), body);
  let index = 0;
  let correct = 0;
  const start = () => { index = 0; correct = 0; show(); };
  function show() {
    if (index >= items.length) {
      body.replaceChildren(sessionSummary({ correct, total: items.length, onAgain: start, backHref: '#/kenali', backLabel: 'Pilih level lain' }));
      return;
    }
    body.replaceChildren(sessionHead('Soal', index, items.length), kenaliCard(items[index], data.opsiKonsep, (r) => {
      if (r.correct) correct += 1;
      index += 1;
      show();
      window.scrollTo(0, 0);
    }));
  }
  start();
}
