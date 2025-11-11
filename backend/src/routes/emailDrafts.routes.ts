import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createDraftHandler,
  updateDraftHandler,
  getDraftHandler,
  listDraftsHandler,
  deleteDraftHandler,
  sendDraftHandler,
} from '../controllers/emailDrafts.controller.js';

const router = Router();

// CRUD drafts
router.post('/drafts', asyncHandler(createDraftHandler));
router.get('/drafts', asyncHandler(listDraftsHandler));
router.get('/drafts/:id', asyncHandler(getDraftHandler));
router.patch('/drafts/:id', asyncHandler(updateDraftHandler));
router.delete('/drafts/:id', asyncHandler(deleteDraftHandler));

// Send draft
router.post('/drafts/:id/send', asyncHandler(sendDraftHandler));

export default router;

