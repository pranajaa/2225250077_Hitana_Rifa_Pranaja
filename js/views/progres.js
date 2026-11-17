// Halaman Progres: unit selesai, akurasi per konsep, skor literasi per indikator, miskonsepsi.
import { loadConcepts, loadMisconceptions } from '../data.js';
import { currentName, signOut } from '../profile.js';
import { navigate } from '../router.js';
import { load } from '../storage.js';
import {
  LITERACY_INDICATORS, literacyByIndicator, masteryByConcept, misconceptionCounts,
} from '../progress.js';
import {
  appendChildren, formatPercent, h, pageHeader, progressBar,
} from '../ui.js';

const STATUS_TEXT = { belum: 'Belum dimulai', sedang: 'Sedang belajar', kuasai: 'Kuasai ✔' };

function statRow(label, ratio, extra) {
  return h('div', { class: 'stat-row' },
    h('span', {}, label, extra ? h('span', { class: 'muted' }, ` · ${extra}`) : null),
    progressBar(ratio ?? 0, `${label}: ${formatPercent(ratio)}`),
    h('span', { class: 'stat-row__value' }, formatPercent(ratio)),
  );
}

export async function render(container) {
  const state = load();
  const [{ units, conceptLabel }, misconceptions] = await Promise.all([
    loadConcepts(), loadMisconceptions(),
  ]);

  const doneCount = units.filter((u) => state.units[u.id]?.status === 'selesai').length;
  const mastery = masteryByConcept(state.attempts);
  const literacy = literacyByIndicator(state.attempts);
  const topMisconceptions = misconceptionCounts(state.attempts).slice(0, 3);

  const name = currentName(state);
  container.append(
    pageHeader('Progres Belajarku'),
    h('section', { class: 'card profile-card', 'aria-label': 'Profil' },
      h('span', { class: 'profile-card__avatar', 'aria-hidden': 'true' }, [...name][0]?.toUpperCase() ?? '?'),
      h('span', { class: 'profile-card__name' }, name),
      h('div', { class: 'profile-card__actions' },
        h('a', { class: 'btn', href: '#/profil' }, '✏️ Ubah nama'),
        h('button', {
          class: 'btn',
          type: 'button',
          onClick: () => {
            // eslint-disable-next-line no-alert
            const ok = window.confirm(
              'Keluar akan menghapus nama dan semua progres belajar di perangkat ini. Lanjutkan?',
            );
            if (ok) {
              signOut();
              navigate('/masuk');
            }
          },
        }, 'Keluar'))),
  );

  container.append(
    h('section', { class: 'card' },
      h('h2', {}, 'Unit materi'),
      progressBar(doneCount / units.length),
      h('p', { class: 'muted', style: { marginTop: 'var(--space-2)' } },
        `${doneCount} dari ${units.length} unit selesai`),
    ),
  );

  if (state.attempts.length === 0) {
    container.append(
      h('div', { class: 'card empty' },
        h('p', {}, 'Belum ada data. Yuk mulai dari Materi U0!'),
        h('a', { class: 'btn btn--primary', href: '#/materi/U0' }, 'Mulai U0'),
      ),
    );
  } else {
    appendChildren(container, [
      h('section', { class: 'card' },
        h('h2', {}, 'Penguasaan konsep'),
        Object.entries(conceptLabel).map(([id, label]) => {
          const m = mastery[id] ?? { status: 'belum', accuracy: null };
          return statRow(label, m.accuracy, STATUS_TEXT[m.status]);
        }),
      ),
      h('section', { class: 'card' },
        h('h2', {}, 'Literasi matematika'),
        LITERACY_INDICATORS.map(({ code, name }) =>
          statRow(`${name} (${code})`, literacy[code].ratio)),
      ),
      topMisconceptions.length > 0
        ? h('section', { class: 'card' },
          h('h2', {}, 'Kesalahan tersering'),
          h('ul', {}, topMisconceptions.map(([id, count]) => {
            const m = misconceptions[id];
            return h('li', {},
              `${m?.title ?? id} (${count}×) `,
              m ? h('a', { href: `#/materi/${m.unit}` }, `Ulangi ${m.unit}`) : null);
          })),
        )
        : null,
    ]);
  }
}
