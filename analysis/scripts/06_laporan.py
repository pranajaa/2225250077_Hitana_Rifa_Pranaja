"""Menjalankan semua analisis dan menyusun output/laporan.md

Jalankan: python scripts/06_laporan.py
"""
from datetime import datetime

from common import load_answers, load_cognitive_load, load_sus, uses_sample_data

from relafun_stats.config import ALPHA, OUTPUT_DIR
from relafun_stats.report import (
    fmt, section_effectiveness, section_item_analysis, section_literacy, section_misconceptions,
    section_questionnaires,
)


def main() -> None:
    df = load_answers()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    header = [
        "# Laporan Analisis Data RELAFUN",
        "",
        f"Dibuat: {datetime.now():%d-%m-%Y %H:%M} · taraf signifikansi α = {fmt(ALPHA, 2)}",
        "",
    ]
    if uses_sample_data():
        header += [
            "> **PERHATIAN: laporan ini memakai DATA CONTOH (sintetis)** dari "
            "`scripts/00_buat_data_contoh.py`. Angka di bawah bukan hasil penelitian. "
            "Hapus file `contoh_*` di `data/raw/` sebelum memakai data asli.",
            "",
        ]
    sections = [
        section_item_analysis(df, OUTPUT_DIR),
        section_effectiveness(df, OUTPUT_DIR),
        section_literacy(df, OUTPUT_DIR),
        section_misconceptions(df, OUTPUT_DIR),
        section_questionnaires(load_sus(), load_cognitive_load(), OUTPUT_DIR),
    ]
    path = OUTPUT_DIR / "laporan.md"
    path.write_text("\n".join(header + sections), encoding="utf-8")
    print(f"Laporan disimpan: {path}")


if __name__ == "__main__":
    main()
