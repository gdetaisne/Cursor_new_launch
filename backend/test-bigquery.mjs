/**
 * Script de diagnostic BigQuery
 * Test la connexion et exécute une query simple
 */

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

// Charger les variables d'environnement depuis .env
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

process.env.GCP_PROJECT_ID = env.GCP_PROJECT_ID;
process.env.BQ_DATASET = env.BQ_DATASET;
process.env.GCP_SA_KEY_JSON = env.GCP_SA_KEY_JSON;

console.log('🔍 Diagnostic BigQuery\n');

// Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement:');
console.log('  GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID || '❌ MANQUANT');
console.log('  BQ_DATASET:', process.env.BQ_DATASET || '❌ MANQUANT');
console.log('  GCP_SA_KEY_JSON:', process.env.GCP_SA_KEY_JSON ? '✅ Présent' : '❌ MANQUANT');
console.log('');

if (!process.env.GCP_PROJECT_ID || !process.env.BQ_DATASET || !process.env.GCP_SA_KEY_JSON) {
  console.error('❌ Variables d\'environnement manquantes!');
  process.exit(1);
}

try {
  // Parser les credentials
  console.log('🔑 Parsing credentials...');
  const credentials = JSON.parse(process.env.GCP_SA_KEY_JSON);
  console.log('  ✅ Service Account Email:', credentials.client_email);
  console.log('  ✅ Project ID:', credentials.project_id);
  console.log('');

  // Initialiser BigQuery
  console.log('🔌 Connexion à BigQuery...');
  const bigquery = new BigQuery({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: credentials,
  });
  console.log('  ✅ Client BigQuery initialisé');
  console.log('');

  // Test 1: Lister les datasets
  console.log('📂 Test 1: Liste des datasets...');
  const [datasets] = await bigquery.getDatasets();
  console.log(`  ✅ Trouvé ${datasets.length} dataset(s):`);
  datasets.forEach(dataset => console.log(`    - ${dataset.id}`));
  console.log('');

  // Test 2: Lister les tables du dataset
  console.log(`📋 Test 2: Tables dans ${process.env.BQ_DATASET}...`);
  const dataset = bigquery.dataset(process.env.BQ_DATASET);
  const [tables] = await dataset.getTables();
  console.log(`  ✅ Trouvé ${tables.length} table(s):`);
  tables.forEach(table => console.log(`    - ${table.id}`));
  console.log('');

  // Test 3: Schéma de gsc_daily_metrics
  console.log('🔍 Test 3: Schéma de gsc_daily_metrics...');
  const gscTable = dataset.table('gsc_daily_metrics');
  const [metadata] = await gscTable.getMetadata();
  console.log('  ✅ Colonnes:');
  metadata.schema.fields.forEach(field => {
    console.log(`    - ${field.name} (${field.type})`);
  });
  console.log('');

  // Test 4: Query simple avec COUNT
  console.log('📊 Test 4: Comptage des lignes...');
  const countQuery = `
    SELECT 
      COUNT(*) as total_rows,
      MIN(date) as min_date,
      MAX(date) as max_date,
      COUNT(DISTINCT domain) as domains_count
    FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_metrics\`
  `;
  
  const [countJob] = await bigquery.createQueryJob({
    query: countQuery,
    location: 'EU', // Changé de US à EU
  });
  
  const [countRows] = await countJob.getQueryResults();
  console.log('  ✅ Résultats:');
  console.log(`    Total lignes: ${countRows[0].total_rows}`);
  console.log(`    Date min: ${countRows[0].min_date?.value}`);
  console.log(`    Date max: ${countRows[0].max_date?.value}`);
  console.log(`    Nombre de domaines: ${countRows[0].domains_count}`);
  console.log('');

  // Test 5: Liste des domaines
  console.log('🌐 Test 5: Liste des domaines disponibles...');
  const domainsQuery = `
    SELECT DISTINCT domain
    FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_metrics\`
    ORDER BY domain
    LIMIT 10
  `;
  
  const [domainsJob] = await bigquery.createQueryJob({
    query: domainsQuery,
    location: 'EU', // Changé de US à EU
  });
  
  const [domainRows] = await domainsJob.getQueryResults();
  console.log('  ✅ Domaines (max 10):');
  domainRows.forEach(row => console.log(`    - ${row.domain}`));
  console.log('');

  // Test 6: Query API réelle
  console.log('🎯 Test 6: Query API (comme le backend)...');
  const apiQuery = `
    SELECT 
      date,
      SUM(clicks) as clicks,
      SUM(impressions) as impressions,
      SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
      AVG(position) as position
    FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_metrics\`
    WHERE date BETWEEN @startDate AND @endDate
      AND domain = @domain
    GROUP BY date
    ORDER BY date DESC
    LIMIT @limit
  `;

  const [apiJob] = await bigquery.createQueryJob({
    query: apiQuery,
    location: 'EU', // Changé de US à EU
    params: {
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      domain: 'demenagerpascher.fr',
      limit: 10,
    },
  });

  const [apiRows] = await apiJob.getQueryResults();
  console.log('  ✅ Résultats API:');
  console.log(`    Trouvé ${apiRows.length} ligne(s)`);
  
  if (apiRows.length > 0) {
    console.log('    Exemple (première ligne):');
    console.log(`      Date: ${apiRows[0].date?.value}`);
    console.log(`      Clicks: ${apiRows[0].clicks}`);
    console.log(`      Impressions: ${apiRows[0].impressions}`);
    console.log(`      CTR: ${apiRows[0].ctr?.toFixed(4)}`);
    console.log(`      Position: ${apiRows[0].position?.toFixed(2)}`);
  } else {
    console.log('    ⚠️ Aucune donnée pour cette période/domaine');
  }
  console.log('');

  console.log('✅ TOUS LES TESTS RÉUSSIS! 🎉');
  console.log('');
  console.log('💡 Si l\'API backend échoue toujours, le problème vient probablement:');
  console.log('   1. De la configuration du client BigQuery dans le backend');
  console.log('   2. De la location (EU vs US) des queries');
  console.log('   3. Des paramètres passés à la query');

} catch (error) {
  console.error('');
  console.error('❌ ERREUR DÉTECTÉE:');
  console.error('');
  console.error('Message:', error.message);
  console.error('');
  
  if (error.errors && error.errors.length > 0) {
    console.error('Détails BigQuery:');
    error.errors.forEach(err => {
      console.error(`  - ${err.message}`);
      if (err.location) console.error(`    Location: ${err.location}`);
      if (err.reason) console.error(`    Reason: ${err.reason}`);
    });
  }
  
  console.error('');
  console.error('Stack:', error.stack);
  process.exit(1);
}

