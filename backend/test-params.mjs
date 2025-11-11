/**
 * Test du client BigQuery avec params comme le backend
 */

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

console.log('🧪 Test avec `params` dans options\n');

try {
  const credentials = JSON.parse(env.GCP_SA_KEY_JSON);
  const bigquery = new BigQuery({
    projectId: env.GCP_PROJECT_ID,
    credentials: credentials,
  });

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

  const params = {
    startDate: '2025-10-24',
    endDate: '2025-10-28',
    domain: 'devis-demenageur-nantes.fr',
    limit: 100,
  };

  console.log('📋 Params:', params);
  console.log('');

  // Test avec params dans options (comme le backend)
  const options = {
    query: sql,
    params: params,
    location: 'europe-west1',
    useLegacySql: false,
  };

  console.log('🚀 Exécution...\n');
  const [rows] = await bigquery.query(options);

  console.log(`✅ Succès ! Trouvé ${rows.length} ligne(s)\n`);

  if (rows.length > 0) {
    rows.forEach((row, i) => {
      console.log(`Ligne ${i + 1}:`);
      console.log(`  Date: ${row.date?.value}`);
      console.log(`  Clicks: ${row.clicks}`);
      console.log(`  Impressions: ${row.impressions}`);
      console.log(`  CTR: ${(row.ctr * 100).toFixed(2)}%`);
      console.log(`  Position: ${row.position?.toFixed(1)}`);
      console.log('');
    });
  }

} catch (error) {
  console.error('❌ Erreur:', error.message);
  if (error.errors) {
    error.errors.forEach(err => console.error(`  • ${err.message}`));
  }
  process.exit(1);
}

