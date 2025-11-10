import { Router } from 'express';
import * as foldersController from '../controllers/folders.controller.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createFolderSchema, updateFolderSchema, selectQuoteSchema } from '../schemas/index.js';
import { z } from 'zod';
import foldersQuotesRoutes from './folders-quotes.routes.js';

const router = Router();

/**
 * POST /api/folders
 * Create new folder
 */
router.post(
  '/',
  validateBody(createFolderSchema),
  foldersController.createFolder
);

/**
 * GET /api/folders
 * List folders with pagination and filters
 * Query params: ?page=1&limit=10&status=CREATED&clientId=uuid&movingDateFrom=2025-01-01&movingDateTo=2025-12-31
 */
router.get(
  '/',
  foldersController.listFolders
);

/**
 * GET /api/folders/:id
 * Get folder details
 */
router.get(
  '/:id',
  foldersController.getFolder
);

/**
 * PATCH /api/folders/:id
 * Update folder
 */
router.patch(
  '/:id',
  validateBody(updateFolderSchema),
  foldersController.updateFolder
);

/**
 * POST /api/folders/:id/select-quote
 * Select quote for folder
 * Body: { quoteId: string }
 */
router.post(
  '/:id/select-quote',
  validateBody(z.object({ quoteId: z.string().uuid() })),
  foldersController.selectQuote
);

/**
 * DELETE /api/folders/:id
 * Soft delete folder
 */
router.delete(
  '/:id',
  foldersController.deleteFolder
);

/**
 * Nested routes: /api/folders/:folderId/quotes
 */
router.use('/:folderId/quotes', foldersQuotesRoutes);

export default router;

