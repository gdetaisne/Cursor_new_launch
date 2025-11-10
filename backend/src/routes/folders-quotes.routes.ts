import { Router } from 'express';
import * as quotesController from '../controllers/quotes.controller.js';

const router = Router({ mergeParams: true });

/**
 * GET /api/folders/:folderId/quotes
 * Get all quotes for a specific folder
 */
router.get(
  '/',
  quotesController.getQuotesByFolder
);

export default router;

