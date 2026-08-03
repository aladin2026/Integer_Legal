# WP-IL-BE-001 — Socle backend et premier noyau métier

## Décision d’autorisation

Work Package autorisé dans BUILD-IL-001. Il précède toute construction frontend connectée.

## Objectif

Établir un premier incrément backend exécutable et testable pour Integer Legal : modèle multi-cabinet, clients/parties, dossiers, échéances, persistance PostgreSQL, services applicatifs et API REST versionnée.

## Entrées réutilisées

- Architecture Baseline AB-1.0 et standards d’Integer Platform.
- Product Book Integer Legal v0.2.
- Prototype UX v0.57 figé.
- Dossier de validation professionnelle v0.2.
- Propriété des capacités : Legal pour le métier juridique, Platform pour le transverse, e-Invoice pour la facture officielle.

## Périmètre

1. Fondation .NET 10 alignée sur Integer Platform.
2. Agrégats `Client`, `Matter`, `Deadline` avec UUID et `FirmId` obligatoire.
3. Schéma PostgreSQL, contraintes, index et Row Level Security.
4. Outbox/Inbox versionnées et journal d’audit append-only.
5. Services métier et contrôleurs `/api/v1`.
6. Tests unitaires des invariants critiques.
7. CI, conteneur PostgreSQL local et contrôles de dépôt.

## Hors périmètre

- Facturation officielle et statuts DGI : Integer e-Invoice.
- Implémentation locale de l’identité, des notifications ou de l’observabilité : Integer Platform.
- Stockage binaire documentaire, scheduler durable, portail client et mobile : Work Packages ultérieurs.
- Frontend connecté : interdit avant qualification de cet incrément.

## Critères d’acceptation

- Aucun enregistrement métier sans `firm_id`.
- RLS activée et forcée sur les tables appartenant au cabinet.
- Les références client et dossier sont uniques par cabinet.
- Une échéance passée ne peut être créée comme échéance active.
- Les erreurs HTTP utilisent Problem Details et ne divulguent pas d’informations internes.
- OpenAPI expose uniquement `/api/v1`.
- Build, tests, audit de dépendances et scan de secrets passent en CI.

## Quality Gates Symphonie

- QG-DOC : WP et ADR présents avant code.
- QG-ARCH : dépendances Domain ← Application ← Infrastructure/Presentation respectées.
- QG-SEC : isolation multi-cabinet deny-by-default et aucun secret commité.
- QG-DATA : migration idempotente, contraintes et RLS qualifiées.
- QG-TEST : invariants critiques couverts.

## Preuves attendues

Rapports CI, résultats des tests, validation SQL PostgreSQL, OpenAPI généré et revue d’architecture.
