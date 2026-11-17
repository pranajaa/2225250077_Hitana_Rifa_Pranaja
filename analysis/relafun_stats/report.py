"""Merangkai analisis menjadi tabel CSV/Excel, grafik, dan bagian laporan Markdown.

Skrip di analysis/scripts/ hanya memanggil fungsi di sini (tanpa rumus).
"""
from __future__ import annotations

import math
from pathlib import Path

import pandas as pd

from . import effectiveness as eff
from . import item_analysis as ia
from . import literacy as lit
from . import misconception as mis
from . import plots
from . import questionnaire as q
from .config import ALPHA, LITERACY_INDICATORS
from .load import item_max_scores, item_scores


# ---------- utilitas ----------
def fmt(value, digits: int = 3) -> str:
    if isinstance(value, bool):
        return "ya" if value else "tidak"
    if isinstance(value, (int,)) and not isinstance(value, bool):
        return str(value)
    if isinstance(value, float):
        if math.isnan(value):
            return "-"
        return f"{value:.{digits}f}".replace(".", ",")
    return str(value)


def fmt_p(p: float) -> str:
    """Nilai p untuk laporan: '< 0,001' bila sangat kecil."""
    return "< 0,001" if p < 0.001 else fmt(p, 3)


def md_table(df: pd.DataFrame, digits: int = 3) -> str:
    """Tabel Markdown sederhana (tanpa dependensi tambahan); desimal memakai koma."""
    cols = list(df.columns)
    lines = ["| " + " | ".join(str(c) for c in cols) + " |",
             "|" + "|".join("---" for _ in cols) + "|"]
    for _, row in df.iterrows():
        lines.append("| " + " | ".join(fmt(row[c], digits) for c in cols) + " |")
    return "\n".join(lines)


def save_table(df: pd.DataFrame, out_dir: Path, name: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_dir / f"{name}.csv", index=False)


# ---------- 1. Analisis butir ----------
def section_item_analysis(df: pd.DataFrame, out_dir: Path, session: str = "pretest") -> str:
    scores = item_scores(df, session)
    if scores.shape[0] < 3 or scores.shape[1] < 2:
        return "## Analisis Butir\n\nData belum cukup (minimal 3 siswa dan 2 butir).\n"
    maxima = item_max_scores(df)
    table = ia.analyze_items(scores, maxima, ALPHA)
    alpha = ia.cronbach_alpha(scores)
    save_table(table, out_dir, "analisis_butir")

    n_valid = int(table["valid"].sum())
    return "\n".join([
        f"## Analisis Butir (sesi: {session})",
        "",
        f"- Banyak siswa: {scores.shape[0]}; banyak butir: {scores.shape[1]}",
        f"- r tabel (α = {fmt(ALPHA, 2)}, n = {scores.shape[0]}): {fmt(table['r_tabel'].iloc[0])}",
        f"- Butir valid: {n_valid} dari {len(table)}",
        f"- Reliabilitas Cronbach's alpha: **{fmt(alpha)}** ({ia.reliability_category(alpha)})",
        "",
        md_table(table[["butir", "r_hitung", "valid", "P", "kategori_P", "D", "kategori_D"]]),
        "",
    ])


# ---------- 2. Efektivitas ----------
def _component_scores(df: pd.DataFrame, component: str, session: str) -> pd.Series:
    part = df[df["sesi"] == session]
    if component == "konsep":
        part = part[~part["indikator"].isin(LITERACY_INDICATORS.keys())]
    elif component == "literasi":
        part = part[part["indikator"].isin(LITERACY_INDICATORS.keys())]
    return part.groupby("kode_siswa")["skor"].sum()


def _component_max(df: pd.DataFrame, component: str) -> float:
    part = df[df["sesi"].isin(["pretest", "posttest"])]
    if component == "konsep":
        part = part[~part["indikator"].isin(LITERACY_INDICATORS.keys())]
    elif component == "literasi":
        part = part[part["indikator"].isin(LITERACY_INDICATORS.keys())]
    per_student = part.groupby(["sesi", "kode_siswa"])["skor_maks"].sum()
    return float(per_student.max()) if not per_student.empty else 0.0


