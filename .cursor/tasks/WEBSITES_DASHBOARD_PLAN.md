# Websites Dashboard - Plan d'intégration

## 📋 Tasks créées (P1-t023 à P1-t028)

### ✅ P1-t016 — Analyse & Refonte (TERMINÉ)
- Analyse complète code moverz_dashboard
- Identification problèmes (1016 lignes bigquery.ts, 486 lignes page.tsx)
- Architecture cible définie
- **Durée** : 30 minutes

---

### ⏳ P1-t023 — Service BigQuery Backend
**Fichier** : `P1-t023-websites-dashboard-bigquery-service.md`  
**Durée** : 3-4h  
**Objectif** : Service BigQuery propre avec client singleton, queries typées, cache, retry logic

**Livrables** :
- `backend/src/services/bigquery/client.ts` (singleton)
- `backend/src/services/bigquery/cache.ts` (5 min TTL)
- `backend/src/services/bigquery/queries/seo.queries.ts`
- `backend/src/services/bigquery/queries/conversions.queries.ts`
- `backend/src/services/bigquery/queries/webvitals.queries.ts`
- Tests unitaires (Jest)

---

### ⏳ P1-t024 — Routes API Analytics
**Fichier** : `P1-t024-websites-dashboard-api-routes.md`  
**Durée** : 2-3h  
**Objectif** : Routes `/api/analytics/*` avec validation Zod + auth

**Livrables** :
- `backend/src/routes/analytics.routes.ts`
- `backend/src/schemas/analytics.schema.ts` (Zod)
- `backend/src/middlewares/auth.middleware.ts` (x-user-id)
- Tests Supertest

---

### ⏳ P1-t025 — Pages Frontend
**Fichier** : `P1-t025-websites-dashboard-frontend-pages.md`  
**Durée** : 5-6h  
**Objectif** : Pages React dashboard + détails sites

**Livrables** :
- `frontend/src/pages/websites/WebsitesDashboard.tsx`
- `frontend/src/pages/websites/SiteDetail.tsx`
- Onglets SEO/Conversions/Web Vitals
- Navigation dans Sidebar (icon Globe)

---

### ⏳ P1-t026 — Composants Charts
**Fichier** : `P1-t026-websites-dashboard-charts-components.md`  
**Durée** : 3h  
**Objectif** : Composants Recharts réutilisables

**Livrables** :
- `SEOChart.tsx` (line chart)
- `ConversionsFunnelChart.tsx` (funnel)
- `WebVitalsGauge.tsx` (gauges)
- `ComparisonChart.tsx` (multi-sites)

---

### ⏳ P1-t027 — API Client & Hooks
**Fichier** : `P1-t027-websites-dashboard-api-client-hooks.md`  
**Durée** : 2h  
**Objectif** : API client Axios + React Query hooks

**Livrables** :
- `frontend/src/lib/api/analytics.ts` (Axios)
- `frontend/src/lib/hooks/useAnalytics.ts` (TanStack Query)
- Cache automatique (5 min)

---

### ⏳ P1-t028 — Migration ETL
**Fichier** : `P1-t028-websites-dashboard-etl-migration.md`  
**Durée** : 2-3h  
**Objectif** : Scripts ETL propres + idempotence

**Livrables** :
- `etl/gsc/sync-gsc-bigquery.ts` (MERGE idempotent)
- `etl/ga4/sync-ga4-bigquery.ts`
- Cron GitHub Actions
- Logging Winston

---

## 🎯 Ordre d'exécution

```
Sprint 1 - Backend (5-7h)
├── t023: Service BigQuery (3-4h)        ← START HERE
└── t024: Routes API (2-3h)

Sprint 2 - Frontend (10-11h)
├── t027: API Client & Hooks (2h)
├── t026: Composants Charts (3h)
└── t025: Pages Frontend (5-6h)

Sprint 3 - ETL (2-3h)
└── t028: Migration ETL (2-3h)
```

**Total** : 17-21h

---

## 🚨 Conflit numérotation résolu

**Problème** : t017 était déjà utilisé (P0-t017-systeme-emails.md)  
**Solution** : Tasks websites dashboard renommées t023-t028 ✅

---

**Prochaine étape** : Commencer **P1-t023** (Service BigQuery Backend)

