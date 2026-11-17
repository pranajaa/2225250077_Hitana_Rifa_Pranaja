"""Grafik untuk laporan (disimpan sebagai PNG)."""
from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # tanpa jendela; aman dijalankan dari terminal
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

PRE_COLOR = "#9aa5b1"
POST_COLOR = "#2f6feb"


def _save(fig, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def boxplot_pre_post(pre: pd.Series, post: pd.Series, title: str, ylabel: str, path: Path) -> Path:
    fig, ax = plt.subplots(figsize=(5, 4))
    box = ax.boxplot([pre, post], tick_labels=["Pre-test", "Post-test"], patch_artist=True)
    for patch, color in zip(box["boxes"], [PRE_COLOR, POST_COLOR]):
        patch.set_facecolor(color)
    ax.set_title(title)
    ax.set_ylabel(ylabel)
    ax.grid(axis="y", alpha=0.3)
    return _save(fig, path)


def grouped_bar(labels: list[str], pre: list[float], post: list[float],
                title: str, ylabel: str, path: Path) -> Path:
    x = np.arange(len(labels))
    width = 0.38
    fig, ax = plt.subplots(figsize=(max(5, len(labels) * 1.1), 4))
    bars_pre = ax.bar(x - width / 2, pre, width, label="Pre-test", color=PRE_COLOR)
    bars_post = ax.bar(x + width / 2, post, width, label="Post-test", color=POST_COLOR)
    ax.bar_label(bars_pre, fmt="%.0f", fontsize=8)
    ax.bar_label(bars_post, fmt="%.0f", fontsize=8)
    ax.set_xticks(x, labels)
    ax.set_title(title)
    ax.set_ylabel(ylabel)
    top = max([*pre, *post, 1])
    ax.set_ylim(0, top * 1.3)  # ruang untuk legenda agar tidak menutupi label batang
    ax.legend(loc="upper left", ncol=2, frameon=False)
    ax.grid(axis="y", alpha=0.3)
    return _save(fig, path)
