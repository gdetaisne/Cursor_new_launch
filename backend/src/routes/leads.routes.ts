import { Router } from 'express';
import * as leadsController from '../controllers/leads.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createLeadSchema } from '../schemas/index.js';

const router = Router();

/**
 * POST /api/leads
 * Create new lead
 */
router.post(
  '/',
  validateBody(createLeadSchema),
  leadsController.createLead
);

/**
 * GET /api/leads
 * List leads with pagination and filters
 * Query params: ?page=1&limit=10&status=NEW&source=bordeaux-demenageur.fr
 */
router.get(
  '/',
  leadsController.listLeads
);

/**
 * GET /api/leads/:id
 * Get lead details
 */
router.get(
  '/:id',
  leadsController.getLead
);

/**
 * POST /api/leads/:id/convert
 * Convert lead to folder (creates client if needed)
 */
router.post(
  '/:id/convert',
  leadsController.convertLead
);

export default router;

