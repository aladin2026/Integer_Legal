# WP-IL-FE-001 — Frontend web MVP connecté

## But

Transformer la référence UX Integer Legal v0.57 en frontend React exploitable, sans redéfinir son ergonomie et sans dupliquer les services transverses d’Integer Platform.

## Entrées figées

- Prototype UX v0.57, version Git 60, comme référence visuelle et fonctionnelle.
- API métier `/api/v1` qualifiée « Backend MVP Ready ».
- Identity, jetons, tenant, notifications et stockage restent fournis par Integer Platform.

## Périmètre

- Import fidèle du shell et des modules du prototype.
- Français, anglais et arabe avec bascule RTL native.
- Adaptateur d’authentification Platform sans stockage local du jeton.
- Client HTTP typé, gestion uniforme des erreurs et corrélation.
- Liste réelle des dossiers et vue dossier 360 réelle.
- Configuration CORS explicite du backend.
- Tests unitaires du client, typecheck, lint, build et Quality Gate CI.

## Hors périmètre

- Déploiement Azure et paramètres secrets de production.
- Application Flutter.
- Remplacement des composants Identity, stockage, scheduler ou notifications de Platform.
- Facture officielle, qui reste sous la responsabilité d’Integer e-Invoice.

## Critères d’acceptation

1. Aucun jeton n’est conservé dans `localStorage` ou `sessionStorage`.
2. L’URL API et les origines CORS sont configurables par environnement.
3. La liste des dossiers et la vue 360 consomment exclusivement `/api/v1/matter-queries`.
4. Les états chargement, vide, erreur, non-authentifié et accès refusé sont explicites.
5. `dir=rtl` est appliqué à l’arabe et les trois langues restent navigables.
6. Les gates frontend et backend passent en CI.

## Qualification

- `npm ci`, typecheck, lint, tests et build frontend.
- validation du dépôt et scan de secrets.
- revue de non-régression de la baseline v0.57.

