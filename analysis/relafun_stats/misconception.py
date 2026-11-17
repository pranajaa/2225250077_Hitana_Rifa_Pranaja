"""Frekuensi miskonsepsi (M01–M10) pre-test vs post-test dan uji McNemar."""
from __future__ import annotations

import pandas as pd
from scipy import stats


def students_with_misconception(df: pd.DataFrame, session: str) -> pd.DataFrame:
    """Tabel 0/1: baris = siswa, kolom = kode miskonsepsi (1 jika muncul minimal sekali)."""
    part = df[(df["sesi"] == session) & (df["miskonsepsi"] != "")]
    students = sorted(df.loc[df["sesi"] == session, "kode_siswa"].unique())
    table = pd.crosstab(part["kode_siswa"], part["miskonsepsi"]).clip(upper=1)
    return table.reindex(students, fill_value=0)


def compare_misconceptions(df: pd.DataFrame) -> pd.DataFrame:
    """Banyak & persentase siswa per miskonsepsi pada pre-test dan post-test, plus uji McNemar."""
    pre = students_with_misconception(df, "pretest")
    post = students_with_misconception(df, "posttest")
    students = sorted(set(pre.index) & set(post.index))
    codes = sorted(set(pre.columns) | set(post.columns))
    pre = pre.reindex(index=students, columns=codes, fill_value=0)
    post = post.reindex(index=students, columns=codes, fill_value=0)

    rows = []
    for code in codes:
        b = int(((pre[code] == 1) & (post[code] == 0)).sum())  # hilang setelah belajar
        c = int(((pre[code] == 0) & (post[code] == 1)).sum())  # muncul setelah belajar
        rows.append({
            "miskonsepsi": code,
            "pre_n": int(pre[code].sum()),
            "post_n": int(post[code].sum()),
            "pre_persen": pre[code].mean() * 100 if students else float("nan"),
            "post_persen": post[code].mean() * 100 if students else float("nan"),
            "hilang": b,
            "muncul": c,
            "p_mcnemar": mcnemar_exact(b, c),
        })
    return pd.DataFrame(rows)


def mcnemar_exact(b: int, c: int) -> float:
    """Uji McNemar eksak (binomial dua pihak) untuk pasangan sumbang b dan c."""
    if b + c == 0:
        return 1.0
    return float(stats.binomtest(min(b, c), b + c, 0.5).pvalue)
