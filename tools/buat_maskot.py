"""Membuat maskot RELAFUN (tokoh orisinal: siswa SMP berseragam putih-biru) dalam beberapa pose,
serta latar adegan bawah laut. Alat pengembang — hasilnya file SVG statis di assets/.

Jalankan dari root proyek:
    analysis\\.venv\\Scripts\\python tools/buat_maskot.py

Ciri tokoh: rambut tebal, kacamata, seragam SMP putih-biru.
Gaya: siluet biru dengan garis cahaya cyan di tepi (filter SVG), tanpa teks, tanpa aset luar.
Satu pose per menu; bagian tubuh disusun dari titik sendi agar pose mudah diubah.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_MASKOT = ROOT / "assets" / "maskot"
OUT_LATAR = ROOT / "assets" / "latar"

# Palet terang (biru langit/cyan; tokoh bersiluet navy dengan cahaya tepi putih-cyan)
HAIR = "#071a4d"
SKIN = "#2b63c4"
SHIRT = "#dff1ff"        # kemeja putih seragam, tersinari cahaya laut
SHIRT_DARK = "#a8d0f5"
PANTS = "#0d2a78"
SHOE = "#04123d"
STRAP = "#1b4aa6"
RIM = "#bdf7ff"
EYE = "#effcff"
PROP = "#0f3d94"
PROP_LIGHT = "#7ff0ff"

SHOULDER_L = (150, 228)
SHOULDER_R = (250, 228)
HIP_L = (182, 448)
HIP_R = (218, 448)

Point = tuple[float, float]


def lerp(a: Point, b: Point, t: float) -> Point:
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def line(a: Point, b: Point, color: str, width: float) -> str:
    return (f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" '
            f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>')


def arm(shoulder: Point, elbow: Point, hand: Point, *, hand_visible: bool = True) -> str:
    """Lengan: lengan baju pendek (warna kemeja) lalu lengan bawah & tangan."""
    sleeve_end = lerp(shoulder, elbow, 0.55)
    parts = [
        line(shoulder, elbow, SKIN, 26),
        line(elbow, hand, SKIN, 23),
        line(shoulder, sleeve_end, SHIRT, 40),
    ]
    if hand_visible:
        parts.append(f'<circle cx="{hand[0]:.0f}" cy="{hand[1]:.0f}" r="15" fill="{SKIN}"/>')
    return "".join(parts)


def leg(hip: Point, knee: Point, ankle: Point, toe_dir: int) -> str:
    shoe_cx = ankle[0] + 10 * toe_dir
    return (line(hip, knee, PANTS, 46) + line(knee, ankle, PANTS, 40)
            + f'<ellipse cx="{shoe_cx:.0f}" cy="{ankle[1] + 14:.0f}" rx="34" ry="15" fill="{SHOE}"/>')


def head(tilt: float = 0, look_up: float = 0) -> str:
    """Kepala: rambut tebal bervolume (poni menyamping, berhenti di atas kacamata — mata tetap terlihat)
    dan kacamata berbingkai terang agar wajah terkesan ramah."""
    ey = 150 - look_up
    gy = ey - 1  # pusat lensa kacamata
    return f"""
  <g transform="rotate({tilt} 200 196)">
    <rect x="186" y="170" width="28" height="40" rx="8" fill="{SKIN}"/>
    <ellipse cx="200" cy="140" rx="42" ry="52" fill="{SKIN}"/>
    <ellipse cx="157" cy="148" rx="7" ry="12" fill="{SKIN}"/>
    <ellipse cx="243" cy="148" rx="7" ry="12" fill="{SKIN}"/>
    <!-- massa rambut tebal: lebar & bervolume, menutupi sisi kepala sampai atas telinga -->
    <path d="M148,140 C136,104 146,72 172,62 C196,52 226,54 246,66 C266,80 268,112 254,142
             C250,126 244,114 236,108 C236,118 234,124 230,128 C224,116 216,108 206,104
             C194,110 180,110 168,104 C160,112 152,124 148,140 Z" fill="{HAIR}"/>
    <!-- jumputan di sisi dan atas (kesan rambut tebal, tidak meninggi) -->
    <path d="M146,118 L134,112 L146,104 L136,94 L152,92 Z" fill="{HAIR}"/>
    <path d="M256,118 L268,110 L256,102 L264,90 L250,90 Z" fill="{HAIR}"/>
    <path d="M168,66 L164,52 L180,60 L186,46 L198,58 L208,46 L214,58 L228,50 L228,64 Z" fill="{HAIR}"/>
    <!-- poni menyamping ke kanan, ujungnya di atas alis -->
    <path d="M164,106 C178,86 216,80 242,106 C228,100 214,104 206,120 C200,108 190,104 178,114
             C176,110 170,108 164,106 Z" fill="{HAIR}"/>
    <path d="M222,72 C232,76 240,84 244,94" stroke="{SKIN}" stroke-width="3" fill="none"
          opacity="0.5" stroke-linecap="round"/>
    <!-- mata -->
    <g class="eyes" style="transform-origin:200px {ey}px">
      <ellipse cx="184" cy="{ey}" rx="4.5" ry="6" fill="{EYE}"/>
      <ellipse cx="216" cy="{ey}" rx="4.5" ry="6" fill="{EYE}"/>
    </g>
    <!-- kacamata: lensa kotak membulat, jembatan, gagang ke telinga -->
    <g fill="{EYE}" fill-opacity="0.12" stroke="{EYE}" stroke-width="3.5">
      <rect x="166" y="{gy - 13}" width="34" height="26" rx="9"/>
      <rect x="204" y="{gy - 13}" width="34" height="26" rx="9"/>
    </g>
    <path d="M200,{gy - 3} Q202,{gy - 7} 204,{gy - 3} M166,{gy - 6} L156,{gy - 8} M238,{gy - 6} L248,{gy - 8}"
          stroke="{EYE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M172,{gy - 6} L180,{gy - 9} M210,{gy - 6} L218,{gy - 9}" stroke="#ffffff"
          stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <!-- senyum -->
    <path d="M190,{ey + 26} Q200,{ey + 32} 210,{ey + 26}" stroke="{EYE}" stroke-width="2.5"
          fill="none" stroke-linecap="round" opacity="0.85"/>
  </g>"""


def torso() -> str:
    """Kemeja putih seragam SMP (di sini biru muda karena cahaya laut), dimasukkan, dengan ikat pinggang."""
    return f"""
  <path d="M164,428 L236,428 L244,478 L156,478 Z" fill="{PANTS}"/>
  <path d="M148,214 Q200,200 252,214 L264,246 L242,300 L240,432 L160,432 L158,300 L136,246 Z"
        fill="{SHIRT}"/>
  <path d="M200,212 L200,432" stroke="{SHIRT_DARK}" stroke-width="3"/>
  <path d="M178,206 L200,240 L222,206" stroke="{SHIRT_DARK}" stroke-width="4" fill="none"
        stroke-linejoin="round" opacity="0.9"/>
  <rect x="212" y="262" width="26" height="28" rx="3" fill="{SHIRT_DARK}"/>
  <path d="M220,268 L230,268 L230,278 L225,284 L220,278 Z" fill="{EYE}" opacity="0.7"/>
  <rect x="158" y="424" width="84" height="12" fill="{SHOE}"/>
  <rect x="194" y="424" width="12" height="12" fill="{PROP_LIGHT}" opacity="0.6"/>
  <path d="M158,216 L166,300" stroke="{STRAP}" stroke-width="8" stroke-linecap="round"/>
  <path d="M242,216 L234,300" stroke="{STRAP}" stroke-width="8" stroke-linecap="round"/>"""


# ---------- Properti per menu ----------
def prop_book() -> str:
    return f"""
  <g transform="rotate(-6 200 318)">
    <path d="M134,292 L200,302 L200,360 L134,350 Z" fill="{PROP}" stroke="{PROP_LIGHT}" stroke-width="3"/>
    <path d="M266,292 L200,302 L200,360 L266,350 Z" fill="{PROP}" stroke="{PROP_LIGHT}" stroke-width="3"/>
    <path d="M146,310 L188,316 M146,324 L188,330 M212,316 L254,310 M212,330 L254,324"
          stroke="{PROP_LIGHT}" stroke-width="2.5" opacity="0.7"/>
  </g>"""


def prop_magnifier() -> str:
    return f"""
  {line((300, 228), (322, 190), PROP, 12)}
  <circle cx="338" cy="160" r="36" fill="{PROP_LIGHT}" fill-opacity="0.22"
          stroke="{PROP_LIGHT}" stroke-width="7"/>
  <path d="M320,146 Q328,134 342,132" stroke="#ffffff" stroke-width="4" fill="none"
        stroke-linecap="round" opacity="0.7"/>"""


def prop_puzzle() -> str:
    return f"""
  <g transform="rotate(14 350 186)">
    <path d="M320,156 L340,156 C338,140 362,140 360,156 L380,156 L380,176 C396,174 396,198 380,196
             L380,216 L320,216 Z" fill="{PROP}" stroke="{PROP_LIGHT}" stroke-width="4"
          stroke-linejoin="round"/>
  </g>"""


def prop_notebook() -> str:
    return f"""
  <g transform="rotate(-14 196 348)">
    <rect x="150" y="318" width="92" height="64" rx="4" fill="{PROP}" stroke="{PROP_LIGHT}" stroke-width="3"/>
    <path d="M160,336 L230,336 M160,350 L222,350 M160,364 L214,364" stroke="{PROP_LIGHT}"
          stroke-width="2.5" opacity="0.7"/>
  </g>"""


def prop_pencil() -> str:
    return line((214, 330), (248, 284), "#ffd84d", 8) + line((214, 330), (206, 342), PROP_LIGHT, 5)


def prop_chart() -> str:
    bars = []
    for i, height in enumerate((40, 70, 105, 145)):
        x = 300 + i * 22
        bars.append(f'<rect x="{x}" y="{400 - height}" width="16" height="{height}" '
                    f'fill="{PROP_LIGHT}" fill-opacity="{0.35 + i * 0.18:.2f}"/>')
    return f"""
  <g>
    {''.join(bars)}
    <path d="M296,402 L392,402" stroke="{PROP_LIGHT}" stroke-width="3"/>
    <path d="M304,350 L326,318 L348,296 L374,246" stroke="#ffffff" stroke-width="4"
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>"""


def prop_star() -> str:
    """Bintang target misi di ujung jari."""
    return f"""
  <path class="twinkle" style="transform-origin:358px 96px" d="M372,64 L380,86 L404,86 L385,100 L392,122 L372,108 L352,122 L359,100 L340,86 L364,86 Z"
        fill="#ffd84d" opacity="0.95" transform="translate(-14 4) scale(0.9)"/>"""


# ---------- Pose ----------
STAND_LEGS = leg(HIP_L, (176, 650), (172, 830), -1) + leg(HIP_R, (226, 650), (232, 830), 1)
WALK_LEGS = leg(HIP_L, (170, 648), (186, 826), -1) + leg(HIP_R, (232, 640), (214, 830), 1)

# Setiap pose: `rest` = lengan/properti diam, `move` = lengan + properti yang bergerak saat idle.
# `pivot` = titik putar (biasanya bahu), `swing` = sudut ayunan (derajat), `dur` = lama satu siklus (detik),
# `look` = sudut menoleh kepala.
POSES: dict[str, dict] = {
    # Beranda: santai, tangan kanan di saku, tangan kiri berayun pelan, kepala menoleh perlahan
    "beranda": dict(
        head=head(tilt=-4, look_up=4), legs=WALK_LEGS, behind="",
        rest=arm(SHOULDER_R, (276, 322), (236, 410), hand_visible=False),
        move=arm(SHOULDER_L, (136, 332), (150, 428)),
        pivot=SHOULDER_L, swing=3, dur=5.0, look=3),
    # Materi: kedua tangan memegang buku; buku bergerak pelan seperti sedang membaca
    "materi": dict(
        head=head(tilt=3, look_up=-6), legs=STAND_LEGS, behind="", rest="",
        move=arm(SHOULDER_L, (128, 318), (150, 338)) + arm(SHOULDER_R, (272, 318), (250, 338)) + prop_book(),
        pivot=(200, 240), swing=1.5, dur=4.5, look=2),
    # Kenali: kaca pembesar diayun mencari-cari
    "kenali": dict(
        head=head(tilt=6), legs=STAND_LEGS, behind="",
        rest=arm(SHOULDER_L, (134, 332), (148, 430)),
        move=arm(SHOULDER_R, (300, 300), (300, 230)) + prop_magnifier(),
        pivot=SHOULDER_R, swing=6, dur=3.6, look=2),
    # Bedah: potongan puzzle diputar-putar
    "bedah": dict(
        head=head(tilt=5), legs=WALK_LEGS, behind="",
        rest=arm(SHOULDER_L, (118, 326), (170, 414)),
        move=arm(SHOULDER_R, (306, 270), (338, 222)) + prop_puzzle(),
        pivot=SHOULDER_R, swing=7, dur=3.0, look=2),
    # Latihan: pensil bergerak cepat kecil seperti menulis
    "latihan": dict(
        head=head(tilt=4, look_up=-8), legs=STAND_LEGS, behind="",
        rest=arm(SHOULDER_L, (138, 324), (172, 360)) + prop_notebook(),
        move=arm(SHOULDER_R, (272, 316), (220, 330)) + prop_pencil(),
        pivot=SHOULDER_R, swing=2.5, dur=0.9, look=1.5),
    # Misi literasi: menunjuk bintang yang berkelip
    "literasi": dict(
        head=head(tilt=-6, look_up=5), legs=WALK_LEGS, behind="",
        rest=arm(SHOULDER_L, (110, 330), (172, 418)),
        move=arm(SHOULDER_R, (300, 176), (346, 118)) + prop_star(),
        pivot=SHOULDER_R, swing=4, dur=3.2, look=2),
    # Progres: menunjuk-nunjuk grafik yang naik
    "progres": dict(
        head=head(tilt=8), legs=STAND_LEGS, behind=prop_chart(),
        rest=arm(SHOULDER_L, (136, 332), (152, 428)),
        move=arm(SHOULDER_R, (300, 286), (336, 250)),
        pivot=SHOULDER_R, swing=5, dur=2.6, look=2),
    # Meluncur (animasi perosotan Masuk → Beranda): duduk, kaki lurus ke depan-bawah, kedua tangan
    # terangkat gembira. Kanvas dipotong (tinggi 680) agar alas gambar = posisi duduk di perosotan.
    "meluncur": dict(
        head=head(tilt=-8, look_up=6),
        legs=leg(HIP_L, (262, 520), (338, 580), 1) + leg(HIP_R, (288, 500), (366, 556), 1),
        behind="", rest="",
        move=arm(SHOULDER_L, (118, 168), (104, 92)) + arm(SHOULDER_R, (284, 164), (304, 88)),
        pivot=(200, 228), swing=4, dur=0.6, look=3, height=640),
}


def idle_css(pose: dict) -> str:
    """Animasi idle: bernapas (badan atas), menoleh, berkedip, lengan bergerak, bintang berkelip.
    Hanya transform/opacity agar ringan; dimatikan saat 'kurangi gerakan'."""
    px, py = pose["pivot"]
    sw, look = pose["swing"], pose["look"]
    return f"""
    .upper {{ animation: breathe 4s ease-in-out infinite; }}
    .head {{ transform-origin: 200px 196px; animation: look 7s ease-in-out infinite; }}
    .move {{ transform-origin: {px}px {py}px; animation: swing {pose['dur']}s ease-in-out infinite; }}
    .eyes {{ animation: blink 5.5s infinite; }}
    .twinkle {{ animation: twinkle 1.8s ease-in-out infinite; }}
    @keyframes breathe {{ 0%, 100% {{ transform: translateY(0); }} 50% {{ transform: translateY(-4px); }} }}
    @keyframes look {{ 0%, 100% {{ transform: rotate(0deg); }} 30% {{ transform: rotate({look}deg); }}
                       65% {{ transform: rotate(-{look}deg); }} }}
    @keyframes swing {{ 0%, 100% {{ transform: rotate(0deg); }} 50% {{ transform: rotate(-{sw}deg); }} }}
    @keyframes blink {{ 0%, 93%, 100% {{ transform: scaleY(1); }} 95% {{ transform: scaleY(0.1); }} }}
    @keyframes twinkle {{ 0%, 100% {{ transform: scale(1); opacity: 1; }} 50% {{ transform: scale(1.18); opacity: 0.7; }} }}
    @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}"""


def mascot_svg(pose: dict) -> str:
    vh = pose.get("height", 900)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 {vh}" width="420" height="{vh}">
  <!-- Maskot RELAFUN (tokoh orisinal). Dibuat oleh tools/buat_maskot.py — jangan diedit manual. -->
  <defs>
    <style>{idle_css(pose)}
    </style>
    <filter id="rim" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="fat"/>
      <feFlood flood-color="{RIM}"/>
      <feComposite in2="fat" operator="in" result="edge"/>
      <feGaussianBlur in="edge" stdDeviation="5" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="202" cy="858" rx="120" ry="16" fill="#ffffff" opacity="0.22"/>
  <ellipse cx="202" cy="858" rx="70" ry="8" fill="#ffffff" opacity="0.3"/>
  <g filter="url(#rim)">
    {pose['behind']}
    {pose['legs']}
    <g class="upper">
      {torso()}
      <g class="head">{pose['head']}</g>
      {pose['rest']}
      <g class="move">{pose['move']}</g>
    </g>
  </g>
</svg>
"""


