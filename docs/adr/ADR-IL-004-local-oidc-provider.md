# ADR-IL-004 — Fournisseur OIDC local pour Integer Legal

## Statut

Accepté pour le développement local uniquement.

## Décision

Integer Legal consomme le contrat Identity d’Integer Platform : OIDC Authorization Code + PKCE, audience `integer-legal-api`, tenant `integer_tenant` et permissions répétées `integer_permission`. Keycloak est utilisé uniquement comme fournisseur OIDC local conteneurisé et préconfiguré. Il ne devient ni une dépendance métier ni le fournisseur imposé en production.

Le frontend conserve le jeton uniquement en mémoire. `sessionStorage` contient seulement les valeurs temporaires PKCE et l’état anti-CSRF, supprimés au retour d’authentification.

## Conséquences

- le test local reproduit les frontières de confiance de Platform sans désactiver la sécurité ;
- aucune identité codée en dur n’existe dans l’API ;
- les comptes du realm importé sont des fixtures locales non sensibles ;
- Azure pourra remplacer Keycloak sans modifier les règles métier Legal.

