// Fitur PWA: registrasi service worker, tombol "Pasang aplikasi", notifikasi pembaruan,
// penanda offline, dan permintaan penyimpanan permanen.
import { load, updateSettings } from './storage.js';
import { h } from './ui.js';

let deferredPrompt = null;
const listeners = new Set();

function notify() {
  for (const fn of listeners) fn();
}

/** Dipanggil saat status pemasangan berubah (mis. tombol pasang tersedia). */
export function onInstallStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

export function isIOS() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** 'installed' | 'prompt' (tombol pasang bisa dipakai) | 'ios' | 'manual' */
export function installState() {
  if (isStandalone()) return 'installed';
  if (deferredPrompt) return 'prompt';
  if (isIOS()) return 'ios';
  return 'manual';
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return outcome === 'accepted';
}

/** Kartu "Pasang aplikasi" untuk Beranda; null bila sudah terpasang atau ditutup. */
export function installCard() {
  const state = installState();
  if (state === 'installed' || load().settings.installHintDismissed) return null;

  const close = h('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': 'Tutup petunjuk pemasangan',
    onClick: (e) => {
      updateSettings({ installHintDismissed: true });
      e.currentTarget.closest('.install-card')?.remove();
    },
  }, '✕');

  let body;
  if (state === 'prompt') {
    body = [
      h('p', {}, 'Pasang RELAFUN di HP-mu. Bisa dibuka dari layar utama, tanpa Play Store, dan tetap jalan tanpa internet.'),
      h('button', {
        class: 'btn btn--primary btn--block',
        type: 'button',
        onClick: () => promptInstall(),
      }, '⬇ Pasang aplikasi'),
    ];
  } else if (state === 'ios') {
    body = [
      h('p', {}, 'Pasang di iPhone/iPad (buka lewat Safari):'),
      h('ol', { class: 'steps' },
        h('li', {}, 'Ketuk tombol Bagikan ', h('span', { 'aria-hidden': 'true' }, '⬆'), ' di bawah layar.'),
        h('li', {}, 'Pilih "Tambahkan ke Layar Utama".'),
        h('li', {}, 'Ketuk "Tambah".')),
    ];
  } else {
    body = [
      h('p', {}, 'Pasang di HP Android:'),
      h('ol', { class: 'steps' },
        h('li', {}, 'Buka menu browser ', h('span', { 'aria-hidden': 'true' }, '⋮'), '.'),
        h('li', {}, 'Pilih "Instal aplikasi" atau "Tambahkan ke layar utama".')),
    ];
  }

  return h('section', { class: 'card install-card', 'aria-labelledby': 'install-title' },
    h('div', { class: 'install-card__head' },
      h('h2', { id: 'install-title' }, '📲 Pasang aplikasi'),
      close),
    body);
}

function showToast(message, actionLabel, onAction) {
  document.querySelector('.toast')?.remove();
  const toast = h('div', { class: 'toast', role: 'status' },
    h('span', {}, message),
    actionLabel ? h('button', { class: 'btn btn--primary', type: 'button', onClick: onAction }, actionLabel) : null);
  document.body.append(toast);
  if (!actionLabel) setTimeout(() => toast.remove(), 5000);
  return toast;
}

function watchForUpdates(registration) {
  const offerUpdate = (worker) => {
    showToast('Versi baru RELAFUN tersedia.', 'Muat ulang', () => worker.postMessage('SKIP_WAITING'));
  };
  if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker);
    });
  });
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}

function setupOfflineBanner() {
  const banner = h('div', { class: 'offline-banner', role: 'status', hidden: true },
    'Mode offline — materi dan latihan tetap bisa dipakai.');
  document.body.prepend(banner);
  const update = () => { banner.hidden = navigator.onLine; };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // tampilkan tombol sendiri di Beranda
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
    showToast('RELAFUN berhasil dipasang. Buka dari layar utama.');
  });

  setupOfflineBanner();

  // Setelah dipasang, minta agar progres tidak dihapus otomatis oleh browser saat memori penuh.
  if (isStandalone()) navigator.storage?.persist?.().catch(() => {});

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(watchForUpdates)
        .catch((err) => console.warn('Service worker gagal didaftarkan:', err));
    });
  }
}
