# WP-IL-BE-003 — Modèle de lecture et décision Backend MVP Ready

## Objectif

Fournir les lectures nécessaires au frontend réel et prononcer la clôture du backend MVP : liste paginée des dossiers et vue dossier 360° consolidant client, parties, conflits, procédures, audiences, échéances, documents et situation financière.

## Règles

- Les lectures restent protégées par le claim Platform `legal.read`.
- Le `firm_id` provient exclusivement du contexte authentifié et de la RLS PostgreSQL.
- Les collections de la vue 360° sont bornées ; aucun export massif implicite.
- Les montants sont restitués avec leur devise, sans transformation en facture officielle.
- Les clés de stockage documentaire ne sont pas exposées par la vue métier.

## Critères de clôture

- API `/api/v1/matter-queries` compilée et documentée par OpenAPI.
- Pagination déterministe et limites contrôlées.
- Vue 360° inaccessible pour un dossier d’un autre cabinet.
- Migrations PostgreSQL, format, dépendances, build et tests verts.
- PR fusionnée dans `main` et décision explicite `Backend MVP Ready`.
