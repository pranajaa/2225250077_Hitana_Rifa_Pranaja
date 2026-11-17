// Misi Literasi (F11): soal kontekstual bertahap, skor per tahap & skor parsial (docs/08).
// Setiap tahap dinilai sekali (asesmen). Tahap alasan tertulis dinilai guru → "menunggu penilaian guru".
import { loadData } from '../data.js';
import { arrowDiagram } from '../diagram.js';
import { scoreStage, summarizeMission } from '../literacy-scorer.js';
import { LITERACY_INDICATORS } from '../progress.js';
import {
  choiceList, feedbackPanel, hintBox, pairsBuilder, reasonInput, recordAttempt, renderVisual, setPicker, stemBlock,
} from '../quiz-ui.js';
import { load } from '../storage.js';
import { h, mathText, pageHeader } from '../ui.js';

const IND = Object.fromEntries(LITERACY_INDICATORS.map((i) => [i.code, i]));
const SET_LABEL = { domain: 'Domain (daerah asal)', kodomain: 'Kodomain (daerah kawan)', daerahHasil: 'Range (daerah hasil)', tanpaPasangan: 'Anggota domain tanpa pasangan' };

const modelsOf = (m) => (m.model ? [m.model] : Object.values(m.models));
/** Kumpulan pilihan anggota: gabungan A dan B, diurutkan agar urutan tidak membocorkan jawaban. */
const poolOf = (m) => [...new Set(modelsOf(m).flatMap((x) => [...x.A, ...x.B]))].sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));

function yesNo() {
  const c = choiceList(['Ya', 'Tidak']);
  return { ...c, value: () => (c.value() == null ? null : c.value() === 0) };
}

function stageInput(mission, stage) {
  const m0 = modelsOf(mission)[0];
  switch (stage.type) {
    case 'mcq': return choiceList(stage.options);
    case 'multi': return choiceList(stage.options, { multi: true });
    case 'tf': return yesNo();
    case 'tf-multi': {
      const rows = Object.keys(stage.answer).map((k) => [k, yesNo()]);
      return {
        el: h('div', {}, rows.map(([k, c]) => h('div', { class: 'q-row' }, h('p', { class: 'q-sub' }, k.replace(/(\D+)(\d+)/, (_, a, n) => `${a[0].toUpperCase()}${a.slice(1)} ${n}`)), c.el))),
        value: () => (rows.some(([, c]) => c.value() == null) ? null : Object.fromEntries(rows.map(([k, c]) => [k, c.value()]))),
        disable: () => rows.forEach(([, c]) => c.disable()),
      };
    }
    case 'set': return setPicker(m0.B);
    case 'set-pair':
    case 'set-triple': {
      const keys = stage.type === 'set-pair' ? ['domain', 'kodomain'] : Object.keys(stage.answer);
      const pool = poolOf(mission);
      const pickers = keys.map((k) => [k, setPicker(pool, { label: SET_LABEL[k] ?? k })]);
      return {
        el: h('div', {}, pickers.map(([, p]) => p.el)),
        value: () => Object.fromEntries(pickers.map(([k, p]) => [k, p.value()])),
        disable: () => pickers.forEach(([, p]) => p.disable()),
      };
    }
    case 'pairs': { const b = pairsBuilder(m0.A, m0.B); return b; }
    case 'pairs-multi': {
      const builders = Object.keys(stage.answer).map((k) => [k, pairsBuilder(mission.models[k].A, mission.models[k].B)]);
      return {
        el: h('div', {}, builders.map(([k, b]) => h('div', { class: 'q-row' }, h('p', { class: 'q-sub' }, k.replace('kondisi', 'Kondisi ')), b.el))),
        value: () => Object.fromEntries(builders.map(([k, b]) => [k, b.value()])),
        disable: () => builders.forEach(([, b]) => b.disable()),
      };
    }
    case 'diagram-choice': {
      const diagrams = choiceList(stage.diagrams.map((d) => d.label), { label: 'Pilih diagram' });
      const figs = h('div', { class: 'diagram-choices' }, stage.diagrams.map((d) => h('figure', { class: 'diagram-figure' },
        h('figcaption', {}, d.label), arrowDiagram({ ...d, labelA: '', labelB: '' }))));
      const reason = choiceList(stage.reasons.map((r) => r.text), { label: 'Alasan pemilihan' });
      return {
        el: h('div', {}, figs, h('p', { class: 'q-sub' }, 'Diagram yang sesuai:'), diagrams.el, h('p', { class: 'q-sub' }, 'Alasan pemilihanmu:'), reason.el),
        value: () => (diagrams.value() == null || reason.value() == null ? null : { diagram: diagrams.value(), reason: reason.value() }),
        disable: () => { diagrams.disable(); reason.disable(); },
      };
    }
    case 'reason': {
      const text = reasonInput();
      const bantuan = stage.bantuan?.length ? choiceList(stage.bantuan, { label: 'Bantuan' }) : null;
      return {
        el: h('div', {}, bantuan ? h('p', { class: 'muted q-sub' }, 'Bantuan (tidak wajib):') : null, bantuan?.el, text.el),
        value: () => ({ text: text.value(), bantuan: bantuan?.value() ?? null }),
        valid: () => text.valid(),
        disable: () => { text.disable(); bantuan?.disable(); },
      };
    }
    default: throw new Error(`Tipe tahap tidak dikenal: ${stage.type}`);
  }
}

