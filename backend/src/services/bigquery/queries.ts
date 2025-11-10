/**
 * Queries SQL pour BigQuery Analytics
 * 
 * Organisation :
 * - GSC (Google Search Console)
 * - GA4 (Google Analytics 4)
 * - Web Vitals
 * 
 * Chaque query utilise des paramètres pour éviter l'injection SQL
 */

import type { GSCFilters, GA4Filters, WebVitalsFilters, DateRangeFilter } from './types.js';

// ============================================================================
// GSC Queries
// ============================================================================

export const gscQueries = {
  /**
   * Métriques GSC agrégées par jour
   */
  dailyMetrics: (filters: GSCFilters) => {
    const { startDate, endDate, limit = 100, offset = 0 } = filters;
    
    return `
      SELECT 
        date,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        AVG(position) as position
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_aggregated\`
      WHERE date BETWEEN @startDate AND @endDate
      GROUP BY date
      ORDER BY date DESC
      LIMIT @limit
      OFFSET @offset
    `;
  },

  /**
   * Top pages par clicks
   */
  topPages: (filters: GSCFilters) => {
    const { startDate, endDate, limit = 100, offset = 0, device, country } = filters;
    
    let whereClause = 'WHERE date BETWEEN @startDate AND @endDate';
    if (device) whereClause += ' AND device = @device';
    if (country) whereClause += ' AND country = @country';
    
    return `
      SELECT 
        page,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        AVG(position) as position
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_aggregated\`
      ${whereClause}
      GROUP BY page
      ORDER BY clicks DESC
      LIMIT @limit
      OFFSET @offset
    `;
  },

  /**
   * Top queries par impressions
   */
  topQueries: (filters: GSCFilters) => {
    const { startDate, endDate, limit = 100, offset = 0, device, country } = filters;
    
    let whereClause = 'WHERE date BETWEEN @startDate AND @endDate';
    if (device) whereClause += ' AND device = @device';
    if (country) whereClause += ' AND country = @country';
    
    return `
      SELECT 
        query,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        AVG(position) as position
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_aggregated\`
      ${whereClause}
      GROUP BY query
      ORDER BY impressions DESC
      LIMIT @limit
      OFFSET @offset
    `;
  },

  /**
   * Répartition par device
   */
  byDevice: (filters: DateRangeFilter) => {
    const { startDate, endDate } = filters;
    
    return `
      SELECT 
        device,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        AVG(position) as position
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_aggregated\`
      WHERE date BETWEEN @startDate AND @endDate
      GROUP BY device
      ORDER BY clicks DESC
    `;
  },

  /**
   * Répartition par pays
   */
  byCountry: (filters: DateRangeFilter & { limit?: number }) => {
    const { startDate, endDate, limit = 20 } = filters;
    
    return `
      SELECT 
        country,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        AVG(position) as position
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.gsc_daily_aggregated\`
      WHERE date BETWEEN @startDate AND @endDate
      GROUP BY country
      ORDER BY clicks DESC
      LIMIT @limit
    `;
  },
};

// ============================================================================
// GA4 Queries
// ============================================================================

export const ga4Queries = {
  /**
   * Métriques GA4 agrégées par jour
   */
  dailyMetrics: (filters: GA4Filters) => {
    const { startDate, endDate, limit = 100, offset = 0 } = filters;
    
    return `
      SELECT 
        DATE(TIMESTAMP_MICROS(event_timestamp)) as date,
        COUNT(DISTINCT user_pseudo_id) as users,
        COUNT(DISTINCT CONCAT(user_pseudo_id, session_id)) as sessions,
        COUNT(*) as page_views,
        AVG(engagement_time_msec) / 1000 as avg_session_duration
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.ga4_events\`
      WHERE DATE(TIMESTAMP_MICROS(event_timestamp)) BETWEEN @startDate AND @endDate
        AND event_name = 'page_view'
      GROUP BY date
      ORDER BY date DESC
      LIMIT @limit
      OFFSET @offset
    `;
  },

  /**
   * Top pages vues
   */
  topPages: (filters: GA4Filters) => {
    const { startDate, endDate, limit = 100, offset = 0 } = filters;
    
    return `
      SELECT 
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') as page_location,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') as page_title,
        COUNT(*) as views,
        COUNT(DISTINCT user_pseudo_id) as unique_users,
        AVG(engagement_time_msec) / 1000 as avg_engagement_time
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.ga4_events\`
      WHERE DATE(TIMESTAMP_MICROS(event_timestamp)) BETWEEN @startDate AND @endDate
        AND event_name = 'page_view'
      GROUP BY page_location, page_title
      ORDER BY views DESC
      LIMIT @limit
      OFFSET @offset
    `;
  },

  /**
   * Sources de trafic
   */
  trafficSources: (filters: GA4Filters) => {
    const { startDate, endDate, limit = 50 } = filters;
    
    return `
      SELECT 
        traffic_source.source as source,
        traffic_source.medium as medium,
        traffic_source.name as campaign,
        COUNT(DISTINCT CONCAT(user_pseudo_id, session_id)) as sessions,
        COUNT(DISTINCT user_pseudo_id) as users
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.ga4_events\`
      WHERE DATE(TIMESTAMP_MICROS(event_timestamp)) BETWEEN @startDate AND @endDate
      GROUP BY source, medium, campaign
      ORDER BY sessions DESC
      LIMIT @limit
    `;
  },

  /**
   * Événements par type
   */
  topEvents: (filters: GA4Filters) => {
    const { startDate, endDate, limit = 50 } = filters;
    
    return `
      SELECT 
        event_name,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_pseudo_id) as unique_users
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.ga4_events\`
      WHERE DATE(TIMESTAMP_MICROS(event_timestamp)) BETWEEN @startDate AND @endDate
      GROUP BY event_name
      ORDER BY event_count DESC
      LIMIT @limit
    `;
  },

  /**
   * Répartition par device
   */
  byDevice: (filters: DateRangeFilter) => {
    const { startDate, endDate } = filters;
    
    return `
      SELECT 
        device.category as device_category,
        COUNT(DISTINCT user_pseudo_id) as users,
        COUNT(DISTINCT CONCAT(user_pseudo_id, session_id)) as sessions
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.ga4_events\`
      WHERE DATE(TIMESTAMP_MICROS(event_timestamp)) BETWEEN @startDate AND @endDate
      GROUP BY device_category
      ORDER BY sessions DESC
    `;
  },
};

