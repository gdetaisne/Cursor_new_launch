import { Router } from 'express';
import * as moversController from '../controllers/movers.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createMoverSchema,
  updateMoverSchema,
  blacklistMoverSchema,
} from '../schemas/index.js';

const router = Router();

/**
 * POST /api/movers
 * Create new mover
 */
router.post(
  '/',
  validateBody(createMoverSchema),
  moversController.createMover
);

/**
 * GET /api/movers
 * List movers with pagination and filters
 * Query params: ?page=1&limit=10&status=ACTIVE&city=Paris&postalCode=75001
 */
router.get(
  '/',
  moversController.listMovers
);

/**
 * GET /api/movers/:id
 * Get mover details
 */
router.get(
  '/:id',
  moversController.getMover
);

/**
 * PATCH /api/movers/:id
 * Update mover
 */
router.patch(
  '/:id',
  validateBody(updateMoverSchema),
  moversController.updateMover
);

/**
 * POST /api/movers/:id/blacklist
 * Blacklist/unblacklist mover (admin)
 * Body: { blacklisted: boolean, blacklistReason?: string }
 */
router.post(
  '/:id/blacklist',
  validateBody(blacklistMoverSchema),
  moversController.blacklistMover
);

/**
 * DELETE /api/movers/:id
 * Soft delete mover
 */
router.delete(
  '/:id',
  moversController.deleteMover
);

export default router;

