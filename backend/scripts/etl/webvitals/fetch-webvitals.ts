/**
 * Placeholder pour ETL Core Web Vitals
 * 
 * TODO:
 * - Implémenter fetch depuis CrUX API (Chrome User Experience Report)
 * - OU récupérer depuis logs custom (si instrumentation RUM)
 * - Transformer les données
 * - Upserter dans BigQuery (table web_vitals)
 */

import { logger } from '../shared/logger.js';
import { retry, ETLError } from '../shared/error-handler.js';
import { upsertRows } from '../shared/bigquery-client.js';

interface ETLConfig {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export async function runWebVitalsETL(config: ETLConfig): Promise<void> {
  logger.info('Starting Web Vitals ETL', config);

  try {
    // 1. Extract
    logger.info('Extracting Web Vitals data from CrUX API...');
    const rawData = await retry(async () => {
      // TODO: Implémenter fetch depuis CrUX API
      // const cruxClient = initCrUXClient();
      // return await cruxClient.queryRecord({ ... });
      throw new ETLError('CrUX API not implemented yet', 'web_vitals', 'extract');
    });

    // 2. Transform
    logger.info('Transforming Web Vitals data...');
    const transformedRows = transformWebVitalsData(rawData);

    // 3. Load
    if (config.dryRun) {
      logger.info('DRY RUN: Would insert rows', { count: transformedRows.length });
    } else {
      logger.info('Loading Web Vitals data into BigQuery...');
      await upsertRows('web_vitals', transformedRows, ['date', 'page_url', 'metric_name']);
    }

    logger.info('Web Vitals ETL completed successfully');
  } catch (error: any) {
    logger.error('Web Vitals ETL failed', { error: error.message });
    throw error;
  }
}

function transformWebVitalsData(rawData: any): any[] {
  // TODO: Implémenter transformation
  return [];
}