const isEmpty = (v) => v == null || (Array.isArray(v) && v.length === 0)
  || (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => Array.isArray(x) && x.length === 0));

function correctText(mission, stage) {
  const a = stage.answer;
  switch (stage.type) {
    case 'mcq': return `Jawaban: ${stage.options[a]}`;
    case 'multi': return `Jawaban: ${a.map((i) => stage.options[i]).join(', ')}`;
    case 'tf': return `Jawaban: ${a ? 'Ya' : 'Tidak'}`;
    case 'set': return `Jawaban: {${a.join(', ')}}`;
    case 'set-pair': return `Domain = {${a.domain.join(', ')}}; kodomain = {${a.kodomain.join(', ')}}`;
    case 'set-triple': return Object.entries(a).map(([k, v]) => `${SET_LABEL[k] ?? k} = {${v.join(', ')}}`).join('; ');
    case 'pairs': return `Jawaban: {${(mission.model?.pairs ?? []).map(([x, y]) => `(${x}, ${y})`).join(', ')}}`;
    case 'pairs-multi': return Object.keys(a).map((k) => `${k.replace('kondisi', 'Kondisi ')}: {${mission.models[k].pairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}}`).join(' · ');
    case 'tf-multi': return Object.entries(a).map(([k, v]) => `${k}: ${v ? 'Ya' : 'Tidak'}`).join(', ');
    case 'diagram-choice': return `Jawaban: ${stage.diagrams[a].label}. ${stage.reasons.find((r) => r.correct)?.text ?? ''}`;
    default: return '';
  }
}

