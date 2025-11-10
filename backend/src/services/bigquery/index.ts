/**
 * Service BigQuery principal
 * Exporte les fonctions publiques pour interagir avec BigQuery
 */

export * from './types.js';
export * from './client.js';
export * from './cache.js';
export * from './queries.js';

import { bigQueryClient } from './client.js';
import { gscQueries, ga4Queries, webVitalsQueries, dashboardQueries } from './queries.js';
import type {
  GSCFilters,
  GA4Filters,
  WebVitalsFilters,
  DateRangeFilter,
  BigQueryResponse,
  GSCDailyMetrics,
  GSCPageMetrics,
  GSCQueryMetrics,
  GSCDeviceMetrics,
  GSCCountryMetrics,
  GA4DailyMetrics,
  GA4PageViews,
  GA4TrafficSource,
  GA4Event,
  WebVitalsSummary,
  WebVitalMetric,
  DashboardSummary,
} from './types.js';

// ============================================================================
// Initialisation
// ============================================================================

/**
 * Initialise le service BigQuery avec les credentials
 * À appeler au démarrage de l'application
 */
export function initializeBigQueryService(): void {
  if (!process.env.GCP_PROJECT_ID || !process.env.BQ_DATASET || !process.env.GCP_SA_KEY_JSON) {
    throw new Error('Missing BigQuery env variables: GCP_PROJECT_ID, BQ_DATASET, GCP_SA_KEY_JSON');
  }

  try {
    const credentials = JSON.parse(process.env.GCP_SA_KEY_JSON);
    bigQueryClient.initialize({
      projectId: process.env.GCP_PROJECT_ID,
      datasetId: process.env.BQ_DATASET,
      credentials,
    });
  } catch (error) {
    console.error('[BigQuery Service] Failed to parse GCP_SA_KEY_JSON:', error);
    throw new Error('Invalid GCP_SA_KEY_JSON format');
  }
}

// ============================================================================
// GSC Methods
// ============================================================================

