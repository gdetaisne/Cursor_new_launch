# 🔧 Configuration BigQuery - Guide Complet

## 📋 Prérequis

1. **Compte Google Cloud** avec projet existant
2. **Accès au fichier credentials** : `/Users/guillaumestehelin/Keys/moverz-dashboard-gcp.txt`
3. **Projet GCP** : `moverz-dashboard`
4. **Dataset BigQuery** : `analytics_core`

---

## 🎯 Étape 1 : Vérifier les Credentials

Tu as déjà le fichier de service account :
```bash
/Users/guillaumestehelin/Keys/moverz-dashboard-gcp.txt
```

**Contenu attendu** (format JSON) :
```json
{
  "type": "service_account",
  "project_id": "moverz-dashboard",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "etl-runner@moverz-dashboard.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

---

## 🔐 Étape 2 : Ajouter les Variables d'Environnement

### Ouvre ton fichier `backend/.env`

```bash
nano /Users/guillaumestehelin/Back_Office/backend/.env
```

### Ajoute ces lignes à la fin

```bash
# ============================================================================
# BigQuery Configuration
# ============================================================================

GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core

# Copier TOUT le contenu du fichier moverz-dashboard-gcp.txt sur UNE SEULE LIGNE
# Format : GCP_SA_KEY_JSON='{"type":"service_account","project_id":"...", ...}'
GCP_SA_KEY_JSON='<COPIER_ICI_LE_CONTENU_DU_FICHIER_JSON>'
```

### ⚠️ IMPORTANT pour `GCP_SA_KEY_JSON`

**Méthode 1 : Copie manuelle**
1. Ouvre `/Users/guillaumestehelin/Keys/moverz-dashboard-gcp.txt`
2. Copie TOUT le contenu JSON
3. Supprime les sauts de ligne (tout sur une seule ligne)
4. Mets entre guillemets simples `'...'`

**Méthode 2 : Avec commande**
```bash
# Affiche le JSON sans sauts de ligne
cat /Users/guillaumestehelin/Keys/moverz-dashboard-gcp.txt | tr -d '\n'

