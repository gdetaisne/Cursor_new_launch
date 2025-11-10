# Structure du projet Back Office Moverz

## Arborescence

```
Back_Office/
├── .cursor/                           # Système de tasks et traçabilité
│   ├── README.md                      # Documentation structure .cursor
│   ├── tasks/                         # Tasks actives
│   │   ├── PX-tXXX-type-details.md   # Spec de task (P0/P1/P2)
│   │   └── commits/                   # Historique des commits
│   │       └── PX-tXXX.md            # Journal commits par task
│   └── task_archives/                 # Tasks terminées
│       └── PX-tXXX-type-details.md   # Task archivée
│
├── docs/                           # Documentation projet
│   ├── CURSOR_LOAD.md             # Instructions de chargement Cursor (7 règles)
│   ├── README_BACKOFFICE.md       # Vision et objectifs du projet
│   ├── TASKS_RULES.md             # Règles de gestion des tasks
│   └── STRUCTURE.md               # Ce fichier
│
├── scripts/                        # Scripts d'automatisation
│   └── tasks/                     # Gestion des tasks
│       ├── README.md
│       └── complete-task.sh       # Archivage automatique
│
├── backend/                        # API Express/TypeScript (à venir)
│   ├── src/
│   ├── prisma/
│   └── package.json
│
└── frontend/                       # Application Vite/React (à venir)
    ├── src/
    └── package.json
```

## Dossiers principaux

### `.cursor/`
Contient le système de gestion des tasks et la traçabilité complète.

**Métadonnées uniquement, pas d'exécutables.**

- `tasks/` : Tasks actives en cours de travail
- `task_archives/` : Archive des tasks terminées
- `tasks/commits/` : Historique détaillé de tous les commits

### `scripts/`
Scripts d'automatisation du projet.

**Séparé de `.cursor/`** pour respecter le principe : `.cursor/` = données, `/scripts` = exécutables.

- `tasks/` : Scripts de gestion des tasks (complete-task.sh)

### `docs/`
Documentation générale du projet, règles et conventions.

**Fichiers clés** :
- `CURSOR_LOAD.md` : À lire en début de session
- `README_BACKOFFICE.md` : Vision du Back Office Moverz
- `TASKS_RULES.md` : Workflow strict des tasks

### `backend/` (futur)
API Express + TypeScript + Prisma

### `frontend/` (futur)
Application React + Vite

## Workflow

### Démarrage session
```bash
# 1. Lire la documentation
cat docs/CURSOR_LOAD.md

# 2. Lister les tasks actives
ls -la .cursor/tasks/*.md

# 3. Ouvrir la task concernée
cat .cursor/tasks/tXXX-type-details.md
```

### Créer une nouvelle task
```bash
# Créer dans .cursor/tasks/ (avec priorité)
nano .cursor/tasks/P0-t011-feature-example.md

# Créer le journal de commits
nano .cursor/tasks/commits/P0-t011.md
```

**Priorités** :
- **P0** : Vital MVP (sans ça, rien ne marche)
- **P1** : Nice to have → P0 rapide
- **P2** : Nice to have, jamais prioritaire

### Archiver une task terminée

**Méthode automatique (recommandée)** :
```bash
# Utiliser le script d'archivage (avec priorité)
./scripts/tasks/complete-task.sh P0-t011
```

Le script automatise :
- Vérification du statut "Terminé"
- Archivage dans task_archives
- Création du commit
- Mise à jour du journal

**Méthode manuelle** :
```bash
# Déplacer la task
mv .cursor/tasks/PX-tXXX-type-details.md .cursor/task_archives/

# Le journal de commits reste dans tasks/commits/
```

## Principes

1. **Traçabilité totale** : Tout changement est documenté dans une task
2. **Indépendance** : `.cursor/tasks` est lisible sans le code source
3. **Périmètre strict** : Une task = un périmètre défini
4. **Archivage** : Les tasks terminées sont archivées, pas supprimées
5. **Commits liés** : Chaque commit est tracé dans son fichier `.cursor/tasks/commits/tXXX.md`

