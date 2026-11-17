"""N-gain, uji normalitas, uji t/Wilcoxon (konsep, literasi, total) → output/efektivitas.csv

Jalankan: python scripts/03_efektivitas.py
"""
from common import load_answers

from relafun_stats.config import OUTPUT_DIR
from relafun_stats.report import section_effectiveness

if __name__ == "__main__":
    print(section_effectiveness(load_answers(), OUTPUT_DIR))
