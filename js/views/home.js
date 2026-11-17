// Beranda: sapaan, lanjutkan belajar, menu fitur, konsep yang perlu diulang.
import { loadConcepts } from '../data.js';
import { load } from '../storage.js';
import { weakConcepts } from '../progress.js';
import { installCard, onInstallStateChange } from '../pwa.js';
import { appendChildren, h, progressBar } from '../ui.js';

const FEATURES = [
  { href: '#/materi', icon: '📘', title: 'Materi', desc: 'Pelajari konsepnya' },
  { href: '#/kenali', icon: '🔍', title: 'Kenali Konsep', desc: 'Relasi atau fungsi?' },
  { href: '#/bedah', icon: '🧩', title: 'Bedah Soal', desc: 'Urai soal cerita' },
  { href: '#/latihan', icon: '📝', title: 'Latihan', desc: 'Mudah · Sedang · Sulit' },
  { href: '#/literasi', icon: '🎯', title: 'Misi Literasi', desc: 'Soal kehidupan nyata' },
  { href: '#/progres', icon: '📊', title: 'Progres', desc: 'Lihat kemajuanmu' },
  { href: '#/asisten', icon: '💬', title: 'Tutor AI', desc: 'Tanya jawab dengan AI' },
  { href: '#/pembahas', icon: '🧠', title: 'Pembahas Soal', desc: 'AI bantu tentukan konsep' },
];

let unsubscribe = null;

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
}

/** Slot kartu pemasangan; diperbarui saat tombol pasang dari browser tersedia. */
function installSlot() {
  const slot = h('div', {});
  const fill = () => slot.replaceChildren(...[installCard()].filter(Boolean));
  fill();
  unsubscribe?.();
  unsubscribe = onInstallStateChange(fill);
  return slot;
}

export async function render(container) {
  const state = load();
  const { units, conceptLabel } = await loadConcepts();

  const nextUnit = units.find((u) => state.units[u.id]?.status !== 'selesai') ?? units[0];
  const doneCount = units.filter((u) => state.units[u.id]?.status === 'selesai').length;
  const started = Boolean(state.units[nextUnit.id]);
  const weak = weakConcepts(state.attempts);
  const name = state.profile.nickname?.trim();

  const today = new Date();
  appendChildren(container, [
    h('div', { class: 'daybar' },
      h('span', { class: 'daybar__date' },
        today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })),
      h('span', { class: 'daybar__day' }, today.toLocaleDateString('id-ID', { weekday: 'long' }))),
    h('h1', {}, name ? `Hai, ${name}!` : 'Hai! Ayo belajar relasi dan fungsi.'),

    h('section', { class: 'card', 'aria-labelledby': 'continue-title' },
      h('p', { class: 'muted', style: { margin: 0 } }, started ? 'Lanjutkan belajar' : 'Mulai belajar'),
      h('h2', { id: 'continue-title' }, `${nextUnit.id} · ${nextUnit.title}`),
      progressBar(doneCount / units.length, `${doneCount} dari ${units.length} unit selesai`),
      h('p', { class: 'muted', style: { margin: 'var(--space-2) 0 var(--space-3)' } },
        `${doneCount} dari ${units.length} unit selesai`),
      h('a', { class: 'btn btn--primary btn--block', href: `#/materi/${nextUnit.id}` },
        started ? 'Lanjut ▶' : 'Mulai ▶'),
    ),

    h('nav', { 'aria-label': 'Fitur' },
      h('ul', { class: 'menu-list' },
        FEATURES.map((f) =>
          h('li', {},
            h('a', { class: 'menu-item', href: f.href },
              h('span', { class: 'menu-item__icon', 'aria-hidden': 'true' }, f.icon),
              h('span', { class: 'menu-item__title' }, f.title),
              h('span', { class: 'menu-item__desc' }, f.desc),
            ))),
      ),
    ),

    installSlot(),

    weak.length > 0
      ? h('section', { class: 'note' },
        h('strong', {}, 'Perlu diulang: '),
        weak.map((w) => conceptLabel[w.concept] ?? w.concept).join(', '))
      : null,
  ]);
}
