"""Membuat ikon aplikasi RELAFUN (PNG) untuk PWA, Android, dan iPhone.

Motif: diagram panah sebuah FUNGSI — himpunan A (putih) ke himpunan B (oranye),
setiap anggota A punya tepat satu panah.

Jalankan dari folder RelaFun (memakai venv analisis yang sudah berisi Pillow):
    analysis\\.venv\\Scripts\\python tools/buat_ikon.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
S = 1024  # digambar besar lalu diperkecil agar halus
BLUE = (47, 111, 235, 255)
WHITE = (255, 255, 255, 255)
ORANGE = (255, 169, 92, 255)


def arrow(draw: ImageDraw.ImageDraw, start, end, width, head):
    (x1, y1), (x2, y2) = start, end
    length = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
    ux, uy = (x2 - x1) / length, (y2 - y1) / length
    bx, by = x2 - ux * head, y2 - uy * head          # pangkal kepala panah
    draw.line([(x1, y1), (bx, by)], fill=WHITE, width=width)
    px, py = -uy * head * 0.6, ux * head * 0.6
    draw.polygon([(x2, y2), (bx + px, by + py), (bx - px, by - py)], fill=WHITE)


def motif(draw: ImageDraw.ImageDraw, scale: float):
    """Menggambar diagram panah; scale < 1 memperkecil motif ke tengah (zona aman maskable)."""
    c = S / 2

    def p(x, y):  # koordinat relatif (0..1) → piksel, diskalakan dari pusat
        return (c + (x * S - c) * scale, c + (y * S - c) * scale)

    def r(v):
        return v * S * scale

    stroke = max(4, round(r(0.028)))
    for cx, color in [(0.30, WHITE), (0.70, ORANGE)]:
        x0, y0 = p(cx - 0.13, 0.24)
        x1, y1 = p(cx + 0.13, 0.76)
        draw.ellipse([x0, y0, x1, y1], outline=color, width=stroke)

    dot = r(0.04)
    left = [p(0.30, 0.37), p(0.30, 0.50), p(0.30, 0.63)]
    right = [p(0.70, 0.42), p(0.70, 0.58)]
    for (x, y) in left:
        draw.ellipse([x - dot, y - dot, x + dot, y + dot], fill=WHITE)
    for (x, y) in right:
        draw.ellipse([x - dot, y - dot, x + dot, y + dot], fill=ORANGE)

    gap = r(0.065)
    for a, b in [(0, 0), (1, 0), (2, 1)]:  # fungsi: tiap anggota A tepat satu panah
        (ax, ay), (bx, by) = left[a], right[b]
        arrow(draw, (ax + gap, ay), (bx - gap, by), max(3, round(r(0.022))), r(0.06))


def make(rounded: bool, scale: float) -> Image.Image:
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if rounded:
        draw.rounded_rectangle([0, 0, S - 1, S - 1], radius=round(S * 0.22), fill=BLUE)
    else:
        draw.rectangle([0, 0, S, S], fill=BLUE)
    motif(draw, scale)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    standard = make(rounded=True, scale=1.0)
    maskable = make(rounded=False, scale=0.78)   # isi di dalam zona aman 80%
    apple = make(rounded=False, scale=0.9)       # iOS membulatkan sudut sendiri
    targets = {
        "icon-192.png": (standard, 192),
        "icon-512.png": (standard, 512),
        "maskable-192.png": (maskable, 192),
        "maskable-512.png": (maskable, 512),
        "apple-touch-icon.png": (apple, 180),
        "favicon-32.png": (standard, 32),
    }
    for name, (img, size) in targets.items():
        out = img.resize((size, size), Image.LANCZOS)
        if name == "apple-touch-icon.png":
            out = out.convert("RGB")  # iOS tidak mendukung transparansi
        out.save(OUT / name, optimize=True)
        print(f"{name} ({size}×{size})")
    print(f"Ikon disimpan di {OUT}")


if __name__ == "__main__":
    main()
