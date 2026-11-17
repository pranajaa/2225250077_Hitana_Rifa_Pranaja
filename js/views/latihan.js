// Latihan Bertingkat (F4): pilih level → sesi soal dari data/latihan.json → ringkasan.
import { loadData } from '../data.js';
import { levelMenu, questionCard, sessionHead, sessionSummary } from '../quiz-ui.js';
import { h, pageHeader } from '../ui.js';

const LEVEL_NAME = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };

export async function render(container, params = {}) {
  const data = await loadData('latihan');
  const level = params.level;

  if (!LEVEL_NAME[level]) {
    const counts = data.items.reduce((o, it) => ({ ...o, [it.level]: (o[it.level] ?? 0) + 1 }), {});
    container.append(
      pageHeader('Latihan Bertingkat', { back: '#/', sub: 'Pilih tingkat kesulitan' }),
      h('p', { class: 'card' }, 'Setiap level melatih kemampuan yang berbeda. Mulai dari Mudah, lalu naik bertahap.'),
      levelMenu('#/latihan', counts));
    return;
  }

  const items = data.items.filter((it) => it.level === level);
  const body = h('div', {});
  container.append(pageHeader(`Latihan ${LEVEL_NAME[level]}`, { back: '#/latihan' }), body);

  let index = 0;
  let correct = 0;
  const start = () => { index = 0; correct = 0; show(); };
  function show() {
    if (index >= items.length) {
      body.replaceChildren(sessionSummary({ correct, total: items.length, onAgain: start, backHref: '#/latihan', backLabel: 'Pilih level lain' }));
      return;
    }
    body.replaceChildren(
      sessionHead('Soal', index, items.length),
      questionCard(items[index], {
        feature: 'latihan',
        onNext: (r) => { if (r.correct) correct += 1; index += 1; show(); window.scrollTo(0, 0); },
      }));
  }
  start();
}
