"""Uji fungsi statistik dengan data kecil yang hasilnya dihitung manual.

Jalankan dari folder analysis/: pytest
"""
import math
import sys
from pathlib import Path

import pandas as pd
import pytest
from scipy import stats

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from relafun_stats import effectiveness as eff  # noqa: E402
from relafun_stats import item_analysis as ia  # noqa: E402
from relafun_stats import literacy as lit  # noqa: E402
from relafun_stats import misconception as mis  # noqa: E402
from relafun_stats import questionnaire as q  # noqa: E402
from relafun_stats.config import ANSWER_COLUMNS, EXPORT_COLUMNS  # noqa: E402
from relafun_stats.load import (  # noqa: E402
    DataError, combine_answer_files, item_scores, read_answers, validate_answers,
)


# ---------- Reliabilitas & butir ----------
def test_cronbach_alpha_dihitung_manual():
    # Var butir: 1,6667 + 0,9167 + 2,6667 = 5,25; var total [7,10,12,16] = 14,25
    # α = 3/2 · (1 − 5,25/14,25) = 18/19
    scores = pd.DataFrame({"x1": [2, 3, 4, 5], "x2": [3, 3, 4, 5], "x3": [2, 4, 4, 6]})
    assert ia.cronbach_alpha(scores) == pytest.approx(18 / 19)


def test_cronbach_alpha_butir_identik_bernilai_1():
    scores = pd.DataFrame({"a": [1, 2, 3, 4], "b": [1, 2, 3, 4]})
    assert ia.cronbach_alpha(scores) == pytest.approx(1.0)


def test_r_tabel_n30():
    # Tabel r product moment: n = 30, α = 0,05 (dua pihak) → 0,361
    assert ia.r_critical(30) == pytest.approx(0.361, abs=0.001)
    assert ia.r_critical(20) == pytest.approx(0.444, abs=0.001)


def test_tingkat_kesukaran():
    scores = pd.DataFrame({"a": [1, 0, 1, 1], "b": [2, 4, 6, 4]})
    maxima = pd.Series({"a": 1, "b": 6})
    p = ia.difficulty_index(scores, maxima)
    assert p["a"] == pytest.approx(0.75)
    assert p["b"] == pytest.approx(4 / 6)
    assert ia.difficulty_category(0.75) == "mudah"
    assert ia.difficulty_category(0.5) == "sedang"
    assert ia.difficulty_category(0.2) == "sukar"


