import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
realm = json.loads((root / "infrastructure/keycloak/integer-local-realm.json").read_text(encoding="utf-8"))
assert realm["realm"] == "integer-local"
client = next(item for item in realm["clients"] if item["clientId"] == "integer-legal-web")
assert client["publicClient"] is True
assert client["standardFlowEnabled"] is True
assert client["directAccessGrantsEnabled"] is False
assert client["attributes"]["pkce.code.challenge.method"] == "S256"
mapper_claims = {mapper.get("config", {}).get("claim.name") for mapper in client["protocolMappers"]}
assert {"integer_tenant", "integer_permission"} <= mapper_claims
tenant_values = [user["attributes"]["integer_tenant"][0] for user in realm["users"]]
assert len(tenant_values) == len(set(tenant_values)) == 2

fixture = (root / "database/fixtures/001_local_demo.sql").read_text(encoding="utf-8")
for tenant in tenant_values:
    assert tenant in fixture

program = (root / "backend/src/Integer.Legal.Api/Program.cs").read_text(encoding="utf-8")
context = (root / "backend/src/Integer.Legal.Api/Security/ClaimsFirmContext.cs").read_text(encoding="utf-8")
assert 'RequireClaim("integer_permission"' in program
assert 'FindFirstValue("integer_tenant")' in context
assert 'RequireClaim("permissions"' not in program
assert 'FindFirstValue("firm_id")' not in context
runtime_role = (root / "database/local/001_runtime_role.sql").read_text(encoding="utf-8")
assert "nobypassrls" in runtime_role
assert "integer_legal_runtime" in (root / "scripts/start_legal_local.ps1").read_text(encoding="utf-8")
print("Local E2E identity, tenant and fixture contract valid.")
