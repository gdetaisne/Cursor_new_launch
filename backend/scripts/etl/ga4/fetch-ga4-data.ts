/**
 * Placeholder pour ETL Google Analytics 4
 * 
 * TODO:
 * - Implémenter fetch depuis Google Analytics Data API
 * - Transformer les données
 * - Upserter dans BigQuery (table ga4_events)
 */

import { logger } from '../shared/logger.js';
import { retry, ETLError } from '../shared/error-handler.js';
import { upsertRows } from '../shared/bigquery-client.js';

interface ETLConfig {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export async function runGA4ETL(config: ETLConfig): Promise<void> {
  logger.info('Starting GA4 ETL', config);

  try {
    // 1. Extract
    logger.info('Extracting GA4 data from API...');
    const rawData = await retry(async () => {
      // TODO: Implémenter fetch depuis GA4 API
      // const ga4Client = initGA4Client();
      // return await ga4Client.runReport({ ... });
      throw new ETLError('GA4 API not implemented yet', 'ga4', 'extract');
    });

    // 2. Transform
    logger.info('Transforming GA4 data...');
    const transformedRows = transformGA4Data(rawData);

    // 3. Load
    if (config.dryRun) {
      logger.info('DRY RUN: Would insert rows', { count: transformedRows.length });
    } else {
      logger.info('Loading GA4 data into BigQuery...');
      await upsertRows('ga4_events', transformedRows, ['event_timestamp', 'user_pseudo_id']);
    }

    logger.info('GA4 ETL completed successfully');
  } catch (error: any) {
    logger.error('GA4 ETL failed', { error: error.message });
    throw error;
  }
}

function transformGA4Data(rawData: any): any[] {
  // TODO: Implémenter transformation
  return [];
}

