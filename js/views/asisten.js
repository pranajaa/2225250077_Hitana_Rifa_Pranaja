// Tutor AI: tanya-jawab dengan AI lewat server lokal (js/ai.js → server/server.js → Gemini).
// Riwayat hanya di memori (hilang saat aplikasi ditutup); tidak disimpan ke localStorage.
import {
  askAi, checkStatus, isOnline, loadAiConfig, QUESTION_MAX, validateQuestion,
} from '../ai.js';
import { h, mathText, pageHeader } from '../ui.js';

/** @type {{ role: 'user'|'assistant', content: string }[]} */
let history = [];
let controller = null;

export function destroy() {
  controller?.abort();
  controller = null;
}

function bubble(role, text) {
  return h('div', { class: `chat__msg chat__msg--${role === 'user' ? 'user' : 'ai'}` },
    h('span', { class: 'visually-hidden' }, role === 'user' ? 'Kamu: ' : 'Tutor AI: '),
    role === 'user' ? text : mathText(text));
}

export async function render(container) {
  const config = await loadAiConfig();
  const msg = config.messages;
  const text = config.tutor;
  let ready = false;

  const log = h('div', { class: 'chat__log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Percakapan' });
  const status = h('p', { class: 'chat__status', role: 'status' }, config.checking);
  const note = h('p', { class: 'note', hidden: true });
  const input = h('textarea', {
    id: 'ask', class: 'input chat__input', rows: 2, maxlength: QUESTION_MAX + 50,
    placeholder: text.placeholder, 'aria-label': 'Pertanyaan', disabled: true,
  });
  const send = h('button', { class: 'btn btn--primary', type: 'submit', disabled: true }, text.send);
  const chips = h('div', { class: 'chips', 'aria-label': 'Contoh pertanyaan' },
    text.suggestions.map((s) => h('button', {
      class: 'chip', type: 'button', disabled: true,
      onClick: () => { input.value = s; submit(); },
    }, s)));

  const setBusy = (busy) => {
    input.disabled = busy || !ready;
    send.disabled = busy || !ready;
    for (const b of chips.querySelectorAll('button')) b.disabled = busy || !ready;
    status.textContent = busy ? text.thinking : '';
  };

  const showNote = (code) => {
    status.textContent = msg[code] ?? msg.server;
  };

  const reset = h('button', {
    class: 'btn chat__reset', type: 'button',
    onClick: () => { history = []; redraw(); status.textContent = ''; input.focus(); },
  }, text.reset);

  function redraw() {
    log.replaceChildren(...history.map((m) => bubble(m.role, m.content)));
    chips.hidden = history.length > 0;
    reset.hidden = history.length === 0;
    log.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }

  async function submit() {
    if (!ready || controller) return;
    const question = input.value.trim();
    const invalid = validateQuestion(question);
    if (invalid) {
      showNote(invalid);
      input.focus();
      return;
    }
    if (!isOnline()) {
      showNote('offline');
      return;
    }
    history.push({ role: 'user', content: question });
    input.value = '';
    redraw();
    setBusy(true);
    controller = new AbortController();
    const result = await askAi({ mode: 'tanya', history, signal: controller.signal });
    controller = null;
    if (result.code === 'aborted') return; // halaman ditinggalkan
    setBusy(false);
    if (result.ok) {
      history.push({ role: 'assistant', content: result.reply });
      redraw();
    } else {
      history.pop(); // pertanyaan dikembalikan ke kotak isian agar bisa dikirim ulang
      input.value = question;
      redraw();
      showNote(result.code);
    }
    input.focus();
  }

  const form = h('form', {
    class: 'chat__form',
    onSubmit: (event) => { event.preventDefault(); submit(); },
  }, input, send);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); }
  });

  container.append(
    pageHeader(text.title, { back: '#/' }),
    h('section', { class: 'card chat' },
      h('p', {}, text.intro),
      h('p', { class: 'muted chat__privacy' }, `🔒 ${config.privacyNote}`),
      note,
      log,
      chips,
      status,
      form,
      reset),
  );
  redraw();

  // Status server diperiksa tanpa memakai kuota AI. Gagal → pesan; menu lain tidak terpengaruh.
  // Tidak ditunggu, agar perpindahan halaman tidak tertahan.
  checkStatus().then((state) => {
    if (!log.isConnected) return; // halaman sudah ditinggalkan
    ready = state.ready;
    if (!ready) {
      note.textContent = msg[state.code] ?? msg.unavailable;
      note.hidden = false;
    }
    setBusy(false);
  });
}
