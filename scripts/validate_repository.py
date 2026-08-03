from pathlib import Path

root = Path(__file__).resolve().parents[1]
required = [
    "global.json", "Directory.Build.props", "Directory.Packages.props",
    "backend/Integer.Legal.slnx", "database/migrations/001_legal_core.sql", "database/migrations/002_legal_mvp_completion.sql",
    "database/tests/rls_isolation.sql", "docs/work-packages/WP-IL-BE-002.md",
    "docs/work-packages/WP-IL-BE-001.md", "docs/adr/ADR-IL-001-module-boundaries-and-persistence.md",
]
missing = [path for path in required if not (root / path).is_file()]
if missing:
    raise SystemExit("Missing required files: " + ", ".join(missing))
print(f"Repository structure valid ({len(required)} required files).")
