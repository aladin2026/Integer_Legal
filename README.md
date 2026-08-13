# Integer Legal

## Test local de bout en bout

Le parcours réel frontend → OIDC/PKCE → API → PostgreSQL se lance depuis PowerShell avec `./scripts/start_legal_local.ps1`. Le guide détaillé, les comptes de démonstration et les contrôles d’isolation sont dans [docs/operations/LEGAL-LOCAL-E2E-RUNBOOK.md](docs/operations/LEGAL-LOCAL-E2E-RUNBOOK.md).

Integer Legal est le module métier trilingue français–anglais–arabe (RTL natif) de gestion et de pilotage des cabinets d’avocats, conçu pour le Maroc puis extensible à l’Afrique.

## État de construction

- Architecture cible : monolithe modulaire AB-1.0.
- Backend MVP : **Ready**, ASP.NET Core / .NET 10 LTS, PostgreSQL, API `/api/v1`.
- Frontend web MVP : **Ready**, baseline UX v0.57 consolidée, React/Next, FR/EN/AR, RTL et lectures API réelles.
- Mobile : Flutter, hors du premier incrément backend.
- Capacités transverses (identité, audit, événements, diagnostics) : réutilisées depuis Integer Platform.

Le prototype UX v0.57 reste la référence fonctionnelle et ergonomique. Il n’est pas une preuve de sécurité, de persistance ou d’exploitabilité en production.

## Construction

```bash
dotnet restore backend/Integer.Legal.slnx --configfile nuget.config
dotnet build backend/Integer.Legal.slnx -c Release --no-restore
dotnet test backend/Integer.Legal.slnx -c Release --no-build
```

Voir [la décision Backend MVP Ready](docs/quality/IL-BACKEND-MVP-READY.md), [WP-IL-BE-001](docs/work-packages/WP-IL-BE-001.md) et [ADR-IL-001](docs/adr/ADR-IL-001-module-boundaries-and-persistence.md).

Le frontend se construit dans `frontend/` avec `npm ci`, puis `npm run typecheck`, `npm run lint`, `npm test` et `npm run build`. Son URL API est fournie par `NEXT_PUBLIC_INTEGER_LEGAL_API_URL` et son jeton éphémère par `window.IntegerPlatform.getAccessToken`.

Voir [la décision Frontend Web MVP Ready](docs/quality/IL-FRONTEND-MVP-READY.md), [WP-IL-FE-001](docs/work-packages/WP-IL-FE-001.md) et [ADR-IL-003](docs/adr/ADR-IL-003-frontend-platform-api-boundary.md).
