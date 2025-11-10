import { Request, Response } from 'express';
import * as foldersService from '../services/folders.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/folders
 * Create new folder
 */
export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await foldersService.createFolder(req.body);
  res.status(201).json(folder);
});

/**
 * GET /api/folders
 * List folders with pagination and filters
 */
export const listFolders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, clientId, movingDateFrom, movingDateTo } = req.query;

  const result = await foldersService.listFolders({
    page,
    limit,
    status: status as string,
    clientId: clientId as string,
    movingDateFrom: movingDateFrom as string,
    movingDateTo: movingDateTo as string,
  });

  res.json(result);
});

/**
 * GET /api/folders/:id
 * Get folder details
 */
export const getFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await foldersService.getFolderById(req.params.id);
  res.json(folder);
});

/**
 * PATCH /api/folders/:id
 * Update folder
 */
export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await foldersService.updateFolder(req.params.id, req.body);
  res.json(folder);
});

/**
 * POST /api/folders/:id/select-quote
 * Select quote for folder
 */
export const selectQuote = asyncHandler(async (req: Request, res: Response) => {
  const { quoteId } = req.body;
  const folder = await foldersService.selectQuote(req.params.id, quoteId);
  res.json(folder);
});

/**
 * DELETE /api/folders/:id
 * Soft delete folder
 */
export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  await foldersService.deleteFolder(req.params.id);
  res.status(204).send();
});