export async function getGSCDailyMetrics(
  filters: GSCFilters
): Promise<BigQueryResponse<GSCDailyMetrics>> {
  const sql = gscQueries.dailyMetrics(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
  };

  const result = await bigQueryClient.query<GSCDailyMetrics>(
    'gsc_daily_metrics',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGSCTopPages(
  filters: GSCFilters
): Promise<BigQueryResponse<GSCPageMetrics>> {
  const sql = gscQueries.topPages(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
    ...(filters.device && { device: filters.device }),
    ...(filters.country && { country: filters.country }),
  };

  const result = await bigQueryClient.query<GSCPageMetrics>(
    'gsc_top_pages',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGSCTopQueries(
  filters: GSCFilters
): Promise<BigQueryResponse<GSCQueryMetrics>> {
  const sql = gscQueries.topQueries(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
    ...(filters.device && { device: filters.device }),
    ...(filters.country && { country: filters.country }),
  };

  const result = await bigQueryClient.query<GSCQueryMetrics>(
    'gsc_top_queries',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGSCByDevice(
  filters: DateRangeFilter
): Promise<BigQueryResponse<GSCDeviceMetrics>> {
  const sql = gscQueries.byDevice(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  const result = await bigQueryClient.query<GSCDeviceMetrics>(
    'gsc_by_device',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGSCByCountry(
  filters: DateRangeFilter & { limit?: number }
): Promise<BigQueryResponse<GSCCountryMetrics>> {
  const sql = gscQueries.byCountry(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 20,
  };

  const result = await bigQueryClient.query<GSCCountryMetrics>(
    'gsc_by_country',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

// ============================================================================
// GA4 Methods
// ============================================================================

export async function getGA4DailyMetrics(
  filters: GA4Filters
): Promise<BigQueryResponse<GA4DailyMetrics>> {
  const sql = ga4Queries.dailyMetrics(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
  };

  const result = await bigQueryClient.query<GA4DailyMetrics>(
    'ga4_daily_metrics',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGA4TopPages(
  filters: GA4Filters
): Promise<BigQueryResponse<GA4PageViews>> {
  const sql = ga4Queries.topPages(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
  };

  const result = await bigQueryClient.query<GA4PageViews>(
    'ga4_top_pages',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getGA4TrafficSources(
  filters: GA4Filters
): Promise<BigQueryResponse<GA4TrafficSource>> {
  const sql = ga4Queries.trafficSources(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: filters.limit ?? 50,
  };

  const result = await bigQueryClient.query<GA4TrafficSource>(
    'ga4_traffic_sources',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

// ============================================================================
// Web Vitals Methods
// ============================================================================

export async function getWebVitalsSummary(
  filters: WebVitalsFilters
): Promise<BigQueryResponse<WebVitalsSummary>> {
  const sql = webVitalsQueries.summary(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    ...(filters.metric_name && { metric_name: filters.metric_name }),
  };

  const result = await bigQueryClient.query<WebVitalsSummary>(
    'web_vitals_summary',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getWebVitalsTimeSeries(
  filters: WebVitalsFilters & { metric_name: string }
): Promise<BigQueryResponse<WebVitalMetric>> {
  const sql = webVitalsQueries.timeSeries(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    metric_name: filters.metric_name,
    ...(filters.device_type && { device_type: filters.device_type }),
  };

  const result = await bigQueryClient.query<WebVitalMetric>(
    'web_vitals_timeseries',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

export async function getWebVitalsWorstPages(
  filters: WebVitalsFilters & { metric_name: string }
): Promise<BigQueryResponse<WebVitalMetric>> {
  const sql = webVitalsQueries.worstPages(filters);
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    metric_name: filters.metric_name,
    limit: filters.limit ?? 50,
  };

  const result = await bigQueryClient.query<WebVitalMetric>(
    'web_vitals_worst_pages',
    sql,
    params
  );

  return {
    data: result.data,
    total: result.data.length,
    cached: result.cached,
    query_duration_ms: result.duration,
  };
}

// ============================================================================
// Dashboard Summary (multi-sources)
// ============================================================================

/**
 * Récupère toutes les données pour le dashboard principal
 * Exécute 3 queries en parallèle
 */
export async function getDashboardSummary(
  filters: DateRangeFilter
): Promise<DashboardSummary> {
  const [gscData, ga4Data, webVitalsData] = await Promise.all([
    getGSCDailyMetrics({ ...filters, limit: 1000 }),
    getGA4DailyMetrics({ ...filters, limit: 1000 }),
    getWebVitalsSummary(filters),
  ]);

  // Calculer les agrégats
  const gscMetrics = gscData.data;
  const ga4Metrics = ga4Data.data;
  const vitalsMetrics = webVitalsData.data;

  const totalClicks = gscMetrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalImpressions = gscMetrics.reduce((sum, m) => sum + m.impressions, 0);
  const avgCtr = totalClicks / totalImpressions || 0;
  const avgPosition = gscMetrics.reduce((sum, m) => sum + m.position, 0) / gscMetrics.length || 0;

  const totalUsers = ga4Metrics.reduce((sum, m) => sum + m.users, 0);
  const totalSessions = ga4Metrics.reduce((sum, m) => sum + m.sessions, 0);
  const totalPageViews = ga4Metrics.reduce((sum, m) => sum + m.page_views, 0);
  const avgSessionDuration = ga4Metrics.reduce((sum, m) => sum + m.avg_session_duration, 0) / ga4Metrics.length || 0;
  const avgBounceRate = ga4Metrics.reduce((sum, m) => sum + (m.bounce_rate || 0), 0) / ga4Metrics.length || 0;

  const clsMetric = vitalsMetrics.find(m => m.metric_name === 'CLS');
  const lcpMetric = vitalsMetrics.find(m => m.metric_name === 'LCP');
  const fidMetric = vitalsMetrics.find(m => m.metric_name === 'FID');
  const inpMetric = vitalsMetrics.find(m => m.metric_name === 'INP');

  // Score global Web Vitals (good si tous p75 < seuils)
  const isGood = 
    (clsMetric?.p75 ?? 1) < 0.1 &&
    (lcpMetric?.p75 ?? 5000) < 2500 &&
    (inpMetric?.p75 ?? 500) < 200;

  const overallScore = isGood ? 'good' : 
    ((clsMetric?.p75 ?? 1) > 0.25 || (lcpMetric?.p75 ?? 5000) > 4000 || (inpMetric?.p75 ?? 500) > 500)
      ? 'poor'
      : 'needs-improvement';

  return {
    gsc: {
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      avg_ctr: avgCtr,
      avg_position: avgPosition,
      clicks_change_pct: 0, // TODO: calculer vs période précédente
      impressions_change_pct: 0,
    },
    ga4: {
      total_users: totalUsers,
      total_sessions: totalSessions,
      total_page_views: totalPageViews,
      avg_session_duration: avgSessionDuration,
      bounce_rate: avgBounceRate,
      users_change_pct: 0, // TODO: calculer vs période précédente
    },
    web_vitals: {
      cls_p75: clsMetric?.p75 ?? 0,
      lcp_p75: lcpMetric?.p75 ?? 0,
      fid_p75: fidMetric?.p75 ?? 0,
      inp_p75: inpMetric?.p75 ?? 0,
      overall_score: overallScore,
    },
  };
}

