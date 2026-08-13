$ErrorActionPreference = "Continue"
$repo = Split-Path -Parent $PSScriptRoot
$processFile = "$repo/.local/legal-processes.json"
if (Test-Path $processFile) {
    $processes = Get-Content -Raw $processFile | ConvertFrom-Json
    foreach ($id in @($processes.backend, $processes.frontend)) { Stop-Process -Id $id -ErrorAction SilentlyContinue }
    Remove-Item $processFile -Force
}
Set-Location $repo
docker compose stop postgres identity
Write-Host "Services Integer Legal locaux arrêtés. Les données PostgreSQL sont conservées."
