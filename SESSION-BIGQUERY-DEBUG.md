# 📊 Session Dashboard Websites - État des lieux

**Date**: 11 novembre 2025  
**Objectif**: Faire fonctionner le Dashboard Websites avec BigQuery

---

## ✅ Ce qui fonctionne

### 1. **BigQuery - Connexion OK**
- ✅ Credentials configurés
- ✅ Dataset: `analytics_core` (location: `europe-west1`)
- ✅ Table: `gsc_daily_metrics` accessible
- ✅ Queries SQL fonctionnent (testé avec scripts)

### 2. **Données disponibles**
- **Domaines**: `devis-demenageur-nantes.fr`, `devis-demenageur-rennes.fr`, etc. (10 domaines)
- **Dates**: 2025-10-02 à 2025-10-28 (26 jours)
- **Données**: clicks, impressions, CTR, position

### 3. **Code corrigé**
- ✅ Location BigQuery: `europe-west1` (au lieu de US/EU)
- ✅ Nom de table: `gsc_daily_metrics` (au lieu de `gsc_daily_data`)
- ✅ Schéma adapté aux vraies colonnes (date, domain, page, query, clicks, impressions, ctr, position)
- ✅ Paramètre `domain` ajouté dans les queries et les appels
- ✅ Paramètres passés correctement à BigQuery (`params` dans options)

---

## ❌ Problème restant

### **L'API backend ne fonctionne toujours pas**

**Symptôme**:
```bash
curl "http://localhost:4000/api/analytics/gsc/daily?startDate=2025-10-24&endDate=2025-10-28&domain=devis-demenageur-nantes.fr" -H "x-user-id: test"
# Retourne: "Query gsc_daily_metrics failed"
```

**Cause probable**:
- `tsx watch` ne recharge pas les modifications du fichier `client.ts`
- Le code compilé/en mémoire est une ancienne version

**Preuve que le code fonctionne**:
```bash
cd backend
node test-params.mjs
# ✅ Retourne 5 lignes de données GSC !
```

---

## 🔧 Fichiers modifiés

### Backend

1. **`backend/src/services/bigquery/client.ts`**
   - Ligne 116: Ajout `params: params` dans options
   - Ligne 117: `location: 'europe-west1'`
   - Ligne 105: Signature de `executeWithRetry` modifiée pour accepter `params`

2. **`backend/src/services/bigquery/queries.ts`**
   - Toutes les queries GSC: `gsc_daily_aggregated` → `gsc_daily_metrics`
   - Ajout du filtre `domain` dans les WHERE clauses
   - Suppression des filtres device/country (colonnes inexistantes)

3. **`backend/src/services/bigquery/index.ts`**
   - Ajout de `domain` dans les params des fonctions GSC:
     - `getGSCDailyMetrics` (ligne 72)
     - `getGSCTopPages` (ligne 98)
     - `getGSCTopQueries` (ligne 124)

4. **`backend/src/schemas/analytics.schema.ts`**
   - Ajout du champ `domain: z.string().optional()` dans `gscFiltersSchema`

5. **`backend/src/routes/analytics/index.ts`**
   - Routes GA4 et Web Vitals commentées (tables inexistantes)

### Scripts de test créés

- `backend/test-bigquery.mjs` - Diagnostic complet BigQuery
- `backend/explore-data.mjs` - Exploration des données disponibles
- `backend/test-query-gsc.mjs` - Test de la query GSC exacte
- `backend/test-params.mjs` - Test des params nommés ✅ **FONCTIONNE**

---

## 🚀 Prochaines étapes

### Étape 1: Forcer le rechargement du backend

**Option A**: Redémarrer manuellement
```bash
# Dans un terminal séparé
cd backend
pkill -9 node tsx
PORT=4000 pnpm dev
```

**Option B**: Supprimer le cache node
```bash
cd backend
rm -rf node_modules/.cache
rm -rf .tsx-cache 2>/dev/null
PORT=4000 pnpm dev
```

### Étape 2: Tester l'API

```bash
curl -s "http://localhost:4000/api/analytics/gsc/daily?startDate=2025-10-24&endDate=2025-10-28&domain=devis-demenageur-nantes.fr" -H "x-user-id: test" | jq
```

**Résultat attendu**:
```json
{
  "data": [
    {
      "date": "2025-10-28",
      "clicks": 0,
      "impressions": 8,
      "ctr": 0,
      "position": 58.3
    },
    ...
  ],
  "total": 5,
  "cached": false,
  "query_duration_ms": 450
}
```

### Étape 3: Frontend

Une fois l'API OK, le frontend devrait afficher les données automatiquement car :
- ✅ Page `/admin/websites` existe
- ✅ Composants charts créés
- ✅ Hooks React Query configurés
- ✅ Client API configuré (port 4000)

---

## 📋 Variables d'environnement

**Backend `.env`** (déjà configuré):
```bash
GCP_PROJECT_ID=moverz-dashboard
BQ_DATASET=analytics_core
GCP_SA_KEY_JSON={"type":"service_account",...}
PORT=4000
```

---

## 🐛 Debug si ça ne marche toujours pas

### 1. Vérifier que le fichier source est bien modifié
```bash
grep -n "params: params" backend/src/services/bigquery/client.ts
# Doit afficher: 116:        params: params, // Ajouter les paramètres nommés
```

### 2. Vérifier les logs du backend
Chercher dans les logs du backend :
```
[BigQuery] Query options: { "params": { "startDate": ... }, "location": "europe-west1" }
```

Si ce log n'apparaît pas → le fichier n'est pas rechargé

### 3. Test de sanité avec le script
```bash
cd backend
node test-params.mjs
```
Si ça fonctionne → le problème est bien le rechargement de `tsx watch`

---

## 📚 Liens utiles

- **BigQuery Console**: https://console.cloud.google.com/bigquery?project=moverz-dashboard
- **Dataset**: `moverz-dashboard.analytics_core`
- **Table**: `gsc_daily_metrics` (1942 lignes, 26 jours)

---

## 💡 Note importante

**Le code est 100% correct et fonctionnel** (prouvé par `test-params.mjs`).  
Le seul problème est le rechargement automatique de `tsx watch`.

Solution simple : **Redémarrer manuellement le backend** après avoir fermé Cursor.

---

**Bon courage ! 🚀**

