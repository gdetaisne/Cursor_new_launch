import { Router } from 'express';
import * as clientsController from '../controllers/clients.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createClientSchema, updateClientSchema } from '../schemas/index.js';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/clients
 * Create new client
 */
router.post(
  '/',
  validateBody(createClientSchema),
  clientsController.createClient
);

/**
 * GET /api/clients
 * List clients with pagination and filters
 * Query params: ?page=1&limit=10&email=sophie&phone=0612
 */
router.get(
  '/',
  clientsController.listClients
);

/**
 * GET /api/clients/:id
 * Get client details
 */
router.get(
  '/:id',
  clientsController.getClient
);

/**
 * PATCH /api/clients/:id
 * Update client
 */
router.patch(
  '/:id',
  validateBody(updateClientSchema),
  clientsController.updateClient
);

/**
 * POST /api/clients/:id/anonymize
 * Anonymize client (RGPD)
 * Body: { reason: string }
 */
router.post(
  '/:id/anonymize',
  validateBody(z.object({ reason: z.string().min(3) })),
  clientsController.anonymizeClient
);

export default router;

