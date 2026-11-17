"""Analisis butir (validitas, reliabilitas, kesukaran, daya beda) → output/analisis_butir.csv

Default memakai sesi pre-test (uji coba instrumen). Jalankan: python scripts/02_analisis_butir.py
"""
from common import load_answers

from relafun_stats.config import OUTPUT_DIR
from relafun_stats.report import section_item_analysis

if __name__ == "__main__":
    print(section_item_analysis(load_answers(), OUTPUT_DIR, session="pretest"))
