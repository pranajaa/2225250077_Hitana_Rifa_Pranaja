// Materi (F1): daftar unit U0–U7 dan isi unit 6 layar mengikuti RMT (docs/02 §4):
// konsep sehari-hari → representasi → konsep ilmiah → manipulasi → validasi → transendensi & refleksi.
// Isi dari data/materi/Ux.json. Unit berlabel perlu-verifikasi diberi catatan untuk guru.
import { loadConcepts, loadData } from '../data.js';
import { renderVisual, representationTabs } from '../diagram.js';
import { choiceList, questionCard } from '../quiz-ui.js';
import { load, setUnitStatus } from '../storage.js';
import { h, mathText, pageHeader, progressBar } from '../ui.js';

const TAHAP_JUDUL = {
  'konsep-sehari-hari': 'Ayo amati',
  representasi: 'Lihat dalam bentuk lain',
  'konsep-ilmiah': 'Konsep',
  manipulasi: 'Contoh dan bukan contoh',
  validasi: 'Cek pemahaman',
  transendensi: 'Di mana lagi berlaku?',
};
const STATUS = { selesai: '✔ Selesai', sedang: '◐ Sedang dipelajari' };

const paragraphs = (list = []) => list.map((t) => h('p', {}, mathText(t)));

function verifNote(unit) {
  if (unit.sumber !== 'perlu-verifikasi') return null;
  return h('p', { class: 'muted verif-note' }, 'ℹ️ Catatan untuk guru: istilah di unit ini belum dicocokkan dengan buku siswa/LKS.');
}

function respons(r) {
  if (!r) return null;
  const done = h('p', { class: 'muted', hidden: true }, 'Terima kasih! Simpan jawabanmu dalam pikiran, lalu cocokkan di layar berikutnya.');
  if (r.options) {
    const c = choiceList(r.options, { label: r.prompt, onChange: () => { done.hidden = false; } });
    return h('div', { class: 'q-row' }, h('p', { class: 'q-sub' }, mathText(r.prompt)), c.el, done);
  }
  return h('div', { class: 'q-row' }, h('p', { class: 'q-sub' }, mathText(r.prompt)),
    h('textarea', { class: 'input q-text', rows: 2, 'aria-label': r.prompt, placeholder: 'Tulis dugaanmu (tidak dinilai)…' }));
}

/** Isi satu layar (kecuali validasi yang memakai kartu soal). */
function screenContent(unit, layar) {
  switch (layar.tahap) {
    case 'konsep-sehari-hari':
      return [
        h('p', { class: 'note' }, h('strong', {}, '🎯 Tujuan: '), mathText(unit.tujuan)),
        ...paragraphs(layar.teks),
        respons(layar.respons),
        h('p', { class: 'muted' }, h('strong', {}, 'Mengapa penting? '), mathText(unit.makna)),
      ];
    case 'representasi':
      return [
        ...paragraphs(layar.teks),
        layar.visual ? renderVisual(layar.visual) : null,
        layar.visuals ? representationTabs(layar.visuals) : null,
        layar.daftarPeriksa ? h('ol', { class: 'note checklist' }, layar.daftarPeriksa.map((t) => h('li', {}, mathText(t)))) : null,
      ];
    case 'konsep-ilmiah':
      return [
        layar.definisi ? h('div', { class: 'def-box' }, h('p', {}, mathText(layar.definisi)), h('p', { class: 'muted def-box__src' }, `Sumber: ${layar.sumberDefinisi}`)) : null,
        ...paragraphs(layar.teks),
        layar.ingat ? h('p', { class: 'note ingat' }, h('strong', {}, 'Ingat! '), mathText(layar.ingat)) : null,
      ];
    case 'manipulasi':
      return [h('div', { class: 'contoh-list' }, layar.contoh.map((c) => h('div', { class: `contoh contoh--${c.benar ? 'ok' : 'no'}` },
        h('p', { class: 'contoh__badge' }, c.benar ? '✔ Contoh' : '✘ Bukan contoh'),
        c.visual ? renderVisual({ ...c.visual, labelA: c.visual.labelA ?? 'A', labelB: c.visual.labelB ?? 'B' }, { sorot: c.sorot ? [c.sorot] : [] }) : null,
        h('p', {}, mathText(c.teks)))))];
    case 'transendensi':
      return [
        ...paragraphs(layar.teks),
        h('h3', {}, 'Refleksi'),
        h('p', {}, mathText(layar.refleksi)),
        h('textarea', { class: 'input q-text', rows: 2, 'aria-label': 'Refleksi', placeholder: 'Tulis jawabanmu (tidak dinilai)…' }),
      ];
    default:
      return paragraphs(layar.teks);
  }
}

