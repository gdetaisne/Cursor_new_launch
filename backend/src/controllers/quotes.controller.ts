import { Request, Response } from 'express';
import * as quotesService from '../services/quotes.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/quotes
 * Create new quote
 */
export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.createQuote(req.body);
  res.status(201).json(quote);
});

/**
 * GET /api/quotes
 * List quotes with pagination and filters
 */
export const listQuotes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { folderId, moverId, status } = req.query;

  const result = await quotesService.listQuotes({
    page,
    limit,
    folderId: folderId as string,
    moverId: moverId as string,
    status: status as string,
  });

  res.json(result);
});

/**
 * GET /api/folders/:folderId/quotes
 * Get quotes for a specific folder
 */
export const getQuotesByFolder = asyncHandler(async (req: Request, res: Response) => {
  const quotes = await quotesService.getQuotesByFolder(req.params.folderId);
  res.json(quotes);
});

/**
 * GET /api/quotes/:id
 * Get quote details
 */
export const getQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.getQuoteById(req.params.id);
  res.json(quote);
});

/**
 * PATCH /api/quotes/:id
 * Update quote
 */
export const updateQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.updateQuote(req.params.id, req.body);
  res.json(quote);
});

/**
 * POST /api/quotes/:id/validate
 * Validate quote (admin)
 */
export const validateQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.validateQuote({
    quoteId: req.params.id,
    ...req.body,
  });
  res.json(quote);
});

/**
 * POST /api/quotes/:id/score
 * Score quote (admin)
 */
export const scoreQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.scoreQuote({
    quoteId: req.params.id,
    ...req.body,
  });
  res.json(quote);
});

/**
 * POST /api/quotes/:id/remind
 * Send reminder to mover
 */
export const remindQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await quotesService.remindQuote(req.params.id);
  res.json(quote);
});

/**
 * DELETE /api/quotes/:id
 * Soft delete quote
 */
export const deleteQuote = asyncHandler(async (req: Request, res: Response) => {
  await quotesService.deleteQuote(req.params.id);
  res.status(204).send();
});

