// Halaman sementara untuk fitur yang belum dibangun (lihat docs/07-ROADMAP.md).
import { h, pageHeader } from '../ui.js';

export function createPlaceholder({ title, icon, desc, phase }) {
  return {
    render(container) {
      container.append(
        pageHeader(title, { back: '#/' }),
        h('div', { class: 'card empty' },
          h('div', { style: { fontSize: '2.5rem' }, 'aria-hidden': 'true' }, icon),
          h('p', {}, desc),
          h('p', { class: 'muted' }, `Fitur ini sedang dibangun (${phase}).`),
          h('a', { class: 'btn btn--primary', href: '#/' }, 'Kembali ke Beranda'),
        ),
      );
    },
  };
}
