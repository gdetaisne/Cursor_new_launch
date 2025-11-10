import { Request, Response } from 'express';
import * as clientsService from '../services/clients.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * POST /api/clients
 * Create new client
 */
export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientsService.createClient(req.body);
  res.status(201).json(client);
});

/**
 * GET /api/clients
 * List clients with pagination and filters
 */
export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query);
  const { email, phone } = req.query;

  const result = await clientsService.listClients({
    page,
    limit,
    email: email as string,
    phone: phone as string,
  });

  res.json(result);
});

/**
 * GET /api/clients/:id
 * Get client details
 */
export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientsService.getClientById(req.params.id);
  res.json(client);
});

/**
 * PATCH /api/clients/:id
 * Update client
 */
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientsService.updateClient(req.params.id, req.body);
  res.json(client);
});

/**
 * POST /api/clients/:id/anonymize
 * Anonymize client (RGPD)
 */
export const anonymizeClient = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const client = await clientsService.anonymizeClient(req.params.id, reason);
  res.json(client);
});

