/**
 * Routes Analytics - Google Search Console (GSC)
 */

import { Router } from 'express';
import { gscFiltersSchema } from '../../schemas/analytics.schema.js';
import {
  getGSCDailyMetrics,
  getGSCTopPages,
  getGSCTopQueries,
  getGSCByDevice,
  getGSCByCountry,
} from '../../services/bigquery/index.js';

const router = Router();

/**
 * GET /api/analytics/gsc/daily
 * Métriques GSC agrégées par jour
 */
router.get('/daily', async (req, res, next) => {
  try {
    const filters = gscFiltersSchema.parse(req.query);
    const result = await getGSCDailyMetrics(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/gsc/pages
 * Top pages par clicks
 */
router.get('/pages', async (req, res, next) => {
  try {
    const filters = gscFiltersSchema.parse(req.query);
    const result = await getGSCTopPages(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/gsc/queries
 * Top queries par impressions
 */
router.get('/queries', async (req, res, next) => {
  try {
    const filters = gscFiltersSchema.parse(req.query);
    const result = await getGSCTopQueries(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/gsc/devices
 * Répartition par device
 */
router.get('/devices', async (req, res, next) => {
  try {
    const filters = gscFiltersSchema.parse(req.query);
    const result = await getGSCByDevice(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/gsc/countries
 * Répartition par pays
 */
router.get('/countries', async (req, res, next) => {
  try {
    const filters = gscFiltersSchema.parse(req.query);
    const result = await getGSCByCountry(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

