// Titik masuk aplikasi: daftar rute, sinkron navigasi aktif, pengaturan tampilan.
import { isSignedIn } from './profile.js';
import { initPwa } from './pwa.js';
import { route, startRouter } from './router.js';
import { initSinkTransition } from './transition.js';
import { load } from './storage.js';
import { h } from './ui.js';

const AUTH_PATH = '/masuk';

route(AUTH_PATH, () => import('./views/masuk.js'));
route('/profil', () => import('./views/masuk.js').then((m) => m.editView));
route('/', () => import('./views/home.js'));
const view = (name) => () => import(`./views/${name}.js`);
route('/materi', view('materi'));
route('/materi/:unit', view('materi'));
route('/kenali', view('kenali'));
route('/kenali/:level', view('kenali'));
route('/bedah', view('bedah'));
route('/bedah/:id', view('bedah'));
route('/latihan', view('latihan'));
route('/latihan/:level', view('latihan'));
route('/literasi', view('literasi'));
route('/literasi/:id', view('literasi'));
route('/progres', () => import('./views/progres.js'));
route('/asisten', () => import('./views/asisten.js'));
route('/pembahas', () => import('./views/pembahas.js'));

function applySettings() {
  const { settings } = load();
  document.documentElement.style.setProperty('--font-scale', String(settings.fontScale ?? 1));
  if (settings.theme === 'light' || settings.theme === 'dark') {
    document.documentElement.dataset.theme = settings.theme;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

/** Belum masuk → ke layar Masuk; sudah masuk tetapi membuka layar Masuk → ke Beranda. */
function authGuard(path) {
  const signedIn = isSignedIn();
  if (!signedIn && path !== AUTH_PATH) return AUTH_PATH;
  if (signedIn && path === AUTH_PATH) return '/';
  return null;
}

function markActiveNav(path) {
  // Layar Masuk/Ubah nama tampil penuh tanpa navigasi.
  document.body.classList.toggle('is-auth', path === AUTH_PATH || path === '/profil');
  const section = `/${path.split('/')[1] ?? ''}`;
  document.body.dataset.section = section.slice(1) || 'beranda'; // pose maskot di latar
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.dispatchEvent(new Event('relafun:rendered')); // untuk js/transition.js
}

applySettings();
initPwa();
initSinkTransition();
const app = document.getElementById('app');
startRouter(app, markActiveNav, authGuard).catch((err) => {
  console.error(err);
  app.replaceChildren(
    h('div', { class: 'card' },
      h('h1', {}, 'Halaman gagal dimuat'),
      h('p', {}, 'Periksa koneksi lalu muat ulang halaman.'),
      h('a', { class: 'btn btn--primary', href: '#/' }, 'Ke Beranda'),
    ),
  );
});
