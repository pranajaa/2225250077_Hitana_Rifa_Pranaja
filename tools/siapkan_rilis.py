"""Menyiapkan folder dist/ berisi HANYA file aplikasi, siap diunggah ke hosting (HTTPS).

- Menyalin index.html, manifest, sw.js, css/, js/, data/, assets/ (tanpa docs/, analysis/, tools/).
- Mengisi sw.js di dist/ dengan VERSION = hash isi file dan PRECACHE = semua file aplikasi,
  sehingga aplikasi berfungsi penuh tanpa internet dan pembaruan terdeteksi otomatis.

Jalankan dari folder RelaFun:
    python tools/siapkan_rilis.py
Lalu unggah ISI folder dist/ (lihat docs/10-INSTALASI-DAN-RILIS.md).
"""
from __future__ import annotations

import hashlib
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
FILES = ["index.html", "manifest.webmanifest", "sw.js"]
FOLDERS = ["css", "js", "data", "assets"]
ALLOWED_SUFFIXES = {".html", ".css", ".js", ".json", ".webmanifest", ".png", ".svg", ".woff2"}
MAX_TOTAL_BYTES = 1_500_000  # NF-02: unduhan awal < 1,5 MB


def collect() -> list[Path]:
    paths = [ROOT / f for f in FILES]
    for folder in FOLDERS:
        paths += sorted(p for p in (ROOT / folder).rglob("*")
                        if p.is_file() and p.suffix in ALLOWED_SUFFIXES)
    missing = [p for p in paths if not p.exists()]
    if missing:
        raise FileNotFoundError(f"File tidak ditemukan: {missing}")
    return paths


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass

    paths = collect()
    if DIST.exists():
        shutil.rmtree(DIST)

    digest = hashlib.sha256()
    total = 0
    rel_paths = []
    for src in paths:
        rel = src.relative_to(ROOT).as_posix()
        dst = DIST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        data = src.read_bytes()
        total += len(data)
        if rel != "sw.js":
            digest.update(rel.encode())
            digest.update(data)
            rel_paths.append(rel)

    version = digest.hexdigest()[:10]
    precache = ["./"] + [f"./{p}" for p in rel_paths]
    sw = (DIST / "sw.js").read_text(encoding="utf-8")
    sw, n_version = re.subn(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", sw)
    block = "\n".join(f"  '{p}'," for p in precache)
    sw, n_list = re.subn(r"// __PRECACHE_START__.*?// __PRECACHE_END__",
                         f"// __PRECACHE_START__\n{block}\n  // __PRECACHE_END__",
                         sw, flags=re.S)
    if n_version != 1 or n_list != 1:
        print("GAGAL: penanda VERSION/PRECACHE di sw.js tidak ditemukan")
        return 1
    (DIST / "sw.js").write_text(sw, encoding="utf-8")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")  # GitHub Pages: sajikan file apa adanya

    print(f"Rilis {version}: {len(paths)} file, {total / 1024:.0f} KB → {DIST}")
    if total > MAX_TOTAL_BYTES:
        print(f"PERINGATAN: ukuran melebihi target {MAX_TOTAL_BYTES / 1_000_000:.1f} MB (NF-02)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
