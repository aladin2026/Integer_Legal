# WP-IL-BE-002 — Complétion du backend MVP

## Objectif

Compléter le backend MVP après WP-IL-BE-001 : parties et conflits, procédures et audiences, documents, temps et frais, budgets et préfacturation, autorisations métier, audit opérationnel, scheduler et contrats d’intégration Platform.

## Entrées

- Product Book Integer Legal v0.2 et périmètre MVP P0.
- Prototype UX v0.57, référence fonctionnelle figée.
- ADR-IL-001 et backend fusionné par PR #1.
- Capacités Integer Platform : identité, autorisation transversale, stockage documentaire, événements, audit, notifications, scheduler et observabilité.
- Integer e-Invoice : seul propriétaire de la facturation officielle.

## Incréments

1. Parties, rattachement aux dossiers, contrôles de conflits et résultats.
2. Procédures, audiences, documents et versions documentaires.
3. Temps, frais, budgets, préfactures et lignes de préfacturation.
4. Attributions de rôles métier, audit opérationnel, commandes planifiées et messages d’intégration.
5. Services applicatifs, contrôleurs `/api/v1`, tests métier et tests d’isolation PostgreSQL.

## Règles structurantes

- Toute table métier appartenant au cabinet porte `firm_id`, une contrainte d’appartenance composite et une RLS forcée.
- Un contrôle de conflits conserve les critères et les résultats ; sa clôture est explicite et auditée.
- Une audience appartient à une procédure et un dossier du même cabinet.
- Legal ne stocke jamais le binaire documentaire ; il conserve une clé opaque fournie par Integer Platform.
- Les temps et frais ne peuvent être négatifs ; une ligne facturable ne peut être rattachée qu’à une préfacture du même dossier.
- Une préfacture n’est jamais une facture officielle et ne porte aucun statut DGI.
- Les autorisations métier complètent, sans remplacer, l’identité et les politiques transversales Platform.
- Le scheduler Legal persiste uniquement les commandes métier et leurs échéances ; l’exécution technique est fournie par Platform.

## Critères de clôture

- Migration PostgreSQL complète et idempotente qualifiée sur PostgreSQL 16.
- Tous les domaines exposent des services métier et des API authentifiées sous `/api/v1`.
- Isolation multi-cabinet vérifiée en SQL et au niveau applicatif.
- Audit et Outbox produits dans la transaction métier pour les opérations critiques.
- Contrats Platform versionnés et documentés.
- Build, format, dépendances, tests et scan de secrets verts.
- Aucun frontend connecté avant la décision Backend MVP Ready.