def section_effectiveness(df: pd.DataFrame, out_dir: Path) -> str:
    lines = ["## Efektivitas (Pre-test vs Post-test)", ""]
    summary_rows = []
    for component in ["konsep", "literasi", "total"]:
        max_score = _component_max(df, component)
        pre = _component_scores(df, component, "pretest")
        post = _component_scores(df, component, "posttest")
        students = sorted(set(pre.index) & set(post.index))
        if len(students) < 3 or max_score == 0:
            continue
        pre, post = pre[students], post[students]
        gains = eff.n_gain_individual(pre, post, max_score)
        test = eff.paired_test(pre, post, ALPHA)
        g_class = eff.n_gain_class(pre, post, max_score)
        summary_rows.append({
            "komponen": component, "n": len(students), "skor_maks": max_score,
            "rata_pre": float(pre.mean()), "rata_post": float(post.mean()),
            "n_gain_kelas": g_class, "kategori": eff.n_gain_category(g_class),
            "rata_n_gain_individu": float(gains.mean()),
            "normal": test.normal, "uji": test.method, "statistik": test.statistic,
            "p": test.p_value, "signifikan": test.significant,
            "efek": test.effect_size, "jenis_efek": test.effect_label,
            "kategori_efek": eff.effect_size_category(test.effect_size, test.effect_label),
        })
        per_student = pd.DataFrame({"kode_siswa": students, "pre": pre.values,
                                    "post": post.values, "n_gain": gains.values})
        per_student["kategori"] = per_student["n_gain"].map(eff.n_gain_category)
        save_table(per_student, out_dir, f"n_gain_{component}")
        plots.boxplot_pre_post(pre / max_score * 100, post / max_score * 100,
                               f"Skor {component} (0–100)", "Skor", out_dir / f"boxplot_{component}.png")

    if not summary_rows:
        return "\n".join(lines + ["Data pre-test & post-test belum cukup (minimal 3 siswa berpasangan).", ""])

    summary = pd.DataFrame(summary_rows)
    save_table(summary, out_dir, "efektivitas")
    shown = summary.assign(p=summary["p"].map(fmt_p))
    lines += [
        md_table(summary[["komponen", "n", "skor_maks", "rata_pre", "rata_post",
                          "n_gain_kelas", "kategori"]], 2),
        "",
        "### Uji beda berpasangan",
        "",
        "Normalitas selisih diuji dengan Shapiro–Wilk. Jika normal dipakai paired t-test, "
        "jika tidak dipakai Wilcoxon signed-rank.",
        "",
        md_table(shown[["komponen", "normal", "uji", "statistik", "p", "signifikan",
                          "efek", "jenis_efek", "kategori_efek"]], 4),
        "",
        "Grafik: " + ", ".join(f"`boxplot_{c}.png`" for c in summary["komponen"]),
        "",
    ]
    return "\n".join(lines)


