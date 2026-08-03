# Integer Legal — Décision Backend MVP Ready

- Décision : **GO — Backend MVP Ready**
- Date : 2026-08-03
- Architecture : AB-1.0
- Branche de référence : `main`
- Commit qualifié : `9f018c112c8cf1562d219248c6dfbe602430569e`

## Périmètre clôturé

- Clients, parties, rattachements et contrôles de conflits.
- Dossiers, échéances, procédures et audiences.
- Documents et versions avec stockage binaire détenu par Integer Platform.
- Temps, frais, budgets et préfacturation.
- Autorisations métier par claims Platform.
- Audit opérationnel append-only.
- Outbox et scheduler durables avec leases, reprises et acquittements.
- Intégrations Platform et événement `legal.prebill.submitted.v1` vers e-Invoice.
- Liste paginée des dossiers et vue dossier 360°.

## Preuves

| Incrément | PR | Résultat |
|---|---:|---|
| Fondation, Clients, Dossiers, Échéances | #1 | Fusionnée, Backend CI verte |
| Complétion métier, audit, scheduler, Platform | #2 | Fusionnée, run `30779438145` vert |
| Modèle de lecture et vue 360° | #3 | Fusionnée, run `30779647163` vert |

La chaîne de qualification vérifie : structure du dépôt, scan de secrets, migrations PostgreSQL 16, isolation RLS entre deux cabinets, restauration NuGet, formatage, vulnérabilités transitives, compilation Release et tests automatisés.

## Frontières confirmées

- Integer Legal ne gère pas les mots de passe, MFA ou sessions : Integer Platform.
- Integer Legal ne stocke pas les binaires documentaires : stockage sécurisé Integer Platform.
- Integer Legal ne recrée pas le moteur technique du scheduler ou de l’Event Bus : adaptateurs Platform.
- Integer Legal produit des préfactures ; Integer e-Invoice reste seul propriétaire de la facture officielle et de tout statut DGI.

## Réserves hors décision

Cette décision autorise la construction du frontend connecté. Elle ne constitue pas encore une autorisation de mise en production publique : le déploiement Azure, les secrets/identités managées, la sauvegarde-restauration, l’observabilité opérationnelle, les tests de charge et le pilote professionnel restent des Gates de release.
