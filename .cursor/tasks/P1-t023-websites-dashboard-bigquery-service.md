# P1-t023 — Websites Dashboard : Service BigQuery Backend

**Priorité : P1** (nice-to-have qui devient vite P0 pour monitoring business)

## Contexte

Suite à l'analyse du dashboard existant (P1-t016), le fichier `bigquery.ts` fait 1016 lignes avec queries mélangées.

**Objectif** : Créer un service BigQuery propre, modulaire, typé, testé, avec retry logic et cache.

**Principe** : Separation of Concerns - Client ≠ Queries ≠ Types ≠ Cache

## Objectifs

- [ ] Client BigQuery singleton avec credentials sécurisés
- [ ] Queries séparées par domaine (SEO, Conversions, Web Vitals)
- [ ] Types TypeScript stricts (pas de `any`)
- [ ] Retry logic avec exponential backoff (3 tentatives)
- [ ] Cache in-memory (5 min TTL) ou Redis (optionnel)
- [ ] Tests unitaires (Jest + mocks BigQuery)
- [ ] Documentation API complète

## Périmètre

**IN scope** :
- Service BigQuery complet backend
- Queries pour dashboard sites web (pas Leads, pas Folders)
- Cache stratégique (queries coûteuses uniquement)
- Tests avec mocks BigQuery
- Types stricts pour toutes les queries

**OUT scope** :
- Routes API (sera fait dans t024)
- Frontend (sera fait dans t025)
- ETL scripts (sera fait dans t028)
- Agents IA (hors périmètre dashboard)

## Implémentation

### Structure créée

```
backend/
├── src/
│   ├── services/
│   │   └── bigquery/
│   │       ├── client.ts              # Client BigQuery singleton
│   │       ├── cache.ts               # Cache in-memory (5 min TTL)
│   │       ├── queries/
│   │       │   ├── seo.queries.ts         # Queries GSC (typed)
│   │       │   ├── conversions.queries.ts # Queries GA4
│   │       │   └── webvitals.queries.ts   # Queries Web Vitals
│   │       ├── types/
│   │       │   ├── seo.types.ts           # Types SEO
│   │       │   ├── conversions.types.ts   # Types conversions
│   │       │   └── webvitals.types.ts     # Types Web Vitals
│   │       └── utils/
│   │           ├── retry.ts               # Retry logic
│   │           └── validation.ts          # Validation dates
│   └── ...
├── tests/
│   └── services/
│       └── bigquery/
│           ├── client.test.ts
│           ├── seo.queries.test.ts
│           └── cache.test.ts
└── ...
```

### Variables ENV à ajouter

```env
# BigQuery (Analytics Websites)
GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core
BQ_LOCATION=europe-west1
GCP_SA_KEY_JSON={"type":"service_account",...}  # Déjà fourni
```

### Dépendances à installer

```bash
cd backend
pnpm add @google-cloud/bigquery
```

## État d'avancement

### Checklist implémentation
- [ ] Client BigQuery singleton (`client.ts`)
- [ ] Cache in-memory (`cache.ts`)
- [ ] Queries SEO (`queries/seo.queries.ts`)
- [ ] Queries Conversions (`queries/conversions.queries.ts`)
- [ ] Queries Web Vitals (`queries/webvitals.queries.ts`)
- [ ] Types TypeScript (`types/*.ts`)
- [ ] Retry logic (`utils/retry.ts`)
- [ ] Validation dates (`utils/validation.ts`)
- [ ] Tests unitaires (>80% coverage)
- [ ] Documentation README

### Tests
- [ ] Tests client BigQuery
- [ ] Tests cache (hit/miss/expiration)
- [ ] Tests queries SEO
- [ ] Tests retry logic
- [ ] Tests validation

### Documentation
- [ ] README service BigQuery
- [ ] Exemples utilisation
- [ ] Docs types TypeScript

## Commits liés

_(à remplir lors de l'implémentation)_

## Notes futures

### Améliorations possibles

1. **Cache Redis** : Remplacer in-memory par Redis si traffic élevé
2. **Métriques Prometheus** : Exporter durée queries, cache hit rate
3. **Query builder** : Créer DSL pour construire queries dynamiquement
4. **Materialized views** : Créer vues matérialisées BigQuery pour queries fréquentes

### Points d'attention

- ⚠️ Credentials ne doivent JAMAIS apparaître dans les logs
- ⚠️ Cache à vider si structure BigQuery change
- ⚠️ Retry logic à désactiver pour queries avec `INSERT`/`UPDATE`

---

**Dernière mise à jour** : 2025-11-10  
**Auteur** : Claude (Cursor AI)  
**Status** : ⏳ En attente implémentation
**Dépend de** : P1-t016 (analyse) ✅
**Prérequis pour** : P1-t024 (Routes API)