async function unitView(container, unit, unitIds) {
  const total = unit.layar.length;
  const saved = load().units[unit.id];
  let screen = saved?.status === 'selesai' ? 0 : Math.min(saved?.lastScreen ?? 0, total - 1);
  const body = h('div', {});
  // Element.append mengubah null menjadi teks "null", jadi catatan hanya ditambahkan bila ada.
  container.append(...[pageHeader(`${unit.id} · ${unit.title}`, { back: '#/materi' }), verifNote(unit), body].filter(Boolean));

  function go(n) {
    screen = n;
    if (load().units[unit.id]?.status !== 'selesai') setUnitStatus(unit.id, { status: 'sedang', lastScreen: screen });
    show();
    window.scrollTo(0, 0);
  }

  function nav({ nextDisabled = false } = {}) {
    const last = screen === total - 1;
    const nextIdx = unitIds.indexOf(unit.id) + 1;
    const nextUnit = unitIds[nextIdx];
    const finish = () => {
      setUnitStatus(unit.id, { status: 'selesai', lastScreen: screen, completedAt: new Date().toISOString() });
      body.replaceChildren(h('section', { class: 'card q-summary' },
        h('h2', {}, `${unit.id} selesai! 🎉`),
        h('p', {}, 'Kamu sudah menyelesaikan semua layar unit ini.'),
        h('div', { class: 'q-actions' },
          h('a', { class: 'btn', href: '#/materi' }, 'Daftar unit'),
          nextUnit ? h('a', { class: 'btn btn--primary', href: `#/materi/${nextUnit}` }, `Lanjut ${nextUnit} ▶`) : h('a', { class: 'btn btn--primary', href: '#/kenali' }, 'Kenali Konsep ▶'))));
      window.scrollTo(0, 0);
    };
    return h('div', { class: 'q-actions unit-nav' },
      screen > 0 ? h('button', { type: 'button', class: 'btn', onClick: () => go(screen - 1) }, '◀ Kembali') : null,
      h('button', { type: 'button', class: 'btn btn--primary', disabled: nextDisabled, onClick: last ? finish : () => go(screen + 1) }, last ? 'Selesai ✔' : 'Lanjut ▶'));
  }

  function show() {
    const layar = unit.layar[screen];
    const headEl = h('div', { class: 'q-head' },
      h('span', { class: 'q-head__count' }, `Layar ${screen + 1}/${total} · ${TAHAP_JUDUL[layar.tahap] ?? ''}`),
      progressBar((screen + 1) / total, `Layar ${screen + 1} dari ${total}`));

    if (layar.tahap === 'validasi') {
      const items = unit.cekPemahaman;
      let k = 0;
      const slot = h('div', {});
      const navSlot = h('div', {});
      const showQ = () => {
        if (k >= items.length) {
          slot.replaceChildren(h('p', { class: 'card note' }, '✔ Cek pemahaman selesai. Lanjutkan ke layar berikutnya.'));
          navSlot.replaceChildren(nav());
          return;
        }
        slot.replaceChildren(h('p', { class: 'muted' }, `Soal ${k + 1} dari ${items.length}`),
          questionCard(items[k], { feature: 'materi', unit: unit.id, onNext: () => { k += 1; showQ(); } }));
        navSlot.replaceChildren(nav({ nextDisabled: true }));
      };
      body.replaceChildren(headEl, h('h2', {}, TAHAP_JUDUL.validasi), slot, navSlot);
      showQ();
      return;
    }
    body.replaceChildren(headEl, h('section', { class: 'card unit-screen' }, h('h2', {}, TAHAP_JUDUL[layar.tahap] ?? ''), ...screenContent(unit, layar).filter(Boolean)), nav());
  }

  show();
}

export async function render(container, params = {}) {
  const { units } = await loadConcepts();
  const unitIds = units.map((u) => u.id);
  if (params.unit && unitIds.includes(params.unit)) {
    unitView(container, await loadData(`materi/${params.unit}`), unitIds);
    return;
  }
  const state = load();
  const files = await Promise.all(unitIds.map((id) => loadData(`materi/${id}`)));
  const done = units.filter((u) => state.units[u.id]?.status === 'selesai').length;
  container.append(
    pageHeader('Materi', { back: '#/', sub: 'Relasi dan fungsi dalam 8 unit kecil' }),
    h('section', { class: 'card' }, progressBar(done / units.length, `${done} dari ${units.length} unit selesai`),
      h('p', { class: 'muted', style: { margin: 'var(--space-2) 0 0' } }, `${done} dari ${units.length} unit selesai`)),
    h('ul', { class: 'menu-list' }, files.map((u) => h('li', {},
      h('a', { class: 'menu-item', href: `#/materi/${u.id}` },
        h('span', { class: 'menu-item__icon', 'aria-hidden': 'true' }, '📘'),
        h('span', { class: 'menu-item__title' }, `${u.id} · ${u.title}`),
        h('span', { class: 'menu-item__desc' }, [STATUS[state.units[u.id]?.status] ?? 'Belum dimulai', u.sumber === 'perlu-verifikasi' ? ' · ℹ️ belum dicek dengan buku' : ''].join('')))))));
}
