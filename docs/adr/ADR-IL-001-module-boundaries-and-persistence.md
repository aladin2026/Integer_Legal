# ADR-IL-001 — Frontières du module Legal et persistance PostgreSQL

- Statut : Accepté
- Date : 2026-08-03
- Référence : AB-1.0, WP-IL-BE-001

## Contexte

Integer Legal doit être construit comme produit métier sur Integer Platform, sans dupliquer les capacités transverses ni attribuer à Legal la facturation officielle.

## Décision

1. Le backend Legal est un monolithe modulaire Domain First en quatre couches : Domain, Application, Infrastructure et Presentation/API.
2. PostgreSQL est la source de vérité. Chaque donnée appartenant à un cabinet porte un UUID `firm_id` non nul.
3. Le contexte cabinet provient exclusivement d’une identité authentifiée et validée par Integer Platform. Le header de développement est désactivé en production.
4. La défense en profondeur combine filtrage applicatif et RLS PostgreSQL forcée via `app.current_firm_id`.
5. Les intégrations asynchrones utilisent des événements versionnés et Outbox/Inbox. Aucun appel réseau n’est émis dans la transaction métier.
6. L’audit métier est append-only. Les droits applicatifs n’autorisent ni mise à jour ni suppression.
7. Integer e-Invoice reste seul propriétaire de la facture officielle. Legal publiera ultérieurement une demande de conversion de préfacture via contrat versionné.

## Conséquences

- L’isolation multi-cabinet est testable au niveau SQL et applicatif.
- Les modules restent remplaçables et les transactions locales simples.
- Une intégration explicite à Integer Platform est nécessaire avant l’exposition publique.
- Les copies locales des services d’identité, audit transversal, notifications et scheduler sont interdites.