# Copie la sortie et ajoute dans .env :
GCP_SA_KEY_JSON='<coller_ici>'
```

---

## 🗄️ Étape 3 : Créer les Tables BigQuery

### 3 tables nécessaires

#### Table 1 : `gsc_daily_aggregated` (Google Search Console)

```sql
CREATE TABLE `moverz-dashboard.analytics_core.gsc_daily_aggregated` (
  date DATE NOT NULL,
  page STRING,
  query STRING,
  device STRING,          -- DESKTOP, MOBILE, TABLET
  country STRING,         -- Code ISO 2 lettres (FR, US, etc.)
  clicks INT64 NOT NULL,
  impressions INT64 NOT NULL,
  ctr FLOAT64 NOT NULL,
  position FLOAT64 NOT NULL,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY page, device
OPTIONS(
  description="Données quotidiennes Google Search Console agrégées par page, requête, device et pays"
);
```

#### Table 2 : `ga4_events` (Google Analytics 4)

```sql
CREATE TABLE `moverz-dashboard.analytics_core.ga4_events` (
  event_timestamp TIMESTAMP NOT NULL,
  event_name STRING NOT NULL,
  user_pseudo_id STRING,
  session_id STRING,
  page_location STRING,
  page_referrer STRING,
  geo_country STRING,
  device_category STRING, -- desktop, mobile, tablet
  traffic_source STRUCT<
    source STRING,
    medium STRING,
    campaign STRING
  >,
  event_params ARRAY<STRUCT<
    key STRING,
    value STRUCT<
      string_value STRING,
      int_value INT64,
      float_value FLOAT64
    >
  >>,
  engagement_time_msec INT64,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY event_name, user_pseudo_id
OPTIONS(
  description="Événements bruts Google Analytics 4"
);
```

#### Table 3 : `web_vitals` (Core Web Vitals)

```sql
CREATE TABLE `moverz-dashboard.analytics_core.web_vitals` (
  date DATE NOT NULL,
  page_url STRING NOT NULL,
  metric_name STRING NOT NULL,     -- CLS, LCP, FID, INP, FCP, TTFB
  value FLOAT64 NOT NULL,
  rating STRING,                    -- good, needs-improvement, poor
  device_type STRING,               -- desktop, mobile, tablet
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY metric_name, rating
OPTIONS(
  description="Core Web Vitals quotidiens par page et métrique"
);
```

### Comment exécuter ces requêtes SQL ?

**Option A : Console BigQuery Web**
1. Va sur https://console.cloud.google.com/bigquery
2. Sélectionne le projet `moverz-dashboard`
3. Clique sur "Composer une nouvelle requête"
4. Colle la requête SQL (une par une)
5. Clique sur "Exécuter"

**Option B : CLI gcloud (si installé)**
```bash
bq query --use_legacy_sql=false < create_table_gsc.sql
bq query --use_legacy_sql=false < create_table_ga4.sql
bq query --use_legacy_sql=false < create_table_web_vitals.sql
```

---

## ✅ Étape 4 : Tester la Configuration

### 1. Redémarre le backend

```bash
# Dans le terminal backend (Ctrl+C pour arrêter)
cd /Users/guillaumestehelin/Back_Office/backend
PORT=4000 pnpm dev
```

**Tu devrais voir** :
```
✅ BigQuery service initialized
```

Au lieu de :
```
⚠️ BigQuery service not initialized (missing env variables)
```

### 2. Teste l'API

```bash
curl http://localhost:4000/api/analytics/dashboard?startDate=2025-01-01&endDate=2025-11-11
```

**Réponse attendue** (si tables vides) :
```json
{
  "gsc": {
    "total_clicks": 0,
    "total_impressions": 0,
    "avg_ctr": 0,
    "avg_position": 0,
    "clicks_change_pct": 0,
    "impressions_change_pct": 0
  },
  "ga4": {
    "total_users": 0,
    "total_sessions": 0,
    "total_page_views": 0,
    "avg_session_duration": 0,
    "bounce_rate": 0,
    "users_change_pct": 0
  },
  "web_vitals": {
    "cls_p75": 0,
    "lcp_p75": 0,
    "fid_p75": 0,
    "inp_p75": 0,
    "overall_score": "poor"
  }
}
```

### 3. Teste le Dashboard

Ouvre http://localhost:5000/admin/websites

**Tu devrais voir** :
- Les KPIs affichés (avec des 0 si tables vides)
- Plus de loading infini
- Pas d'erreurs en console

---

## 🧪 Étape 5 : Insérer des Données de Test (Optionnel)

Si tu veux voir des chiffres sans attendre l'ETL :

### Test GSC

```sql
INSERT INTO `moverz-dashboard.analytics_core.gsc_daily_aggregated`
(date, page, query, device, country, clicks, impressions, ctr, position, inserted_at)
VALUES
  ('2025-11-01', 'https://example.com/', 'test query', 'DESKTOP', 'FR', 100, 1000, 0.1, 5.2, CURRENT_TIMESTAMP()),
  ('2025-11-02', 'https://example.com/', 'test query', 'MOBILE', 'FR', 120, 1100, 0.109, 4.8, CURRENT_TIMESTAMP()),
  ('2025-11-03', 'https://example.com/page2', 'autre query', 'DESKTOP', 'US', 80, 800, 0.1, 6.5, CURRENT_TIMESTAMP());
```

### Test GA4

```sql
INSERT INTO `moverz-dashboard.analytics_core.ga4_events`
(event_timestamp, event_name, user_pseudo_id, session_id, page_location, geo_country, device_category, traffic_source, engagement_time_msec, inserted_at)
VALUES
  (TIMESTAMP('2025-11-01 10:00:00'), 'page_view', 'user123', 'session1', 'https://example.com/', 'FR', 'desktop', STRUCT('google' AS source, 'organic' AS medium, NULL AS campaign), 5000, CURRENT_TIMESTAMP()),
  (TIMESTAMP('2025-11-01 10:05:00'), 'form_start', 'user123', 'session1', 'https://example.com/contact', 'FR', 'desktop', STRUCT('google' AS source, 'organic' AS medium, NULL AS campaign), 2000, CURRENT_TIMESTAMP());
```

### Test Web Vitals

```sql
INSERT INTO `moverz-dashboard.analytics_core.web_vitals`
(date, page_url, metric_name, value, rating, device_type, inserted_at)
VALUES
  ('2025-11-01', 'https://example.com/', 'CLS', 0.08, 'good', 'desktop', CURRENT_TIMESTAMP()),
  ('2025-11-01', 'https://example.com/', 'LCP', 2300, 'good', 'desktop', CURRENT_TIMESTAMP()),
  ('2025-11-01', 'https://example.com/', 'INP', 180, 'good', 'desktop', CURRENT_TIMESTAMP()),
  ('2025-11-01', 'https://example.com/', 'FID', 50, 'good', 'desktop', CURRENT_TIMESTAMP());
```

Après insertion, recharge http://localhost:5000/admin/websites et tu devrais voir les chiffres ! 🎉

---

## 🚨 Dépannage

### Erreur : "Missing BigQuery env variables"

→ Vérifie que les 3 variables sont bien dans `backend/.env` :
```bash
grep -E 'GCP_PROJECT_ID|BQ_DATASET|GCP_SA_KEY_JSON' backend/.env
```

### Erreur : "Invalid GCP_SA_KEY_JSON format"

→ Le JSON est mal formaté. Vérifie :
- Guillemets simples autour : `GCP_SA_KEY_JSON='...'`
- Tout sur une seule ligne
- Pas d'espaces ou sauts de ligne

### Erreur : "Table not found"

→ Les tables n'existent pas dans BigQuery. Retourne à l'Étape 3.

### Erreur : "Permission denied"

→ Le service account n'a pas les droits. Vérifie dans GCP Console :
- IAM & Admin → Service Accounts
- `etl-runner@moverz-dashboard.iam.gserviceaccount.com` doit avoir :
  - `BigQuery Data Editor`
  - `BigQuery Job User`

---

## 📊 Prochaines Étapes (Après Configuration)

1. **Implémenter les ETL** pour importer les vraies données :
   - `backend/scripts/etl/gsc/fetch-gsc-data.ts` → Google Search Console API
   - `backend/scripts/etl/ga4/fetch-ga4-data.ts` → Google Analytics Data API
   - `backend/scripts/etl/webvitals/fetch-webvitals.ts` → PageSpeed Insights API / CrUX

2. **Scheduler les ETL** avec cron ou GitHub Actions (daily à 2h du matin)

3. **Monitoring** : Ajouter Sentry pour alertes si ETL fail

---

## 📚 Ressources

- **BigQuery Console** : https://console.cloud.google.com/bigquery?project=moverz-dashboard
- **Service Accounts** : https://console.cloud.google.com/iam-admin/serviceaccounts?project=moverz-dashboard
- **Documentation BigQuery Node.js** : https://cloud.google.com/nodejs/docs/reference/bigquery/latest

---

**✅ Configuration terminée !**


