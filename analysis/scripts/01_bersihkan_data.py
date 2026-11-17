"""Menggabungkan & memvalidasi semua CSV ekspor aplikasi → data/processed/jawaban.csv

Jalankan: python scripts/01_bersihkan_data.py
"""
import _setup  # noqa: F401

import sys

from relafun_stats.config import ANSWERS_FILE, RAW_DIR
from relafun_stats.load import DataError, combine_answer_files


def main() -> int:
    paths = sorted(RAW_DIR.glob("*relafun_hasil*.csv"))
    try:
        df = combine_answer_files(paths)
    except DataError as err:
        print(f"GAGAL: {err}")
        return 1
    ANSWERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(ANSWERS_FILE, index=False)
    sessions = df.groupby("sesi")["kode_siswa"].nunique().to_dict()
    print(f"{len(paths)} file dibaca, {len(df)} baris jawaban → {ANSWERS_FILE}")
    print(f"Banyak siswa per sesi: {sessions}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
