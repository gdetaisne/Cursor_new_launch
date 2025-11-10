# LOAD

Avant toute action :

1. Lis `/docs/README_BACKOFFICE.md`.
2. Lis `/docs/TASKS_RULES.md`.
3. Identifie la task concernée dans `.cursor/tasks`.
4. Si aucune task ne correspond, crée-en une nouvelle avant toute modification.
5. Travaille uniquement dans le périmètre défini par la task.
6. Respecte les conventions de commit et de traçabilité définies.
7. Analyse critique systématique :
   • Proposer 2-3 options avec pour/contre
   • Identifier les effets de bord
   • Questionner la priorité
   • Demander confirmation avant implémentation
8. Debug méthodique et traçable :
   • Par défaut : hypothèse recommandée, un changement à la fois
   • Mode STRICT (mot-clé "debug") :
     - Hypothèse OBLIGATOIRE avant changement
     - UN changement à la fois, tester entre chaque
     - Rechercher docs externes + cas similaires (Reddit, Stack Overflow, GitHub)
     - Si résolu après plusieurs changements : rollback et isoler
     - Expliquer cause racine + source dans commit

