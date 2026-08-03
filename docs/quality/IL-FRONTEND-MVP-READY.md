# Integer Legal — Frontend Web MVP Ready

## Décision

Le frontend web MVP est qualifié pour intégration et déploiement dans l’environnement Integer Platform. Cette décision ne vaut pas autorisation de mise en service auprès de cabinets réels avant qualification Azure et pilote professionnel.

## Preuves

- Baseline UX : code du prototype v0.57, version Git 60, consolidé sans redéfinition visuelle.
- React/Next : build de production autonome.
- Internationalisation : français, anglais, arabe et `dir=rtl` natif.
- Identity : jeton éphémère exclusivement fourni par le pont Integer Platform ; aucun stockage local de jeton.
- API : liste des dossiers et vue dossier 360 raccordées à `/api/v1/matter-queries`.
- Robustesse : états chargement, vide, configuration absente, non-authentifié, interdit et erreur API.
- Sécurité navigateur : origines CORS explicitement configurées côté API.
- Gates : typecheck, lint, tests, build, validation dépôt et scan de secrets.

## Limite de la clôture

Les autres modules présents conservent la valeur de référence UX v0.57 tant que leur raccordement en écriture n’a pas son propre Work Package et sa qualification. Ils ne doivent pas être présentés comme des transactions persistées.

## Étape suivante autorisée

Déploiement Azure intégré, paramétrage Identity/tenant/secrets, sauvegarde-restauration, observabilité, tests bout-en-bout puis pilote professionnel contrôlé.
