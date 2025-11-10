/**
 * React Query hooks pour le service Analytics
 * Cache automatique + invalidation
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { analyticsApi } from './analyticsApi';
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
// GSC Hooks
// ============================================================================

export function useGSCDailyMetrics(
  filters: GSCFilters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GSCDailyMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'daily', filters],
    queryFn: () => analyticsApi.gsc.getDailyMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useGSCTopPages(
  filters: GSCFilters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GSCPageMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'pages', filters],
    queryFn: () => analyticsApi.gsc.getTopPages(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGSCTopQueries(
  filters: GSCFilters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GSCQueryMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'queries', filters],
    queryFn: () => analyticsApi.gsc.getTopQueries(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGSCByDevice(
  filters: DateRangeFilter,
  options?: Omit<UseQueryOptions<BigQueryResponse<GSCDeviceMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'devices', filters],
    queryFn: () => analyticsApi.gsc.getByDevice(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGSCByCountry(
  filters: DateRangeFilter & { limit?: number },
  options?: Omit<UseQueryOptions<BigQueryResponse<GSCCountryMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'countries', filters],
    queryFn: () => analyticsApi.gsc.getByCountry(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// GA4 Hooks
// ============================================================================

export function useGA4DailyMetrics(
  filters: GA4Filters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GA4DailyMetrics>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'daily', filters],
    queryFn: () => analyticsApi.ga4.getDailyMetrics(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGA4TopPages(
  filters: GA4Filters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GA4PageViews>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'pages', filters],
    queryFn: () => analyticsApi.ga4.getTopPages(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGA4TrafficSources(
  filters: GA4Filters,
  options?: Omit<UseQueryOptions<BigQueryResponse<GA4TrafficSource>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'traffic-sources', filters],
    queryFn: () => analyticsApi.ga4.getTrafficSources(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Web Vitals Hooks
// ============================================================================

export function useWebVitalsSummary(
  filters: WebVitalsFilters,
  options?: Omit<UseQueryOptions<BigQueryResponse<WebVitalsSummary>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'summary', filters],
    queryFn: () => analyticsApi.webVitals.getSummary(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useWebVitalsTimeSeries(
  filters: WebVitalsFilters & { metric_name: string },
  options?: Omit<UseQueryOptions<BigQueryResponse<WebVitalMetric>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'timeseries', filters],
    queryFn: () => analyticsApi.webVitals.getTimeSeries(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useWebVitalsWorstPages(
  filters: WebVitalsFilters & { metric_name: string },
  options?: Omit<UseQueryOptions<BigQueryResponse<WebVitalMetric>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'worst-pages', filters],
    queryFn: () => analyticsApi.webVitals.getWorstPages(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Dashboard Summary Hook
// ============================================================================

export function useDashboardSummary(
  filters: DateRangeFilter,
  options?: Omit<UseQueryOptions<DashboardSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => analyticsApi.getDashboardSummary(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

