# Integer Legal

Integer Legal est le module métier trilingue français–anglais–arabe (RTL natif) de gestion et de pilotage des cabinets d’avocats, conçu pour le Maroc puis extensible à l’Afrique.

## État de construction

- Architecture cible : monolithe modulaire AB-1.0.
- Backend : ASP.NET Core / .NET 10 LTS, PostgreSQL, API `/api/v1`.
- Frontend : React, après qualification des API métier.
- Mobile : Flutter, hors du premier incrément backend.
- Capacités transverses (identité, audit, événements, diagnostics) : réutilisées depuis Integer Platform.

Le prototype UX v0.57 reste la référence fonctionnelle et ergonomique. Il n’est pas une preuve de sécurité, de persistance ou d’exploitabilité en production.

## Construction

```bash
dotnet restore backend/Integer.Legal.slnx --configfile nuget.config
dotnet build backend/Integer.Legal.slnx -c Release --no-restore
dotnet test backend/Integer.Legal.slnx -c Release --no-build
```

Voir [WP-IL-BE-001](docs/work-packages/WP-IL-BE-001.md) et [ADR-IL-001](docs/adr/ADR-IL-001-module-boundaries-and-persistence.md).
