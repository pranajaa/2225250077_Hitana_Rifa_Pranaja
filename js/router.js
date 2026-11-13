// Router berbasis hash: #/materi/U3/2 → pola '/materi/:unit/:screen'
// Hash dipakai agar berjalan di GitHub Pages tanpa konfigurasi server.

const routes = [];
let currentView = null;
let renderToken = 0;

/**
 * Mendaftarkan rute.
 * @param {string} pattern  mis. '/materi/:unit'
 * @param {() => Promise<{render: Function, destroy?: Function}>} loader  impor dinamis view
 */
export function route(pattern, loader) {
  const keys = [];
  const source = pattern.replace(/\/:(\w+)/g, (_, key) => {
    keys.push(key);
    return '/([^/]+)';
  });
  routes.push({ regex: new RegExp(`^${source}/?$`), keys, loader });
}

export function currentPath() {
  return location.hash.slice(1) || '/';
}

export function navigate(path) {
  location.hash = `#${path}`;
}

/** Mencocokkan path dengan rute terdaftar. Diekspor untuk diuji. */
export function matchRoute(path) {
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { route: r, params };
    }
  }
  return null;
}

/**
 * Menjalankan router.
 * @param {HTMLElement} container  tempat view dirender
 * @param {(path: string) => void} [onChange]  dipanggil setelah view tampil
 * @param {(path: string) => string|null} [guard]  mengembalikan path tujuan bila harus dialihkan
 */
export function startRouter(container, onChange, guard) {
  async function handle() {
    const path = currentPath();
    const redirect = guard?.(path);
    if (redirect && redirect !== path) {
      navigate(redirect); // memicu hashchange → handle() lagi
      return;
    }
    const found = matchRoute(path);
    if (!found) {
      navigate('/');
      return;
    }
    const token = ++renderToken;
    const view = await found.route.loader();
    if (token !== renderToken) return; // navigasi lain terjadi saat memuat

    currentView?.destroy?.();
    currentView = view;
    container.replaceChildren();
    await view.render(container, found.params);
    if (token !== renderToken) return;

    window.scrollTo(0, 0);
    container.focus({ preventScroll: true });
    onChange?.(path);
  }

  window.addEventListener('hashchange', handle);
  return handle();
}
