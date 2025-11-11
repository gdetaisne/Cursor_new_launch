/**
 * React Query hooks pour le service Analytics
 * Cache automatique + invalidation
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/analyticsApi';
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

export function useGSCDailyMetrics(filters: GSCFilters) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'daily', filters],
    queryFn: () => analyticsApi.gsc.getDailyMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGSCTopPages(filters: GSCFilters) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'pages', filters],
    queryFn: () => analyticsApi.gsc.getTopPages(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGSCTopQueries(filters: GSCFilters) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'queries', filters],
    queryFn: () => analyticsApi.gsc.getTopQueries(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGSCByDevice(filters: DateRangeFilter) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'devices', filters],
    queryFn: () => analyticsApi.gsc.getByDevice(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGSCByCountry(filters: DateRangeFilter & { limit?: number }) {
  return useQuery({
    queryKey: ['analytics', 'gsc', 'countries', filters],
    queryFn: () => analyticsApi.gsc.getByCountry(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// GA4 Hooks
// ============================================================================

export function useGA4DailyMetrics(filters: GA4Filters) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'daily', filters],
    queryFn: () => analyticsApi.ga4.getDailyMetrics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGA4TopPages(filters: GA4Filters) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'pages', filters],
    queryFn: () => analyticsApi.ga4.getTopPages(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGA4TrafficSources(filters: GA4Filters) {
  return useQuery({
    queryKey: ['analytics', 'ga4', 'traffic-sources', filters],
    queryFn: () => analyticsApi.ga4.getTrafficSources(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Web Vitals Hooks
// ============================================================================

export function useWebVitalsSummary(filters: WebVitalsFilters) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'summary', filters],
    queryFn: () => analyticsApi.webVitals.getSummary(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWebVitalsTimeSeries(filters: WebVitalsFilters & { metric_name: string }) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'timeseries', filters],
    queryFn: () => analyticsApi.webVitals.getTimeSeries(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWebVitalsWorstPages(filters: WebVitalsFilters & { metric_name: string }) {
  return useQuery({
    queryKey: ['analytics', 'web-vitals', 'worst-pages', filters],
    queryFn: () => analyticsApi.webVitals.getWorstPages(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Dashboard Summary Hook
// ============================================================================

export function useDashboardSummary(filters: DateRangeFilter) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => analyticsApi.getDashboardSummary(filters),
    staleTime: 5 * 60 * 1000,
  });
}

