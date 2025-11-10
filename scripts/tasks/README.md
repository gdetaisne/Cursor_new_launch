# Scripts d'automatisation

Scripts pour faciliter la gestion des tasks et du workflow.

## complete-task.sh

**Usage** :
```bash
./scripts/tasks/complete-task.sh <task_id> [commit_message]
```

**Description** :
Automatise le processus de finalisation d'une task :
1. Vérifie que la task est marquée "✅ Terminé"
2. Archive la task dans `.cursor/task_archives/`
3. Crée un commit
4. Met à jour le journal `.cursor/tasks/commits/tXXX.md`
5. Commit la mise à jour du journal

**Exemples** :
```bash
# Archivage simple
./scripts/tasks/complete-task.sh t002

# Avec message personnalisé
./scripts/tasks/complete-task.sh t002 "t002: Complete API implementation with tests"
```

**Prérequis** :
- La task doit avoir `**Statut : ✅ Terminé**` dans la section État d'avancement
- Être à la racine du projet
- Git configuré

**Ce que fait le script** :
- ✅ Vérifie l'existence de la task
- ✅ Vérifie le statut "Terminé"
- ✅ Déplace vers task_archives
- ✅ Commit automatique
- ✅ Met à jour le journal de commits
- ✅ Affiche un résumé

**Ce que le script ne fait PAS** :
- ❌ Ne modifie pas le contenu de la task
- ❌ Ne marque pas automatiquement comme "Terminé"
- ❌ Ne push pas sur remote (à faire manuellement)

