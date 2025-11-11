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
// import ga4Routes from './ga4.routes.js';
// import webVitalsRoutes from './webvitals.routes.js';
import { dashboardSummarySchema } from '../../schemas/analytics.schema.js';
import { getDashboardSummary } from '../../services/bigquery/index.js';

const router = Router();

// Sub-routers
router.use('/gsc', gscRoutes);
// TODO: Réactiver quand les tables GA4 et Web Vitals seront créées
// router.use('/ga4', ga4Routes);
// router.use('/web-vitals', webVitalsRoutes);

/**
 * GET /api/analytics/dashboard
 * Dashboard summary complet (GSC uniquement pour l'instant)
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const filters = dashboardSummarySchema.parse(req.query);
    // TODO: Réactiver GA4 et Web Vitals quand les tables seront créées
    // const result = await getDashboardSummary(filters);
    res.json({ 
      message: 'Dashboard endpoint - TODO: implement when all tables are ready',
      availableEndpoints: ['/api/analytics/gsc/*']
    });
  } catch (error) {
    next(error);
  }
});

export default router;

