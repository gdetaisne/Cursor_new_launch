# t001 — Fondations : documentation et système de tasks

## Contexte

Dépôt Back_Office Moverz vide. Besoin de mettre en place les fondations : documentation, règles de traçabilité et système de tasks avant toute implémentation de code.

## Objectifs

1. Établir la documentation du projet (vision, principes)
2. Définir les règles de gestion des tasks
3. Créer les instructions pour Cursor
4. Initialiser cette task comme modèle
5. Mettre en place la structure `.cursor/` complète

## Périmètre

### Fichiers créés
- `/docs/CURSOR_LOAD.md` : instructions de chargement (7 règles dont analyse critique)
- `/docs/README_BACKOFFICE.md` : vision Back Office Moverz
- `/docs/TASKS_RULES.md` : règles de gestion des tasks
- `/docs/STRUCTURE.md` : arborescence et workflow du projet
- `.cursor/tasks/t001-foundations-docs-and-tasks.md` : cette task
- `.cursor/tasks/commits/t001.md` : journal des commits
- `.cursor/task_archives/.gitkeep` : dossier pour tasks terminées
- `.cursor/README.md` : documentation structure .cursor
- `/scripts/tasks/complete-task.sh` : script d'archivage automatique
- `/scripts/tasks/README.md` : documentation des scripts

### Hors périmètre
- Aucun code source (backend, frontend, etc.)
- Aucune configuration technique
- Aucune implémentation fonctionnelle

## Implémentation

### Documentation créée

**CURSOR_LOAD.md** : Checklist de démarrage en 7 règles
- Lecture docs obligatoire
- Identification/création task dans `.cursor/tasks`
- Travail dans le périmètre défini
- **Règle 7 : Analyse critique** (proposer options, effets de bord, questionner priorité)

**README_BACKOFFICE.md** : Vision projet
- Plateforme interne Moverz
- Gestion dossiers, déménageurs, devis, bookings, paiements
- Source unique de vérité
- Portails `/admin` et `/partner`

**TASKS_RULES.md** : Format et cycle de vie des tasks
- Nomenclature `tXXX-type-details.md`
- AUCUN code dans `.cursor/tasks`
- Structure obligatoire en 7 sections
- Indépendance totale du code source
- 5 règles Cursor : LOAD, task avant code, mise à jour systématique, périmètre strict, traçabilité
- Cycle de vie : création → travail → terminé → archivage

**Structure .cursor/** : Organisation complète
- `tasks/` : tasks actives
- `task_archives/` : tasks terminées
- `tasks/commits/` : traçabilité des commits (ne bouge jamais)
- `README.md` : documentation de la structure

**Structure /scripts/** : Scripts d'automatisation
- `tasks/` : scripts gestion tasks (complete-task.sh)
- Séparation claire : `.cursor/` = données, `/scripts` = exécutables

## État d'avancement

- [x] CURSOR_LOAD.md créé et validé
- [x] README_BACKOFFICE.md créé et validé
- [x] TASKS_RULES.md créé et validé (avec 5 règles Cursor + cycle de vie)
- [x] Structure `.cursor/tasks/` créée
- [x] Structure `.cursor/task_archives/` créée
- [x] Structure `.cursor/tasks/commits/` créée
- [x] .cursor/README.md créé avec documentation complète
- [x] t001 créé dans `.cursor/tasks/`
- [x] Fichier t001.md de traçabilité initialisé
- [x] Migration de /tasks vers .cursor/tasks effectuée
- [x] Dossier /tasks supprimé (obsolète)
- [x] docs/STRUCTURE.md créé avec arborescence complète
- [x] Script scripts/tasks/complete-task.sh créé
- [x] Documentation scripts créée
- [x] Règle 7 ajoutée dans CURSOR_LOAD (analyse critique)
- [x] Refactor scripts : .cursor/scripts → /scripts/tasks

**Statut : ✅ Terminé et archivé**

## Commits liés

- [306c912] `t001: Initialize project documentation and task system` (2025-11-10 08:50)
- [6a0567a] `t001: Archive completed task and update commit hash` (2025-11-10 08:50)
- [8dcb236] `t001: Update commit journal with archiving entry` (2025-11-10 08:50)
- [2923c6f] `t001: Add automation script for task completion` (2025-11-10 08:51)
- [e2c11b1] `t001: Remove duplicate task file from active tasks` (2025-11-10 08:51)
- [a9a3fd4] `t001: Update commit journal with automation entries` (2025-11-10 08:51)
- [af95b95] `t001: Finalize commit hash in archived task` (2025-11-10 08:51)
- (pending) `t001: Refactor scripts location and add critical analysis rule`

## Notes futures

Cette task sert de fondation. Toutes les tasks futures devront :
- Respecter le format défini dans TASKS_RULES.md (7 sections obligatoires)
- Être créées dans `.cursor/tasks/` avant toute modification de code (règle Cursor #2)
- Rester indépendantes du code (specs seulement)
- Maintenir à jour le journal `.cursor/tasks/commits/tXXX.md` (règle Cursor #3)
- Respecter strictement leur périmètre (règle Cursor #4)
- Être archivées dans `.cursor/task_archives/` une fois terminées (utiliser complete-task.sh)

### Utilisation du script d'archivage

Pour archiver une task terminée :
```bash
./scripts/tasks/complete-task.sh tXXX
```

Le script vérifie automatiquement le statut "✅ Terminé" et automatise tout le processus.

### Règle 7 : Analyse critique

Toujours proposer 2-3 options avant d'implémenter, avec :
- Pour/contre de chaque option
- Effets de bord identifiés
- Questionnement de la priorité
- Demande de confirmation

**Exemple appliqué** : Refactor `.cursor/scripts` → `/scripts/tasks` pour séparer données et exécutables.

