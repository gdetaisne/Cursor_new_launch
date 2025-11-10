/**
 * Types TypeScript pour le service Analytics (frontend)
 * Miroir des types backend
 */

// ============================================================================
// GSC (Google Search Console)
// ============================================================================

export interface GSCDailyMetrics {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCPageMetrics extends GSCDailyMetrics {
  page: string;
}

export interface GSCQueryMetrics extends GSCDailyMetrics {
  query: string;
}

export interface GSCDeviceMetrics extends GSCDailyMetrics {
  device: 'DESKTOP' | 'MOBILE' | 'TABLET';
}

export interface GSCCountryMetrics extends GSCDailyMetrics {
  country: string;
}

// ============================================================================
// GA4 (Google Analytics 4)
// ============================================================================

export interface GA4DailyMetrics {
  date: string;
  users: number;
  sessions: number;
  page_views: number;
  avg_session_duration: number;
  bounce_rate?: number;
}

export interface GA4PageViews {
  page_location: string;
  page_title?: string;
  views: number;
  unique_users: number;
  avg_engagement_time: number;
  bounce_rate?: number;
}

export interface GA4TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  sessions: number;
  users: number;
  conversions?: number;
}

// ============================================================================
// Web Vitals
// ============================================================================

export type WebVitalMetricName = 'CLS' | 'LCP' | 'FID' | 'INP' | 'FCP' | 'TTFB';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalsSummary {
  metric_name: WebVitalMetricName;
  p75: number;
  good_percentage: number;
  needs_improvement_percentage: number;
  poor_percentage: number;
  sample_count: number;
}

export interface WebVitalMetric {
  date: string;
  page_url?: string;
  metric_name: WebVitalMetricName;
  value: number;
  rating?: WebVitalRating;
  device_type?: 'desktop' | 'mobile' | 'tablet';
}

// ============================================================================
// Filtres
// ============================================================================

export interface DateRangeFilter {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
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
  metric_name?: WebVitalMetricName;
  page_url?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  rating?: WebVitalRating;
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
    clicks_change_pct: number;
    impressions_change_pct: number;
  };
  ga4: {
    total_users: number;
    total_sessions: number;
    total_page_views: number;
    avg_session_duration: number;
    bounce_rate: number;
    users_change_pct: number;
  };
  web_vitals: {
    cls_p75: number;
    lcp_p75: number;
    fid_p75: number;
    inp_p75: number;
    overall_score: WebVitalRating;
  };
}

