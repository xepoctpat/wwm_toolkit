from __future__ import annotations

import json
from pathlib import Path

DOMAINS = [
    "quests",
    "storylines",
    "npcs",
    "regions",
    "factions",
    "items",
    "skills",
    "bosses",
    "sources",
]


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    published_dir = repo_root / "content" / "published"
    published_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "generatedAt": "manual-run",
        "domains": [
            {
                "domain": domain,
                "rawPath": f"content/raw/{domain}",
                "publishedPath": f"content/published/{domain}.json",
                "status": "pending-verification",
            }
            for domain in DOMAINS
        ],
    }

    output_path = published_dir / "manifest.json"
    output_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote data-pack manifest to {output_path}")


if __name__ == "__main__":
    main()
