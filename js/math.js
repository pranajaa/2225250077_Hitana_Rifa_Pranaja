// Logika matematika murni — sumber kebenaran untuk memeriksa soal berbasis diagram.
// Definisi mengikuti docs/02-DESAIN-PEMBELAJARAN.md §5. Jangan mengubah definisi tanpa merevisi dokumen.
//
// Representasi: A, B = array anggota himpunan; pairs = array pasangan berurutan [x, y].

/** Menghapus pasangan kembar, misalnya [[1,'a'],[1,'a']] → [[1,'a']]. */
export function uniquePairs(pairs) {
  const seen = new Set();
  const out = [];
  for (const [x, y] of pairs) {
    const key = JSON.stringify([x, y]);
    if (!seen.has(key)) {
      seen.add(key);
      out.push([x, y]);
    }
  }
  return out;
}

/** Relasi dari A ke B: setiap pasangan (x, y) memenuhi x ∈ A dan y ∈ B. */
export function isRelation(A, B, pairs) {
  const setA = new Set(A);
  const setB = new Set(B);
  return pairs.every(([x, y]) => setA.has(x) && setB.has(y));
}

/** Banyak pasangan yang dimiliki tiap anggota A (Map anggota → jumlah). */
export function outDegrees(A, pairs) {
  const deg = new Map(A.map((a) => [a, 0]));
  for (const [x] of uniquePairs(pairs)) {
    if (deg.has(x)) deg.set(x, deg.get(x) + 1);
  }
  return deg;
}

/** Banyak kali tiap anggota B dipasangkan (Map anggota → jumlah). */
export function inDegrees(B, pairs) {
  const deg = new Map(B.map((b) => [b, 0]));
  for (const [, y] of uniquePairs(pairs)) {
    if (deg.has(y)) deg.set(y, deg.get(y) + 1);
  }
  return deg;
}

/**
 * Fungsi (pemetaan) dari A ke B: relasi yang memasangkan SETIAP anggota A
 * dengan TEPAT SATU anggota B.
 * Boleh: dua anggota A berpasangan dengan anggota B yang sama; ada anggota B tanpa pasangan.
 */
export function isFunction(A, B, pairs) {
  if (!isRelation(A, B, pairs)) return false;
  for (const count of outDegrees(A, pairs).values()) {
    if (count !== 1) return false;
  }
  return true;
}

/**
 * Korespondensi satu-satu: fungsi dari A ke B yang juga memasangkan
 * setiap anggota B dengan tepat satu anggota A. Akibatnya n(A) = n(B).
 */
export function isOneToOneCorrespondence(A, B, pairs) {
  if (!isFunction(A, B, pairs)) return false;
  if (new Set(A).size !== new Set(B).size) return false;
  for (const count of inDegrees(B, pairs).values()) {
    if (count !== 1) return false;
  }
  return true;
}

/**
 * Mengklasifikasi relasi — dipakai untuk memeriksa kunci soal Kenali Konsep.
 * @returns {'bukan-relasi'|'relasi'|'fungsi'|'korespondensi-satu-satu'}
 */
export function classifyRelation(A, B, pairs) {
  if (!isRelation(A, B, pairs)) return 'bukan-relasi';
  if (isOneToOneCorrespondence(A, B, pairs)) return 'korespondensi-satu-satu';
  if (isFunction(A, B, pairs)) return 'fungsi';
  return 'relasi';
}

/**
 * Alasan sebuah relasi bukan fungsi (untuk umpan balik).
 * @returns {{ noPair: any[], manyPairs: any[] }} anggota A tanpa pasangan / dengan >1 pasangan
 */
export function functionViolations(A, pairs) {
  const noPair = [];
  const manyPairs = [];
  for (const [a, count] of outDegrees(A, pairs)) {
    if (count === 0) noPair.push(a);
    else if (count > 1) manyPairs.push(a);
  }
  return { noPair, manyPairs };
}

/** Daerah hasil (range): himpunan semua peta, urut sesuai kemunculan di kodomain B bila diberikan. */
export function rangeOf(pairs, B) {
  const images = new Set(uniquePairs(pairs).map(([, y]) => y));
  return B ? B.filter((b) => images.has(b)) : [...images];
}

/** Banyak pemetaan yang mungkin dari A ke B = n(B)^n(A). */
export function countMappings(nA, nB) {
  assertNonNegativeInteger(nA, 'n(A)');
  assertNonNegativeInteger(nB, 'n(B)');
  return nB ** nA;
}

/** n! — banyak korespondensi satu-satu antara dua himpunan dengan n anggota. */
export function factorial(n) {
  assertNonNegativeInteger(n, 'n');
  if (n > 20) throw new RangeError('n terlalu besar (maks. 20)');
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

export function countOneToOneCorrespondences(n) {
  return factorial(n);
}

/**
 * Nilai fungsi polinom f(x) = c0·x^k + … + ck.
 * Contoh: f(x) = 2x − 3 → evaluatePolynomial([2, -3], x); f(x) = x² + 1 → [1, 0, 1].
 */
export function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((acc, c) => acc * x + c, 0);
}

/** Pasangan berurutan dari aturan f pada domain A: [[a, f(a)], ...]. */
export function pairsFromRule(A, rule) {
  return A.map((a) => [a, rule(a)]);
}

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} harus bilangan cacah`);
  }
}
