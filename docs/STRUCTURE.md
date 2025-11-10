# Structure du projet Back Office Moverz

## Arborescence

```
Back_Office/
├── .cursor/                        # Système de tasks et traçabilité
│   ├── README.md                   # Documentation structure .cursor
│   ├── tasks/                      # Tasks actives
│   │   ├── tXXX-type-details.md   # Spec de task
│   │   └── commits/                # Historique des commits
│   │       └── tXXX.md            # Journal commits par task
│   └── task_archives/              # Tasks terminées
│       └── tXXX-type-details.md   # Task archivée
│
├── docs/                           # Documentation projet
│   ├── CURSOR_LOAD.md             # Instructions de chargement Cursor
│   ├── README_BACKOFFICE.md       # Vision et objectifs du projet
│   ├── TASKS_RULES.md             # Règles de gestion des tasks
│   └── STRUCTURE.md               # Ce fichier
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

**Ne jamais commiter de code applicatif ici.**

- `tasks/` : Tasks actives en cours de travail
- `task_archives/` : Archive des tasks terminées
- `tasks/commits/` : Historique détaillé de tous les commits

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
# Créer dans .cursor/tasks/
nano .cursor/tasks/t002-feature-example.md

# Créer le journal de commits
nano .cursor/tasks/commits/t002.md
```

### Archiver une task terminée
```bash
# Déplacer la task
mv .cursor/tasks/tXXX-type-details.md .cursor/task_archives/

# Le journal de commits reste dans tasks/commits/
```

## Principes

1. **Traçabilité totale** : Tout changement est documenté dans une task
2. **Indépendance** : `.cursor/tasks` est lisible sans le code source
3. **Périmètre strict** : Une task = un périmètre défini
4. **Archivage** : Les tasks terminées sont archivées, pas supprimées
5. **Commits liés** : Chaque commit est tracé dans son fichier `.cursor/tasks/commits/tXXX.md`

