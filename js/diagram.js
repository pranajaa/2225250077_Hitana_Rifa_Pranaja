// Diagram relasi digambar sebagai SVG dari data (docs/05 §5): diagram panah, Cartesius (dengan garis vertikal
// yang bisa digeser), pasangan berurutan, tabel, dan himpunan. Warna dari token CSS: domain = biru, kodomain = oranye.
// Semua teks dimasukkan sebagai text node (aman dari injeksi HTML).
import { h } from './ui.js';

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) el.setAttribute(k, String(v));
  for (const c of children.flat()) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

/** Deskripsi teks untuk pembaca layar: "1 dipasangkan ke a, … 3 tidak punya pasangan." */
export function describePairs(A, pairs) {
  const parts = pairs.map(([x, y]) => `${x} dipasangkan ke ${y}`);
  const lone = A.filter((a) => !pairs.some(([x]) => String(x) === String(a)));
  for (const a of lone) parts.push(`${a} tidak punya pasangan`);
  return parts.length ? `${parts.join(', ')}.` : 'Tidak ada pasangan.';
}

const fontFor = (text) => (String(text).length > 11 ? 10.5 : String(text).length > 8 ? 12 : 14);

/**
 * Diagram panah dua oval: A (domain, biru) di kiri, B (kodomain, oranye) di kanan.
 * @param {{ A: string[], B: string[], pairs: string[][], labelA?: string, labelB?: string }} v
 * @param {{ sorot?: string[], caption?: string }} [opts]  sorot = anggota A yang panahnya disorot
 */
export function arrowDiagram(v, opts = {}) {
  const id = `ar${(uid += 1)}`;
  const A = v.A.map(String);
  const B = v.B.map(String);
  const sorot = new Set((opts.sorot ?? []).map(String));
  const rowH = 34;
  const top = 34;
  const n = Math.max(A.length, B.length, 1);
  const height = top + n * rowH + 16;
  const cxA = 82;
  const cxB = 258;
  const yOf = (list, i) => top + ((n - list.length) * rowH) / 2 + i * rowH + rowH / 2;
  const ry = (n * rowH) / 2 + 6;
  const cy = top + (n * rowH) / 2;

  const arrows = v.pairs.map(([x, y]) => {
    const i = A.indexOf(String(x));
    const j = B.indexOf(String(y));
    if (i < 0 || j < 0) return null;
    const lit = sorot.has(String(x));
    return s('line', {
      x1: cxA + 46, y1: yOf(A, i), x2: cxB - 50, y2: yOf(B, j),
      class: `diagram__arrow${lit ? ' is-sorot' : ''}`, 'marker-end': `url(#${id}${lit ? 's' : ''})`,
    });
  });
  const label = (text, x, y, cls) => s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: cls, 'font-size': fontFor(text) }, text);
  const svg = s('svg', {
    viewBox: `0 0 340 ${height}`, class: 'diagram diagram--arrow', role: 'img',
    'aria-label': `Diagram panah dari ${v.labelA ?? 'A'} ke ${v.labelB ?? 'B'}. ${describePairs(A, v.pairs)}`,
  },
  s('defs', {},
    s('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
      s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'diagram__head' })),
    s('marker', { id: `${id}s`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
      s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'diagram__head is-sorot' }))),
  label(v.labelA ?? 'A', cxA, 14, 'diagram__set diagram__set--a'),
  label(v.labelB ?? 'B', cxB, 14, 'diagram__set diagram__set--b'),
  s('ellipse', { cx: cxA, cy, rx: 74, ry, class: 'diagram__oval diagram__oval--a' }),
  s('ellipse', { cx: cxB, cy, rx: 74, ry, class: 'diagram__oval diagram__oval--b' }),
  arrows,
  A.map((a, i) => label(a, cxA, yOf(A, i), `diagram__item diagram__item--a${sorot.has(a) ? ' is-sorot' : ''}`)),
  B.map((b, j) => label(b, cxB, yOf(B, j), 'diagram__item diagram__item--b')));
  return opts.caption ? h('figure', { class: 'diagram-figure' }, svg, h('figcaption', {}, opts.caption)) : svg;
}

/**
 * Diagram Cartesius: x = anggota A (sumbu mendatar), y = anggota B (sumbu tegak).
 * Opsi `slider`: garis vertikal yang bisa digeser untuk uji garis vertikal (docs/02 §5).
 */
