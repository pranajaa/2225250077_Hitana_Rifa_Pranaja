"""Analisis butir soal: validitas, reliabilitas, tingkat kesukaran, daya beda."""
from __future__ import annotations

import math

import numpy as np
import pandas as pd
from scipy import stats


def r_critical(n: int, alpha: float = 0.05) -> float:
    """r tabel product moment (uji dua pihak).

    r_tabel = t / sqrt(df + t²), dengan df = n − 2 dan t = t_(1−α/2; df).
    Contoh: n = 30, α = 0,05 → r_tabel ≈ 0,361.
    """
    if n < 3:
        raise ValueError("n minimal 3")
    df = n - 2
    t = stats.t.ppf(1 - alpha / 2, df)
    return float(t / math.sqrt(df + t**2))


def item_validity(scores: pd.DataFrame, alpha: float = 0.05) -> pd.DataFrame:
    """Validitas butir: korelasi Pearson skor butir dengan skor total.

    Untuk butir 0/1 hasilnya sama dengan korelasi point-biserial.
    Butir valid jika r_hitung > r_tabel.
    """
    total = scores.sum(axis=1)
    r_tab = r_critical(len(scores), alpha)
    rows = []
    for item in scores.columns:
        x = scores[item]
        r = float("nan") if x.std(ddof=1) == 0 else float(np.corrcoef(x, total)[0, 1])
        rows.append({"butir": item, "r_hitung": r, "r_tabel": r_tab,
                     "valid": bool(r > r_tab) if not math.isnan(r) else False})
    return pd.DataFrame(rows)


def cronbach_alpha(scores: pd.DataFrame) -> float:
    """Reliabilitas Cronbach's alpha.

    α = k/(k−1) · (1 − Σ s²_i / s²_total), varians sampel (ddof = 1).
    """
    k = scores.shape[1]
    if k < 2:
        raise ValueError("Butir minimal 2")
    item_var = scores.var(axis=0, ddof=1).sum()
    total_var = scores.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return float("nan")
    return float(k / (k - 1) * (1 - item_var / total_var))


def reliability_category(alpha: float) -> str:
    if math.isnan(alpha):
        return "tidak dapat dihitung"
    if alpha >= 0.90:
        return "sangat tinggi"
    if alpha >= 0.70:
        return "tinggi (reliabel)"
    if alpha >= 0.40:
        return "sedang"
    return "rendah"


def difficulty_index(scores: pd.DataFrame, max_scores: pd.Series) -> pd.Series:
    """Tingkat kesukaran P = rata-rata skor butir / skor maksimum butir."""
    return (scores.mean(axis=0) / max_scores.reindex(scores.columns)).rename("P")


def difficulty_category(p: float) -> str:
    if p < 0.30:
        return "sukar"
    if p <= 0.70:
        return "sedang"
    return "mudah"


def discrimination_index(scores: pd.DataFrame, max_scores: pd.Series,
                         fraction: float = 0.27) -> pd.Series:
    """Daya beda D = (rata-rata kelompok atas − kelompok bawah) / skor maksimum butir.

    Kelompok atas/bawah = 27% siswa dengan skor total tertinggi/terendah (dibulatkan, minimal 1).
    """
    n_group = max(1, round(len(scores) * fraction))
    order = scores.sum(axis=1).sort_values(kind="mergesort")
    lower = scores.loc[order.index[:n_group]]
    upper = scores.loc[order.index[-n_group:]]
    d = (upper.mean(axis=0) - lower.mean(axis=0)) / max_scores.reindex(scores.columns)
    return d.rename("D")


def discrimination_category(d: float) -> str:
    if d >= 0.40:
        return "sangat baik"
    if d >= 0.30:
        return "baik"
    if d >= 0.20:
        return "cukup"
    return "jelek"


def analyze_items(scores: pd.DataFrame, max_scores: pd.Series, alpha: float = 0.05) -> pd.DataFrame:
    """Tabel lengkap analisis butir."""
    table = item_validity(scores, alpha).set_index("butir")
    table["P"] = difficulty_index(scores, max_scores)
    table["kategori_P"] = table["P"].map(difficulty_category)
    table["D"] = discrimination_index(scores, max_scores)
    table["kategori_D"] = table["D"].map(discrimination_category)
    return table.reset_index()
