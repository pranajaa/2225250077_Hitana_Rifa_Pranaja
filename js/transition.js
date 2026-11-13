// Transisi "tenggelam" saat menekan menu: riak di titik ketuk → air naik menutup layar
// → halaman berganti di balik air → air terus naik ke atas (kesan turun ke kedalaman).
// Dilewati bila pengguna memilih "kurangi gerakan" di perangkatnya.

const SELECTOR = 'a.menu-item, a.nav__item';
const BUBBLES = 9;
let busy = false;

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Menunggu router selesai merender halaman baru (event dari app.js), maksimal `ms`. */
function waitForRender(ms = 1500) {
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); window.removeEventListener('relafun:rendered', done); resolve(); };
    const timer = setTimeout(done, ms);
    window.addEventListener('relafun:rendered', done);
  });
}

function buildOverlay(x, y) {
  const overlay = document.createElement('div');
  overlay.className = 'sink';
  overlay.setAttribute('aria-hidden', 'true');

  const ripple = document.createElement('span');
  ripple.className = 'sink__ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  const water = document.createElement('div');
  water.className = 'sink__water';
  for (let i = 0; i < BUBBLES; i += 1) {
    const b = document.createElement('span');
    b.className = 'sink__bubble';
    const size = 6 + Math.round(Math.random() * 14);
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${5 + Math.random() * 90}%`;
    b.style.animationDelay = `${Math.round(Math.random() * 250)}ms`;
    water.append(b);
  }

  overlay.append(ripple, water);
  return { overlay, ripple, water };
}

/** Transisi tenggelam ke `href` dengan riak di titik (x, y). Diekspor untuk animasi perosotan. */
export async function play(href, x, y) {
  busy = true;
  const { overlay, ripple, water } = buildOverlay(x, y);
  document.body.append(overlay);
  try {
    // 1. Riak di titik ketuk
    ripple.animate(
      [{ transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }],
      { duration: 380, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
    );
    // 2. Air naik dari bawah menutup layar.
    //    Ditunggu dengan timer, bukan animation.finished (bisa tidak pernah selesai bila tab dijeda).
    water.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 340, delay: 80, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' },
    );
    await sleep(80 + 340);

    // 3. Ganti halaman di balik air
    const rendered = waitForRender();
    if (location.hash !== href) location.hash = href;
    else window.dispatchEvent(new Event('relafun:rendered'));
    await rendered;

    // 4. Air terus naik keluar layar → halaman baru terlihat
    water.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }],
      { duration: 380, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' },
    );
    await sleep(380);
  } finally {
    overlay.remove();
    busy = false;
  }
}

function onClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest(SELECTOR);
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href?.startsWith('#')) return;
  if (href === location.hash) return;            // sudah di halaman itu
  if (reducedMotion() || !document.body.animate) return; // biarkan pindah biasa

  event.preventDefault();
  if (busy) return;
  // Ketukan keyboard (Enter) tidak punya koordinat → riak dari tengah tautan
  let { clientX: x, clientY: y } = event;
  if (!x && !y) {
    const r = link.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  }
  play(href, x, y);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Animasi perosotan (setelah Masuk): maskot yang berdiri melompat, perosotan tergambar dari
 * titik pendaratannya, maskot meluncur ke bawah, tercebur → transisi tenggelam → halaman `href`.
 * Tanpa animasi (kurangi gerakan / browser lama) → langsung pindah.
 */
export async function slideTo(href) {
  const canOffsetPath = window.CSS?.supports?.('offset-path', "path('M0 0 L1 1')");
  const standing = document.querySelector('.backdrop__mascot');
  if (busy || reducedMotion() || !document.body.animate || !canOffsetPath || !standing) {
    location.hash = href;
    return;
  }
  busy = true;
  const w = window.innerWidth;
  const hgt = window.innerHeight;

  // Gambar utuh maskot berdiri (lebar kotak = lebar gambar; tinggi mengikuti rasio 420:900)
  const box = standing.getBoundingClientRect();
  const img = { left: box.left, top: box.top, width: box.width, height: box.width * (900 / 420) };
  const unit = img.height / 900;                       // piksel per satuan kanvas maskot
  const hip = [img.left + img.width * 0.48, img.top + 448 * unit];

  // Ukuran maskot meluncur disamakan dengan maskot berdiri (dibatasi agar muat di layar)
  const riderH = Math.min(640 * unit, 0.45 * hgt);
  const riderScale = riderH / (640 * unit);

  // Perosotan dimulai tepat di titik pendaratan (sedikit di atas pinggul) dan menurun
  // ke sisi layar yang lebih jauh.
  const dir = hip[0] > w / 2 ? -1 : 1;
  const start = [hip[0], hip[1] - img.height * 0.04];
  const end = [dir > 0 ? 1.08 * w : -0.08 * w, 0.86 * hgt];
  const c1 = [start[0] + dir * 0.18 * w, start[1] + 0.02 * hgt];
  const c2 = [start[0] + (end[0] - start[0]) * 0.35, end[1]];
  const d = `M${start} C${c1} ${c2} ${end}`;

  const scene = document.createElement('div');
  scene.className = 'slide-scene';
  scene.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'slide-scene__ramp');
  svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
  const ramp = [];
  for (const [cls, width] of [['ramp-edge', 40], ['ramp-body', 28], ['ramp-water', 8]]) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', cls);
    path.setAttribute('stroke-width', String(width));
    svg.append(path);
    ramp.push(path);
  }

  // Maskot berdiri yang melompat (salinan gambar latar di posisi yang sama)
  const jumper = document.createElement('img');
  jumper.className = 'slide-scene__jumper';
  jumper.src = getComputedStyle(standing).backgroundImage.slice(5, -2) || './assets/maskot/beranda.svg';
  jumper.alt = '';
  Object.assign(jumper.style, {
    left: `${img.left}px`, top: `${img.top}px`, width: `${img.width}px`, height: `${img.height}px`,
  });

  const rider = document.createElement('img');
  rider.className = 'slide-scene__rider';
  rider.src = './assets/maskot/meluncur.svg';
  rider.alt = '';
  rider.style.height = `${riderH}px`;
  rider.style.offsetPath = `path('${d}')`;
  rider.style.opacity = '0';
  if (dir < 0) rider.style.transform = 'scaleX(-1)';   // menghadap arah luncur

  scene.append(svg, jumper, rider);
  document.body.append(scene);
  document.body.classList.add('is-sliding');
  try {
    // 1. Latar meredup; maskot jongkok lalu melompat dan mendarat di ujung atas perosotan
    scene.animate([{ backgroundColor: 'rgb(10 60 160 / 0)' }, { backgroundColor: 'rgb(10 60 160 / 0.55)' }],
      { duration: 300, fill: 'forwards' });
    // Tinggi lompatan dibatasi agar kepala tidak keluar dari atas layar
    const rise = -Math.min(img.height * 0.25, Math.max(20, img.top));
    const land = start[1] - hip[1];
    jumper.animate([
      { transform: 'translateY(0) scale(1, 1)', offset: 0 },
      { transform: 'translateY(6px) scale(1.04, 0.92)', offset: 0.2 },      // ancang-ancang
      { transform: `translateY(${rise}px) scale(0.97, 1.05)`, offset: 0.6 }, // melayang
      { transform: `translateY(${land}px) scale(${riderScale})`, offset: 1 },  // mendarat
    ], { duration: 620, easing: 'ease-out', fill: 'forwards' });

    // 2. Perosotan "tergambar" dari titik pendaratan saat maskot di udara
    for (const path of ramp) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = path.classList.contains('ramp-water') ? '18 14' : `${len}`;
      if (!path.classList.contains('ramp-water')) {
        path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 420, delay: 150, easing: 'ease-out', fill: 'forwards' });
      } else {
        path.animate([{ opacity: 0 }, { opacity: 0.9 }], { duration: 200, delay: 500, fill: 'forwards' });
      }
    }
    await sleep(620);

    // 3. Ganti ke pose meluncur di titik yang sama, lalu meluncur makin cepat
    jumper.remove();
    rider.style.opacity = '1';
    rider.animate(
      [{ offsetDistance: '0%' }, { offsetDistance: '100%' }],
      { duration: 1250, easing: 'cubic-bezier(.45,0,.85,.6)', fill: 'forwards' },
    );
    await sleep(1100);

    // 4. Tercebur di ujung perosotan → tenggelam → Beranda
    busy = false;
    await play(href, dir > 0 ? 0.86 * w : 0.14 * w, 0.82 * hgt);
  } finally {
    scene.remove();
    document.body.classList.remove('is-sliding');
    busy = false;
  }
}

export function initSinkTransition() {
  document.addEventListener('click', onClick);
}
