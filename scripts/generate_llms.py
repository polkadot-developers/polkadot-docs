#!/usr/bin/env python3
"""
generate_llms.py

One-stop pipeline for content creators to rebuild all AI artifacts.

Runs, in order:
  1) generate_ai_pages.py            -> /.ai/pages/*.md   (loads its own config; no --config flag)
  2) generate_llms_txt.py            -> /llms.txt
  3) generate_site_index.py          -> /.ai/site-index.json (+llms-full.jsonl by default)
  4) generate_category_bundles.py    -> /.ai/categories/*.md (or other formats)

Defaults:
  - sections: enabled (use --no-sections to turn off)
  - token estimator: heuristic-v1 (override with --token-estimator cl100k, etc.)
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def repo_root() -> Path:
    return (Path(__file__).parent / "..").resolve()


def run_step(title: str, cmd: list[str]) -> None:
    print(f"\n▶️  {title}\n$ {' '.join(cmd)}")
    completed = subprocess.run(cmd, cwd=repo_root())
    if completed.returncode != 0:
        print(f"❌ Step failed: {title}", file=sys.stderr)
        sys.exit(completed.returncode)
    print(f"✅ {title} complete")


def main():
    parser = argparse.ArgumentParser(description="Build AI artifacts pipeline")

    parser.add_argument(
        "--config",
        default="llms_config.json",
        help="Path to llms_config.json (relative to scripts/ unless absolute)",
    )

    parser.add_argument(
        "--token-estimator",
        default="heuristic-v1",
        help="Token estimator (heuristic-v1|cl100k|<custom label>)",
    )
    parser.add_argument(
        "--bundles-format",
        choices=["manifest", "jsonl", "md", "all"],
        default="md",
        help="Output format for category bundles",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Propagate dry-run to steps that support it (site index & bundles)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limit pages for dry-run previews (0 = no limit)",
    )

    args = parser.parse_args()

    scripts_dir = Path(__file__).parent
    # Normalize config path for steps that accept it
    config_path = (
        str(scripts_dir / args.config)
        if not Path(args.config).is_absolute()
        else args.config
    )

    # 1) AI pages (resolved markdown) — this script has no --config flag
    ai_pages_cmd = ["python3", str(scripts_dir / "generate_ai_pages.py")]
    # If you want to force local-only snippets by default, uncomment:
    # ai_pages_cmd.append("--no-remote")
    run_step("Generate AI pages", ai_pages_cmd)

    # 2) llms.txt (site index of pages) — this script takes positional config (optional)
    llms_txt_cmd = ["python3", str(scripts_dir / "generate_llms_txt.py"), config_path]
    run_step("Generate llms.txt", llms_txt_cmd)

    # 3) site-index (+sections by default)
    site_index_cmd = [
        "python3",
        str(scripts_dir / "generate_site_index.py"),
        "--config", config_path,
        "--token-estimator", args.token_estimator,  # default heuristic-v1
    ]

    if args.dry_run:
        site_index_cmd.append("--dry-run")
    if args.limit:
        site_index_cmd += ["--limit", str(args.limit)]
    run_step("Generate site-index and full site content files", site_index_cmd)

    # 4) category bundles (manifest/jsonl/md/all)
    bundles_cmd = [
        "python3",
        str(scripts_dir / "generate_category_bundles.py"),
        "--config", config_path,
        "--format", args.bundles_format,
        "--token-estimator", args.token_estimator,  # default heuristic-v1
    ]
    if args.dry_run:
        bundles_cmd.append("--dry-run")
    if args.limit:
        bundles_cmd += ["--limit", str(args.limit)]
    run_step("Generate category bundles", bundles_cmd)

    print("\n🎉 All steps finished successfully.")


if __name__ == "__main__":
    main()
