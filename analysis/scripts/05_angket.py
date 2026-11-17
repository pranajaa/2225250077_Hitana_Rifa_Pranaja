"""Angket SUS dan beban kognitif (IL/EL/GL) dari data/raw/*angket_sus*.csv & *angket_beban_kognitif*.csv

Jalankan: python scripts/05_angket.py
"""
from common import load_cognitive_load, load_sus

from relafun_stats.config import OUTPUT_DIR
from relafun_stats.report import section_questionnaires

if __name__ == "__main__":
    print(section_questionnaires(load_sus(), load_cognitive_load(), OUTPUT_DIR))
