/**
 * Routes Analytics - Router principal
 * 
 * Base path: /api/analytics
 * 
 * Endpoints:
 * - /gsc/*          Google Search Console
 * - /ga4/*          Google Analytics 4
 * - /web-vitals/*   Core Web Vitals
 * - /dashboard      Dashboard summary (multi-sources)
 */

import { Router } from 'express';
import gscRoutes from './gsc.routes.js';
import ga4Routes from './ga4.routes.js';
import webVitalsRoutes from './webvitals.routes.js';
import { dashboardSummarySchema } from '../../schemas/analytics.schema.js';
import { getDashboardSummary } from '../../services/bigquery/index.js';

const router = Router();

// Sub-routers
router.use('/gsc', gscRoutes);
router.use('/ga4', ga4Routes);
router.use('/web-vitals', webVitalsRoutes);

/**
 * GET /api/analytics/dashboard
 * Dashboard summary complet (GSC + GA4 + Web Vitals)
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const filters = dashboardSummarySchema.parse(req.query);
    const result = await getDashboardSummary(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

