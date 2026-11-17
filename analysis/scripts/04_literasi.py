"""Skor literasi per indikator (LR/LF/LE/LI), N-gain, analisis tahapan, dan miskonsepsi.

Jalankan: python scripts/04_literasi.py
"""
from common import load_answers

from relafun_stats.config import OUTPUT_DIR
from relafun_stats.report import section_literacy, section_misconceptions

if __name__ == "__main__":
    df = load_answers()
    print(section_literacy(df, OUTPUT_DIR))
    print(section_misconceptions(df, OUTPUT_DIR))
