// Helper DOM kecil. Semua teks dimasukkan sebagai text node (aman dari injeksi HTML).

/**
 * Membuat elemen DOM.
 * h('a', { href: '#/', class: 'btn' }, 'Beranda')
 * Atribut `on<Event>` berisi fungsi dipasang sebagai event listener.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, String(value));
  }
  appendChildren(el, children);
  return el;
}

/** Menambahkan anak ke elemen; null/false diabaikan (berbeda dengan Element.append). */
export function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Header halaman dengan tombol kembali opsional. */
export function pageHeader(title, { back, sub } = {}) {
  return h('header', { class: 'page-header' },
    back ? h('a', { class: 'back-link', href: back, 'aria-label': 'Kembali' }, '←') : null,
    h('div', {},
      h('h1', {}, title),
      sub ? h('p', { class: 'page-header__sub' }, sub) : null,
    ),
  );
}

/** Bilah progres; value 0..1. */
export function progressBar(value, label) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return h('div', {
    class: 'progress',
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': pct,
    'aria-label': label ?? `Kemajuan ${pct}%`,
  }, h('div', { class: 'progress__bar', style: { width: `${pct}%` } }));
}

// Pangkat dalam teks: 3^2, n(B)^n(A), 2^(n+1). Basis tidak ikut diubah, hanya bagian setelah ^.
const POWER = /\^(\([^()]{1,20}\)|[A-Za-z0-9]{1,6}(?:\([^()]{1,10}\))?)/g;

/**
 * Teks matematika dari AI → node DOM aman (tanpa innerHTML): pangkat jadi <sup>, "->" jadi "→".
 * Contoh: 'n(B)^n(A) = 3^2' → n(B)<sup>n(A)</sup> = 3<sup>2</sup>
 */
export function mathText(text) {
  const source = String(text ?? '').replace(/\s?->\s?/g, ' → ').replace(/<=/g, '≤').replace(/>=/g, '≥');
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const match of source.matchAll(POWER)) {
    fragment.append(source.slice(last, match.index));
    const power = match[1].startsWith('(') ? match[1].slice(1, -1) : match[1];
    fragment.append(h('sup', {}, power));
    last = match.index + match[0].length;
  }
  fragment.append(source.slice(last));
  return fragment;
}

/** Format persen bulat, atau "—" bila null. */
export function formatPercent(ratio) {
  return ratio == null ? '—' : `${Math.round(ratio * 100)}%`;
}
