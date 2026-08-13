# Integer Legal — parcours local de bout en bout

## Résultat attendu

Le navigateur s’authentifie par Authorization Code + PKCE auprès du fournisseur OIDC local, appelle l’API Legal avec un jeton réel, puis l’API lit PostgreSQL sous la politique RLS du cabinet porté par `integer_tenant`.

L’API utilise le rôle PostgreSQL limité `integer_legal_runtime`, explicitement dépourvu de `BYPASSRLS`. Le compte administrateur sert seulement aux migrations et aux fixtures.

Keycloak est exclusivement l’adaptateur OIDC de développement. Il reproduit le contrat Integer Platform et ne devient pas une dépendance du produit.

## Prérequis Windows / VS Code

- Docker Desktop démarré ;
- .NET SDK défini par `global.json` ;
- Node.js 22 ;
- PowerShell 7 recommandé.

## Démarrage

Dans le terminal PowerShell de VS Code, à la racine du dépôt :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
./scripts/start_legal_local.ps1
```

Au premier démarrage, les images et les dépendances sont téléchargées. Ouvrir ensuite `http://localhost:3000` et cliquer sur **Connexion**.

Comptes locaux, sans valeur hors de la machine de développement :

| Profil | Identifiant | Mot de passe | Cabinet | Autorisations |
|---|---|---|---|---|
| Associé A | `associe.a` | `Local-A-2026!` | Cabinet Atlas | lecture, écriture, finance, administration |
| Avocat B | `avocat.b` | `Local-B-2026!` | Cabinet Rif | lecture |

## Qualification fonctionnelle

1. Se connecter avec `associe.a` : la vue Dossiers doit exposer `IL-A-2026-001` uniquement.
2. Se déconnecter, puis se connecter avec `avocat.b` : la vue doit exposer `IL-B-2026-001` uniquement.
3. Vérifier `http://localhost:5080/health/live` : la réponse doit être `healthy`.
4. Vérifier qu’un appel API sans jeton retourne `401` :

```powershell
try { Invoke-WebRequest http://localhost:5080/api/v1/matter-queries } catch { $_.Exception.Response.StatusCode.value__ }
```

La valeur attendue est `401`. Les jetons d’accès restent en mémoire du navigateur ; le stockage de session ne contient que les valeurs transitoires PKCE.

## Arrêt et diagnostic

```powershell
./scripts/stop_legal_local.ps1
```

Les données PostgreSQL sont conservées. Pour consulter les journaux :

```powershell
docker compose logs postgres identity
```

En cas de changement du fichier de realm, supprimer uniquement l’environnement local avec `docker compose down --volumes`, puis relancer. Cette commande efface les données locales de démonstration.
