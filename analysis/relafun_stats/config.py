"""Konfigurasi analisis: lokasi folder, taraf signifikansi, dan kontrak kolom CSV."""
from pathlib import Path

ANALYSIS_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ANALYSIS_DIR / "data" / "raw"
PROCESSED_DIR = ANALYSIS_DIR / "data" / "processed"
OUTPUT_DIR = ANALYSIS_DIR / "output"

ALPHA = 0.05

# Kontrak kolom CSV ekspor aplikasi (js/export.js) — docs/09-ANALISIS-DATA-PYTHON.md §2.
# Jika kolom ini diubah, ubah juga js/export.js dan tests/test_stats.py.
ANSWER_COLUMNS = [
    "kode_siswa", "sesi", "qid", "fitur", "indikator", "tahap", "skor", "skor_maks",
    "benar", "miskonsepsi", "hint", "waktu_ms", "timestamp",
]
SESSIONS = ("pretest", "posttest", "latihan")
LITERACY_INDICATORS = {
    "LR": "Mathematical Reasoning",
    "LF": "Formulating Situations Mathematically",
    "LE": "Employing Concepts, Facts, and Procedures",
    "LI": "Interpreting, Applying, and Evaluating",
}

# Angket
SUS_COLUMNS = [f"s{i}" for i in range(1, 11)]
COGNITIVE_LOAD_DIMENSIONS = {"IL": "il", "EL": "el", "GL": "gl"}  # prefiks kolom: il1, il2, ...

# Nama file
ANSWERS_FILE = PROCESSED_DIR / "jawaban.csv"
SUS_FILE_PATTERN = "*angket_sus*.csv"
COGNITIVE_LOAD_FILE_PATTERN = "*angket_beban_kognitif*.csv"
SAMPLE_PREFIX = "contoh_"
