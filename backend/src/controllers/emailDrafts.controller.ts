import type { Request, Response } from 'express';
import {
  createDraft,
  updateDraft,
  getDraft,
  listDrafts,
  deleteDraft,
  sendDraft,
} from '../services/emailDraft.service.js';
import { emailDraftSchema, listDraftsSchema } from '../schemas/emailDraft.schema.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create new draft
 */
export async function createDraftHandler(req: Request, res: Response) {
  const data = emailDraftSchema.parse(req.body);
  const draft = await createDraft(data, req.userId);
  res.status(201).json(draft);
}

/**
 * Update existing draft
 */
export async function updateDraftHandler(req: Request, res: Response) {
  const { id } = req.params;
  const data = emailDraftSchema.partial().parse(req.body);
  
  try {
    const draft = await updateDraft(id, data, req.userId);
    res.json(draft);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      throw new ApiError(403, error.message);
    }
    throw error;
  }
}

/**
 * Get draft by ID
 */
export async function getDraftHandler(req: Request, res: Response) {
  const { id } = req.params;
  const draft = await getDraft(id);
  
  if (!draft) {
    throw new ApiError(404, 'Draft not found');
  }
  
  res.json(draft);
}

/**
 * List drafts
 */
export async function listDraftsHandler(req: Request, res: Response) {
  const params = listDraftsSchema.parse(req.query);
  const result = await listDrafts({
    ...params,
    authorId: req.userId, // Filter by current user
  });
  res.json(result);
}

/**
 * Delete draft
 */
export async function deleteDraftHandler(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    await deleteDraft(id, req.userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      throw new ApiError(403, error.message);
    }
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Draft not found');
    }
    throw error;
  }
}

/**
 * Send draft
 */
export async function sendDraftHandler(req: Request, res: Response) {
  const { id } = req.params;
  
  const result = await sendDraft(id, req.userId!);
  res.json(result);
}

