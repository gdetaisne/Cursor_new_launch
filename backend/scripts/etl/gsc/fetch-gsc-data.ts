/**
 * Placeholder pour ETL Google Search Console
 * 
 * TODO:
 * - Implémenter fetch depuis Google Search Console API
 * - Transformer les données
 * - Upserter dans BigQuery (table gsc_daily_aggregated)
 */

import { logger } from '../shared/logger.js';
import { retry, ETLError } from '../shared/error-handler.js';
import { upsertRows } from '../shared/bigquery-client.js';

interface ETLConfig {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export async function runGSCETL(config: ETLConfig): Promise<void> {
  logger.info('Starting GSC ETL', config);

  try {
    // 1. Extract
    logger.info('Extracting GSC data from API...');
    const rawData = await retry(async () => {
      // TODO: Implémenter fetch depuis GSC API
      // const gscClient = initGSCClient();
      // return await gscClient.searchanalytics.query({ ... });
      throw new ETLError('GSC API not implemented yet', 'gsc', 'extract');
    });

    // 2. Transform
    logger.info('Transforming GSC data...');
    const transformedRows = transformGSCData(rawData);

    // 3. Load
    if (config.dryRun) {
      logger.info('DRY RUN: Would insert rows', { count: transformedRows.length });
    } else {
      logger.info('Loading GSC data into BigQuery...');
      await upsertRows('gsc_daily_aggregated', transformedRows, ['date', 'page', 'query']);
    }

    logger.info('GSC ETL completed successfully');
  } catch (error: any) {
    logger.error('GSC ETL failed', { error: error.message });
    throw error;
  }
}

function transformGSCData(rawData: any): any[] {
  // TODO: Implémenter transformation
  return [];
}