def scene_svg() -> str:
    """Latar adegan statis: riak permukaan, berkas cahaya, jendela kelas tenggelam, gelembung.
    (Ikan yang bergerak ada di ikan.svg.)"""
    bubbles = []
    for x, y, r in ((420, 210, 9), (408, 262, 5), (930, 330, 12), (912, 380, 6), (1040, 150, 10),
                    (260, 660, 14), (276, 700, 7), (1010, 880, 12), (150, 960, 6), (600, 120, 5)):
        bubbles.append(f'<circle cx="{x}" cy="{y}" r="{r}"/>')
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice">
  <!-- Latar bawah laut RELAFUN. Dibuat oleh tools/buat_maskot.py — jangan diedit manual. -->
  <g fill="#ffffff" opacity="0.28">
    <path d="M0,40 C80,20 140,70 230,44 C320,18 360,64 470,40 L470,70 C360,96 310,52 220,78 C130,104 70,60 0,76 Z"/>
    <path d="M620,30 C720,6 780,58 880,32 C980,6 1060,52 1200,28 L1200,60 C1060,86 990,40 890,66 C790,92 720,40 620,62 Z"/>
    <path d="M330,110 C400,94 450,128 540,110 L540,128 C450,146 400,114 330,130 Z"/>
    <path d="M760,120 C820,104 870,134 940,118 L940,134 C870,150 820,122 760,136 Z"/>
  </g>
  <g fill="#ffffff" opacity="0.1">
    <path d="M300,0 L380,0 L180,1000 L60,1000 Z"/>
    <path d="M760,0 L820,0 L1000,1000 L900,1000 Z"/>
    <path d="M540,0 L570,0 L520,1000 L470,1000 Z"/>
  </g>
  <g fill="none" stroke="#e6fbff" stroke-width="10" opacity="0.22">
    <rect x="860" y="260" width="300" height="360"/>
    <path d="M1010,260 V620 M860,440 H1160"/>
    <rect x="890" y="700" width="240" height="250"/>
    <path d="M1010,700 V950"/>
  </g>
  <g fill="#0a2f86" opacity="0.35">
    <path d="M0,640 L140,620 L190,700 L160,1000 L0,1000 Z"/>
  </g>
  <g fill="none" stroke="#ffffff" stroke-width="2" opacity="0.45">{''.join(bubbles)}</g>
