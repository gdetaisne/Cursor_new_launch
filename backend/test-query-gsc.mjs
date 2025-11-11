/**
 * Test direct de la query BigQuery problématique
 */

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

// Charger .env
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

console.log('🧪 Test query GSC daily metrics\n');

try {
  const credentials = JSON.parse(env.GCP_SA_KEY_JSON);
  const bigquery = new BigQuery({
    projectId: env.GCP_PROJECT_ID,
    credentials: credentials,
  });

  console.log('📋 Paramètres:');
  console.log('  Project:', env.GCP_PROJECT_ID);
  console.log('  Dataset:', env.BQ_DATASET);
  console.log('  Location: europe-west1');
  console.log('');

  // Query exacte du backend
  const sql = `
    SELECT 
      date,
      SUM(clicks) as clicks,
      SUM(impressions) as impressions,
      SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
      AVG(position) as position
    FROM \`${env.GCP_PROJECT_ID}.${env.BQ_DATASET}.gsc_daily_metrics\`
    WHERE date BETWEEN @startDate AND @endDate
      AND domain = @domain
    GROUP BY date
    ORDER BY date DESC
    LIMIT @limit
  `;

  console.log('🔍 Query SQL:');
  console.log(sql);
  console.log('');

  console.log('⚙️ Exécution avec paramètres:');
  console.log('  startDate: 2024-01-01');
  console.log('  endDate: 2024-01-07');
  console.log('  domain: demenagerpascher.fr');
  console.log('  limit: 100');
  console.log('');

  const options = {
    query: sql,
    location: 'europe-west1',
    params: {
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      domain: 'demenagerpascher.fr',
      limit: 100,
    },
  };

  console.log('🚀 Envoi de la requête...\n');
  
  const [rows] = await bigquery.query(options);

  console.log('✅ SUCCÈS !');
  console.log(`   Trouvé ${rows.length} ligne(s)\n`);

  if (rows.length > 0) {
    console.log('📊 Premiers résultats:');
    rows.slice(0, 3).forEach((row, i) => {
      console.log(`\n   Ligne ${i + 1}:`);
      console.log(`     Date: ${row.date?.value || row.date}`);
      console.log(`     Clicks: ${row.clicks}`);
      console.log(`     Impressions: ${row.impressions}`);
      console.log(`     CTR: ${(row.ctr * 100).toFixed(2)}%`);
      console.log(`     Position: ${row.position?.toFixed(1)}`);
    });
  } else {
    console.log('⚠️  Aucune donnée pour cette période/domaine');
    console.log('');
    console.log('💡 Vérifie:');
    console.log('   1. Les dates dans la table');
    console.log('   2. Le nom exact du domaine');
  }

  console.log('\n✅ Le problème ne vient PAS de BigQuery !');
  console.log('   → Vérifier le code backend (params, types, etc.)');

} catch (error) {
  console.error('\n❌ ERREUR BigQuery:\n');
  console.error('Message:', error.message);
  console.error('');
  
  if (error.errors && error.errors.length > 0) {
    console.error('Détails:');
    error.errors.forEach(err => {
      console.error(`  • ${err.message}`);
      if (err.location) console.error(`    Location: ${err.location}`);
      if (err.reason) console.error(`    Reason: ${err.reason}`);
    });
    console.error('');
  }

  if (error.stack) {
    console.error('Stack (première partie):');
    console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  }

  process.exit(1);
}

