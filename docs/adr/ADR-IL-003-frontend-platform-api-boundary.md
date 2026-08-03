# ADR-IL-003 — Frontend, Identity Platform et API Legal

## Statut

Accepté — BUILD-IL-004.

## Décision

Le frontend produit reprend le code React de la version 60 du prototype UX v0.57. Il appelle l’API Legal par un client typé et obtient le jeton d’accès à travers un adaptateur injecté par Integer Platform (`window.IntegerPlatform.getAccessToken`). Le frontend ne met en œuvre ni fournisseur d’identité, ni persistance de jeton, ni règles d’autorisation métier parallèles.

Le backend autorise uniquement les origines configurées dans `Cors:AllowedOrigins`. Les autorisations effectives restent validées côté API par les politiques `legal.read`, `legal.write`, `legal.finance` et `legal.admin`.

## Conséquences

- La référence UX est consolidée au lieu d’être recréée.
- Le navigateur ne possède pas de secret durable.
- Un environnement sans pont Identity Platform affiche un état de connexion indisponible, sans données fictives de substitution pour les vues raccordées.
- Les modules non encore raccordés restent identifiés comme hérités du prototype et ne constituent pas une preuve de persistance métier.