function missionView(container, mission) {
  const started = Date.now();
  const ind = IND[mission.indicator];
  const results = [];
  const texts = {};
  const hints = hintBox(mission.hints);
  let index = 0;
  const head = h('div', { class: 'q-head' });
  const body = h('div', {});
  const context = h('details', { class: 'card lm-context', open: true },
    h('summary', {}, 'Soal & data'),
    stemBlock(mission.stem, mission.stemSimple),
    mission.data ? renderVisual(mission.data) : null);
  container.append(
    pageHeader(`Misi: ${mission.title}`, { back: '#/literasi', sub: `${mission.id} · ${ind.name} (${mission.indicator})` }),
    head, context, body);

  const scoreSoFar = () => results.reduce((s, r) => s + (r.score ?? 0), 0);

  function showStage() {
    if (index >= mission.stages.length) { finish(); return; }
    const stage = mission.stages[index];
    head.replaceChildren(
      h('span', { class: 'q-head__count' }, `Tahap ${index + 1}/${mission.stages.length}`),
      h('span', { class: 'q-head__score' }, `Skor: ${scoreSoFar()}/${mission.maxScore}`));
    const input = stageInput(mission, stage);
    const status = h('p', { class: 'chat__status', role: 'status' });
    const feedbackSlot = h('div', {});
    const check = h('button', { type: 'button', class: 'btn btn--primary' }, stage.type === 'reason' ? 'Simpan jawaban' : 'Periksa');
    const next = h('button', { type: 'button', class: 'btn btn--primary', onClick: () => { index += 1; showStage(); window.scrollTo(0, 0); } }, index + 1 < mission.stages.length ? 'Tahap berikutnya ▶' : 'Lihat hasil ▶');

    check.addEventListener('click', async () => {
      const response = input.value();
      if (stage.type === 'reason') {
        if (!input.valid()) { status.textContent = 'Tulis alasanmu minimal 10 huruf.'; return; }
        texts[stage.n] = response.text;
      } else if (isEmpty(response)) {
        status.textContent = 'Lengkapi jawabanmu dulu.';
        return;
      }
      status.textContent = '';
      input.disable();
      check.hidden = true;
      const r = scoreStage(mission, stage, response);
      results.push(r);
      const fb = r.pending
        ? { correct: null, title: '📝 Jawabanmu tersimpan. Tahap ini dinilai guru.' }
        : {
          correct: r.correct,
          title: r.correct ? `✔ Tepat! +${r.score}` : r.score > 0 ? `◐ Sebagian tepat: ${r.score} dari ${r.max}` : '✘ Belum tepat',
          text: r.correct ? null : correctText(mission, stage),
          misconception: r.misconception,
        };
      feedbackSlot.replaceChildren(await feedbackPanel({ ...fb, actions: [next] }));
      next.focus();
    });

    body.replaceChildren(h('article', { class: 'card q-card' },
      h('h2', { class: 'q-sub' }, mathText(stage.prompt)),
      input.el, hints.el, status,
      h('div', { class: 'q-actions' }, check),
      feedbackSlot));
  }

  async function finish() {
    const sum = summarizeMission(results);
    head.replaceChildren(h('span', { class: 'q-head__count' }, 'Misi selesai'),
      h('span', { class: 'q-head__score' }, `Skor otomatis: ${sum.autoScore}/${sum.autoMax}`));
    await recordAttempt({
      qid: mission.id, feature: 'misi-literasi', indicator: mission.indicator,
      correct: sum.autoScore === sum.autoMax, score: sum.autoScore, maxScore: sum.autoMax,
      stageScores: results.map((r) => r.score), pendingTeacher: sum.pendingStages, jawabanTeks: texts,
      hintsUsed: hints.count(), timeMs: Date.now() - started,
    });
    const refleksi = h('textarea', { class: 'input q-text', rows: 2, 'aria-label': 'Refleksi', placeholder: 'Tulis jawabanmu (tidak dinilai)…' });
    body.replaceChildren(h('section', { class: 'card q-summary' },
      h('h2', {}, 'Rubrik misi'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table rubric' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Tahap'), h('th', { scope: 'col' }, 'Skor kamu'), h('th', { scope: 'col' }, 'Skor maks.'))),
        h('tbody', {}, results.map((r, i) => h('tr', {},
          h('td', {}, String(i + 1)),
          h('td', {}, r.score == null ? 'Menunggu guru' : `${r.correct ? '✔' : r.score > 0 ? '◐' : '✘'} ${r.score}`),
          h('td', {}, String(r.max))))))),
      h('p', {}, `Skor otomatis: ${sum.autoScore} dari ${sum.autoMax}.${sum.pendingMax ? ` ${sum.pendingMax} poin lagi dinilai guru.` : ''}`),
      h('h3', {}, 'Contoh jawaban ideal'),
      h('p', {}, mathText(mission.modelAnswer)),
      h('h3', {}, 'Refleksi'),
      h('p', {}, mathText(mission.refleksi)),
      refleksi,
      h('div', { class: 'q-actions' }, h('a', { class: 'btn btn--primary', href: '#/literasi' }, 'Misi lain'))));
    context.open = false;
  }

  showStage();
}

export async function render(container, params = {}) {
  const data = await loadData('misi-literasi');
  const mission = data.items.find((m) => m.id === params.id);
  if (mission) { missionView(container, mission); return; }

  const best = {};
  for (const a of load().attempts) {
    if (a.feature !== 'misi-literasi' || typeof a.score !== 'number') continue;
    if (!best[a.qid] || a.score > best[a.qid].score) best[a.qid] = a;
  }
  container.append(
    pageHeader('Misi Literasi', { back: '#/', sub: 'Soal kehidupan nyata, skor per tahap' }),
    h('p', { class: 'card' }, 'Setiap misi punya beberapa tahap. Tahap yang tepat tetap mendapat skor walau tahap lain belum tepat.'),
    ...LITERACY_INDICATORS.map((ind) => h('section', {},
      h('h2', { class: 'q-group' }, `${ind.name} (${ind.code})`),
      h('ul', { class: 'menu-list' }, data.items.filter((m) => m.indicator === ind.code).map((m) => h('li', {},
        h('a', { class: 'menu-item', href: `#/literasi/${m.id}` },
          h('span', { class: 'menu-item__icon', 'aria-hidden': 'true' }, '🎯'),
          h('span', { class: 'menu-item__title' }, `${m.id} · ${m.title}`),
          h('span', { class: 'menu-item__desc' }, best[m.id] ? `Skor terbaik: ${best[m.id].score}/${best[m.id].maxScore} (otomatis)` : 'Belum dikerjakan'))))))));
}
