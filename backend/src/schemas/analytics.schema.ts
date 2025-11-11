/**
 * Schémas Zod pour validation des requêtes Analytics API
 */

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Format de date YYYY-MM-DD
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in format YYYY-MM-DD',
});

/**
 * Pagination
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Date range (obligatoire)
 */
export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine((data) => data.startDate <= data.endDate, {
  message: 'startDate must be before or equal to endDate',
});

// ============================================================================
// GSC Schemas
// ============================================================================

export const gscFiltersSchema = z.object({
  ...dateRangeSchema.shape,
  ...paginationSchema.shape,
  domain: z.string().optional(), // Ex: demenagerpascher.fr
  device: z.enum(['DESKTOP', 'MOBILE', 'TABLET']).optional(),
  country: z.string().length(2).optional(), // Code ISO 2 lettres
  page: z.string().url().optional(),
  query: z.string().optional(),
});

export type GSCFiltersInput = z.infer<typeof gscFiltersSchema>;

// ============================================================================
// GA4 Schemas
// ============================================================================

export const ga4FiltersSchema = z.object({
  ...dateRangeSchema.shape,
  ...paginationSchema.shape,
  event_name: z.string().optional(),
  page_location: z.string().url().optional(),
  device_category: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  country: z.string().length(2).optional(),
});

export type GA4FiltersInput = z.infer<typeof ga4FiltersSchema>;

// ============================================================================
// Web Vitals Schemas
// ============================================================================

export const webVitalsFiltersSchema = z.object({
  ...dateRangeSchema.shape,
  ...paginationSchema.shape,
  metric_name: z.enum(['CLS', 'LCP', 'FID', 'INP', 'FCP', 'TTFB']).optional(),
  page_url: z.string().url().optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
});

export type WebVitalsFiltersInput = z.infer<typeof webVitalsFiltersSchema>;

// ============================================================================
// Dashboard Summary Schema
// ============================================================================

export const dashboardSummarySchema = dateRangeSchema;

export type DashboardSummaryInput = z.infer<typeof dashboardSummarySchema>;

