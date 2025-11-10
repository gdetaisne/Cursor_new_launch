# t004 — Règle 9 : Deepsearch - Exhaustivité et certitude

## Contexte

Besoin d'un mode de recherche approfondie déclenchable par le mot-clé "deepsearch".

Objectif : faire 100% le tour d'une question, avec réponse limpide et certaine à ≥90%. Si certitude <90%, expliciter les points d'incertitude et demander confirmation avant de proposer une solution.

## Objectifs

1. Ajouter règle 9 dans `CURSOR_LOAD.md`
2. Documenter le mode deepsearch dans `TASKS_RULES.md`
3. Définir le format de réponse obligatoire
4. Préciser les sources à consulter selon contexte

## Périmètre

### Fichiers modifiés
- `/docs/CURSOR_LOAD.md` : ajout règle 9
- `/docs/TASKS_RULES.md` : section complète deepsearch

### Règle 9 - Contenu

**Déclencheur** : Mot-clé "deepsearch"

**Principe** : 
- Faire 100% le tour de la question
- Temps illimité pour être exhaustif
- Réponse certaine à ≥90% obligatoire
- Si <90% : expliciter incertitudes + demander confirmation avant solution

**Sources selon contexte** :

**Question technique/code** :
- Tous fichiers pertinents de la codebase
- Patterns similaires existants
- Documentation officielle
- Best practices (Stack Overflow, GitHub)
- Dépendances et effets de bord

**Question métier/fonctionnelle** :
- `CONTEXT.md`
- Tasks liées (actives + archivées)
- Historique des décisions
- Cohérence avec vision Moverz

**Question architecture** :
- `STRUCTURE.md`, `TASKS_RULES.md`
- Tasks archivées similaires
- Patterns existants
- Considérations scalabilité/maintenance

**Format de réponse obligatoire** :

```markdown
## Réponse (Deepsearch)

### Certitude : [X%]

[Si <90%]
⚠️ **Points d'incertitude** :
- [Ce qui n'est pas certain]
- [Ce qui manque pour être sûr à 90%+]

**Besoin de confirmation pour continuer ?**

[Si ≥90%]
### Analyse exhaustive
[Réponse détaillée et complète]

### Recommandation
[Action claire à entreprendre]
```

### Hors périmètre
- Code applicatif

## Implémentation

### CURSOR_LOAD.md - Règle 9

```markdown
9. Deepsearch - Exhaustivité et certitude :
   • Déclencheur : mot-clé "deepsearch"
   • Faire 100% le tour de la question (temps illimité)
   • Certitude ≥90% obligatoire
   • Si <90% : expliciter incertitudes + demander confirmation
   • Sources contextuelles : code, docs, CONTEXT.md, tasks, externe
```

### TASKS_RULES.md - Section Deepsearch

Section complète avec :
- Principe et déclencheur
- Sources à consulter par type de question
- Format de réponse obligatoire
- Exemples concrets
- Différence avec "debug" (règle 8)

## État d'avancement

- [x] Analyse du besoin et paramètres
- [x] Définition règle 9 complète
- [x] Task t004 créée
- [x] Modification CURSOR_LOAD.md
- [x] Enrichissement TASKS_RULES.md avec exemples complets
- [x] Format de réponse structuré
- [x] Différenciation debug vs deepsearch

**Statut : ✅ Terminé**

## Commits liés

- (à venir) `t004: Add Rule 9 - Deepsearch for exhaustive analysis`

## Notes futures

**Différences règle 8 vs règle 9** :
- **Debug** (règle 8) : résoudre un problème, isoler la cause, un changement à la fois
- **Deepsearch** (règle 9) : analyser une question, être certain ≥90%, pas forcément de changement

**Cas d'usage deepsearch** :
- Décision d'architecture importante
- Choix de technologie
- Compréhension approfondie d'un concept
- Validation d'une approche avant implémentation

**Bénéfices** :
- Évite les erreurs coûteuses
- Décisions éclairées
- Compréhension profonde vs superficielle
- Confiance dans les choix techniques

