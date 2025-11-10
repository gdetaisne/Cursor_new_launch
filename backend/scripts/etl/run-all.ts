/**
 * Script principal : exécute tous les ETL en séquence
 * 
 * Usage:
 *   pnpm tsx scripts/etl/run-all.ts
 * 
 * Env vars:
 *   START_DATE: Date de début (YYYY-MM-DD) - default: yesterday
 *   END_DATE: Date de fin (YYYY-MM-DD) - default: today
 *   DRY_RUN: Si true, ne pas insérer dans BigQuery
 */

import { format, subDays } from 'date-fns';
import { logger } from './shared/logger.js';

// Note: Les imports suivants seront implémentés plus tard
// import { runGSCETL } from './gsc/fetch-gsc-data.js';
// import { runGA4ETL } from './ga4/fetch-ga4-data.js';
// import { runWebVitalsETL } from './webvitals/fetch-webvitals.js';

interface ETLConfig {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dryRun: boolean;
}

async function runAllETLs() {
  const config: ETLConfig = {
    startDate: process.env.START_DATE || format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    endDate: process.env.END_DATE || format(new Date(), 'yyyy-MM-dd'),
    dryRun: process.env.DRY_RUN === 'true',
  };

  logger.info('🚀 Starting ETL pipeline', config);

  const startTime = Date.now();
  const results: { etl: string; status: 'success' | 'failed'; duration: number; error?: string }[] = [];

  // ============================================================================
  // 1. Google Search Console ETL
  // ============================================================================
  try {
    logger.info('📊 Running GSC ETL...');
    const gscStart = Date.now();
    
    // TODO: Implémenter
    logger.warn('GSC ETL not implemented yet (placeholder)');
    // await runGSCETL(config);
    
    results.push({
      etl: 'gsc',
      status: 'success',
      duration: Date.now() - gscStart,
    });
  } catch (error: any) {
    logger.error('GSC ETL failed', { error: error.message });
    results.push({
      etl: 'gsc',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
    });
  }

  // ============================================================================
  // 2. Google Analytics 4 ETL
  // ============================================================================
  try {
    logger.info('📈 Running GA4 ETL...');
    const ga4Start = Date.now();
    
    // TODO: Implémenter
    logger.warn('GA4 ETL not implemented yet (placeholder)');
    // await runGA4ETL(config);
    
    results.push({
      etl: 'ga4',
      status: 'success',
      duration: Date.now() - ga4Start,
    });
  } catch (error: any) {
    logger.error('GA4 ETL failed', { error: error.message });
    results.push({
      etl: 'ga4',
      status: 'failed',
      duration: Date.now() - ga4Start,
      error: error.message,
    });
  }

  // ============================================================================
  // 3. Core Web Vitals ETL
  // ============================================================================
  try {
    logger.info('⚡ Running Web Vitals ETL...');
    const vitalsStart = Date.now();
    
    // TODO: Implémenter
    logger.warn('Web Vitals ETL not implemented yet (placeholder)');
    // await runWebVitalsETL(config);
    
    results.push({
      etl: 'web_vitals',
      status: 'success',
      duration: Date.now() - vitalsStart,
    });
  } catch (error: any) {
    logger.error('Web Vitals ETL failed', { error: error.message });
    results.push({
      etl: 'web_vitals',
      status: 'failed',
      duration: Date.now() - vitalsStart,
      error: error.message,
    });
  }

  // ============================================================================
  // Summary
  // ============================================================================
  const totalDuration = Date.now() - startTime;
  const successCount = results.filter((r) => r.status === 'success').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  logger.info('✅ ETL pipeline completed', {
    totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
    success: successCount,
    failed: failedCount,
    results,
  });

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Run
runAllETLs().catch((error) => {
  logger.error('Fatal error in ETL pipeline', { error: error.message });
  process.exit(1);
});

