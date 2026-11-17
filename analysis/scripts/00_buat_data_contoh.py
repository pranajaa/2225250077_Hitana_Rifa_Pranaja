"""Membuat DATA CONTOH (sintetis) untuk mencoba alur analisis sebelum ada data siswa asli.

File diberi awalan 'contoh_' dan laporan akan menandainya sebagai data contoh.
Hapus file contoh_* di data/raw/ sebelum memasukkan data penelitian asli.

Jalankan: python scripts/00_buat_data_contoh.py
"""
import _setup  # noqa: F401

import numpy as np
import pandas as pd

from relafun_stats.config import EXPORT_COLUMNS, RAW_DIR, SAMPLE_PREFIX, SUS_COLUMNS

RNG = np.random.default_rng(2026)
N_STUDENTS = 30
MISCONCEPTIONS = [f"M{i:02d}" for i in range(1, 11)]
CONCEPT_ITEMS = [f"PT-{i:03d}" for i in range(1, 19)]
CONCEPT_DIFFICULTY = np.linspace(-1.5, 1.5, len(CONCEPT_ITEMS))
# Butir literasi: skor per tahap mengikuti Tabel Kisi-kisi (maks. 6 per butir)
LITERACY_ITEMS = {
    "LM-101": ("LR", [1, 2, 1, 1, 1]),
    "LM-102": ("LF", [1, 1, 1, 1, 1, 1]),
    "LM-103": ("LE", [1, 2, 2, 1]),
    "LM-104": ("LI", [1, 1, 1, 1, 1, 1]),
}


def p_correct(theta: float, b: float) -> float:
    return 1 / (1 + np.exp(-(theta - b)))


def answer_rows(code: str, session: str, theta: float, day: int) -> list[dict]:
    rows = []
    ts = f"2026-12-{day:02d}T08:00:00Z"
    for item, b in zip(CONCEPT_ITEMS, CONCEPT_DIFFICULTY):
        ok = RNG.random() < p_correct(theta, b)
        misc = ""
        if not ok and RNG.random() < 0.7:
            misc = MISCONCEPTIONS[CONCEPT_ITEMS.index(item) % len(MISCONCEPTIONS)]
        # Pre/post-test: hint tidak disediakan, jadi hint_count = 0 dan hint = 0.
        rows.append({"kode_siswa": code, "sesi": session, "qid": item, "fitur": "kuis",
                     "indikator": "", "tahap": 1, "skor": int(ok), "skor_maks": 1,
                     "benar": int(ok), "miskonsepsi": misc, "hint": 0,
                     "waktu_ms": int(RNG.integers(15_000, 90_000)), "timestamp": ts,
                     "hint_count": 0, "jawaban_teks": ""})
    for item, (indicator, stage_max) in LITERACY_ITEMS.items():
        for stage, mx in enumerate(stage_max, start=1):
            b = -1.0 + 0.35 * stage
            score = int(RNG.binomial(mx, p_correct(theta, b)))
            last = stage == len(stage_max)
            # Tahap terakhir misi = alasan tertulis (dinilai guru); contoh teks sintetis berisi koma.
            text = "Fungsi, karena setiap anggota domain punya tepat satu pasangan." if last and score else ""
            rows.append({"kode_siswa": code, "sesi": session, "qid": item, "fitur": "misi-literasi",
                         "indikator": indicator, "tahap": stage, "skor": score, "skor_maks": mx,
                         "benar": int(score == mx), "miskonsepsi": "", "hint": 0,
                         "waktu_ms": int(RNG.integers(20_000, 120_000)), "timestamp": ts,
                         "hint_count": 0, "jawaban_teks": text})
    return rows


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    codes = [f"S{i:02d}" for i in range(1, N_STUDENTS + 1)]
    sus_rows, cl_rows = [], []
    for code in codes:
        theta_pre = RNG.normal(-0.3, 1.0)
        theta_post = theta_pre + RNG.normal(0.9, 0.35)
        rows = answer_rows(code, "pretest", theta_pre, 1) + answer_rows(code, "posttest", theta_post, 15)
        pd.DataFrame(rows, columns=EXPORT_COLUMNS).to_csv(
            RAW_DIR / f"{SAMPLE_PREFIX}relafun_hasil_{code}.csv", index=False)

        odd = np.clip(np.round(RNG.normal(4.2, 0.7, 5)), 1, 5)
        even = np.clip(np.round(RNG.normal(1.8, 0.7, 5)), 1, 5)
        sus = [int(v) for pair in zip(odd, even) for v in pair]
        sus_rows.append({"kode_siswa": code, **dict(zip(SUS_COLUMNS, sus))})

        cl = {"kode_siswa": code}
        for prefix, mean in [("il", 5.0), ("el", 2.5), ("gl", 7.5)]:
            for i in range(1, 4):
                cl[f"{prefix}{i}"] = int(np.clip(round(RNG.normal(mean, 1.3)), 0, 10))
        cl_rows.append(cl)

    pd.DataFrame(sus_rows).to_csv(RAW_DIR / f"{SAMPLE_PREFIX}angket_sus.csv", index=False)
    pd.DataFrame(cl_rows).to_csv(RAW_DIR / f"{SAMPLE_PREFIX}angket_beban_kognitif.csv", index=False)
    print(f"Data contoh dibuat untuk {N_STUDENTS} siswa di {RAW_DIR}")


if __name__ == "__main__":
    main()
