/**
 * Découvrir les dates et domaines disponibles
 */

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

console.log('🔍 Exploration de gsc_daily_metrics\n');

try {
  const credentials = JSON.parse(env.GCP_SA_KEY_JSON);
  const bigquery = new BigQuery({
    projectId: env.GCP_PROJECT_ID,
    credentials: credentials,
  });

  // 1. Domaines disponibles
  console.log('🌐 Domaines disponibles:');
  const domainsQuery = `
    SELECT DISTINCT domain, COUNT(*) as row_count
    FROM \`${env.GCP_PROJECT_ID}.${env.BQ_DATASET}.gsc_daily_metrics\`
    GROUP BY domain
    ORDER BY row_count DESC
    LIMIT 10
  `;
  
  const [domains] = await bigquery.query({
    query: domainsQuery,
    location: 'europe-west1',
  });
  
  domains.forEach(row => {
    console.log(`   • ${row.domain} (${row.row_count} lignes)`);
  });
  console.log('');

  // 2. Plage de dates
  console.log('📅 Plage de dates:');
  const datesQuery = `
    SELECT 
      MIN(date) as min_date,
      MAX(date) as max_date,
      COUNT(DISTINCT date) as days_count
    FROM \`${env.GCP_PROJECT_ID}.${env.BQ_DATASET}.gsc_daily_metrics\`
  `;
  
  const [dates] = await bigquery.query({
    query: datesQuery,
    location: 'europe-west1',
  });
  
  console.log(`   De: ${dates[0].min_date?.value}`);
  console.log(`   À:  ${dates[0].max_date?.value}`);
  console.log(`   Nombre de jours: ${dates[0].days_count}`);
  console.log('');

  // 3. Exemple avec le premier domaine et dates récentes
  if (domains.length > 0) {
    const testDomain = domains[0].domain;
    const maxDate = dates[0].max_date?.value;
    
    console.log(`📊 Test avec ${testDomain} (date max: ${maxDate}):`);
    
    const testQuery = `
      SELECT 
        date,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions
      FROM \`${env.GCP_PROJECT_ID}.${env.BQ_DATASET}.gsc_daily_metrics\`
      WHERE domain = @domain
        AND date >= DATE_SUB(@maxDate, INTERVAL 7 DAY)
      GROUP BY date
      ORDER BY date DESC
      LIMIT 5
    `;
    
    const [testRows] = await bigquery.query({
      query: testQuery,
      location: 'europe-west1',
      params: {
        domain: testDomain,
        maxDate: maxDate,
      },
    });
    
    if (testRows.length > 0) {
      console.log('   ✅ Données trouvées:');
      testRows.forEach(row => {
        console.log(`      ${row.date?.value}: ${row.clicks} clicks, ${row.impressions} impressions`);
      });
    } else {
      console.log('   ⚠️ Aucune donnée récente');
    }
  }

  console.log('\n💡 Pour tester l\'API, utilise un domaine et des dates qui existent !');

} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

