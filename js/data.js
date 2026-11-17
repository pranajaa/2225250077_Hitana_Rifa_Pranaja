// Memuat file konten di data/*.json (dengan cache di memori).

const cache = new Map();

export async function loadData(name) {
  if (!cache.has(name)) {
    const promise = fetch(`./data/${name}.json`).then((res) => {
      if (!res.ok) throw new Error(`Gagal memuat data/${name}.json (${res.status})`);
      return res.json();
    });
    cache.set(name, promise);
    promise.catch(() => cache.delete(name));
  }
  return cache.get(name);
}

/** Map id → label konsep dan daftar unit. */
export async function loadConcepts() {
  const data = await loadData('concepts');
  return {
    units: data.units,
    conceptLabel: Object.fromEntries(data.concepts.map((c) => [c.id, c.label])),
  };
}

export async function loadMisconceptions() {
  const data = await loadData('misconceptions');
  return Object.fromEntries(data.misconceptions.map((m) => [m.id, m]));
}