# ---------- 3. Literasi ----------
def section_literacy(df: pd.DataFrame, out_dir: Path) -> str:
    maxima = lit.max_by_indicator(df)
    if maxima["total"] == 0:
        return "## Literasi Matematika\n\nBelum ada data butir literasi.\n"

    rows = []
    pre = lit.scores_by_indicator(df, "pretest")
    post = lit.scores_by_indicator(df, "posttest")
    students = sorted(set(pre.index) & set(post.index))
    for col in [*LITERACY_INDICATORS, "total"]:
        mx = float(maxima[col])
        if mx == 0:
            continue
        p0 = pre.loc[students, col] if students else pre[col]
        p1 = post.loc[students, col] if students else post[col]
        pre_pct = lit.percent_score(float(p0.mean()), mx) if len(p0) else float("nan")
        post_pct = lit.percent_score(float(p1.mean()), mx) if len(p1) else float("nan")
        g = eff.n_gain_class(p0, p1, mx) if students else float("nan")
        rows.append({
            "indikator": col,
            "nama": LITERACY_INDICATORS.get(col, "Skor total literasi"),
            "skor_maks": mx,
            "pre_persen": pre_pct, "kategori_pre": lit.literacy_category(pre_pct) if not math.isnan(pre_pct) else "-",
            "post_persen": post_pct, "kategori_post": lit.literacy_category(post_pct) if not math.isnan(post_pct) else "-",
            "n_gain": g, "kategori_n_gain": eff.n_gain_category(g),
        })
    table = pd.DataFrame(rows)
    save_table(table, out_dir, "literasi_per_indikator")

    ind = table[table["indikator"] != "total"]
    plots.grouped_bar(list(ind["indikator"]), list(ind["pre_persen"]), list(ind["post_persen"]),
                      "Skor literasi per indikator (%)", "Persen skor", out_dir / "literasi_indikator.png")

    stages = lit.stage_success(df, "posttest" if students else "pretest")
    save_table(stages, out_dir, "literasi_tahapan")
    hardest = stages.head(5)

    return "\n".join([
        "## Literasi Matematika",
        "",
        f"Siswa berpasangan: {len(students)}. Skor dihitung dengan skor parsial per tahap.",
        "",
        md_table(table[["indikator", "nama", "skor_maks", "pre_persen", "kategori_pre",
                        "post_persen", "kategori_post", "n_gain", "kategori_n_gain"]], 2),
        "",
        "### Tahap yang paling sering belum tepat (post-test)",
        "",
        md_table(hardest[["qid", "indikator", "tahap", "n_siswa", "persen_penuh"]], 1),
        "",
        "Grafik: `literasi_indikator.png`",
        "",
    ])


# ---------- 4. Miskonsepsi ----------
def section_misconceptions(df: pd.DataFrame, out_dir: Path) -> str:
    table = mis.compare_misconceptions(df)
    if table.empty:
        return "## Miskonsepsi\n\nTidak ada miskonsepsi tercatat pada pre-test/post-test.\n"
    save_table(table, out_dir, "miskonsepsi")
    plots.grouped_bar(list(table["miskonsepsi"]), list(table["pre_persen"]), list(table["post_persen"]),
                      "Siswa dengan miskonsepsi (%)", "Persen siswa", out_dir / "miskonsepsi.png")
    return "\n".join([
        "## Miskonsepsi (M01–M10)",
        "",
        "Persentase siswa yang menunjukkan miskonsepsi minimal sekali. "
        "p = uji McNemar eksak (perubahan pada siswa yang sama).",
        "",
        md_table(table.assign(p_mcnemar=table["p_mcnemar"].map(fmt_p)), 1),
        "",
        "Grafik: `miskonsepsi.png`",
        "",
    ])


# ---------- 5. Angket ----------
def section_questionnaires(sus_df: pd.DataFrame | None, cl_df: pd.DataFrame | None, out_dir: Path) -> str:
    lines = ["## Angket", ""]
    if sus_df is not None:
        table = q.sus_table(sus_df)
        save_table(table, out_dir, "sus")
        mean = float(table["sus"].mean())
        lines += ["### System Usability Scale (SUS)", "",
                  f"- Responden: {len(table)}",
                  f"- Rata-rata skor SUS: **{fmt(mean, 1)}** ({q.sus_category(mean)})",
                  f"- Responden dengan skor ≥ 68: {int((table['sus'] >= 68).sum())}", ""]
    else:
        lines += ["Data SUS belum ada.", ""]

    if cl_df is not None:
        table = q.cognitive_load_table(cl_df)
        save_table(table, out_dir, "beban_kognitif")
        desc = pd.DataFrame([{"dimensi": d, **eff.descriptive(table[d])} for d in ["IL", "EL", "GL"]])
        lines += ["### Beban Kognitif (skala 0–10)", "",
                  "Target: EL (beban dari penyajian) rendah ≤ 3; GL (usaha membangun pemahaman) tinggi ≥ 7.", "",
                  md_table(desc[["dimensi", "n", "mean", "sd", "min", "max"]], 2), ""]
    else:
        lines += ["Data angket beban kognitif belum ada.", ""]
    return "\n".join(lines)
