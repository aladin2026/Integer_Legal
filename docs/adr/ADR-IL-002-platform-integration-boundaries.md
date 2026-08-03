# ADR-IL-002 — Intégrations Platform, documents et préfacturation

- Statut : Accepté
- Date : 2026-08-03
- Référence : WP-IL-BE-002, AB-1.0

## Décision

1. `document_versions.storage_object_key` est une référence opaque vers le stockage sécurisé Integer Platform. Aucun binaire n’est stocké dans PostgreSQL Legal.
2. Les événements d’intégration utilisent l’Outbox locale, un nom stable et une version entière positive.
3. Les commandes planifiées sont persistées par Legal puis réclamées et exécutées par l’adaptateur Scheduler Platform. Legal ne crée pas de moteur de planification concurrent.
4. Les attributions de rôles Legal utilisent les UUID utilisateurs émis par Identity Platform. Aucun mot de passe, MFA ou cycle de session n’est géré dans Legal.
5. Une préfacture Legal peut être soumise à e-Invoice au moyen de `legal.prebill.submitted.v1`. Elle reste distincte d’une facture officielle et ne simule jamais une transmission ou un statut DGI.

## Conséquences

- Les déploiements locaux exigent des adaptateurs Platform, mais les frontières restent testables par contrats.
- Les changements de fournisseur de stockage ou de scheduler n’affectent pas le domaine Legal.
- La traçabilité entre préfacture et facture officielle sera ajoutée par un contrat e-Invoice entrant versionné.
