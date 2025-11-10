/**
 * Routes Analytics - Core Web Vitals
 */

import { Router } from 'express';
import { webVitalsFiltersSchema } from '../../schemas/analytics.schema.js';
import {
  getWebVitalsSummary,
  getWebVitalsTimeSeries,
  getWebVitalsWorstPages,
} from '../../services/bigquery/index.js';

const router = Router();

/**
 * GET /api/analytics/web-vitals/summary
 * Summary des Core Web Vitals (p75 + distribution)
 */
router.get('/summary', async (req, res, next) => {
  try {
    const filters = webVitalsFiltersSchema.parse(req.query);
    const result = await getWebVitalsSummary(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/web-vitals/timeseries
 * Évolution temporelle d'une métrique
 * Requires: metric_name query param
 */
router.get('/timeseries', async (req, res, next) => {
  try {
    const filters = webVitalsFiltersSchema.parse(req.query);
    
    if (!filters.metric_name) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'metric_name is required for timeseries',
      });
    }

    const result = await getWebVitalsTimeSeries({
      ...filters,
      metric_name: filters.metric_name,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/web-vitals/worst-pages
 * Pires pages pour une métrique donnée
 * Requires: metric_name query param
 */
router.get('/worst-pages', async (req, res, next) => {
  try {
    const filters = webVitalsFiltersSchema.parse(req.query);
    
    if (!filters.metric_name) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'metric_name is required for worst-pages',
      });
    }

    const result = await getWebVitalsWorstPages({
      ...filters,
      metric_name: filters.metric_name,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

