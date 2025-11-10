import { Router } from 'express';
import * as quotesController from '../controllers/quotes.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createQuoteSchema,
  updateQuoteSchema,
  validateQuoteSchema,
  scoreQuoteSchema,
} from '../schemas/index.js';

const router = Router();

/**
 * POST /api/quotes
 * Create new quote
 */
router.post(
  '/',
  validateBody(createQuoteSchema),
  quotesController.createQuote
);

/**
 * GET /api/quotes
 * List quotes with pagination and filters
 * Query params: ?page=1&limit=10&folderId=uuid&moverId=uuid&status=VALIDATED
 */
router.get(
  '/',
  quotesController.listQuotes
);

/**
 * GET /api/quotes/:id
 * Get quote details
 */
router.get(
  '/:id',
  quotesController.getQuote
);

/**
 * PATCH /api/quotes/:id
 * Update quote
 */
router.patch(
  '/:id',
  validateBody(updateQuoteSchema),
  quotesController.updateQuote
);

/**
 * POST /api/quotes/:id/validate
 * Validate quote (admin)
 * Body: { validatedByUserId: string, approved: boolean, rejectionReason?: string }
 */
router.post(
  '/:id/validate',
  validateBody(validateQuoteSchema),
  quotesController.validateQuote
);

/**
 * POST /api/quotes/:id/score
 * Score quote (admin)
 * Body: { scorePrice: number, scoreGoogle: number, scoreFinancial: number, scoreLitigations?: number }
 */
router.post(
  '/:id/score',
  validateBody(scoreQuoteSchema),
  quotesController.scoreQuote
);

/**
 * POST /api/quotes/:id/remind
 * Send reminder to mover
 */
router.post(
  '/:id/remind',
  quotesController.remindQuote
);

/**
 * DELETE /api/quotes/:id
 * Soft delete quote
 */
router.delete(
  '/:id',
  quotesController.deleteQuote
);

export default router;

