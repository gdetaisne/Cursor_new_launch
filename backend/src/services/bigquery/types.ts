/**
 * Types TypeScript pour le service BigQuery Analytics
 * 
 * Tables BigQuery attendues :
 * - gsc_daily_aggregated : données Google Search Console
 * - ga4_events : événements Google Analytics 4
 * - web_vitals : Core Web Vitals (CLS, LCP, FID, INP)
 */

// ============================================================================
// GSC (Google Search Console)
// ============================================================================

export interface GSCDailyMetrics {
  date: string; // Format: YYYY-MM-DD
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  position: number; // Position moyenne
}

export interface GSCPageMetrics extends GSCDailyMetrics {
  page: string; // URL de la page
}

export interface GSCQueryMetrics extends GSCDailyMetrics {
  query: string; // Requête de recherche
}

export interface GSCDeviceMetrics extends GSCDailyMetrics {
  device: 'DESKTOP' | 'MOBILE' | 'TABLET';
}

export interface GSCCountryMetrics extends GSCDailyMetrics {
  country: string; // Code pays (FR, US, etc.)
}

// ============================================================================
// GA4 (Google Analytics 4)
// ============================================================================

export interface GA4Event {
  event_timestamp: string; // ISO 8601
  event_name: string;
  user_pseudo_id: string;
  session_id?: string;
  page_location?: string;
  page_referrer?: string;
  geo_country?: string;
  device_category?: 'desktop' | 'mobile' | 'tablet';
  traffic_source?: string;
  event_params?: Record<string, any>;
}

export interface GA4PageViews {
  page_location: string;
  page_title?: string;
  views: number;
  unique_users: number;
  avg_engagement_time: number; // en secondes
  bounce_rate: number; // 0-1
}

export interface GA4TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  sessions: number;
  users: number;
  conversions: number;
}

export interface GA4DailyMetrics {
  date: string; // Format: YYYY-MM-DD
  users: number;
  sessions: number;
  page_views: number;
  avg_session_duration: number; // en secondes
  bounce_rate: number; // 0-1
}

// ============================================================================
// Web Vitals
// ============================================================================

export interface WebVitalMetric {
  date: string; // Format: YYYY-MM-DD
  page_url: string;
  metric_name: 'CLS' | 'LCP' | 'FID' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  device_type?: 'desktop' | 'mobile' | 'tablet';
}

export interface WebVitalsSummary {
  metric_name: 'CLS' | 'LCP' | 'FID' | 'INP' | 'FCP' | 'TTFB';
  p75: number; // 75th percentile
  good_percentage: number; // % de mesures "good"
  needs_improvement_percentage: number;
  poor_percentage: number;
  sample_count: number;
}

// ============================================================================
// Filtres & Paramètres de requête
// ============================================================================

export interface DateRangeFilter {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
}

export interface PaginationParams {
  limit?: number; // Default: 100
  offset?: number; // Default: 0
}

export interface GSCFilters extends DateRangeFilter, PaginationParams {
  device?: 'DESKTOP' | 'MOBILE' | 'TABLET';
  country?: string;
  page?: string;
  query?: string;
}

export interface GA4Filters extends DateRangeFilter, PaginationParams {
  event_name?: string;
  page_location?: string;
  device_category?: 'desktop' | 'mobile' | 'tablet';
  country?: string;
}

export interface WebVitalsFilters extends DateRangeFilter, PaginationParams {
  metric_name?: 'CLS' | 'LCP' | 'FID' | 'INP' | 'FCP' | 'TTFB';
  page_url?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// ============================================================================
// Réponses API
// ============================================================================

export interface BigQueryResponse<T> {
  data: T[];
  total: number;
  cached: boolean;
  query_duration_ms?: number;
}

export interface DashboardSummary {
  gsc: {
    total_clicks: number;
    total_impressions: number;
    avg_ctr: number;
    avg_position: number;
    clicks_change_pct: number; // vs période précédente
    impressions_change_pct: number;
  };
  ga4: {
    total_users: number;
    total_sessions: number;
    total_page_views: number;
    avg_session_duration: number;
    bounce_rate: number;
    users_change_pct: number; // vs période précédente
  };
  web_vitals: {
    cls_p75: number;
    lcp_p75: number;
    fid_p75: number;
    inp_p75: number;
    overall_score: 'good' | 'needs-improvement' | 'poor';
  };
}

// ============================================================================
// Configuration & Erreurs
// ============================================================================

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  credentials: any; // Google Service Account JSON
  maxRetries?: number; // Default: 3
  timeoutMs?: number; // Default: 30000
}

export class BigQueryServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BigQueryServiceError';
  }
}

