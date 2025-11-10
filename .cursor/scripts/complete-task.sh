#!/bin/bash
# Script pour marquer une task comme terminée et l'archiver
# Usage: ./complete-task.sh tXXX "Commit message"

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification des arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <task_id> [commit_message]${NC}"
    echo "Exemple: $0 t002 'Optional custom commit message'"
    exit 1
fi

TASK_ID=$1
CUSTOM_MESSAGE=$2

# Détection du fichier de task
TASK_FILES=(.cursor/tasks/${TASK_ID}-*.md)

if [ ! -f "${TASK_FILES[0]}" ]; then
    echo -e "${RED}❌ Erreur: Task ${TASK_ID} non trouvée dans .cursor/tasks/${NC}"
    exit 1
fi

TASK_FILE="${TASK_FILES[0]}"
TASK_BASENAME=$(basename "$TASK_FILE")

echo -e "${YELLOW}📋 Task trouvée: ${TASK_BASENAME}${NC}"

# Vérification que la task est bien marquée comme terminée
if ! grep -q "Statut : ✅ Terminé" "$TASK_FILE"; then
    echo -e "${RED}❌ Erreur: La task n'est pas marquée comme terminée${NC}"
    echo "Ajoutez '**Statut : ✅ Terminé**' dans la section État d'avancement avant de lancer ce script."
    exit 1
fi

echo -e "${GREEN}✅ Task marquée comme terminée${NC}"

# Archivage de la task
echo -e "${YELLOW}📦 Archivage de la task...${NC}"
mv "$TASK_FILE" .cursor/task_archives/

# Commit des changements
if [ -n "$CUSTOM_MESSAGE" ]; then
    COMMIT_MSG="$CUSTOM_MESSAGE"
else
    COMMIT_MSG="${TASK_ID}: Archive completed task"
fi

git add -A
COMMIT_HASH=$(git commit -m "$COMMIT_MSG" --format="%h" | grep -o '\[main [a-f0-9]*\]' | grep -o '[a-f0-9]*$')

echo -e "${GREEN}✅ Commit créé: ${COMMIT_HASH}${NC}"

# Mise à jour du journal de commits
COMMIT_JOURNAL=".cursor/tasks/commits/${TASK_ID}.md"
DATE=$(date '+%Y-%m-%d %H:%M')

# Création d'une entrée temporaire
cat > /tmp/new_entry.txt <<EOF
## [${COMMIT_HASH}] Archive completed task
**Date** : ${DATE}
**Fichiers** :
- .cursor/tasks/${TASK_BASENAME} → .cursor/task_archives/

**Changements** :
- Archivage de ${TASK_ID} dans task_archives (task terminée)

---

EOF

# Insertion de l'entrée au début du fichier (après le titre)
if [ -f "$COMMIT_JOURNAL" ]; then
    # Garder la première ligne (titre) et insérer la nouvelle entrée
    head -n 1 "$COMMIT_JOURNAL" > /tmp/journal_updated.txt
    echo "" >> /tmp/journal_updated.txt
    cat /tmp/new_entry.txt >> /tmp/journal_updated.txt
    tail -n +2 "$COMMIT_JOURNAL" >> /tmp/journal_updated.txt
    mv /tmp/journal_updated.txt "$COMMIT_JOURNAL"
    
    # Commit de la mise à jour du journal
    git add "$COMMIT_JOURNAL"
    JOURNAL_HASH=$(git commit -m "${TASK_ID}: Update commit journal with archiving entry" --format="%h" | grep -o '\[main [a-f0-9]*\]' | grep -o '[a-f0-9]*$')
    
    echo -e "${GREEN}✅ Journal mis à jour: ${JOURNAL_HASH}${NC}"
fi

# Nettoyage
rm -f /tmp/new_entry.txt

echo ""
echo -e "${GREEN}✅ Task ${TASK_ID} archivée avec succès !${NC}"
echo ""
echo "Résumé:"
echo "  📁 Archivée dans: .cursor/task_archives/${TASK_BASENAME}"
echo "  📝 Journal: ${COMMIT_JOURNAL}"
echo "  🔖 Commits: ${COMMIT_HASH}, ${JOURNAL_HASH}"
echo ""
echo -e "${YELLOW}📊 Tasks actives restantes:${NC}"
ls -1 .cursor/tasks/*.md 2>/dev/null | wc -l | xargs echo "  "

