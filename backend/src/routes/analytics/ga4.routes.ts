/**
 * Routes Analytics - Google Analytics 4 (GA4)
 */

import { Router } from 'express';
import { ga4FiltersSchema } from '../../schemas/analytics.schema.js';
import {
  getGA4DailyMetrics,
  getGA4TopPages,
  getGA4TrafficSources,
} from '../../services/bigquery/index.js';

const router = Router();

/**
 * GET /api/analytics/ga4/daily
 * Métriques GA4 agrégées par jour
 */
router.get('/daily', async (req, res, next) => {
  try {
    const filters = ga4FiltersSchema.parse(req.query);
    const result = await getGA4DailyMetrics(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/ga4/pages
 * Top pages vues
 */
router.get('/pages', async (req, res, next) => {
  try {
    const filters = ga4FiltersSchema.parse(req.query);
    const result = await getGA4TopPages(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/ga4/traffic-sources
 * Sources de trafic
 */
router.get('/traffic-sources', async (req, res, next) => {
  try {
    const filters = ga4FiltersSchema.parse(req.query);
    const result = await getGA4TrafficSources(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