export function cartesianDiagram(v, opts = {}) {
  const A = v.A.map(String);
  const B = v.B.map(String);
  const left = 64;
  const bottom = 40;
  const top = 18;
  const colW = (340 - left - 16) / Math.max(A.length, 1);
  const rowH = 30;
  const height = top + B.length * rowH + bottom;
  const xOf = (i) => left + colW * (i + 0.5);
  const yOf = (j) => top + (B.length - j - 0.5) * rowH;
  const sorot = new Set((opts.sorot ?? []).map(String));

  const grid = [
    ...A.map((a, i) => s('line', { x1: xOf(i), y1: top, x2: xOf(i), y2: top + B.length * rowH, class: 'diagram__grid' })),
    ...B.map((b, j) => s('line', { x1: left, y1: yOf(j), x2: 340 - 12, y2: yOf(j), class: 'diagram__grid' })),
  ];
  const axes = [
    s('line', { x1: left, y1: top + B.length * rowH, x2: 340 - 8, y2: top + B.length * rowH, class: 'diagram__axis' }),
    s('line', { x1: left, y1: top + B.length * rowH, x2: left, y2: top - 6, class: 'diagram__axis' }),
  ];
  const labels = [
    ...A.map((a, i) => s('text', { x: xOf(i), y: top + B.length * rowH + 16, 'text-anchor': 'middle', class: 'diagram__item diagram__item--a', 'font-size': Math.min(fontFor(a), 12) }, a)),
    ...B.map((b, j) => s('text', { x: left - 8, y: yOf(j), 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'diagram__item diagram__item--b', 'font-size': Math.min(fontFor(b), 12) }, b)),
    s('text', { x: 340 - 12, y: top + B.length * rowH + 34, 'text-anchor': 'end', class: 'diagram__set diagram__set--a' }, `${v.labelA ?? 'A'} →`),
    s('text', { x: 8, y: top - 4, class: 'diagram__set diagram__set--b' }, `↑ ${v.labelB ?? 'B'}`),
  ];
  const points = v.pairs.map(([x, y]) => {
    const i = A.indexOf(String(x));
    const j = B.indexOf(String(y));
    if (i < 0 || j < 0) return null;
    return s('circle', { cx: xOf(i), cy: yOf(j), r: 6, class: `diagram__point${sorot.has(String(x)) ? ' is-sorot' : ''}` });
  });
  const guide = s('line', { x1: xOf(0), y1: top - 4, x2: xOf(0), y2: top + B.length * rowH, class: 'diagram__guide', visibility: 'hidden' });
  const svg = s('svg', {
    viewBox: `0 0 340 ${height}`, class: 'diagram diagram--cartesian', role: 'img',
    'aria-label': `Diagram Cartesius dari ${v.labelA ?? 'A'} ke ${v.labelB ?? 'B'}. Titik: ${v.pairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}.`,
  }, grid, axes, labels, guide, points);
  if (!opts.slider) return svg;

  const output = h('p', { class: 'diagram__readout', 'aria-live': 'polite' }, 'Geser untuk menguji garis vertikal.');
  const range = h('input', {
    type: 'range', min: 0, max: A.length - 1, step: 1, value: 0, class: 'diagram__range',
    'aria-label': 'Posisi garis vertikal',
  });
  const update = () => {
    const i = Number(range.value);
    guide.setAttribute('x1', xOf(i));
    guide.setAttribute('x2', xOf(i));
    guide.setAttribute('visibility', 'visible');
    const count = v.pairs.filter(([x]) => String(x) === A[i]).length;
    output.textContent = `Garis tegak di ${A[i]} memotong ${count} titik.${count === 1 ? ' ✔' : ' ⚠'}`;
  };
  range.addEventListener('input', update);
  return h('div', { class: 'diagram-figure' }, svg, h('label', { class: 'diagram__slider' }, h('span', {}, 'Uji garis vertikal'), range), output);
}

/** Himpunan pasangan berurutan dengan warna anggota sesuai himpunan. */
export function pairsView(pairs) {
  const parts = [];
  pairs.forEach(([x, y], i) => {
    if (i > 0) parts.push(', ');
    parts.push('(', h('span', { class: 'pv-a' }, String(x)), ', ', h('span', { class: 'pv-b' }, String(y)), ')');
  });
  return h('p', { class: 'pairs-view' }, '{', parts, '}');
}

/** Tabel data (docs/08: Baca Data). */
export function tableView({ columns, rows }) {
  return h('div', { class: 'table-wrap' },
    h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {}, columns.map((c, i) => h('th', { scope: 'col', class: i === 0 ? 'pv-a' : i === 1 ? 'pv-b' : null }, c)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, r.map((cell) => h('td', {}, cell)))))));
}

/** Himpunan: A = {…}. */
export function setView({ label, anggota }) {
  return h('p', { class: 'pairs-view' }, h('span', { class: 'pv-a' }, label), ' = {', anggota.join(', '), '}');
}

/** Memilih penampil sesuai visual.kind. */
export function renderVisual(visual, opts = {}) {
  switch (visual.kind) {
    case 'arrow': return arrowDiagram(visual, opts);
    case 'cartesian': return cartesianDiagram(visual, { slider: true, ...opts });
    case 'pairs': return pairsView(visual.pairs);
    case 'table': return tableView(visual);
    case 'set': return setView(visual);
    default: return null;
  }
}

/** Tab Panah / Pasangan / Cartesius / Tabel untuk relasi yang sama (RepresentationToggle). */
export function representationTabs(visuals) {
  const names = { arrow: 'Panah', pairs: 'Pasangan', cartesian: 'Cartesius', table: 'Tabel', set: 'Himpunan' };
  const panel = h('div', { class: 'rep-panel' });
  const tabs = h('div', { class: 'rep-tabs', role: 'tablist' });
  const show = (i) => {
    panel.replaceChildren(renderVisual(visuals[i]));
    [...tabs.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  };
  visuals.forEach((vis, i) => tabs.append(h('button', { type: 'button', class: 'rep-tab', role: 'tab', onClick: () => show(i) }, names[vis.kind] ?? vis.kind)));
  show(0);
  return h('div', { class: 'rep' }, tabs, panel);
}
