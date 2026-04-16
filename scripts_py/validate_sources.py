from __future__ import annotations

import json
from pathlib import Path


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    manifest_path = repo_root / "content" / "published" / "manifest.json"

    if not manifest_path.exists():
        print("No published manifest found yet. Run build_data_pack.py first.")
        return

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    domains = manifest.get("domains", [])
    domain_ids = [entry.get("domain") for entry in domains]

    if len(domain_ids) != len(set(domain_ids)):
        raise SystemExit("Duplicate domain ids found in published manifest.")

    print(f"Validated published manifest with {len(domains)} domains.")


if __name__ == "__main__":
    main()
