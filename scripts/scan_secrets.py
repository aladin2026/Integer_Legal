from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
ignored = {".git", "bin", "obj", "node_modules", "TestResults"}
patterns = [re.compile(r"gh[pousr]_[A-Za-z0-9_]{30,}"), re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")]
violations = []
for path in root.rglob("*"):
    if not path.is_file() or any(part in ignored for part in path.parts):
        continue
    try: content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError: continue
    if any(pattern.search(content) for pattern in patterns): violations.append(str(path.relative_to(root)))
if violations:
    raise SystemExit("Potential secrets found: " + ", ".join(violations))
print("No high-confidence committed secrets detected.")
