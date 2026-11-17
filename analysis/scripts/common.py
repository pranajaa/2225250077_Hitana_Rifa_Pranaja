"""Fungsi bantu bersama untuk skrip 02–06 (membaca data yang sudah dibersihkan)."""
import _setup  # noqa: F401

import sys

import pandas as pd

from relafun_stats.config import (
    ANSWERS_FILE, COGNITIVE_LOAD_FILE_PATTERN, RAW_DIR, SAMPLE_PREFIX, SUS_FILE_PATTERN,
)
from relafun_stats.load import read_answers


def load_answers():
    if not ANSWERS_FILE.exists():
        print("Data belum dibersihkan. Jalankan dulu: python scripts/01_bersihkan_data.py")
        sys.exit(1)
    return read_answers(ANSWERS_FILE)


def load_optional_csv(pattern: str):
    paths = sorted(RAW_DIR.glob(pattern))
    if not paths:
        return None
    return pd.concat([pd.read_csv(p, dtype={"kode_siswa": str}) for p in paths], ignore_index=True)


def load_sus():
    return load_optional_csv(SUS_FILE_PATTERN)


def load_cognitive_load():
    return load_optional_csv(COGNITIVE_LOAD_FILE_PATTERN)


def uses_sample_data() -> bool:
    return any(p.name.startswith(SAMPLE_PREFIX) for p in RAW_DIR.glob("*.csv"))
