"""Menambahkan folder analysis/ ke sys.path agar paket relafun_stats bisa diimpor dari skrip."""
import sys
from pathlib import Path

ANALYSIS_DIR = Path(__file__).resolve().parent.parent
if str(ANALYSIS_DIR) not in sys.path:
    sys.path.insert(0, str(ANALYSIS_DIR))

# Konsol Windows kadang memakai cp1252; paksa UTF-8 agar simbol seperti α dan ≥ tercetak.
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
