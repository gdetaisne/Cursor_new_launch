# P1-t024 — Websites Dashboard : Routes API Analytics

**Priorité : P1**

## Contexte

Suite à P1-t023 (Service BigQuery), créer les routes API Express pour exposer les données analytics.

**Objectif** : Routes `/api/analytics/*` propres, validées (Zod), avec auth et cache.

## Objectifs

- [ ] Routes `/api/analytics/seo`, `/conversions`, `/web-vitals`, `/domains`
- [ ] Validation Zod sur TOUS les query params
- [ ] Auth middleware (`x-user-id`) appliqué
- [ ] Error handling uniforme
- [ ] Tests d'intégration (Supertest)
- [ ] Documentation API

## Périmètre

**IN scope** :
- Routes API analytics uniquement
- Validation Zod complète
- Auth middleware
- Tests Supertest

**OUT scope** :
- Service BigQuery (fait dans t023)
- Frontend (t025)
- ETL (t028)

## Implémentation

### Structure

```
backend/src/
├── routes/
│   ├── index.ts                    # Ajouter analytics routes
│   └── analytics.routes.ts         # Routes /api/analytics/*
├── schemas/
│   └── analytics.schema.ts         # Zod schemas
├── middlewares/
│   ├── auth.middleware.ts          # Auth x-user-id
│   └── errorHandler.ts             # Already exists
└── ...
```

### Routes à créer

```
GET /api/analytics/seo
  ?domain=bordeaux-demenageur.fr
  &days=7
  → { success: true, data: [...], meta: {...} }

GET /api/analytics/conversions
  ?domain=...
  &days=30
  
GET /api/analytics/web-vitals
  ?domain=...
  &days=30

GET /api/analytics/domains
  ?days=7
  → Liste des 11 sites avec métriques
```

### Integration dans routes/index.ts

```typescript
// backend/src/routes/index.ts
import analyticsRoutes from './analytics.routes.js';

// Ajouter après les routes existantes
router.use('/api/analytics', analyticsRoutes);
```

## État d'avancement

### Checklist
- [ ] Routes `/api/analytics/seo`
- [ ] Routes `/api/analytics/conversions`
- [ ] Routes `/api/analytics/web-vitals`
- [ ] Routes `/api/analytics/domains`
- [ ] Schemas Zod complets
- [ ] Auth middleware
- [ ] Tests Supertest (>80% coverage)
- [ ] Documentation API

### Tests
- [ ] Tests routes sans auth → 401
- [ ] Tests validation Zod → 400
- [ ] Tests avec params valides → 200
- [ ] Tests error handling → 500

## Commits liés

_(à remplir lors de l'implémentation)_

---

**Status** : ⏳ En attente
**Dépend de** : P1-t023 (Service BigQuery)
**Prérequis pour** : P1-t025, P1-t027

