"""Efektivitas: statistik deskriptif, N-gain, uji normalitas, uji beda berpasangan."""
from __future__ import annotations

import math
from dataclasses import dataclass

import pandas as pd
from scipy import stats


def descriptive(values: pd.Series) -> dict:
    """n, rata-rata, median, simpangan baku (sampel), minimum, maksimum."""
    v = pd.Series(values, dtype=float).dropna()
    return {
        "n": int(v.size),
        "mean": float(v.mean()),
        "median": float(v.median()),
        "sd": float(v.std(ddof=1)) if v.size > 1 else float("nan"),
        "min": float(v.min()),
        "max": float(v.max()),
    }


def n_gain(pre: float, post: float, max_score: float) -> float:
    """N-gain individu (Hake): g = (post − pre) / (skor maks − pre). NaN jika pre = skor maks."""
    if max_score - pre == 0:
        return float("nan")
    return (post - pre) / (max_score - pre)


def n_gain_individual(pre: pd.Series, post: pd.Series, max_score: float) -> pd.Series:
    return pd.Series([n_gain(a, b, max_score) for a, b in zip(pre, post)],
                     index=pre.index, name="n_gain")


def n_gain_class(pre: pd.Series, post: pd.Series, max_score: float) -> float:
    """N-gain kelas dari rata-rata: (x̄_post − x̄_pre) / (skor maks − x̄_pre)."""
    return n_gain(float(pre.mean()), float(post.mean()), max_score)


def n_gain_category(g: float) -> str:
    """Kategori Hake (1998): g ≥ 0,7 tinggi; 0,3 ≤ g < 0,7 sedang; g < 0,3 rendah."""
    if math.isnan(g):
        return "-"
    if g >= 0.7:
        return "tinggi"
    if g >= 0.3:
        return "sedang"
    return "rendah"


@dataclass
class PairedTestResult:
    n: int
    shapiro_w: float
    shapiro_p: float
    normal: bool
    method: str            # "paired t-test" atau "Wilcoxon signed-rank"
    statistic: float
    p_value: float
    significant: bool
    effect_size: float
    effect_label: str      # "Cohen's d_z" atau "r = Z/√N"
    mean_difference: float


def paired_test(pre: pd.Series, post: pd.Series, alpha: float = 0.05) -> PairedTestResult:
    """Uji beda berpasangan pre-test vs post-test.

    1. Uji normalitas Shapiro–Wilk pada selisih d = post − pre.
    2. Normal (p > α) → paired t-test; ukuran efek Cohen's d_z = d̄ / s_d.
       Tidak normal → Wilcoxon signed-rank; ukuran efek r = Z / √N
       (Z dari pendekatan normal, N = banyak selisih bukan nol).
    """
    pre = pd.Series(pre, dtype=float).reset_index(drop=True)
    post = pd.Series(post, dtype=float).reset_index(drop=True)
    diff = post - pre
    if diff.size < 3:
        raise ValueError("Uji beda butuh minimal 3 pasang data")

    if diff.std(ddof=1) == 0:
        shapiro_w, shapiro_p = float("nan"), float("nan")
        normal = False
    else:
        shapiro_w, shapiro_p = (float(x) for x in stats.shapiro(diff))
        normal = shapiro_p > alpha

    if normal:
        res = stats.ttest_rel(post, pre)
        statistic, p_value = float(res.statistic), float(res.pvalue)
        effect = float(diff.mean() / diff.std(ddof=1))
        return PairedTestResult(int(diff.size), shapiro_w, shapiro_p, True, "paired t-test",
                                statistic, p_value, p_value < alpha, effect, "Cohen's d_z",
                                float(diff.mean()))

    nonzero = diff[diff != 0]
    if nonzero.empty:
        return PairedTestResult(int(diff.size), shapiro_w, shapiro_p, False,
                                "Wilcoxon signed-rank", 0.0, 1.0, False, 0.0, "r = Z/√N", 0.0)
    res = stats.wilcoxon(post, pre, zero_method="wilcox", method="approx")
    statistic, p_value = float(res.statistic), float(res.pvalue)
    direction = 1.0 if diff.mean() >= 0 else -1.0
    z = float(stats.norm.isf(p_value / 2)) * direction
    effect = float(z / math.sqrt(nonzero.size))
    return PairedTestResult(int(diff.size), shapiro_w, shapiro_p, False, "Wilcoxon signed-rank",
                            statistic, p_value, p_value < alpha, effect, "r = Z/√N",
                            float(diff.mean()))


def effect_size_category(value: float, label: str) -> str:
    """Kategori ukuran efek: Cohen (d: 0,2/0,5/0,8) atau r (0,1/0,3/0,5)."""
    v = abs(value)
    small, medium, large = (0.2, 0.5, 0.8) if label.startswith("Cohen") else (0.1, 0.3, 0.5)
    if v >= large:
        return "besar"
    if v >= medium:
        return "sedang"
    if v >= small:
        return "kecil"
    return "sangat kecil"
