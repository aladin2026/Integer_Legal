[CmdletBinding()]
param([switch]$SkipInstall)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

foreach ($command in @("docker", "dotnet", "node", "npm")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Commande requise absente : $command" }
}

if (-not $env:INTEGER_LEGAL_POSTGRES_PASSWORD) { $env:INTEGER_LEGAL_POSTGRES_PASSWORD = "local-postgres-only" }
if (-not $env:INTEGER_LEGAL_RUNTIME_PASSWORD) { $env:INTEGER_LEGAL_RUNTIME_PASSWORD = "local-runtime-only" }
docker compose up -d postgres identity
if ($LASTEXITCODE -ne 0) { throw "Le démarrage Docker a échoué." }

Write-Host "Attente de PostgreSQL..."
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    docker compose exec -T postgres pg_isready -U integer_legal_admin -d integer_legal *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
}
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL n'est pas prêt." }

$coreExists = docker compose exec -T postgres psql -U integer_legal_admin -d integer_legal -tAc "select to_regclass('legal.firms') is not null"
if (($coreExists | Out-String).Trim() -ne "t") {
    foreach ($migration in Get-ChildItem "$repo/database/migrations/001_*.sql") {
        Get-Content -Raw $migration.FullName | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U integer_legal_admin -d integer_legal
        if ($LASTEXITCODE -ne 0) { throw "Migration échouée : $($migration.Name)" }
    }
}
$completionExists = docker compose exec -T postgres psql -U integer_legal_admin -d integer_legal -tAc "select to_regclass('legal.procedures') is not null"
if (($completionExists | Out-String).Trim() -ne "t") {
    foreach ($migration in Get-ChildItem "$repo/database/migrations/002_*.sql") {
        Get-Content -Raw $migration.FullName | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U integer_legal_admin -d integer_legal
        if ($LASTEXITCODE -ne 0) { throw "Migration échouée : $($migration.Name)" }
    }
}
Get-Content -Raw "$repo/database/fixtures/001_local_demo.sql" | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U integer_legal_admin -d integer_legal
if ($LASTEXITCODE -ne 0) { throw "Le chargement des données locales a échoué." }
Get-Content -Raw "$repo/database/local/001_runtime_role.sql" | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -v "runtime_password=$env:INTEGER_LEGAL_RUNTIME_PASSWORD" -U integer_legal_admin -d integer_legal
if ($LASTEXITCODE -ne 0) { throw "La création du rôle PostgreSQL d'exécution a échoué." }

Write-Host "Attente du fournisseur OIDC..."
for ($attempt = 0; $attempt -lt 90; $attempt++) {
    try {
        Invoke-WebRequest "http://localhost:8080/realms/integer-local/.well-known/openid-configuration" -UseBasicParsing | Out-Null
        break
    } catch { Start-Sleep -Seconds 2 }
}
if ($attempt -ge 90) { throw "Le fournisseur OIDC n'est pas prêt." }

$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:5080"
$env:ConnectionStrings__LegalDatabase = "Host=localhost;Port=5432;Database=integer_legal;Username=integer_legal_runtime;Password=$env:INTEGER_LEGAL_RUNTIME_PASSWORD"
$env:Authentication__Authority = "http://localhost:8080/realms/integer-local"
$env:Authentication__Audience = "integer-legal-api"
$env:Cors__AllowedOrigins__0 = "http://localhost:3000"
$backend = Start-Process dotnet -ArgumentList @("run", "--project", "$repo/backend/src/Integer.Legal.Api/Integer.Legal.Api.csproj", "--no-launch-profile") -PassThru

$env:NEXT_PUBLIC_INTEGER_LEGAL_API_URL = "http://localhost:5080"
$env:NEXT_PUBLIC_INTEGER_OIDC_AUTHORITY = "http://localhost:8080/realms/integer-local"
$env:NEXT_PUBLIC_INTEGER_OIDC_CLIENT_ID = "integer-legal-web"
$env:NEXT_PUBLIC_INTEGER_OIDC_SCOPE = "openid profile"
if (-not $SkipInstall) { Push-Location "$repo/frontend"; npm install; Pop-Location }
$frontend = Start-Process npm -ArgumentList @("run", "dev", "--prefix", "$repo/frontend") -PassThru

New-Item -ItemType Directory -Force "$repo/.local" | Out-Null
@{ backend = $backend.Id; frontend = $frontend.Id } | ConvertTo-Json | Set-Content "$repo/.local/legal-processes.json"
Write-Host "Integer Legal local est lancé : http://localhost:3000"
Write-Host "API : http://localhost:5080/health/live | Identité : http://localhost:8080"
Write-Host "Arrêt : ./scripts/stop_legal_local.ps1"
