# t003 — Règle 8 : Debug méthodique et traçable

## Contexte

Problème identifié : lors du debugging, tendance à faire plusieurs corrections successives sans isoler la cause racine. Résultat :
- Pas d'apprentissage clair
- Corrections inutiles possibles
- Pas de documentation du "pourquoi"

Besoin d'une règle 8 pour structurer le debug.

## Objectifs

1. Ajouter règle 8 dans `CURSOR_LOAD.md`
2. Définir mode flexible (par défaut) et strict (mot-clé "debug")
3. Documenter la procédure de debug strict avec recherche externe
4. Enrichir `TASKS_RULES.md` avec la section debug

## Périmètre

### Fichiers modifiés
- `/docs/CURSOR_LOAD.md` : ajout règle 8
- `/docs/TASKS_RULES.md` : section complète sur le debug

### Règle 8 - Contenu

**Mode flexible (par défaut)** :
- Hypothèse avant changement (recommandé)
- Un changement à la fois (recommandé)
- Expliquer la cause racine si trouvée

**Mode STRICT (mot-clé "debug")** :
- Hypothèse OBLIGATOIRE avant tout changement
- UN SEUL changement par tentative
- Test entre chaque
- Recherche documentation externe systématique
- Vérifier si le cas a été documenté (Stack Overflow, Reddit, GitHub Issues, docs officielles)
- Si résolu : rollback et isoler le bon changement
- Commit message détaillé : "Fix: [problème] - Cause: [raison] - Source: [lien si applicable]"

### Hors périmètre
- Modifications de code applicatif

## Implémentation

### CURSOR_LOAD.md - Règle 8

```markdown
8. Debug méthodique et traçable :
   • Par défaut : hypothèse recommandée, un changement à la fois
   • Mode STRICT (mot-clé "debug") :
     - Hypothèse OBLIGATOIRE avant changement
     - UN changement à la fois, tester entre chaque
     - Rechercher docs externes + cas similaires (Reddit, Stack Overflow, GitHub)
     - Si résolu après plusieurs changements : rollback et isoler
     - Expliquer cause racine + source dans commit
```

### TASKS_RULES.md - Section Debug

Nouvelle section détaillée expliquant :
- Différence mode flexible vs strict
- Processus de debug strict étape par étape
- Exemples de recherche externe
- Format commit message pour fix
- Cas d'usage : quand utiliser "debug" ?

## État d'avancement

- [x] Analyse du besoin et définition règle
- [x] Rédaction contenu règle 8
- [x] Task t003 créée
- [x] Modification CURSOR_LOAD.md
- [x] Enrichissement TASKS_RULES.md
- [x] Section complète avec exemples et déclencheurs

**Statut : ✅ Terminé**

## Commits liés

- (à venir) `t003: Add Rule 8 - Methodical and traceable debugging`

## Notes futures

**Déclencheurs du mode strict** :
- Utilisateur dit explicitement "debug"
- Utilisateur dit "je ne comprends pas pourquoi"
- Après 2 tentatives infructueuses

**Sources de recherche externe recommandées** :
- Documentation officielle
- Stack Overflow
- Reddit (r/programming, r/[techno])
- GitHub Issues
- Blog posts techniques

**Avantages attendus** :
- Meilleur apprentissage
- Moins de corrections inutiles
- Documentation de qualité
- Traçabilité des solutions

