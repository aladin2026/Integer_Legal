# WP-IL-E2E-001 — Environnement local Platform–Legal

## Objectif

Fournir un parcours local reproductible qui prouve la chaîne navigateur → OIDC/PKCE → API Legal → PostgreSQL, selon les contrats Identity, Tenancy et Authorization qualifiés d’Integer Platform.

## Baselines

- Integer Platform `main@bd63fed716f00f78bc839ffdcb40d3d01c6046a0` : OIDC/JWT, claims exacts et bootstrap opérateur.
- Integer Legal `main@a89af80bbfaa0fbcca95f33dc6e144348fe23e2e` : backend et frontend MVP.

## Livrables

- fournisseur OIDC de développement Keycloak, isolé de la production ;
- client public PKCE `integer-legal-web` ;
- profils non sensibles pour deux cabinets ;
- alignement Legal sur `integer_tenant` et `integer_permission` ;
- fixtures PostgreSQL idempotentes pour deux cabinets ;
- authentification navigateur en mémoire, sans stockage durable du jeton ;
- orchestrateur PowerShell Windows/VS Code ;
- qualification automatisée de santé, authentification, lecture, isolation et refus d’accès.

## Critères d’acceptation

1. Aucun secret ou jeton réel n’est committé.
2. Authorization Code + PKCE S256 est utilisé par le navigateur.
3. L’API valide signature, issuer, audience, durée et permissions.
4. Le tenant vient uniquement de `integer_tenant` dans le jeton.
5. Un utilisateur du cabinet B ne peut pas lire les données du cabinet A.
6. Les données persistent après redémarrage de l’API.
7. Une commande documentée démarre l’environnement sous Windows.

