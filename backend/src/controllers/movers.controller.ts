import { Request, Response } from 'express';
import * as moversService from '../services/movers.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/movers
 * Create new mover
 */
export const createMover = asyncHandler(async (req: Request, res: Response) => {
  const mover = await moversService.createMover(req.body);
  res.status(201).json(mover);
});

/**
 * GET /api/movers
 * List movers with pagination and filters
 */
export const listMovers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, city, postalCode } = req.query;

  const result = await moversService.listMovers({
    page,
    limit,
    status: status as string,
    city: city as string,
    postalCode: postalCode as string,
  });

  res.json(result);
});

/**
 * GET /api/movers/:id
 * Get mover details
 */
export const getMover = asyncHandler(async (req: Request, res: Response) => {
  const mover = await moversService.getMoverById(req.params.id);
  res.json(mover);
});

/**
 * PATCH /api/movers/:id
 * Update mover
 */
export const updateMover = asyncHandler(async (req: Request, res: Response) => {
  const mover = await moversService.updateMover(req.params.id, req.body);
  res.json(mover);
});

/**
 * POST /api/movers/:id/blacklist
 * Blacklist/unblacklist mover (admin)
 */
export const blacklistMover = asyncHandler(async (req: Request, res: Response) => {
  const mover = await moversService.blacklistMover({
    moverId: req.params.id,
    ...req.body,
  });
  res.json(mover);
});

/**
 * DELETE /api/movers/:id
 * Soft delete mover
 */
export const deleteMover = asyncHandler(async (req: Request, res: Response) => {
  await moversService.deleteMover(req.params.id);
  res.status(204).send();
});