def test_daya_beda_kelompok_27_persen():
    # 10 siswa → 27% ≈ 3 per kelompok. Butir 'a' dijawab benar hanya oleh 3 siswa teratas.
    total_driver = list(range(10))
    scores = pd.DataFrame({
        "a": [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        "b": total_driver,
    }, index=[f"S{i}" for i in range(10)])
    maxima = pd.Series({"a": 1, "b": 9})
    d = ia.discrimination_index(scores, maxima)
    assert d["a"] == pytest.approx(1.0)
    assert ia.discrimination_category(1.0) == "sangat baik"
    assert ia.discrimination_category(0.1) == "jelek"


def test_validitas_point_biserial_sama_dengan_pearson():
    scores = pd.DataFrame({"a": [1, 0, 1, 1, 0, 1], "b": [3, 1, 2, 3, 0, 2]})
    table = ia.item_validity(scores)
    total = scores.sum(axis=1)
    expected = stats.pointbiserialr(scores["a"], total).statistic
    assert table.loc[table["butir"] == "a", "r_hitung"].iloc[0] == pytest.approx(expected)


# ---------- N-gain & uji beda ----------
def test_n_gain():
    assert eff.n_gain(40, 70, 100) == pytest.approx(0.5)
    assert math.isnan(eff.n_gain(100, 100, 100))
    assert eff.n_gain_class(pd.Series([40, 60]), pd.Series([70, 80]), 100) == pytest.approx(0.5)
    assert eff.n_gain_category(0.7) == "tinggi"
    assert eff.n_gain_category(0.5) == "sedang"
    assert eff.n_gain_category(0.29) == "rendah"


def test_paired_t_test_sesuai_scipy():
    pre = pd.Series([50, 55, 60, 62, 48, 70, 65, 58, 52, 61])
    post = pd.Series([62, 66, 70, 70, 60, 79, 74, 70, 61, 72])
    res = eff.paired_test(pre, post)
    assert res.method == "paired t-test"
    expected = stats.ttest_rel(post, pre)
    assert res.statistic == pytest.approx(expected.statistic)
    assert res.p_value == pytest.approx(expected.pvalue)
    diff = post - pre
    assert res.effect_size == pytest.approx(diff.mean() / diff.std(ddof=1))
    assert res.significant


def test_wilcoxon_dipakai_jika_tidak_normal():
    pre = pd.Series([10] * 12)
    post = pd.Series([11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 30, 40])  # selisih sangat menceng
    res = eff.paired_test(pre, post)
    assert not res.normal
    assert res.method == "Wilcoxon signed-rank"
    assert res.significant
    assert res.effect_size > 0


# ---------- Angket ----------
def test_sus():
    assert q.sus_score([3] * 10) == 50
    assert q.sus_score([5, 1] * 5) == 100
    assert q.sus_score([1, 5] * 5) == 0
    with pytest.raises(ValueError):
        q.sus_score([3] * 9)
    assert q.sus_category(68) == "baik, di atas rata-rata"


def test_beban_kognitif_rata_rata_per_dimensi():
    df = pd.DataFrame({"kode_siswa": ["S01"], "il1": [4], "il2": [6], "el1": [2], "el2": [2],
                       "gl1": [8], "gl2": [9]})
    table = q.cognitive_load_table(df)
    assert table.loc[0, "IL"] == 5
    assert table.loc[0, "EL"] == 2
    assert table.loc[0, "GL"] == 8.5


def test_likert():
    scores = pd.DataFrame({"b1": [4, 3], "b2": [4, 5]})  # Σ = 16 dari maks 4·5 = 20
    assert q.likert_percentage(scores, 5) == pytest.approx(80)
    assert q.likert_category(80) == "layak"
    assert q.likert_category(81) == "sangat layak"


# ---------- Data jawaban, literasi, miskonsepsi ----------
def make_rows():
    rows = []

    def add(code, sesi, qid, ind, tahap, skor, maks, misc=""):
        rows.append({"kode_siswa": code, "sesi": sesi, "qid": qid, "fitur": "x", "indikator": ind,
                     "tahap": tahap, "skor": skor, "skor_maks": maks, "benar": int(skor == maks),
                     "miskonsepsi": misc, "hint": 0, "waktu_ms": 1000,
                     "timestamp": "2026-12-01T08:00:00Z"})

    # LM-004 (LI) 6 tahap @1 dan LM-001 (LR) tahap 1-2-1-1-1
    for code, li_scores, lr_scores in [("S01", [1, 1, 1, 1, 0, 0], [1, 2, 1, 0, 0]),
                                       ("S02", [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1])]:
        for t, s in enumerate(li_scores, 1):
            add(code, "pretest", "LM-004", "LI", t, s, 1)
        for t, (s, m) in enumerate(zip(lr_scores, [1, 2, 1, 1, 1]), 1):
            add(code, "pretest", "LM-001", "LR", t, s, m)
    add("S01", "pretest", "PT-001", "", 1, 0, 1, "M01")
    add("S02", "pretest", "PT-001", "", 1, 0, 1, "M01")
    add("S01", "posttest", "PT-001", "", 1, 1, 1)
    add("S02", "posttest", "PT-001", "", 1, 0, 1, "M01")
    return pd.DataFrame(rows, columns=ANSWER_COLUMNS)


def test_validate_answers_menolak_kolom_hilang_dan_skor_salah():
    df = make_rows()
    with pytest.raises(DataError):
        validate_answers(df.drop(columns=["skor"]))
    bad = df.copy()
    bad.loc[0, "skor"] = 5
    with pytest.raises(DataError):
        validate_answers(bad)
    bad = df.copy()
    bad.loc[0, "sesi"] = "ujian"
    with pytest.raises(DataError):
        validate_answers(bad)


def test_skor_literasi_parsial_per_indikator():
    df = validate_answers(make_rows())
    table = lit.scores_by_indicator(df, "pretest")
    assert table.loc["S01", "LI"] == 4
    assert table.loc["S01", "LR"] == 4
    assert table.loc["S02", "total"] == 11
    maxima = lit.max_by_indicator(df)
    assert maxima["LI"] == 6 and maxima["LR"] == 6 and maxima["total"] == 12


def test_analisis_tahap_literasi():
    df = validate_answers(make_rows())
    stages = lit.stage_success(df, "pretest")
    row = stages[(stages["qid"] == "LM-004") & (stages["tahap"] == 5)].iloc[0]
    assert row["persen_penuh"] == pytest.approx(50)


def test_item_scores_menjumlah_tahap():
    df = validate_answers(make_rows())
    scores = item_scores(df, "pretest")
    assert scores.loc["S01", "LM-001"] == 4
    assert scores.loc["S02", "LM-004"] == 6


def test_miskonsepsi_pre_post():
    df = validate_answers(make_rows())
    table = mis.compare_misconceptions(df).set_index("miskonsepsi")
    assert table.loc["M01", "pre_n"] == 2
    assert table.loc["M01", "post_n"] == 1
    assert table.loc["M01", "hilang"] == 1
    assert mis.mcnemar_exact(0, 0) == 1.0


def test_gabung_file_membuang_duplikat(tmp_path):
    df = make_rows()
    df.to_csv(tmp_path / "a_relafun_hasil.csv", index=False)
    df.to_csv(tmp_path / "b_relafun_hasil.csv", index=False)
    combined = combine_answer_files(sorted(tmp_path.glob("*.csv")))
    assert len(combined) == len(df)


# ---------- Kolom tambahan hint_count & jawaban_teks (17 Nov 2026, docs/09 §2) ----------
def make_new_rows():
    """Format baru: 13 kolom lama + hint_count + jawaban_teks di akhir."""
    df = make_rows()
    df["hint_count"] = 0
    df["jawaban_teks"] = ""
    return df[EXPORT_COLUMNS]


def test_csv_lama_tanpa_kolom_baru_tetap_terbaca(tmp_path):
    path = tmp_path / "lama_relafun_hasil_S01.csv"
    make_rows().to_csv(path, index=False)  # 13 kolom, seperti sebelum 17 Nov 2026
    df = read_answers(path)
    assert list(df.columns) == EXPORT_COLUMNS
    assert df["hint_count"].isna().all()          # tidak tercatat, bukan dianggap 0
    assert (df["jawaban_teks"] == "").all()
    assert (df["hint"] == 0).all()                # nilai lama tidak diubah


def test_csv_baru_teks_koma_kutip_baris_baru(tmp_path):
    df = make_new_rows()
    teks = [
        'Fungsi, karena setiap siswa punya tepat satu kode rak.',
        'Saya tidak setuju dengan "klaim" itu.',
        'Baris pertama.\nBaris kedua, dengan koma.',
        'NA',
    ]
    for i, t in enumerate(teks):
        df.loc[i, "jawaban_teks"] = t
    df.loc[0, ["hint", "hint_count"]] = [1, 2]
    path = tmp_path / "baru_relafun_hasil_S01.csv"
    df.to_csv(path, index=False)  # pandas menulis CSV sesuai RFC 4180 (kutip ganda bila perlu)
    out = read_answers(path)
    assert list(out["jawaban_teks"].iloc[:4]) == teks
    assert out.loc[0, "hint_count"] == 2 and out.loc[0, "hint"] == 1
    assert len(out) == len(df)


def test_hint_harus_konsisten_dengan_hint_count():
    df = make_new_rows()
    df.loc[0, ["hint", "hint_count"]] = [0, 3]
    with pytest.raises(DataError, match="tidak konsisten"):
        validate_answers(df)
    df = make_new_rows()
    df.loc[0, ["hint", "hint_count"]] = [1, 0]
    with pytest.raises(DataError, match="tidak konsisten"):
        validate_answers(df)
    df = make_new_rows()
    df.loc[0, "hint_count"] = -1
    with pytest.raises(DataError, match="hint_count"):
        validate_answers(df)
    df = make_new_rows()
    df.loc[0, ["hint", "hint_count"]] = [2, 2]
    with pytest.raises(DataError, match="0 atau 1"):
        validate_answers(df)


def test_hint_kosong_diisi_dari_hint_count():
    df = make_new_rows().astype({"hint": "object"})
    df.loc[0, ["hint", "hint_count"]] = [None, 4]
    df.loc[1, ["hint", "hint_count"]] = [None, 0]
    out = validate_answers(df)
    assert out.loc[0, "hint"] == 1
    assert out.loc[1, "hint"] == 0


def test_gabung_csv_lama_dan_baru(tmp_path):
    make_rows().to_csv(tmp_path / "a_lama.csv", index=False)
    baru = make_new_rows()
    baru["sesi"] = "posttest"
    baru["timestamp"] = "2026-12-15T08:00:00Z"
    baru.to_csv(tmp_path / "b_baru.csv", index=False)
    combined = combine_answer_files(sorted(tmp_path.glob("*.csv")))
    assert list(combined.columns) == EXPORT_COLUMNS
    assert combined.loc[combined["sesi"] == "posttest", "hint_count"].notna().all()
