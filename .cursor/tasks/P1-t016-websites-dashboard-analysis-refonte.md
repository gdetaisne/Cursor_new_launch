# P1-t016 — Analyse & Refonte Dashboard Websites

**Priorité : P1** (nice-to-have qui devient vite P0 pour monitoring business)

## Contexte

Le projet `moverz_dashboard` (https://github.com/gdetaisne/moverz_dashboard) existe et fonctionne mais souffre de problèmes architecturaux qui rendent son évolution difficile.

**Objectif** : Analyser l'existant en profondeur, identifier tous les problèmes, et refaire le dashboard proprement intégré dans Back_Office.

**Principe** : Zero dette technique dès le départ. Code propre, typé, testé, documenté.

## Objectifs

### Phase 1 : Analyse (cette task)
- [ ] Cloner et analyser le repo moverz_dashboard
- [ ] Identifier problèmes architecture
- [ ] Identifier problèmes qualité code
- [ ] Identifier bugs et edge cases
- [ ] Identifier manques (tests, docs, types)
- [ ] Documenter findings complets

### Phase 2 : Architecture cible
- [ ] Définir architecture propre (Backend + Frontend)
- [ ] Définir stack technique (libs à utiliser)
- [ ] Définir patterns (services, hooks, components)
- [ ] Créer schéma d'architecture
- [ ] Documenter décisions architecturales

### Phase 3 : Plan refonte
- [x] Décomposer en tasks atomiques (t023-t028) ✅
- [x] Définir ordre d'implémentation ✅
- [x] Estimer durées réalistes ✅
- [x] Identifier risques et dépendances ✅

## Périmètre

**IN scope** :
- Analyse complète code moverz_dashboard
- Identification de TOUS les problèmes
- Architecture cible détaillée
- Plan de refonte task par task
- Documentation exhaustive

**OUT scope** :
- Implémentation du code (sera fait dans t023-t028)
- Tests (seront créés dans chaque task d'implémentation)

## Analyse du dashboard existant

### 1. Structure actuelle (moverz_dashboard)

D'après le README GitHub :

```
moverz_dashboard/
├── agents/              # Agents IA (Phase 4 - pas prioritaire)
├── dashboard/           # Dashboard web (code à analyser)
├── db/                  # Schéma BigQuery
├── docs/                # Documentation
├── etl/                 # Scripts ETL (GSC, GA4)
├── scripts/             # Scripts setup/deploy
└── web/                 # App web (Next.js ?)
```

**Technologies identifiées** :
- BigQuery (Google Cloud)
- Google Search Console API
- Google Analytics 4 API
- PageSpeed Insights API
- OpenAI API (agents IA)
- Looker Studio (dashboards)
- CapRover (déploiement)

### 2. Variables ENV fournies

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
APP_MODE=dashboard
PORT=3000
GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core
BQ_LOCATION=europe-west1
GCP_SA_KEY_JSON={...}  # Service Account credentials
SITES_LIST=devis-demenageur-marseille.fr,...  # 11 sites
FETCH_DAYS=30
BQ_TABLE_NAME=gsc_daily_aggregated
TIMEZONE=Europe/Paris
GOOGLE_APPLICATION_CREDENTIALS=/app/sa-key.json
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
PSI_API_KEY=AIzaSy...  # PageSpeed Insights
```

### 3. Problèmes identifiés ✅ (analyse code complétée)

#### 🔴 Architecture & Code Quality (CONFIRMÉ)

**Analyse du code réel** :
1. ✅ **Couplage fort** : Page principale (`page.tsx`) = 486 lignes, mélange UI + logique + state + API calls
2. ✅ **Client BigQuery dans dashboard** : Fichier `lib/bigquery.ts` = 1016 lignes (!!), queries mélangées avec types
3. ✅ **Types TypeScript faibles** : Nombreux `any`, casting `as any`, `as unknown as`
4. ✅ **Validation Zod OK** : Présente dans `api-helpers.ts` et `lib/schemas/api` (POINT POSITIF)
5. ✅ **Duplication code** : Queries similaires répétées (ETL `fetch.ts` + dashboard `bigquery.ts`)
6. ✅ **Composants monolithiques** : `page.tsx` = 486 lignes, trop de responsabilités
7. ✅ **State local anarchique** : 13 useState dans `page.tsx` (showFullImpr, showFullClicks, loading, etlLoading, etc.)
8. ⚠️ **Error boundaries** : Gestion erreurs try/catch dans page, mais pas de boundary React

#### 🔴 Performance (CONFIRMÉ)

**Analyse du code réel** :
1. ✅ **Pas de cache** : API routes n'utilisent pas de cache (chaque requête = query BigQuery)
2. ⚠️ **Pagination limitée** : `rowLimit: 25000` dans ETL (peut être énorme), mais limitée à 100 pour pages/queries
3. ✅ **Pas de lazy loading** : Toutes données chargées au mount (`useEffect(() => { fetchData() }, [fetchData])`)
4. ⚠️ **Re-renders limités** : `useCallback` utilisé pour `fetchData`, pas de memoization sur components
5. ✅ **Queries non optimisées** : Pas de `LIMIT` dynamique, range dates non validé côté BigQuery

**Exemples concrets trouvés** :
```typescript
// dashboard/lib/bigquery.ts ligne 117-155
export async function getGlobalMetrics(days: number = 7): Promise<SiteMetrics[]> {
  const query = `
    WITH current_period AS (
      SELECT 
        domain as site,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        AVG(ctr) as ctr,
        AVG(position) as position
      FROM \`${BQ_PROJECT_ID}.${BQ_DATASET}.gsc_daily_aggregated\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)  // ❌ Injection SQL potentielle
      GROUP BY domain
    ),
    // ... 50 lignes de SQL complexe sans cache
  `
  
  const [rows] = await bigquery.query({ query })  // ❌ Pas de cache, pas de retry
  return rows as SiteMetrics[]
}
```

**Problème** : Si `days = 10000`, query BigQuery sur 27 ans → timeout + coût énorme

#### 🔴 Sécurité (CONFIRMÉ)

**Analyse du code réel** :
1. ✅ **Credentials en ENV** : `GCP_SA_KEY_JSON` passée en variable (risque si logs/erreurs)
   ```typescript
   // dashboard/lib/bigquery.ts ligne 31-38
   if (process.env.GCP_SA_KEY_JSON) {
     try {
       const credentials = JSON.parse(process.env.GCP_SA_KEY_JSON)  // ❌ Parse à chaque fois
       return { projectId, credentials }
     } catch (error) {
       logger.error('Failed to parse GCP_SA_KEY_JSON', error)  // ⚠️ Credentials en logs
     }
   }
   ```

2. ⚠️ **Auth limitée** : Dashboard Next.js (App Router) sans middleware auth visible
3. ⚠️ **Rate limiting** : Pas de rate limit sur API routes Next.js
4. ✅ **SQL injection mitigée** : Utilisation de paramètres BigQuery dans certaines queries, mais injection directe dans d'autres
   ```typescript
   // etl/gsc/fetch.ts ligne 64
   rowLimit: 25000,  // ❌ Pas configurable, fixé en dur
   ```

5. ✅ **Validation Zod côté API** : Présente dans `api-helpers.ts` (POINT POSITIF)

**Risques identifiés** :
- ❌ Credentials BigQuery en logs si erreur parsing
- ❌ Pas d'auth sur routes API → n'importe qui peut query BigQuery
- ❌ Pas de rate limit → risque abus/coûts BigQuery

#### 🔴 Monitoring & Observabilité (CONFIRMÉ)

**Analyse du code réel** :
1. ✅ **Logs basiques** : Logger custom dans `lib/logger.ts` (console.log enrichi)
   ```typescript
   // dashboard/lib/logger.ts
   export const logger = {
     debug: (msg: string, meta?: any) => console.debug('[DEBUG]', msg, meta),
     info: (msg: string, meta?: any) => console.info('[INFO]', msg, meta),
     warn: (msg: string, meta?: any) => console.warn('[WARN]', msg, meta),
     error: (msg: string, error?: any, meta?: any) => console.error('[ERROR]', msg, error, meta),
   }
   ```
   **Problème** : Console.log = pas structuré, pas persisté, pas queryable

2. ❌ **Pas de monitoring** : Aucun système d'alertes (Sentry, Rollbar, etc.)
3. ❌ **Pas de métriques** : Temps queries BigQuery non trackés (pas de mesure performance)
4. ⚠️ **ETL logs** : Logs basiques dans ETL mais pas de table `etl_jobs_log` utilisée
   ```typescript
   // etl/shared/bigquery-client.ts ligne 176-187
   export async function logETLJob(result: ETLJobResult): Promise<void> {
     await insertRows('etl_jobs_log', [{
       job_name: result.jobName,
       // ... métadonnées ETL
     }])
   }
   ```
   **Mais** : Fonction définie, jamais appelée dans `etl/gsc/fetch.ts` !

#### 🔴 Tests (CONFIRMÉ)

**Analyse du code réel** :
1. ❌ **Aucun fichier test trouvé** : Pas de `*.test.ts`, `*.spec.ts`, `__tests__/`
2. ❌ **Pas de CI/CD tests** : Pas de GitHub Actions pour tests
3. ❌ **Pas de type checking automatique** : `tsc --noEmit` probablement pas dans CI

**Structure package.json** :
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
    // ❌ Pas de "test" script
  },
  "devDependencies": {
    // ❌ Pas de Jest, Vitest, Testing Library
  }
}
```

#### 🔴 Documentation (CONFIRMÉ)

**Analyse du code réel** :
1. ⚠️ **README** : Présent mais incomplet (manque setup local détaillé)
2. ✅ **Docs markdown** : Nombreux docs (ARCHITECTURE.md, AUDIT-COMPLET.md, API-ROUTES.md)
   **Mais** : Trop de docs (30+ fichiers markdown), pas de hiérarchie claire
3. ❌ **Pas de docs API formelles** : Pas de Swagger/OpenAPI
4. ❌ **Pas de diagrams à jour** : Architecture floue malgré nombreux docs
5. ❌ **Pas de CHANGELOG** : Impossible de tracker évolutions

#### 🔴 ETL Scripts (CONFIRMÉ)

**Analyse du code réel** :
1. ✅ **Retry logic présente** : Fonction `retry()` dans `etl/shared/error-handler.ts`
   ```typescript
   // etl/gsc/fetch.ts ligne 142-145
   const data = await retry(
     () => fetchGSCData(site.domain, targetDate, targetDate),
     { maxRetries: 3 }  // ✅ POINT POSITIF
   )
   ```

2. ⚠️ **Idempotence** : Utilise `insertRows()` (pas de UPSERT), risque duplication si re-run
   ```typescript
   // etl/gsc/fetch.ts ligne 147-149
   await insertRows('gsc_global', data.global)  // ❌ Pas de check duplicates
   await insertRows('gsc_pages', data.pages)
   await insertRows('gsc_queries', data.queries)
   ```

3. ✅ **Validation données** : Aucune validation Zod avant insert BigQuery
4. ⚠️ **Backfill** : Script `scripts/backfill.ts` existe mais complexe (150+ lignes)

**Bugs identifiés** :
- ❌ Si ETL re-run sur même date → données dupliquées (pas de MERGE/UPSERT)
- ❌ Pas de validation types avant insert → risque erreurs BigQuery silencieuses
- ⚠️ Fonction `logETLJob()` définie mais jamais appelée

---

## 🎯 Résumé exécutif de l'analyse

### ✅ Points positifs (à conserver)

1. **Validation Zod** : API routes utilisent Zod pour valider query params (`validateQuery`)
2. **Error handling** : Try/catch présents, helper `handleApiError()` uniforme
3. **Retry logic ETL** : Fonction `retry()` avec exponential backoff (3 tentatives)
4. **Documentation fournie** : 30+ fichiers markdown (AUDIT, ARCHITECTURE, etc.)
5. **Types TypeScript** : Interfaces définies (GSCGlobalMetrics, SiteMetrics, etc.)
6. **Recharts déjà présent** : Charts fonctionnels (TimeSeriesChart, MultiSiteTimeSeriesChart)

### ❌ Problèmes critiques (bloquants refonte)

| Problème | Impact | Priorité |
|----------|--------|----------|
| **Fichier bigquery.ts 1016 lignes** | Maintenance impossible | 🔴 P0 |
| **Page.tsx 486 lignes** | Composant monolithique | 🔴 P0 |
| **Pas de cache BigQuery** | Coûts + latence élevés | 🔴 P0 |
| **13 useState dans page** | State management anarchique | 🔴 P0 |
| **Credentials en logs** | Risque sécurité | 🔴 P0 |
| **Pas d'auth sur API routes** | N'importe qui peut query BQ | 🟠 P1 |
| **ETL non idempotent** | Duplications données | 🟠 P1 |
| **Aucun test** | Régression garantie | 🟡 P2 |
| **Logs console.log** | Pas de monitoring | 🟡 P2 |

### 🛠️ Refonte nécessaire

**Ce qu'il faut REFAIRE** :
1. ✅ Service BigQuery backend (Express) : séparer client, queries, types
2. ✅ Routes API propres : validation Zod + cache + auth
3. ✅ Pages React atomiques : <200 lignes par component
4. ✅ State management : Zustand/TanStack Query (pas 13 useState)
5. ✅ ETL idempotent : MERGE au lieu de INSERT
6. ✅ Tests unitaires : Jest + coverage >80%
7. ✅ Monitoring : Winston + métriques BigQuery
8. ✅ Auth middleware : x-user-id sur toutes routes

**Ce qu'on peut GARDER** :
- ✅ Validation Zod (déjà propre)
- ✅ Retry logic ETL (fonctionne)
- ✅ Composants Recharts (à extraire et nettoyer)
- ✅ Types TypeScript interfaces (à migrer)

---

## 📊 Métriques du code existant

```
dashboard/
├── lib/bigquery.ts              1016 lignes  ❌ MONOLITHE
├── app/page.tsx                  486 lignes  ❌ TROP GROS
├── app/api/metrics/global/route.ts  65 lignes  ✅ OK
├── lib/api-helpers.ts            153 lignes  ✅ OK
└── components/
    ├── TimeSeriesChart.tsx       ~100 lignes  ✅ OK
    ├── MetricCard.tsx             ~50 lignes  ✅ OK
    └── GroupedDataTable.tsx      ~200 lignes  ⚠️ Limite

etl/
├── gsc/fetch.ts                  206 lignes  ⚠️ Limite
├── shared/bigquery-client.ts     309 lignes  ✅ OK
└── shared/error-handler.ts       ~80 lignes  ✅ OK
```

**Règle qualité Back_Office** :
- ✅ Fichiers < 200 lignes
- ✅ Functions < 50 lignes
- ✅ Components < 200 lignes

**Code moverz_dashboard** :
- ❌ 2 fichiers > 400 lignes (bigquery.ts, page.tsx)
- ⚠️ 3 fichiers > 200 lignes

---

## 🚀 Plan de refonte (mis à jour avec analyse)

### 4. Architecture cible (Back_Office)

#### Backend (Express + TypeScript + Prisma + BigQuery)

```
backend/
├── src/
│   ├── services/
│   │   ├── bigquery/
│   │   │   ├── client.ts           # Singleton BigQuery client
│   │   │   ├── queries/
│   │   │   │   ├── seo.queries.ts      # Queries GSC (typed)
│   │   │   │   ├── conversions.queries.ts  # Queries GA4
│   │   │   │   └── webvitals.queries.ts    # Queries Web Vitals
│   │   │   ├── cache.ts            # Cache layer (Redis/in-memory)
│   │   │   └── types.ts            # Types BigQuery (strict)
│   │   └── analytics/
│   │       ├── seo.service.ts      # Business logic SEO
│   │       ├── conversions.service.ts
│   │       └── webvitals.service.ts
│   ├── routes/
│   │   └── analytics.routes.ts     # Routes /api/analytics/*
│   ├── schemas/
│   │   └── analytics.schema.ts     # Zod schemas (validation)
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # Auth (x-user-id)
│   │   └── cache.middleware.ts     # Cache middleware (optionnel)
│   └── utils/
│       ├── bigquery-retry.ts       # Retry logic avec backoff
│       └── date-validation.ts      # Validation ranges dates
```

**Principes** :
- ✅ **Separation of Concerns** : Services ≠ Routes ≠ Queries
- ✅ **Single Responsibility** : Chaque fichier = 1 responsabilité
- ✅ **Dependency Injection** : Services injectés, pas de singletons sauvages
- ✅ **Type Safety** : TypeScript strict mode, pas de `any`
- ✅ **Error Handling** : Try/catch + ApiError custom
- ✅ **Validation** : Zod pour TOUTES les entrées utilisateur

#### Frontend (React + TypeScript + TanStack Query + Recharts)

```
frontend/
├── src/
│   ├── pages/
│   │   └── websites/
│   │       ├── WebsitesDashboard.tsx    # Page globale (11 sites)
│   │       ├── SiteDetail.tsx           # Page détail site
│   │       ├── SEOTab.tsx               # Onglet SEO
│   │       ├── ConversionsTab.tsx       # Onglet Conversions
│   │       └── WebVitalsTab.tsx         # Onglet Web Vitals
│   ├── components/
│   │   └── websites/
│   │       ├── charts/
│   │       │   ├── SEOChart.tsx         # Line chart impressions/clics
│   │       │   ├── ConversionsFunnelChart.tsx  # Funnel chart
│   │       │   ├── WebVitalsGauge.tsx   # Gauge LCP/CLS/INP
│   │       │   └── ComparisonChart.tsx  # Comparaison sites
│   │       ├── filters/
│   │       │   ├── SiteSelector.tsx     # Dropdown 11 sites
│   │       │   ├── DateRangePicker.tsx  # Sélecteur période
│   │       │   └── MetricSelector.tsx   # Sélecteur métrique
│   │       └── cards/
│   │           ├── MetricCard.tsx       # Card KPI réutilisable
│   │           └── SiteCard.tsx         # Card site (dashboard)
│   ├── lib/
│   │   ├── api/
│   │   │   └── analytics.ts             # API client Axios
│   │   ├── hooks/
│   │   │   ├── useAnalytics.ts          # React Query hooks
│   │   │   └── useWebsitesFilters.ts    # Hook filtres (Zustand)
│   │   └── types/
│   │       └── analytics.types.ts       # Types frontend (sync backend)
│   └── stores/
│       └── websitesStore.ts             # Zustand store (filtres, state)
```

**Principes** :
- ✅ **Atomic Components** : Composants petits, réutilisables
- ✅ **Composition** : Pas d'héritage, composition pure
- ✅ **Hooks Custom** : Logique métier dans hooks, pas dans components
- ✅ **TanStack Query** : Cache, refetch, invalidation automatiques
- ✅ **Zustand** : State global simple (filtres, preferences)
- ✅ **Error Boundaries** : Pas de crash app si erreur
- ✅ **Loading States** : Skeleton loaders partout
- ✅ **Responsive** : Mobile-first design

#### ETL Scripts (TypeScript + Node + Cron)

```
etl/
├── gsc/
│   ├── sync-gsc-bigquery.ts       # GSC → BigQuery (quotidien)
│   └── backfill-gsc.ts            # Backfill historique
├── ga4/
│   ├── sync-ga4-bigquery.ts       # GA4 → BigQuery (quotidien)
│   └── backfill-ga4.ts            # Backfill historique
├── leads/
│   └── sync-leads-bigquery.ts     # PostgreSQL → BigQuery (nouveau)
├── shared/
│   ├── bigquery-client.ts         # Client BigQuery réutilisé
│   ├── logger.ts                  # Winston logger structuré
│   ├── retry.ts                   # Retry logic avec exponential backoff
│   └── validation.ts              # Validation données avant insert
└── README.md                      # Doc complète ETL
```

**Principes** :
- ✅ **Idempotence** : Re-run script = pas de duplication
- ✅ **Retry Logic** : 3 tentatives avec exponential backoff
- ✅ **Validation** : Zod pour valider toutes les données
- ✅ **Logging** : Winston avec structured logs (JSON)
- ✅ **Error Handling** : Alertes Slack/Discord si échec
- ✅ **Monitoring** : Métriques temps d'exécution, lignes insérées
- ✅ **Backfill Support** : Scripts pour re-remplir historique

### 5. Stack technique détaillée

#### Backend
- **Runtime** : Node.js 20+
- **Framework** : Express 5
- **Database** : PostgreSQL (Neon.tech) + BigQuery (analytics)
- **ORM** : Prisma (PostgreSQL) + `@google-cloud/bigquery` (BigQuery)
- **Validation** : Zod
- **Auth** : Middleware custom (x-user-id) + JWT (future)
- **Cache** : Redis (optionnel, ou in-memory)
- **Logging** : Winston
- **Testing** : Jest + Supertest
- **Types** : TypeScript 5.6+ (strict mode)

#### Frontend
- **Framework** : React 19
- **Bundler** : Vite
- **Router** : React Router 7
- **Data Fetching** : TanStack Query (React Query)
- **State Management** : Zustand (global) + React Context (local)
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts (recommandé car déjà présent)
- **UI Components** : shadcn/ui (déjà présent)
- **Styling** : Tailwind CSS 3
- **Icons** : Lucide React
- **Date Handling** : date-fns
- **Types** : TypeScript 5.6+ (strict mode)

#### ETL
- **Runtime** : Node.js 20+
- **APIs** : 
  - `@googleapis/searchconsole` (GSC)
  - `@google-analytics/data` (GA4)
  - `@google-cloud/bigquery` (BigQuery)
- **Scheduling** : GitHub Actions (cron) ou crontab serveur
- **Logging** : Winston
- **Validation** : Zod
- **Retry** : `p-retry` ou custom

#### DevOps
- **CI/CD** : GitHub Actions
- **Deployment** : CapRover (existant) ou Docker
- **Monitoring** : Logs Winston → Loki/CloudWatch
- **Alerting** : Webhooks Slack/Discord

### 6. Routes API détaillées

#### GET /api/analytics/seo

**Description** : Métriques SEO (Google Search Console)

**Query Params** :
```typescript
{
  domain: string;           // Ex: "bordeaux-demenageur.fr"
  startDate: string;        // ISO date "2025-10-01"
  endDate: string;          // ISO date "2025-11-10"
  page?: number;            // Pagination (default: 1)
  limit?: number;           // Pagination (default: 30, max: 365)
}
```

**Response** :
```typescript
{
  domain: string;
  period: { startDate: string; endDate: string };
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;         // 0-100
    avgPosition: number;    // 1-100+
  };
  data: Array<{
    date: string;           // "2025-11-01"
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
  topQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
}
```

#### GET /api/analytics/conversions

**Description** : Métriques conversions (Google Analytics 4)

**Query Params** :
```typescript
{
  domain: string;
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
}
```

**Response** :
```typescript
{
  domain: string;
  period: { startDate: string; endDate: string };
  summary: {
    totalCTAClicks: number;
    totalFormStarts: number;
    totalFormSubmits: number;
    conversionRate: number;  // formSubmits / ctaClicks * 100
  };
  data: Array<{
    date: string;
    ctaClicks: number;
    formStarts: number;
    formSubmits: number;
    conversionRate: number;
  }>;
  funnel: {
    ctaClicks: number;
    formStarts: number;      // % of ctaClicks
    formSubmits: number;     // % of formStarts
  };
}
```

#### GET /api/analytics/web-vitals

**Description** : Métriques Web Vitals (Core Web Vitals)

**Query Params** :
```typescript
{
  domain: string;
  period?: string;  // "7d" | "30d" | "90d" (default: "30d")
}
```

**Response** :
```typescript
{
  domain: string;
  period: string;
  vitals: {
    lcp: {
      p75: number;         // ms (seuil: <2500ms = good)
      score: "good" | "needs-improvement" | "poor";
    };
    cls: {
      p75: number;         // score (seuil: <0.1 = good)
      score: "good" | "needs-improvement" | "poor";
    };
    inp: {
      p75: number;         // ms (seuil: <200ms = good)
      score: "good" | "needs-improvement" | "poor";
    };
  };
  history: Array<{
    date: string;
    lcp: number;
    cls: number;
    inp: number;
  }>;
}
```

#### GET /api/analytics/domains

**Description** : Vue globale des 11 sites

**Response** :
```typescript
{
  domains: Array<{
    domain: string;
    seo: {
      impressions: number;
      clicks: number;
      ctr: number;
      position: number;
    };
    conversions: {
      ctaClicks: number;
      formSubmits: number;
      conversionRate: number;
    };
    webVitals: {
      lcp: { score: string; value: number };
      cls: { score: string; value: number };
      inp: { score: string; value: number };
    };
  }>;
  period: { startDate: string; endDate: string };
}
```

#### GET /api/analytics/comparison

**Description** : Comparaison multi-sites

**Query Params** :
```typescript
{
  domains: string[];       // ["bordeaux-demenageur.fr", "devis-demenageur-lyon.fr"]
  metric: string;          // "impressions" | "clicks" | "ctr" | "conversions"
  period: string;          // "7d" | "30d" | "90d"
}
```

**Response** :
```typescript
{
  metric: string;
  period: string;
  comparison: Array<{
    date: string;
    values: Record<string, number>;  // { "bordeaux-demenageur.fr": 1234, ... }
  }>;
}
```

### 7. Validation Zod

#### Analytics Query Schema

```typescript
// backend/src/schemas/analytics.schema.ts
import { z } from 'zod';

const VALID_DOMAINS = [
  'devis-demenageur-marseille.fr',
  'devis-demenageur-strasbourg.fr',
  'devis-demenageur-lille.fr',
  'devis-demenageur-rennes.fr',
  'devis-demenageur-rouen.fr',
  'devis-demenageur-nice.fr',
  'devis-demenageur-nantes.fr',
  'devis-demenageur-toulousain.fr',
  'devis-demenageur-lyon.fr',
  'www.bordeaux-demenageur.fr',
  'devis-demenageur-montpellier.fr',
] as const;

export const analyticsQuerySchema = z.object({
  query: z.object({
    domain: z.enum(VALID_DOMAINS, {
      errorMap: () => ({ message: 'Domain must be one of the 11 Moverz sites' }),
    }),
    startDate: z.string().datetime().refine(
      (date) => {
        const d = new Date(date);
        const maxPast = new Date();
        maxPast.setFullYear(maxPast.getFullYear() - 2); // Max 2 ans passé
        return d >= maxPast && d <= new Date();
      },
      { message: 'startDate must be within last 2 years' }
    ),
    endDate: z.string().datetime().refine(
      (date) => {
        const d = new Date(date);
        return d <= new Date();
      },
      { message: 'endDate cannot be in the future' }
    ),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(365).default(30),
  }),
}).refine(
  (data) => {
    const start = new Date(data.query.startDate);
    const end = new Date(data.query.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 365;
  },
  { message: 'Date range must be between 0 and 365 days' }
);
```

### 8. Error Handling

#### Backend

```typescript
// backend/src/utils/bigquery-retry.ts
import pRetry from 'p-retry';

export async function retryBigQueryQuery<T>(
  queryFn: () => Promise<T>,
  options?: {
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
  }
): Promise<T> {
  return pRetry(queryFn, {
    retries: options?.retries ?? 3,
    minTimeout: options?.minTimeout ?? 1000,
    maxTimeout: options?.maxTimeout ?? 5000,
    onFailedAttempt: (error) => {
      console.warn(
        `BigQuery query failed (attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber}):`,
        error.message
      );
    },
  });
}
```

#### Frontend

```typescript
// frontend/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to Sentry/Rollbar
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9. Tests (à créer dans chaque task d'implémentation)

#### Backend Tests

```typescript
// backend/tests/services/bigquery/seo.service.test.ts
describe('SEO Service', () => {
  describe('getSEOMetrics', () => {
    it('should return SEO metrics for valid domain and date range', async () => {
      const result = await getSEOMetrics({
        domain: 'bordeaux-demenageur.fr',
        startDate: '2025-10-01',
        endDate: '2025-11-10',
      });

      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalImpressions');
      expect(result.summary.totalImpressions).toBeGreaterThan(0);
    });

    it('should throw error for invalid domain', async () => {
      await expect(
        getSEOMetrics({
          domain: 'invalid-domain.com',
          startDate: '2025-10-01',
          endDate: '2025-11-10',
        })
      ).rejects.toThrow('Invalid domain');
    });

    it('should throw error if date range > 365 days', async () => {
      await expect(
        getSEOMetrics({
          domain: 'bordeaux-demenageur.fr',
          startDate: '2023-01-01',
          endDate: '2025-11-10',
        })
      ).rejects.toThrow('Date range must be between 0 and 365 days');
    });
  });
});
```

#### Frontend Tests

```typescript
// frontend/tests/components/websites/SEOChart.test.tsx
import { render, screen } from '@testing-library/react';
import { SEOChart } from '@/components/websites/charts/SEOChart';

describe('SEOChart', () => {
  const mockData = [
    { date: '2025-11-01', impressions: 1000, clicks: 50 },
    { date: '2025-11-02', impressions: 1200, clicks: 60 },
  ];

  it('should render chart with data', () => {
    render(<SEOChart data={mockData} />);
    expect(screen.getByText(/impressions/i)).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<SEOChart data={[]} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
});
```

### 10. Documentation à créer

#### README Backend Analytics

```markdown
# Backend Analytics Service

## Overview
Service pour récupérer les données analytics depuis BigQuery (SEO, Conversions, Web Vitals).

## Setup
1. Installer dépendances : `pnpm install`
2. Configurer .env (voir ENV_SETUP.md)
3. Tester connexion BigQuery : `pnpm test:bigquery`

## Architecture
- `services/bigquery/client.ts` : Client BigQuery singleton
- `services/bigquery/queries/` : Queries typées par domaine (SEO, conversions, etc.)
- `services/analytics/` : Business logic (agrégations, calculs)
- `routes/analytics.routes.ts` : Endpoints API

## API Routes
Voir docs/ANALYTICS_API.md pour détails complets.

## Tests
`pnpm test` → lance tous les tests
`pnpm test:watch` → mode watch
`pnpm test:bigquery` → teste connexion BigQuery
```

#### README Frontend Websites

```markdown
# Frontend Websites Dashboard

## Overview
Dashboard pour suivre performance des 11 sites Moverz (SEO, conversions, web vitals).

## Structure
- `pages/websites/` : Pages principales
- `components/websites/` : Composants réutilisables (charts, filters, cards)
- `lib/hooks/useAnalytics.ts` : Hooks React Query
- `stores/websitesStore.ts` : State global (Zustand)

## Usage
```tsx
import { useSEOMetrics } from '@/lib/hooks/useAnalytics';

function SEOTab() {
  const { data, isLoading, error } = useSEOMetrics({
    domain: 'bordeaux-demenageur.fr',
    startDate: '2025-10-01',
    endDate: '2025-11-10',
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <SEOChart data={data.data} />;
}
```

## Tests
`pnpm test` → lance tests
`pnpm test:watch` → mode watch
```

## État d'avancement

### Phase 1 : Analyse ✅
- [x] Structure identifiée
- [x] Problèmes listés
- [x] Architecture cible définie

### Phase 2 : Architecture cible ✅
- [x] Stack technique détaillée
- [x] Routes API spécifiées
- [x] Validation Zod définie
- [x] Error handling défini
- [x] Tests définis

### Phase 3 : Plan refonte ⏳
- [x] Tasks définies (t017-t022)
- [ ] Ordre d'implémentation validé
- [ ] Durées estimées
- [ ] Risques identifiés

## Plan d'implémentation (Tasks suivantes)

### P1-t017 — Service BigQuery Backend (3-4h)
**Objectifs** :
- Client BigQuery avec retry logic
- Queries typées (SEO, conversions, web vitals)
- Cache in-memory (5 min TTL)
- Tests unitaires

**Livrables** :
- `backend/src/services/bigquery/client.ts`
- `backend/src/services/bigquery/queries/*.ts`
- `backend/src/services/bigquery/cache.ts`
- Tests Jest

### P1-t018 — Routes API Analytics (2-3h)
**Objectifs** :
- Routes `/api/analytics/*`
- Validation Zod complète
- Auth middleware
- Error handling uniforme

**Livrables** :
- `backend/src/routes/analytics.routes.ts`
- `backend/src/schemas/analytics.schema.ts`
- Tests Supertest

### P1-t019 — Pages Frontend Websites (5-6h)
**Objectifs** :
- Page dashboard (11 sites)
- Page détail site (tabs SEO/Conversions/Web Vitals)
- Navigation fluide
- Responsive design

**Livrables** :
- `frontend/src/pages/websites/*.tsx`
- Route `/admin/websites` dans AppRouter
- "Websites" dans Sidebar

### P1-t020 — Composants Charts (3h)
**Objectifs** :
- Charts Recharts réutilisables
- Design system cohérent
- Loading states + error states

**Livrables** :
- `frontend/src/components/websites/charts/*.tsx`
- Storybook (optionnel)

### P1-t021 — API Client & Hooks (2h)
**Objectifs** :
- API client Axios
- React Query hooks
- Cache + invalidation

**Livrables** :
- `frontend/src/lib/api/analytics.ts`
- `frontend/src/lib/hooks/useAnalytics.ts`

### P1-t022 — Migration ETL (2-3h)
**Objectifs** :
- Scripts ETL propres (GSC, GA4)
- Retry logic + validation
- Cron GitHub Actions

**Livrables** :
- `etl/gsc/sync-gsc-bigquery.ts`
- `etl/ga4/sync-ga4-bigquery.ts`
- `.github/workflows/etl-daily.yml`

## Commits liés

_(à remplir lors de l'implémentation)_

## Notes futures

### Améliorations possibles (Phase 2)

1. **Cache Redis** : Remplacer cache in-memory par Redis (si traffic élevé)
2. **Agents IA** : Intégrer agents OpenAI (suggestions SEO, optimisations)
3. **Alertes** : Notifications Slack si métriques baissent (ex: CTR -20%)
4. **Export CSV** : Bouton export données en CSV
5. **Comparaison multi-sites** : Page dédiée comparaison avancée
6. **Historique long terme** : Agrégations mensuelles/annuelles
7. **Permissions** : Qui peut voir quels sites (multi-tenant)

### Dettes techniques à éviter

- ❌ Pas de `any` en TypeScript
- ❌ Pas de duplication queries BigQuery
- ❌ Pas de logique métier dans components React
- ❌ Pas de credentials en dur
- ❌ Pas de queries BigQuery sans pagination
- ❌ Pas de routes API sans validation Zod
- ❌ Pas de composants > 200 lignes

### Checklist qualité (pour chaque task)

- [ ] TypeScript strict mode
- [ ] Tests unitaires > 80% coverage
- [ ] Zod validation sur toutes les entrées
- [ ] Error handling complet
- [ ] Logs structurés (Winston)
- [ ] Documentation README à jour
- [ ] Pas de warnings ESLint/TypeScript
- [ ] Composants < 200 lignes
- [ ] Functions < 50 lignes
- [ ] Pas de code dupliqué

---

**Dernière mise à jour** : 2025-11-10  
**Auteur** : Claude (Cursor AI)  
**Status** : ✅ Analyse terminée, prêt pour implémentation (t017-t022)

