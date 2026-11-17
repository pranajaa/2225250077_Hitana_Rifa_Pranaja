"""Pengolahan angket: SUS, beban kognitif, dan skala Likert (respons siswa / validasi ahli)."""
from __future__ import annotations

import pandas as pd

from .config import COGNITIVE_LOAD_DIMENSIONS, SUS_COLUMNS


def sus_score(responses: list[float]) -> float:
    """Skor System Usability Scale (Brooke, 1996), rentang 0–100.

    Butir ganjil: skor − 1; butir genap: 5 − skor; jumlah × 2,5. Setiap jawaban 1–5.
    """
    if len(responses) != 10:
        raise ValueError("SUS harus 10 butir")
    if any(r < 1 or r > 5 for r in responses):
        raise ValueError("Jawaban SUS harus 1–5")
    total = sum((r - 1) if i % 2 == 0 else (5 - r) for i, r in enumerate(responses))
    return total * 2.5


def sus_table(df: pd.DataFrame) -> pd.DataFrame:
    """Skor SUS per responden dari kolom s1..s10."""
    out = df[["kode_siswa"]].copy()
    out["sus"] = df[SUS_COLUMNS].apply(lambda row: sus_score(list(row)), axis=1)
    out["kategori"] = out["sus"].map(sus_category)
    return out


def sus_category(score: float) -> str:
    """Interpretasi umum: ≥ 68 di atas rata-rata (Sauro, 2011); ≥ 80,3 sangat baik (grade A)."""
    if score >= 80.3:
        return "sangat baik (A)"
    if score >= 68:
        return "baik, di atas rata-rata"
    if score >= 51:
        return "cukup, di bawah rata-rata"
    return "kurang"


def cognitive_load_table(df: pd.DataFrame) -> pd.DataFrame:
    """Rata-rata skor tiap dimensi beban kognitif (IL, EL, GL; skala 0–10) per responden.

    Kolom angket: il1, il2, …, el1, …, gl1, … (prefiks di config.COGNITIVE_LOAD_DIMENSIONS).
    """
    out = df[["kode_siswa"]].copy()
    for dim, prefix in COGNITIVE_LOAD_DIMENSIONS.items():
        cols = [c for c in df.columns if c.lower().startswith(prefix) and c[len(prefix):].isdigit()]
        if not cols:
            raise ValueError(f"Kolom dimensi {dim} (awalan '{prefix}') tidak ditemukan")
        out[dim] = df[cols].astype(float).mean(axis=1)
    return out


def likert_percentage(scores: pd.DataFrame, max_per_item: int) -> float:
    """Persentase skor = Σ skor / (banyak butir × banyak responden × skor maks butir) × 100%."""
    max_total = scores.size * max_per_item
    return float(scores.to_numpy().sum() / max_total * 100)


def likert_category(percent: float) -> str:
    """Kategori kelayakan (skala persentase lima tingkat, mis. Riduwan)."""
    if percent > 80:
        return "sangat layak"
    if percent > 60:
        return "layak"
    if percent > 40:
        return "cukup layak"
    if percent > 20:
        return "kurang layak"
    return "tidak layak"
