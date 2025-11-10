/**
 * Client API pour le service Analytics
 * Utilise axios depuis lib/api.ts
 */

import { api } from './api';
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
  WebVitalsSummary,
  WebVitalMetric,
  DashboardSummary,
} from '../types/analytics';

// ============================================================================
// GSC API Calls
// ============================================================================

export const analyticsApi = {
  gsc: {
    getDailyMetrics: async (filters: GSCFilters): Promise<BigQueryResponse<GSCDailyMetrics>> => {
      const { data } = await api.get('/analytics/gsc/daily', { params: filters });
      return data;
    },

    getTopPages: async (filters: GSCFilters): Promise<BigQueryResponse<GSCPageMetrics>> => {
      const { data } = await api.get('/analytics/gsc/pages', { params: filters });
      return data;
    },

    getTopQueries: async (filters: GSCFilters): Promise<BigQueryResponse<GSCQueryMetrics>> => {
      const { data } = await api.get('/analytics/gsc/queries', { params: filters });
      return data;
    },

    getByDevice: async (filters: DateRangeFilter): Promise<BigQueryResponse<GSCDeviceMetrics>> => {
      const { data } = await api.get('/analytics/gsc/devices', { params: filters });
      return data;
    },

    getByCountry: async (filters: DateRangeFilter & { limit?: number }): Promise<BigQueryResponse<GSCCountryMetrics>> => {
      const { data } = await api.get('/analytics/gsc/countries', { params: filters });
      return data;
    },
  },

  // ============================================================================
  // GA4 API Calls
  // ============================================================================

  ga4: {
    getDailyMetrics: async (filters: GA4Filters): Promise<BigQueryResponse<GA4DailyMetrics>> => {
      const { data } = await api.get('/analytics/ga4/daily', { params: filters });
      return data;
    },

    getTopPages: async (filters: GA4Filters): Promise<BigQueryResponse<GA4PageViews>> => {
      const { data } = await api.get('/analytics/ga4/pages', { params: filters });
      return data;
    },

    getTrafficSources: async (filters: GA4Filters): Promise<BigQueryResponse<GA4TrafficSource>> => {
      const { data } = await api.get('/analytics/ga4/traffic-sources', { params: filters });
      return data;
    },
  },

  // ============================================================================
  // Web Vitals API Calls
  // ============================================================================

  webVitals: {
    getSummary: async (filters: WebVitalsFilters): Promise<BigQueryResponse<WebVitalsSummary>> => {
      const { data } = await api.get('/analytics/web-vitals/summary', { params: filters });
      return data;
    },

    getTimeSeries: async (
      filters: WebVitalsFilters & { metric_name: string }
    ): Promise<BigQueryResponse<WebVitalMetric>> => {
      const { data } = await api.get('/analytics/web-vitals/timeseries', { params: filters });
      return data;
    },

    getWorstPages: async (
      filters: WebVitalsFilters & { metric_name: string }
    ): Promise<BigQueryResponse<WebVitalMetric>> => {
      const { data } = await api.get('/analytics/web-vitals/worst-pages', { params: filters });
      return data;
    },
  },

  // ============================================================================
  // Dashboard Summary
  // ============================================================================

  getDashboardSummary: async (filters: DateRangeFilter): Promise<DashboardSummary> => {
    const { data } = await api.get('/analytics/dashboard', { params: filters });
    return data;
  },
};

