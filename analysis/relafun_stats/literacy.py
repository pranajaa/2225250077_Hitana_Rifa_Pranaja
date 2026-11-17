"""Skor literasi matematika: total, per indikator (LR/LF/LE/LI), dan analisis tahapan."""
from __future__ import annotations

import pandas as pd

from .config import LITERACY_INDICATORS


def literacy_rows(df: pd.DataFrame) -> pd.DataFrame:
    """Baris jawaban yang termasuk butir literasi (kolom indikator LR/LF/LE/LI)."""
    return df[df["indikator"].isin(LITERACY_INDICATORS.keys())]


def scores_by_indicator(df: pd.DataFrame, session: str) -> pd.DataFrame:
    """Skor per siswa per indikator (Σ skor parsial semua tahap) + kolom total.

    Baris = kode_siswa, kolom = LR, LF, LE, LI, total.
    """
    part = literacy_rows(df)
    part = part[part["sesi"] == session]
    table = part.pivot_table(index="kode_siswa", columns="indikator", values="skor",
                             aggfunc="sum", fill_value=0)
    table = table.reindex(columns=list(LITERACY_INDICATORS), fill_value=0)
    table["total"] = table.sum(axis=1)
    return table


def max_by_indicator(df: pd.DataFrame) -> pd.Series:
    """Skor maksimum per indikator (Σ skor_maks tahap, dari satu siswa per sesi)."""
    part = literacy_rows(df)
    per_student = part.groupby(["sesi", "kode_siswa", "indikator"])["skor_maks"].sum()
    maxima = per_student.groupby("indikator").max().reindex(list(LITERACY_INDICATORS), fill_value=0)
    maxima["total"] = maxima.sum()
    return maxima


def percent_score(score: float, max_score: float) -> float:
    return float("nan") if max_score == 0 else score / max_score * 100


def literacy_category(percent: float) -> str:
    """Kategori kemampuan literasi berdasarkan persentase skor.

    ≥ 80 sangat baik; 60–79 baik; 40–59 cukup; < 40 kurang.
    Sesuaikan batas dengan rujukan yang dipakai di laporan.
    """
    if percent >= 80:
        return "sangat baik"
    if percent >= 60:
        return "baik"
    if percent >= 40:
        return "cukup"
    return "kurang"


def stage_success(df: pd.DataFrame, session: str) -> pd.DataFrame:
    """Persentase siswa yang mendapat skor penuh pada tiap tahap tiap butir literasi.

    Berguna untuk menemukan tahap yang paling sering gagal.
    """
    part = literacy_rows(df)
    part = part[part["sesi"] == session].copy()
    part["penuh"] = part["skor"] == part["skor_maks"]
    out = (part.groupby(["qid", "indikator", "tahap"])
           .agg(n_siswa=("kode_siswa", "nunique"), persen_penuh=("penuh", "mean"),
                rata_skor=("skor", "mean"), skor_maks=("skor_maks", "max"))
           .reset_index())
    out["persen_penuh"] = out["persen_penuh"] * 100
    return out.sort_values("persen_penuh").reset_index(drop=True)
