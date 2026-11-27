// AI Pembahas Soal: siswa mengetik soal → AI mengurai 5 langkah (identifikasi, konsep, alasan, langkah, kesimpulan).
// Mode Petunjuk: hanya pertanyaan penuntun (server membuang konsep/kesimpulan). Mode Pembahasan: lengkap + peringatan.
// Soal & hasil hanya di memori halaman; tidak disimpan. Teks layar dari data/ai.json → pembahas.
import {
  analyzeProblem, checkStatus, isOnline, loadAiConfig, SOAL_MAX, validateSoal,
} from '../ai.js';
import { h, mathText, pageHeader } from '../ui.js';

let controller = null;

export function destroy() {
  controller?.abort();
  controller = null;
}

const list = (items) => h('ul', { class: 'solve__list' }, items.map((item) => h('li', {}, mathText(item))));

/** Satu langkah bernomor. Dilewati bila isinya kosong. */
function step(title, ...body) {
  const content = body.flat().filter(Boolean);
  if (content.length === 0) return null;
  return h('li', { class: 'card solve__step' }, h('h2', { class: 'solve__title' }, title), content);
}

function identification(result, labels) {
  return step(labels.identifikasi,
    result.diketahui.length ? [h('h3', {}, labels.diketahui), list(result.diketahui)] : null,
    result.ditanya ? [h('h3', {}, labels.ditanya), h('p', {}, mathText(result.ditanya))] : null);
}

/** Menyusun tampilan hasil. Semua teks AI lewat mathText (text node), tidak pernah innerHTML. */
export function renderResult(result, text, { onShowFull } = {}) {
  const labels = text.steps;
  if (result.diLuarTopik) return [h('p', { class: 'note' }, text.outOfTopic)];

  const missing = result.infoKurang?.length
    ? h('div', { class: 'note' }, h('strong', {}, labels.infoKurang), list(result.infoKurang))
    : null;

  if (result.mode === 'petunjuk') {
    return [
      h('ol', { class: 'solve', 'aria-label': 'Petunjuk' },
        identification(result, labels),
        step(labels.penuntun, result.pertanyaanPenuntun.length ? list(result.pertanyaanPenuntun) : null),
        step(labels.arah, result.arahLangkah.length ? list(result.arahLangkah) : null)),
      missing,
      h('p', { class: 'note' }, text.hintNote),
      onShowFull ? h('button', { class: 'btn', type: 'button', onClick: onShowFull }, text.showFull) : null,
    ];
  }

  return [
    h('p', { class: 'note solve__warning', role: 'note' }, h('span', { 'aria-hidden': 'true' }, '⚠️ '), text.warning),
    h('ol', { class: 'solve', 'aria-label': 'Pembahasan' },
      identification(result, labels),
      step(labels.konsep, result.konsep ? h('p', { class: 'solve__concept' }, result.konsep) : null),
      step(labels.alasan, result.alasan ? h('p', {}, mathText(result.alasan)) : null),
      step(labels.langkah, result.langkah.length
        ? h('ol', { class: 'solve__list solve__list--num' }, result.langkah.map((s) => h('li', {}, mathText(s))))
        : null),
      step(labels.kesimpulan, result.kesimpulan ? h('p', {}, mathText(result.kesimpulan)) : null)),
    missing,
  ];
}

export async function render(container) {
  const config = await loadAiConfig();
  const msg = config.messages;
  const text = config.pembahas;
  let ready = false;
  let mode = 'petunjuk';

  const note = h('p', { class: 'note', hidden: true });
  const status = h('p', { class: 'chat__status', role: 'status' }, config.checking);
  const output = h('div', { class: 'solve-output', 'aria-live': 'polite' });
  const input = h('textarea', {
    id: 'soal', class: 'input solve__input', rows: 5, maxlength: SOAL_MAX + 100,
    placeholder: text.placeholder, disabled: true,
  });
  const submitBtn = h('button', { class: 'btn btn--primary btn--block', type: 'submit', disabled: true }, text.submit);

  const radios = text.modes.map((m) => h('input', {
    type: 'radio', name: 'mode', value: m.id, id: `mode-${m.id}`, class: 'visually-hidden', checked: m.id === mode,
    onChange: () => { mode = m.id; },
  }));
  const modePicker = h('fieldset', { class: 'mode-pick' },
    h('legend', { class: 'mode-pick__legend' }, text.modeLabel),
    text.modes.map((m, i) => h('div', { class: 'mode-pick__item' },
      radios[i],
      h('label', { for: `mode-${m.id}`, class: 'mode-pick__label' },
        h('strong', {}, m.label),
        h('span', { class: 'mode-pick__desc' }, m.desc)))));

  const chips = h('div', { class: 'chips', 'aria-label': text.examplesLabel },
    text.examples.map((example) => h('button', {
      class: 'chip', type: 'button', disabled: true,
      onClick: () => { input.value = example; input.focus(); }, // diisi saja; tidak langsung dikirim (hemat kuota)
    }, example)));

  const setBusy = (busy) => {
    const off = busy || !ready;
    input.disabled = off;
    submitBtn.disabled = off;
    for (const r of radios) r.disabled = off;
    for (const b of chips.querySelectorAll('button')) b.disabled = off;
    status.textContent = busy ? text.thinking : '';
  };

  const showNote = (code) => {
    const mapped = { tooShort: 'soalShort', tooLong: 'soalLong' }[code] ?? code;
    status.textContent = msg[mapped] ?? msg.server;
  };

  async function submit(forceMode) {
    if (!ready || controller) return;
    const soal = input.value.trim();
    const invalid = validateSoal(soal);
    if (invalid) {
      showNote(invalid);
      input.focus();
      return;
    }
    if (!isOnline()) {
      showNote('offline');
      return;
    }
    const useMode = forceMode ?? mode;
    if (forceMode) {
      mode = forceMode;
      for (const r of radios) r.checked = r.value === forceMode;
    }
    output.replaceChildren();
    setBusy(true);
    controller = new AbortController();
    const res = await analyzeProblem({ soal, mode: useMode, signal: controller.signal });
    controller = null;
    if (res.code === 'aborted') return;
    setBusy(false);
    if (!res.ok) {
      showNote(res.code);
      return;
    }
    output.replaceChildren(...renderResult(res.result, text, {
      onShowFull: () => submit('pembahasan'),
    }).filter(Boolean));
    output.querySelector('h2, .note')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  const form = h('form', {
    class: 'card solve-form',
    onSubmit: (event) => { event.preventDefault(); submit(); },
  },
  h('p', {}, text.intro),
  h('p', { class: 'muted chat__privacy' }, `🔒 ${config.privacyNote}`),
  note,
  h('label', { for: 'soal', class: 'solve__label' }, text.label),
  input,
  h('p', { class: 'muted solve__examples-label' }, text.examplesLabel),
  chips,
  modePicker,
  status,
  submitBtn);

  container.append(pageHeader(text.title, { back: '#/' }), form, output);

  checkStatus({ onSlow: () => { if (form.isConnected) status.textContent = msg.waking; } }).then((state) => {
    if (!form.isConnected) return;
    ready = state.ready;
    if (!ready) {
      note.textContent = msg[state.code] ?? msg.unavailable;
      note.hidden = false;
    }
    setBusy(false);
  });
}
