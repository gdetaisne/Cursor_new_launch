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

