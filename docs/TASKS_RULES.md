# Règles des Tasks

## Format & indépendance

- Dossier : `.cursor/tasks` (tasks actives)
- Dossier : `.cursor/task_archives` (tasks terminées)
- Format : `tXXX-type-details.md` (ex: `t001-foundations-docs-and-tasks.md`)
- `XXX` = numéro séquentiel.
- AUCUN code dans `.cursor/tasks`. Ce sont des specs et journaux fonctionnels/techniques.
- Les tasks sont indépendantes du code : on peut tout comprendre sans ouvrir `src/`.

## Contenu obligatoire d'une task

```md
# tXXX — Titre clair

## Contexte
## Objectifs
## Périmètre
## Implémentation
## État d'avancement
## Commits liés
## Notes futures
```

## Règles Cursor (workflow strict)

### 1. LOAD obligatoire en début de session

Avant toute action, exécuter le LOAD (voir `/docs/CURSOR_LOAD.md`) :
- Lire `/docs/README_BACKOFFICE.md`
- Lire `/docs/TASKS_RULES.md`
- Identifier la task concernée dans `.cursor/tasks`

### 2. Task avant toute modification

**JAMAIS de code sans task.**
- Si task existe : l'utiliser
- Si aucune task ne correspond : en créer une nouvelle
- Documenter la task complètement avant d'implémenter

### 3. Mise à jour systématique

À chaque modification, mettre à jour **2 endroits** :

**a) La task principale** (`.cursor/tasks/tXXX-type-details.md`) :
- `## Implémentation` : détails techniques
- `## État d'avancement` : checklist et statut
- `## Commits liés` : liste des commits

**b) Le journal de commits** (`.cursor/tasks/commits/tXXX.md`) :
- Historique chronologique des commits
- Message + hash + date
- Fichiers modifiés

### 4. Périmètre strict

**Ne JAMAIS sortir du périmètre de la task active.**

Si lors du travail on découvre un autre sujet :
1. **S'arrêter**
2. **Proposer** de créer une nouvelle task
3. **Documenter** le besoin identifié
4. **Continuer** sur la task en cours
5. Traiter la nouvelle task plus tard

### 5. Traçabilité des commits

Structure `.cursor/` :
```
.cursor/
├── tasks/                      (tasks actives)
│   ├── t001-type-details.md
│   └── t002-type-details.md
├── task_archives/              (tasks terminées)
│   └── t000-type-details.md
└── tasks/
    └── commits/
        ├── t001.md
        └── t002.md
```

Format de chaque fichier `commits/tXXX.md` :
```md
# Commits pour t001

## [hash-court] Message du commit
**Date** : YYYY-MM-DD HH:MM
**Fichiers** :
- path/to/file1.ts
- path/to/file2.ts

**Changements** :
Description brève des modifications.

---

## [hash-court] Autre commit
...
```

## Cycle de vie d'une task

1. **Création** : Nouvelle task dans `.cursor/tasks/tXXX-type-details.md`
2. **Travail** : Mise à jour continue (Implémentation + État d'avancement)
3. **Terminée** : Marquer statut ✅ Terminé
4. **Archivage** : Déplacer vers `.cursor/task_archives/tXXX-type-details.md`

**Important** : Le journal de commits (`.cursor/tasks/commits/tXXX.md`) reste dans `commits/` même après archivage.

## Debug méthodique (Règle 8)

### Mode par défaut : Flexible

En temps normal, il est **recommandé** de :
- Formuler une hypothèse avant de changer
- Faire un changement à la fois
- Expliquer la cause racine si trouvée

### Mode STRICT : Mot-clé "debug"

Quand l'utilisateur dit **"debug"** ou qu'on ne comprend pas un problème, appliquer **strictement** :

#### 1. Hypothèse OBLIGATOIRE
```
Avant tout changement :
"Hypothèse : [Problème X] est causé par [raison Y]
 Changement prévu : [modification Z]
 Test attendu : [résultat si hypothèse correcte]"
```

#### 2. UN changement à la fois
- Modifier une seule chose
- Tester immédiatement
- Noter le résultat

#### 3. Recherche externe systématique

**Sources à consulter** :
1. Documentation officielle de la technologie
2. Stack Overflow (rechercher erreur exacte)
3. Reddit (r/programming, r/[techno])
4. GitHub Issues (repo concerné)
5. Blog posts techniques récents

**Exemple de recherche** :
```
"git commit --format error" site:stackoverflow.com
"complete-task.sh bash commit hash" site:reddit.com
```

#### 4. Rollback et isolation

Si le bug est résolu après plusieurs tentatives :
```bash
# 1. Sauvegarder la version qui marche
git stash

# 2. Revenir au bug
git reset HEAD~N

# 3. Réappliquer UN changement à la fois
# Tester entre chaque

# 4. Identifier le bon changement
```

#### 5. Format commit pour fix

```
Fix: [Description courte du problème]

Cause racine : [Explication détaillée]
Solution : [Ce qui a été changé]
Source : [Lien doc/SO/Reddit si applicable]

Testé avec : [commande ou scénario de test]
```

**Exemple** :
```
Fix: complete-task.sh fails to extract commit hash

Cause racine : git commit n'accepte pas l'option --format
La documentation indique que --format est pour git log, pas git commit

Solution : Remplacé par git log -1 --format="%h" après le commit
Source : https://git-scm.com/docs/git-log

Testé avec : ./scripts/tasks/complete-task.sh t002
```

### Déclencheurs du mode STRICT

Mode strict activé automatiquement si :
- ✅ Utilisateur dit "debug"
- ✅ Utilisateur dit "je ne comprends pas pourquoi"
- ✅ Après 2 tentatives infructueuses sur le même problème

### Bénéfices

- 📚 **Apprentissage réel** : on comprend le pourquoi
- 🎯 **Pas de corrections inutiles** : seulement le nécessaire
- 📝 **Documentation de qualité** : trace claire pour l'équipe
- 🔍 **Réutilisable** : les futurs bugs similaires sont plus rapides

