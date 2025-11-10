# ETL Scripts pour BigQuery Analytics

Ce dossier contient les scripts ETL (Extract, Transform, Load) pour alimenter BigQuery avec les données Analytics.

## 📋 Architecture

```
backend/scripts/etl/
├── README.md                  # Ce fichier
├── shared/
│   ├── bigquery-client.ts     # Client BigQuery partagé
│   ├── error-handler.ts       # Gestion erreurs + retry
│   └── logger.ts              # Logger structuré
├── gsc/
│   ├── fetch-gsc-data.ts      # Récupération Google Search Console
│   └── transform-gsc.ts       # Transformation données GSC
├── ga4/
│   ├── fetch-ga4-data.ts      # Récupération Google Analytics 4
│   └── transform-ga4.ts       # Transformation données GA4
├── webvitals/
│   ├── fetch-webvitals.ts     # Récupération Core Web Vitals
│   └── transform-webvitals.ts # Transformation Web Vitals
└── run-all.ts                 # Script principal (tous les ETL)
```

## 🚀 Usage

### Exécuter tous les ETL

```bash
cd backend
pnpm tsx scripts/etl/run-all.ts
```

### Exécuter un ETL spécifique

```bash
# GSC uniquement
pnpm tsx scripts/etl/gsc/fetch-gsc-data.ts

# GA4 uniquement
pnpm tsx scripts/etl/ga4/fetch-ga4-data.ts

# Web Vitals uniquement
pnpm tsx scripts/etl/webvitals/fetch-webvitals.ts
```

### Configuration Cron (production)

Ajouter dans crontab ou scheduler cloud (ex: Cloud Scheduler sur GCP) :

```bash
# Exécuter tous les jours à 2h du matin
0 2 * * * cd /path/to/backend && pnpm tsx scripts/etl/run-all.ts >> /var/log/etl.log 2>&1
```

## ⚙️ Variables d'environnement requises

Les ETL utilisent les mêmes variables que le service BigQuery :

```bash
GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core
GCP_SA_KEY_JSON='{"type":"service_account",...}'

# API Keys pour sources de données
GSC_CLIENT_ID=your-gsc-client-id
GSC_CLIENT_SECRET=your-gsc-client-secret
GSC_REFRESH_TOKEN=your-gsc-refresh-token

GA4_PROPERTY_ID=your-ga4-property-id
GA4_CLIENT_EMAIL=your-ga4-service-account@...
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## 📊 Tables BigQuery

### 1. `gsc_daily_aggregated`

Données Google Search Console agrégées par jour.

**Schema** :
```sql
CREATE TABLE analytics_core.gsc_daily_aggregated (
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
);
```

### 2. `ga4_events`

Événements Google Analytics 4 bruts.

**Schema** :
```sql
CREATE TABLE analytics_core.ga4_events (
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
);
```

### 3. `web_vitals`

Core Web Vitals (CLS, LCP, FID, INP, FCP, TTFB).

**Schema** :
```sql
CREATE TABLE analytics_core.web_vitals (
  date DATE NOT NULL,
  page_url STRING,
  metric_name STRING,
  value FLOAT64,
  rating STRING,
  device_type STRING,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

## 🔄 Fonctionnalités ETL

### Retry automatique

Tous les ETL implémentent un retry exponentiel (3 tentatives max) :

```typescript
await retry(
  async () => await fetchData(),
  {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }
);
```

### Idempotence

Les scripts utilisent `MERGE` (UPSERT) au lieu de `INSERT` pour éviter les doublons si re-run :

```sql
MERGE INTO analytics_core.gsc_daily_aggregated AS target
USING (SELECT * FROM UNNEST(@rows)) AS source
ON target.date = source.date AND target.page = source.page
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...
```

### Logging structuré

Tous les logs sont structurés (JSON) pour faciliter le monitoring :

```typescript
logger.info('ETL started', { etl: 'gsc', date: '2025-01-01' });
logger.error('ETL failed', { etl: 'gsc', error: err.message });
```

## 📝 Monitoring & Alertes

### Logs ETL

Les logs sont écrits dans `/var/log/etl.log` (configurable via `LOG_FILE` env var).

### Table `etl_jobs_log` (optionnel)

Pour tracker l'historique des exécutions :

```sql
CREATE TABLE analytics_core.etl_jobs_log (
  job_id STRING NOT NULL,
  etl_name STRING,
  status STRING, -- RUNNING, SUCCESS, FAILED
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  rows_processed INT64,
  error_message STRING,
  PRIMARY KEY (job_id)
);
```

### Alertes Slack/Email (à implémenter)

En cas d'échec ETL, envoyer une alerte :

```typescript
if (status === 'FAILED') {
  await sendSlackAlert({
    channel: '#etl-alerts',
    message: `❌ ETL ${etlName} failed: ${error}`,
  });
}
```

## 🛠️ Développement

### Tester un ETL localement

```bash
# Dry run (ne pas insérer dans BigQuery)
DRY_RUN=true pnpm tsx scripts/etl/gsc/fetch-gsc-data.ts
```

### Backfill historique

Pour charger des données historiques (ex: 90 derniers jours) :

```bash
START_DATE=2024-10-01 END_DATE=2025-01-01 pnpm tsx scripts/etl/run-all.ts
```

## 📚 Ressources

- [Google Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Google Analytics 4 API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Core Web Vitals](https://web.dev/vitals/)
- [BigQuery Node.js Client](https://cloud.google.com/nodejs/docs/reference/bigquery/latest)

## ⚠️ TODO

- [ ] Implémenter fetch GSC data (API Search Console)
- [ ] Implémenter fetch GA4 data (API Analytics Data)
- [ ] Implémenter fetch Web Vitals (CrUX API ou custom collection)
- [ ] Créer schémas BigQuery (tables + indexes)
- [ ] Setup cron production
- [ ] Ajouter monitoring Sentry/Rollbar
- [ ] Implémenter alertes Slack
- [ ] Tests unitaires ETL (mocks API)

## 🔐 Sécurité

- **Ne jamais commit les credentials** (GCP_SA_KEY_JSON, API keys)
- Utiliser un service account GCP avec permissions minimales :
  - BigQuery Data Editor
  - BigQuery Job User
- Stocker les credentials dans un secret manager (ex: GCP Secret Manager, AWS Secrets Manager)

