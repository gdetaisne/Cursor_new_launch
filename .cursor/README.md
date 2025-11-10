# Structure .cursor/

Ce dossier contient les tasks, métadonnées et outils de traçabilité pour Cursor.

## Structure

```
.cursor/
├── README.md                    (ce fichier)
├── tasks/                       (tasks actives)
│   ├── t001-type-details.md
│   ├── t002-type-details.md
│   └── commits/                 (historique des commits)
│       ├── t001.md
│       └── t002.md
└── task_archives/               (tasks terminées)
    └── t000-type-details.md
```

## tasks/ (tasks actives)

**Objectif** : Contient toutes les tasks en cours de travail ou à faire.

### Cycle de vie

1. **Nouvelle task** : Créer `tXXX-type-details.md` dans `tasks/`
2. **Travail** : Mettre à jour continuellement
3. **Terminée** : Marquer statut ✅ Terminé
4. **Archivage** : Déplacer vers `task_archives/`

### Format de task

Voir `/docs/TASKS_RULES.md` pour la structure obligatoire (7 sections).

## task_archives/ (tasks terminées)

**Objectif** : Archive des tasks terminées pour historique.

- Une task terminée est déplacée ici (pas supprimée)
- Conserve l'historique complet du projet
- Le journal de commits reste dans `tasks/commits/`

## tasks/commits/ (traçabilité)

**Objectif** : Tracer l'historique détaillé des commits par task.

### Format de fichier

Chaque fichier `tXXX.md` contient l'historique chronologique (du plus récent au plus ancien) :

```md
# Commits pour tXXX

## [hash-court] Message du commit
**Date** : YYYY-MM-DD HH:MM
**Fichiers** :
- path/to/file1.ts
- path/to/file2.md

**Changements** :
Description brève des modifications apportées.

---

## [hash-court] Message précédent
...
```

### Workflow

1. Après chaque commit lié à une task
2. Ajouter une entrée en haut du fichier `.cursor/tasks/commits/tXXX.md`
3. Inclure : hash, date, fichiers modifiés, description

### Règle

**Tous les commits doivent être tracés** dans leur fichier respectif (règle Cursor #3).

**Important** : Les fichiers de commits ne sont JAMAIS archivés, ils restent dans `tasks/commits/` même après archivage de la task.

## Scripts d'automatisation

Les scripts sont dans `/scripts/tasks/` à la racine du projet.

**Script disponible** : `complete-task.sh` pour archiver automatiquement les tasks terminées.

Voir `/scripts/tasks/README.md` pour la documentation complète.