</svg>
"""


FISH_PATH = "M0,0 C20,-14 52,-14 70,0 L90,-12 L86,0 L90,12 L70,0 C52,14 20,14 0,0 Z"


def school_svg() -> str:
    """Gerombolan ikan (siluet) menghadap ke kanan; tiap ikan bergoyang naik-turun sedikit."""
    import random
    rng = random.Random(7)  # tetap → hasil sama setiap kali dibuat ulang
    fish = []
    for _ in range(16):
        x = rng.uniform(20, 520)
        y = rng.uniform(30, 200) - (x / 520) * 20
        sc = rng.uniform(0.35, 0.7)
        delay = rng.uniform(0, 1.6)
        fish.append(
            f'<g style="animation-delay:-{delay:.2f}s"><path transform="translate({x:.0f} {y:.0f}) '
            f'scale(-{sc:.2f} {sc:.2f})" d="{FISH_PATH}"/></g>')
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="600" height="240">
  <!-- Gerombolan ikan RELAFUN. Dibuat oleh tools/buat_maskot.py — jangan diedit manual. -->
  <style>
    .f > g {{ animation: bob 1.6s ease-in-out infinite; }}
    @keyframes bob {{ 0%, 100% {{ transform: translateY(0); }} 50% {{ transform: translateY(-5px); }} }}
    @media (prefers-reduced-motion: reduce) {{ .f > g {{ animation: none; }} }}
  </style>
  <g class="f" fill="#0b3a9c" opacity="0.5">{''.join(fish)}</g>
</svg>
"""


def main() -> None:
    OUT_MASKOT.mkdir(parents=True, exist_ok=True)
    OUT_LATAR.mkdir(parents=True, exist_ok=True)
    for name, pose in POSES.items():
        (OUT_MASKOT / f"{name}.svg").write_text(mascot_svg(pose), encoding="utf-8")
        print(f"assets/maskot/{name}.svg")
    (OUT_LATAR / "laut.svg").write_text(scene_svg(), encoding="utf-8")
    (OUT_LATAR / "ikan.svg").write_text(school_svg(), encoding="utf-8")
    print("assets/latar/laut.svg")
    print("assets/latar/ikan.svg")


if __name__ == "__main__":
    main()
