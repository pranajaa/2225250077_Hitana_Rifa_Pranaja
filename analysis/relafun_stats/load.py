"""Membaca, memvalidasi, dan menggabungkan CSV ekspor aplikasi."""
from __future__ import annotations

from pathlib import Path

import pandas as pd

from .config import ANSWER_COLUMNS, SESSIONS


class DataError(ValueError):
    """Data tidak sesuai kontrak kolom/isi."""


def validate_answers(df: pd.DataFrame, source: str = "data") -> pd.DataFrame:
    """Memeriksa kolom dan isi, lalu mengubah tipe data. Mengembalikan salinan bersih."""
    missing = [c for c in ANSWER_COLUMNS if c not in df.columns]
    if missing:
        raise DataError(f"{source}: kolom hilang {missing}")

    out = df[ANSWER_COLUMNS].copy()
    out["kode_siswa"] = out["kode_siswa"].astype(str).str.strip()
    out["sesi"] = out["sesi"].astype(str).str.strip().str.lower()
    bad_sessions = sorted(set(out["sesi"]) - set(SESSIONS))
    if bad_sessions:
        raise DataError(f"{source}: nilai sesi tidak dikenal {bad_sessions}")

    for col in ["tahap", "skor", "skor_maks", "benar", "hint", "waktu_ms"]:
        out[col] = pd.to_numeric(out[col], errors="coerce")
    if out[["skor", "skor_maks"]].isna().any().any():
        raise DataError(f"{source}: ada skor/skor_maks kosong atau bukan angka")
    if (out["skor"] > out["skor_maks"]).any() or (out["skor"] < 0).any():
        raise DataError(f"{source}: skor harus di antara 0 dan skor_maks")

    out["indikator"] = out["indikator"].fillna("").astype(str).str.strip().str.upper()
    out["miskonsepsi"] = out["miskonsepsi"].fillna("").astype(str).str.strip().str.upper()
    out["timestamp"] = pd.to_datetime(out["timestamp"], errors="coerce", utc=True)
    return out


def read_answers(path: Path) -> pd.DataFrame:
    """Membaca satu file CSV ekspor."""
    df = pd.read_csv(path, dtype={"kode_siswa": str, "miskonsepsi": str, "indikator": str})
    return validate_answers(df, source=Path(path).name)


def combine_answer_files(paths: list[Path]) -> pd.DataFrame:
    """Menggabungkan banyak file; baris kembar (siswa, sesi, soal, tahap) disimpan yang terbaru."""
    if not paths:
        raise DataError("Tidak ada file CSV jawaban yang ditemukan")
    frames = [read_answers(p) for p in paths]
    df = pd.concat(frames, ignore_index=True)
    df = df.sort_values("timestamp").drop_duplicates(
        subset=["kode_siswa", "sesi", "qid", "tahap"], keep="last",
    )
    return df.sort_values(["kode_siswa", "sesi", "qid", "tahap"]).reset_index(drop=True)


def item_scores(df: pd.DataFrame, session: str) -> pd.DataFrame:
    """Matriks skor butir: baris = siswa, kolom = qid, nilai = Σ skor semua tahap."""
    part = df[df["sesi"] == session]
    return part.pivot_table(index="kode_siswa", columns="qid", values="skor",
                            aggfunc="sum", fill_value=0).sort_index(axis=1)


def item_max_scores(df: pd.DataFrame) -> pd.Series:
    """Skor maksimum tiap butir = Σ skor_maks per tahap (diambil dari satu siswa)."""
    per_student = df.groupby(["qid", "kode_siswa", "sesi"])["skor_maks"].sum()
    return per_student.groupby("qid").max().sort_index()
