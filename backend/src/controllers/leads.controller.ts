import { Request, Response } from 'express';
import * as leadsService from '../services/leads.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/leads
 * Create new lead
 */
export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadsService.createLead(req.body);
  res.status(201).json(lead);
});

/**
 * GET /api/leads
 * List leads with pagination and filters
 */
export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, source } = req.query;

  const result = await leadsService.listLeads({
    page,
    limit,
    status: status as string,
    source: source as string,
  });

  res.json(result);
});

/**
 * GET /api/leads/:id
 * Get lead details
 */
export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadsService.getLeadById(req.params.id);
  res.json(lead);
});

/**
 * POST /api/leads/:id/convert
 * Convert lead to folder
 */
export const convertLead = asyncHandler(async (req: Request, res: Response) => {
  const folder = await leadsService.convertLead(req.params.id);
  res.status(201).json(folder);
});