// ============================================================================
// Web Vitals Queries
// ============================================================================

export const webVitalsQueries = {
  /**
   * Summary des Core Web Vitals (p75 + distribution)
   */
  summary: (filters: WebVitalsFilters) => {
    const { startDate, endDate, metric_name } = filters;
    
    let whereClause = 'WHERE date BETWEEN @startDate AND @endDate';
    if (metric_name) whereClause += ' AND metric_name = @metric_name';
    
    return `
      SELECT 
        metric_name,
        APPROX_QUANTILES(value, 100)[OFFSET(75)] as p75,
        COUNTIF(rating = 'good') / COUNT(*) as good_percentage,
        COUNTIF(rating = 'needs-improvement') / COUNT(*) as needs_improvement_percentage,
        COUNTIF(rating = 'poor') / COUNT(*) as poor_percentage,
        COUNT(*) as sample_count
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.web_vitals\`
      ${whereClause}
      GROUP BY metric_name
      ORDER BY metric_name
    `;
  },

  /**
   * Évolution temporelle d'une métrique
   */
  timeSeries: (filters: WebVitalsFilters & { metric_name: string }) => {
    const { startDate, endDate, metric_name, device_type } = filters;
    
    let whereClause = `WHERE date BETWEEN @startDate AND @endDate AND metric_name = @metric_name`;
    if (device_type) whereClause += ' AND device_type = @device_type';
    
    return `
      SELECT 
        date,
        metric_name,
        APPROX_QUANTILES(value, 100)[OFFSET(75)] as p75,
        AVG(value) as avg_value,
        COUNT(*) as sample_count
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.web_vitals\`
      ${whereClause}
      GROUP BY date, metric_name
      ORDER BY date DESC
    `;
  },

  /**
   * Pires pages pour une métrique donnée
   */
  worstPages: (filters: WebVitalsFilters & { metric_name: string }) => {
    const { startDate, endDate, metric_name, limit = 50 } = filters;
    
    return `
      SELECT 
        page_url,
        metric_name,
        APPROX_QUANTILES(value, 100)[OFFSET(75)] as p75,
        AVG(value) as avg_value,
        COUNT(*) as sample_count,
        COUNTIF(rating = 'poor') / COUNT(*) as poor_percentage
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.web_vitals\`
      WHERE date BETWEEN @startDate AND @endDate
        AND metric_name = @metric_name
      GROUP BY page_url, metric_name
      HAVING sample_count > 10
      ORDER BY p75 DESC
      LIMIT @limit
    `;
  },

  /**
   * Répartition par device
   */
  byDevice: (filters: DateRangeFilter & { metric_name?: string }) => {
    const { startDate, endDate, metric_name } = filters;
    
    let whereClause = 'WHERE date BETWEEN @startDate AND @endDate';
    if (metric_name) whereClause += ' AND metric_name = @metric_name';
    
    return `
      SELECT 
        device_type,
        metric_name,
        APPROX_QUANTILES(value, 100)[OFFSET(75)] as p75,
        COUNT(*) as sample_count
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BQ_DATASET}.web_vitals\`
      ${whereClause}
      GROUP BY device_type, metric_name
      ORDER BY metric_name, device_type
    `;
  },
};

// ============================================================================
// Dashboard Summary (query multi-sources)
// ============================================================================

export const dashboardQueries = {
  /**
   * Summary complet pour le dashboard principal
   * (GSC + GA4 + Web Vitals)
   */
  summary: (filters: DateRangeFilter) => {
    const { startDate, endDate } = filters;
    
    // Cette query combine les 3 sources
    // Note: en production, on pourrait faire 3 queries parallèles pour plus de flexibilité
    return {
      gsc: gscQueries.dailyMetrics({ startDate, endDate, limit: 1000 }),
      ga4: ga4Queries.dailyMetrics({ startDate, endDate, limit: 1000 }),
      webVitals: webVitalsQueries.summary({ startDate, endDate }),
    };
  },
};

