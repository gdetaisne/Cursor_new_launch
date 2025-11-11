# 🚀 Quick Start - Dashboard Websites

## Lancer en local (après pause)

### 1. Backend

```bash
cd /Users/guillaumestehelin/Back_Office/backend
pnpm dev
```

### 2. Frontend

```bash
cd /Users/guillaumestehelin/Back_Office/frontend
pnpm dev
```

### 3. Accéder

- Frontend : http://localhost:5000/admin/websites
- Backend : http://localhost:4000/health

---

## Activer BigQuery (optionnel)

### Ajouter dans `backend/.env`

```bash
GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core
GCP_SA_KEY_JSON='<contenu de /Users/guillaumestehelin/Keys/moverz-dashboard-gcp.txt>'
```

Puis relancer `pnpm dev`.

---

## Créer tables BigQuery

```sql
-- Table 1: GSC
CREATE TABLE `moverz-dashboard.analytics_core.gsc_daily_aggregated` (
  date DATE NOT NULL,
  page STRING,
  query STRING,
  device STRING,
  country STRING,
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  position FLOAT64,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY page, device;

-- Table 2: GA4
CREATE TABLE `moverz-dashboard.analytics_core.ga4_events` (
  event_timestamp TIMESTAMP NOT NULL,
  event_name STRING,
  user_pseudo_id STRING,
  session_id STRING,
  page_location STRING,
  page_referrer STRING,
  geo_country STRING,
  device_category STRING,
  traffic_source STRUCT<source STRING, medium STRING, campaign STRING>,
  event_params ARRAY<STRUCT<key STRING, value STRUCT<string_value STRING, int_value INT64, float_value FLOAT64>>>,
  engagement_time_msec INT64,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY event_name, user_pseudo_id;

-- Table 3: Web Vitals
CREATE TABLE `moverz-dashboard.analytics_core.web_vitals` (
  date DATE NOT NULL,
  page_url STRING,
  metric_name STRING,
  value FLOAT64,
  rating STRING,
  device_type STRING,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY metric_name, rating;
```

---

## Tester API

```bash
curl "http://localhost:4000/api/analytics/dashboard?startDate=2025-01-01&endDate=2025-01-10"
```

---

## TODO Prochain

1. **Ajouter variables ENV BigQuery** (voir ci-dessus)
2. **Créer tables BigQuery** (SQL ci-dessus)
3. **Implémenter ETL** (8-12h) :
   - `backend/scripts/etl/gsc/fetch-gsc-data.ts`
   - `backend/scripts/etl/ga4/fetch-ga4-data.ts`
   - `backend/scripts/etl/webvitals/fetch-webvitals.ts`

---

## Documentation complète

Voir `.cursor/sessions/SESSION-2025-11-10-websites-dashboard.md`



