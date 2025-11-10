# P1-t028 — Websites Dashboard : Migration ETL

**Priorité : P1**

## Contexte

Migrer et améliorer les scripts ETL depuis moverz_dashboard vers Back_Office.

## Objectifs

- [ ] Scripts ETL propres (GSC, GA4, Web Vitals)
- [ ] Idempotence (MERGE au lieu de INSERT)
- [ ] Retry logic + validation Zod
- [ ] Logging Winston structuré
- [ ] Cron GitHub Actions ou serveur
- [ ] Documentation complète

## Implémentation

### Structure

```
etl/
├── gsc/
│   ├── sync-gsc-bigquery.ts       # GSC → BigQuery (quotidien)
│   └── backfill-gsc.ts            # Backfill historique
├── ga4/
│   ├── sync-ga4-bigquery.ts       # GA4 → BigQuery (quotidien)
│   └── backfill-ga4.ts
├── web-vitals/
│   └── sync-webvitals-bigquery.ts
├── shared/
│   ├── bigquery-client.ts         # Réutiliser service backend
│   ├── logger.ts                  # Winston logger
│   ├── retry.ts                   # Retry logic
│   └── validation.ts              # Validation Zod
└── README.md
```

### Cron GitHub Actions

```yaml
# .github/workflows/etl-daily.yml
name: ETL Daily Sync

on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h AM (Europe/Paris)
  workflow_dispatch:      # Manual trigger

jobs:
  sync-gsc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run etl:gsc
        env:
          GCP_SA_KEY_JSON: ${{ secrets.GCP_SA_KEY_JSON }}
```

## État d'avancement

- [ ] Script GSC idempotent
- [ ] Script GA4 idempotent
- [ ] Script Web Vitals
- [ ] Validation Zod
- [ ] Logging Winston
- [ ] Cron GitHub Actions
- [ ] Documentation README
- [ ] Tests ETL

---

**Status** : ⏳ En attente
**Dépend de** : P1-t023 (Service BigQuery)

